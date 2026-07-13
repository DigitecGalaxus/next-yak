use crate::utils::ast_helper::unwrap_type_casts;
use crate::yak_imports::YakImports;
use swc_core::{
  atoms::Wtf8Atom,
  common::errors::HANDLER,
  common::{Span, SyntaxContext, DUMMY_SP},
  ecma::ast::{
    ArrowExpr, BinExpr, BinaryOp, BlockStmtOrExpr, CallExpr, Callee, CondExpr, Expr, ExprOrSpread,
    Ident, IdentName, JSXAttr, JSXAttrName, JSXAttrOrSpread, JSXAttrValue, JSXExpr,
    JSXExprContainer, JSXOpeningElement, KeyValueProp, Lit, ObjectLit, Prop, PropName,
    PropOrSpread, SpreadElement, Str,
  },
};

#[derive(Debug)]
pub struct CSSProp {
  index: usize,
  relevant_props_indices: Vec<usize>,
}

impl CSSProp {
  /// Transforms the css prop to a spread attribute, changes the call to invoke it without parameters
  /// and inserts it into the correct position.
  /// If the css prop has relevant props, they are removed and transformed into a merge call.
  ///
  /// e.g.
  /// ```jsx
  /// <div css={css("divClassName")} />
  /// ```
  /// becomes
  /// ```jsx
  /// <div {...css("divClassName")({})} />
  /// ```
  /// and
  /// ```jsx
  /// <div css={css("divClassName")} style={{color: red}} className="myClassName" />
  /// ```
  /// becomes
  /// ```jsx
  /// <div {...__yak_mergeCssProp(
  ///   css("divClassName")({}),
  ///   {
  ///     style: {color: red},
  ///     className: "myClassName"
  ///   })} />
  /// ```
  /// A no-op empty css prop (e.g. `css``) is dropped entirely instead.
  pub fn transform(
    &self,
    opening_element: &mut JSXOpeningElement,
    yak_imports: &mut YakImports,
    strict_css_prop: bool,
  ) {
    // An empty css prop (e.g. `css``) compiles to a bare `css()` and contributes
    // nothing, so drop the attribute entirely and keep the other props untouched
    if Self::is_noop_css_prop(&opening_element.attrs[self.index], yak_imports) {
      opening_element.attrs.remove(self.index);
      return;
    }
    if self.try_fold(opening_element, yak_imports) {
      return;
    }
    let merge_ident = yak_imports.get_yak_utility_ident("mergeCssProp");
    // Build the replacement from borrowed attributes first, without mutating the
    // element. That way an invalid `css` prop can be left completely untouched
    // when strict mode is off (it might belong to another library, not next-yak).
    let merge_call: Result<Box<Expr>, TransformError> = (|| {
      let css_expr =
        Self::extract_css_expr(&opening_element.attrs[self.index], opening_element.span)?;
      let mapped_props = self
        .relevant_props_indices
        .iter()
        .map(|&index| match &opening_element.attrs[index] {
          JSXAttrOrSpread::JSXAttr(attr) => Self::map_jsx_attr(attr),
          JSXAttrOrSpread::SpreadElement(spread) => Ok(PropOrSpread::Spread(spread.clone())),
          #[cfg(swc_ast_unknown)]
          _ => Err(TransformError::UnsupportedJSXAttrOrSpread()),
        })
        .collect::<Result<Vec<_>, _>>()?;
      Ok(Self::create_merge_call(
        &mapped_props,
        css_expr,
        &merge_ident,
      ))
    })();

    let merge_call = match merge_call {
      Ok(merge_call) => merge_call,
      Err(err) => {
        // Strict mode (default): a `css` prop next-yak can't handle is almost
        // always a mistake in a next-yak project, so fail loudly. Otherwise leave
        // the element untouched so unrelated `css` props keep working.
        if strict_css_prop {
          HANDLER.with(|handler| {
            handler.struct_span_err(err.span(), err.message()).emit();
          });
        }
        return;
      }
    };

    // Validation succeeded — remove the consumed attributes and insert the spread.
    opening_element.attrs.remove(self.index);
    for &index in self.relevant_props_indices.iter().rev() {
      let adjusted_index = if index > self.index { index - 1 } else { index };
      opening_element.attrs.remove(adjusted_index);
    }
    let insert_index = opening_element.attrs.len();
    opening_element.attrs.insert(
      insert_index,
      JSXAttrOrSpread::SpreadElement(SpreadElement {
        dot3_token: DUMMY_SP,
        expr: merge_call,
      }),
    );
  }

  /// Replaces a statically known css prop with a plain className attribute
  /// to avoid the runtime `mergeCssProp` call
  /// Bails out (returns false) if the element has a className or spread attribute
  /// or if the css expression contains dynamic values or mixin references
  ///
  /// e.g.
  /// ```jsx
  /// <div css={css("a")} />                        // -> <div className="a" />
  /// <div css={css(() => on && css("b"), "a")} />  // -> <div className={"a" + (on ? " b" : "")} />
  /// <div css={on ? css("a") : css("b")} />        // -> <div className={on ? "a" : "b"} />
  /// ```
  fn try_fold(&self, opening_element: &mut JSXOpeningElement, yak_imports: &YakImports) -> bool {
    // a spread may carry a className that is only known at runtime
    for &index in &self.relevant_props_indices {
      match &opening_element.attrs[index] {
        JSXAttrOrSpread::JSXAttr(attr) => match &attr.name {
          JSXAttrName::Ident(ident) if ident.sym == *"style" => {}
          _ => return false,
        },
        _ => return false,
      }
    }
    let JSXAttrOrSpread::JSXAttr(JSXAttr {
      value:
        Some(JSXAttrValue::JSXExprContainer(JSXExprContainer {
          expr: JSXExpr::Expr(css_expr),
          ..
        })),
      ..
    }) = &opening_element.attrs[self.index]
    else {
      // invalid css attribute - the runtime path reports the error
      return false;
    };
    let Some(class_name_expr) = Self::fold_css_expr(css_expr, yak_imports) else {
      return false;
    };
    opening_element.attrs[self.index] = JSXAttrOrSpread::JSXAttr(JSXAttr {
      span: DUMMY_SP,
      name: JSXAttrName::Ident(IdentName::new("className".into(), DUMMY_SP)),
      value: Some(JSXAttrValue::JSXExprContainer(JSXExprContainer {
        span: DUMMY_SP,
        expr: JSXExpr::Expr(class_name_expr),
      })),
    });
    true
  }

  /// Folds a compiled css expression into a className expression
  /// Returns `None` if the expression is not statically foldable
  fn fold_css_expr(expr: &Expr, yak_imports: &YakImports) -> Option<Box<Expr>> {
    match unwrap_type_casts(expr) {
      Expr::Call(call) => Self::fold_css_call(call, yak_imports),
      Expr::Cond(cond) => {
        let cons = Self::fold_css_expr(&cond.cons, yak_imports)?;
        let alt = Self::fold_css_expr(&cond.alt, yak_imports)?;
        Some(Box::new(Expr::Cond(CondExpr {
          span: cond.span,
          test: cond.test.clone(),
          cons,
          alt,
        })))
      }
      _ => None,
    }
  }

  /// Folds one compiled `css(...)` call: one optional static class string plus
  /// zero or more `() => cond && css("x")` or `() => cond ? css("x") : css("y")`
  /// condition arrows
  fn fold_css_call(call: &CallExpr, yak_imports: &YakImports) -> Option<Box<Expr>> {
    if !Self::is_yak_css_callee(&call.callee, yak_imports) {
      return None;
    }
    let mut base: Option<Wtf8Atom> = None;
    let mut segments: Vec<(Box<Expr>, Wtf8Atom, Option<Wtf8Atom>)> = Vec::new();
    for arg in &call.args {
      if arg.spread.is_some() {
        return None;
      }
      match unwrap_type_casts(&arg.expr) {
        Expr::Lit(Lit::Str(class_name)) => {
          if base.is_some() {
            return None;
          }
          base = Some(class_name.value.clone());
        }
        Expr::Arrow(arrow) => segments.push(Self::fold_condition_arrow(arrow, yak_imports)?),
        // dynamic values and mixin references are not foldable
        _ => return None,
      }
    }
    // an empty `css()` folds to an empty base `""`, so it can collapse into a
    // ternary arm instead of falling back to the runtime path
    let base = base.unwrap_or_else(|| "".into());
    // "base" + (cond1 ? " a" : "") + (cond2 ? " b" : " c") …
    let mut class_name_expr = Self::str_expr(base);
    for (condition, cons_class, alt_class) in segments {
      let alt = match alt_class {
        Some(class_name) => Self::str_expr(Self::with_leading_space(&class_name)),
        None => Self::str_expr("".into()),
      };
      class_name_expr = Box::new(Expr::Bin(BinExpr {
        span: DUMMY_SP,
        op: BinaryOp::Add,
        left: class_name_expr,
        right: Box::new(Expr::Cond(CondExpr {
          span: DUMMY_SP,
          test: condition,
          cons: Self::str_expr(Self::with_leading_space(&cons_class)),
          alt,
        })),
      }));
    }
    // keep the span of the original css call so the /*YAK Extracted CSS:*/
    // comment (parsed by extractCss.ts) stays attached
    match &mut *class_name_expr {
      Expr::Lit(Lit::Str(class_name)) => class_name.span = call.span,
      Expr::Bin(bin) => bin.span = call.span,
      _ => {}
    }
    Some(class_name_expr)
  }

  /// Matches the compiled condition shapes `() => cond && css("x")` and
  /// `() => cond ? css("x") : css("y")` and returns the condition expression
  /// plus the static class name(s)
  fn fold_condition_arrow(
    arrow: &ArrowExpr,
    yak_imports: &YakImports,
  ) -> Option<(Box<Expr>, Wtf8Atom, Option<Wtf8Atom>)> {
    if !arrow.params.is_empty() || arrow.is_async || arrow.is_generator {
      return None;
    }
    let BlockStmtOrExpr::Expr(body) = &*arrow.body else {
      return None;
    };
    match unwrap_type_casts(body) {
      Expr::Bin(bin) if bin.op == BinaryOp::LogicalAnd => {
        let class_name = Self::pure_static_css_class(&bin.right, yak_imports)?;
        Some((bin.left.clone(), class_name, None))
      }
      Expr::Cond(cond) => {
        let cons_class = Self::pure_static_css_class(&cond.cons, yak_imports)?;
        let alt_class = Self::pure_static_css_class(&cond.alt, yak_imports)?;
        Some((cond.test.clone(), cons_class, Some(alt_class)))
      }
      _ => None,
    }
  }

  /// Matches a `css("x")` call carrying exactly one static class string
  fn pure_static_css_class(expr: &Expr, yak_imports: &YakImports) -> Option<Wtf8Atom> {
    let Expr::Call(call) = unwrap_type_casts(expr) else {
      return None;
    };
    if !Self::is_yak_css_callee(&call.callee, yak_imports) || call.args.len() != 1 {
      return None;
    }
    let arg = &call.args[0];
    if arg.spread.is_some() {
      return None;
    }
    match unwrap_type_casts(&arg.expr) {
      Expr::Lit(Lit::Str(class_name)) => Some(class_name.value.clone()),
      _ => None,
    }
  }

  /// Matches a css prop that compiles to a bare `css()` with no arguments,
  /// produced by an empty css template such as `css``
  fn is_noop_css_prop(attr: &JSXAttrOrSpread, yak_imports: &YakImports) -> bool {
    let JSXAttrOrSpread::JSXAttr(JSXAttr {
      value:
        Some(JSXAttrValue::JSXExprContainer(JSXExprContainer {
          expr: JSXExpr::Expr(expr),
          ..
        })),
      ..
    }) = attr
    else {
      return false;
    };
    matches!(
      unwrap_type_casts(expr),
      Expr::Call(call)
        if Self::is_yak_css_callee(&call.callee, yak_imports) && call.args.is_empty()
    )
  }

  fn is_yak_css_callee(callee: &Callee, yak_imports: &YakImports) -> bool {
    match callee {
      Callee::Expr(expr) => match unwrap_type_casts(expr) {
        Expr::Ident(ident) => yak_imports.yak_css_idents().contains(&ident.to_id()),
        _ => false,
      },
      _ => false,
    }
  }

  fn with_leading_space(class_name: &Wtf8Atom) -> Wtf8Atom {
    let mut with_space = String::from(" ");
    with_space.push_str(class_name.as_str().unwrap_or_default());
    with_space.into()
  }

  fn str_expr(value: Wtf8Atom) -> Box<Expr> {
    Box::new(Expr::Lit(Lit::Str(Str {
      span: DUMMY_SP,
      value,
      raw: None,
    })))
  }

  /// Extracts the CSS expression from a JSX attribute or spread element.
  fn extract_css_expr(attr: &JSXAttrOrSpread, span: Span) -> Result<Box<Expr>, TransformError> {
    match attr {
      JSXAttrOrSpread::JSXAttr(jsx_attr) => jsx_attr
        .value
        .as_ref()
        .ok_or(TransformError::InvalidCSSAttribute(span))
        .and_then(|value| match value {
          JSXAttrValue::JSXExprContainer(container) => match &container.expr {
            JSXExpr::Expr(expr) => Ok(expr.clone()),
            _ => Err(TransformError::InvalidCSSAttribute(container.span)),
          },
          _ => Err(TransformError::InvalidCSSAttribute(span)),
        }),
      JSXAttrOrSpread::SpreadElement(_) => Err(TransformError::UnsupportedSpreadElement(span)),
      #[cfg(swc_ast_unknown)]
      _ => Err(TransformError::UnsupportedSpreadElement(span)),
    }
  }

  /// Maps a single JSX attribute to a PropOrSpread element.
  /// This is used to convert a JSX attribute to an object property for the merge call.
  /// e.g. `style={{color: red}}` becomes `{style: {color: red}}`
  fn map_jsx_attr(attr: &JSXAttr) -> Result<PropOrSpread, TransformError> {
    match &attr.name {
      JSXAttrName::Ident(ident) => Ok(PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
        key: PropName::Ident(ident.clone()),
        value: Self::extract_value(&attr.value, attr.span)?,
      })))),
      _ => Err(TransformError::InvalidJSXAttribute(attr.span)),
    }
  }

  /// Extracts the value from a JSX attribute.
  /// This handles different types of attribute values and converts them to expressions.
  /// e.g. `style={{color: red}}` becomes `{color: red}`
  fn extract_value(value: &Option<JSXAttrValue>, span: Span) -> Result<Box<Expr>, TransformError> {
    value
      .as_ref()
      .ok_or(TransformError::MissingAttributeValue(span))
      .and_then(|v| match v {
        JSXAttrValue::Str(str_lit) => Ok(Box::new(Expr::Lit(Lit::Str(str_lit.clone())))),
        JSXAttrValue::JSXExprContainer(container) => match &container.expr {
          JSXExpr::Expr(expr) => Ok(expr.clone()),
          _ => Err(TransformError::InvalidJSXEmptyExpr(container.span)),
        },
        _ => Err(TransformError::UnsupportedAttributeValue(span)),
      })
  }

  /// Creates a merge call expression that combines the CSS props with other relevant props.
  /// This is used when there are additional props (like className or style) that need to be merged.
  /// e.g. `style={{color: "red"}} className="foo"` becomes `merge_ident({style: {color: "red"}}, {className: "foo"})`
  fn create_merge_call(
    mapped_props: &[PropOrSpread],
    expr: Box<Expr>,
    merge_ident: &Ident,
  ) -> Box<Expr> {
    Box::new(Expr::Call(CallExpr {
      span: DUMMY_SP,
      callee: Callee::Expr(Box::new(Expr::Ident(merge_ident.clone()))),
      args: vec![
        ExprOrSpread {
          spread: None,
          expr: Box::new(Expr::Object(ObjectLit {
            span: DUMMY_SP,
            props: mapped_props.to_vec(),
          })),
        },
        ExprOrSpread { spread: None, expr },
      ],
      ctxt: SyntaxContext::empty(),
      type_args: None,
    }))
  }
}

pub trait HasCSSProp {
  fn has_css_prop(&self) -> Option<CSSProp>;
}

impl HasCSSProp for JSXOpeningElement {
  /// Returns the index of the `css` attribute and the indices of other relevant attributes
  /// (like `className` and `style`).
  fn has_css_prop(&self) -> Option<CSSProp> {
    let mut css_index = None;
    let mut relevant_props = Vec::new();

    for (index, attr) in self.attrs.iter().enumerate() {
      match attr {
        JSXAttrOrSpread::JSXAttr(attr) => {
          if let JSXAttrName::Ident(ident) = &attr.name {
            match ident.sym.as_ref() {
              "css" => css_index = Some(index),
              "className" | "style" => relevant_props.push(index),
              _ => {}
            }
          }
        }
        _ => relevant_props.push(index),
      }
    }

    css_index.map(|index| CSSProp {
      index,
      relevant_props_indices: relevant_props,
    })
  }
}

#[derive(Debug)]
pub enum TransformError {
  InvalidCSSAttribute(Span),
  UnsupportedSpreadElement(Span),
  InvalidJSXAttribute(Span),
  MissingAttributeValue(Span),
  InvalidJSXEmptyExpr(Span),
  UnsupportedAttributeValue(Span),
  #[cfg(swc_ast_unknown)]
  UnsupportedJSXAttrOrSpread(),
}

impl TransformError {
  fn span(&self) -> Span {
    match self {
      TransformError::InvalidCSSAttribute(span)
      | TransformError::UnsupportedSpreadElement(span)
      | TransformError::InvalidJSXAttribute(span)
      | TransformError::MissingAttributeValue(span)
      | TransformError::InvalidJSXEmptyExpr(span)
      | TransformError::UnsupportedAttributeValue(span) => *span,
      #[cfg(swc_ast_unknown)]
      TransformError::UnsupportedJSXAttrOrSpread() => Span::default(),
    }
  }

  fn message(&self) -> &'static str {
    match self {
            TransformError::InvalidCSSAttribute(_) =>
                "Invalid CSS attribute. The 'css' prop should contain a valid CSS-in-JS expression. \
                Example: css={css`color: red;`}",

            TransformError::UnsupportedSpreadElement(_) =>
                "Spread elements are not supported in the 'css' prop. \
                    Instead, use a css template literals for your styles. \
                    Example: css={css`color: red;`}",

            TransformError::InvalidJSXAttribute(_) =>
                "Invalid JSX attribute detected. Ensure all attributes have valid names and values. \
                Example: className=\"my-class\" or style={{ color: 'red' }}",

            TransformError::MissingAttributeValue(_) =>
                "An attribute is missing its value. All attributes should have a value assigned. \
                Example: css={styles} or className=\"my-class\"",

            TransformError::InvalidJSXEmptyExpr(_) =>
                "Invalid empty JSX expression found. Ensure your JSX expressions are valid JavaScript expressions.",

            TransformError::UnsupportedAttributeValue(_) =>
                "Unsupported attribute value type. Use string literals for className, \
                template literals for css prop, and object literals for style prop.",

            #[cfg(swc_ast_unknown)]
            TransformError::UnsupportedJSXAttrOrSpread() =>
                "Unsupported JSX attribute or spread element detected. Ensure all attributes have valid names and values. \
                Example: className=\"my-class\" or style={{ color: 'red' }}",
        }
  }
}

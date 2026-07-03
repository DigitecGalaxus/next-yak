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
  pub fn transform(&self, opening_element: &mut JSXOpeningElement, yak_imports: &mut YakImports) {
    if self.try_fold(opening_element, yak_imports) {
      return;
    }
    let merge_ident = yak_imports.get_yak_utility_ident("mergeCssProp");
    let result: Result<_, TransformError> = (|| {
      let value = opening_element.attrs.remove(self.index);

      let removed_attrs: Vec<_> = self
        .relevant_props_indices
        .iter()
        .rev()
        .map(|&index| {
          let adjusted_index = if index > self.index { index - 1 } else { index };
          opening_element.attrs.remove(adjusted_index)
        })
        .collect();
      let css_expr = Self::extract_css_expr(&value, opening_element.span)?;
      let merge_call =
        Self::create_merge_call(&Self::map_props(&removed_attrs)?, css_expr, &merge_ident);
      let insert_index = opening_element.attrs.len();

      let spread_attr = JSXAttrOrSpread::SpreadElement(SpreadElement {
        dot3_token: DUMMY_SP,
        expr: merge_call,
      });
      opening_element.attrs.insert(insert_index, spread_attr);
      Ok(())
    })();

    if let Err(err) = result {
      HANDLER.with(|handler| {
        handler.span_err(err.span(), err.message());
      });
    }
  }

  /// Replaces a statically known css prop with a plain className attribute
  /// to avoid the runtime `mergeCssProp` call.
  /// Bails out (returns false) if the element has a className or spread attribute
  /// or if the css expression contains dynamic values or mixin references.
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
    let Ok(css_expr) =
      Self::extract_css_expr(&opening_element.attrs[self.index], opening_element.span)
    else {
      // invalid css attribute: let the regular transform path report the error
      return false;
    };
    let Some(folded) = Self::fold_css_expr(&css_expr, yak_imports) else {
      return false;
    };
    match folded {
      None => {
        opening_element.attrs.remove(self.index);
      }
      Some(class_name_expr) => {
        opening_element.attrs[self.index] = JSXAttrOrSpread::JSXAttr(JSXAttr {
          span: DUMMY_SP,
          name: JSXAttrName::Ident(IdentName::new("className".into(), DUMMY_SP)),
          value: Some(JSXAttrValue::JSXExprContainer(JSXExprContainer {
            span: DUMMY_SP,
            expr: JSXExpr::Expr(class_name_expr),
          })),
        });
      }
    }
    true
  }

  /// Folds a compiled css expression into a className expression.
  /// Outer `None` = not statically foldable (keep the runtime path),
  /// inner `None` = folds to nothing (empty css``).
  fn fold_css_expr(expr: &Expr, yak_imports: &YakImports) -> Option<Option<Box<Expr>>> {
    match expr.unwrap_parens() {
      Expr::Call(call) => Self::fold_css_call(call, yak_imports),
      Expr::Cond(cond) => {
        let cons = Self::fold_css_expr(&cond.cons, yak_imports)??;
        let alt = Self::fold_css_expr(&cond.alt, yak_imports)??;
        Some(Some(Box::new(Expr::Cond(CondExpr {
          span: cond.span,
          test: cond.test.clone(),
          cons,
          alt,
        }))))
      }
      _ => None,
    }
  }

  /// Folds one compiled `css(...)` call: one optional static class string plus
  /// zero or more `() => cond && css("x")` condition arrows.
  fn fold_css_call(call: &CallExpr, yak_imports: &YakImports) -> Option<Option<Box<Expr>>> {
    if !Self::is_yak_css_callee(&call.callee, yak_imports) {
      return None;
    }
    let mut base: Option<Wtf8Atom> = None;
    let mut segments: Vec<(Box<Expr>, Wtf8Atom)> = Vec::new();
    for arg in &call.args {
      if arg.spread.is_some() {
        return None;
      }
      match arg.expr.unwrap_parens() {
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
    let Some(base) = base else {
      // conditions without a base class would change the leading space of the
      // class string, so only an empty css`` folds (to nothing)
      return if segments.is_empty() {
        Some(None)
      } else {
        None
      };
    };
    // "base" + (cond1 ? " a" : "") + (cond2 ? " b" : "") …
    let mut class_name_expr = Self::str_expr(base);
    for (condition, class_name) in segments {
      let mut with_space = String::from(" ");
      with_space.push_str(&class_name.as_str().unwrap_or_default());
      class_name_expr = Box::new(Expr::Bin(BinExpr {
        span: DUMMY_SP,
        op: BinaryOp::Add,
        left: class_name_expr,
        right: Box::new(Expr::Cond(CondExpr {
          span: DUMMY_SP,
          test: condition,
          cons: Self::str_expr(with_space.into()),
          alt: Self::str_expr("".into()),
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
    Some(Some(class_name_expr))
  }

  /// Matches the compiled condition shape `() => cond && css("x")` and returns
  /// the condition expression plus the static class name.
  fn fold_condition_arrow(
    arrow: &ArrowExpr,
    yak_imports: &YakImports,
  ) -> Option<(Box<Expr>, Wtf8Atom)> {
    if !arrow.params.is_empty() || arrow.is_async || arrow.is_generator {
      return None;
    }
    let BlockStmtOrExpr::Expr(body) = &*arrow.body else {
      return None;
    };
    match body.unwrap_parens() {
      Expr::Bin(bin) if bin.op == BinaryOp::LogicalAnd => {
        let class_name = Self::pure_static_css_class(&bin.right, yak_imports)?;
        Some((bin.left.clone(), class_name))
      }
      _ => None,
    }
  }

  /// Matches a `css("x")` call carrying exactly one static class string.
  fn pure_static_css_class(expr: &Expr, yak_imports: &YakImports) -> Option<Wtf8Atom> {
    let Expr::Call(call) = expr.unwrap_parens() else {
      return None;
    };
    if !Self::is_yak_css_callee(&call.callee, yak_imports) || call.args.len() != 1 {
      return None;
    }
    let arg = &call.args[0];
    if arg.spread.is_some() {
      return None;
    }
    match arg.expr.unwrap_parens() {
      Expr::Lit(Lit::Str(class_name)) => Some(class_name.value.clone()),
      _ => None,
    }
  }

  fn is_yak_css_callee(callee: &Callee, yak_imports: &YakImports) -> bool {
    match callee {
      Callee::Expr(expr) => match expr.unwrap_parens() {
        Expr::Ident(ident) => yak_imports.yak_css_idents().contains(&ident.to_id()),
        _ => false,
      },
      _ => false,
    }
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

  /// Maps JSX attributes or spread elements to PropOrSpread elements.
  /// This is used to convert JSX attributes to object properties for the merge call.
  /// Because the order of the properties are already reversed, the attributes are iterated in reverse order.
  /// This is done to maintain the order of the attributes when they are merged.
  fn map_props(props: &[JSXAttrOrSpread]) -> Result<Vec<PropOrSpread>, TransformError> {
    props
      .iter()
      .rev()
      .map(|prop| match prop {
        JSXAttrOrSpread::JSXAttr(attr) => Self::map_jsx_attr(attr),
        JSXAttrOrSpread::SpreadElement(spread) => Ok(PropOrSpread::Spread(spread.clone())),
        #[cfg(swc_ast_unknown)]
        _ => Err(TransformError::UnsupportedJSXAttrOrSpread()),
      })
      .collect()
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

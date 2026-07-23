//! Folds a static `css` prop into a plain `className`, skipping the runtime
//! `mergeCssProp` spread

use crate::utils::ast_helper::unwrap_type_casts;
use crate::utils::fold::css_expr::{
  class_name_attr, expr_attr_value, fold_css_expr, is_yak_css_callee,
};
use crate::yak_imports::YakImports;
use swc_core::{
  common::errors::HANDLER,
  common::{Span, Spanned, SyntaxContext, DUMMY_SP},
  ecma::ast::{
    BinaryOp, CallExpr, Callee, Expr, ExprOrSpread, Ident, JSXAttr, JSXAttrName, JSXAttrOrSpread,
    JSXAttrValue, JSXExpr, JSXExprContainer, JSXOpeningElement, KeyValueProp, Lit, ObjectLit, Prop,
    PropName, PropOrSpread, SpreadElement, Str,
  },
};

/// An attribute that has to be merged with the css prop
#[derive(Debug, Clone, Copy, PartialEq)]
enum RelevantProp {
  ClassName,
  Style,
  /// A spread may carry a className or style only known at runtime
  Spread,
}

#[derive(Debug)]
pub struct CSSProp {
  index: usize,
  relevant_props: Vec<(usize, RelevantProp)>,
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
  /// An empty css prop (e.g. `css``) is always dropped. Otherwise, when
  /// `fold_static` is on, a statically known css prop skips the merge call and
  /// folds into a plain `className` instead (see `try_fold`).
  pub fn transform(
    &self,
    opening_element: &mut JSXOpeningElement,
    yak_imports: &mut YakImports,
    strict_css_prop: bool,
    fold_static: bool,
  ) {
    if Self::is_noop_css_prop(&opening_element.attrs[self.index], yak_imports) {
      opening_element.attrs.remove(self.index);
      return;
    }
    if fold_static && self.try_fold(opening_element, yak_imports) {
      return;
    }
    let merge_ident = yak_imports.get_yak_utility_ident("mergeCssProp");
    // Build the replacement from borrowed attributes first, without mutating the
    // element. That way an invalid `css` prop can be left completely untouched
    // when strict mode is off (it might belong to another library, not next-yak).
    let merge_call: Result<Box<Expr>, TransformError> = (|| {
      let css_expr =
        Self::extract_css_expr(&opening_element.attrs[self.index], opening_element.span)?;
      if let Some(span) = Self::find_style_reference(&css_expr) {
        return Err(TransformError::StyleReference(span));
      }
      let mapped_props = self
        .relevant_props
        .iter()
        .map(|&(index, _)| match &opening_element.attrs[index] {
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
    for &(index, _) in self.relevant_props.iter().rev() {
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
  /// <div css={css("a")} />                        // -> <div className={"a"} />
  /// <div css={css(() => on && css("b"), "a")} />  // -> <div className={"a" + (on ? " b" : "")} />
  /// <div css={on ? css("a") : css("b")} />        // -> <div className={on ? "a" : "b"} />
  /// ```
  fn try_fold(&self, opening_element: &mut JSXOpeningElement, yak_imports: &YakImports) -> bool {
    // a spread or className may carry class names only known at runtime
    if self
      .relevant_props
      .iter()
      .any(|&(_, kind)| kind != RelevantProp::Style)
    {
      return false;
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
    let Some(class_name_expr) = fold_css_expr(css_expr, yak_imports) else {
      return false;
    };
    opening_element.attrs[self.index] = class_name_attr(expr_attr_value(class_name_expr));
    true
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
        if is_yak_css_callee(&call.callee, yak_imports) && call.args.is_empty()
    )
  }

  /// Finds a reference to styles declared elsewhere (`css={mixin}`,
  /// `css={styles.padding}`) in a css value position - at the top level or in
  /// the value arms of ternaries and logical expressions
  ///
  /// Such a reference renders unstyled because the css prop only compiles
  /// styles in place, so it is rejected via `TransformError::StyleReference`
  fn find_style_reference(expr: &Expr) -> Option<Span> {
    match unwrap_type_casts(expr) {
      Expr::Cond(cond) => {
        Self::find_style_reference(&cond.cons).or_else(|| Self::find_style_reference(&cond.alt))
      }
      // `cond && css` - only the right hand side is a css value
      Expr::Bin(bin) if bin.op == BinaryOp::LogicalAnd => Self::find_style_reference(&bin.right),
      // `a || b` and `a ?? b` - both sides are css values
      Expr::Bin(bin) if matches!(bin.op, BinaryOp::LogicalOr | BinaryOp::NullishCoalescing) => {
        Self::find_style_reference(&bin.left).or_else(|| Self::find_style_reference(&bin.right))
      }
      // `undefined` is a valid falsy css value, any other identifier is a reference
      Expr::Ident(ident) if ident.sym != "undefined" => Some(ident.span),
      Expr::Member(member) => Some(member.span()),
      Expr::OptChain(opt_chain) => Some(opt_chain.span),
      _ => None,
    }
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
        // Drop `raw`: a JSX attribute raw is JSX-encoded text (HTML entities stay
        // encoded, backslashes are literal). Moved into JS expression position it
        // would be printed verbatim, so emit from the decoded `value` instead.
        JSXAttrValue::Str(str_lit) => Ok(Box::new(Expr::Lit(Lit::Str(Str {
          span: str_lit.span,
          value: str_lit.value.clone(),
          raw: None,
        })))),
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
              "className" => relevant_props.push((index, RelevantProp::ClassName)),
              "style" => relevant_props.push((index, RelevantProp::Style)),
              _ => {}
            }
          }
        }
        _ => relevant_props.push((index, RelevantProp::Spread)),
      }
    }

    css_index.map(|index| CSSProp {
      index,
      relevant_props,
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
  StyleReference(Span),
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
      | TransformError::UnsupportedAttributeValue(span)
      | TransformError::StyleReference(span) => *span,
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

            TransformError::StyleReference(_) =>
                "References to styles declared elsewhere are not supported in the 'css' prop - \
                the referenced styles are not compiled at this usage and would silently never apply. \
                Wrap the reference in a css template instead. \
                Example: css={css`${mixin}`}",

            #[cfg(swc_ast_unknown)]
            TransformError::UnsupportedJSXAttrOrSpread() =>
                "Unsupported JSX attribute or spread element detected. Ensure all attributes have valid names and values. \
                Example: className=\"my-class\" or style={{ color: 'red' }}",
        }
  }
}

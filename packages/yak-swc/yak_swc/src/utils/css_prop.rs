use swc_core::{
  common::errors::HANDLER,
  common::{Span, SyntaxContext, DUMMY_SP},
  ecma::ast::{
    CallExpr, Callee, Expr, ExprOrSpread, JSXAttr, JSXAttrName, JSXAttrOrSpread, JSXAttrValue,
    JSXExpr, JSXOpeningElement, KeyValueProp, ObjectLit, Prop, PropName, PropOrSpread,
    SpreadElement,
  },
};

#[derive(Debug)]
pub struct CSSProp {
  index: usize,
  relevant_props_indices: Vec<usize>,
}

impl CSSProp {
  /// Transforms the css prop to a spread attribute, changes the call to invoke it with all relevant props
  /// as a single object parameter and inserts it into the correct position.
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
  /// <div {...css("divClassName")({
  ///     style: {color: red},
  ///     className: "myClassName"
  ///   })} />
  /// ```
  pub fn transform(&self, opening_element: &mut JSXOpeningElement) {
    let result: Result<_, TransformError> = (|| {
      let value = opening_element.attrs.remove(self.index);

      let css_expr_base = match &value {
        JSXAttrOrSpread::JSXAttr(jsx_attr) => jsx_attr
          .value
          .as_ref()
          .ok_or(TransformError::InvalidCSSAttribute(opening_element.span))
          .and_then(|value| match value {
            JSXAttrValue::JSXExprContainer(container) => match &container.expr {
              JSXExpr::Expr(expr) => Ok(expr.clone()),
              _ => Err(TransformError::InvalidCSSAttribute(container.span)),
            },
            _ => Err(TransformError::InvalidCSSAttribute(opening_element.span)),
          })?,
        JSXAttrOrSpread::SpreadElement(_) => {
          return Err(TransformError::UnsupportedSpreadElement(
            opening_element.span,
          ))
        }
      };

      // Props object to pass to the CSS function
      let props_object = if self.relevant_props_indices.is_empty() {
        // Empty object if no relevant props
        ObjectLit {
          span: DUMMY_SP,
          props: vec![],
        }
      } else {
        // Create object with all relevant props
        let removed_attrs: Vec<_> = self
          .relevant_props_indices
          .iter()
          .rev()
          .map(|&index| {
            let adjusted_index = if index > self.index { index - 1 } else { index };
            opening_element.attrs.remove(adjusted_index)
          })
          .collect();

        let mapped_props = Self::map_props(&removed_attrs)?;

        ObjectLit {
          span: DUMMY_SP,
          props: mapped_props,
        }
      };

      // Create the call expression: css("divClassName")({ props })
      let css_expr = Box::new(Expr::Call(CallExpr {
        span: DUMMY_SP,
        callee: Callee::Expr(css_expr_base),
        args: vec![ExprOrSpread {
          spread: None,
          expr: Box::new(Expr::Object(props_object)),
        }],
        ctxt: SyntaxContext::empty(),
        type_args: None,
      }));

      let insert_index = if self.relevant_props_indices.is_empty() {
        self.index
      } else {
        // Insert at the end if props were removed
        opening_element.attrs.len()
      };

      let spread_attr = JSXAttrOrSpread::SpreadElement(SpreadElement {
        dot3_token: DUMMY_SP,
        expr: css_expr,
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

  /// Maps JSX attributes or spread elements to PropOrSpread elements.
  /// This is used to convert JSX attributes to object properties for the props object.
  /// Because the order of the properties are already reversed, the attributes are iterated in reverse order.
  /// This is done to maintain the order of the attributes when they are merged.
  fn map_props(props: &[JSXAttrOrSpread]) -> Result<Vec<PropOrSpread>, TransformError> {
    props
      .iter()
      .rev()
      .map(|prop| match prop {
        JSXAttrOrSpread::JSXAttr(attr) => Self::map_jsx_attr(attr),
        JSXAttrOrSpread::SpreadElement(spread) => Ok(PropOrSpread::Spread(spread.clone())),
      })
      .collect()
  }

  /// Maps a single JSX attribute to a PropOrSpread element.
  /// This is used to convert a JSX attribute to an object property for the props object.
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
        JSXAttrValue::Lit(lit) => Ok(Box::new(Expr::Lit(lit.clone()))),
        JSXAttrValue::JSXExprContainer(container) => match &container.expr {
          JSXExpr::Expr(expr) => Ok(expr.clone()),
          JSXExpr::JSXEmptyExpr(_) => Err(TransformError::InvalidJSXEmptyExpr(container.span)),
        },
        _ => Err(TransformError::UnsupportedAttributeValue(span)),
      })
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
        JSXAttrOrSpread::SpreadElement(_) => relevant_props.push(index),
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
        }
  }
}

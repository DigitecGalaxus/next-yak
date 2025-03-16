use swc_core::{
  common::{Span, SyntaxContext, DUMMY_SP},
  atoms::atom,
  ecma::ast::{
    CallExpr, Callee, Expr, ExprOrSpread, Id, Ident, JSXAttr, JSXAttrName, JSXAttrOrSpread,
    JSXAttrValue, JSXExpr, JSXOpeningElement, KeyValueProp, ObjectLit, Prop, PropName,
    PropOrSpread, SpreadElement, TaggedTpl,
  },
  plugin::errors::HANDLER,
};

use crate::utils::ast_helper::is_valid_tagged_tpl;
use crate::yak_imports::YakImports;

#[derive(Debug)]
pub struct CSSProp {
  index: usize,
  relevant_props_indices: Vec<usize>,
}

impl CSSProp {
  /// Transforms the css prop based on its content (atoms or css template literal)
  /// and merges with other relevant props
  pub fn transform_with_detection(
    &self,
    opening_element: &mut JSXOpeningElement,
    merge_ident: &Ident,
    yak_imports: &YakImports
  ) {
    // Get the css prop attribute to examine its content
    if let Some(css_attr_index) = opening_element.attrs.iter().position(|attr| {
      if let JSXAttrOrSpread::JSXAttr(attr) = attr {
        if let JSXAttrName::Ident(ident) = &attr.name {
          return ident.sym.as_ref() == "css";
        }
      }
      false
    }) {
      // Check if the css prop contains an atoms function call or a css template literal
      if let JSXAttrOrSpread::JSXAttr(jsx_attr) = &opening_element.attrs[css_attr_index] {
        if let Some(JSXAttrValue::JSXExprContainer(container)) = &jsx_attr.value {
          if let JSXExpr::Expr(expr) = &container.expr {
            // For atoms function calls, use a different transform approach
            if let Expr::Call(call_expr) = &**expr {
              if let Callee::Expr(callee) = &call_expr.callee {
                if let Expr::Ident(ident) = &**callee {
                  // Check if the function is the atoms function (considering possible renames)
                  if yak_imports.get_yak_library_name_for_ident(&ident.to_id()) == Some(atom!("atoms")) {
                    // Transform using a specialized transform for atoms
                    self.transform_with_atoms(opening_element, merge_ident);
                    return;
                  }
                }
              }
            }
            // For css template literals, check if it's a valid CSS-in-JS expression
            else if let Expr::TaggedTpl(tpl) = &**expr {
              if is_valid_tagged_tpl(tpl, yak_imports.yak_css_idents()) {
                // Use the standard CSS transform
                self.transform(opening_element, merge_ident);
                return;
              }
            }
          }
        }
      }
    }

    // Default transform if we couldn't identify a specific type
    self.transform(opening_element, merge_ident);
  }

  /// Transforms the css prop to a spread attribute, changes the call to invoke it without parameters
  /// and inserts it into the correct position.
  /// If the css prop has relevant props, they are removed and transformed into a merge call.
  ///
  /// For css template literals:
  /// ```jsx
  /// <div css={css("divClassName")} />
  /// ```
  /// becomes
  /// ```jsx
  /// <div {...css("divClassName")({})} />
  /// ```
  pub fn transform(&self, opening_element: &mut JSXOpeningElement, merge_ident: &Ident) {
    let result: Result<_, TransformError> = (|| {
      let value = opening_element.attrs.remove(self.index);

      let (merge_call, insert_index) = if self.relevant_props_indices.is_empty() {
        (
          Self::transform_css_expr(&value, opening_element.span)?,
          self.index,
        )
      } else {
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
        let css_expr = Self::transform_css_expr(&value, opening_element.span)?;
        (
          Self::create_merge_call(&mapped_props, css_expr, merge_ident),
          opening_element.attrs.len(),
        )
      };

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

  /// Specialized transform for atoms function in css prop
  ///
  /// For atoms function:
  /// ```jsx
  /// <div css={atoms("m-8 p-6","flex","self-center")} />
  /// ```
  /// becomes
  /// ```jsx
  /// <div {...atoms("m-8 p-6","flex","self-center")()} />
  /// ```
  ///
  /// And with relevant props:
  /// ```jsx
  /// <div css={atoms("m-8 p-6")} style={{color: red}} className="myClassName" />
  /// ```
  /// becomes
  /// ```jsx
  /// <div {...__yak_mergeCssProp(
  ///   {
  ///     style: {color: red},
  ///     className: "myClassName"
  ///   },
  ///   atoms("m-8 p-6")()
  /// )} />
  /// ```
  pub fn transform_with_atoms(&self, opening_element: &mut JSXOpeningElement, merge_ident: &Ident) {
    let result: Result<_, TransformError> = (|| {
      let value = opening_element.attrs.remove(self.index);

      let (merge_call, insert_index) = if self.relevant_props_indices.is_empty() {
        (
          Self::transform_atoms_expr(&value, opening_element.span)?,
          self.index,
        )
      } else {
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
        let atoms_expr = Self::transform_atoms_expr(&value, opening_element.span)?;
        (
          Self::create_merge_call(&mapped_props, atoms_expr, merge_ident),
          opening_element.attrs.len(),
        )
      };

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

  /// Transforms an atoms function call to its invoked result
  /// The atoms function returns a function that when called returns {className: value}
  /// e.g. atoms("m-8 p-6") becomes atoms("m-8 p-6")()
  fn transform_atoms_expr(attr: &JSXAttrOrSpread, span: Span) -> Result<Box<Expr>, TransformError> {
    match attr {
      JSXAttrOrSpread::JSXAttr(jsx_attr) => jsx_attr
        .value
        .as_ref()
        .ok_or(TransformError::InvalidCSSAttribute(span))
        .and_then(|value| match value {
          JSXAttrValue::JSXExprContainer(container) => match &container.expr {
            JSXExpr::Expr(expr) => {
              // For atoms function calls, transform to atoms(...)()
              // This calls the function returned by atoms which gives us {className: value}
              Ok(Box::new(Expr::Call(CallExpr {
                span: DUMMY_SP,
                callee: Callee::Expr(expr.clone()),
                args: vec![],
                ctxt: SyntaxContext::empty(),
                type_args: None,
              })))
            },
            _ => Err(TransformError::InvalidCSSAttribute(container.span)),
          },
          _ => Err(TransformError::InvalidCSSAttribute(span)),
        }),
      JSXAttrOrSpread::SpreadElement(_) => Err(TransformError::UnsupportedSpreadElement(span)),
    }
  }

  /// Extracts the CSS expression from a JSX attribute or spread element and transforms it appropriately.
  /// For css tagged template literals: `css\`color: red\`` becomes `css\`color: red\`({})`
  /// For atoms function calls: `atoms("m-8 p-6")` becomes `{className: atoms("m-8 p-6")}`
  fn transform_css_expr(attr: &JSXAttrOrSpread, span: Span) -> Result<Box<Expr>, TransformError> {
    match attr {
      JSXAttrOrSpread::JSXAttr(jsx_attr) => jsx_attr
        .value
        .as_ref()
        .ok_or(TransformError::InvalidCSSAttribute(span))
        .and_then(|value| match value {
          JSXAttrValue::JSXExprContainer(container) => match &container.expr {
            JSXExpr::Expr(expr) => {
              // Check if it's an atoms function call
              if let Expr::Call(call_expr) = &**expr {
                if let Callee::Expr(callee) = &call_expr.callee {
                  if let Expr::Ident(ident) = &**callee {
                    // If it looks like an atoms function call based on the name, handle it differently
                    if ident.sym.as_ref() == "atoms" {
                      return Ok(Box::new(Expr::Call(CallExpr {
                        span: DUMMY_SP,
                        callee: Callee::Expr(expr.clone()),
                        args: vec![],
                        ctxt: SyntaxContext::empty(),
                        type_args: None,
                      })));
                    }
                  }
                }
              }

              // For css tagged templates or other expressions, wrap in a call with empty object
              Ok(Box::new(Expr::Call(CallExpr {
                span: DUMMY_SP,
                callee: Callee::Expr(expr.clone()),
                args: vec![ExprOrSpread {
                  spread: None,
                  expr: Box::new(Expr::Object(ObjectLit {
                    span: DUMMY_SP,
                    props: vec![],
                  })),
                }],
                ctxt: SyntaxContext::empty(),
                type_args: None,
              })))
            },
            _ => Err(TransformError::InvalidCSSAttribute(container.span)),
          },
          _ => Err(TransformError::InvalidCSSAttribute(span)),
        }),
      JSXAttrOrSpread::SpreadElement(_) => Err(TransformError::UnsupportedSpreadElement(span)),
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
        JSXAttrValue::Lit(lit) => Ok(Box::new(Expr::Lit(lit.clone()))),
        JSXAttrValue::JSXExprContainer(container) => match &container.expr {
          JSXExpr::Expr(expr) => Ok(expr.clone()),
          JSXExpr::JSXEmptyExpr(_) => Err(TransformError::InvalidJSXEmptyExpr(container.span)),
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
                "Invalid CSS attribute. The 'css' prop should contain a valid CSS-in-JS expression or atoms function call. \
                Example: css={css`color: red;`} or css={atoms(\"m-8 p-6\",\"flex\")}",

            TransformError::UnsupportedSpreadElement(_) =>
                "Spread elements are not supported in the 'css' prop. \
                    Instead, use a css template literals or atoms function for your styles. \
                    Example: css={css`color: red;`} or css={atoms(\"m-8 p-6\")}",

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
                template literals for css prop, object literals for style prop, or atoms function for utility classes.",
        }
  }
}

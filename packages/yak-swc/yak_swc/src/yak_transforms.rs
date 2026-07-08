use rustc_hash::FxHashMap;
use swc_core::common::util::move_map::MoveMap;

use crate::utils::ast_helper::expr_hash_map_to_object;
use crate::utils::cross_file_selectors::encode_percent;
use crate::variable_visitor::ScopedVariableReference;
use crate::yak_imports::YakImports;
use css_in_js_parser::{CssScope, Declaration, ParserState, ScopeType};
use swc_core::common::errors::HANDLER;
use swc_core::common::{source_map::PURE_SP, Span, Spanned, SyntaxContext, DUMMY_SP};
use swc_core::ecma::ast::*;

use crate::naming_convention::{NamingConvention, TranspilationMode};

/// Represents a CSS result after the transformation
#[derive(Debug)]
pub struct YakCss {
  pub comment_prefix: Option<String>,
  /// The generated CSS code
  pub declarations: Vec<Declaration>,
}

#[derive(Debug)]
pub struct YakTransformResult {
  pub expression: Box<Expr>,
  pub css: YakCss,
}

pub trait YakTransform {
  /// Create a CSS Scope\
  /// This CSS Scope will surround the entire CSS for this literal\
  /// e.g. const myMixin = css`...` -> .myMixin { ... }
  fn create_css_state(&self, previous_parser_state: Option<ParserState>) -> ParserState;
  /// Transform the expression\
  /// This is where the TypeScript AST for the expression is finally transformed
  fn transform_expression(
    &mut self,
    expression: &mut TaggedTpl,
    runtime_expressions: Vec<Expr>,
    declarations: &[Declaration],
    runtime_css_variables: FxHashMap<String, Expr>,
    yak_imports: &mut YakImports,
  ) -> YakTransformResult;
  /// Get animation or styled component selector name
  fn get_css_reference_name(&self) -> Option<String> {
    None
  }
  /// Get a comment prefix for the current variable as default export
  fn get_default_export_comment_prefix(&self) -> Option<String> {
    None
  }
}

/// Transform for nested css mixins
/// e.g. const Button = `${({$active}) => $active && css`...`}`
pub struct TransformNestedCss {
  /// ClassName of the mixin
  class_name: String,
  transpilation_mode: TranspilationMode,
}

impl TransformNestedCss {
  /// `condition` is the condition which is used to determine if the mixin should be applied
  pub fn new(
    naming_convention: &mut NamingConvention,
    declaration_name: &ScopedVariableReference,
    condition: Vec<String>,
    transpilation_mode: TranspilationMode,
  ) -> TransformNestedCss {
    let condition_concatenated = condition.as_slice().join("-and-");
    let class_name = naming_convention.get_css_variable_name(&format!(
      "{}__{}",
      declaration_name.to_readable_string(),
      condition_concatenated
    ));
    TransformNestedCss {
      class_name,
      transpilation_mode,
    }
  }
}

impl YakTransform for TransformNestedCss {
  fn create_css_state(&self, previous_parser_state: Option<ParserState>) -> ParserState {
    // It is safe to unwrap here because the previous_parser_state is always set for a nested css
    let mut parser_state = previous_parser_state.clone().unwrap();
    // The first scope is the class name which gets attached to the element
    parser_state.current_scopes[0] = CssScope {
      name: self.transpilation_mode.css_class_name(&self.class_name),
      scope_type: ScopeType::Selector,
    };
    parser_state
  }

  fn transform_expression(
    &mut self,
    expression: &mut TaggedTpl,
    runtime_expressions: Vec<Expr>,
    declarations: &[Declaration],
    runtime_css_variables: FxHashMap<String, Expr>,
    _yak_imports: &mut YakImports,
  ) -> YakTransformResult {
    let mut arguments: Vec<ExprOrSpread> = vec![];
    if !declarations.is_empty() {
      arguments.push(
        // As yak generates the final class name, this name can use it directly in the js code
        Expr::Lit(Lit::Str(Str {
          span: DUMMY_SP,
          value: self.class_name.clone().into(),
          raw: None,
        }))
        .into(),
      );
    }
    arguments.extend(runtime_expressions.into_iter().map(ExprOrSpread::from));
    if !runtime_css_variables.is_empty() {
      arguments.push(
        expr_hash_map_to_object(FxHashMap::from_iter([(
          "style".to_string(),
          expr_hash_map_to_object(runtime_css_variables),
        )]))
        .into(),
      );
    }
    YakTransformResult {
      css: YakCss {
        comment_prefix: None,
        declarations: declarations.to_vec(),
      },
      expression: (Box::new(Expr::Call(CallExpr {
        // Use a special span as this expression might be cloned as part
        // of a parent expression and therefore needs a unique span to
        // avoid collisions for the comments
        span: Span::dummy_with_cmt(),
        callee: Callee::Expr(expression.tag.clone()),
        ctxt: SyntaxContext::empty(),
        args: arguments,
        type_args: None,
      }))),
    }
  }
}

/// Transform for CSS Mixins
/// e.g. const myMixin = css`...`
pub struct TransformCssMixin {
  /// ClassName of the mixin
  export_name: ScopedVariableReference,
  is_exported: bool,
  is_within_jsx_attribute: bool,
  class_name: String,
  transpilation_mode: TranspilationMode,
}

impl TransformCssMixin {
  pub fn new(
    naming_convention: &mut NamingConvention,
    declaration_name: ScopedVariableReference,
    is_exported: bool,
    is_within_jsx_attribute: bool,
    transpilation_mode: TranspilationMode,
  ) -> TransformCssMixin {
    let class_name =
      naming_convention.get_css_variable_name(&declaration_name.to_readable_string());
    TransformCssMixin {
      export_name: declaration_name,
      is_exported,
      is_within_jsx_attribute,
      class_name,
      transpilation_mode,
    }
  }
}

impl YakTransform for TransformCssMixin {
  fn create_css_state(&self, _previous_parser_state: Option<ParserState>) -> ParserState {
    let mut parser_state = ParserState::new();
    parser_state.current_scopes = vec![CssScope {
      name: self.transpilation_mode.css_class_name(&self.class_name),
      scope_type: ScopeType::AtRule,
    }];
    parser_state
  }

  fn transform_expression(
    &mut self,
    expression: &mut TaggedTpl,
    runtime_expressions: Vec<Expr>,
    declarations: &[Declaration],
    runtime_css_variables: FxHashMap<String, Expr>,
    _yak_imports: &mut YakImports,
  ) -> YakTransformResult {
    let has_dynamic_content = !runtime_expressions.is_empty() || !runtime_css_variables.is_empty();

    if self.is_exported && has_dynamic_content && !self.is_within_jsx_attribute {
      // For now dynamic mixins are not supported cross file
      // as the scope handling is quite complicated
      HANDLER.with(|handler| {
        handler
          .struct_span_err(
            expression.span,
            "Dynamic mixins must not be exported. Please ensure that this mixin requires no props.",
          )
          .emit();
      });
    }

    let mut arguments: Vec<ExprOrSpread> = vec![];
    arguments.extend(runtime_expressions.into_iter().map(ExprOrSpread::from));
    if !runtime_css_variables.is_empty() {
      arguments.push(
        expr_hash_map_to_object(FxHashMap::from_iter([(
          "style".to_string(),
          expr_hash_map_to_object(runtime_css_variables),
        )]))
        .into(),
      );
    }
    let comment_prefix = if self.is_within_jsx_attribute {
      // Add the class name to the arguments, to be created by the CSS loader
      arguments.push(
        Expr::Lit(Lit::Str(Str {
          span: DUMMY_SP,
          value: self.class_name.as_str().into(),
          raw: None,
        }))
        .into(),
      );
      Some("YAK Extracted CSS:".into())
    } else if self.is_exported {
      Some(format!(
        "YAK EXPORTED MIXIN:{}",
        self
          .export_name
          .parts
          .iter()
          .map(|atom| encode_percent(atom.to_string_lossy().as_ref())) // If the name contains surrogates, other CSS parser would have problems as well
          .collect::<Vec<_>>()
          .join(":")
      ))
    } else {
      None
    };

    YakTransformResult {
      css: YakCss {
        comment_prefix,
        declarations: declarations.to_vec().move_map(|mut declaration| {
          // TODO: Fix nested mixins
          if !self.is_within_jsx_attribute {
            declaration.scope.remove(0);
          }
          declaration
        }),
      },
      expression: (Box::new(Expr::Call(CallExpr {
        span: expression.span,
        ctxt: SyntaxContext::empty(),
        callee: Callee::Expr(expression.tag.clone()),
        args: arguments,
        type_args: None,
      }))),
    }
  }

  fn get_css_reference_name(&self) -> Option<String> {
    if self.is_within_jsx_attribute {
      Some(self.class_name.clone())
    } else {
      None
    }
  }

  /// Replaces the current variable name with "default" for the comment marker
  fn get_default_export_comment_prefix(&self) -> Option<String> {
    Some(format!(
      "YAK EXPORTED MIXIN:default{}",
      self
        .export_name
        .parts
        .iter()
        .skip(1)
        .map(|atom| encode_percent(atom.to_string_lossy().as_ref()))
        .collect::<Vec<String>>()
        .join(":"),
    ))
  }
}

/// Transform styled component api
/// e.g. const Wrapper = styled.div`...`
pub struct TransformStyled {
  /// root class name of the styled component
  class_name: String,
  declaration_name: ScopedVariableReference,
  assign_display_name: bool,
  is_exported: bool,
  transpilation_mode: TranspilationMode,
}

impl TransformStyled {
  pub fn new(
    naming_convention: &mut NamingConvention,
    declaration_name: ScopedVariableReference,
    assign_display_name: bool,
    is_exported: bool,
    transpilation_mode: TranspilationMode,
  ) -> TransformStyled {
    let class_name =
      naming_convention.get_css_variable_name(&declaration_name.to_readable_string());
    TransformStyled {
      class_name,
      declaration_name,
      assign_display_name,
      is_exported,
      transpilation_mode,
    }
  }

  /// Wraps the supplied expression in
  /// `Object.assign(expr, { displayName: "declaration_name" })`. This improves the
  /// display of components in React DevTools.
  fn assign_display_name(&mut self, mut expr: Box<Expr>) -> Box<Expr> {
    // `Object.assign`
    let object_assign = Callee::Expr(Box::new(Expr::Member(MemberExpr {
      span: DUMMY_SP,
      obj: Box::new(Expr::Ident(Ident {
        span: DUMMY_SP,
        ctxt: SyntaxContext::empty(),
        sym: "Object".into(),
        optional: false,
      })),
      prop: MemberProp::Ident(IdentName {
        span: DUMMY_SP,
        sym: "assign".into(),
      }),
    })));

    // `{ displayName: "declaration_name" }`
    let display_name_props = Box::new(Expr::Object(ObjectLit {
      span: DUMMY_SP,
      props: vec![PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
        key: PropName::Str(Str {
          span: DUMMY_SP,
          value: "displayName".into(),
          raw: None,
        }),
        value: Box::new(Expr::Lit(Lit::Str(Str {
          span: DUMMY_SP,
          value: self.declaration_name.last_part(),
          raw: None,
        }))),
      })))],
    }));

    // The inner styled component expression needs to be prefixed with `/*#__PURE__*/`.
    // We instead annotate the outermost AST node with the original span so that the extracted CSS
    // can be attached to it instead.
    let original_span = expr.span();
    expr.set_span(PURE_SP);

    // `Object.assign(/*#__PURE__*/(expr), { displayName: "declaration_name" })`
    Box::new(Expr::Call(CallExpr {
      span: original_span,
      ctxt: SyntaxContext::empty(),
      callee: object_assign,
      args: vec![
        ExprOrSpread::from(expr),
        ExprOrSpread::from(display_name_props),
      ],
      type_args: None,
    }))
  }
}

fn transform_styled_usages(expression: Box<Expr>, yak_imports: &mut YakImports) -> Box<Expr> {
  match *expression.clone() {
    Expr::Member(member) => {
      if let Expr::Ident(ident) = *member.obj {
        // styled.element``usages
        if let MemberProp::Ident(member_ident) = member.prop {
          let member_name = member_ident.sym.as_str();
          return if let Some(member) = yak_imports.get_yak_component_import(member_name) {
            // styled.button -> __yak_button
            member
          } else {
            // Transform elements without yakcomponent import to styled("element-name")
            Box::new(Expr::Call(CallExpr {
              span: member.span,
              ctxt: SyntaxContext::empty(),
              callee: Callee::Expr(Box::new(Expr::Ident(ident.clone()))),
              args: vec![ExprOrSpread::from(Box::new(Expr::Lit(Lit::Str(Str {
                span: DUMMY_SP,
                value: member_name.into(),
                raw: None,
              }))))],
              type_args: None,
            }))
          };
        }
      }
      expression
    }
    Expr::Call(CallExpr {
      callee: Callee::Expr(callee),
      args,
      type_args,
      ctxt,
      span,
    }) => {
      // e.g. styled(Component)
      if let Expr::Ident(_) = *callee.clone() {
        return expression;
      }

      // e.g. styled.button.functionName(args) -> __yak_button.functionName(args)
      if let Expr::Member(ref member) = *callee.clone() {
        // e.g. functionName
        let function_name = member.prop.clone();
        // transform the member expression on which the function is called, e.g. styled.button
        let transformed_identifier = transform_styled_usages(member.obj.clone(), yak_imports);

        // call the original function on the transformed expression
        return Box::new(Expr::Call(CallExpr {
          span,
          ctxt,
          callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
            prop: function_name,
            span: DUMMY_SP,
            obj: transformed_identifier,
          }))),
          args,
          type_args,
        }));
      }
      // Anything else is left untransformed
      expression
    }
    _ => expression,
  }
}

impl YakTransform for TransformStyled {
  fn create_css_state(&self, _previous_parser_state: Option<ParserState>) -> ParserState {
    let mut parser_state = ParserState::new();
    parser_state.current_scopes = vec![CssScope {
      name: self.transpilation_mode.css_class_name(&self.class_name),
      scope_type: ScopeType::AtRule,
    }];
    parser_state
  }

  fn transform_expression(
    &mut self,
    expression: &mut TaggedTpl,
    runtime_expressions: Vec<Expr>,
    declarations: &[Declaration],
    runtime_css_variables: FxHashMap<String, Expr>,
    yak_imports: &mut YakImports,
  ) -> YakTransformResult {
    let mut arguments: Vec<ExprOrSpread> = vec![];
    // Always pass the class name so the component can be used as a selector
    arguments.push(
      Expr::Lit(Lit::Str(Str {
        span: DUMMY_SP,
        value: self.class_name.clone().into(),
        raw: None,
      }))
      .into(),
    );
    arguments.extend(runtime_expressions.into_iter().map(ExprOrSpread::from));
    if !runtime_css_variables.is_empty() {
      arguments.push(
        expr_hash_map_to_object(FxHashMap::from_iter([(
          "style".to_string(),
          expr_hash_map_to_object(runtime_css_variables),
        )]))
        .into(),
      );
    }
    let tag_expression = transform_styled_usages(expression.tag.clone(), yak_imports);
    let result_expr = Box::new(Expr::Call(CallExpr {
      span: expression.span,
      ctxt: SyntaxContext::empty(),
      callee: Callee::Expr(tag_expression),
      args: arguments,
      type_args: None,
    }));

    let result_expr = if self.assign_display_name {
      self.assign_display_name(result_expr)
    } else {
      result_expr
    };

    // Add the class name For cross file selectors to allow the css loader to
    // extract the generated class name
    let comment_prefix = if self.is_exported {
      format!(
        "YAK EXPORTED STYLED:{}:{}*//*YAK Extracted CSS:",
        self.declaration_name.to_readable_string(),
        self.class_name.clone()
      )
    } else {
      format!("YAK Extracted CSS:")
    };

    YakTransformResult {
      css: YakCss {
        comment_prefix: Some(comment_prefix),
        declarations: declarations.to_vec(),
      },
      expression: result_expr,
    }
  }

  /// Get the selector for the specific styled component to be used in other expressions
  fn get_css_reference_name(&self) -> Option<String> {
    Some(self.transpilation_mode.css_class_name(&self.class_name))
  }

  /// Replaces the current variable name with "default" for the comment marker
  fn get_default_export_comment_prefix(&self) -> Option<String> {
    Some(format!(
      "YAK EXPORTED STYLED:default:{}*//*YAK Extracted CSS:",
      self.class_name.clone()
    ))
  }
}

/// Transform for global styles
/// e.g. globalCss`body { margin: 0; }`
///
/// The only transform without a name or scope: declarations are emitted
/// unscoped and unlayered. Selectors are kept verbatim except for the
/// `:global(...)` escape hatch used to opt class selectors out of scoping:
/// in `CssModule` mode it is left intact for css-loader to unwrap, in native
/// `Css` mode (Vite, Turbopack, Rsbuild) there is no css-loader, so it is
/// unwrapped here — otherwise `:global(...)` would leak into the browser
/// stylesheet as an invalid selector and the rule would be silently dropped.
/// Writing `:global(.foo)` therefore works identically on every bundler.
pub struct TransformGlobalCss {
  transpilation_mode: TranspilationMode,
}

impl TransformGlobalCss {
  pub fn new(transpilation_mode: TranspilationMode) -> Self {
    Self { transpilation_mode }
  }
}

impl YakTransform for TransformGlobalCss {
  fn create_css_state(&self, _previous_parser_state: Option<ParserState>) -> ParserState {
    ParserState::new()
  }

  fn transform_expression(
    &mut self,
    expression: &mut TaggedTpl,
    _runtime_expressions: Vec<Expr>,
    declarations: &[Declaration],
    _runtime_css_variables: FxHashMap<String, Expr>,
    _yak_imports: &mut YakImports,
  ) -> YakTransformResult {
    // In native CSS mode there is no css-loader to interpret the `:global(...)`
    // wrapper, so unwrap it to the bare selector. CssModule mode keeps it.
    let declarations = match self.transpilation_mode {
      TranspilationMode::CssModule => declarations.to_vec(),
      TranspilationMode::Css => declarations
        .iter()
        .map(|declaration| {
          let mut declaration = declaration.clone();
          for scope in &mut declaration.scope {
            if scope.scope_type == ScopeType::Selector {
              scope.name = unwrap_global_selectors(&scope.name);
            }
          }
          declaration
        })
        .collect(),
    };

    YakTransformResult {
      css: YakCss {
        comment_prefix: Some("YAK Extracted CSS:".into()),
        declarations,
      },
      // Keep a bare `globalCss()` no-op call so the extracted-CSS comment has
      // an expression to anchor to.
      expression: Box::new(Expr::Call(CallExpr {
        span: expression.span,
        ctxt: SyntaxContext::empty(),
        callee: Callee::Expr(expression.tag.clone()),
        args: vec![],
        type_args: None,
      })),
    }
  }
}

/// Remove the CSS-Modules `:global(...)` / `:global ` escape hatch from a
/// selector, keeping the inner selector. Used for native CSS output where no
/// css-loader is present to interpret it.
///
/// Handles the functional form with balanced parentheses (`:global(.a:has(.b))`
/// -> `.a:has(.b)`) and the combinator form (`:global .foo` -> `.foo`).
fn unwrap_global_selectors(selector: &str) -> String {
  const GLOBAL: &[char] = &[':', 'g', 'l', 'o', 'b', 'a', 'l'];
  let chars: Vec<char> = selector.chars().collect();
  let mut result = String::new();
  let mut i = 0;
  while i < chars.len() {
    if chars[i..].starts_with(GLOBAL) {
      let after = i + GLOBAL.len();
      // Functional form `:global(...)` — copy the balanced-paren contents
      if chars.get(after) == Some(&'(') {
        let mut depth = 1;
        let mut j = after + 1;
        while j < chars.len() && depth > 0 {
          match chars[j] {
            '(' => depth += 1,
            ')' => {
              depth -= 1;
              if depth == 0 {
                break;
              }
            }
            _ => {}
          }
          j += 1;
        }
        let inner: String = chars[after + 1..j.min(chars.len())].iter().collect();
        result.push_str(&unwrap_global_selectors(&inner));
        // Skip past the closing paren (or to the end if it was unbalanced)
        i = (j + 1).min(chars.len());
        continue;
      }
      // Combinator form `:global .foo` (or a trailing `:global`) — drop the
      // token and a single following whitespace, keep the descendant selector
      if after >= chars.len() || chars[after].is_whitespace() {
        i = after;
        if i < chars.len() && chars[i].is_whitespace() {
          i += 1;
        }
        continue;
      }
    }
    result.push(chars[i]);
    i += 1;
  }
  result
}

/// Transform for keyframe animations
/// e.g. const fadeIn = keyframes`...`
pub struct TransformKeyframes {
  /// Animation Name
  animation_name: String,
  transpilation_mode: TranspilationMode,
}

impl TransformKeyframes {
  pub fn with_animation_name(
    animation_name: String,
    transpilation_mode: TranspilationMode,
  ) -> TransformKeyframes {
    TransformKeyframes {
      animation_name,
      transpilation_mode,
    }
  }
}

impl YakTransform for TransformKeyframes {
  fn create_css_state(&self, _previous_parser_state: Option<ParserState>) -> ParserState {
    let mut parser_state = ParserState::new();
    parser_state.current_scopes = vec![CssScope {
      name: match &self.transpilation_mode {
        TranspilationMode::CssModule => format!("@keyframes :global({})", self.animation_name),
        TranspilationMode::Css => format!("@keyframes {}", self.animation_name),
      },
      scope_type: ScopeType::AtRule,
    }];
    parser_state
  }

  fn transform_expression(
    &mut self,
    expression: &mut TaggedTpl,
    _runtime_expressions: Vec<Expr>,
    declarations: &[Declaration],
    runtime_css_variables: FxHashMap<String, Expr>,
    _yak_imports: &mut YakImports,
  ) -> YakTransformResult {
    let mut arguments: Vec<ExprOrSpread> = vec![];
    if !declarations.is_empty() {
      arguments.push(
        Expr::Lit(Lit::Str(Str {
          span: DUMMY_SP,
          value: self.animation_name.clone().into(),
          raw: None,
        }))
        .into(),
      );
    }
    if !runtime_css_variables.is_empty() {
      arguments.push(
        expr_hash_map_to_object(FxHashMap::from_iter([(
          "style".to_string(),
          expr_hash_map_to_object(runtime_css_variables),
        )]))
        .into(),
      );
    }
    YakTransformResult {
      css: YakCss {
        comment_prefix: Some("YAK Extracted CSS:".into()),
        declarations: declarations.to_vec(),
      },
      expression: (Box::new(Expr::Call(CallExpr {
        span: expression.span,
        ctxt: SyntaxContext::empty(),
        callee: Callee::Expr(expression.tag.clone()),
        args: arguments,
        type_args: None,
      }))),
    }
  }

  /// Get the selector for the keyframe to be used in other expressions
  fn get_css_reference_name(&self) -> Option<String> {
    Some(match &self.transpilation_mode {
      TranspilationMode::CssModule => format!("global({})", self.animation_name),
      TranspilationMode::Css => self.animation_name.clone(),
    })
  }
}

#[cfg(test)]
mod tests {
  use super::unwrap_global_selectors;

  #[test]
  fn unwraps_functional_global() {
    assert_eq!(unwrap_global_selectors(":global(.maps)"), ".maps");
  }

  #[test]
  fn unwraps_functional_global_with_nested_parens() {
    assert_eq!(
      unwrap_global_selectors(":global(.legacy-widget:has(.icon))"),
      ".legacy-widget:has(.icon)"
    );
  }

  #[test]
  fn unwraps_combinator_global() {
    assert_eq!(unwrap_global_selectors(":global .maps"), ".maps");
    assert_eq!(unwrap_global_selectors("body :global .maps"), "body .maps");
  }

  #[test]
  fn unwraps_global_mixed_with_other_selectors() {
    assert_eq!(
      unwrap_global_selectors("body:has(:global(.legacy-widget)[open])"),
      "body:has(.legacy-widget[open])"
    );
  }

  #[test]
  fn leaves_plain_selectors_untouched() {
    assert_eq!(unwrap_global_selectors("body"), "body");
    assert_eq!(unwrap_global_selectors(".global-thing"), ".global-thing");
    assert_eq!(
      unwrap_global_selectors("input:focus-visible"),
      "input:focus-visible"
    );
  }
}

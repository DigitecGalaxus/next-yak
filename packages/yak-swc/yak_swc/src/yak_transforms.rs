use itertools::Itertools;
use rustc_hash::FxHashMap;
use swc_core::atoms::Atom;
use swc_core::common::util::move_map::MoveMap;

use crate::utils::ast_helper::{create_member_prop_from_string, expr_hash_map_to_object};
use crate::utils::encode_module_import::encode_percent;
use crate::variable_visitor::ScopedVariableReference;
use crate::yak_imports::YakImports;
use css_in_js_parser::{CssScope, Declaration, ParserState, ScopeType};
use swc_core::common::{Span, SyntaxContext, DUMMY_SP};
use swc_core::ecma::ast::*;
use swc_core::plugin::errors::HANDLER;

use crate::naming_convention::NamingConvention;

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
  fn create_css_state(
    &mut self,
    naming_convention: &mut NamingConvention,
    declaration_name: &ScopedVariableReference,
    previous_parser_state: Option<ParserState>,
  ) -> ParserState;
  /// Transform the expression\
  /// This is where the TypeScript AST for the expression is finally transformed
  fn transform_expression(
    &mut self,
    expression: &mut TaggedTpl,
    css_module_identifier: Ident,
    runtime_expressions: Vec<Expr>,
    declarations: &[Declaration],
    runtime_css_variables: FxHashMap<String, Expr>,
    yak_imports: &mut YakImports,
  ) -> YakTransformResult;
  /// Get animation or styled component selector name
  fn get_css_reference_name(&self) -> Option<String> {
    None
  }
}

/// Transform for nested css mixins
/// e.g. const Button = `${({$active}) => $active && css`...`}`
pub struct TransformNestedCss {
  /// Current condition which is used to determine if the mixin should be applied
  pub condition: Vec<String>,
  /// ClassName of the mixin
  class_name: Option<String>,
}

impl TransformNestedCss {
  pub fn new(condition: Vec<String>) -> TransformNestedCss {
    TransformNestedCss {
      condition,
      class_name: None,
    }
  }
}

impl YakTransform for TransformNestedCss {
  fn create_css_state(
    &mut self,
    naming_convention: &mut NamingConvention,
    declaration_name: &ScopedVariableReference,
    previous_parser_state: Option<ParserState>,
  ) -> ParserState {
    let condition = self.condition.join("-and-");
    let css_identifier = naming_convention.generate_unique_name(&format!(
      "{}__{}",
      declaration_name.to_readable_string(),
      condition
    ));
    self.class_name = Some(css_identifier.clone());
    // It is safe to unwrap here because the previous_parser_state is always set for a nested css
    let mut parser_state = previous_parser_state.clone().unwrap();
    // The first scope is the class name which gets attached to the element
    parser_state.current_scopes[0] = CssScope {
      name: format!(".{}", css_identifier),
      scope_type: ScopeType::Selector,
    };
    parser_state
  }

  fn transform_expression(
    &mut self,
    expression: &mut TaggedTpl,
    css_module_identifier: Ident,
    runtime_expressions: Vec<Expr>,
    declarations: &[Declaration],
    runtime_css_variables: FxHashMap<String, Expr>,
    _yak_imports: &mut YakImports,
  ) -> YakTransformResult {
    let mut arguments: Vec<ExprOrSpread> = vec![];
    if !declarations.is_empty() {
      arguments.push(
        Expr::Member(MemberExpr {
          span: DUMMY_SP,
          obj: Box::new(Expr::Ident(css_module_identifier.clone())),
          prop: create_member_prop_from_string(self.class_name.clone().unwrap()),
        })
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
        // Use a sepcial span as this expression might be cloned as part
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
  export_name: Option<ScopedVariableReference>,
  is_exported: bool,
  is_within_jsx_attribute: bool,
  generated_class_name: Option<String>,
}

impl TransformCssMixin {
  pub fn new(is_exported: bool, is_within_jsx_attribute: bool) -> TransformCssMixin {
    TransformCssMixin {
      export_name: None,
      is_exported,
      is_within_jsx_attribute,
      generated_class_name: None,
    }
  }
}

impl YakTransform for TransformCssMixin {
  fn create_css_state(
    &mut self,
    naming_convention: &mut NamingConvention,
    declaration_name: &ScopedVariableReference,
    _previous_parser_state: Option<ParserState>,
  ) -> ParserState {
    self.export_name = Some(declaration_name.clone());
    let mut parser_state = ParserState::new();
    let generated_class_name =
      naming_convention.generate_unique_name_for_variable(declaration_name);
    // TODO: Remove the unused scope once nested mixins work again
    parser_state.current_scopes = vec![CssScope {
      name: format!(".{}", generated_class_name),
      scope_type: ScopeType::AtRule,
    }];
    self.generated_class_name = Some(generated_class_name);
    parser_state
  }

  fn transform_expression(
    &mut self,
    expression: &mut TaggedTpl,
    css_module_identifier: Ident,
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
    let css_prefix = if self.is_within_jsx_attribute {
      // Add the class name to the arguments, to be created by the CSS loader
      arguments.push(
        Expr::Member(MemberExpr {
          span: DUMMY_SP,
          obj: Box::new(Expr::Ident(css_module_identifier.clone())),
          prop: create_member_prop_from_string(self.generated_class_name.clone().unwrap()),
        })
        .into(),
      );
      Some("YAK Extracted CSS:".to_string())
    } else if self.is_exported {
      Some(format!(
        "YAK EXPORTED MIXIN:{}",
        self
          .export_name
          .as_ref()
          .unwrap()
          .parts
          .iter()
          .map(|atom| encode_percent(atom.as_str()))
          .join(":")
      ))
    } else {
      None
    };

    YakTransformResult {
      css: YakCss {
        comment_prefix: css_prefix,
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
      return Some(self.generated_class_name.clone().unwrap());
    }
    None
  }
}

/// Transform styled component api
/// e.g. const Wrapper = styled.div`...`
pub struct TransformStyled {
  /// root class name of the styled component
  class_name: Option<String>,
}

impl TransformStyled {
  pub fn new() -> TransformStyled {
    TransformStyled { class_name: None }
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
                value: Atom::new(member_name),
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
  fn create_css_state(
    &mut self,
    naming_convention: &mut NamingConvention,
    declaration_name: &ScopedVariableReference,
    _previous_parser_state: Option<ParserState>,
  ) -> ParserState {
    let css_identifier = naming_convention.generate_unique_name_for_variable(declaration_name);
    self.class_name = Some(css_identifier.clone());
    let mut parser_state = ParserState::new();
    parser_state.current_scopes = vec![CssScope {
      name: format!(".{}", css_identifier),
      scope_type: ScopeType::AtRule,
    }];
    parser_state
  }

  fn transform_expression(
    &mut self,
    expression: &mut TaggedTpl,
    css_module_identifier: Ident,
    runtime_expressions: Vec<Expr>,
    declarations: &[Declaration],
    runtime_css_variables: FxHashMap<String, Expr>,
    yak_imports: &mut YakImports,
  ) -> YakTransformResult {
    let mut arguments: Vec<ExprOrSpread> = vec![];
    if !declarations.is_empty() {
      arguments.push(
        Expr::Member(MemberExpr {
          span: DUMMY_SP,
          obj: Box::new(Expr::Ident(css_module_identifier.clone())),
          prop: create_member_prop_from_string(self.class_name.clone().unwrap()),
        })
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
    let tag_expression = transform_styled_usages(expression.tag.clone(), yak_imports);
    YakTransformResult {
      css: YakCss {
        comment_prefix: Some("YAK Extracted CSS:".to_string()),
        declarations: declarations.to_vec(),
      },
      expression: (Box::new(Expr::Call(CallExpr {
        span: expression.span,
        ctxt: SyntaxContext::empty(),
        callee: Callee::Expr(tag_expression),
        args: arguments,
        type_args: None,
      }))),
    }
  }

  /// Get the selector for the specific styled component to be used in other expressions
  fn get_css_reference_name(&self) -> Option<String> {
    Some(format!(".{}", self.class_name.clone().unwrap()))
  }
}

/// Transform for keyframe animations
/// e.g. const fadeIn = keyframes`...`
pub struct TransformKeyframes {
  /// Animation Name
  animation_name: Option<String>,
}

impl TransformKeyframes {
  pub fn new(animation_name: String) -> TransformKeyframes {
    TransformKeyframes {
      animation_name: Some(animation_name),
    }
  }
}

impl YakTransform for TransformKeyframes {
  fn create_css_state(
    &mut self,
    naming_convention: &mut NamingConvention,
    declaration_name: &ScopedVariableReference,
    _previous_parser_state: Option<ParserState>,
  ) -> ParserState {
    let css_identifier = if self.animation_name.is_none() {
      let new_identifier = naming_convention.generate_unique_name_for_variable(declaration_name);
      self.animation_name = Some(new_identifier.clone());
      new_identifier
    } else {
      self.animation_name.clone().unwrap()
    };
    let mut parser_state = ParserState::new();
    parser_state.current_scopes = vec![CssScope {
      name: format!("@keyframes {}", css_identifier),
      scope_type: ScopeType::AtRule,
    }];
    parser_state
  }

  fn transform_expression(
    &mut self,
    expression: &mut TaggedTpl,
    css_module_identifier: Ident,
    _runtime_expressions: Vec<Expr>,
    declarations: &[Declaration],
    runtime_css_variables: FxHashMap<String, Expr>,
    _yak_imports: &mut YakImports,
  ) -> YakTransformResult {
    let mut arguments: Vec<ExprOrSpread> = vec![];
    if !declarations.is_empty() {
      arguments.push(
        Expr::Member(MemberExpr {
          span: DUMMY_SP,
          obj: Box::new(Expr::Ident(css_module_identifier.clone())),
          prop: create_member_prop_from_string(self.animation_name.clone().unwrap()),
        })
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
        comment_prefix: Some("YAK Extracted CSS:".to_string()),
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
    Some(self.animation_name.clone().unwrap())
  }
}

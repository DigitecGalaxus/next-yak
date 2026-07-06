use rustc_hash::FxHashMap;
use swc_core::common::util::move_map::MoveMap;

use crate::utils::ast_helper::expr_hash_map_to_object;
use crate::utils::cross_file_selectors::encode_percent;
use crate::variable_visitor::ScopedVariableReference;
use crate::yak_imports::YakImports;
use css_in_js_parser::{CssScope, Declaration, ParserState, ScopeType};
use swc_core::common::{source_map::PURE_SP, Span, Spanned, SyntaxContext, DUMMY_SP};
use swc_core::ecma::ast::*;
use swc_core::ecma::visit::{VisitMut, VisitMutWith};

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

/// Extracts the raw class name from a css scope name
/// e.g. ":global(.foo)" -> "foo" and ".foo" -> "foo"
/// CSS escapes (e.g. "\$") are removed as the corresponding
/// javascript string literals contain the unescaped name
fn scope_name_to_class_name(scope_name: &str) -> String {
  scope_name
    .strip_prefix(":global(")
    .and_then(|name| name.strip_suffix(")"))
    .unwrap_or(scope_name)
    .strip_prefix('.')
    .unwrap_or(scope_name)
    .replace('\\', "")
}

/// Rewrites baked branch class name string literals into scope handle calls
/// e.g. css("mixin__$active_x") -> css(__yak_b(0))
/// Used for exported dynamic mixins where the final class names are only
/// known at the consumer's usage site
struct BranchClassNameRewriter<'a> {
  /// Maps raw branch class names to their stable branch id
  branch_ids: &'a FxHashMap<String, usize>,
  /// The scope handle parameter of the mixin factory
  scope_handle: Ident,
}

impl VisitMut for BranchClassNameRewriter<'_> {
  fn visit_mut_expr(&mut self, expr: &mut Expr) {
    expr.visit_mut_children_with(self);
    if let Expr::Lit(Lit::Str(str_lit)) = expr {
      if let Some(branch_id) = str_lit
        .value
        .as_str()
        .and_then(|value| self.branch_ids.get(value))
      {
        *expr = Expr::Call(CallExpr {
          span: DUMMY_SP,
          ctxt: SyntaxContext::empty(),
          callee: Callee::Expr(Box::new(Expr::Ident(self.scope_handle.clone()))),
          args: vec![Expr::Lit(Lit::Num(Number {
            span: DUMMY_SP,
            value: *branch_id as f64,
            raw: None,
          }))
          .into()],
          type_args: None,
        });
      }
    }
  }
}

/// Rewrites the fixed scope prefix of `__yak_use` calls into slot references
/// e.g. __yak_use(inner, "mixin__inner_x") -> __yak_use(inner, __yak_b.sub(0))
///
/// Inside an exported dynamic mixin the final scope of a nested cross-file
/// mixin depends on where the exported mixin itself is used - the factory's
/// scope handle derives it at runtime (`<prefix>-s0`) while the css payload
/// carries the matching `@s0` slot marker for the resolver
struct SlotRewriter {
  /// Maps the fixed scope prefixes (assigned in `lib.rs` before the export
  /// was known to be dynamic) to their stable slot id
  slot_ids: Vec<(String, usize)>,
  /// The scope handle parameter of the mixin factory
  scope_handle: Ident,
  /// The `__yak_use` utility identifier
  use_ident: Ident,
}

impl SlotRewriter {
  fn slot_id(&mut self, prefix: &str) -> usize {
    if let Some((_, slot_id)) = self.slot_ids.iter().find(|(known, _)| known == prefix) {
      return *slot_id;
    }
    let slot_id = self.slot_ids.len();
    self.slot_ids.push((prefix.to_string(), slot_id));
    slot_id
  }
}

impl VisitMut for SlotRewriter {
  fn visit_mut_call_expr(&mut self, call: &mut CallExpr) {
    call.visit_mut_children_with(self);
    let is_yak_use = matches!(
      &call.callee,
      Callee::Expr(callee) if matches!(&**callee, Expr::Ident(ident) if ident.sym == self.use_ident.sym)
    );
    if !is_yak_use || call.args.len() != 2 {
      return;
    }
    let Expr::Lit(Lit::Str(prefix)) = &*call.args[1].expr else {
      return;
    };
    let Some(prefix) = prefix.value.as_str().map(|value| value.to_string()) else {
      return;
    };
    let slot_id = self.slot_id(&prefix);
    call.args[1] = Expr::Call(CallExpr {
      span: DUMMY_SP,
      ctxt: SyntaxContext::empty(),
      callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
        span: DUMMY_SP,
        obj: Box::new(Expr::Ident(self.scope_handle.clone())),
        prop: MemberProp::Ident(IdentName {
          span: DUMMY_SP,
          sym: "sub".into(),
        }),
      }))),
      args: vec![Expr::Lit(Lit::Num(Number {
        span: DUMMY_SP,
        value: slot_id as f64,
        raw: None,
      }))
      .into()],
      type_args: None,
    })
    .into();
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
  /// Set when the mixin was compiled as a dynamic template (V2)
  /// so that the default export comment uses the matching marker
  compiled_dynamic: bool,
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
      compiled_dynamic: false,
    }
  }

  fn exported_mixin_name(&self) -> String {
    self
      .export_name
      .parts
      .iter()
      .map(|atom| encode_percent(atom.to_string_lossy().as_ref())) // If the name contains surrogates, other CSS parser would have problems as well
      .collect::<Vec<_>>()
      .join(":")
  }

  /// Transforms an exported mixin with dynamic content (conditional branches
  /// and/or css variables) into a class-name-parameterized template.
  ///
  /// The css payload keeps the branch structure by wrapping every branch in a
  /// `@yak-branch bN { ... }` block:
  ///
  /// ```css
  /// /*YAK EXPORTED MIXIN V2:highlight
  /// color: black;
  /// @yak-branch b0 {
  ///   color: red;
  /// }
  /// */
  /// ```
  ///
  /// The runtime expression becomes a factory which receives a scope handle
  /// that maps branch ids to the class names of the consuming usage site:
  ///
  /// ```js
  /// __yak_mixin((__yak_b) => [({ $active }) => $active && css(__yak_b(0))])
  /// ```
  ///
  /// The cross-file resolver renders the payload with the same usage-site
  /// prefix (`<prefix>-b0`), so both sides agree on the class names without
  /// ever seeing each other.
  fn transform_dynamic_exported_mixin(
    &mut self,
    expression: &mut TaggedTpl,
    mut runtime_expressions: Vec<Expr>,
    declarations: &[Declaration],
    runtime_css_variables: FxHashMap<String, Expr>,
    yak_imports: &mut YakImports,
  ) -> YakTransformResult {
    self.compiled_dynamic = true;
    let own_scope_name = self.transpilation_mode.css_class_name(&self.class_name);

    // Assign stable branch ids (b0, b1, ...) to the conditional branch classes
    // in order of first appearance. Branch declarations are recognizable by a
    // root scope that differs from the mixin's own class scope - it was
    // replaced by TransformNestedCss when the branch was processed.
    let mut branch_scope_ids: Vec<(String, usize)> = vec![];
    let mut branch_class_ids: FxHashMap<String, usize> = FxHashMap::default();
    for declaration in declarations {
      if let Some(root_scope) = declaration.scope.first() {
        if root_scope.name != own_scope_name
          && !branch_scope_ids
            .iter()
            .any(|(scope_name, _)| scope_name == &root_scope.name)
        {
          let branch_id = branch_scope_ids.len();
          branch_scope_ids.push((root_scope.name.clone(), branch_id));
          branch_class_ids.insert(scope_name_to_class_name(&root_scope.name), branch_id);
        }
      }
    }

    // Rewrite the baked branch class names inside the runtime expressions to
    // scope handle calls e.g. css("mixin__$active_x") -> css(__yak_b(0))
    let scope_handle = Ident::from("__yak_b");
    let mut rewriter = BranchClassNameRewriter {
      branch_ids: &branch_class_ids,
      scope_handle: scope_handle.clone(),
    };
    for runtime_expression in runtime_expressions.iter_mut() {
      runtime_expression.visit_mut_with(&mut rewriter);
    }

    // Rewrite the fixed scope prefixes of nested cross-file mixins into slot
    // references e.g. __yak_use(inner, "mixin__inner_x") -> __yak_use(inner, __yak_b.sub(0))
    // (if __yak_use was never requested this file has no cross-file mixin references)
    let mut slot_ids: Vec<(String, usize)> = vec![];
    if let Some(use_ident) = yak_imports.peek_yak_utility_ident("use") {
      let mut slot_rewriter = SlotRewriter {
        slot_ids: vec![],
        scope_handle: scope_handle.clone(),
        use_ident,
      };
      for runtime_expression in runtime_expressions.iter_mut() {
        runtime_expression.visit_mut_with(&mut slot_rewriter);
      }
      slot_ids = slot_rewriter.slot_ids;
    }

    // Render the payload: the mixin's own scope is dropped (the static css is
    // spliced in place by the resolver), branch scopes are replaced with
    // their stable @yak-branch marker and the scope prefixes of nested
    // cross-file markers are replaced with their matching @sN slot reference
    let payload_declarations = declarations.to_vec().move_map(|mut declaration| {
      if let Some(root_scope) = declaration.scope.first() {
        if root_scope.name == own_scope_name {
          declaration.scope.remove(0);
        } else if let Some((_, branch_id)) = branch_scope_ids
          .iter()
          .find(|(scope_name, _)| scope_name == &root_scope.name)
        {
          declaration.scope[0] = CssScope {
            name: format!("@yak-branch b{}", branch_id),
            scope_type: ScopeType::AtRule,
          };
        }
      }
      if declaration.property.trim() == "--yak-css-import" {
        for (prefix, slot_id) in &slot_ids {
          declaration.value = declaration
            .value
            .replace(&format!(",\"{}\")", prefix), &format!(",@s{})", slot_id));
        }
      }
      declaration
    });

    let mut factory_elements: Vec<Option<ExprOrSpread>> = runtime_expressions
      .into_iter()
      .map(|expr| Some(expr.into()))
      .collect();
    if !runtime_css_variables.is_empty() {
      factory_elements.push(Some(
        expr_hash_map_to_object(FxHashMap::from_iter([(
          "style".to_string(),
          expr_hash_map_to_object(runtime_css_variables),
        )]))
        .into(),
      ));
    }

    let factory = Expr::Arrow(ArrowExpr {
      span: DUMMY_SP,
      ctxt: SyntaxContext::empty(),
      params: vec![Pat::Ident(BindingIdent {
        id: scope_handle,
        type_ann: None,
      })],
      body: Box::new(BlockStmtOrExpr::Expr(Box::new(Expr::Array(ArrayLit {
        span: DUMMY_SP,
        elems: factory_elements,
      })))),
      is_async: false,
      is_generator: false,
      return_type: None,
      type_params: None,
    });

    YakTransformResult {
      css: YakCss {
        comment_prefix: Some(format!(
          "YAK EXPORTED MIXIN V2:{}",
          self.exported_mixin_name()
        )),
        declarations: payload_declarations,
      },
      expression: Box::new(Expr::Call(CallExpr {
        span: expression.span,
        ctxt: SyntaxContext::empty(),
        callee: Callee::Expr(Box::new(Expr::Ident(
          yak_imports.get_yak_utility_ident("mixin"),
        ))),
        args: vec![factory.into()],
        type_args: None,
      })),
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
    yak_imports: &mut YakImports,
  ) -> YakTransformResult {
    let has_dynamic_content = !runtime_expressions.is_empty() || !runtime_css_variables.is_empty();

    if self.is_exported && has_dynamic_content && !self.is_within_jsx_attribute {
      return self.transform_dynamic_exported_mixin(
        expression,
        runtime_expressions,
        declarations,
        runtime_css_variables,
        yak_imports,
      );
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
        self.exported_mixin_name()
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
      "YAK EXPORTED MIXIN{}:default{}",
      if self.compiled_dynamic { " V2" } else { "" },
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

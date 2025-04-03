use css_in_js_parser::{find_char, parse_css, to_css, CommentStateType};
use css_in_js_parser::{Declaration, ParserState};
use rustc_hash::FxHashMap;
use serde::Deserialize;
use std::ops::Deref;
use std::vec;
use swc_core::atoms::atom;
use swc_core::atoms::Atom;

use swc_core::common::comments::Comment;
use swc_core::common::comments::Comments;
use swc_core::common::{Spanned, SyntaxContext, DUMMY_SP};
use swc_core::ecma::visit::{visit_mut_pass, Fold, VisitMutWith};
use swc_core::ecma::{ast::*, visit::VisitMut};
use swc_core::plugin::errors::HANDLER;
use swc_core::plugin::metadata::TransformPluginMetadataContextKind;
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};
use utils::add_suffix_to_expr::add_suffix_to_expr;
use utils::ast_helper::{extract_ident_and_parts, is_valid_tagged_tpl, TemplateIterator};
use utils::css_prop::HasCSSProp;
use utils::encode_module_import::{encode_module_import, ImportKind};

mod variable_visitor;
use variable_visitor::{ScopedVariableReference, VariableVisitor};
mod yak_imports;
use yak_imports::{visit_module_imports, YakImports};
mod yak_file_visitor;
use yak_file_visitor::YakFileVisitor;
mod math_evaluate;
use math_evaluate::try_evaluate;

mod utils {
  pub(crate) mod add_suffix_to_expr;
  pub(crate) mod ast_helper;
  pub(crate) mod css_hash;
  pub(crate) mod css_prop;
  pub(crate) mod encode_module_import;
  pub(crate) mod native_elements;
}
mod naming_convention;
use naming_convention::NamingConvention;

mod yak_transforms;
use yak_transforms::{
  TransformCssMixin, TransformKeyframes, TransformNestedCss, TransformStyled, YakTransform,
};

/// Static plugin configuration.
#[derive(Default, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(deny_unknown_fields)]
pub struct Config {
  /// Use Readable CSS Variable Names
  #[serde(default)]
  pub dev_mode: bool,
  /// The hash for a css-variable depends on the file name including createVar().
  /// To ensure that the hash is consistent accross multiple systems the relative path
  /// from the base dir to the source file is used.
  pub base_path: String,
  /// Prefix for the generated css identifier
  pub prefix: Option<String>,
  /// Improves react DevTools experience by setting displayName
  /// on the component to match the original component name.
  /// Disabled by default.
  #[serde(default)]
  pub display_names: bool,
}

pub struct TransformVisitor<GenericComments>
where
  // SWC provides different comment types for production and testing
  // We need to abstract over this to make the plugin testable
  // @see https://stackoverflow.com/questions/78709909/injecting-comments-with-a-swc-rust-plugin
  GenericComments: Comments,
{
  /// Last css parser state to contiue parsing the next css code from a quasi
  /// in the same scope
  current_css_state: Option<ParserState>,
  /// All css declarations of the current root css expression
  current_declaration: Vec<Declaration>,
  /// e.g Button in const Button = styled.button`color: red;`
  current_variable_name: Option<ScopedVariableReference>,
  /// Current condition to name nested css expressions
  current_condition: Vec<String>,
  /// Current css expression is exported
  current_exported: bool,
  /// SWC comments proxy to add extracted css as comments
  comments: Option<GenericComments>,
  /// Extracted variables from the AST
  /// Used to access constants in css expressions
  variables: VariableVisitor,
  /// Visitor to gather all imports from the current program
  /// Used to check if the current program is using next-yak
  /// to idenftify css-in-js expressions
  yak_library_imports: Option<YakImports>,
  /// Variable Name to Unique CSS Identifier Mapping\
  /// e.g. const Rotation = keyframes`...` -> Rotation\
  /// e.g. const Button = styled.button`...` -> Button\
  /// Used to replace expressions with the actual class name or keyframes name
  variable_name_selector_mapping: FxHashMap<ScopedVariableReference, String>,
  /// Naming convention to generate unique css identifiers
  naming_convention: NamingConvention,
  /// Expression replacement to replace a yak library call with the transformed one
  expression_replacement: Option<Box<Expr>>,
  /// Flag to check if we are inside a css attribute
  inside_element_with_css_attribute: bool,
  /// If true, additional code will be injected to provide readable `displayName` values
  /// in React DevTools and stack traces for every yak component
  display_names: bool,
}

impl<GenericComments> TransformVisitor<GenericComments>
where
  GenericComments: Comments,
{
  pub fn new(
    comments: Option<GenericComments>,
    filename: impl AsRef<str>,
    dev_mode: bool,
    prefix: Option<String>,
    display_names: bool,
  ) -> Self {
    Self {
      current_css_state: None,
      current_declaration: vec![],
      current_variable_name: None,
      current_condition: vec![],
      current_exported: false,
      variables: VariableVisitor::new(),
      yak_library_imports: None,
      naming_convention: NamingConvention::new(filename.as_ref(), dev_mode, prefix),
      variable_name_selector_mapping: FxHashMap::default(),
      expression_replacement: None,
      inside_element_with_css_attribute: false,
      comments,
      display_names,
    }
  }

  /// Check if we are inside a next-yak css expression
  fn is_inside_css_expression(&self) -> bool {
    self.current_css_state.is_some()
  }

  fn yak_imports(&self) -> &YakImports {
    self
      .yak_library_imports
      .as_ref()
      .expect("Internal error: yak_library_imports is None - this should be impossible as imports are parsed in the initial program visit before any other processing")
  }

  /// Try to get the component id of the current styled component mixin or animation
  /// e.g. const Button = styled.button`color: red;` -> Button#1
  fn get_current_component_id(&self) -> ScopedVariableReference {
    self.current_variable_name.clone().unwrap_or_else(|| {
      ScopedVariableReference::new(
        Id::from((atom!("yak"), SyntaxContext::empty())),
        vec![atom!("yak")],
      )
    })
  }

  /// Iterate over the quasi and expressions of a tagged template literal
  /// and process the css code and expressions
  fn process_yak_literal(
    &mut self,
    n: &mut TaggedTpl,
    mut css_state: Option<ParserState>,
  ) -> (
    Vec<Expr>,
    std::collections::HashMap<String, Expr, rustc_hash::FxBuildHasher>,
  ) {
    // Literal expressions which can't be replaced by constant values
    // and must be kept for the final output (so they run at runtime)
    let mut runtime_expressions: Vec<Expr> = vec![];
    let mut runtime_css_variables: FxHashMap<String, Expr> = FxHashMap::default();
    // When moving units into css variables it has to be removed from the next css code
    // e.g. styled.button`left: ${({$x}) => $x}px;` -> `left: var(--left);`
    let mut css_code_offset: usize = 0;
    let is_top_level = !self.is_inside_css_expression();

    let quasis = n.tpl.quasis.clone();

    let mut template_iter = TemplateIterator::new(&mut n.tpl);
    // Javascript Quasi (TplElement) and Expressions (Exprs) are interleaved
    // e.g. styled.button`color: ${primary};` => [TplElement, Expr, TplElement]
    while let Some(pair) = template_iter.next() {
      let is_last_pair = pair.is_last;
      let quasi = pair.quasi;

      let css_code = if is_last_pair {
        // allow a css literal to skip the last semicolon
        let final_quasi = quasi.raw.trim_end();
        if final_quasi.ends_with(';') || final_quasi.ends_with('}') {
          quasi.raw.to_string()
        } else {
          format!("{};", final_quasi).to_string()
        }
      } else {
        quasi.raw.to_string()
      };
      // The offset value is set by a previous expression when a unit is moved into a css variable
      // e.g. styled.button`left: ${({$x}) => $x}px;` -> `left: var(--left);`
      // The escapping of the css code is removed as a slash requires escaling in js string literals
      // e.g. styled.button`content: "\\2022"` -> `content: "\2022"`
      let quasi_css_code = &css_code[css_code_offset..].replace("\\\\", "\\");
      let (new_state, new_declarations) = parse_css(quasi_css_code, css_state);
      css_code_offset = 0;
      css_state = Some(new_state);
      // Add the extracted CSS to the the root styled component
      self.current_declaration.extend(new_declarations);

      let current_css_state = css_state.clone().unwrap();
      if current_css_state.current_comment_state != CommentStateType::None {
        continue;
      }

      // Expressions
      // e.g. const Button = styled.button`color: ${primary};`
      //                                            ^^^^^^^
      // e.g. const Button = styled.button`color: ${() => /* ... */};`
      //                                            ^^^^^^^^^^^^^^^^
      if let Some(expr) = pair.expr {
        // Handle simple math expressions in css expressions
        // e.g. styled.button`width: ${100 + 20}px;`
        if let Some(evaluated_math_calculation) = try_evaluate(expr, &self.variables) {
          // Format to 4 decimal places
          let (new_state, new_declarations) = parse_css(
            format!("{:.4}", evaluated_math_calculation)
              .trim_end_matches('0')
              .trim_end_matches('.'),
            css_state,
          );
          css_state = Some(new_state);
          self.current_declaration.extend(new_declarations);
        }
        // Handle constants in css expressions
        // e.g. styled.button`color: ${primary};` (Ident)
        // e.g. styled.button`color: ${colors.primary};` (MemberExpression)
        else if let Some(scoped_name) = extract_ident_and_parts(expr) {
          // Known StyledComponents, Mixin or Animations in the same file
          if let Some(referenced_yak_css) = self.variable_name_selector_mapping.get(&scoped_name) {
            let (new_state, new_declarations) = parse_css(referenced_yak_css, css_state);
            css_state = Some(new_state);
            self.current_declaration.extend(new_declarations);
          }
          // Cross-file references
          // e.g.:
          // import { colors } from "./theme";
          // styled.button`color: ${colors.primary};`
          else if let Some((_import_source_type, module_path)) =
            self.variables.get_imported_variable(&scoped_name.id)
          {
            let code_after_expression = &quasis[pair.index + 1..]
              .iter()
              .map(|quasi| quasi.raw.as_str())
              .collect::<String>();
            let import_kind: ImportKind =
              match find_char(code_after_expression, &[';', '{', '}', '@']) {
                Some((char, _)) =>
                // e.g. styled.button`${Icon} { ... }`
                {
                  if char == '{' {
                    ImportKind::Selector
                  }
                  // e.g. styled.button`${colors.primary} @media { ... }`
                  // e.g. styled.button`.foo { ${colors.primary} }`
                  // e.g. styled.button`${colors.primary};`
                  else {
                    ImportKind::Mixin
                  }
                }
                // e.g. styled.button`${colors.primary}`
                None => ImportKind::Mixin,
              };
            let cross_file_import_token =
              encode_module_import(module_path.as_str(), scoped_name.parts, import_kind);

            // TODO Track Dynamic Mixins as runtime dependency to pass props: `runtime_expressions.push(*expr.clone());`
            let (new_state, _) = parse_css(&cross_file_import_token, css_state);
            css_state = Some(new_state);
          }
          // Constants
          else if let Some(value) = self.variables.get_const_value(&scoped_name) {
            // e.g.:
            // const primary = "red";
            // styled.button`color: ${primary};`
            if let Some(literal_value) = match *value.clone() {
              Expr::Lit(Lit::Str(str)) => Some(str.value.to_string()),
              Expr::Lit(Lit::Num(num)) => Some(num.value.to_string()),
              _ => None,
            } {
              let (new_state, _) = parse_css(&literal_value, css_state);
              css_state = Some(new_state);
            } else if let Expr::TaggedTpl(tagged_tpl) = *value {
              // constant mixins e.g.
              // const highlight = css`color: red;`
              // const Button = styled.button`&:hover { ${highlight}; }`
              if is_valid_tagged_tpl(&tagged_tpl, self.yak_imports().yak_css_idents()) {
                let (inline_runtime_exprs, inline_runtime_css_vars) =
                  self.process_yak_literal(&mut tagged_tpl.clone(), css_state.clone());
                runtime_expressions.extend(inline_runtime_exprs);
                runtime_css_variables.extend(inline_runtime_css_vars);
              }
              // keyframes - of animations which have not been parsed yet
              // const Button = styled.button`animation: ${highlight};`
              // const highlight = keyframes`from { color: red; }`
              else if is_valid_tagged_tpl(&tagged_tpl, self.yak_imports().yak_keyframes_idents())
              {
                // Create a unique name for the keyframe
                let keyframe_name = self
                  .naming_convention
                  .get_keyframe_name(&scoped_name.to_readable_string());
                // Store the keyframe for the later keyframe declaration
                self
                  .variable_name_selector_mapping
                  .insert(scoped_name.clone(), keyframe_name.clone());
                let (new_state, _) = parse_css(keyframe_name.as_str(), css_state);
                css_state = Some(new_state);
              } else {
                HANDLER.with(|handler| {
                  handler
                    .struct_span_err(
                      expr.span(),
                      &format!(
                        "Unsupported \"{}\" template literal in css expression - only css`` mixins are allowed",
                        scoped_name.to_readable_string()
                      ),
                    )
                    .emit();
                });
              }
            } else {
              HANDLER.with(|handler| {
                handler
                  .struct_span_err(
                    expr.span(),
                    &format!(
                      "The value for constant \"{}\" is not a valid css value or css mixin",
                      scoped_name.to_readable_string()
                    ),
                  )
                  .emit();
              });
            }
          }
          // A property with a dynamic value in the top scope
          // e.g. styled.button`color: ${myColor};`
          else if is_top_level {
            HANDLER.with(|handler| {
              handler
                .struct_span_err(
                  expr.span(),
                  &format!(
                    "The value for variable \"{}\" could not be found in the top scope",
                    scoped_name.id.0
                  ),
                )
                .emit();
            });
          // A property with a dynamic value
          // e.g. styled.button`${({$color}) => css`color: ${$color}`};`
          } else {
            HANDLER.with(|handler| {
                          handler
                            .struct_span_err(
                              expr.span(),
                              &format!(
                                "The shorthand access to the variable \"{var}\" is not allowed in a nested expression.
To be able to use the property turn it into a CSS variable by wrapping it in a function:

${{() => {var}}};\n",
                                var=scoped_name.id.0
                              ),
                            )
                            .emit();
                        });
          }
        }
        // Handle inline css literals
        // e.g. styled.button`${css`color: red;`};`
        else if let Expr::TaggedTpl(tpl) = &mut **expr {
          if is_valid_tagged_tpl(tpl, self.yak_imports().yak_css_idents()) {
            let (inline_runtime_exprs, inline_runtime_css_vars) =
              self.process_yak_literal(tpl, css_state.clone());
            runtime_expressions.extend(inline_runtime_exprs);
            runtime_css_variables.extend(inline_runtime_css_vars);
          } else {
            HANDLER.with(|handler| {
              handler
                .struct_span_err(
                  tpl.span,
                  "Only css template literals are allowed inside css expressions",
                )
                .emit();
            });
          }
        }
        // Visit nested css expressions
        // e.g. styled.button`.foo { ${({$x}) => $x && css`color: red`}; }`
        // e.g. styled.button`left: ${({$x}) => $x};`
        else {
          // Used for resetting the css state after processing all expressions
          let css_state_before = self.current_css_state.clone();
          // store the current css state so we can use it in nested css expressions
          self.current_css_state.clone_from(&css_state);

          let is_inside_property_value = css_state.as_ref().unwrap().is_inside_property_value;

          // If the expression is inside a css property value
          // it has to be replaced with a css variable
          if is_inside_property_value {
            // Show an error if the expression is not valid
            // e.g. styled.button`left: ${getPosition()}px;`
            if is_top_level {
              verify_valid_property_value_expr(expr);
            }
            // Check if the next quasi starts with a unit
            // e.g. styled.button`left: ${({$x}) => $x}px;`
            let unit = if let Some(next_quasi) = pair.next_quasi {
              extract_leading_css_unit(next_quasi.raw.as_str())
            } else {
              None
            };
            // The css code offset is used to remove the unit from the next css code
            css_code_offset = unit.map_or(0, |unit_str| unit_str.len());

            let readable_name = format!(
              "{}__{}",
              // Current variable name of the StyledComponent or Mixin
              // e.g. Button for const Button = styled.button`color: red;`
              self
                // TODO: check if parts should also be used for the name:
                .get_current_component_id()
                .id
                .0,
              // Current property name
              // e.g. color for styled.button`color: red;`
              css_state.as_ref().unwrap().current_declaration.property
            );
            let css_variable_name = self
              .naming_convention
              .get_css_variable_name(readable_name.as_str());
            let css_variable_runtime_expr = if let Some(unit) = unit {
              add_suffix_to_expr(
                *expr.clone(),
                self
                  .yak_library_imports
                  .as_mut()
                  .unwrap()
                  .get_yak_utility_ident("unitPostFix"),
                unit,
              )
            } else {
              *expr.clone()
            };

            runtime_css_variables.insert(
              format!("--{}", css_variable_name.clone()),
              css_variable_runtime_expr,
            );
            let (new_state, _) = parse_css(&format!("var(--{})", css_variable_name), css_state);
            css_state = Some(new_state);
          }

          expr.visit_mut_children_with(self);

          // If the expression is outside a css property value
          // it is probably a nested css expression
          if !is_inside_property_value {
            runtime_expressions.push(*expr.clone());
          }

          // revert to the css state before the current expression or literal
          self.current_css_state = css_state_before;
        }
      }
    }
    (runtime_expressions, runtime_css_variables)
  }
}

impl<GenericComments> Fold for TransformVisitor<GenericComments> where GenericComments: Comments {}

impl<GenericComments> VisitMut for TransformVisitor<GenericComments>
where
  GenericComments: Comments,
{
  fn visit_mut_program(&mut self, program: &mut Program) {
    if let Program::Module(module) = program {
      self.yak_library_imports = Some(visit_module_imports(module));
    } else {
      return;
    }

    // Skip this program only if yak is not used at all
    if !self.yak_imports().is_using_next_yak() {
      return;
    }

    // Use VariableVisitor to visit the AST and extract all variable names
    let mut variable_visitor = VariableVisitor::new();
    program.visit_mut_children_with(&mut variable_visitor);
    self.variables = variable_visitor;
    program.visit_mut_children_with(self);
  }

  /// Inject the css module import to the current file so webpack can process
  /// the css separately add HMR and extract it as a static asset
  /// e.g. import __styleYak from "./App.yak.module.css!=!./App?App.yak.module.css"
  /// !=! is a webpack-specific syntax that tells webpack to override the default loaders for this import
  /// ? is a fix for Next.js loaders which ignore the !=! statement
  fn visit_mut_module(&mut self, module: &mut Module) {
    let basename = self.naming_convention.get_base_file_name();

    module.visit_mut_children_with(self);

    // Add the css module import to the top of the file
    // if any css-in-js expressions has been used
    if !self.variable_name_selector_mapping.is_empty() {
      for item in module.body.iter_mut() {
        if let ModuleItem::ModuleDecl(ModuleDecl::Import(import_declaration)) = item {
          if import_declaration.src.value == "next-yak/internal" {
            // Add all stored utility imports
            import_declaration
              .specifiers
              .extend(self.yak_imports().get_yak_utility_import_specifiers());
            break;
          }
        }
      }

      // search for the last import statement as position to insert the css module import
      // it has to be the last import to ensure that the css module is loaded after the other imports
      // and therefore the css is added to the end of the bundle css file
      // see https://github.com/jantimon/next-yak/issues/202
      let mut last_import_index = 0;
      for (i, item) in module.body.iter_mut().enumerate() {
        if matches!(item, ModuleItem::ModuleDecl(ModuleDecl::Import(_))) {
          last_import_index = i + 1;
        }
      }

      if let Some(module_decl) = self.yak_imports().get_yak_component_import_declaration() {
        module
          .body
          .insert(last_import_index, ModuleItem::ModuleDecl(module_decl));
        last_import_index += 1;
      }

      module.body.insert(
        last_import_index,
        ModuleItem::ModuleDecl(ModuleDecl::Import(ImportDecl {
          phase: Default::default(),
          span: DUMMY_SP,
          specifiers: vec![],
          src: Box::new(Str {
            span: DUMMY_SP,
            value: format!(
              "./{basename}.yak.module.css!=!./{basename}?./{basename}.yak.module.css"
            )
            .into(),
            raw: None,
          }),
          type_only: false,
          with: None,
        })),
      );
    }
  }

  /// Visit export declarations
  /// To store the current export state
  /// e.g. export const Button = styled.button`color: red;`
  fn visit_mut_export_decl(&mut self, n: &mut ExportDecl) {
    self.current_exported = true;
    n.visit_mut_children_with(self);
    self.current_exported = false;
  }

  /// Visit variable declarations
  /// To store the current name which can be used for class names
  /// e.g. Button for const Button = styled.button`color: red;`
  fn visit_mut_var_decl(&mut self, n: &mut VarDecl) {
    if !self.yak_imports().is_using_next_yak() {
      return;
    }
    for decl in &mut n.decls {
      if let Pat::Ident(BindingIdent { id, .. }) = &decl.name {
        let previous_variable_name = self.current_variable_name.clone();
        self.current_variable_name = Some(ScopedVariableReference::new(
          id.to_id(),
          vec![id.sym.clone()],
        ));
        decl.init.visit_mut_with(self);
        self.current_variable_name = previous_variable_name;
      }
    }
  }

  /// Visit object member value declarations
  /// To store the current name which can be used for class names
  /// e.g. Button for const obj = { Button: styled.button`color: red;` }
  fn visit_mut_object_lit(&mut self, n: &mut ObjectLit) {
    if !self.yak_imports().is_using_next_yak() {
      return;
    }
    if self.current_variable_name.is_none() {
      n.visit_mut_children_with(self);
      return;
    }
    let current_variable_name = self.current_variable_name.clone().unwrap();
    for props_or_spread in &mut n.props {
      if let PropOrSpread::Prop(prop) = props_or_spread {
        if let Some(key_value) = prop.as_key_value() {
          let new_part = match &key_value.key {
            PropName::Ident(value) => Some(value.sym.clone()),
            PropName::Str(value) => Some(value.value.clone()),
            PropName::Num(value) => Some(Atom::from(value.value.to_string())),
            PropName::BigInt(value) => Some(Atom::from(value.value.to_string())),
            // Skip computed property names
            PropName::Computed(_) => None,
          };

          if let Some(part) = new_part {
            let mut new_parts = current_variable_name.parts.clone();
            new_parts.push(part);
            self.current_variable_name = Some(ScopedVariableReference::new(
              current_variable_name.id.clone(),
              new_parts,
            ));
            prop.visit_mut_with(self);
            self.current_variable_name = Some(current_variable_name.clone());
            continue;
          }
        }
      }
      props_or_spread.visit_mut_with(self);
    }
  }

  // Visit JSX expressions for css prop support
  fn visit_mut_jsx_opening_element(&mut self, n: &mut JSXOpeningElement) {
    if !self.yak_imports().is_using_next_yak() {
      return;
    }
    let css_prop = n.has_css_prop();
    if let Some(css_prop) = css_prop {
      let previous_inside_css_attribute = self.inside_element_with_css_attribute;
      self.inside_element_with_css_attribute = true;
      n.visit_mut_children_with(self);
      self.inside_element_with_css_attribute = previous_inside_css_attribute;
      css_prop.transform(
        n,
        &self
          .yak_library_imports
          .as_mut()
          .unwrap()
          .get_yak_utility_ident("mergeCssProp"),
      );
    }
  }

  // Visit ternary expressions
  // To store the current condition which can be used for class names of nested css expressions
  fn visit_mut_expr(&mut self, n: &mut Expr) {
    // Visiting a constant mixin expression e.g.:
    // const highlight = css`color: red;`
    // const Button = styled.button`${({$active}) => $active && highlight};`
    if self.is_inside_css_expression() {
      if let Some(scoped_name) = extract_ident_and_parts(n) {
        if let Some(constant_value) = self.variables.get_const_value(&scoped_name) {
          if let Expr::TaggedTpl(tpl) = *constant_value {
            if is_valid_tagged_tpl(&tpl, self.yak_imports().yak_css_idents()) {
              let replacement_before = self.expression_replacement.clone();
              let tpl = &mut tpl.clone();
              tpl.span = n.span();
              self.visit_mut_tagged_tpl(tpl);
              if let Some(replacement) = self.expression_replacement.clone() {
                *n = *replacement;
              }
              self.expression_replacement = replacement_before;
            }
          }
        }
      }
    }
    // Transform tagged template literals
    // e.g. styled.button`color: red;`
    if let Expr::TaggedTpl(tpl) = n {
      let replacement_before = self.expression_replacement.clone();
      self.visit_mut_tagged_tpl(tpl);
      if let Some(replacement) = self.expression_replacement.clone() {
        *n = *replacement;
      }
      self.expression_replacement = replacement_before;
    }
    // Store the current conditions so they can be used to name nested css expressions
    // e.g. const Button = styled.button`${({$active}) => $active && css`...`}` -> Button__active
    else if self.is_inside_css_expression() {
      match n {
        Expr::Cond(cond) => {
          cond.test.visit_mut_with(self);

          // Push condition for the consequent
          self
            .current_condition
            .push(condition_to_string(&cond.test, false));
          cond.cons.visit_mut_with(self);
          self.current_condition.pop();

          // Push negated condition for the alternate
          self
            .current_condition
            .push(condition_to_string(&cond.test, true));
          cond.alt.visit_mut_with(self);
          self.current_condition.pop();
        }
        Expr::Bin(bin @ BinExpr { op: op!("&&"), .. }) => {
          bin.left.visit_mut_with(self);

          // Push condition for right side
          self
            .current_condition
            .push(condition_to_string(&bin.left, false));
          bin.right.visit_mut_with(self);
          self.current_condition.pop();
        }
        Expr::Bin(bin @ BinExpr { op: op!("||"), .. }) => {
          bin.left.visit_mut_with(self);

          // Push negated condition for right side
          self
            .current_condition
            .push(condition_to_string(&bin.left, true));
          bin.right.visit_mut_with(self);
          self.current_condition.pop();
        }
        _ => n.visit_mut_children_with(self),
      }
    } else {
      n.visit_mut_children_with(self);
    }
  }

  /// Visit tagged template literals
  /// This is where the css-in-js expressions are
  fn visit_mut_tagged_tpl(&mut self, n: &mut TaggedTpl) {
    let Some(yak_library_function_name) = self
      .yak_library_imports
      .as_ref()
      .unwrap()
      .get_yak_library_function_name(n)
    else {
      n.visit_mut_children_with(self);
      return;
    };

    let is_top_level = !self.is_inside_css_expression();
    let current_variable_id = self.get_current_component_id();

    let mut transform: Box<dyn YakTransform> = match yak_library_function_name.deref() {
      // Styled Components transform works only on top level
      "styled" if is_top_level => Box::new(TransformStyled::new(
        &mut self.naming_convention,
        current_variable_id.clone(),
        self.display_names,
      )),
      // Keyframes transform works only on top level
      "keyframes" if is_top_level => Box::new(TransformKeyframes::with_animation_name(
        self
          .variable_name_selector_mapping
          .get(&current_variable_id)
          .map(|s| s.to_string())
          .unwrap_or_else(|| {
            self
              .naming_convention
              .get_keyframe_name(&current_variable_id.to_readable_string())
          }),
      )),
      // CSS Mixin e.g. const highlight = css`color: red;`
      "css" if is_top_level => Box::new(TransformCssMixin::new(
        &mut self.naming_convention,
        current_variable_id.clone(),
        self.current_exported,
        self.inside_element_with_css_attribute,
      )),
      // CSS Inline mixin e.g. styled.button`${() => css`color: red;`}`
      "css" => Box::new(TransformNestedCss::new(
        &mut self.naming_convention,
        &current_variable_id,
        self.current_condition.clone(),
      )),
      _ => {
        if !is_top_level {
          HANDLER.with(|handler| {
            handler
              .struct_span_err(
                n.span,
                "Only css template literals can be nested inside other css template literals",
              )
              .emit();
          });
          return;
        }
        panic!(
          "Invalid context for next-yak function {:?}",
          yak_library_function_name
        )
      }
    };

    // Current css parser state to parse an incomplete css code from a quasi
    // In css-in-js the outer css scope is missing e.g.:
    // styled.button`color: red;` => .button { color: red; }
    //
    // Depending on the library function used (styled, keyframes, css, ...)
    // a surrounding scope is added
    let css_state = Some(transform.create_css_state(self.current_css_state.clone()));

    if let Some(css_reference_name) = transform.get_css_reference_name() {
      self
        .variable_name_selector_mapping
        .insert(current_variable_id, css_reference_name);
    }

    let (runtime_expressions, runtime_css_variables) =
      self.process_yak_literal(n, css_state.clone());

    let transform_result = transform.transform_expression(
      n,
      runtime_expressions,
      &self.current_declaration,
      runtime_css_variables,
      self.yak_library_imports.as_mut().unwrap(),
    );

    if is_top_level {
      self.current_declaration = vec![];
    }
    let css_code = to_css(&transform_result.css.declarations);
    let result_span = transform_result.expression.span();
    if !css_code.is_empty() && is_top_level {
      if let Some(comment_prefix) = transform_result.css.comment_prefix.clone() {
        self.comments.add_leading(
          result_span.lo,
          Comment {
            kind: swc_core::common::comments::CommentKind::Block,
            span: DUMMY_SP,
            text: format!("{}\n{}\n", comment_prefix, css_code.trim()).into(),
          },
        );
      }
    }
    self.comments.add_leading(result_span.lo, pure_annotation());
    self.expression_replacement = Some(transform_result.expression);
  }

  /// Report nested atom calls as an error
  /// e.g. const Button = styled.button`&:hover { ${atoms("flex")} }`
  fn visit_mut_call_expr(&mut self, n: &mut CallExpr) {
    if self.is_inside_css_expression() {
      if let Some(css_state) = self.current_css_state.clone() {
        if css_state.current_scopes.len() > 1
          && css_state.current_comment_state == CommentStateType::None
        {
          if let Callee::Expr(callee) = &n.callee {
            if let Expr::Ident(ident) = &**callee {
              if self
                .yak_library_imports
                .as_mut()
                .unwrap()
                .get_yak_library_name_for_ident(&ident.to_id())
                == Some(atom!("atoms"))
              {
                HANDLER.with(|handler| {
                  handler
                    .struct_span_err(
                      n.span,
                      "atoms() must not be used inside selectors or media query",
                    )
                    .emit();
                });
              }
            }
          }
        }
      }
    }
    n.visit_mut_children_with(self);
  }
}

/// Converts an expression to a string
fn condition_to_string(expr: &Expr, negate: bool) -> String {
  let prefix = if negate { "not_" } else { "" };
  match expr {
    Expr::Ident(Ident { sym, .. }) => format!("{}{}", prefix, sym),
    Expr::Lit(Lit::Bool(Bool { value, .. })) => format!("{}{}", prefix, value),
    Expr::Member(MemberExpr { obj, prop, .. }) => {
      let obj = condition_to_string(obj, false);
      let prop = match prop {
        MemberProp::Ident(IdentName { sym, .. }) => sym.to_string(),
        _ => "".to_string(),
      };
      if prop.is_empty() || obj.is_empty() {
        return "".to_string();
      }
      format!("{}.{}", obj, prop)
    }
    _ => "".to_string(),
  }
}

/// Adds the `#__PURE__` comment for minifiers
/// to remove the function call if it's not used
fn pure_annotation() -> Comment {
  Comment {
    kind: swc_core::common::comments::CommentKind::Block,
    span: DUMMY_SP,
    text: "#__PURE__".to_string().into(),
  }
}

/// Extracts the leading css unit from a css code
/// Use a heuristic to determine if the unit is a valid css unit by checking the length
fn extract_leading_css_unit(css: &str) -> Option<&str> {
  let end = css
    .find(|c: char| !c.is_alphabetic() && c != '%')
    .unwrap_or(css.len());
  if end > 0 && end <= 4 {
    let unit = &css[..end];
    return Some(unit);
  }
  None
}

/// Validates expressions used in CSS property values.
/// Currently only allows arrow functions for dynamic values to make runtime behavior explicit.
fn verify_valid_property_value_expr(expr: &Expr) -> bool {
  match expr {
    // Allow arrow functions - this is the preferred format
    // e.g. styled.button`left: ${({$x}) => $x}px;`
    Expr::Arrow(_) => true,

    // For all other expression types, show an error explaining the requirement
    _ => {
      HANDLER.with(|handler| {
              handler
                  .struct_span_err(
                      expr.span(),
                      "Dynamic values in CSS properties must be wrapped in arrow functions to make runtime behavior explicit.\n\
                       Example: ${() => getValue()} instead of ${getValue()}"
                  )
                  .emit();
          });
      false
    }
  }
}

#[plugin_transform]
pub fn process_transform(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
  let config: Config = serde_json::from_str(
    &metadata
      .get_transform_plugin_config()
      .expect("failed to get plugin config for swc-yak"),
  )
  .expect("failed to parse plugin swc-yak config");

  let filename = metadata
    .get_context(&TransformPluginMetadataContextKind::Filename)
    .expect("failed to get filename");

  // *.yak.ts and *.yak.tsx files follow different rules
  // see yak_file_visitor.rs
  if is_yak_file(&filename) {
    return program.apply(visit_mut_pass(&mut YakFileVisitor::new()));
  }

  // Get a relative posix path to generate always the same hash
  // on different machines or operating systems
  let deterministic_path = relative_posix_path::relative_posix_path(&config.base_path, &filename);
  program.apply(visit_mut_pass(&mut TransformVisitor::new(
    metadata.comments,
    deterministic_path,
    config.dev_mode,
    config.prefix,
    config.display_names,
  )))
}

fn is_yak_file(filename: &str) -> bool {
  // Ignore the valid case of a file with only 7 characters
  // as it would have only an extension and no filename
  if filename.len() < 8 {
    return false;
  }
  matches!(
    &filename[filename.len() - 8..],
    ".yak.tsx" | ".yak.jsx" | ".yak.mjs"
  ) || matches!(&filename[filename.len() - 7..], ".yak.ts" | ".yak.js")
}

#[cfg(test)]
mod tests {
  use super::*;
  use std::path::PathBuf;
  use swc_core::ecma::{
    transforms::testing::{test_fixture, test_transform},
    visit::visit_mut_pass,
  };
  use swc_ecma_parser::{Syntax, TsSyntax};
  use swc_ecma_transforms_testing::FixtureTestConfig;

  #[testing::fixture("tests/fixture/**/input.tsx")]
  fn fixture_dev(input: PathBuf) {
    test_fixture(
      Syntax::Typescript(TsSyntax {
        tsx: true,
        ..Default::default()
      }),
      &|tester| {
        visit_mut_pass(TransformVisitor::new(
          Some(tester.comments.clone()),
          "path/input.tsx",
          true,
          None,
          true,
        ))
      },
      &input,
      &input.with_file_name("output.dev.tsx"),
      FixtureTestConfig {
        module: None,
        sourcemap: false,
        allow_error: true,
      },
    )
  }

  #[testing::fixture("tests/fixture/**/input.tsx")]
  fn fixture_prod(input: PathBuf) {
    test_fixture(
      Syntax::Typescript(TsSyntax {
        tsx: true,
        ..Default::default()
      }),
      &|tester| {
        visit_mut_pass(TransformVisitor::new(
          Some(tester.comments.clone()),
          "path/input.tsx",
          false,
          None,
          false,
        ))
      },
      &input,
      &input.with_file_name("output.prod.tsx"),
      FixtureTestConfig {
        module: None,
        sourcemap: false,
        allow_error: true,
      },
    )
  }

  #[testing::fixture("tests/fixture/**/input.yak.tsx")]
  fn fixture_yak(input: PathBuf) {
    test_fixture(
      Syntax::Typescript(TsSyntax {
        tsx: true,
        ..Default::default()
      }),
      &|_| visit_mut_pass(YakFileVisitor::new()),
      &input,
      &input.with_file_name("output.yak.tsx"),
      FixtureTestConfig {
        module: None,
        sourcemap: false,
        allow_error: true,
      },
    )
  }

  #[test]
  fn test_condition_to_string() {
    struct TestVisitor {}
    impl TestVisitor {
      fn new() -> Self {
        Self {}
      }
    }
    impl VisitMut for TestVisitor {
      fn visit_mut_expr(&mut self, n: &mut Expr) {
        *n = Expr::Lit(Lit::Str(Str {
          span: DUMMY_SP,
          value: condition_to_string(&n.clone(), false).into(),
          raw: None,
        }));
      }
    }

    test_transform(
      Default::default(),
      Some(false),
      |_| visit_mut_pass(TestVisitor::new()),
      "member.example.test",
      "\"member.example.test\"",
    );

    test_transform(
      Default::default(),
      Some(false),
      |_| visit_mut_pass(TestVisitor::new()),
      "fooBar",
      "\"fooBar\"",
    );
  }

  #[test]
  fn test_extract_leading_css_unit() {
    assert_eq!(extract_leading_css_unit("px "), Some("px"));
    assert_eq!(extract_leading_css_unit("px;"), Some("px"));
    assert_eq!(extract_leading_css_unit("px}"), Some("px"));
    assert_eq!(extract_leading_css_unit("px"), Some("px"));
    assert_eq!(extract_leading_css_unit(" px"), None);
    assert_eq!(extract_leading_css_unit("1px"), None);
    assert_eq!(extract_leading_css_unit("color"), None);
  }
}

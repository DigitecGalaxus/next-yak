use rustc_hash::FxHashMap;
use swc_core::atoms::Wtf8Atom;
use swc_core::ecma::visit::{Fold, VisitMutWith};
use swc_core::ecma::{ast::*, visit::VisitMut};

use crate::utils::cross_file_selectors::ImportKind;

#[derive(PartialEq, Debug, Clone)]
#[repr(u8)]
pub enum ImportSourceType {
  /// Imports from normal typescript files
  /// Normal files are only statically analyzed
  Normal = 0,
  /// Imports from *.yak.ts or *.yak.tsx files
  /// Yak files are executed during the build process
  Yak = 1,
}

#[derive(Debug)]
/// Visitor implementation to gather all variable declarations
/// and their values from the AST
pub struct VariableVisitor {
  variables: FxHashMap<Id, Box<Expr>>,
  imports: FxHashMap<Id, ImportKind>,
  default_export: Option<ScopedVariableReference>,
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
/// ScopedVariableReference stores the swc reference name to
/// - a variable e.g. foo -> (foo#3, [foo])
/// - a member expression e.g. foo.bar -> (foo#3, [foo, bar])
pub struct ScopedVariableReference {
  /// The swc id of the variable
  pub id: Id,
  /// The parts of the variable reference
  /// - e.g. foo.bar.baz -> [foo, bar, baz]
  /// - e.g. foo -> [foo]
  pub parts: Vec<Wtf8Atom>,
}
impl ScopedVariableReference {
  pub fn new(id: Id, parts: Vec<Wtf8Atom>) -> Self {
    Self { id, parts }
  }
  pub fn to_readable_string(&self) -> String {
    self
      .parts
      .iter()
      .map(|atom| atom.to_string_lossy())
      .collect::<Vec<_>>()
      .join(".")
  }

  pub fn last_part(&self) -> Wtf8Atom {
    // We don't expect `parts` to be empty in normal code
    self
      .parts
      .last()
      .cloned()
      .unwrap_or_else(|| self.id.0.as_ref().into())
  }
}

impl VariableVisitor {
  pub fn new() -> Self {
    Self {
      variables: FxHashMap::default(),
      imports: FxHashMap::default(),
      default_export: None,
    }
  }

  /// Try to get a constant value for a variable id
  /// Supports normal constant values, object properties and array elements
  /// e.g. get_const_value(("primary#0", vec!["primary".into(), "red".into()]))
  pub fn get_const_value(&self, scoped_name: &ScopedVariableReference) -> Option<Box<Expr>> {
    if let Some(expr) = self.variables.get(&scoped_name.id) {
      // Start with the initial expression
      let mut current_expr: &Expr = expr;
      // Iterate over the parts (skipping the first one as it's the variable name)
      for part in scoped_name.parts.iter().skip(1) {
        match current_expr {
          Expr::Object(obj) => {
            // For object expressions, look for a property with matching key
            if let Some(prop) = obj.props.iter().find_map(|prop| match prop {
              PropOrSpread::Prop(prop) => match &**prop {
                Prop::KeyValue(kv) => match &kv.key {
                  // Regular identifiers like e.g. foo.bar
                  PropName::Ident(ident) if Wtf8Atom::from(ident.sym.as_str()) == *part => {
                    Some(&kv.value)
                  }
                  // String literals like e.g. foo["bar"]
                  PropName::Str(str_lit) if str_lit.value == *part => Some(&kv.value),
                  // Numeric literals like e.g. foo[1]
                  PropName::Num(num_lit) => match part.as_str() {
                    Some(part_str) if num_lit.value.to_string() == part_str => Some(&kv.value),
                    _ => None,
                  },
                  _ => None,
                },
                _ => None,
              },
              _ => None,
            }) {
              current_expr = prop;
            } else {
              return None; // Property not found
            }
          }
          Expr::Array(arr) => {
            // For array expressions, try to parse the part as an index
            if let Some(part) = part.as_str() {
              if let Ok(index) = part.parse::<usize>() {
                if let Some(Some(elem)) = arr.elems.get(index) {
                  if elem.spread.is_some() {
                    return None; // Spread operator not supported
                  }
                  current_expr = &elem.expr;
                } else {
                  return None;
                }
              } else {
                return None;
              }
            } else {
              return None;
            }
          } // Unsupported expression type
          _ => return None,
        }
      }
      // After traversing all parts, return the final expression
      Some(Box::new(current_expr.clone()))
    } else {
      None // Variable not found
    }
  }

  /// Returns the source of an imported variable if it exists
  pub fn get_imported_variable(&mut self, name: &Id) -> Option<(ImportSourceType, &ImportKind)> {
    if let Some(src) = self.imports.get(name) {
      if let Some(import_src) = src.import_source().as_str() {
        let source_type = if import_src.ends_with(".yak")
          || import_src.ends_with(".yak.js")
          || import_src.ends_with(".yak.mjs")
        {
          ImportSourceType::Yak
        } else {
          ImportSourceType::Normal
        };
        return Some((source_type, src));
      }
    }
    None
  }

  pub fn get_default_export(&self) -> Option<ScopedVariableReference> {
    self.default_export.clone()
  }
}

impl Fold for VariableVisitor {}

impl VisitMut for VariableVisitor {
  /// Visit export default expressions to store the variable name
  fn visit_mut_export_default_expr(&mut self, n: &mut ExportDefaultExpr) {
    match n.expr.as_ref() {
      Expr::Ident(ident) => {
        self.default_export = Some(ScopedVariableReference::new(
          ident.to_id(),
          vec![ident.sym.clone().into()],
        ));
      }
      _ => {}
    }
    n.visit_mut_children_with(self);
  }
  /// Scans the AST for variable declarations and extracts the variable names
  fn visit_mut_var_decl(&mut self, var: &mut VarDecl) {
    var.decls.iter_mut().for_each(|decl| {
      if let Pat::Ident(ident) = &decl.name {
        if let Some(init) = &decl.init {
          self.variables.insert(ident.to_id(), init.clone());
        }
      }
    });
    var.visit_mut_children_with(self);
  }
  /// Scans the AST for import declarations and extracts the imported names
  fn visit_mut_import_decl(&mut self, import: &mut ImportDecl) {
    let import_source = import.src.value.to_owned();
    import.specifiers.iter_mut().for_each(|specifier| {
      match specifier {
        // Named imports: import { foo, bar } from "./module"
        ImportSpecifier::Named(named) => {
          let local_name = named.local.to_id();
          let external_name = named
            .imported
            .as_ref()
            .map(|imported| match imported {
              ModuleExportName::Ident(ident) => Some(Wtf8Atom::from(ident.sym.clone())),
              ModuleExportName::Str(str_lit) => {
                Some(Wtf8Atom::from(str_lit.value.to_atom_lossy().into_owned()))
              }
              #[cfg(swc_ast_unknown)]
              _ => None,
            })
            .unwrap_or_else(|| Some(Wtf8Atom::from(local_name.0.clone())));

          if let Some(external_name) = external_name {
            self.imports.insert(
              local_name.clone(),
              ImportKind::Named {
                external_name,
                import_source: import_source.clone(),
              },
            );
          }
        }
        // Namespace imports: import * as ns from "./module"
        ImportSpecifier::Namespace(namespace) => {
          self.imports.insert(
            namespace.local.to_id(),
            ImportKind::Namespace {
              import_source: import_source.clone(),
            },
          );
        }
        // Default imports: import defaultExport from "./module"
        ImportSpecifier::Default(default) => {
          self.imports.insert(
            default.local.to_id(),
            ImportKind::Default {
              import_source: import_source.clone(),
            },
          );
        }
        #[cfg(swc_ast_unknown)]
        _ => {}
      }
    });
    import.visit_mut_children_with(self);
  }
  /// Ignores function declarations (for speed)
  fn visit_mut_fn_decl(&mut self, _: &mut FnDecl) {}

  /// Ignores class declarations (for spee d)
  fn visit_mut_class_decl(&mut self, _: &mut ClassDecl) {}

  /// Ignores function expressions (for spee d)
  fn visit_mut_fn_expr(&mut self, _: &mut FnExpr) {}

  /// Ignores arrow functions (for speed)
  fn visit_mut_arrow_expr(&mut self, _: &mut ArrowExpr) {}

  /// Ignores if statements (for speed)
  fn visit_mut_if_stmt(&mut self, _: &mut IfStmt) {}
}

#[cfg(test)]
mod tests {
  use super::*;
  use swc_core::atoms::Atom;
  use swc_core::ecma::transforms::testing::test_transform;
  use swc_core::{atoms::atom, common::SyntaxContext, ecma::visit::visit_mut_pass};

  fn get_expr_value(expr: &Expr) -> Option<String> {
    match expr {
      Expr::Lit(Lit::Str(str)) => match str.value.as_str() {
        Some(value) => Some(value.into()),
        None => None,
      },
      Expr::Lit(Lit::Num(num)) => Some(num.value.to_string()),
      _ => None,
    }
  }

  #[test]
  fn test_import_visitor() {
    let mut visitor = VariableVisitor::new();
    let code = r#"
    import { primary } from "./theme";
    import { mixin } from "./constants.yak";
    const duration = 34;
    export function run(primary = "red") {
      console.log(primary, duration, mixin);
    }
    "#;
    test_transform(
      Default::default(),
      Some(true),
      |_| visit_mut_pass(&mut visitor),
      code,
      code,
    );

    // Check primary import
    let primary_id = Id::from(("primary".into(), SyntaxContext::from_u32(0)));
    let primary = visitor.get_imported_variable(&primary_id);
    assert!(primary.is_some());
    let (source_type, import_kind) = primary.unwrap();
    assert_eq!(source_type, ImportSourceType::Normal);
    assert_eq!(import_kind.import_source().as_str(), "./theme".into());

    // Check mixin import
    let mixin_id = Id::from(("mixin".into(), SyntaxContext::from_u32(0)));
    let mixin = visitor.get_imported_variable(&mixin_id);
    assert!(mixin.is_some());
    let (source_type, import_kind) = mixin.unwrap();
    assert_eq!(source_type, ImportSourceType::Yak);
    assert_eq!(
      import_kind.import_source().as_str(),
      "./constants.yak".into()
    );

    // Check duration constant
    let duration = get_expr_value(
      &visitor
        .get_const_value(&ScopedVariableReference::new(
          Id::from(("duration".into(), SyntaxContext::from_u32(0))),
          vec!["duration".into()],
        ))
        .unwrap(),
    );
    assert_eq!(duration, Some("34".to_string()));
  }

  #[test]
  fn test_get_const_value_with_parts() {
    let mut visitor = VariableVisitor::new();
    let code = r#"
      const obj = {
        prop1: {
          nestedProp: "fancy"
        },
        prop2: [1, 2, 3]
      };
      "#;
    test_transform(
      Default::default(),
      Some(true),
      |_| visit_mut_pass(&mut visitor),
      code,
      code,
    );
    // Test accessing a nested property
    let nested_value = get_expr_value(
      &visitor
        .get_const_value(&ScopedVariableReference::new(
          Id::from(("obj".into(), SyntaxContext::from_u32(0))),
          vec!["obj".into(), "prop1".into(), "nestedProp".into()],
        ))
        .unwrap(),
    );
    assert_eq!(nested_value, Some("fancy".to_string()));
    // Test accessing an array element
    let array_elem = &visitor.get_const_value(&ScopedVariableReference::new(
      Id::from(("obj".into(), SyntaxContext::from_u32(0))),
      vec!["obj".into(), "prop2".into(), "1".into()],
    ));
    let array_value = get_expr_value(array_elem.as_ref().unwrap());
    assert_eq!(array_value, Some("2".to_string()));
  }

  #[test]
  fn test_last_part_normal() {
    let i = ScopedVariableReference::new(
      Id::from(("f".into(), SyntaxContext::empty())),
      vec!["g".into(), "h".into()],
    );
    assert_eq!(i.last_part(), Wtf8Atom::from("h"));
  }

  #[test]
  fn test_last_part_zero_parts() {
    let i = ScopedVariableReference::new(Id::from(("f".into(), SyntaxContext::empty())), vec![]);
    assert_eq!(i.last_part(), Wtf8Atom::from("f"));
  }

  #[test]
  fn test_different_import_types() {
    let mut visitor = VariableVisitor::new();
    let code = r#"
      import defaultExport from "./default-module";
      import * as namespace from "./namespace-module";
      import { named1, named2 as aliased } from "./named-module";
      import { yak1 } from "./yak-module.yak";
      import { yak2 } from "./yak-module.yak.js";
      import { yak3 } from "./yak-module.yak.mjs";
      "#;

    test_transform(
      Default::default(),
      Some(true),
      |_| visit_mut_pass(&mut visitor),
      code,
      code,
    );

    // Test default import
    let default_id = Id::from((("defaultExport").into(), SyntaxContext::from_u32(0)));
    let default_import = visitor.get_imported_variable(&default_id).unwrap();
    assert_eq!(default_import.0, ImportSourceType::Normal);
    assert!(matches!(default_import.1, ImportKind::Default { .. }));
    assert_eq!(
      default_import.1.import_source().as_str(),
      "./default-module".into()
    );

    // Test namespace import
    let namespace_id = Id::from((("namespace").into(), SyntaxContext::from_u32(0)));
    let namespace_import = visitor.get_imported_variable(&namespace_id).unwrap();
    assert_eq!(namespace_import.0, ImportSourceType::Normal);
    assert!(matches!(namespace_import.1, ImportKind::Namespace { .. }));
    assert_eq!(
      namespace_import.1.import_source().as_str(),
      "./namespace-module".into()
    );

    // Test named import
    let named_id = Id::from((("named1").into(), SyntaxContext::from_u32(0)));
    let named_import = visitor.get_imported_variable(&named_id).unwrap();
    assert_eq!(named_import.0, ImportSourceType::Normal);
    assert!(matches!(named_import.1, ImportKind::Named { .. }));
    assert_eq!(
      named_import.1.import_source().as_str(),
      "./named-module".into()
    );

    // Test aliased import
    let alias_id = Id::from((("aliased").into(), SyntaxContext::from_u32(0)));
    let alias_import = visitor.get_imported_variable(&alias_id).unwrap();
    assert_eq!(alias_import.0, ImportSourceType::Normal);
    if let ImportKind::Named { external_name, .. } = alias_import.1 {
      assert_eq!(external_name.as_str(), "named2".into());
    } else {
      panic!("Expected Named import");
    }

    // Test different Yak import file extensions
    let yak_exts = [
      ("yak1", "./yak-module.yak"),
      ("yak2", "./yak-module.yak.js"),
      ("yak3", "./yak-module.yak.mjs"),
    ];

    for (name, path) in yak_exts {
      let yak_id = Id::from((Atom::from(name), SyntaxContext::from_u32(0)));
      let yak_import = visitor.get_imported_variable(&yak_id).unwrap();
      assert_eq!(yak_import.0, ImportSourceType::Yak);
      assert_eq!(yak_import.1.import_source().to_string_lossy(), path);
    }
  }

  #[test]
  fn test_complex_variable_assignments() {
    let mut visitor = VariableVisitor::new();
    let code = r#"
      const simpleVar = "simple";
      const numberVar = 42;
      const boolVar = true;
      const objVar = {
        a: "a",
        b: {
          c: "nested",
          d: [1, 2, { key: "value" }]
        }
      };
      const arrVar = [
        "string",
        123,
        { prop: "object in array" },
        ["nested", "array"]
      ];
      "#;

    test_transform(
      Default::default(),
      Some(true),
      |_| visit_mut_pass(&mut visitor),
      code,
      code,
    );

    // Test simple variable
    let simple_value = get_expr_value(
      &visitor
        .get_const_value(&ScopedVariableReference::new(
          Id::from(("simpleVar".into(), SyntaxContext::from_u32(0))),
          vec!["simpleVar".into()],
        ))
        .unwrap(),
    );
    assert_eq!(simple_value, Some("simple".to_string()));

    // Test deeply nested object property
    let nested_value = get_expr_value(
      &visitor
        .get_const_value(&ScopedVariableReference::new(
          Id::from((("objVar").into(), SyntaxContext::from_u32(0))),
          vec![("objVar").into(), ("b").into(), ("c").into()],
        ))
        .unwrap(),
    );
    assert_eq!(nested_value, Some("nested".to_string()));

    // Test array inside object
    let array_in_obj_value = get_expr_value(
      &visitor
        .get_const_value(&ScopedVariableReference::new(
          Id::from((("objVar").into(), SyntaxContext::from_u32(0))),
          vec![
            atom!("objVar").into(),
            atom!("b").into(),
            atom!("d").into(),
            atom!("0").into(),
          ],
        ))
        .unwrap(),
    );
    assert_eq!(array_in_obj_value, Some("1".to_string()));

    // Test object inside array
    let obj_in_array_value = get_expr_value(
      &visitor
        .get_const_value(&ScopedVariableReference::new(
          Id::from((("arrVar").into(), SyntaxContext::from_u32(0))),
          vec![
            atom!("arrVar").into(),
            atom!("2").into(),
            atom!("prop").into(),
          ],
        ))
        .unwrap(),
    );
    assert_eq!(obj_in_array_value, Some("object in array".to_string()));

    // Test nested array
    let nested_array_value = get_expr_value(
      &visitor
        .get_const_value(&ScopedVariableReference::new(
          Id::from((("arrVar").into(), SyntaxContext::from_u32(0))),
          vec!["arrVar".into(), "3".into(), "0".into()],
        ))
        .unwrap(),
    );
    assert_eq!(nested_array_value, Some("nested".to_string()));
  }

  #[test]
  fn test_scoped_variable_reference_to_string() {
    let simple_ref = ScopedVariableReference::new(
      Id::from((("variable").into(), SyntaxContext::empty())),
      vec!["variable".into()],
    );
    assert_eq!(simple_ref.to_readable_string(), "variable");

    let complex_ref = ScopedVariableReference::new(
      Id::from((("obj").into(), SyntaxContext::empty())),
      vec![
        "obj".into(),
        "nested".into(),
        "deep".into(),
        "property".into(),
      ],
    );
    assert_eq!(complex_ref.to_readable_string(), "obj.nested.deep.property");
  }

  #[test]
  fn test_get_imported_variable_not_found() {
    let mut visitor = VariableVisitor::new();
    let code = "const x = 5;"; // No imports

    test_transform(
      Default::default(),
      Some(true),
      |_| visit_mut_pass(&mut visitor),
      code,
      code,
    );

    let non_existent_id = Id::from((("nonExistent").into(), SyntaxContext::from_u32(0)));
    let result = visitor.get_imported_variable(&non_existent_id);
    assert!(result.is_none());
  }

  #[test]
  fn test_get_const_value_not_found() {
    let visitor = VariableVisitor::new(); // Empty visitor

    let non_existent_ref = ScopedVariableReference::new(
      Id::from((("nonExistent").into(), SyntaxContext::from_u32(0))),
      vec!["nonExistent".into()],
    );

    let result = visitor.get_const_value(&non_existent_ref);
    assert!(result.is_none());
  }
}

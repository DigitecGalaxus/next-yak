use rustc_hash::FxHashMap;
use swc_core::atoms::Atom;
use swc_core::ecma::visit::{Fold, VisitMutWith};
use swc_core::ecma::{ast::*, visit::VisitMut};

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
  imports: FxHashMap<Id, Atom>,
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
  pub parts: Vec<Atom>,
}
impl ScopedVariableReference {
  pub fn new(id: Id, parts: Vec<Atom>) -> Self {
    Self { id, parts }
  }
  pub fn to_readable_string(&self) -> String {
    self
      .parts
      .iter()
      .map(|atom| atom.as_str())
      .collect::<Vec<&str>>()
      .join(".")
  }

  pub fn last_part(&self) -> &Atom {
    // We don't expect `parts` to be empty in normal code
    self.parts.last().unwrap_or(&self.id.0)
  }
}

impl VariableVisitor {
  pub fn new() -> Self {
    Self {
      variables: FxHashMap::default(),
      imports: FxHashMap::default(),
    }
  }

  /// Try to get a constant value for a variable id
  /// Supports normal constant values, object properties and array elements
  /// e.g. get_const_value(("primary#0", vec![atom!("primary"), atom!("red")]))
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
                  PropName::Ident(ident) if ident.sym == *part => Some(&kv.value),
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
            if let Ok(index) = part.to_string().parse::<usize>() {
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
  pub fn get_imported_variable(&mut self, name: &Id) -> Option<(ImportSourceType, String)> {
    if let Some(src) = self.imports.get(name) {
      let src = src.to_string();
      let source_type =
        if src.ends_with(".yak") || src.ends_with(".yak.js") || src.ends_with(".yak.mjs") {
          ImportSourceType::Yak
        } else {
          ImportSourceType::Normal
        };
      return Some((source_type, src.to_string()));
    }
    None
  }
}

impl Fold for VariableVisitor {}

impl VisitMut for VariableVisitor {
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
    import.specifiers.iter_mut().for_each(|specifier| {
      if let ImportSpecifier::Named(named) = specifier {
        self
          .imports
          .insert(named.local.to_id(), import.src.value.clone());
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
  use swc_core::common::SyntaxContext;
  use swc_core::ecma::atoms::atom;
  use swc_core::ecma::transforms::testing::test_transform;
  use swc_core::ecma::visit::visit_mut_pass;

  fn get_expr_value(expr: &Expr) -> Option<String> {
    match expr {
      Expr::Lit(Lit::Str(str)) => Some(str.value.to_string()),
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
    let primary = &visitor.get_imported_variable(&Id::from((
      Atom::from("primary"),
      SyntaxContext::from_u32(0),
    )));
    assert_eq!(
      *primary,
      Some((ImportSourceType::Normal, "./theme".to_string()))
    );
    let mixin =
      &visitor.get_imported_variable(&Id::from((Atom::from("mixin"), SyntaxContext::from_u32(0))));
    assert_eq!(
      *mixin,
      Some((ImportSourceType::Yak, "./constants.yak".to_string()))
    );
    let duration = get_expr_value(
      &visitor
        .get_const_value(&ScopedVariableReference::new(
          Id::from((Atom::from("duration"), SyntaxContext::from_u32(0))),
          vec![],
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
          Id::from((Atom::from("obj"), SyntaxContext::from_u32(0))),
          vec![atom!("obj"), atom!("prop1"), atom!("nestedProp")],
        ))
        .unwrap(),
    );

    assert_eq!(nested_value, Some("fancy".to_string()));

    // Test accessing an array element
    let array_elem = &visitor.get_const_value(&ScopedVariableReference::new(
      Id::from((Atom::from("obj"), SyntaxContext::from_u32(0))),
      vec![atom!("obj"), atom!("prop2"), atom!("1")],
    ));
    let array_value = get_expr_value(array_elem.as_ref().unwrap());
    assert_eq!(array_value, Some("2".to_string()));
  }

  #[test]
  fn test_last_part_normal() {
    let i = ScopedVariableReference::new(
      Id::from((Atom::from("f"), SyntaxContext::empty())),
      vec![atom!("g"), atom!("h")],
    );
    assert_eq!(i.last_part(), &atom!("h"));
  }

  #[test]
  fn test_last_part_zero_parts() {
    let i =
      ScopedVariableReference::new(Id::from((Atom::from("f"), SyntaxContext::empty())), vec![]);
    assert_eq!(i.last_part(), &atom!("f"));
  }
}

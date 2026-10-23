use swc_core::ecma::ast::*;

use crate::utils::ast_helper::{extract_ident_and_parts, unwrap_type_casts};
use crate::variable_visitor::VariableVisitor;

/// Try to evaluate a given expression
/// e.g. `2 + 3 * 4` will return `14`
/// e.g. `(1 + 2) ** 2` will return `9`
pub fn try_evaluate(expr: &Expr, variable_visitor: &VariableVisitor) -> Option<f64> {
  // See through TypeScript-only wrappers and parentheses so e.g.
  // `${(5 as const) * 2}` or `${someConst as number + 10}` evaluates statically.
  let expr = unwrap_type_casts(expr);
  match expr {
    Expr::Ident(_) | Expr::Member(_) => {
      // Don't report errors — try_evaluate is speculative. A non-static member
      // expression (e.g. SIZES[size]) just means it's not a compile-time constant,
      // and will be handled as a runtime expression by later branches.
      if let Some(scoped_variable_reference) = extract_ident_and_parts(expr, false) {
        let value = variable_visitor.get_const_value(&scoped_variable_reference);
        match value {
          Some(expr) => try_evaluate(&expr, variable_visitor),
          None => None,
        }
      } else {
        None
      }
    }
    // allow expressions like ${-14}
    Expr::Unary(unary_expr) => {
      let arg_value = try_evaluate(&unary_expr.arg, variable_visitor)?;
      match unary_expr.op {
        UnaryOp::Minus => Some(-arg_value),
        UnaryOp::Plus => Some(arg_value),
        _ => None,
      }
    }
    Expr::Lit(Lit::Num(num)) => Some(num.value),
    Expr::Bin(bin_expr) => {
      match (&*bin_expr.left, &*bin_expr.right) {
        (Expr::Bin(left_bin), right_expr) => {
          // The precedence helps to prioritize multiplication and divitions over
          // additions and subtractions
          let left_precedence = get_precedence(&left_bin.op);
          let current_precedence = get_precedence(&bin_expr.op);

          if left_precedence <= current_precedence {
            let left = try_evaluate(&bin_expr.left, variable_visitor)?;
            let right = try_evaluate(right_expr, variable_visitor)?;
            apply_op(&bin_expr.op, left, right)
          } else {
            // Need to evaluate the left binary expression first
            let left_result = apply_op(
              &left_bin.op,
              try_evaluate(&left_bin.left, variable_visitor)?,
              try_evaluate(&left_bin.right, variable_visitor)?,
            )?;
            let right = try_evaluate(right_expr, variable_visitor)?;
            apply_op(&bin_expr.op, left_result, right)
          }
        }
        _ => {
          // Simple case: evaluate left to right
          let left = try_evaluate(&bin_expr.left, variable_visitor)?;
          let right = try_evaluate(&bin_expr.right, variable_visitor)?;
          apply_op(&bin_expr.op, left, right)
        }
      }
    }
    _ => None,
  }
}

/// Format an evaluated number for css with at most 4 decimal places
/// e.g. `10 / 3` -> "3.3333", `120.0` -> "120"
pub fn format_number(value: f64) -> String {
  format!("{:.4}", value)
    .trim_end_matches('0')
    .trim_end_matches('.')
    .to_string()
}

/// Try to evaluate a given expression to a static string
/// e.g. `const GAP = "20px"; const NEGATIVE_GAP = \`-${GAP}\`;` -> "-20px"
/// e.g. `const GAP = 20; const HALF_NEGATIVE_GAP = \`-${GAP / 2}px\`;` -> "-10px"
///
/// Like try_evaluate it is speculative: anything that is not known at compile
/// time returns None, and the caller decides whether that is an error.
pub fn try_evaluate_string(expr: &Expr, variable_visitor: &VariableVisitor) -> Option<String> {
  let expr = unwrap_type_casts(expr);
  match expr {
    Expr::Lit(Lit::Str(str)) => str.value.as_str().map(|s| s.to_string()),
    Expr::Lit(Lit::Num(num)) => Some(num.value.to_string()),
    Expr::Ident(_) | Expr::Member(_) => {
      let scoped_variable_reference = extract_ident_and_parts(expr, false)?;
      let value = variable_visitor.get_const_value(&scoped_variable_reference)?;
      try_evaluate_string(&value, variable_visitor)
    }
    Expr::Tpl(tpl) => {
      let mut result = String::new();
      for (index, quasi) in tpl.quasis.iter().enumerate() {
        match &quasi.cooked {
          Some(cooked) => result.push_str(cooked.as_str()?),
          None => result.push_str(&quasi.raw),
        }
        if let Some(inner) = tpl.exprs.get(index) {
          // Math first: `${GAP / 2}` is a number, `${GAP}` may also be a string
          match try_evaluate(inner, variable_visitor) {
            Some(number) => result.push_str(&format_number(number)),
            None => result.push_str(&try_evaluate_string(inner, variable_visitor)?),
          }
        }
      }
      Some(result)
    }
    _ => None,
  }
}

fn get_precedence(op: &BinaryOp) -> u8 {
  match op {
    BinaryOp::Mul | BinaryOp::Div => 2,
    BinaryOp::Add | BinaryOp::Sub => 1,
    _ => 0,
  }
}

fn apply_op(op: &BinaryOp, left: f64, right: f64) -> Option<f64> {
  match op {
    BinaryOp::Add => Some(left + right),
    BinaryOp::Sub => Some(left - right),
    BinaryOp::Mul => Some(left * right),
    BinaryOp::Div => Some(left / right),
    BinaryOp::Exp => Some(left.powf(right)),
    _ => None,
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use swc_core::ecma::transforms::testing::test_transform;
  use swc_core::ecma::visit::visit_mut_pass;
  use swc_core::ecma::visit::Fold;
  use swc_core::ecma::visit::VisitMut;
  use swc_core::ecma::visit::VisitMutWith;

  #[derive(Debug)]
  pub struct TestVisitor {
    target_name: String,
    initializer: Option<Box<Expr>>,
    variables: VariableVisitor,
  }

  impl TestVisitor {
    pub fn new(target_name: &str) -> Self {
      Self {
        target_name: target_name.to_string(),
        initializer: None,
        variables: VariableVisitor::new(),
      }
    }

    pub fn get_variable_initializer(&self) -> Option<&Expr> {
      self.initializer.as_deref()
    }

    pub fn get_variable_visitor(&self) -> &VariableVisitor {
      &self.variables
    }
  }

  impl Fold for TestVisitor {}

  impl VisitMut for TestVisitor {
    fn visit_mut_program(&mut self, program: &mut Program) {
      let mut variable_visitor = VariableVisitor::new();
      program.visit_mut_children_with(&mut variable_visitor);
      self.variables = variable_visitor;
      program.visit_mut_children_with(self);
    }

    fn visit_mut_var_decl(&mut self, var: &mut VarDecl) {
      for decl in &var.decls {
        if let Pat::Ident(ident) = &decl.name {
          if ident.sym.as_ref() == self.target_name {
            if let Some(init) = &decl.init {
              self.initializer = Some(init.clone());
            }
          }
        }
      }
      var.visit_mut_children_with(self);
    }
  }

  #[test]
  fn test_operator_precedence() {
    let code = r#"
            const calc = 2 + 3 * 4;
        "#;
    let mut visitor = TestVisitor::new("calc");

    test_transform(
      Default::default(),
      Some(true),
      |_| visit_mut_pass(&mut visitor),
      code,
      code,
    );

    let expr = visitor.get_variable_initializer().unwrap();
    assert_eq!(
      try_evaluate(expr, visitor.get_variable_visitor()),
      Some(14.0)
    ); // Should be 2 + (3 * 4), not (2 + 3) * 4
  }

  #[test]
  fn test_complex_precedence() {
    let code = r#"
            const calc = 2 * 3 + 4 * 5;
        "#;
    let mut visitor = TestVisitor::new("calc");

    test_transform(
      Default::default(),
      Some(true),
      |_| visit_mut_pass(&mut visitor),
      code,
      code,
    );

    let expr = visitor.get_variable_initializer().unwrap();
    assert_eq!(
      try_evaluate(expr, visitor.get_variable_visitor()),
      Some(26.0)
    ); // Should be (2 * 3) + (4 * 5)
  }

  #[test]
  fn test_division_precedence() {
    let code = r#"
            const calc = 10 + 8 / 2;
        "#;
    let mut visitor = TestVisitor::new("calc");

    test_transform(
      Default::default(),
      Some(true),
      |_| visit_mut_pass(&mut visitor),
      code,
      code,
    );

    let expr = visitor.get_variable_initializer().unwrap();
    assert_eq!(
      try_evaluate(expr, visitor.get_variable_visitor()),
      Some(14.0)
    ); // Should be 10 + (8 / 2)
  }

  #[test]
  fn test_mixed_operations() {
    let code = r#"
            const calc = 2 * 3 + 4 / 2 - 1;
        "#;
    let mut visitor = TestVisitor::new("calc");

    test_transform(
      Default::default(),
      Some(true),
      |_| visit_mut_pass(&mut visitor),
      code,
      code,
    );

    let expr = visitor.get_variable_initializer().unwrap();
    assert_eq!(
      try_evaluate(expr, visitor.get_variable_visitor()),
      Some(7.0)
    ); // Should be (2 * 3) + (4 / 2) - 1
  }

  #[test]
  fn test_mixed_string_operations() {
    let code = r#"
            const calc = 2 * `3` + 4 / 2 - 1;
        "#;
    let mut visitor = TestVisitor::new("calc");

    test_transform(
      Default::default(),
      Some(true),
      |_| visit_mut_pass(&mut visitor),
      code,
      code,
    );

    let expr = visitor.get_variable_initializer().unwrap();
    assert_eq!(try_evaluate(expr, visitor.get_variable_visitor()), None);
  }

  #[test]
  fn test_parentheses_override_precedence() {
    let code = r#"
            const calc = (2 + 3) * 4;
        "#;
    let mut visitor = TestVisitor::new("calc");

    test_transform(
      Default::default(),
      Some(true),
      |_| visit_mut_pass(&mut visitor),
      code,
      code,
    );

    let expr = visitor.get_variable_initializer().unwrap();
    assert_eq!(
      try_evaluate(expr, visitor.get_variable_visitor()),
      Some(20.0)
    ); // Parentheses should override normal precedence
  }

  #[test]
  fn test_identifier_calculation() {
    let code = r#"
            const meaning_of_life = 42;
            const calc = meaning_of_life / 2;
        "#;
    let mut visitor = TestVisitor::new("calc");

    test_transform(
      Default::default(),
      Some(true),
      |_| visit_mut_pass(&mut visitor),
      code,
      code,
    );

    let expr = visitor.get_variable_initializer().unwrap();
    assert_eq!(
      try_evaluate(expr, visitor.get_variable_visitor()),
      Some(21.0)
    );
  }

  #[test]
  fn test_nested_identifier_calculation() {
    let code = r#"
            const addition = 2 + 3 + 1;
            const meaning_of_life = 42;
            const calc = meaning_of_life + addition / 2;
        "#;
    let mut visitor = TestVisitor::new("calc");

    test_transform(
      Default::default(),
      Some(true),
      |_| visit_mut_pass(&mut visitor),
      code,
      code,
    );

    let expr = visitor.get_variable_initializer().unwrap();
    assert_eq!(
      try_evaluate(expr, visitor.get_variable_visitor()),
      Some(45.0)
    );
  }

  #[test]
  fn test_imported_identifier_calculation() {
    let code = r#"
            import { addition } from "sth";
            const meaning_of_life = 42;
            const calc = meaning_of_life + addition / 2;
        "#;
    let mut visitor = TestVisitor::new("calc");

    test_transform(
      Default::default(),
      Some(true),
      |_| visit_mut_pass(&mut visitor),
      code,
      code,
    );

    let expr = visitor.get_variable_initializer().unwrap();
    assert_eq!(try_evaluate(expr, visitor.get_variable_visitor()), None);
  }

  #[test]
  fn test_member_expression_calculation() {
    let code = r#"
            const sizes = { small: 1, medium: 2, large: 3 };
            const meaning_of_life = 42;
            const calc = meaning_of_life * sizes.medium;
        "#;
    let mut visitor = TestVisitor::new("calc");

    test_transform(
      Default::default(),
      Some(true),
      |_| visit_mut_pass(&mut visitor),
      code,
      code,
    );

    let expr = visitor.get_variable_initializer().unwrap();
    assert_eq!(
      try_evaluate(expr, visitor.get_variable_visitor()),
      Some(84.0)
    );
  }

  fn evaluate_calc(code: &str) -> Option<f64> {
    let mut visitor = TestVisitor::new("calc");
    test_transform(
      Default::default(),
      Some(true),
      |_| visit_mut_pass(&mut visitor),
      code,
      code,
    );
    let expr = visitor.get_variable_initializer().unwrap();
    try_evaluate(expr, visitor.get_variable_visitor())
  }

  #[test]
  fn test_exponent_precedence() {
    // `**` binds tighter than `*`
    assert_eq!(evaluate_calc("const calc = 2 ** 3 * 2;"), Some(16.0));
    assert_eq!(evaluate_calc("const calc = 2 * 3 ** 2;"), Some(18.0));
  }

  #[test]
  fn test_exponent_right_associative() {
    // 2 ** (3 ** 2), not (2 ** 3) ** 2
    assert_eq!(evaluate_calc("const calc = 2 ** 3 ** 2;"), Some(512.0));
  }

  #[test]
  fn test_exponent_with_parentheses() {
    assert_eq!(evaluate_calc("const calc = (1 + 2) ** 2;"), Some(9.0));
  }
}

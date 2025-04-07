use swc_core::{
  common::{source_map::PURE_SP, SyntaxContext, DUMMY_SP},
  ecma::ast::*,
};

/// Adds a suffix to an expression
/// e.g: `({$foo}) => $foo` -> __yak_add_suffix_to_expr(({$foo}) => $foo, "-suffix")
pub fn add_suffix_to_expr(expr: Expr, helper: Ident, suffix: impl AsRef<str>) -> Expr {
  // Otherwise, replace the expression with a call to the utility function
  Expr::Call(CallExpr {
    span: PURE_SP,
    ctxt: SyntaxContext::empty(),
    callee: Callee::Expr(helper.into()),
    args: vec![
      expr.into(),
      Expr::Lit(Lit::Str(Str {
        span: DUMMY_SP,
        value: suffix.as_ref().into(),
        raw: None,
      }))
      .into(),
    ],
    type_args: None,
  })
}

//! Folds compiled `css(...)` expressions into static `className` string
//! concatenations, e.g. `css(() => on && css("b"), "a")` into
//! `"a" + (on ? " b" : "")`
//!
//! Shared by the css prop fold and the styled component JSX fold

use crate::utils::ast_helper::unwrap_type_casts;
use crate::yak_imports::YakImports;
use swc_core::{
  atoms::Wtf8Atom,
  common::{Span, Spanned, DUMMY_SP},
  ecma::ast::{
    ArrowExpr, BinExpr, BinaryOp, BlockStmtOrExpr, CallExpr, Callee, CondExpr, Expr, IdentName,
    JSXAttr, JSXAttrName, JSXAttrOrSpread, JSXAttrValue, JSXExpr, JSXExprContainer, Lit, Str,
  },
};

/// A conditional class name segment: the condition expression, the class name
/// for the truthy branch and an optional class name for the falsy branch
pub(crate) type ConditionSegment = (Box<Expr>, Wtf8Atom, Option<Wtf8Atom>);

/// Folds a compiled css expression into a className expression
/// Returns `None` if the expression is not statically foldable
pub(crate) fn fold_css_expr(expr: &Expr, yak_imports: &YakImports) -> Option<Box<Expr>> {
  match unwrap_type_casts(expr) {
    Expr::Call(call) => fold_css_call(call, yak_imports),
    Expr::Cond(cond) => {
      let cons = fold_css_branch(&cond.cons, yak_imports)?;
      let alt = fold_css_branch(&cond.alt, yak_imports)?;
      Some(Box::new(Expr::Cond(CondExpr {
        span: cond.span,
        test: cond.test.clone(),
        cons,
        alt,
      })))
    }
    // `cond && css("x")` folds to `cond ? "x" : ""`. There is no base class to
    // concatenate onto, so the class name carries no leading space.
    Expr::Bin(bin) if bin.op == BinaryOp::LogicalAnd => {
      let class_name = pure_static_css_class(&bin.right, yak_imports)?;
      // keep the span of the css call so the /*YAK Extracted CSS:*/ comment
      // (parsed by extractCss.ts) stays attached
      let css_call_span = unwrap_type_casts(&bin.right).span();
      Some(Box::new(Expr::Cond(CondExpr {
        span: css_call_span,
        test: bin.left.clone(),
        cons: str_expr(class_name),
        alt: str_expr("".into()),
      })))
    }
    _ => None,
  }
}

/// Folds one branch of a css prop ternary: either a foldable css expression or
/// a falsy value, which applies no styles and therefore yields no class name
fn fold_css_branch(expr: &Expr, yak_imports: &YakImports) -> Option<Box<Expr>> {
  if is_falsy_css_value(expr) {
    return Some(str_expr("".into()));
  }
  fold_css_expr(expr, yak_imports)
}

/// Matches the falsy css prop values `false`, `null` and `undefined`
/// e.g. `css={on ? css`...` : undefined}`
fn is_falsy_css_value(expr: &Expr) -> bool {
  match unwrap_type_casts(expr) {
    Expr::Lit(Lit::Null(_)) => true,
    Expr::Lit(Lit::Bool(bool_lit)) => !bool_lit.value,
    // a local binding named `undefined` would shadow the global, but the css
    // prop type only admits the real `undefined` here
    Expr::Ident(ident) => ident.sym == "undefined",
    _ => false,
  }
}

/// Folds one compiled `css(...)` call: one optional static class string plus
/// zero or more `() => cond && css("x")` or `() => cond ? css("x") : css("y")`
/// condition arrows
fn fold_css_call(call: &CallExpr, yak_imports: &YakImports) -> Option<Box<Expr>> {
  if !is_yak_css_callee(&call.callee, yak_imports) {
    return None;
  }
  let mut base: Option<Wtf8Atom> = None;
  let mut segments: Vec<ConditionSegment> = Vec::new();
  for arg in &call.args {
    if arg.spread.is_some() {
      return None;
    }
    match unwrap_type_casts(&arg.expr) {
      Expr::Lit(Lit::Str(class_name)) => {
        if base.is_some() {
          return None;
        }
        base = Some(class_name.value.clone());
      }
      Expr::Arrow(arrow) => segments.push(fold_condition_arrow(arrow, yak_imports)?),
      // dynamic values and mixin references are not foldable
      _ => return None,
    }
  }
  // an empty `css()` folds to an empty base `""`, so it can collapse into a
  // ternary arm instead of falling back to the runtime path
  let base = base.unwrap_or_else(|| "".into());
  // "base" + (cond1 ? " a" : "") + (cond2 ? " b" : " c") …
  let mut class_name_expr = str_expr(base);
  for segment in segments {
    class_name_expr = append_condition_segment(class_name_expr, segment);
  }
  // keep the span of the original css call so the /*YAK Extracted CSS:*/
  // comment (parsed by extractCss.ts) stays attached
  match &mut *class_name_expr {
    Expr::Lit(Lit::Str(class_name)) => class_name.span = call.span,
    Expr::Bin(bin) => bin.span = call.span,
    _ => {}
  }
  Some(class_name_expr)
}

/// Appends one conditional class name segment to a className expression:
/// `<expr> + (cond ? " a" : "")` or `<expr> + (cond ? " b" : " c")`
pub(crate) fn append_condition_segment(
  class_name_expr: Box<Expr>,
  (condition, cons_class, alt_class): ConditionSegment,
) -> Box<Expr> {
  let alt = match alt_class {
    Some(class_name) => str_expr(with_leading_space(&class_name)),
    None => str_expr("".into()),
  };
  Box::new(Expr::Bin(BinExpr {
    span: DUMMY_SP,
    op: BinaryOp::Add,
    left: class_name_expr,
    right: Box::new(Expr::Cond(CondExpr {
      span: DUMMY_SP,
      test: condition,
      cons: str_expr(with_leading_space(&cons_class)),
      alt,
    })),
  }))
}

/// Matches the compiled condition shapes `() => cond && css("x")` and
/// `() => cond ? css("x") : css("y")` and returns the condition expression
/// plus the static class name(s)
fn fold_condition_arrow(arrow: &ArrowExpr, yak_imports: &YakImports) -> Option<ConditionSegment> {
  if !arrow.params.is_empty() || arrow.is_async || arrow.is_generator {
    return None;
  }
  let BlockStmtOrExpr::Expr(body) = &*arrow.body else {
    return None;
  };
  fold_condition_body(body, yak_imports)
}

/// Matches the condition shapes `cond && css("x")` and
/// `cond ? css("x") : css("y")` and returns the condition expression
/// plus the static class name(s)
pub(crate) fn fold_condition_body(
  body: &Expr,
  yak_imports: &YakImports,
) -> Option<ConditionSegment> {
  match unwrap_type_casts(body) {
    Expr::Bin(bin) if bin.op == BinaryOp::LogicalAnd => {
      let class_name = pure_static_css_class(&bin.right, yak_imports)?;
      Some((bin.left.clone(), class_name, None))
    }
    Expr::Cond(cond) => {
      let cons_class = pure_static_css_class(&cond.cons, yak_imports)?;
      let alt_class = pure_static_css_class(&cond.alt, yak_imports)?;
      Some((cond.test.clone(), cons_class, Some(alt_class)))
    }
    _ => None,
  }
}

/// Matches a `css("x")` call carrying exactly one static class string
pub(crate) fn pure_static_css_class(expr: &Expr, yak_imports: &YakImports) -> Option<Wtf8Atom> {
  let Expr::Call(call) = unwrap_type_casts(expr) else {
    return None;
  };
  if !is_yak_css_callee(&call.callee, yak_imports) || call.args.len() != 1 {
    return None;
  }
  let arg = &call.args[0];
  if arg.spread.is_some() {
    return None;
  }
  match unwrap_type_casts(&arg.expr) {
    Expr::Lit(Lit::Str(class_name)) => Some(class_name.value.clone()),
    _ => None,
  }
}

pub(crate) fn is_yak_css_callee(callee: &Callee, yak_imports: &YakImports) -> bool {
  match callee {
    Callee::Expr(expr) => match unwrap_type_casts(expr) {
      Expr::Ident(ident) => yak_imports.yak_css_idents().contains(&ident.to_id()),
      _ => false,
    },
    _ => false,
  }
}

pub(crate) fn with_leading_space(class_name: &Wtf8Atom) -> Wtf8Atom {
  format!(" {}", class_name.to_string_lossy()).into()
}

pub(crate) fn str_lit(value: Wtf8Atom, span: Span) -> Str {
  Str {
    span,
    value,
    raw: None,
  }
}

pub(crate) fn str_expr(value: Wtf8Atom) -> Box<Expr> {
  Box::new(Expr::Lit(Lit::Str(str_lit(value, DUMMY_SP))))
}

/// Wraps an expression into a `{...}` JSX attribute value
pub(crate) fn expr_attr_value(expr: Box<Expr>) -> JSXAttrValue {
  JSXAttrValue::JSXExprContainer(JSXExprContainer {
    span: DUMMY_SP,
    expr: JSXExpr::Expr(expr),
  })
}

/// Builds a `className` JSX attribute
pub(crate) fn class_name_attr(value: JSXAttrValue) -> JSXAttrOrSpread {
  JSXAttrOrSpread::JSXAttr(JSXAttr {
    span: DUMMY_SP,
    name: JSXAttrName::Ident(IdentName::new("className".into(), DUMMY_SP)),
    value: Some(value),
  })
}

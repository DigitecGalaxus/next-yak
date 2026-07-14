//! Purity predicates for the styled component JSX fold
//!
//! Folding moves an attribute expression out of attribute position - where JS
//! evaluates it exactly once, in source order - and into arbitrary expression
//! position inside the style conditions. Two different questions decide what
//! the fold may do with a value, and they need two different answers:
//!
//! - [`is_dup_pure`] - may the value be inlined at every read site? A read site
//!   can sit inside a callback (`list.some(x => x > $n)` evaluates it once per
//!   element) or behind a short circuit (`flag && $b` evaluates it never), so
//!   this asks for effect-freedom *and* identity-freedom: 0..N evaluations have
//!   to be indistinguishable from one.
//! - [`is_reorder_pure`] - may the value move relative to the other attribute
//!   evaluations while still being evaluated exactly once? Identity and
//!   allocation are unobservable here, so this is a strict superset.
//!
//! Both are allowlists: an unrecognised expression is impure. The asymmetry is
//! deliberate - a wrong answer towards "pure" is silent, a wrong answer towards
//! "impure" only costs an IIFE parameter.
//!
//! Every value is judged under [`unwrap_type_casts`], so `f() as number` is
//! judged on `f()` and `(x)` on `x`.

use crate::utils::ast_helper::unwrap_type_casts;
use swc_core::ecma::ast::*;

/// Whether the value may be evaluated 0..N times instead of exactly once
///
/// Member reads are admitted even though a getter could observe the extra
/// reads. Gating them would turn `$c={colors[status]}` - one of the most
/// common prop shapes there is - into an IIFE, and an effectful getter during
/// render already violates React's own purity rule.
pub(crate) fn is_dup_pure(expr: &Expr) -> bool {
  match unwrap_type_casts(expr) {
    Expr::Lit(_) | Expr::Ident(_) => true,
    Expr::Member(member) => is_dup_pure_member(member),
    Expr::OptChain(opt_chain) => match &*opt_chain.base {
      OptChainBase::Member(member) => is_dup_pure_member(member),
      // `a?.()` still calls
      OptChainBase::Call(_) => false,
      #[cfg(swc_ast_unknown)]
      _ => false,
    },
    // `delete a.b` mutates
    Expr::Unary(unary) => unary.op != UnaryOp::Delete && is_dup_pure(&unary.arg),
    // covers the logical operators too - swc models `&&`/`||`/`??` as BinaryOp
    Expr::Bin(bin) => is_dup_pure(&bin.left) && is_dup_pure(&bin.right),
    Expr::Cond(cond) => {
      is_dup_pure(&cond.test) && is_dup_pure(&cond.cons) && is_dup_pure(&cond.alt)
    }
    // an untagged template only concatenates - the result is a string, so two
    // evaluations are indistinguishable. A tagged template calls its tag.
    Expr::Tpl(tpl) => tpl.exprs.iter().all(|expr| is_dup_pure(expr)),
    // everything else: calls, `new`, `i++`, assignments, `await`, tagged
    // templates, and the identity-bearing literals (two evaluations of
    // `{}`, `[]` or `<Icon/>` are two different objects)
    _ => false,
  }
}

fn is_dup_pure_member(member: &MemberExpr) -> bool {
  let prop_is_pure = match &member.prop {
    MemberProp::Ident(_) => true,
    MemberProp::Computed(computed) => is_dup_pure(&computed.expr),
    MemberProp::PrivateName(_) => false,
    #[cfg(swc_ast_unknown)]
    _ => false,
  };
  prop_is_pure && is_dup_pure(&member.obj)
}

/// Whether the value may be evaluated at a different point in the attribute
/// sequence, still exactly once
///
/// Only used to decide the output *shape*: a value that is not reorder-pure and
/// sits between two captured values forces the element-wrap, which captures
/// everything in source order and is exact by construction.
pub(crate) fn is_reorder_pure(expr: &Expr) -> bool {
  match unwrap_type_casts(expr) {
    // creating a closure is unobservable - the body runs when it is called, not
    // where the expression sits. Without this arm every `onClick={() => …}`,
    // which is to say nearly every interactive element, would force the
    // element-wrap.
    Expr::Arrow(_) | Expr::Fn(_) => true,
    // allocating is unobservable, but the element *values* are evaluated here
    Expr::Array(array) => array.elems.iter().flatten().all(|elem| {
      // `[...xs]` reads xs' iterator and its getters
      elem.spread.is_none() && is_reorder_pure(&elem.expr)
    }),
    Expr::Object(object) => object.props.iter().all(|prop| match prop {
      // `{...x}` reads x's getters
      PropOrSpread::Spread(_) => false,
      PropOrSpread::Prop(prop) => is_reorder_pure_prop(prop),
      #[cfg(swc_ast_unknown)]
      _ => false,
    }),
    // `jsx()` allocates an element, it does not render it - but the attribute
    // values and children are evaluated at creation
    Expr::JSXElement(element) => is_reorder_pure_jsx_element(element),
    Expr::JSXFragment(fragment) => fragment.children.iter().all(is_reorder_pure_jsx_child),
    other => is_dup_pure(other),
  }
}

fn is_reorder_pure_prop(prop: &Prop) -> bool {
  match prop {
    Prop::Shorthand(_) => true,
    Prop::KeyValue(key_value) => {
      is_reorder_pure_prop_name(&key_value.key) && is_reorder_pure(&key_value.value)
    }
    // defining an accessor or a method does not run it
    Prop::Getter(getter) => is_reorder_pure_prop_name(&getter.key),
    Prop::Setter(setter) => is_reorder_pure_prop_name(&setter.key),
    Prop::Method(method) => is_reorder_pure_prop_name(&method.key),
    // `{ x = 1 }` is only valid as a destructuring pattern, not as a value
    Prop::Assign(_) => false,
    #[cfg(swc_ast_unknown)]
    _ => false,
  }
}

fn is_reorder_pure_prop_name(name: &PropName) -> bool {
  match name {
    PropName::Ident(_) | PropName::Str(_) | PropName::Num(_) | PropName::BigInt(_) => true,
    // `{ [k()]: v }` calls k
    PropName::Computed(computed) => is_reorder_pure(&computed.expr),
    #[cfg(swc_ast_unknown)]
    _ => false,
  }
}

fn is_reorder_pure_jsx_element(element: &JSXElement) -> bool {
  let attrs_are_pure = element.opening.attrs.iter().all(|attr| match attr {
    // `<Icon {...props}/>` reads props' getters
    JSXAttrOrSpread::SpreadElement(_) => false,
    JSXAttrOrSpread::JSXAttr(attr) => match &attr.value {
      // a bare `<Icon active/>` is the literal `true`
      None => true,
      Some(value) => is_reorder_pure_jsx_attr_value(value),
    },
    #[cfg(swc_ast_unknown)]
    _ => false,
  });
  attrs_are_pure && element.children.iter().all(is_reorder_pure_jsx_child)
}

/// A `{…}` container, which an empty `{}` makes trivially pure
fn is_reorder_pure_jsx_expr(expr: &JSXExpr) -> bool {
  match expr {
    JSXExpr::JSXEmptyExpr(_) => true,
    JSXExpr::Expr(expr) => is_reorder_pure(expr),
    #[cfg(swc_ast_unknown)]
    _ => false,
  }
}

fn is_reorder_pure_jsx_attr_value(value: &JSXAttrValue) -> bool {
  match value {
    JSXAttrValue::Str(_) => true,
    JSXAttrValue::JSXExprContainer(container) => is_reorder_pure_jsx_expr(&container.expr),
    JSXAttrValue::JSXElement(element) => is_reorder_pure_jsx_element(element),
    JSXAttrValue::JSXFragment(fragment) => fragment.children.iter().all(is_reorder_pure_jsx_child),
    #[cfg(swc_ast_unknown)]
    _ => false,
  }
}

fn is_reorder_pure_jsx_child(child: &JSXElementChild) -> bool {
  match child {
    JSXElementChild::JSXText(_) => true,
    JSXElementChild::JSXExprContainer(container) => is_reorder_pure_jsx_expr(&container.expr),
    JSXElementChild::JSXElement(element) => is_reorder_pure_jsx_element(element),
    JSXElementChild::JSXFragment(fragment) => {
      fragment.children.iter().all(is_reorder_pure_jsx_child)
    }
    // `<div>{...children}</div>` reads the source's iterator
    JSXElementChild::JSXSpreadChild(_) => false,
    #[cfg(swc_ast_unknown)]
    _ => false,
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use swc_core::common::sync::Lrc;
  use swc_core::common::{FileName, SourceMap};
  use swc_core::ecma::parser::{lexer::Lexer, EsSyntax, Parser, StringInput, Syntax, TsSyntax};

  /// Parses a bare expression, so each case reads as the source a user would
  /// write. Parsing directly rather than round-tripping through
  /// `test_transform` matters here: the printer normalises away exactly the
  /// wrappers (`(x)`, `<T>x`) these predicates have to see through.
  fn parse_expr(syntax: Syntax, source: &str) -> Box<Expr> {
    let cm: Lrc<SourceMap> = Default::default();
    let fm = cm.new_source_file(Lrc::new(FileName::Anon), source.to_string());
    let lexer = Lexer::new(syntax, EsVersion::latest(), StringInput::from(&*fm), None);
    Parser::new_from(lexer)
      .parse_expr()
      .unwrap_or_else(|err| panic!("failed to parse `{source}`: {err:?}"))
  }

  fn ts(source: &str) -> Box<Expr> {
    parse_expr(Syntax::Typescript(TsSyntax::default()), source)
  }

  fn tsx(source: &str) -> Box<Expr> {
    parse_expr(
      Syntax::Typescript(TsSyntax {
        tsx: true,
        ..Default::default()
      }),
      source,
    )
  }

  fn dup_pure(source: &str) -> bool {
    is_dup_pure(&ts(source))
  }

  fn reorder_pure(source: &str) -> bool {
    is_reorder_pure(&ts(source))
  }

  #[test]
  fn dup_pure_admits_the_common_prop_shapes() {
    assert!(dup_pure("3"));
    assert!(dup_pure(r#""big""#));
    assert!(dup_pure("size"));
    assert!(dup_pure("p.tilt"));
    assert!(dup_pure("p.a.b.c"));
    assert!(dup_pure("p?.x"));
    // computed access with a pure key - gating this would IIFE a dominant shape
    assert!(dup_pure("colors[status]"));
    assert!(dup_pure("!open"));
    assert!(dup_pure("-count"));
    assert!(dup_pure("typeof x"));
    // the shape the deleted eslint rule wrongly called impure
    assert!(dup_pure("i % 4 !== 0"));
    assert!(dup_pure("a && b"));
    assert!(dup_pure("a ?? b"));
    assert!(dup_pure("on ? 1 : 2"));
    assert!(dup_pure("`${a}-${b}`"));
  }

  #[test]
  fn dup_pure_rejects_effects_and_identity() {
    // effects
    assert!(!dup_pure("f()"));
    assert!(!dup_pure("p.getSize()"));
    assert!(!dup_pure("new Date()"));
    assert!(!dup_pure("i++"));
    assert!(!dup_pure("(y = 1)"));
    assert!(!dup_pure("tag`x`"));
    assert!(!dup_pure("a?.()"));
    assert!(!dup_pure("delete a.b"));
    // identity: two evaluations are two different objects
    assert!(!dup_pure("[1, 2]"));
    assert!(!dup_pure("({ a: 1 })"));
    assert!(!dup_pure("() => 1"));
  }

  #[test]
  fn dup_pure_recurses_into_operands() {
    assert!(!dup_pure("f() > 5"));
    assert!(!dup_pure("a || f()"));
    assert!(!dup_pure("on ? a : f()"));
    assert!(!dup_pure("`${f()}`"));
    assert!(!dup_pure("p.x[f()]"));
    assert!(!dup_pure("f().x"));
    assert!(!dup_pure("!f()"));
  }

  #[test]
  fn purity_is_judged_under_type_casts_and_parens() {
    // pins that the allowlist never sees the wrapper
    assert!(!dup_pure("f() as number"));
    assert!(!dup_pure("(f())"));
    assert!(!dup_pure("f()!"));
    assert!(!dup_pure("<number>f()"));
    assert!(dup_pure("x as number"));
    assert!(dup_pure("(x)"));
    assert!(dup_pure("x!"));
  }

  #[test]
  fn reorder_pure_admits_what_dup_pure_does() {
    assert!(reorder_pure("size"));
    assert!(reorder_pure("colors[status]"));
    assert!(reorder_pure("i % 4 !== 0"));
    // and rejects the same effects
    assert!(!reorder_pure("f()"));
    assert!(!reorder_pure("i++"));
  }

  #[test]
  fn reorder_pure_admits_allocation_without_observation() {
    // without this every interactive element would take the element-wrap
    assert!(reorder_pure("() => setOpen(true)"));
    assert!(reorder_pure("function () { return f(); }"));
    assert!(reorder_pure("[1, x]"));
    assert!(reorder_pure("({ top: 0, left: x })"));
    assert!(reorder_pure("({ get x() { return f(); } })"));
    assert!(reorder_pure("({ m() { return f(); } })"));
  }

  #[test]
  fn reorder_pure_rejects_evaluation_hidden_in_a_literal() {
    assert!(!reorder_pure("[f()]"));
    assert!(!reorder_pure("({ a: f() })"));
    // a computed key is evaluated where the literal sits
    assert!(!reorder_pure("({ [k()]: 1 })"));
    // a spread reads the source's getters
    assert!(!reorder_pure("[...xs]"));
    assert!(!reorder_pure("({ ...props })"));
  }

  #[test]
  fn reorder_pure_looks_inside_jsx() {
    assert!(is_reorder_pure(&tsx("<Icon />")));
    assert!(is_reorder_pure(&tsx("<Icon size={2}>text</Icon>")));
    assert!(is_reorder_pure(&tsx("<Icon active />")));
    assert!(is_reorder_pure(&tsx("<><Icon /></>")));
    // an attribute value is evaluated when the element is created
    assert!(!is_reorder_pure(&tsx("<Icon size={f()} />")));
    assert!(!is_reorder_pure(&tsx("<Icon>{f()}</Icon>")));
    assert!(!is_reorder_pure(&tsx("<Icon {...props} />")));
    assert!(!is_reorder_pure(&tsx("<><Icon size={f()} /></>")));
    // a JSX element is still identity-bearing, so it is never dup-pure
    assert!(!is_dup_pure(&tsx("<Icon />")));
  }

  #[test]
  fn jsx_is_judged_the_same_from_the_es_parser() {
    // the predicates see an Expr, never a Syntax - this pins that the JSX arms
    // are not accidentally coupled to the TS parser the fixtures use
    let expr = parse_expr(
      Syntax::Es(EsSyntax {
        jsx: true,
        ..Default::default()
      }),
      "<Icon size={f()} />",
    );
    assert!(!is_reorder_pure(&expr));
  }
}

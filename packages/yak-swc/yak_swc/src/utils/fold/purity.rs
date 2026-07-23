//! Purity of prop value expressions for the styled component JSX fold
//!
//! Folding moves an attribute expression out of attribute position - where JS
//! evaluates it exactly once, in source order - and into arbitrary expression
//! position inside the style conditions. [`Purity`] grades how much of that
//! movement a value tolerates

use crate::utils::ast_helper::unwrap_type_casts;
use swc_core::ecma::ast::*;

/// How freely the fold may treat a value's evaluation - each level includes
/// everything the levels below it allow
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub(super) enum Purity {
  /// observable effects (calls, `new`, `i++`, assignments, `await`): evaluated
  /// exactly once, exactly where attribute position evaluated it
  Impure,
  /// effect-free but identity-bearing (arrows, `[]`/`{}` literals, JSX): may
  /// evaluate at a different point in the attribute sequence, still exactly
  /// once - two evaluations would be two different objects
  Reorder,
  /// effect- and identity-free: may evaluate 0..N times anywhere - a read
  /// site can sit inside a callback (`list.some(x => x > $n)` reads once per
  /// element) or behind a short circuit (`flag && $b` reads never)
  Dup,
}

/// Judges how freely the fold may treat one value, in a single walk
///
/// The levels are an allowlist: an unrecognised expression is
/// [`Purity::Impure`]. The asymmetry is deliberate - a wrong answer towards
/// pure is silent, a wrong answer towards impure only costs an IIFE parameter
///
/// Member reads are admitted as [`Purity::Dup`] even though a getter could
/// observe the extra reads. Gating them would turn `$c={colors[status]}` - one
/// of the most common prop shapes there is - into an IIFE, and an effectful
/// getter during render already violates React's own purity rule
pub(super) fn purity(expr: &Expr) -> Purity {
  match unwrap_type_casts(expr) {
    Expr::Lit(_) | Expr::Ident(_) => Purity::Dup,
    Expr::Member(member) => member_purity(member),
    Expr::OptChain(opt_chain) => match &*opt_chain.base {
      OptChainBase::Member(member) => member_purity(member),
      // `a?.()` still calls
      OptChainBase::Call(_) => Purity::Impure,
      #[cfg(swc_ast_unknown)]
      _ => Purity::Impure,
    },
    // `delete a.b` mutates
    Expr::Unary(unary) if unary.op == UnaryOp::Delete => Purity::Impure,
    Expr::Unary(unary) => operand(purity(&unary.arg)),
    // covers the logical operators too - swc models `&&`/`||`/`??` as BinaryOp
    Expr::Bin(bin) => operand(purity(&bin.left).min(purity(&bin.right))),
    // a ternary between two identity-bearing branches (`on ? {…} : {…}`) could
    // soundly be Reorder - branches are never coerced - but stays strict until
    // the shape shows up in real code
    Expr::Cond(cond) => operand(
      purity(&cond.test)
        .min(purity(&cond.cons))
        .min(purity(&cond.alt)),
    ),
    // an untagged template only concatenates - the result is a string, so two
    // evaluations are indistinguishable, while a tagged template calls its tag
    Expr::Tpl(tpl) => operand(
      tpl
        .exprs
        .iter()
        .map(|expr| purity(expr))
        .min()
        .unwrap_or(Purity::Dup),
    ),
    // creating a closure is unobservable - the body runs when it is called,
    // not where the expression sits. Without this arm every `onClick={() => …}`,
    // which is to say nearly every interactive element, would force the
    // element-wrap
    Expr::Arrow(_) | Expr::Fn(_) => Purity::Reorder,
    // allocating is unobservable, but the element *values* are evaluated here
    Expr::Array(array) => allocation(
      array
        .elems
        .iter()
        .flatten()
        .map(|elem| {
          // `[...xs]` reads xs' iterator and its getters
          if elem.spread.is_some() {
            Purity::Impure
          } else {
            purity(&elem.expr)
          }
        })
        .min()
        .unwrap_or(Purity::Dup),
    ),
    Expr::Object(object) => allocation(
      object
        .props
        .iter()
        .map(|prop| match prop {
          // `{...x}` reads x's getters
          PropOrSpread::Spread(_) => Purity::Impure,
          PropOrSpread::Prop(prop) => prop_purity(prop),
          #[cfg(swc_ast_unknown)]
          _ => Purity::Impure,
        })
        .min()
        .unwrap_or(Purity::Dup),
    ),
    // `jsx()` allocates an element, it does not render it - but the attribute
    // values and children are evaluated at creation
    Expr::JSXElement(element) => jsx_element_purity(element),
    Expr::JSXFragment(fragment) => jsx_children_purity(&fragment.children),
    // everything else: calls, `new`, `i++`, assignments, `await`, tagged
    // templates
    _ => Purity::Impure,
  }
}

/// The context of an operand the surrounding expression consumes: `+` and the
/// comparisons coerce via `toString`/`valueOf`, which an identity-bearing
/// operand may override with user code - so only full dup-purity passes
/// through, everything else degrades to impure
fn operand(purity: Purity) -> Purity {
  if purity == Purity::Dup {
    Purity::Dup
  } else {
    Purity::Impure
  }
}

/// The context of a value an allocation holds: the allocation itself caps the
/// result at [`Purity::Reorder`] (two evaluations are two objects), and a
/// value below that makes the whole literal impure
fn allocation(contents: Purity) -> Purity {
  if contents >= Purity::Reorder {
    Purity::Reorder
  } else {
    Purity::Impure
  }
}

fn member_purity(member: &MemberExpr) -> Purity {
  let prop = match &member.prop {
    MemberProp::Ident(_) => Purity::Dup,
    // a computed key is coerced to a property key where the read sits
    MemberProp::Computed(computed) => purity(&computed.expr),
    MemberProp::PrivateName(_) => Purity::Impure,
    #[cfg(swc_ast_unknown)]
    _ => Purity::Impure,
  };
  operand(prop.min(purity(&member.obj)))
}

fn prop_purity(prop: &Prop) -> Purity {
  match prop {
    Prop::Shorthand(_) => Purity::Dup,
    Prop::KeyValue(key_value) => prop_name_purity(&key_value.key).min(purity(&key_value.value)),
    // defining an accessor or a method does not run it
    Prop::Getter(getter) => prop_name_purity(&getter.key),
    Prop::Setter(setter) => prop_name_purity(&setter.key),
    Prop::Method(method) => prop_name_purity(&method.key),
    // `{ x = 1 }` is only valid as a destructuring pattern, not as a value
    Prop::Assign(_) => Purity::Impure,
    #[cfg(swc_ast_unknown)]
    _ => Purity::Impure,
  }
}

fn prop_name_purity(name: &PropName) -> Purity {
  match name {
    PropName::Ident(_) | PropName::Str(_) | PropName::Num(_) | PropName::BigInt(_) => Purity::Dup,
    // `{ [k()]: v }` calls k
    PropName::Computed(computed) => purity(&computed.expr),
    #[cfg(swc_ast_unknown)]
    _ => Purity::Impure,
  }
}

fn jsx_element_purity(element: &JSXElement) -> Purity {
  let attrs = element
    .opening
    .attrs
    .iter()
    .map(|attr| match attr {
      // `<Icon {...props}/>` reads props' getters
      JSXAttrOrSpread::SpreadElement(_) => Purity::Impure,
      JSXAttrOrSpread::JSXAttr(attr) => match &attr.value {
        // a bare `<Icon active/>` is the literal `true`
        None => Purity::Dup,
        Some(value) => jsx_attr_value_purity(value),
      },
      #[cfg(swc_ast_unknown)]
      _ => Purity::Impure,
    })
    .min()
    .unwrap_or(Purity::Dup);
  allocation(attrs.min(jsx_children_purity(&element.children)))
}

/// A `{…}` container, which an empty `{}` makes trivially pure
fn jsx_expr_purity(expr: &JSXExpr) -> Purity {
  match expr {
    JSXExpr::JSXEmptyExpr(_) => Purity::Dup,
    JSXExpr::Expr(expr) => purity(expr),
    #[cfg(swc_ast_unknown)]
    _ => Purity::Impure,
  }
}

fn jsx_attr_value_purity(value: &JSXAttrValue) -> Purity {
  match value {
    JSXAttrValue::Str(_) => Purity::Dup,
    JSXAttrValue::JSXExprContainer(container) => jsx_expr_purity(&container.expr),
    JSXAttrValue::JSXElement(element) => jsx_element_purity(element),
    JSXAttrValue::JSXFragment(fragment) => jsx_children_purity(&fragment.children),
    #[cfg(swc_ast_unknown)]
    _ => Purity::Impure,
  }
}

fn jsx_children_purity(children: &[JSXElementChild]) -> Purity {
  allocation(
    children
      .iter()
      .map(|child| match child {
        JSXElementChild::JSXText(_) => Purity::Dup,
        JSXElementChild::JSXExprContainer(container) => jsx_expr_purity(&container.expr),
        JSXElementChild::JSXElement(element) => jsx_element_purity(element),
        JSXElementChild::JSXFragment(fragment) => jsx_children_purity(&fragment.children),
        // `<div>{...children}</div>` reads the source's iterator
        JSXElementChild::JSXSpreadChild(_) => Purity::Impure,
        #[cfg(swc_ast_unknown)]
        _ => Purity::Impure,
      })
      .min()
      .unwrap_or(Purity::Dup),
  )
}

#[cfg(test)]
mod tests {
  use super::Purity::*;
  use super::*;
  use swc_core::common::sync::Lrc;
  use swc_core::common::{FileName, SourceMap};
  use swc_core::ecma::parser::{lexer::Lexer, EsSyntax, Parser, StringInput, Syntax, TsSyntax};

  /// Parses a bare expression, so each case reads as the source a user would
  /// write. Parsing directly rather than round-tripping through
  /// `test_transform` matters here: the printer normalises away exactly the
  /// wrappers (`(x)`, `<T>x`) these predicates have to see through
  fn parse_expr(syntax: Syntax, source: &str) -> Box<Expr> {
    let cm: Lrc<SourceMap> = Default::default();
    let fm = cm.new_source_file(Lrc::new(FileName::Anon), source.to_string());
    let lexer = Lexer::new(syntax, EsVersion::latest(), StringInput::from(&*fm), None);
    Parser::new_from(lexer)
      .parse_expr()
      .unwrap_or_else(|err| panic!("failed to parse `{source}`: {err:?}"))
  }

  fn ts(source: &str) -> Purity {
    purity(&parse_expr(Syntax::Typescript(TsSyntax::default()), source))
  }

  fn tsx(source: &str) -> Purity {
    purity(&parse_expr(
      Syntax::Typescript(TsSyntax {
        tsx: true,
        ..Default::default()
      }),
      source,
    ))
  }

  #[test]
  fn dup_implies_reorder() {
    // the whole design leans on the subset relation being the enum order
    assert!(Dup > Reorder);
    assert!(Reorder > Impure);
  }

  #[test]
  fn the_common_prop_shapes_may_duplicate() {
    assert_eq!(ts("3"), Dup);
    assert_eq!(ts(r#""big""#), Dup);
    assert_eq!(ts("size"), Dup);
    assert_eq!(ts("p.tilt"), Dup);
    assert_eq!(ts("p.a.b.c"), Dup);
    assert_eq!(ts("p?.x"), Dup);
    // computed access with a pure key - gating this would IIFE a dominant shape
    assert_eq!(ts("colors[status]"), Dup);
    assert_eq!(ts("!open"), Dup);
    assert_eq!(ts("-count"), Dup);
    assert_eq!(ts("typeof x"), Dup);
    // arithmetic and comparison chains stay duplicable
    assert_eq!(ts("i % 4 !== 0"), Dup);
    assert_eq!(ts("a && b"), Dup);
    assert_eq!(ts("a ?? b"), Dup);
    assert_eq!(ts("on ? 1 : 2"), Dup);
    assert_eq!(ts("`${a}-${b}`"), Dup);
  }

  #[test]
  fn effects_are_impure() {
    assert_eq!(ts("f()"), Impure);
    assert_eq!(ts("p.getSize()"), Impure);
    assert_eq!(ts("new Date()"), Impure);
    assert_eq!(ts("i++"), Impure);
    assert_eq!(ts("(y = 1)"), Impure);
    assert_eq!(ts("tag`x`"), Impure);
    assert_eq!(ts("a?.()"), Impure);
    assert_eq!(ts("delete a.b"), Impure);
  }

  #[test]
  fn identity_bearing_values_may_move_but_not_duplicate() {
    // two evaluations are two different objects
    assert_eq!(ts("[1, 2]"), Reorder);
    assert_eq!(ts("({ a: 1 })"), Reorder);
    // without this every interactive element would take the element-wrap
    assert_eq!(ts("() => setOpen(true)"), Reorder);
    assert_eq!(ts("function () { return f(); }"), Reorder);
    assert_eq!(ts("[1, x]"), Reorder);
    assert_eq!(ts("({ top: 0, left: x })"), Reorder);
    // defining an accessor or a method does not run it
    assert_eq!(ts("({ get x() { return f(); } })"), Reorder);
    assert_eq!(ts("({ m() { return f(); } })"), Reorder);
  }

  #[test]
  fn operands_degrade_identity_to_impure() {
    // `+`/comparison coercion could run a user `toString`, so an
    // identity-bearing operand never rides through an operator
    assert_eq!(ts("x + [1]"), Impure);
    assert_eq!(ts("!{}"), Impure);
    assert_eq!(ts("`${[x]}`"), Impure);
    assert_eq!(ts("on ? { a: 1 } : x"), Impure);
  }

  #[test]
  fn purity_recurses_into_operands() {
    assert_eq!(ts("f() > 5"), Impure);
    assert_eq!(ts("a || f()"), Impure);
    assert_eq!(ts("on ? a : f()"), Impure);
    assert_eq!(ts("`${f()}`"), Impure);
    assert_eq!(ts("p.x[f()]"), Impure);
    assert_eq!(ts("f().x"), Impure);
    assert_eq!(ts("!f()"), Impure);
  }

  #[test]
  fn purity_is_judged_under_type_casts_and_parens() {
    // pins that the allowlist never sees the wrapper
    assert_eq!(ts("f() as number"), Impure);
    assert_eq!(ts("(f())"), Impure);
    assert_eq!(ts("f()!"), Impure);
    assert_eq!(ts("<number>f()"), Impure);
    assert_eq!(ts("x as number"), Dup);
    assert_eq!(ts("(x)"), Dup);
    assert_eq!(ts("x!"), Dup);
  }

  #[test]
  fn evaluation_hidden_in_a_literal_is_impure() {
    assert_eq!(ts("[f()]"), Impure);
    assert_eq!(ts("({ a: f() })"), Impure);
    // a computed key is evaluated where the literal sits
    assert_eq!(ts("({ [k()]: 1 })"), Impure);
    // a spread reads the source's getters
    assert_eq!(ts("[...xs]"), Impure);
    assert_eq!(ts("({ ...props })"), Impure);
  }

  #[test]
  fn jsx_is_identity_bearing_and_judged_inside() {
    assert_eq!(tsx("<Icon />"), Reorder);
    assert_eq!(tsx("<Icon size={2}>text</Icon>"), Reorder);
    assert_eq!(tsx("<Icon active />"), Reorder);
    assert_eq!(tsx("<><Icon /></>"), Reorder);
    // an attribute value is evaluated when the element is created
    assert_eq!(tsx("<Icon size={f()} />"), Impure);
    assert_eq!(tsx("<Icon>{f()}</Icon>"), Impure);
    assert_eq!(tsx("<Icon {...props} />"), Impure);
    assert_eq!(tsx("<><Icon size={f()} /></>"), Impure);
  }

  #[test]
  fn jsx_is_judged_the_same_from_the_es_parser() {
    // purity() sees an Expr, never a Syntax - this pins that the JSX arms are
    // not accidentally coupled to the TS parser the fixtures use
    let expr = parse_expr(
      Syntax::Es(EsSyntax {
        jsx: true,
        ..Default::default()
      }),
      "<Icon size={f()} />",
    );
    assert_eq!(purity(&expr), Impure);
  }
}

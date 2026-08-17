use swc_core::common::util::take::Take;
use swc_core::common::{EqIgnoreSpan, Span, SyntaxContext, DUMMY_SP};
use swc_core::ecma::ast::*;
use swc_core::ecma::visit::{VisitMut, VisitMutWith};

/// Remembers which CSS variable was created for which runtime expression so a
/// styled component which interpolates the same function twice only needs one
/// variable, e.g.
/// `left: ${({$x}) => $x}px; right: ${({$x}) => $x}px;`
#[derive(Default)]
pub struct CssVariableDedup {
  seen: Vec<(Expr, String)>,
}

impl CssVariableDedup {
  /// Name of the variable a runtime-identical expression already got.
  pub fn find(&self, normalized: &Expr) -> Option<&str> {
    // The resolver runs before this visitor and gives every arrow function
    // scope its own hygiene mark, so two textually identical interpolations
    // carry different syntax contexts. Comparing inside `within_ignored_ctxt`
    // makes the comparison see the source code, not the scope numbering.
    SyntaxContext::within_ignored_ctxt(|| {
      self
        .seen
        .iter()
        .find(|(candidate, _)| candidate.eq_ignore_span(normalized))
        .map(|(_, name)| name.as_str())
    })
  }

  pub fn register(&mut self, normalized: Expr, name: String) {
    self.seen.push((normalized, name));
  }

  /// Copy of the expression with everything removed which does not change what
  /// it evaluates to. Only the copy is compared - the emitted code always keeps
  /// the original expression.
  pub fn normalize(expr: &Expr) -> Expr {
    let mut normalized = expr.clone();
    normalized.visit_mut_with(&mut Normalize);
    normalized
  }
}

struct Normalize;

impl VisitMut for Normalize {
  fn visit_mut_expr(&mut self, expr: &mut Expr) {
    // Type casts and parentheses are erased before the code runs.
    // Keep this list in sync with `unwrap_type_casts` in ast_helper.rs, which
    // does the same by reference and therefore cannot be reused here.
    loop {
      let inner = match expr {
        Expr::TsAs(cast) => cast.expr.take(),
        Expr::TsTypeAssertion(cast) => cast.expr.take(),
        Expr::TsConstAssertion(cast) => cast.expr.take(),
        Expr::TsNonNull(cast) => cast.expr.take(),
        Expr::TsInstantiation(cast) => cast.expr.take(),
        Expr::TsSatisfies(cast) => cast.expr.take(),
        Expr::Paren(paren) => paren.expr.take(),
        _ => break,
      };
      *expr = *inner;
    }
    expr.visit_mut_children_with(self);
  }

  fn visit_mut_opt_ts_type_ann(&mut self, type_ann: &mut Option<Box<TsTypeAnn>>) {
    *type_ann = None;
  }

  fn visit_mut_opt_ts_type_param_decl(&mut self, type_params: &mut Option<Box<TsTypeParamDecl>>) {
    *type_params = None;
  }

  fn visit_mut_opt_ts_type_param_instantiation(
    &mut self,
    type_args: &mut Option<Box<TsTypeParamInstantiation>>,
  ) {
    *type_args = None;
  }

  fn visit_mut_span(&mut self, span: &mut Span) {
    *span = DUMMY_SP;
  }

  fn visit_mut_object_pat(&mut self, pat: &mut ObjectPat) {
    pat.visit_mut_children_with(self);
    if !is_order_independent(&pat.props) {
      return;
    }
    // A rest element collects whatever the named bindings left over, so it has
    // to stay last.
    let named_count =
      pat.props.len() - usize::from(matches!(pat.props.last(), Some(ObjectPatProp::Rest(_))));
    pat.props[..named_count].sort_by_cached_key(binding_order_key);
  }
}

/// Whether the bindings of a destructuring pattern may be sorted.
///
/// A default value can read a sibling binding (`{ $a, $b = $a }`) and a
/// computed key can run arbitrary code, so both make the written order part of
/// the meaning of the pattern.
fn is_order_independent(props: &[ObjectPatProp]) -> bool {
  props.iter().all(|prop| match prop {
    ObjectPatProp::Assign(assign) => assign.value.is_none(),
    ObjectPatProp::KeyValue(key_value) => {
      !matches!(key_value.key, PropName::Computed(_)) && !has_default(&key_value.value)
    }
    ObjectPatProp::Rest(_) => true,
    // Keep the written order for bindings this code does not know
    #[cfg(swc_ast_unknown)]
    _ => false,
  })
}

fn has_default(pat: &Pat) -> bool {
  match pat {
    Pat::Assign(_) => true,
    Pat::Object(object) => object.props.iter().any(|prop| match prop {
      ObjectPatProp::Assign(assign) => assign.value.is_some(),
      ObjectPatProp::KeyValue(key_value) => has_default(&key_value.value),
      ObjectPatProp::Rest(rest) => has_default(&rest.arg),
      #[cfg(swc_ast_unknown)]
      _ => true,
    }),
    Pat::Array(array) => array.elems.iter().flatten().any(has_default),
    Pat::Rest(rest) => has_default(&rest.arg),
    _ => false,
  }
}

fn binding_order_key(prop: &ObjectPatProp) -> String {
  match prop {
    ObjectPatProp::Assign(assign) => assign.key.sym.to_string(),
    ObjectPatProp::KeyValue(key_value) => match &key_value.key {
      PropName::Ident(ident) => ident.sym.to_string(),
      PropName::Str(str) => str.value.as_str().unwrap_or_default().to_string(),
      PropName::Num(num) => num.value.to_string(),
      PropName::BigInt(big_int) => big_int.value.to_string(),
      // Computed keys never reach this point - `is_order_independent` rejects
      // them before anything is sorted
      PropName::Computed(_) => String::new(),
      #[cfg(swc_ast_unknown)]
      _ => String::new(),
    },
    ObjectPatProp::Rest(_) => String::new(),
    #[cfg(swc_ast_unknown)]
    _ => String::new(),
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use std::sync::Arc;
  use swc_core::common::{FileName, Globals, Mark, SourceMap, GLOBALS};
  use swc_core::ecma::parser::{parse_file_as_module, Syntax, TsSyntax};
  use swc_core::ecma::transforms::base::resolver;

  /// Both snippets are parsed as one module so the resolver hands each arrow
  /// function its own hygiene mark, like it does in the real pipeline.
  fn normalize_pair(left: &str, right: &str) -> (Expr, Expr) {
    GLOBALS.set(&Globals::default(), || {
      let source_map = SourceMap::default();
      let source_file = source_map.new_source_file(
        Arc::new(FileName::Anon),
        format!("const left = {left};\nconst right = {right};\n"),
      );
      let mut module = parse_file_as_module(
        &source_file,
        Syntax::Typescript(TsSyntax {
          tsx: true,
          ..Default::default()
        }),
        EsVersion::latest(),
        None,
        &mut vec![],
      )
      .expect("test snippet must parse");
      module.visit_mut_with(&mut resolver(Mark::new(), Mark::new(), true));

      let mut initializers = module.body.iter().filter_map(|item| match item {
        ModuleItem::Stmt(Stmt::Decl(Decl::Var(var))) => var.decls[0].init.as_deref(),
        _ => None,
      });
      let left = CssVariableDedup::normalize(initializers.next().expect("left snippet"));
      let right = CssVariableDedup::normalize(initializers.next().expect("right snippet"));
      (left, right)
    })
  }

  fn is_deduplicated(left: &str, right: &str) -> bool {
    let (left, right) = normalize_pair(left, right);
    let mut dedup = CssVariableDedup::default();
    dedup.register(left, "--yak-1".to_string());
    dedup.find(&right) == Some("--yak-1")
  }

  #[test]
  fn identical_arrows_share_a_variable() {
    assert!(is_deduplicated("({ $x }) => $x", "({ $x }) => $x"));
  }

  #[test]
  fn type_annotations_are_ignored() {
    assert!(is_deduplicated(
      "({ $y }) => $y",
      "({ $y }: { $y: number }) => $y"
    ));
    assert!(is_deduplicated(
      "({ $y }) => $y",
      "({ $y }): number => $y as number"
    ));
  }

  #[test]
  fn parentheses_are_ignored() {
    assert!(is_deduplicated("({ $z }) => $z", "(({ $z }) => $z)"));
  }

  #[test]
  fn destructuring_order_is_ignored() {
    assert!(is_deduplicated(
      "({ $a, $b }) => $a * $b",
      "({ $b, $a }) => $a * $b"
    ));
    assert!(is_deduplicated(
      "({ $a: a, $b: b }) => a * b",
      "({ $b: b, $a: a }) => a * b"
    ));
  }

  #[test]
  fn rest_element_stays_last() {
    assert!(is_deduplicated(
      "({ $a, $b, ...rest }) => [$a, $b, rest]",
      "({ $b, $a, ...rest }) => [$a, $b, rest]"
    ));
  }

  #[test]
  fn defaults_block_reordering() {
    assert!(!is_deduplicated(
      "({ $a, $b = $a }) => $a * $b",
      "({ $b = $a, $a }) => $a * $b"
    ));
  }

  #[test]
  fn computed_keys_block_reordering() {
    assert!(!is_deduplicated(
      "({ [key]: a, $b: b }) => a * b",
      "({ $b: b, [key]: a }) => a * b"
    ));
  }

  #[test]
  fn different_properties_stay_apart() {
    assert!(!is_deduplicated("({ $a }) => $a", "({ $b }) => $b"));
  }

  #[test]
  fn different_unit_wrappers_stay_apart() {
    assert!(!is_deduplicated(
      "__yak_unitPostFix(({ $size }) => $size, 'px')",
      "__yak_unitPostFix(({ $size }) => $size, 'rem')"
    ));
  }
}

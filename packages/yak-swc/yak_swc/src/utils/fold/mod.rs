//! Compile-time folding of next-yak's runtime wrappers into plain markup
//!
//! next-yak normally emits a runtime component for every styled component and a
//! runtime merge call for every `css` prop. When the styles are fully known at
//! build time both can be skipped, and the element keeps only the class names it
//! would have received at runtime. Folding is opt-in through `foldStatic`.
//!
//! The feature is built from four parts:
//!
//! - [`css_expr`] turns a compiled `css(...)` expression into the `className`
//!   value it stands for. Both fold paths build on it.
//! - [`purity`] grades how freely a prop value may be moved, which the usage
//!   rewrite needs to keep inlining unobservable.
//! - [`css_prop`] folds a static `css` prop into a plain `className`.
//! - This module folds styled components: a JSX usage of a same-file static
//!   component becomes the plain element it wraps, and a `styled(Parent)` chain
//!   of same-file static components collapses to that element.
//!
//! ## The styled component fold in three phases
//!
//! 1. **Register.** [`StyledFold::try_register`] runs during the main transform
//!    pass and records every declaration whose usages could be folded. A usage
//!    may appear before its declaration (inside a hoisted function), so the
//!    rewrite is deferred until the whole module has been seen.
//! 2. **Resolve.** [`StyledFold::resolve`] collapses the `styled(Parent)` chains
//!    and drops the components that turned out not to be foldable.
//! 3. **Rewrite.** [`StyledFold::fold_module`] rewrites every foldable JSX usage
//!    into its plain element (see [`usage`]) and each collapsed chain's
//!    declaration into the same element (see [`collapse_declarations`]).
//!
//! A component that only folds at its usages keeps its declaration - it is
//! `/*#__PURE__*/` annotated so the minifier removes it once every usage folded
//! and it is not exported. A collapsed chain's declaration is rewritten in place,
//! so an exported chain ships one flat wrapper and its base components stay
//! minifier-removable.

use rustc_hash::{FxHashMap, FxHashSet};
use swc_core::{
  atoms::{Atom, Wtf8Atom},
  common::SyntaxContext,
  ecma::ast::{
    CallExpr, Callee, Decl, Expr, ExprOrSpread, Id, Ident, ImportSpecifier, Lit, MemberProp,
    Module, ModuleDecl, ModuleItem, Pat, Stmt, VarDecl, VarDeclKind,
  },
  ecma::visit::{VisitMut, VisitMutWith},
};

use crate::utils::fold::css_expr::{merge_class_names, str_expr};
use crate::utils::native_elements::VALID_ELEMENTS;
use crate::variable_visitor::ScopedVariableReference;
use crate::yak_imports::YakImports;

mod css_expr;
pub(crate) mod css_prop;
mod purity;
mod usage;

/// What a foldable JSX usage is rewritten to
#[derive(Debug, PartialEq)]
enum FoldTarget {
  /// A native DOM element, e.g. `div` for `styled.div`
  Native(Atom),
  /// The wrapped component, e.g. `Card` for `styled(Card)`
  Component(Ident),
}

/// A styled component whose JSX usages can be folded into their [`FoldTarget`]
#[derive(Debug)]
struct FoldableComponent {
  target: FoldTarget,
  /// The generated static class name, e.g. `"ym7uBBu"`
  class_name: Wtf8Atom,
  /// The compiled class-toggling expressions over props,
  /// e.g. `({ $active }) => $active && css("ym7uBBu1")`.
  /// Empty for fully static components; usages of dynamic components only fold
  /// if these can be inlined by substituting the props with the JSX attribute
  /// values
  runtime_expressions: Vec<Expr>,
}

/// The registry of foldable styled components and the driver of their fold
///
/// See the module documentation for the register -> resolve -> rewrite phases.
#[derive(Debug, Default)]
pub struct StyledFold {
  components: FxHashMap<Id, FoldableComponent>,
}

impl StyledFold {
  /// Registers a styled component if its JSX usages are foldable:
  /// - `declaration` is a plain variable, e.g. `Card` in
  ///   `const Card = styled.div`...``
  /// - `tag` (the original tagged template tag) is `styled.element`,
  ///   `styled("element")` with a native DOM element or `styled(Component)` -
  ///   these shapes exclude `.attrs(...)` chains
  /// - `class_name` is the static class name the compiled call carries as its
  ///   first argument
  /// - `runtime_expressions` must all be class-toggling arrows over props -
  ///   anything else keeps the runtime path. Function expressions bail too:
  ///   they bind `this`/`arguments`, which inlining would silently rebind to
  ///   the enclosing component
  pub fn try_register(
    &mut self,
    declaration: Option<&ScopedVariableReference>,
    tag: &Expr,
    class_name: &str,
    runtime_expressions: &[Expr],
  ) {
    let Some(declaration) = declaration else {
      return;
    };
    if declaration.parts.len() != 1 {
      return;
    }
    let Some(target) = Self::fold_target(tag) else {
      return;
    };
    if !runtime_expressions
      .iter()
      .all(|expr| matches!(expr, Expr::Arrow(_)))
    {
      return;
    }
    // dynamic styled(Component) wrappers keep the runtime path - the $prop
    // forwarding semantics depend on the wrapped component
    if !runtime_expressions.is_empty() && matches!(target, FoldTarget::Component(_)) {
      return;
    }
    let previous = self.components.insert(
      declaration.id.clone(),
      FoldableComponent {
        target,
        class_name: class_name.into(),
        runtime_expressions: runtime_expressions.to_vec(),
      },
    );
    // a binding can only hold one styled component - a second registration
    // would mean the whole-initializer check in the visitor broke
    debug_assert!(previous.is_none());
  }

  /// Resolves the registry, then applies it to the module
  ///
  /// Must run before the utility import specifiers are collected as it may
  /// request the `mergeClassNames` utility or a native element import
  pub fn fold_module(&mut self, module: &mut Module, yak_imports: &mut YakImports) {
    if self.components.is_empty() {
      return;
    }
    let collapses = self.resolve(module);
    if self.components.is_empty() {
      return;
    }
    if !collapses.is_empty() {
      collapse_declarations(module, &collapses, yak_imports);
    }
    usage::fold(module, &self.components, yak_imports);
  }

  /// Drops the components that can not be folded and collapses the
  /// `styled(Parent)` chains
  ///
  /// Only components declared as a top level `const` are safe to fold (`const`
  /// rules out reassignment). A component fold target must be an immutable
  /// binding as well so it still references the styled component's wrapped value
  /// at every usage
  fn resolve(&mut self, module: &Module) -> Vec<Collapse> {
    let immutable = Self::immutable_bindings(module);
    let collapses = self.collapse_chains(&immutable);
    self.components.retain(|id, component| {
      immutable.contains_key(id)
        && match &component.target {
          FoldTarget::Native(_) => true,
          FoldTarget::Component(target) => immutable.contains_key(&target.to_id()),
        }
    });
    collapses
  }

  /// Collapses every `styled(Parent)` chain whose parent is a same-file, fully
  /// static component into the native element it resolves to
  ///
  /// The collapsed component's registry entry becomes a native target carrying
  /// the whole chain's class names, so its usages fold to that element like any
  /// other static component. The returned list drives the matching declaration
  /// rewrite
  fn collapse_chains(&mut self, immutable: &FxHashMap<Id, u32>) -> Vec<Collapse> {
    let mut collapses = Vec::new();
    for (id, component) in &self.components {
      let FoldTarget::Component(parent) = &component.target else {
        continue;
      };
      let mut seen = FxHashSet::default();
      if let Some((element, class_name)) = resolve_chain(&self.components, immutable, id, &mut seen)
      {
        collapses.push(Collapse {
          id: id.clone(),
          parent: parent.to_id(),
          element,
          class_name,
        });
      }
    }
    for collapse in &collapses {
      if let Some(component) = self.components.get_mut(&collapse.id) {
        component.target = FoldTarget::Native(collapse.element.clone());
        component.class_name = collapse.class_name.clone();
      }
    }
    collapses
  }

  /// Matches the tag shapes a JSX usage can be folded for:
  /// - `styled.element` and `styled("element")` with a native DOM element
  /// - `styled(Component)` with an uppercase component reference - a
  ///   lowercase name would be parsed as an intrinsic element in JSX
  ///
  /// `.attrs(...)` chains don't have any of these shapes
  fn fold_target(tag: &Expr) -> Option<FoldTarget> {
    match tag {
      Expr::Member(member) => {
        if !member.obj.is_ident() {
          return None;
        }
        let MemberProp::Ident(element) = &member.prop else {
          return None;
        };
        VALID_ELEMENTS
          .contains(element.sym.as_ref())
          .then(|| FoldTarget::Native(element.sym.clone()))
      }
      Expr::Call(call) => {
        if !matches!(&call.callee, Callee::Expr(callee) if callee.is_ident()) {
          return None;
        }
        let [arg] = call.args.as_slice() else {
          return None;
        };
        if arg.spread.is_some() {
          return None;
        }
        match &*arg.expr {
          Expr::Lit(Lit::Str(element)) => {
            let element = element.value.as_str()?;
            VALID_ELEMENTS
              .contains(element)
              .then(|| FoldTarget::Native(Atom::from(element)))
          }
          Expr::Ident(component) => component
            .sym
            .starts_with(|c: char| c.is_ascii_uppercase())
            .then(|| FoldTarget::Component(component.clone())),
          _ => None,
        }
      }
      _ => None,
    }
  }

  /// Maps every module scope binding which can not be reassigned to its source
  /// declaration order: top level `const X = ...` (including `export const`) and
  /// import bindings
  ///
  /// The order lets a chain require its parent to be declared first, so an
  /// out-of-order `styled(Parent)` - a const temporal dead zone error at module
  /// eval - is never collapsed into silently working output
  fn immutable_bindings(module: &Module) -> FxHashMap<Id, u32> {
    let mut bindings = FxHashMap::default();
    let mut order: u32 = 0;
    for item in &module.body {
      let var: &VarDecl = match item {
        ModuleItem::Stmt(Stmt::Decl(Decl::Var(var))) => var,
        ModuleItem::ModuleDecl(ModuleDecl::Import(import)) => {
          for specifier in &import.specifiers {
            let local = match specifier {
              ImportSpecifier::Named(named) => &named.local,
              ImportSpecifier::Default(default) => &default.local,
              ImportSpecifier::Namespace(namespace) => &namespace.local,
              #[cfg(swc_ast_unknown)]
              _ => continue,
            };
            bindings.insert(local.to_id(), order);
            order += 1;
          }
          continue;
        }
        ModuleItem::ModuleDecl(ModuleDecl::ExportDecl(export)) => {
          let Decl::Var(var) = &export.decl else {
            continue;
          };
          var
        }
        _ => continue,
      };
      if var.kind != VarDeclKind::Const {
        continue;
      }
      for declarator in &var.decls {
        if let Pat::Ident(name) = &declarator.name {
          bindings.insert(name.to_id(), order);
          order += 1;
        }
      }
    }
    bindings
  }
}

/// A `styled(Parent)` chain that collapses to a plain element: its declaration
/// and every usage carry the whole chain's class names directly
struct Collapse {
  /// the collapsing component's binding
  id: Id,
  /// the direct parent the declaration wraps, e.g. `Card` in `styled(Card)` -
  /// locates the `styled(Card)(...)` call in the compiled declaration
  parent: Id,
  /// the native element the whole chain resolves to
  element: Atom,
  /// the whole chain's class names
  class_name: Wtf8Atom,
}

/// Resolves a chain of `styled(Parent)` components to the native element and
/// merged class names it collapses into, parent-first
///
/// Returns `None` unless every link is a same-file, immutable, fully static
/// foldable component ending in a native element - a dynamic link keeps the
/// runtime chain, whose class-toggling conditions are not merged in
fn resolve_chain(
  components: &FxHashMap<Id, FoldableComponent>,
  immutable: &FxHashMap<Id, u32>,
  id: &Id,
  seen: &mut FxHashSet<Id>,
) -> Option<(Atom, Wtf8Atom)> {
  // a binding reachable twice would be a cycle - the const temporal dead zone
  // rules it out, but the guard keeps the recursion total
  if !immutable.contains_key(id) || !seen.insert(id.clone()) {
    return None;
  }
  let component = components.get(id)?;
  if !component.runtime_expressions.is_empty() {
    return None;
  }
  match &component.target {
    FoldTarget::Native(element) => Some((element.clone(), component.class_name.clone())),
    FoldTarget::Component(parent) => {
      let parent_id = parent.to_id();
      // a parent declared after the child hits the const temporal dead zone at
      // module eval - collapsing it would mask that `ReferenceError`
      if let (Some(child_order), Some(parent_order)) =
        (immutable.get(id), immutable.get(&parent_id))
      {
        if parent_order >= child_order {
          return None;
        }
      }
      let (element, parent_class) = resolve_chain(components, immutable, &parent_id, seen)?;
      Some((
        element,
        merge_class_names(&parent_class, &component.class_name),
      ))
    }
  }
}

/// Rewrites each collapsed component's compiled declaration from its
/// `styled(Parent)(...)` chain call into the plain `__yak.__yak_<element>(...)`
/// call carrying the whole chain's class names, matching a native styled
/// component
fn collapse_declarations(
  module: &mut Module,
  collapses: &[Collapse],
  yak_imports: &mut YakImports,
) {
  let by_id: FxHashMap<Id, &Collapse> = collapses
    .iter()
    .map(|collapse| (collapse.id.clone(), collapse))
    .collect();
  for item in &mut module.body {
    let var = match item {
      ModuleItem::Stmt(Stmt::Decl(Decl::Var(var))) => var,
      ModuleItem::ModuleDecl(ModuleDecl::ExportDecl(export)) => {
        let Decl::Var(var) = &mut export.decl else {
          continue;
        };
        var
      }
      _ => continue,
    };
    for declarator in &mut var.decls {
      let Pat::Ident(name) = &declarator.name else {
        continue;
      };
      let Some(collapse) = by_id.get(&name.to_id()) else {
        continue;
      };
      let Some(init) = declarator.init.as_deref_mut() else {
        continue;
      };
      let callee = yak_imports
        .get_yak_component_import(collapse.element.as_ref())
        .expect("a resolved chain element is a valid native element");
      init.visit_mut_with(&mut RewriteChainCall {
        parent: &collapse.parent,
        class_name: &collapse.class_name,
        callee: Some(callee),
      });
    }
  }
}

/// Replaces the `styled(Parent)(...)` call of a collapsed declaration with the
/// native `__yak.__yak_<element>("<chain classes>")` call, keeping the original
/// call's span so its `/*#__PURE__*/` and extracted-css comments stay attached
struct RewriteChainCall<'a> {
  parent: &'a Id,
  class_name: &'a Wtf8Atom,
  /// the `__yak.__yak_<element>` callee, taken once the chain call is found
  callee: Option<Box<Expr>>,
}

impl VisitMut for RewriteChainCall<'_> {
  fn visit_mut_expr(&mut self, expr: &mut Expr) {
    let Some(callee) = self.callee.take() else {
      return;
    };
    if let Expr::Call(call) = expr {
      if is_chain_call(call, self.parent) {
        *expr = Expr::Call(CallExpr {
          span: call.span,
          ctxt: SyntaxContext::empty(),
          callee: Callee::Expr(callee),
          args: vec![ExprOrSpread {
            spread: None,
            expr: str_expr(self.class_name.clone()),
          }],
          type_args: None,
        });
        return;
      }
    }
    // put the callee back and keep looking - only the chain call consumes it
    self.callee = Some(callee);
    expr.visit_mut_children_with(self);
  }
}

/// Matches the compiled `styled(Parent)(...)` call: a call whose callee is
/// itself a call taking the single wrapped-component argument `Parent`
fn is_chain_call(call: &CallExpr, parent: &Id) -> bool {
  let Callee::Expr(callee) = &call.callee else {
    return false;
  };
  let Expr::Call(inner) = &**callee else {
    return false;
  };
  let [arg] = inner.args.as_slice() else {
    return false;
  };
  arg.spread.is_none() && matches!(&*arg.expr, Expr::Ident(ident) if ident.to_id() == *parent)
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::utils::fold::css_expr::str_lit;
  use swc_core::common::{SyntaxContext, DUMMY_SP};
  use swc_core::ecma::ast::{CallExpr, ExprOrSpread, IdentName};

  fn call(callee: Expr, args: Vec<Expr>) -> Expr {
    Expr::Call(CallExpr {
      span: DUMMY_SP,
      callee: Callee::Expr(Box::new(callee)),
      args: args
        .into_iter()
        .map(|expr| ExprOrSpread {
          spread: None,
          expr: Box::new(expr),
        })
        .collect(),
      ctxt: SyntaxContext::empty(),
      type_args: None,
    })
  }

  fn member(obj: &str, prop: &str) -> Expr {
    Expr::Member(swc_core::ecma::ast::MemberExpr {
      span: DUMMY_SP,
      obj: Box::new(Expr::Ident(Ident::new(
        obj.into(),
        DUMMY_SP,
        SyntaxContext::empty(),
      ))),
      prop: MemberProp::Ident(IdentName::new(prop.into(), DUMMY_SP)),
    })
  }

  fn str_lit_expr(value: &str) -> Expr {
    Expr::Lit(Lit::Str(str_lit(value.into(), DUMMY_SP)))
  }

  fn ident(name: &str) -> Expr {
    Expr::Ident(Ident::new(name.into(), DUMMY_SP, SyntaxContext::empty()))
  }

  #[test]
  fn fold_target_matches_native_elements_and_components() {
    // styled.div
    assert_eq!(
      StyledFold::fold_target(&member("styled", "div")),
      Some(FoldTarget::Native("div".into()))
    );
    // styled("section")
    assert_eq!(
      StyledFold::fold_target(&call(ident("styled"), vec![str_lit_expr("section")])),
      Some(FoldTarget::Native("section".into()))
    );
    // styled(Component)
    assert!(matches!(
      StyledFold::fold_target(&call(ident("styled"), vec![ident("Component")])),
      Some(FoldTarget::Component(component)) if component.sym == *"Component"
    ));
    // styled.customElement
    assert_eq!(
      StyledFold::fold_target(&member("styled", "customElement")),
      None
    );
    // styled(lowercase) - would be parsed as an intrinsic element in JSX
    assert_eq!(
      StyledFold::fold_target(&call(ident("styled"), vec![ident("lowercase")])),
      None
    );
    // styled.div.attrs({ ... })
    assert_eq!(
      StyledFold::fold_target(&call(member("styled.div", "attrs"), vec![])),
      None
    );
  }
}

use std::borrow::Cow;

use rustc_hash::{FxHashMap, FxHashSet};
use swc_core::{
  atoms::{Atom, Wtf8Atom},
  common::{SyntaxContext, DUMMY_SP},
  ecma::ast::{
    ArrowExpr, AssignPatProp, BinExpr, BinaryOp, BlockStmt, BlockStmtOrExpr, Bool, CallExpr,
    Callee, Decl, Expr, ExprOrSpread, Id, Ident, IdentName, ImportSpecifier, Invalid, JSXAttr,
    JSXAttrName, JSXAttrOrSpread, JSXAttrValue, JSXElement, JSXElementChild, JSXElementName,
    JSXEmptyExpr, JSXExpr, JSXExprContainer, KeyValueProp, Lit, MemberProp, Module, ModuleDecl,
    ModuleItem, Number, ObjectPatProp, Pat, Prop, PropName, Stmt, UnaryExpr, UnaryOp, VarDecl,
    VarDeclKind,
  },
  ecma::visit::{VisitMut, VisitMutWith},
};

use crate::utils::class_name_fold::{
  append_condition_segment, class_name_attr, expr_attr_value, fold_condition_body, str_expr,
  str_lit, with_leading_space, ConditionSegment,
};
use crate::utils::native_elements::VALID_ELEMENTS;
use crate::utils::purity::{is_dup_pure, is_reorder_pure};
use crate::variable_visitor::ScopedVariableReference;
use crate::yak_imports::YakImports;

/// What a foldable JSX usage is rewritten to
#[derive(Debug, PartialEq)]
enum FoldTarget {
  /// A native DOM element e.g. "div" for styled.div
  Native(Atom),
  /// The wrapped component e.g. Card for styled(Card)
  Component(Ident),
}

/// A styled component whose JSX usages can be folded into their fold target
#[derive(Debug)]
struct FoldableComponent {
  target: FoldTarget,
  /// The generated static class name e.g. "ym7uBBu"
  class_name: Wtf8Atom,
  /// The compiled class-toggling expressions over props
  /// e.g. `({ $active }) => $active && css("ym7uBBu1")`
  /// Empty for fully static components; usages of dynamic components only
  /// fold if these can be inlined by substituting the props with the
  /// JSX attribute values
  runtime_expressions: Vec<Expr>,
}

/// Folds JSX usages of fully static styled components declared in the same
/// file into plain DOM elements to skip the runtime wrapper component
///
/// e.g.
/// ```jsx
/// const Card = styled.div`color: red;`;
/// <Card>Hello</Card>
/// ```
/// becomes
/// ```jsx
/// const Card = __yak.__yak_div("yX");
/// <div className="yX">Hello</div>
/// ```
///
/// A fully static `styled(Component)` wrapper folds to the wrapped component
/// instead - the target component may come from another file:
/// ```jsx
/// const Extended = styled(Card)`padding: 4px;`;
/// <Extended>Hello</Extended>
/// ```
/// becomes
/// ```jsx
/// <Card className="yE">Hello</Card>
/// ```
///
/// Class-toggling expressions over props are inlined at the usage by
/// substituting the destructured props with the attribute values:
/// ```jsx
/// const Box = styled.div`${({ $active }) => $active && css`color: red;`}`;
/// <Box $active={on}>Hello</Box>
/// ```
/// becomes
/// ```jsx
/// <div className={"yB" + (on ? " yA" : "")}>Hello</div>
/// ```
/// (no constant folding for literal values like `<Box $active>` - the
/// minifier simplifies `"yB" + (true ? " yA" : "")` in production)
///
/// The declaration is kept untouched - it is /*#__PURE__*/ annotated so the
/// minifier removes it if all usages could be folded and it is not exported
///
/// Foldable components are registered during the main transform pass and the
/// usages are rewritten in a deferred pass over the module, as a usage may
/// appear before the declaration (e.g. inside a hoisted function)
#[derive(Debug, Default)]
pub struct StyledJsxFold {
  components: FxHashMap<Id, FoldableComponent>,
}

impl StyledJsxFold {
  /// Registers a styled component if its JSX usages are foldable:
  /// - `declaration` is a plain variable e.g. Card in const Card = styled.div`...`
  /// - `tag` (the original tagged template tag) is styled.element,
  ///   styled("element") with a native DOM element or styled(Component) -
  ///   these shapes exclude .attrs(...) chains
  /// - `class_name` is the static class name the compiled call carries as
  ///   its first argument
  /// - `runtime_expressions` must all be class-toggling arrows/functions
  ///   over props - anything else (e.g. an unresolved mixin reference) keeps
  ///   the runtime path
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
      .all(|expr| matches!(expr, Expr::Arrow(_) | Expr::Fn(_)))
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

  /// Rewrites all foldable JSX usages of the registered components
  /// Must run before the utility import specifiers are collected as it may
  /// request the mergeClassNames utility
  pub fn fold_jsx_usages(&mut self, module: &mut Module, yak_imports: &mut YakImports) {
    if self.components.is_empty() {
      return;
    }
    // only components declared as top level const are safe to fold
    // (const rules out reassignment) - a component fold target must be an
    // immutable binding as well so it still references the styled component's
    // wrapped value at every usage
    let immutable = Self::immutable_bindings(module);
    self.components.retain(|id, component| {
      immutable.contains(id)
        && match &component.target {
          FoldTarget::Native(_) => true,
          FoldTarget::Component(target) => immutable.contains(&target.to_id()),
        }
    });
    if self.components.is_empty() {
      return;
    }
    module.visit_mut_with(&mut FoldVisitor {
      components: &self.components,
      yak_imports,
    });
  }

  /// Matches the tag shapes a JSX usage can be folded for:
  /// - `styled.element` and `styled("element")` with a native DOM element
  /// - `styled(Component)` with an uppercase component reference - a
  ///   lowercase name would be parsed as an intrinsic element in JSX
  ///
  /// .attrs(...) chains don't have any of these shapes
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

  /// Collects the module scope bindings which can not be reassigned:
  /// top level `const X = ...` declarations (including `export const`)
  /// and import bindings
  fn immutable_bindings(module: &Module) -> FxHashSet<Id> {
    let mut bindings = FxHashSet::default();
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
            bindings.insert(local.to_id());
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
          bindings.insert(name.to_id());
        }
      }
    }
    bindings
  }
}

/// The deferred pass which rewrites foldable JSX usages
struct FoldVisitor<'a> {
  components: &'a FxHashMap<Id, FoldableComponent>,
  yak_imports: &'a mut YakImports,
}

impl FoldVisitor<'_> {
  /// Folds a usage in place and returns the values its parent has to bind
  /// around the element, which is empty for every shape but the element-wrap
  ///
  /// The element cannot wrap itself: only whoever owns the node can put a call
  /// expression where a JSX element was, and each position needs a different
  /// container. Hence the split between this and the three visitor hooks.
  fn try_fold(&mut self, n: &mut JSXElement) -> Vec<Binding> {
    let JSXElementName::Ident(ident) = &n.opening.name else {
      return Vec::new();
    };
    // to_id() carries the scope context so a shadowed local with the same
    // name never matches
    let Some(component) = self.components.get(&ident.to_id()) else {
      return Vec::new();
    };
    // native elements can't take type arguments and the wrapper's type
    // parameters don't match the wrapped component's
    if n.opening.type_args.is_some() {
      return Vec::new();
    }
    let Some(plan) = self.fold_attrs(&n.opening.attrs, component) else {
      return Vec::new();
    };
    let tag = match &component.target {
      FoldTarget::Native(tag) => Ident::new(tag.clone(), ident.span, SyntaxContext::empty()),
      // keep the target's syntax context so the reference stays hygienic
      FoldTarget::Component(target) => Ident::new(target.sym.clone(), ident.span, target.ctxt),
    };
    n.opening.name = JSXElementName::Ident(tag.clone());
    if let Some(closing) = &mut n.closing {
      closing.name = JSXElementName::Ident(tag);
    }
    // the attributes which keep a bound value read its parameter instead - the
    // parent evaluates it once, before the element is built. This runs before
    // the className is placed, while the attribute indices still hold.
    for binding in &plan.bindings {
      if let Some(JSXAttrOrSpread::JSXAttr(attr)) = n.opening.attrs.get_mut(binding.attr_index) {
        attr.value = Some(expr_attr_value(Box::new(Expr::Ident(
          binding.param.clone(),
        ))));
      }
    }
    match plan.class_name {
      ClassNameFold::Insert(index, value) => n.opening.attrs.insert(index, class_name_attr(value)),
      ClassNameFold::Replace(index, value) => {
        let JSXAttrOrSpread::JSXAttr(attr) = &mut n.opening.attrs[index] else {
          // fold_attrs only records indices of plain JSXAttr entries
          unreachable!("className index points at a JSXAttr");
        };
        attr.value = Some(value);
      }
    }
    // the class-toggling expressions consumed the $props at compile time -
    // drop them all like the runtime does before the DOM
    if !component.runtime_expressions.is_empty() {
      n.opening.attrs.retain(|attr| !is_transient_prop(attr));
    }
    plan.bindings
  }
}

impl VisitMut for FoldVisitor<'_> {
  /// `<Card $a={f()}/>` in expression position, e.g. an arrow body
  fn visit_mut_expr(&mut self, expr: &mut Expr) {
    expr.visit_mut_children_with(self);
    let bindings = match expr {
      Expr::JSXElement(element) => self.try_fold(element),
      _ => return,
    };
    if bindings.is_empty() {
      return;
    }
    let element = std::mem::replace(expr, Expr::Invalid(Invalid { span: DUMMY_SP }));
    *expr = *bind_params(Box::new(element), bindings);
  }

  /// `<li><Card $a={f()}/></li>` and the same inside a fragment - both are a
  /// JSXElementChild, which cannot hold a call expression, so the wrapped
  /// element moves into braces
  fn visit_mut_jsx_element_child(&mut self, child: &mut JSXElementChild) {
    child.visit_mut_children_with(self);
    let bindings = match child {
      JSXElementChild::JSXElement(element) => self.try_fold(element),
      _ => return,
    };
    if bindings.is_empty() {
      return;
    }
    let JSXElementChild::JSXElement(element) = std::mem::replace(
      child,
      JSXElementChild::JSXExprContainer(JSXExprContainer {
        span: DUMMY_SP,
        expr: JSXExpr::JSXEmptyExpr(JSXEmptyExpr { span: DUMMY_SP }),
      }),
    ) else {
      unreachable!("the child was matched as a JSX element");
    };
    *child = JSXElementChild::JSXExprContainer(JSXExprContainer {
      span: DUMMY_SP,
      expr: JSXExpr::Expr(bind_params(Box::new(Expr::JSXElement(element)), bindings)),
    });
  }

  /// `<Foo icon=<Card $a={f()}/>/>` - the unbraced attribute value form
  fn visit_mut_jsx_attr_value(&mut self, value: &mut JSXAttrValue) {
    value.visit_mut_children_with(self);
    let bindings = match value {
      JSXAttrValue::JSXElement(element) => self.try_fold(element),
      _ => return,
    };
    if bindings.is_empty() {
      return;
    }
    let JSXAttrValue::JSXElement(element) = std::mem::replace(
      value,
      JSXAttrValue::JSXExprContainer(JSXExprContainer {
        span: DUMMY_SP,
        expr: JSXExpr::JSXEmptyExpr(JSXEmptyExpr { span: DUMMY_SP }),
      }),
    ) else {
      unreachable!("the value was matched as a JSX element");
    };
    *value = expr_attr_value(bind_params(Box::new(Expr::JSXElement(element)), bindings));
  }
}

/// Matches `$`-prefixed attributes like `$active`
fn is_transient_prop(attr: &JSXAttrOrSpread) -> bool {
  matches!(
    attr,
    JSXAttrOrSpread::JSXAttr(JSXAttr {
      name: JSXAttrName::Ident(name),
      ..
    }) if name.sym.starts_with('$')
  )
}

/// How the static class name is added to the folded element
enum ClassNameFold {
  /// No className attribute - insert `className="yX"` at this index
  ///
  /// The index is the end of the attribute list unless the className carries a
  /// parameter block, which has to evaluate where the props it binds used to
  Insert(usize, JSXAttrValue),
  /// Merge the static class into the existing className attribute value
  Replace(usize, JSXAttrValue),
}

/// What the visitor has to do to a foldable usage
struct FoldPlan {
  class_name: ClassNameFold,
  /// the values the parent binds around the element, in attribute source
  /// order - empty unless the usage takes the element-wrap
  bindings: Vec<Binding>,
}

/// One prop value which stays bound as a parameter because inlining it at every
/// read site would change how often it runs
struct Binding {
  /// the prop this stands in for, e.g. `$tilt`
  name: Atom,
  param: Ident,
  /// the attribute's source position - bindings are ordered by it, so the
  /// arguments evaluate in the order attribute position evaluated them
  attr_index: usize,
  value: Box<Expr>,
}

/// The complete case analysis - every foldable usage is exactly one of these
#[derive(Debug, PartialEq, Eq)]
enum FoldShape {
  /// every consumed value could be put back where it is read: today's output
  Inline,
  /// the values which stay bound are all `$`-props, which only the className
  /// has to see, and nothing observable sits between them
  ClassNameIife,
  /// a bound value also has to reach the element, or the parameter block would
  /// have to jump an observable evaluation: the element itself is wrapped, and
  /// captures everything in source order
  ElementWrap,
}

/// The class name(s) a folded usage contributes
enum YakClassName {
  /// A fully static component - mergeable into string literals at compile time
  Static(Wtf8Atom),
  /// A dynamic component - the base class concatenated with the inlined
  /// class-toggling conditions e.g. `"yX" + (on ? " yY" : "")`
  Dynamic(Box<Expr>),
}

impl YakClassName {
  fn into_expr(self) -> Box<Expr> {
    match self {
      YakClassName::Static(class_name) => str_expr(class_name),
      YakClassName::Dynamic(expr) => expr,
    }
  }
}

/// Where the folded className sits among the attributes, which is where its
/// parameter block evaluates
///
/// A merge keeps the user's className where it is. Otherwise the className goes
/// where the first bound prop was, so the parameter block evaluates exactly
/// where that prop's value used to - appending it would run every argument
/// after all the other attributes instead.
fn class_name_slot(
  attrs: &[JSXAttrOrSpread],
  bindings: &[Binding],
  class_name_index: Option<usize>,
) -> usize {
  class_name_index
    .or_else(|| bindings.first().map(|binding| binding.attr_index))
    .unwrap_or(attrs.len())
}

/// Decides the output shape of one usage
///
/// Pure data in, pure data out, so every row of the case analysis is a unit
/// test rather than a fixture run.
///
/// The parameter block evaluates at the className slot, so it moves across
/// every attribute between the slot and the props it binds. That is only exact
/// if nothing observable sits in the way. `$`-props never do: an unread one is
/// dropped and never evaluates at all, a value that could be put back where it
/// is read is pure by definition, and a bound one *is* what is moving.
fn select_shape(
  attrs: &[JSXAttrOrSpread],
  bindings: &[Binding],
  class_name_index: Option<usize>,
) -> FoldShape {
  let (Some(first), Some(last)) = (bindings.first(), bindings.last()) else {
    return FoldShape::Inline;
  };
  // a non-$ prop stays on the element, so its value has to reach both the
  // element and the className - only wrapping the element binds it once
  if bindings
    .iter()
    .any(|binding| !binding.name.starts_with('$'))
  {
    return FoldShape::ElementWrap;
  }
  let slot = class_name_slot(attrs, bindings, class_name_index);
  let span = first.attr_index.min(slot)..=last.attr_index.max(slot);
  for (index, attr) in attrs.iter().enumerate() {
    if !span.contains(&index) || Some(index) == class_name_index {
      continue;
    }
    let JSXAttrOrSpread::JSXAttr(attr) = attr else {
      continue;
    };
    let JSXAttrName::Ident(name) = &attr.name else {
      continue;
    };
    if name.sym.starts_with('$') {
      continue;
    }
    if !attr_value_is_reorder_pure(attr.value.as_ref()) {
      return FoldShape::ElementWrap;
    }
  }
  // the user's className expression composes around the parameter block, so it
  // evaluates after it - which only matches source order if every bound prop
  // came first
  if let Some(class_name_index) = class_name_index {
    let user_class_name = attrs.get(class_name_index).and_then(|attr| match attr {
      JSXAttrOrSpread::JSXAttr(attr) => attr.value.as_ref(),
      JSXAttrOrSpread::SpreadElement(_) => None,
      #[cfg(swc_ast_unknown)]
      _ => None,
    });
    if !attr_value_is_reorder_pure(user_class_name)
      && bindings
        .iter()
        .any(|binding| binding.attr_index > class_name_index)
    {
      return FoldShape::ElementWrap;
    }
  }
  FoldShape::ClassNameIife
}

/// Whether evaluating an attribute value somewhere else in the sequence is
/// unobservable - a bare attribute is the literal `true`
fn attr_value_is_reorder_pure(value: Option<&JSXAttrValue>) -> bool {
  match value {
    None | Some(JSXAttrValue::Str(_)) => true,
    Some(JSXAttrValue::JSXExprContainer(JSXExprContainer {
      expr: JSXExpr::Expr(expr),
      ..
    })) => is_reorder_pure(expr),
    Some(JSXAttrValue::JSXExprContainer(_)) => true,
    Some(JSXAttrValue::JSXElement(element)) => is_reorder_pure(&Expr::JSXElement(element.clone())),
    Some(JSXAttrValue::JSXFragment(fragment)) => {
      is_reorder_pure(&Expr::JSXFragment(fragment.clone()))
    }
    #[cfg(swc_ast_unknown)]
    Some(_) => false,
  }
}

/// `((<params>) => <class name>)(<values>)`
///
/// Binds each value once, in attribute source order, and substitutes the
/// parameter wherever the prop is read - which is exactly what attribute
/// position guaranteed before the fold inlined the component.
fn bind_params(class_name: Box<Expr>, bindings: Vec<Binding>) -> Box<Expr> {
  let params = bindings
    .iter()
    .map(|binding| Pat::Ident(binding.param.clone().into()))
    .collect();
  let args = bindings
    .into_iter()
    .map(|binding| ExprOrSpread {
      spread: None,
      expr: binding.value,
    })
    .collect();
  Box::new(Expr::Call(CallExpr {
    span: DUMMY_SP,
    ctxt: SyntaxContext::empty(),
    callee: Callee::Expr(Box::new(Expr::Arrow(ArrowExpr {
      span: DUMMY_SP,
      ctxt: SyntaxContext::empty(),
      params,
      body: Box::new(BlockStmtOrExpr::Expr(class_name)),
      is_async: false,
      is_generator: false,
      type_params: None,
      return_type: None,
    }))),
    args,
    type_args: None,
  }))
}

impl FoldVisitor<'_> {
  /// Checks all attributes and computes the folded className value
  /// Returns `None` if the usage is not foldable
  ///
  /// All other attributes (style, ref, event handlers, $props of fully
  /// static components) are forwarded unchanged - a fully static styled
  /// component passes them through to the DOM element or the wrapped
  /// component. Foreign $props are treated as user error and not filtered out
  fn fold_attrs(
    &mut self,
    attrs: &[JSXAttrOrSpread],
    component: &FoldableComponent,
  ) -> Option<FoldPlan> {
    let mut class_name_attr: Option<(usize, &JSXAttr)> = None;
    let mut seen: FxHashSet<&Atom> = FxHashSet::default();
    for (index, attr) in attrs.iter().enumerate() {
      match attr {
        // a spread may carry a className or other props only known at runtime
        JSXAttrOrSpread::SpreadElement(_) => return None,
        JSXAttrOrSpread::JSXAttr(attr) => {
          // everything below keys attributes by their plain name, so a
          // namespaced one (`xlink:href`) would be invisible to the ordering
          // analysis while still evaluating on the element - it would never
          // count as something the parameter block may not jump
          let JSXAttrName::Ident(name) = &attr.name else {
            return None;
          };
          // only the last of a repeated attribute is bound, so the earlier
          // expression would be left on the element and reordered, or dropped
          // with the $prop and never evaluated
          if !seen.insert(&name.sym) {
            return None;
          }
          match name.sym.as_ref() {
            // the runtime deletes the injected theme prop before the DOM
            "theme" => return None,
            // a css prop is folded before this pass runs - if it is still
            // present it is invalid and reported by the runtime path
            "css" => return None,
            "className" => class_name_attr = Some((index, attr)),
            _ => {}
          }
        }
        #[cfg(swc_ast_unknown)]
        _ => return None,
      }
    }
    let class_name_index = class_name_attr.map(|(index, _)| index);
    // the className carries the parameter block, so it can no longer just be
    // appended - it has to sit where the props it binds used to
    let mut slot = attrs.len();
    let mut capture = Vec::new();
    let mut user_class_name = class_name_attr.and_then(|(_, attr)| attr.value.clone());
    let yak_class = if component.runtime_expressions.is_empty() {
      YakClassName::Static(component.class_name.clone())
    } else {
      let attr_values = attr_value_map(attrs);
      let mut binder = ParamBinder::default();
      let mut class_name_expr =
        inline_runtime_expressions(component, &mut binder, self.yak_imports)?;
      let (bakeable, bindings) = binder.split(attrs, &attr_values);
      class_name_expr.visit_mut_with(&mut BakeParams { values: &bakeable });
      match select_shape(attrs, &bindings, class_name_index) {
        FoldShape::Inline => YakClassName::Dynamic(class_name_expr),
        FoldShape::ClassNameIife => {
          slot = class_name_slot(attrs, &bindings, class_name_index);
          YakClassName::Dynamic(bind_params(class_name_expr, bindings))
        }
        FoldShape::ElementWrap => {
          let read: FxHashSet<Atom> = binder.bound.keys().cloned().collect();
          capture = full_capture(attrs, &mut binder, &attr_values, &read);
          // the user's className is bound like any other value, so it composes
          // around the parameter block instead of evaluating inside it
          if let Some(binding) = capture.iter().find(|binding| binding.name == "className") {
            user_class_name = Some(expr_attr_value(Box::new(Expr::Ident(
              binding.param.clone(),
            ))));
          }
          // the parameters stay in the class name: the wrap binds them
          YakClassName::Dynamic(class_name_expr)
        }
      }
    };
    // every bail has to happen before this: merging registers the
    // `__yak_mergeClassNames` import, and a usage which bailed afterwards would
    // leave the specifier behind with nothing referencing it
    let Some(index) = class_name_index else {
      let value = match yak_class {
        YakClassName::Static(class_name) => JSXAttrValue::Str(str_lit(class_name, DUMMY_SP)),
        YakClassName::Dynamic(expr) => expr_attr_value(expr),
      };
      return Some(FoldPlan {
        class_name: ClassNameFold::Insert(slot, value),
        bindings: capture,
      });
    };
    let value = self.merge_class_name(&user_class_name?, yak_class)?;
    Some(FoldPlan {
      class_name: ClassNameFold::Replace(index, value),
      bindings: capture,
    })
  }

  /// Merges the folded yak class name with an existing className value
  /// The class names are unique so the order doesn't matter and no
  /// deduplication is needed
  /// - string literals are merged at compile time
  /// - other expressions are merged through the mergeClassNames runtime
  ///   helper which evaluates the expression only once
  fn merge_class_name(
    &mut self,
    value: &JSXAttrValue,
    yak_class: YakClassName,
  ) -> Option<JSXAttrValue> {
    match value {
      // className="user"
      JSXAttrValue::Str(user) => Some(match yak_class {
        YakClassName::Static(class_name) => JSXAttrValue::Str(str_lit(
          merged_class_names(&class_name, &user.value),
          user.span,
        )),
        // `"yX" + (on ? " yY" : "") + " user"`
        YakClassName::Dynamic(expr) => {
          expr_attr_value(append_class_name_str(expr, &user.value, user.span))
        }
      }),
      JSXAttrValue::JSXExprContainer(JSXExprContainer {
        expr: JSXExpr::Expr(user),
        ..
      }) => {
        let merged = match &**user {
          // className={"user"} - keep the span so an attached
          // /*YAK Extracted CSS:*/ comment from a folded css prop survives
          Expr::Lit(Lit::Str(user)) => match yak_class {
            YakClassName::Static(class_name) => Box::new(Expr::Lit(Lit::Str(str_lit(
              merged_class_names(&class_name, &user.value),
              user.span,
            )))),
            YakClassName::Dynamic(expr) => append_class_name_str(expr, &user.value, user.span),
          },
          _ => Box::new(Expr::Call(CallExpr {
            span: DUMMY_SP,
            callee: Callee::Expr(Box::new(Expr::Ident(
              self.yak_imports.get_yak_utility_ident("mergeClassNames"),
            ))),
            args: vec![
              ExprOrSpread {
                spread: None,
                expr: yak_class.into_expr(),
              },
              ExprOrSpread {
                spread: None,
                expr: user.clone(),
              },
            ],
            ctxt: SyntaxContext::empty(),
            type_args: None,
          })),
        };
        Some(expr_attr_value(merged))
      }
      _ => None,
    }
  }
}

/// Inlines the class-toggling expressions of a dynamic component at a JSX
/// usage into a single className expression
/// e.g. `"yX" + (on ? " yY" : "")` for `<Box $active={on}>`
fn inline_runtime_expressions(
  component: &FoldableComponent,
  binder: &mut ParamBinder,
  yak_imports: &YakImports,
) -> Option<Box<Expr>> {
  // every prop read becomes a parameter first, so "was this prop read" is
  // exact by construction rather than a second analysis which could disagree
  let mut class_name_expr = str_expr(component.class_name.clone());
  for expression in &component.runtime_expressions {
    let segment = inline_expression(expression, binder, yak_imports)?;
    class_name_expr = append_condition_segment(class_name_expr, segment);
  }
  Some(class_name_expr)
}

/// Every attribute value the element-wrap binds: everything the usage evaluates
/// which cannot move
///
/// Capturing all of them, rather than only the props the conditions read, is
/// what makes the element-wrap exact by construction. The arguments then
/// evaluate in attribute source order and the element itself only reads
/// parameters, so nothing can jump anything: without it
/// `<Button id={g()} disabled={f()}/>` would run `f` before `g`.
fn full_capture<'a>(
  attrs: &'a [JSXAttrOrSpread],
  binder: &mut ParamBinder,
  attr_values: &FxHashMap<Atom, Cow<'a, Expr>>,
  read: &FxHashSet<Atom>,
) -> Vec<Binding> {
  let mut bindings: Vec<Binding> = Vec::new();
  for (attr_index, name) in attr_names(attrs) {
    let Some(value) = attr_values.get(&name) else {
      continue;
    };
    let is_read = read.contains(&name);
    // an unread $prop is dropped before the DOM, so it never evaluates at all
    if !is_read && name.starts_with('$') {
      continue;
    }
    // a value which may move stays where it is, and a value the conditions
    // read has already been put back wherever that was safe
    if if is_read {
      is_dup_pure(value)
    } else {
      is_reorder_pure(value)
    } {
      continue;
    }
    // a repeated attribute binds its last value, like React reads it
    bindings.retain(|binding| binding.name != name);
    bindings.push(Binding {
      param: binder.param_for(&name),
      name,
      attr_index,
      value: Box::new(Expr::clone(value)),
    });
  }
  bindings
}

/// Inlines one class-toggling expression by substituting its prop reads
/// with the JSX attribute values, e.g. with `$active={on}`:
/// `({ $active }) => $active && css("yY")` becomes the segment `on ? " yY" : ""`
///
/// The condition shape is folded before substituting: the class names are
/// verified static, so props can only appear inside the condition expression
/// and unfoldable shapes bail before any substitution work
///
/// The props parameter must be a plain object destructuring or an identifier
/// read through plain members (`(p) => p.$active`) - `theme` and props like
/// `children` which are not plain attributes bail.
///
/// Every read is replaced by the prop's [ParamBinder] parameter rather than by
/// the attribute value directly. [BakeParams] then puts the value back wherever
/// inlining it cannot be observed; whatever is left keeps its parameter and is
/// bound once at the usage site.
fn inline_expression(
  expression: &Expr,
  binder: &mut ParamBinder,
  yak_imports: &YakImports,
) -> Option<ConditionSegment> {
  let (params, body): (Vec<&Pat>, &Expr) = match expression {
    Expr::Arrow(arrow) if !arrow.is_async && !arrow.is_generator => {
      let body = match &*arrow.body {
        BlockStmtOrExpr::Expr(expr) => &**expr,
        BlockStmtOrExpr::BlockStmt(block) => single_return_expr(block)?,
        #[cfg(swc_ast_unknown)]
        _ => return None,
      };
      (arrow.params.iter().collect(), body)
    }
    Expr::Fn(function) if !function.function.is_async && !function.function.is_generator => (
      function
        .function
        .params
        .iter()
        .map(|param| &param.pat)
        .collect(),
      single_return_expr(function.function.body.as_ref()?)?,
    ),
    _ => return None,
  };
  let (mut condition, cons_class, alt_class) = fold_condition_body(body, yak_imports)?;
  match params.as_slice() {
    // e.g. `${() => darkMode && css`...`}` - references the outer scope only
    [] => {}
    [Pat::Object(param)] => {
      let mut props = FxHashMap::default();
      for prop in &param.props {
        // only plain destructuring - renames, defaults and rest bail
        let ObjectPatProp::Assign(AssignPatProp {
          key, value: None, ..
        }) = prop
        else {
          return None;
        };
        // the runtime passes more than the attributes to the expressions -
        // only plain props can be substituted
        if is_runtime_injected_prop(&key.sym) {
          return None;
        }
        props.insert(key.to_id(), key.sym.clone());
      }
      // every remaining reference is a plain prop read - the keys which could
      // not be substituted bailed above
      condition.visit_mut_with(&mut SubstituteProps {
        props: &props,
        binder,
      });
    }
    // e.g. `${(p) => p.$active && css`...`}` - plain member reads on the
    // props parameter substitute like destructured props; any other use of
    // the parameter (e.g. forwarding it with `calculate(p)`) bails
    [Pat::Ident(param)] => {
      let mut substitution = SubstituteMemberProps {
        param: param.to_id(),
        binder,
        failed: false,
      };
      condition.visit_mut_with(&mut substitution);
      if substitution.failed {
        return None;
      }
    }
    _ => return None,
  }
  Some((condition, cons_class, alt_class))
}

/// The runtime passes more than the plain attributes to the class-toggling
/// expressions - these props can not be substituted from the JSX attributes
///
/// `key` is listed for the opposite reason: React strips it before the
/// component sees props, so the runtime path reads `undefined` while a
/// substituted fold would see the attribute value - reading it must bail
///
/// `ref` is deliberately absent even though it looks like the same case: on
/// React 18 it was, but React 19 - which is the minimum next-yak supports -
/// passes `ref` as an ordinary prop, so the runtime and the fold read the same
/// value. Listing it would only cost folds.
fn is_runtime_injected_prop(name: &Atom) -> bool {
  matches!(
    name.as_ref(),
    "theme" | "children" | "className" | "style" | "key"
  )
}

/// Maps the attribute names to their value expressions for substitution
/// A bare attribute (`<Box $active>`) counts as `true`
/// Values are borrowed where possible and only cloned when substituted
fn attr_value_map(attrs: &[JSXAttrOrSpread]) -> FxHashMap<Atom, Cow<'_, Expr>> {
  let mut values = FxHashMap::default();
  for attr in attrs {
    let JSXAttrOrSpread::JSXAttr(attr) = attr else {
      continue;
    };
    let JSXAttrName::Ident(name) = &attr.name else {
      continue;
    };
    let value = match &attr.value {
      None => Cow::Owned(Expr::Lit(Lit::Bool(Bool {
        span: DUMMY_SP,
        value: true,
      }))),
      Some(JSXAttrValue::Str(value)) => Cow::Owned(Expr::Lit(Lit::Str(value.clone()))),
      Some(JSXAttrValue::JSXExprContainer(JSXExprContainer {
        expr: JSXExpr::Expr(expr),
        ..
      })) => Cow::Borrowed(&**expr),
      Some(JSXAttrValue::JSXElement(element)) => Cow::Owned(Expr::JSXElement(element.clone())),
      Some(JSXAttrValue::JSXFragment(fragment)) => Cow::Owned(Expr::JSXFragment(fragment.clone())),
      _ => continue,
    };
    values.insert(name.sym.clone(), value);
  }
  values
}

/// Hands out one parameter per prop name while the conditions are substituted
///
/// Binding during the substitution itself, rather than counting reads in a
/// separate pass, is deliberate: a separate pass would have to replicate every
/// rule about what actually substitutes - runtime injected props, computed
/// access, the whole-props escape - and the two copies would drift.
///
/// One parameter per prop *name*, so a prop read by two conditions, or twice by
/// one condition, is still bound exactly once.
#[derive(Default)]
struct ParamBinder {
  /// prop name -> the parameter standing in for every read of it
  bound: FxHashMap<Atom, Ident>,
  /// the parameter names handed out so far - deriving the name from the prop
  /// is lossy, so two props can arrive at one name
  used: FxHashSet<Atom>,
}

impl ParamBinder {
  /// The parameter standing in for `name`, created on first read
  ///
  /// Carries the same `__yak_` prefix as the other synthesized bindings, and
  /// for the same reason: the parameter shares a scope with the attribute
  /// values baked in around it, so a bare `$tilt` would capture the user's own
  /// `$tilt` in `<Row $tilt={f()} $b={$tilt} />`.
  fn param_for(&mut self, name: &Atom) -> Ident {
    if let Some(param) = self.bound.get(name) {
      return param.clone();
    }
    // an attribute name is not always an identifier: `data-x` has to become
    // `data_x` to be one, which `data_x` itself already is. A duplicate
    // parameter is a SyntaxError, so disambiguate rather than emit one.
    let sanitized: String = name
      .chars()
      .map(|char| {
        if char.is_alphanumeric() || char == '$' {
          char
        } else {
          '_'
        }
      })
      .collect();
    let mut candidate: Atom = format!("__yak_{sanitized}").into();
    let mut suffix = 2;
    while !self.used.insert(candidate.clone()) {
      candidate = format!("__yak_{sanitized}{suffix}").into();
      suffix += 1;
    }
    let param = Ident::from(candidate.as_str());
    self.bound.insert(name.clone(), param.clone());
    param
  }

  /// Splits the props the conditions read into the values which may be put back
  /// where they are read, and the ones which have to stay bound
  ///
  /// The gate is dup-purity, not "is it read twice": a single read is enough to
  /// change the count, because that read can sit inside a callback or behind a
  /// short circuit.
  fn split<'a>(
    &self,
    attrs: &'a [JSXAttrOrSpread],
    attr_values: &FxHashMap<Atom, Cow<'a, Expr>>,
  ) -> (FxHashMap<Id, Cow<'a, Expr>>, Vec<Binding>) {
    let mut bakeable = FxHashMap::default();
    let mut bindings = Vec::new();
    // walking the attributes rather than the bound props gives source order for
    // free, and lets a repeated attribute bind its last value like React reads it
    for (index, name) in attr_names(attrs) {
      let (Some(param), Some(value)) = (self.bound.get(&name), attr_values.get(&name)) else {
        continue;
      };
      if is_dup_pure(value) {
        bakeable.insert(param.to_id(), value.clone());
      } else {
        bindings.retain(|binding: &Binding| binding.name != name);
        bindings.push(Binding {
          name,
          param: param.clone(),
          attr_index: index,
          value: Box::new(Expr::clone(value)),
        });
      }
    }
    // a prop the usage never passes is `undefined`, which always inlines
    for (name, param) in &self.bound {
      if !attr_values.contains_key(name) {
        bakeable.insert(param.to_id(), Cow::Owned(undefined_expr()));
      }
    }
    bindings.sort_by_key(|binding| binding.attr_index);
    (bakeable, bindings)
  }
}

/// The name and source position of every named attribute, in source order
fn attr_names(attrs: &[JSXAttrOrSpread]) -> impl Iterator<Item = (usize, Atom)> + '_ {
  attrs.iter().enumerate().filter_map(|(index, attr)| {
    let JSXAttrOrSpread::JSXAttr(JSXAttr {
      name: JSXAttrName::Ident(name),
      ..
    }) = attr
    else {
      return None;
    };
    Some((index, name.sym.clone()))
  })
}

/// Replaces the destructured prop references with the prop's parameter
struct SubstituteProps<'a> {
  /// the local binding introduced by the destructuring -> prop name
  props: &'a FxHashMap<Id, Atom>,
  binder: &'a mut ParamBinder,
}

impl SubstituteProps<'_> {
  fn param_for(&mut self, ident: &Ident) -> Option<Ident> {
    let name = self.props.get(&ident.to_id())?.clone();
    Some(self.binder.param_for(&name))
  }
}

impl VisitMut for SubstituteProps<'_> {
  fn visit_mut_expr(&mut self, expr: &mut Expr) {
    if let Expr::Ident(ident) = expr {
      if let Some(param) = self.param_for(ident) {
        *expr = Expr::Ident(param);
        return;
      }
    }
    expr.visit_mut_children_with(self);
  }

  // expand a shorthand `{ $active }` to `{ $active: <param> }`
  fn visit_mut_prop(&mut self, prop: &mut Prop) {
    if let Prop::Shorthand(ident) = prop {
      if let Some(param) = self.param_for(ident) {
        *prop = Prop::KeyValue(KeyValueProp {
          key: PropName::Ident(IdentName::new(ident.sym.clone(), ident.span)),
          value: Box::new(Expr::Ident(param)),
        });
        return;
      }
    }
    prop.visit_mut_children_with(self);
  }
}

/// Replaces plain `p.prop` member reads on the props parameter with the prop's
/// parameter - the identifier param counterpart of [SubstituteProps]
/// Any other use of the parameter escapes the whole props object (forwarding
/// it with `calculate(p)`, spreads, computed access) and bails
struct SubstituteMemberProps<'a> {
  param: Id,
  binder: &'a mut ParamBinder,
  failed: bool,
}

impl VisitMut for SubstituteMemberProps<'_> {
  fn visit_mut_expr(&mut self, expr: &mut Expr) {
    if let Expr::Member(member) = expr {
      if matches!(&*member.obj, Expr::Ident(obj) if obj.to_id() == self.param) {
        if let MemberProp::Ident(name) = &member.prop {
          // the runtime passes more than the attributes to the expressions -
          // only plain props can be substituted
          if is_runtime_injected_prop(&name.sym) {
            self.failed = true;
            return;
          }
          *expr = Expr::Ident(self.binder.param_for(&name.sym));
          return;
        }
      }
    }
    if matches!(expr, Expr::Ident(ident) if ident.to_id() == self.param) {
      self.failed = true;
      return;
    }
    expr.visit_mut_children_with(self);
  }

  // a shorthand `{ p }` also escapes the whole props object
  fn visit_mut_prop(&mut self, prop: &mut Prop) {
    if matches!(prop, Prop::Shorthand(ident) if ident.to_id() == self.param) {
      self.failed = true;
      return;
    }
    prop.visit_mut_children_with(self);
  }
}

/// Puts an attribute value back where its parameter is read, dropping the
/// parameter
///
/// A parameter which survives this is bound once at the usage site instead.
struct BakeParams<'a> {
  values: &'a FxHashMap<Id, Cow<'a, Expr>>,
}

impl VisitMut for BakeParams<'_> {
  fn visit_mut_expr(&mut self, expr: &mut Expr) {
    if let Expr::Ident(ident) = expr {
      if let Some(value) = self.values.get(&ident.to_id()) {
        *expr = Expr::clone(value);
        return;
      }
    }
    expr.visit_mut_children_with(self);
  }
}

/// Matches a function body holding a single `return <expr>;`
fn single_return_expr(block: &BlockStmt) -> Option<&Expr> {
  let [Stmt::Return(return_stmt)] = block.stmts.as_slice() else {
    return None;
  };
  return_stmt.arg.as_deref()
}

/// `undefined` for absent attributes
fn undefined_expr() -> Expr {
  Expr::Unary(UnaryExpr {
    span: DUMMY_SP,
    op: UnaryOp::Void,
    arg: Box::new(Expr::Lit(Lit::Num(Number {
      span: DUMMY_SP,
      value: 0.0,
      raw: None,
    }))),
  })
}

/// `<class_name_expr> + " user"` keeping the user span so an attached
/// /*YAK Extracted CSS:*/ comment from a folded css prop survives
fn append_class_name_str(
  class_name_expr: Box<Expr>,
  user_class_name: &Wtf8Atom,
  span: swc_core::common::Span,
) -> Box<Expr> {
  Box::new(Expr::Bin(BinExpr {
    span: DUMMY_SP,
    op: BinaryOp::Add,
    left: class_name_expr,
    right: Box::new(Expr::Lit(Lit::Str(str_lit(
      with_leading_space(user_class_name),
      span,
    )))),
  }))
}

fn merged_class_names(yak_class_name: &Wtf8Atom, user_class_name: &Wtf8Atom) -> Wtf8Atom {
  format!(
    "{} {}",
    yak_class_name.to_string_lossy(),
    user_class_name.to_string_lossy()
  )
  .into()
}

#[cfg(test)]
mod tests {
  use super::*;
  use swc_core::common::sync::Lrc;
  use swc_core::common::{FileName, SourceMap};
  use swc_core::ecma::ast::EsVersion;
  use swc_core::ecma::parser::{lexer::Lexer, Parser, StringInput, Syntax, TsSyntax};

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
      StyledJsxFold::fold_target(&member("styled", "div")),
      Some(FoldTarget::Native("div".into()))
    );
    // styled("section")
    assert_eq!(
      StyledJsxFold::fold_target(&call(ident("styled"), vec![str_lit_expr("section")])),
      Some(FoldTarget::Native("section".into()))
    );
    // styled(Component)
    assert!(matches!(
      StyledJsxFold::fold_target(&call(ident("styled"), vec![ident("Component")])),
      Some(FoldTarget::Component(component)) if component.sym == *"Component"
    ));
    // styled.customElement
    assert_eq!(
      StyledJsxFold::fold_target(&member("styled", "customElement")),
      None
    );
    // styled(lowercase) - would be parsed as an intrinsic element in JSX
    assert_eq!(
      StyledJsxFold::fold_target(&call(ident("styled"), vec![ident("lowercase")])),
      None
    );
    // styled.div.attrs({ ... })
    assert_eq!(
      StyledJsxFold::fold_target(&call(member("styled.div", "attrs"), vec![])),
      None
    );
  }

  /// The attributes of a parsed `<Row … />`
  fn attrs_of(source: &str) -> Vec<JSXAttrOrSpread> {
    let cm: Lrc<SourceMap> = Default::default();
    let fm = cm.new_source_file(Lrc::new(FileName::Anon), source.to_string());
    let lexer = Lexer::new(
      Syntax::Typescript(TsSyntax {
        tsx: true,
        ..Default::default()
      }),
      EsVersion::latest(),
      StringInput::from(&*fm),
      None,
    );
    let expr = Parser::new_from(lexer)
      .parse_expr()
      .unwrap_or_else(|err| panic!("failed to parse `{source}`: {err:?}"));
    match *expr {
      Expr::JSXElement(element) => element.opening.attrs,
      _ => panic!("`{source}` is not a JSX element"),
    }
  }

  /// The shape a usage takes, given which of its props the style conditions
  /// read and could not put back - which is what the [ParamBinder] and
  /// [ParamBinder::split] establish at fold time
  fn shape_of(source: &str, bound: &[&str]) -> FoldShape {
    let attrs = attrs_of(source);
    let class_name_index = attr_names(&attrs)
      .find(|(_, name)| name == "className")
      .map(|(index, _)| index);
    let bindings: Vec<Binding> = attr_names(&attrs)
      .filter(|(_, name)| bound.contains(&name.as_ref()))
      .map(|(index, name)| Binding {
        param: Ident::from(format!("__yak_{name}")),
        name,
        attr_index: index,
        // select_shape decides on positions and prop names; the value it binds
        // has already been judged impure by then
        value: Box::new(Expr::Ident(Ident::from("bound_value"))),
      })
      .collect();
    select_shape(&attrs, &bindings, class_name_index)
  }

  #[test]
  fn a_parameter_name_is_never_handed_out_twice() {
    let mut binder = ParamBinder::default();
    // `data-x` has to be sanitized to be an identifier, and `data_x` already
    // is one - so both want `__yak_data_x`, and two parameters of one name are
    // a SyntaxError rather than a divergence
    let dashed = binder.param_for(&"data-x".into());
    let underscored = binder.param_for(&"data_x".into());
    assert_ne!(dashed.sym, underscored.sym);
    // …while one prop keeps one parameter however often it is read
    assert_eq!(binder.param_for(&"data-x".into()).sym, dashed.sym);
  }

  #[test]
  fn nothing_bound_stays_on_todays_output() {
    assert_eq!(shape_of("<Row $a={size} />", &[]), FoldShape::Inline);
    assert_eq!(shape_of("<Row />", &[]), FoldShape::Inline);
  }

  #[test]
  fn bound_transient_props_only_need_the_class_name() {
    assert_eq!(
      shape_of("<Row $a={f()} />", &["$a"]),
      FoldShape::ClassNameIife
    );
    assert_eq!(
      shape_of("<Row $a={f()} $b={g()} />", &["$a", "$b"]),
      FoldShape::ClassNameIife
    );
    // an impure attribute outside the span the block moves across keeps its
    // order either way
    assert_eq!(
      shape_of("<Row id={g()} $a={f()} />", &["$a"]),
      FoldShape::ClassNameIife
    );
    assert_eq!(
      shape_of("<Row $a={f()} id={g()} />", &["$a"]),
      FoldShape::ClassNameIife
    );
  }

  #[test]
  fn a_bound_prop_kept_on_the_element_wraps_it() {
    // the value has to reach the DOM attribute and the className, and only one
    // binding around both can do that
    assert_eq!(
      shape_of("<Button disabled={f()} />", &["disabled"]),
      FoldShape::ElementWrap
    );
  }

  #[test]
  fn an_evaluation_the_block_cannot_jump_wraps_the_element() {
    // g() ran before h() in attribute position; binding f() and h() together
    // would run it after
    assert_eq!(
      shape_of("<Row $a={f()} id={g()} $b={h()} />", &["$a", "$b"]),
      FoldShape::ElementWrap
    );
    // a reorder-pure obstacle is not one - this is what keeps event handlers,
    // and style objects, on the cheap shape
    assert_eq!(
      shape_of(
        "<Row $a={f()} onClick={() => t()} $b={h()} />",
        &["$a", "$b"]
      ),
      FoldShape::ClassNameIife
    );
    assert_eq!(
      shape_of(
        "<Row $a={f()} style={{ top: 0 }} $b={h()} />",
        &["$a", "$b"]
      ),
      FoldShape::ClassNameIife
    );
    // an unread $prop is dropped and never evaluates, so it is never in the way
    assert_eq!(
      shape_of("<Row $a={f()} $unread={g()} $b={h()} />", &["$a", "$b"]),
      FoldShape::ClassNameIife
    );
  }

  #[test]
  fn a_user_class_name_composes_around_the_parameter_block() {
    // a string merges at compile time and evaluates nothing
    assert_eq!(
      shape_of(r#"<Row $a={f()} className="user" />"#, &["$a"]),
      FoldShape::ClassNameIife
    );
    // cn(x) composes after the block, which is where it already ran
    assert_eq!(
      shape_of("<Row $a={f()} className={cn(x)} />", &["$a"]),
      FoldShape::ClassNameIife
    );
    // …but here it ran *before* f(), and composing would run it after
    assert_eq!(
      shape_of("<Row className={cn(x)} $a={f()} />", &["$a"]),
      FoldShape::ElementWrap
    );
    // a className which evaluates nothing has no order to keep
    assert_eq!(
      shape_of("<Row className={cx} $a={f()} />", &["$a"]),
      FoldShape::ClassNameIife
    );
  }
}

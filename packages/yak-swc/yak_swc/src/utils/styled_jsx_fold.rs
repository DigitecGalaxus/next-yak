use std::borrow::Cow;

use rustc_hash::{FxHashMap, FxHashSet};
use swc_core::{
  atoms::{Atom, Wtf8Atom},
  common::{SyntaxContext, DUMMY_SP},
  ecma::ast::{
    AssignPatProp, BinExpr, BinaryOp, BlockStmt, BlockStmtOrExpr, Bool, CallExpr, Callee, Decl,
    Expr, ExprOrSpread, Id, Ident, IdentName, ImportSpecifier, JSXAttr, JSXAttrName,
    JSXAttrOrSpread, JSXAttrValue, JSXElement, JSXElementName, JSXExpr, JSXExprContainer,
    KeyValueProp, Lit, MemberProp, Module, ModuleDecl, ModuleItem, Number, ObjectPatProp, Pat,
    Prop, PropName, Stmt, UnaryExpr, UnaryOp, VarDecl, VarDeclKind,
  },
  ecma::visit::{VisitMut, VisitMutWith},
};

use crate::utils::class_name_fold::{
  append_condition_segment, class_name_attr, expr_attr_value, fold_condition_body, str_expr,
  str_lit, with_leading_space, ConditionSegment,
};
use crate::utils::native_elements::VALID_ELEMENTS;
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

impl VisitMut for FoldVisitor<'_> {
  fn visit_mut_jsx_element(&mut self, n: &mut JSXElement) {
    n.visit_mut_children_with(self);
    let JSXElementName::Ident(ident) = &n.opening.name else {
      return;
    };
    // to_id() carries the scope context so a shadowed local with the same
    // name never matches
    let Some(component) = self.components.get(&ident.to_id()) else {
      return;
    };
    // native elements can't take type arguments and the wrapper's type
    // parameters don't match the wrapped component's
    if n.opening.type_args.is_some() {
      return;
    }
    let Some(class_name_fold) = self.fold_attrs(&n.opening.attrs, component) else {
      return;
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
    match class_name_fold {
      ClassNameFold::Append(value) => n.opening.attrs.push(class_name_attr(value)),
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
  /// No className attribute - append className="yX"
  Append(JSXAttrValue),
  /// Merge the static class into the existing className attribute value
  Replace(usize, JSXAttrValue),
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
  ) -> Option<ClassNameFold> {
    let mut class_name_attr: Option<(usize, &JSXAttr)> = None;
    for (index, attr) in attrs.iter().enumerate() {
      match attr {
        // a spread may carry a className or other props only known at runtime
        JSXAttrOrSpread::SpreadElement(_) => return None,
        JSXAttrOrSpread::JSXAttr(attr) => {
          let JSXAttrName::Ident(name) = &attr.name else {
            continue;
          };
          match name.sym.as_ref() {
            // the runtime deletes the injected theme prop before the DOM
            "theme" => return None,
            // a css prop is folded before this pass runs - if it is still
            // present it is invalid and reported by the runtime path
            "css" => return None,
            "className" => {
              if class_name_attr.is_some() {
                return None;
              }
              class_name_attr = Some((index, attr));
            }
            _ => {}
          }
        }
        #[cfg(swc_ast_unknown)]
        _ => return None,
      }
    }
    let yak_class = if component.runtime_expressions.is_empty() {
      YakClassName::Static(component.class_name.clone())
    } else {
      YakClassName::Dynamic(inline_runtime_expressions(
        component,
        attrs,
        self.yak_imports,
      )?)
    };
    let Some((index, attr)) = class_name_attr else {
      let value = match yak_class {
        YakClassName::Static(class_name) => JSXAttrValue::Str(str_lit(class_name, DUMMY_SP)),
        YakClassName::Dynamic(expr) => expr_attr_value(expr),
      };
      return Some(ClassNameFold::Append(value));
    };
    let value = self.merge_class_name(attr.value.as_ref()?, yak_class)?;
    Some(ClassNameFold::Replace(index, value))
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
  attrs: &[JSXAttrOrSpread],
  yak_imports: &YakImports,
) -> Option<Box<Expr>> {
  let attr_values = attr_value_map(attrs);
  let mut class_name_expr = str_expr(component.class_name.clone());
  for expression in &component.runtime_expressions {
    let segment = inline_expression(expression, &attr_values, yak_imports)?;
    class_name_expr = append_condition_segment(class_name_expr, segment);
  }
  Some(class_name_expr)
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
/// `children` which are not plain attributes bail. A `$`-prop expression
/// referenced once is inlined as-is: the `$` attribute is dropped from the
/// folded element, so it is still evaluated exactly once, only its
/// evaluation position may move relative to the other attributes which is
/// fine as a render must not rely on attribute evaluation order. Referenced
/// more than once - or kept on the element as a non-$ attribute - the
/// expression is duplicated and must be safe to duplicate
fn inline_expression(
  expression: &Expr,
  attr_values: &FxHashMap<Atom, Cow<Expr>>,
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
      let mut replacements = FxHashMap::default();
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
        // an absent attribute is undefined as spreads bail
        let value = attr_values
          .get(&key.sym)
          .cloned()
          .unwrap_or_else(|| Cow::Owned(undefined_expr()));
        replacements.insert(key.to_id(), value);
      }
      let mut substitution = SubstituteProps {
        replacements: &replacements,
        substituted: FxHashSet::default(),
        failed: false,
      };
      condition.visit_mut_with(&mut substitution);
      if substitution.failed {
        return None;
      }
    }
    // e.g. `${(p) => p.$active && css`...`}` - plain member reads on the
    // props parameter substitute like destructured props; any other use of
    // the parameter (e.g. forwarding it with `calculate(p)`) bails
    [Pat::Ident(param)] => {
      let mut substitution = SubstituteMemberProps {
        param: param.to_id(),
        attr_values,
        substituted: FxHashSet::default(),
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
fn is_runtime_injected_prop(name: &Atom) -> bool {
  matches!(name.as_ref(), "theme" | "children" | "className" | "style")
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

/// Records one substitution of `key` and applies the duplication rule shared
/// by both substitution visitors: a repeated reference - or any reference to
/// a non-$ attribute, which is kept on the element and therefore already
/// referenced once - duplicates the attribute expression which is only
/// allowed for expressions that are safe to duplicate
/// Returns false if the substitution must bail
fn may_substitute<K: Eq + std::hash::Hash>(
  substituted: &mut FxHashSet<K>,
  key: K,
  name: &Atom,
  replacement: &Expr,
) -> bool {
  let first = substituted.insert(key);
  (first && name.starts_with('$')) || is_duplication_safe(replacement)
}

/// Replaces the destructured prop references with the attribute values
struct SubstituteProps<'a> {
  replacements: &'a FxHashMap<Id, Cow<'a, Expr>>,
  /// keys substituted at least once - see [may_substitute]
  substituted: FxHashSet<Id>,
  failed: bool,
}

impl SubstituteProps<'_> {
  fn replacement_for(&mut self, ident: &Ident) -> Option<Expr> {
    let id = ident.to_id();
    let replacement = self.replacements.get(&id)?;
    if !may_substitute(&mut self.substituted, id, &ident.sym, replacement) {
      self.failed = true;
    }
    Some(Expr::clone(replacement))
  }
}

impl VisitMut for SubstituteProps<'_> {
  fn visit_mut_expr(&mut self, expr: &mut Expr) {
    if let Expr::Ident(ident) = expr {
      if let Some(replacement) = self.replacement_for(ident) {
        *expr = replacement;
        return;
      }
    }
    expr.visit_mut_children_with(self);
  }

  // expand a shorthand `{ $active }` to `{ $active: value }`
  fn visit_mut_prop(&mut self, prop: &mut Prop) {
    if let Prop::Shorthand(ident) = prop {
      if let Some(replacement) = self.replacement_for(ident) {
        *prop = Prop::KeyValue(KeyValueProp {
          key: PropName::Ident(IdentName::new(ident.sym.clone(), ident.span)),
          value: Box::new(replacement),
        });
        return;
      }
    }
    prop.visit_mut_children_with(self);
  }
}

/// Replaces plain `p.prop` member reads on the props parameter with the
/// attribute values - the identifier param counterpart of [SubstituteProps]
/// Any other use of the parameter escapes the whole props object (forwarding
/// it with `calculate(p)`, spreads, computed access) and bails
struct SubstituteMemberProps<'a> {
  param: Id,
  attr_values: &'a FxHashMap<Atom, Cow<'a, Expr>>,
  /// prop names substituted at least once - see [may_substitute]
  substituted: FxHashSet<Atom>,
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
          // an absent attribute is undefined as spreads bail
          let replacement = match self.attr_values.get(&name.sym) {
            Some(value) => Expr::clone(value),
            None => undefined_expr(),
          };
          if !may_substitute(
            &mut self.substituted,
            name.sym.clone(),
            &name.sym,
            &replacement,
          ) {
            self.failed = true;
            return;
          }
          *expr = replacement;
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

/// Whether inlining the expression more than once is safe: it must have no
/// side effects and always evaluate to the same value during one render
fn is_duplication_safe(expr: &Expr) -> bool {
  match expr {
    Expr::Lit(_) | Expr::Ident(_) => true,
    Expr::Member(member) => {
      let safe_prop = match &member.prop {
        MemberProp::Ident(_) => true,
        MemberProp::Computed(computed) => matches!(&*computed.expr, Expr::Lit(_)),
        MemberProp::PrivateName(_) => false,
        #[cfg(swc_ast_unknown)]
        _ => false,
      };
      safe_prop && is_duplication_safe(&member.obj)
    }
    // delete is excluded - it mutates its operand
    Expr::Unary(unary) => unary.op != UnaryOp::Delete && is_duplication_safe(&unary.arg),
    _ => false,
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
}

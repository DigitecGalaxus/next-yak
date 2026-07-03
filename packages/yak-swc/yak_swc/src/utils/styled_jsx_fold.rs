use rustc_hash::{FxHashMap, FxHashSet};
use swc_core::{
  atoms::{Atom, Wtf8Atom},
  common::{SyntaxContext, DUMMY_SP},
  ecma::ast::{
    CallExpr, Callee, Decl, Expr, ExprOrSpread, Id, Ident, IdentName, JSXAttr, JSXAttrName,
    JSXAttrOrSpread, JSXAttrValue, JSXElement, JSXElementName, JSXExpr, JSXExprContainer, Lit,
    MemberProp, Module, ModuleDecl, ModuleItem, Pat, Stmt, Str, VarDecl, VarDeclKind,
  },
  ecma::visit::{VisitMut, VisitMutWith},
};

use crate::utils::native_elements::VALID_ELEMENTS;
use crate::variable_visitor::ScopedVariableReference;
use crate::yak_imports::YakImports;

/// A fully static styled component whose JSX usages can be folded
/// into a plain DOM element
#[derive(Debug)]
struct FoldableComponent {
  /// The native DOM tag e.g. "div"
  tag: Atom,
  /// The generated static class name e.g. "ym7uBBu"
  class_name: Wtf8Atom,
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
  /// - `tag` (the original tagged template tag) is styled.element or
  ///   styled("element") with a native DOM element - this shape excludes
  ///   .attrs(...) chains and styled(Component)
  /// - `is_fully_static` - the css has no runtime expressions or css variables
  /// - `transformed` (the emitted expression) carries the class name as its
  ///   only call argument which doubles as a second staticness guarantee
  pub fn try_register(
    &mut self,
    declaration: Option<&ScopedVariableReference>,
    tag: &Expr,
    transformed: &Expr,
    is_fully_static: bool,
  ) {
    if !is_fully_static {
      return;
    }
    let Some(declaration) = declaration else {
      return;
    };
    if declaration.parts.len() != 1 {
      return;
    }
    let Some(tag) = Self::native_tag(tag) else {
      return;
    };
    let Some(class_name) = Self::static_class_name(transformed) else {
      return;
    };
    self.components.insert(
      declaration.id.clone(),
      FoldableComponent { tag, class_name },
    );
  }

  /// Rewrites all foldable JSX usages of the registered components
  /// Must run before the utility import specifiers are collected as it may
  /// request the mergeClassNames utility
  pub fn fold_jsx_usages(&mut self, module: &mut Module, yak_imports: &mut YakImports) {
    if self.components.is_empty() {
      return;
    }
    // only components declared as top level const are safe to fold
    // (const rules out reassignment)
    let confirmed = self.top_level_consts(module);
    self.components.retain(|id, _| confirmed.contains(id));
    if self.components.is_empty() {
      return;
    }
    module.visit_mut_with(&mut FoldVisitor {
      components: &self.components,
      yak_imports,
    });
  }

  /// Matches `styled.element` and `styled("element")` for native DOM elements
  /// .attrs(...) chains and styled(Component) don't have this shape
  fn native_tag(tag: &Expr) -> Option<Atom> {
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
          .then(|| element.sym.clone())
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
        let Expr::Lit(Lit::Str(element)) = &*arg.expr else {
          return None;
        };
        let element = element.value.as_str()?;
        VALID_ELEMENTS
          .contains(element)
          .then(|| Atom::from(element))
      }
      _ => None,
    }
  }

  /// Extracts the class name from a compiled styled component expression
  /// e.g. `__yak.__yak_div("yX")` or `styled("custom")("yX")`
  /// unwrapping the dev mode `Object.assign(call, { displayName })` wrapper
  /// Requires exactly one string argument - a dynamic styled component
  /// carries additional runtime arguments
  fn static_class_name(transformed: &Expr) -> Option<Wtf8Atom> {
    let Expr::Call(call) = transformed else {
      return None;
    };
    if let Callee::Expr(callee) = &call.callee {
      if let Expr::Member(member) = &**callee {
        if let (Expr::Ident(obj), MemberProp::Ident(prop)) = (&*member.obj, &member.prop) {
          if obj.sym == *"Object" && prop.sym == *"assign" {
            return Self::static_class_name(&call.args.first()?.expr);
          }
        }
      }
    }
    let [arg] = call.args.as_slice() else {
      return None;
    };
    if arg.spread.is_some() {
      return None;
    }
    match &*arg.expr {
      Expr::Lit(Lit::Str(class_name)) => Some(class_name.value.clone()),
      _ => None,
    }
  }

  /// Collects the registered components which are declared as a top level
  /// `const X = ...` (including `export const`)
  fn top_level_consts(&self, module: &Module) -> FxHashSet<Id> {
    let mut confirmed = FxHashSet::default();
    for item in &module.body {
      let var: &VarDecl = match item {
        ModuleItem::Stmt(Stmt::Decl(Decl::Var(var))) => var,
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
          let id = name.to_id();
          if self.components.contains_key(&id) {
            confirmed.insert(id);
          }
        }
      }
    }
    confirmed
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
    // native elements can't take type arguments
    if n.opening.type_args.is_some() {
      return;
    }
    let Some(class_name_fold) = self.fold_attrs(&n.opening.attrs, component) else {
      return;
    };
    let tag = Ident::new(component.tag.clone(), ident.span, SyntaxContext::empty());
    n.opening.name = JSXElementName::Ident(tag.clone());
    if let Some(closing) = &mut n.closing {
      closing.name = JSXElementName::Ident(tag);
    }
    match class_name_fold {
      ClassNameFold::Append(value) => n.opening.attrs.push(class_name_attr(value)),
      ClassNameFold::Replace(index, value) => {
        if let JSXAttrOrSpread::JSXAttr(attr) = &mut n.opening.attrs[index] {
          attr.value = Some(value);
        }
      }
    }
  }
}

/// How the static class name is added to the folded element
enum ClassNameFold {
  /// No className attribute - append className="yX"
  Append(JSXAttrValue),
  /// Merge the static class into the existing className attribute value
  Replace(usize, JSXAttrValue),
}

impl FoldVisitor<'_> {
  /// Checks all attributes and computes the folded className value
  /// Returns `None` if the usage is not foldable
  ///
  /// All other attributes (style, ref, event handlers, even $props) are
  /// forwarded unchanged - a fully static styled component passes them
  /// through to the DOM element. Foreign $props are treated as user error
  /// and not filtered out
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
    let Some((index, attr)) = class_name_attr else {
      return Some(ClassNameFold::Append(JSXAttrValue::Str(str_lit(
        component.class_name.clone(),
        DUMMY_SP,
      ))));
    };
    let value = self.merge_class_name(attr.value.as_ref()?, component)?;
    Some(ClassNameFold::Replace(index, value))
  }

  /// Merges the static class name with an existing className value
  /// The class names are unique so the order doesn't matter and no
  /// deduplication is needed
  /// - string literals are merged at compile time
  /// - other expressions are merged through the mergeClassNames runtime
  ///   helper which evaluates the expression only once
  fn merge_class_name(
    &mut self,
    value: &JSXAttrValue,
    component: &FoldableComponent,
  ) -> Option<JSXAttrValue> {
    match value {
      // className="user"
      JSXAttrValue::Str(user) => Some(JSXAttrValue::Str(str_lit(
        merged_class_names(&component.class_name, &user.value),
        user.span,
      ))),
      JSXAttrValue::JSXExprContainer(JSXExprContainer {
        expr: JSXExpr::Expr(user),
        ..
      }) => {
        let merged = match &**user {
          // className={"user"} - keep the span so an attached
          // /*YAK Extracted CSS:*/ comment from a folded css prop survives
          Expr::Lit(Lit::Str(user)) => Expr::Lit(Lit::Str(str_lit(
            merged_class_names(&component.class_name, &user.value),
            user.span,
          ))),
          _ => Expr::Call(CallExpr {
            span: DUMMY_SP,
            callee: Callee::Expr(Box::new(Expr::Ident(
              self.yak_imports.get_yak_utility_ident("mergeClassNames"),
            ))),
            args: vec![
              ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Lit(Lit::Str(str_lit(
                  component.class_name.clone(),
                  DUMMY_SP,
                )))),
              },
              ExprOrSpread {
                spread: None,
                expr: user.clone(),
              },
            ],
            ctxt: SyntaxContext::empty(),
            type_args: None,
          }),
        };
        Some(JSXAttrValue::JSXExprContainer(JSXExprContainer {
          span: DUMMY_SP,
          expr: JSXExpr::Expr(Box::new(merged)),
        }))
      }
      _ => None,
    }
  }
}

fn merged_class_names(yak_class_name: &Wtf8Atom, user_class_name: &Wtf8Atom) -> Wtf8Atom {
  format!(
    "{} {}",
    yak_class_name.to_string_lossy(),
    user_class_name.to_string_lossy()
  )
  .into()
}

fn str_lit(value: Wtf8Atom, span: swc_core::common::Span) -> Str {
  Str {
    span,
    value,
    raw: None,
  }
}

fn class_name_attr(value: JSXAttrValue) -> JSXAttrOrSpread {
  JSXAttrOrSpread::JSXAttr(JSXAttr {
    span: DUMMY_SP,
    name: JSXAttrName::Ident(IdentName::new("className".into(), DUMMY_SP)),
    value: Some(value),
  })
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

  fn str_expr(value: &str) -> Expr {
    Expr::Lit(Lit::Str(str_lit(value.into(), DUMMY_SP)))
  }

  fn ident(name: &str) -> Expr {
    Expr::Ident(Ident::new(name.into(), DUMMY_SP, SyntaxContext::empty()))
  }

  #[test]
  fn native_tag_matches_native_elements_only() {
    // styled.div
    assert_eq!(
      StyledJsxFold::native_tag(&member("styled", "div")),
      Some("div".into())
    );
    // styled("section")
    assert_eq!(
      StyledJsxFold::native_tag(&call(ident("styled"), vec![str_expr("section")])),
      Some("section".into())
    );
    // styled.customElement
    assert_eq!(
      StyledJsxFold::native_tag(&member("styled", "customElement")),
      None
    );
    // styled(Component)
    assert_eq!(
      StyledJsxFold::native_tag(&call(ident("styled"), vec![ident("Component")])),
      None
    );
    // styled.div.attrs({ ... })
    assert_eq!(
      StyledJsxFold::native_tag(&call(member("styled.div", "attrs"), vec![])),
      None
    );
  }

  #[test]
  fn static_class_name_requires_a_single_string_argument() {
    let styled_call = |args| call(member("__yak", "__yak_div"), args);
    assert_eq!(
      StyledJsxFold::static_class_name(&styled_call(vec![str_expr("yX")])),
      Some("yX".into())
    );
    // dynamic styled components carry additional runtime arguments
    assert_eq!(
      StyledJsxFold::static_class_name(&styled_call(vec![str_expr("yX"), ident("dynamic")])),
      None
    );
  }

  #[test]
  fn static_class_name_unwraps_the_display_name_wrapper() {
    let wrapped = call(
      member("Object", "assign"),
      vec![
        call(member("__yak", "__yak_div"), vec![str_expr("yX")]),
        ident("displayNameProps"),
      ],
    );
    assert_eq!(
      StyledJsxFold::static_class_name(&wrapped),
      Some("yX".into())
    );
  }
}

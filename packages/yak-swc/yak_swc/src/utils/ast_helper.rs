use itertools::Itertools;
use rustc_hash::{FxHashMap, FxHashSet};

use swc_core::atoms::Atom;
use swc_core::{common::DUMMY_SP, ecma::ast::*, plugin::errors::HANDLER};

use crate::variable_visitor::ScopedVariableReference;

/// Convert a HashMap to an Object expression
pub fn expr_hash_map_to_object(values: FxHashMap<String, Expr>) -> Expr {
  let properties = values
    .into_iter()
    .sorted_by_key(|(key, _)| key.clone())
    .map(|(key, value)| {
      PropOrSpread::Prop(Box::new(
        KeyValueProp {
          key: PropName::Str(key.into()),
          value: Box::new(value),
        }
        .into(),
      ))
    })
    .collect::<Vec<_>>();

  Expr::Object(ObjectLit {
    span: Default::default(),
    props: properties,
  })
}

/// Convert a member expression to a root identifier and a string vector of properties
/// e.g. `foo.bar.baz` will return `(foo#0, ["foo", "bar", "baz"])`
pub fn member_expr_to_strings(member_expr: &MemberExpr) -> Option<(Ident, Vec<Atom>)> {
  let mut props: Vec<Atom> = vec![];
  match member_expr.prop.clone() {
    MemberProp::Ident(ident) => {
      props.push(ident.sym);
    }
    MemberProp::Computed(computed) => match &*computed.expr {
      Expr::Lit(Lit::Str(str)) => {
        props.push(str.value.clone());
      }
      Expr::Lit(Lit::Num(num)) => {
        props.push(Atom::from(num.value.to_string()));
      }
      _ => return None,
    },
    MemberProp::PrivateName(_) => return None,
  }
  match *member_expr.obj.clone() {
    Expr::Ident(ident) => {
      let root_ident = ident;
      props.insert(0, root_ident.sym.clone());
      Some((root_ident.clone(), props))
    }
    Expr::Member(member) => {
      let result = member_expr_to_strings(&member)?;
      let (root_ident, mut nested_props) = result;
      nested_props.extend(props);
      Some((root_ident, nested_props))
    }
    _ => None,
  }
}

/// String to MemberProp
pub fn create_member_prop_from_string(s: String) -> MemberProp {
  // if the string contains characters that are not allowed in an identifier
  // "with space" -> foo["with space"]
  if s.contains(|c: char| !c.is_alphanumeric() && c != '_' && c != '$')
    || s.starts_with(|c: char| c.is_ascii_digit())
  {
    MemberProp::Computed(ComputedPropName {
      span: DUMMY_SP,
      expr: Box::new(Expr::Lit(Lit::Str(Str {
        span: DUMMY_SP,
        value: s.into(),
        raw: None,
      }))),
    })
  }
  // otherwise "bar" -> foo.bar
  else {
    MemberProp::Ident(IdentName::new(s.into(), DUMMY_SP))
  }
}

/// Extracts the identifier and member expression parts from an expression
/// There are two use cases:
/// 1. Member expressions (e.g., `colors.primary`) -> Some((colors#0, ["colors", "primary"]))
/// 2. Simple identifiers (e.g., `primaryColor`) -> Some((primaryColor#0, ["primaryColor"]))
pub fn extract_ident_and_parts(expr: &Expr) -> Option<ScopedVariableReference> {
  match &expr {
    Expr::Member(member_expr) => member_expr_to_strings(member_expr).map_or_else(
      || {
        HANDLER.with(|handler| {
          handler
            .struct_span_err(member_expr.span, "Could not parse member expression")
            .emit();
        });
        None
      },
      |member_parts| {
        let (base_ident, member_chain) = member_parts;
        Some(ScopedVariableReference::new(
          base_ident.to_id(),
          member_chain,
        ))
      },
    ),
    Expr::Ident(ident) => Some(ScopedVariableReference::new(
      ident.to_id(),
      vec![ident.sym.clone()],
    )),
    _ => None,
  }
}

/// Get a constant template literal from an expression
pub fn is_valid_tagged_tpl(tagged_tpl: &TaggedTpl, literal_names: &FxHashSet<Id>) -> bool {
  let TaggedTpl { tag, .. } = tagged_tpl;
  if let Expr::Ident(id) = &**tag {
    if literal_names.contains(&id.to_id()) {
      return true;
    }
  }
  false
}

pub struct TemplateIterator<'a> {
  tpl: &'a mut Tpl,
  quasis: Vec<swc_core::ecma::ast::TplElement>,
  current: usize,
}

pub struct TemplatePart<'a> {
  pub quasi: &'a mut TplElement,
  pub expr: Option<&'a mut Box<Expr>>,
  pub next_quasi: Option<&'a TplElement>,
  pub is_last: bool,
  pub index: usize,
}

impl<'a> TemplateIterator<'a> {
  pub fn new(tpl: &'a mut Tpl) -> Self {
    Self {
      quasis: tpl.quasis.clone(),
      tpl,
      current: 0,
    }
  }

  pub fn next(&mut self) -> Option<TemplatePart<'_>> {
    if self.current >= self.tpl.quasis.len() {
      return None;
    }
    let quasi_count = self.tpl.quasis.len();
    let is_last = self.current == quasi_count - 1;
    let next_quasi = if !is_last {
      Some(&self.quasis[self.current + 1])
    } else {
      None
    };
    let quasi = &mut self.tpl.quasis[self.current];

    let expr = self.tpl.exprs.get_mut(self.current);
    let index = self.current;
    self.current += 1;

    Some(TemplatePart {
      quasi,
      expr,
      next_quasi,
      is_last,
      index,
    })
  }
}

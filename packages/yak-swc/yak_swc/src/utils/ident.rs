use swc_core::atoms::Wtf8Atom;
use swc_core::ecma::ast::TaggedTpl;

use crate::naming_convention::NamingConvention;
use crate::variable_visitor::ScopedVariableReference;

/// Information extracted from an ident tagged template literal
/// e.g. ident`--thumb-size` or ident`grid-area`
#[derive(Debug, Clone)]
pub struct IdentInfo {
  /// The full base name from the template (e.g. "--thumb-size" or "grid-area")
  pub base_name: String,
  /// Whether this is a dashed-ident (CSS custom property starting with --)
  pub is_dashed: bool,
}

impl IdentInfo {
  /// Parse ident info from a TaggedTpl
  /// Extracts the base name and determines if it's a dashed ident
  pub fn from_tagged_tpl(tagged_tpl: &TaggedTpl) -> Self {
    let base_name = tagged_tpl
      .tpl
      .quasis
      .iter()
      .map(|q| q.raw.to_string())
      .collect::<String>()
      .trim()
      .to_string();

    let is_dashed = base_name.starts_with("--");

    IdentInfo {
      base_name,
      is_dashed,
    }
  }

  /// Get the clean name without the leading "--" if present
  pub fn clean_name(&self) -> &str {
    if self.is_dashed {
      &self.base_name[2..]
    } else {
      &self.base_name
    }
  }

  /// Generate the scoped identifier name using the naming convention
  pub fn get_identifier_name(&self, naming_convention: &mut NamingConvention) -> String {
    naming_convention.get_ident_name(self.clean_name(), self.is_dashed)
  }

  /// Get the CSS reference for direct interpolation ${myIdent}:
  /// - dashed: var(--name)
  /// - custom: name
  pub fn get_css_reference(&self, identifier_name: &str) -> String {
    if self.is_dashed {
      format!("var({})", identifier_name)
    } else {
      identifier_name.to_string()
    }
  }
}

/// Check if a scoped_name ends with ".name" for property access
/// e.g. thumbSize.name -> true, thumbSize -> false
pub fn is_name_property_access(scoped_name: &ScopedVariableReference) -> bool {
  scoped_name.parts.len() > 1 && scoped_name.parts.last().is_some_and(|p| p == "name")
}

/// Get the parent reference without the ".name" suffix
/// e.g. thumbSize.name -> thumbSize
pub fn get_parent_ref(scoped_name: &ScopedVariableReference) -> ScopedVariableReference {
  let parent_parts: Vec<Wtf8Atom> = scoped_name.parts[..scoped_name.parts.len() - 1].to_vec();
  ScopedVariableReference::new(scoped_name.id.clone(), parent_parts)
}

#[cfg(test)]
mod tests {
  use super::*;
  use swc_core::common::{SyntaxContext, DUMMY_SP};
  use swc_core::ecma::ast::{Ident, Tpl, TplElement};

  fn create_tagged_tpl(content: &str) -> TaggedTpl {
    TaggedTpl {
      span: DUMMY_SP,
      ctxt: SyntaxContext::empty(),
      tag: Box::new(swc_core::ecma::ast::Expr::Ident(Ident {
        span: DUMMY_SP,
        ctxt: SyntaxContext::empty(),
        sym: "ident".into(),
        optional: false,
      })),
      tpl: Box::new(Tpl {
        span: DUMMY_SP,
        exprs: vec![],
        quasis: vec![TplElement {
          span: DUMMY_SP,
          tail: true,
          cooked: Some(content.into()),
          raw: content.into(),
        }],
      }),
      type_params: None,
    }
  }

  #[test]
  fn test_dashed_ident() {
    let tpl = create_tagged_tpl("--thumb-size");
    let info = IdentInfo::from_tagged_tpl(&tpl);

    assert!(info.is_dashed);
    assert_eq!(info.base_name, "--thumb-size");
    assert_eq!(info.clean_name(), "thumb-size");
  }

  #[test]
  fn test_custom_ident() {
    let tpl = create_tagged_tpl("grid-area");
    let info = IdentInfo::from_tagged_tpl(&tpl);

    assert!(!info.is_dashed);
    assert_eq!(info.base_name, "grid-area");
    assert_eq!(info.clean_name(), "grid-area");
  }

  #[test]
  fn test_css_reference_dashed() {
    let tpl = create_tagged_tpl("--thumb-size");
    let info = IdentInfo::from_tagged_tpl(&tpl);

    assert_eq!(
      info.get_css_reference("--thumb_size_abc123"),
      "var(--thumb_size_abc123)"
    );
  }

  #[test]
  fn test_css_reference_custom() {
    let tpl = create_tagged_tpl("grid-area");
    let info = IdentInfo::from_tagged_tpl(&tpl);

    assert_eq!(
      info.get_css_reference("grid_area_abc123"),
      "grid_area_abc123"
    );
  }

  #[test]
  fn test_trimmed_content() {
    let tpl = create_tagged_tpl("  --thumb-size  ");
    let info = IdentInfo::from_tagged_tpl(&tpl);

    assert_eq!(info.base_name, "--thumb-size");
  }
}

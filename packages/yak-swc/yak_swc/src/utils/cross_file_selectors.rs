use percent_encoding::{utf8_percent_encode, NON_ALPHANUMERIC};
use swc_core::atoms::{atom, Atom};

#[derive(PartialEq)]
pub enum ImportType {
  Selector,
  Mixin,
}

#[derive(Debug)]
pub enum ImportKind {
  Default {
    import_source: Atom,
  },
  Named {
    external_name: Atom,
    import_source: Atom,
  },
  Namespace {
    import_source: Atom,
  },
}

impl ImportKind {
  fn external_name(&self) -> Option<Atom> {
    match self {
      ImportKind::Default { .. } => Some(atom!("default")),
      ImportKind::Named { external_name, .. } => Some(external_name.clone()),
      ImportKind::Namespace { .. } => None,
    }
  }

  pub fn import_source(&self) -> Atom {
    match self {
      ImportKind::Default { import_source, .. } => import_source.clone(),
      ImportKind::Named { import_source, .. } => import_source.clone(),
      ImportKind::Namespace { import_source, .. } => import_source.clone(),
    }
  }

  /// This function generates a special CSS selector that represents an import from another module,
  /// encoding the module path and imported properties to ensure CSS parser compatibility
  ///
  /// # Arguments
  ///
  /// * `import_type` - The type of import being generated
  /// * `import_chain` - The member expression or variable name of the imported property
  ///
  /// # Returns
  ///
  /// A `String` containing the encoded module import selector
  ///
  /// # Examples
  ///
  /// Lets say we want to create a module import for ${breakpoints["<xs"].min} from "./styles/media"
  /// it gets converted to --yak-css-import: url("./styles/media:breakpoints:%3Cxs:min",mixin)
  ///
  ///
  /// # Notes
  ///
  /// - The function uses URL encoding for the import chain to handle special characters
  /// - The resulting string is meant to be processed and resolved by the yak css loader
  /// - The kind gives a hint how the import can be used - to provide an error message if the import is not supported
  pub fn encode_module_import(&self, import_type: ImportType, import_chain: Vec<Atom>) -> String {
    let first_entry = match &self {
      // Don't encode the namespace, as that's just used internally, but the loader needs the exported names
      ImportKind::Namespace { .. } => None,
      _ => self.external_name(),
    };

    let mut encoded_parts = match first_entry {
      Some(entry) => vec![encode_percent(&entry.clone())],
      None => vec![],
    };

    if import_chain.len() > 1 {
      encoded_parts.extend(
        import_chain[1..]
          .iter()
          .map(|part| encode_percent(part))
          .collect::<Vec<String>>(),
      );
    }

    format!(
      "--yak-css-import: url(\"{}:{}\",{})",
      self.import_source().as_str(),
      encoded_parts.join(":"),
      if import_type == ImportType::Selector {
        "selector"
      } else {
        "mixin"
      }
    )
  }
}

/// Encode a string to be used in a URL
/// e.g: "foo bar" -> "foo%20bar"
pub fn encode_percent(input: &str) -> String {
  utf8_percent_encode(input, NON_ALPHANUMERIC).to_string()
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_encode_module_import() {
    // Create an ImportKind instance to test with
    let import_kind = ImportKind::Named {
      external_name: atom!("breakpoints"),
      import_source: atom!("./styles/media"),
    };

    let selector = import_kind.encode_module_import(
      ImportType::Selector,
      vec![atom!("breakpoints"), atom!("<xs"), atom!("min")],
    );

    assert_eq!(
      selector,
      "--yak-css-import: url(\"./styles/media:breakpoints:%3Cxs:min\",selector)"
    );
  }

  #[test]
  fn test_encode_module_import_single_item_chain() {
    // Create an ImportKind instance to test with
    let import_kind = ImportKind::Named {
      external_name: atom!("breakpoints"),
      import_source: atom!("./styles/media"),
    };

    let selector =
      import_kind.encode_module_import(ImportType::Selector, vec![atom!("breakpoints")]);

    assert_eq!(
      selector,
      "--yak-css-import: url(\"./styles/media:breakpoints\",selector)"
    );
  }

  #[test]
  fn test_encode_module_import_special_characters() {
    // Create an ImportKind instance to test with
    let import_kind = ImportKind::Named {
      external_name: atom!("breakpoints"),
      import_source: atom!("./styles/media"),
    };

    let selector = import_kind.encode_module_import(
      ImportType::Selector,
      vec![atom!("breakpoints"), atom!("xs")],
    );

    assert_eq!(
      selector,
      "--yak-css-import: url(\"./styles/media:breakpoints:xs\",selector)"
    );
  }

  #[test]
  fn test_encode_module_import_special_characters_encoded() {
    // Create an ImportKind instance to test with
    let import_kind = ImportKind::Named {
      external_name: atom!("breakpoints"),
      import_source: atom!("./styles/media"),
    };

    let selector = import_kind.encode_module_import(
      ImportType::Selector,
      vec![atom!("breakpoints"), atom!("<:\">")],
    );

    assert_eq!(
      selector,
      "--yak-css-import: url(\"./styles/media:breakpoints:%3C%3A%22%3E\",selector)"
    );
  }

  #[test]
  fn test_import_kind_methods() {
    // Test Default import
    let default_import = ImportKind::Default {
      import_source: atom!("./default-module"),
    };

    assert_eq!(default_import.external_name().unwrap().as_str(), "default");
    assert_eq!(default_import.import_source().as_str(), "./default-module");

    // Test Named import
    let named_import = ImportKind::Named {
      external_name: atom!("externalName"),
      import_source: atom!("./named-module"),
    };

    assert_eq!(
      named_import.external_name().unwrap().as_str(),
      "externalName"
    );
    assert_eq!(named_import.import_source().as_str(), "./named-module");

    // Test Namespace import
    let namespace_import = ImportKind::Namespace {
      import_source: atom!("./namespace-module"),
    };

    assert_eq!(namespace_import.external_name(), None);
    assert_eq!(
      namespace_import.import_source().as_str(),
      "./namespace-module"
    );
  }

  #[test]
  fn test_encode_module_import_with_mixin() {
    // Create an ImportKind instance to test with
    let import_kind = ImportKind::Named {
      external_name: atom!("mixin"),
      import_source: atom!("./styles/mixins"),
    };

    let mixin = import_kind.encode_module_import(
      ImportType::Mixin,
      vec![atom!("mixin"), atom!("rotate"), atom!("90deg")],
    );

    assert_eq!(
      mixin,
      "--yak-css-import: url(\"./styles/mixins:mixin:rotate:90deg\",mixin)"
    );
  }

  #[test]
  fn test_encode_module_import_with_namespace() {
    // Create a namespace ImportKind
    let import_kind = ImportKind::Namespace {
      import_source: atom!("./utils-module"),
    };

    let selector = import_kind.encode_module_import(
      ImportType::Selector,
      vec![atom!("utils"), atom!("styles"), atom!("button")],
    );

    assert_eq!(
      selector,
      "--yak-css-import: url(\"./utils-module:styles:button\",selector)"
    );
  }
}

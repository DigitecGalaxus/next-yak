use percent_encoding::{utf8_percent_encode, NON_ALPHANUMERIC};
use swc_core::atoms::Atom;

#[derive(PartialEq)]
pub enum ImportKind {
  Selector,
  Mixin,
}

/// This function generates a special CSS selector that represents an import from another module,
/// encoding the module path and imported properties to ensure CSS parser compatibility
///
/// # Arguments
///
/// * `module_path` - The path to the module being imported
/// * `import_chain` - The member expression or variable name of the imported property
///
/// # Returns
///
/// A `String` containing the encoded module import selector
///
/// # Examples
///
/// Lets say we want to create a module import for ${breakpoints["<xs"].min} from "./styles/media"
/// it gets converted to --yak-css-import: url("./styles/media:module:breakpoints:%3Cxs:min")
///
///
/// # Notes
///
/// - The function uses URL encoding for the import chain to handle special characters
/// - The resulting string is meant to be processed and resolved by the yak css loader
/// - The kind gives a hint how the import can be used - to provide an error message if the import is not supported
pub fn encode_module_import(
  module_path: &str,
  import_chain: Box<[Atom]>,
  kind: ImportKind,
) -> String {
  let encoded_chain = IntoIterator::into_iter(import_chain)
    .map(|part| encode_percent(&part))
    .collect::<Vec<String>>()
    .join(":");
  format!(
    "--yak-css-import: url(\"{}:{}\",{})",
    module_path,
    encoded_chain,
    if kind == ImportKind::Selector {
      "selector"
    } else {
      "mixin"
    }
  )
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
    let selector = encode_module_import(
      "./styles/media",
      [
        Atom::from("breakpoints"),
        Atom::from("<xs"),
        Atom::from("min"),
      ]
      .into(),
      ImportKind::Selector,
    );
    assert_eq!(
      selector,
      "--yak-css-import: url(\"./styles/media:breakpoints:%3Cxs:min\",selector)"
    );
  }

  #[test]
  fn test_encode_module_import_single_item_chain() {
    let selector = encode_module_import(
      "./styles/media",
      [Atom::from("breakpoints")].into(),
      ImportKind::Selector,
    );
    assert_eq!(
      selector,
      "--yak-css-import: url(\"./styles/media:breakpoints\",selector)"
    );
  }

  #[test]
  fn test_encode_module_import_special_characters() {
    let selector = encode_module_import(
      "./styles/media",
      [Atom::from("breakpoints"), Atom::from("xs")].into(),
      ImportKind::Selector,
    );
    assert_eq!(
      selector,
      "--yak-css-import: url(\"./styles/media:breakpoints:xs\",selector)"
    );
  }

  #[test]
  fn test_encode_module_import_special_characters_encoded() {
    let selector = encode_module_import(
      "./styles/media",
      [Atom::from("breakpoints"), Atom::from("<:\">")].into(),
      ImportKind::Selector,
    );
    assert_eq!(
      selector,
      "--yak-css-import: url(\"./styles/media:breakpoints:%3C%3A%22%3E\",selector)"
    );
  }
}

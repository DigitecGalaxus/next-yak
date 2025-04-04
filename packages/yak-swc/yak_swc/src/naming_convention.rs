use crate::utils::css_hash::hash_to_css;
use rustc_hash::FxHashMap;
use std::path::Path;

pub struct NamingConvention {
  postfix_counters: FxHashMap<String, u32>,
  file_name: String,
  file_name_base: Option<String>,
  file_name_hash: Option<String>,
  minify: bool,
  prefix: String,
}

/// A naming convention that generates safe unique names for CSS variables, classes, and other identifiers.
/// Use the `generate_unique_name` method to generate a unique name based on a base name.
/// e.g. `generate_unique_name("foo bar")` might return `"foo_bar-01"`, `"foo_bar-02"`, etc.
impl NamingConvention {
  pub fn new(file_name: impl AsRef<str>, minify: bool, prefix: Option<String>) -> Self {
    Self {
      postfix_counters: FxHashMap::default(),
      file_name: file_name.as_ref().into(),
      file_name_base: None,
      file_name_hash: None,
      minify,
      prefix: prefix.unwrap_or_else(|| {
        if !minify {
          // In dev mode we don't prefix by default as it already uses long unique names
          "".into()
        } else {
          "y".into()
        }
      }),
    }
  }

  /// Returns the hash of the file name
  /// This allows to generate unique names based on the file name
  /// which will be consistent across multiple builds
  pub fn get_file_name_hash(&mut self) -> String {
    if let Some(hash) = &self.file_name_hash {
      hash.clone()
    } else {
      let hash = hash_to_css(&self.file_name);
      self.file_name_hash = Some(hash.clone());
      hash
    }
  }

  /// Get the current filename without extension or path e.g. "App" from "/path/to/App.tsx
  pub fn get_base_file_name(&mut self) -> String {
    if let Some(base) = &self.file_name_base {
      base.clone()
    } else {
      let base = Path::new(&self.file_name)
        .file_stem()
        .and_then(|os_str| os_str.to_str())
        .map(|s| s.to_string())
        .unwrap();
      self.file_name_base = Some(base.clone());
      base
    }
  }

  /// Adds a postfix to a base name to make it unique
  /// e.g. `generate_unique_name("foo bar")` might return `"foo_bar-01"`, `"foo_bar-02"`, etc.
  pub fn generate_unique_name(&mut self, base_name: &str) -> String {
    let escaped_name = escape_css_identifier(base_name);
    if escaped_name.is_empty() {
      return self.generate_unique_name("yak");
    }
    let counter = self
      .postfix_counters
      .entry(escaped_name.clone())
      .or_insert(0);
    *counter += 1;
    // Postfix only if there is more than one occurrence
    if *counter == 1 {
      escaped_name
    } else if !self.minify {
      format!("{}-{:02}", escaped_name, *counter - 1)
    } else {
      format!("{}{}", escaped_name, minify_number(*counter - 1))
    }
  }

  /// Generate a unique CSS variable name based on the file name and a base name
  pub fn get_css_variable_name(&mut self, base_name: &str) -> String {
    let name: String = if !self.minify {
      if base_name.is_empty() {
        format!("{}_var_", self.get_base_file_name())
      } else {
        format!("{}_{}_", self.get_base_file_name(), base_name)
      }
    } else {
      "".to_string()
    };
    let css_variable_name = format!(
      "{}{}{}",
      self.prefix.clone(),
      name,
      self.get_file_name_hash()
    );
    self.generate_unique_name(&css_variable_name)
  }

  /// Generate a unique CSS keyframe name based on the file name and a base name
  pub fn get_keyframe_name(&mut self, base_name: &str) -> String {
    let name: String = if !self.minify {
      if base_name.is_empty() {
        String::from("animation_")
      } else {
        format!("{}_", base_name)
      }
    } else {
      "".to_string()
    };
    let css_variable_name = format!(
      "{}{}{}",
      self.prefix.clone(),
      name,
      self.get_file_name_hash()
    );
    self.generate_unique_name(&css_variable_name)
  }
}

fn escape_css_identifier(input: &str) -> String {
  let mut result = String::new();
  let chars = input.chars();

  for c in chars {
    match c {
      'a'..='z' | 'A'..='Z' | '-' | '_' | '$' | '\\' => result.push(c),
      // Whitespace and member expression separator
      ' ' | '\t' | '.' => {
        result.push('_');
      }
      // Remove control characters
      '\0'..='\x1F' | '\x7F' => continue,
      // Escape Unicode characters
      c if c > '\u{00FF}' => {
        result.push('\\');
        result.push(c);
      }
      // ASCII digits
      c if c.is_ascii_digit() => {
        // ASCII digits are not allowed as the first character
        if result.is_empty() {
          result.push('_');
        }
        result.push(c);
      }
      // Escape all other characters
      c => {
        result.push('\\');
        result.push(c);
      }
    }
  }

  result
}

/// Convert a number to a CSS-safe string
fn minify_number(num: u32) -> String {
  const CSS_CHARS: &[char] = &[
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
    'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b',
    'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u',
    'v', 'w', 'x', 'y', 'z', '-', '_',
  ];
  let mut n = num;
  let mut result = String::new();
  loop {
    result.insert(0, CSS_CHARS[(n % 64) as usize]);
    n /= 64;
    if n == 0 {
      break;
    }
  }
  result
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn css_escape_css_identifier() {
    assert_eq!(escape_css_identifier("foo"), "foo");
    assert_eq!(escape_css_identifier("foo-bar"), "foo-bar");
    assert_eq!(escape_css_identifier("foo_bar"), "foo_bar");
    assert_eq!(escape_css_identifier("foo$bar"), "foo$bar");
    assert_eq!(escape_css_identifier("foo\\bar"), "foo\\bar");
    assert_eq!(escape_css_identifier("foo💩bar"), "foo\\💩bar");
    assert_eq!(escape_css_identifier("foo bar"), "foo_bar");
    assert_eq!(escape_css_identifier("foo.bar"), "foo_bar");
    assert_eq!(escape_css_identifier("foo\tbar"), "foo_bar");
    assert_eq!(escape_css_identifier("foo\nbar"), "foobar");
    assert_eq!(escape_css_identifier("1foo"), "_1foo");
    assert_eq!(escape_css_identifier("1"), "_1");
    assert_eq!(escape_css_identifier(" "), "_");
    assert_eq!(escape_css_identifier("\t"), "_");
  }

  #[test]
  fn css_naming_convention() {
    let mut convention = NamingConvention::new("file.css", false, None);
    assert_eq!(convention.generate_unique_name("foo"), "foo");
    assert_eq!(convention.generate_unique_name("foo"), "foo-01");
    assert_eq!(convention.generate_unique_name("foo"), "foo-02");
  }

  #[test]
  fn css_variable_name() {
    let mut convention = NamingConvention::new("file.css", true, None);
    assert_eq!(convention.get_css_variable_name("foo"), "yoPBkbU");
    assert_eq!(convention.get_css_variable_name("foo"), "yoPBkbU1");
    assert_eq!(convention.get_css_variable_name("foo"), "yoPBkbU2");
    assert_eq!(convention.get_css_variable_name("foo"), "yoPBkbU3");
    assert_eq!(convention.get_css_variable_name("foo"), "yoPBkbU4");
    // Skip values from 4 to 103 (100 iterations)
    for _ in 4..104 {
      convention.get_css_variable_name("foo");
    }
    assert_eq!(convention.get_css_variable_name("foo"), "yoPBkbU1f");
    assert_eq!(convention.get_css_variable_name("foo"), "yoPBkbU1g");
  }

  #[test]
  fn css_variable_name_empty() {
    let mut convention = NamingConvention::new("file.css", true, None);
    assert_eq!(convention.get_css_variable_name(""), "yoPBkbU");
  }

  #[test]
  fn css_variable_name_dev_mode() {
    let mut convention = NamingConvention::new("file.css", false, None);
    assert_eq!(convention.get_css_variable_name("foo"), "file_foo_oPBkbU");
    assert_eq!(
      convention.get_css_variable_name("foo"),
      "file_foo_oPBkbU-01"
    );
    assert_eq!(convention.get_css_variable_name(""), "file_var_oPBkbU");
  }

  #[test]
  fn test_single_digit_numbers() {
    assert_eq!(minify_number(0), "0");
    assert_eq!(minify_number(1), "1");
    assert_eq!(minify_number(9), "9");
  }

  #[test]
  fn test_double_digit_numbers() {
    assert_eq!(minify_number(10), "A");
    assert_eq!(minify_number(35), "Z");
    assert_eq!(minify_number(36), "a");
    assert_eq!(minify_number(61), "z");
    assert_eq!(minify_number(62), "-");
    assert_eq!(minify_number(63), "_");
  }

  #[test]
  fn test_larger_numbers() {
    assert_eq!(minify_number(64), "10");
    assert_eq!(minify_number(128), "20");
    assert_eq!(minify_number(4095), "__");
    assert_eq!(minify_number(4096), "100");
  }
}

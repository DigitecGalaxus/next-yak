use pathdiff::diff_paths;
use regex::Regex;
#[macro_use]
extern crate lazy_static;

/// Returns a relative POSIX path from the `base_path` to the filename.
///
/// For example:
/// - "/foo/", "/bar/baz.txt" -> "../bar/baz.txt"
/// - "C:\foo\", "C:\foo\baz.txt" -> "../bar/baz.txt"
///
/// The format of `base_path` and `filename` must match the current OS.
pub fn relative_posix_path(base_path: &str, filename: &str) -> String {
  let normalized_base_path = convert_path_to_posix(base_path);
  let normalized_filename = convert_path_to_posix(filename);
  let relative_filename =
    diff_paths(normalized_filename, normalized_base_path).expect("Could not create relative path");
  let path_parts = relative_filename
    .components()
    .map(|component| component.as_os_str().to_str().unwrap())
    .collect::<Vec<&str>>();

  path_parts.join("/")
}

/// Returns the path converted to a POSIX path (naive approach).
///
/// For example:
/// - "C:\foo\bar" -> "c/foo/bar"
/// - "/foo/bar" -> "/foo/bar"
fn convert_path_to_posix(path: &str) -> String {
  lazy_static! {
    static ref PATH_REPLACEMENT_REGEX: Regex = Regex::new(r":\\|\\").unwrap();
  }

  PATH_REPLACEMENT_REGEX.replace_all(path, "/").to_string()
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_relative_path_unix() {
    assert_eq!(
      relative_posix_path("/foo/", "/bar/baz.txt"),
      "../bar/baz.txt"
    );
  }

  #[test]
  fn test_relative_path_windows() {
    assert_eq!(
      relative_posix_path(r"C:\foo\", r"C:\bar\baz.txt"),
      "../bar/baz.txt"
    );
  }

  #[test]
  fn test_convert_unix_path() {
    assert_eq!(convert_path_to_posix(r"/foo/bar"), "/foo/bar");
  }

  #[test]
  fn test_convert_windows_path() {
    assert_eq!(convert_path_to_posix(r"C:\foo\bar"), "C/foo/bar");
  }
}

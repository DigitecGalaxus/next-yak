//! Converts a list of CSS declarations to a CSS string
use crate::{CssScope, Declaration, ScopeType};

/// Converts a list of CSS declarations into properly formatted CSS code
///
/// This function is handling indentation, scope nesting, and maintaining proper selector hierarchy
/// It does that by combining declarations that share the same scope
///
/// # Example
///
/// ```
/// use css_in_js_parser::{Declaration, CssScope, ScopeType, to_css};
///
/// let declarations = vec![
///   Declaration {
///     property: "color".to_string(),
///     value: "blue".to_string(),
///     closed: true,
///     scope: vec![
///       CssScope {
///         name: ".foo".to_string(),
///         scope_type: ScopeType::Selector
///       }
///     ]
///   }
/// ];
/// let css_string = to_css(&declarations);
/// // Results in: ".foo { color: blue; }"
/// ```
pub fn to_css(declarations: &[Declaration]) -> String {
  let mut hoisted_css = String::new();
  let mut regular_css = String::new();
  let mut previous_scopes: Vec<CssScope> = Vec::new();
  let mut previous_hoisted_scope: Option<CssScope> = None;

  for declaration in declarations {
    // Check if this declaration must not be nested inside a selector
    // e.g. @property { ... }
    let hoisted_scope = get_non_nestable_declarations(declaration);

    // Close the previous hoisted scope (if any)
    if previous_hoisted_scope.is_some() && previous_hoisted_scope != hoisted_scope {
      hoisted_css.push_str("\n}\n");
      previous_hoisted_scope = None;
    }

    // Handle declarations which must not be nested
    // to prevent invalid CSS
    if let Some(scope) = &hoisted_scope {
      // If this is a new scope open it
      // e.g. @property {
      if previous_hoisted_scope.is_none() {
        hoisted_css.push_str(&format!("\n{} {{", scope.name));
      }
      hoisted_css.push_str(&format!(
        "\n  {}: {};",
        declaration.property, declaration.value
      ));
      previous_hoisted_scope = hoisted_scope;
      continue;
    }

    let scopes = &declaration.scope;

    // Close scopes that are not in the current declaration
    for i in 0..previous_scopes.len() {
      if i >= scopes.len() || scopes[i] != previous_scopes[i] {
        for j in (i..previous_scopes.len()).rev() {
          regular_css.push_str(&format!("\n{}}}", "  ".repeat(j)));
        }
        break;
      }
    }

    // Find the open scopes (those which are not in the previous declaration)
    for i in 0..scopes.len() {
      if i >= previous_scopes.len() || scopes[i] != previous_scopes[i] {
        for (j, scope) in scopes.iter().enumerate().skip(i) {
          regular_css.push_str(&format!("\n{}{} {{", "  ".repeat(j), scope.name));
        }
        break;
      }
    }

    regular_css.push_str(&format!(
      "\n{}{}: {};",
      "  ".repeat(scopes.len()),
      declaration.property,
      declaration.value
    ));

    previous_scopes = scopes.to_vec();
  }

  // Close the last @property block if necessary
  if previous_hoisted_scope.is_some() {
    hoisted_css.push_str("\n}\n");
  }

  // Close all regular scopes with proper indentation
  for i in (0..previous_scopes.len()).rev() {
    regular_css.push_str(&format!("\n{}}}", "  ".repeat(i)));
  }

  // Combine hoisted CSS and regular CSS
  if !hoisted_css.is_empty() && !regular_css.is_empty() {
    format!("{}{}", hoisted_css, regular_css)
  } else {
    hoisted_css + &regular_css
  }
}

/// If according to the css spec the inner scope of declaration must not be nested
/// (e.g. @property) return that scope
fn get_non_nestable_declarations(declaration: &Declaration) -> Option<CssScope> {
  for scope in &declaration.scope {
    if scope.scope_type == ScopeType::AtRule && (scope.name.starts_with("@property")) {
      return Some(scope.clone());
    }
  }
  None
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::parse_css;
  use crate::ScopeType;
  use insta::assert_snapshot;

  #[test]
  fn test_parse_css_incomplete_css_1() {
    let (_, declarations) = parse_css(
      r#"
            .foo {
                    .fancy {
                            /* hello .world { color: red; } */
                            color: blue;
        "#,
      None,
    );
    assert_snapshot!(to_css(&declarations));
  }

  #[test]
  fn test_parse_css_combine_two_independent_css_chunks() {
    let (_, declarations1) = parse_css(
      r#"
            .foo {
                    .fancy {
                            /* hello .world { color: red; } */
                            color: blue;
        "#,
      None,
    );
    let (_, declarations2) = parse_css(
      r#"
          .foo {
                  .fancy {
                          /* hello .world { color: red; } */
                          background: red;
      "#,
      None,
    );
    let combined_declarations: Vec<_> = declarations1.into_iter().chain(declarations2).collect();
    assert_snapshot!(to_css(&combined_declarations));
  }

  #[test]
  fn test_parse_css_merge_two_css_chunks() {
    let (state1, declarations1) = parse_css(
      r#"
      .foo {
              .fancy {
                      /* hello .world { color: red; } */
                      color: blue;
    "#,
      None,
    );
    let (_, declarations2) = parse_css(
      r#"
      }
        &:hover {
          color: orange;
    "#,
      Some(state1),
    );
    let combined_declarations: Vec<_> = declarations1.into_iter().chain(declarations2).collect();
    assert_eq!(
      to_css(&combined_declarations),
      r#"
.foo {
  .fancy {
    color: blue;
  }
  &:hover {
    color: orange;
  }
}"#
    );
  }

  #[test]
  fn test_parse_css_merge_two_css_chunks2() {
    let (state1, declarations1) = parse_css(
      r#"
      .foo
    "#,
      None,
    );
    let (_, declarations2) = parse_css(
      r#"
        {
          color: orange;
    "#,
      Some(state1),
    );
    let combined_declarations: Vec<_> = declarations1.into_iter().chain(declarations2).collect();
    assert_eq!(
      to_css(&combined_declarations),
      r#"
.foo {
  color: orange;
}"#
    );
  }

  #[test]
  fn test_parse_css_merge_two_css_chunks_and_inject_a_scope() {
    let (state1, declarations1) = parse_css(
      r#"
      .foo {
              .fancy {
                      /* hello .world { color: red; } */
                      color: blue;
    "#,
      None,
    );
    let (_, mut declarations2) = parse_css(
      r#"
      }
        &:hover {
          color: orange;
    "#,
      Some(state1),
    );
    declarations2[0].scope.insert(
      0,
      CssScope {
        name: ".isActive".to_string(),
        scope_type: ScopeType::Selector,
      },
    );
    let combined_declarations: Vec<_> = declarations1.into_iter().chain(declarations2).collect();
    assert_snapshot!(to_css(&combined_declarations));
  }

  #[test]
  fn test_handles_escapes_correctly() {
    let (_, declarations) = parse_css(
      r#"
            .foo {
              content: "line1\\\nline2";
            }
        "#,
      None,
    );
    assert_snapshot!(to_css(&declarations));
  }

  #[test]
  fn test_parse_css_merge_two_css_with_comments() {
    let (state1, declarations1) = parse_css(
      r#"
        .foo {
        /* comment
      "#,
      None,
    );
    let (_, declarations2) = parse_css(
      r#"
          bar {*/
            color: orange;
      "#,
      Some(state1),
    );
    let combined_declarations: Vec<_> = declarations1.into_iter().chain(declarations2).collect();
    assert_eq!(
      to_css(&combined_declarations),
      r#"
.foo {
  color: orange;
}"#
    );
  }

  #[test]
  fn test_property_at_rule_hoisting() {
    // Initial CSS with @property nested inside selectors (invalid CSS)
    let (_, declarations) = parse_css(
      r#"
        .foo {
            .fancy {
              @property --angle {
                  syntax: '<angle>';
                  inherits: true;
                  initial-value: 0turn;
                  }
              }
            &:hover {
                color: orange;
            }
        }
        "#,
      None,
    );
    // The result should show @property at the top level, not nested inside selectors
    assert_eq!(
      to_css(&declarations),
      r#"
@property --angle {
  syntax: '<angle>';
  inherits: true;
  initial-value: 0turn;
}

.foo {
  &:hover {
    color: orange;
  }
}"#
    );
  }
}

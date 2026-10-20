//! This module provides functionality for parsing incomplete CSS strings.
use serde::{Deserialize, Serialize};
use serde_repr::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParserState {
  pub is_inside_string: Option<char>,
  pub current_comment_state: CommentStateType,
  pub is_inside_property_value: bool,
  pub is_inside_at_rule: bool,
  pub current_scopes: Vec<CssScope>,
  pub current_declaration: Declaration,
  pub pending_css_segment: String,
  pub paren_depth: usize,
  /// The depth of `{` inside a custom property value
  /// e.g. --foo: { color: red };
  pub brace_depth: usize,
  /// The number of locked scopes at the start of `current_scopes`
  /// A `}` can not close a locked scope
  scope_floor: usize,
}

impl ParserState {
  pub fn new() -> Self {
    Self {
      is_inside_string: None,
      current_comment_state: CommentStateType::None,
      is_inside_property_value: false,
      is_inside_at_rule: false,
      current_scopes: Vec::new(),
      current_declaration: Declaration::new(),
      pending_css_segment: String::new(),
      paren_depth: 0,
      brace_depth: 0,
      scope_floor: 0,
    }
  }

  /// Creates a state with the given scopes open and locked
  pub fn with_scopes(scopes: Vec<CssScope>) -> Self {
    Self {
      scope_floor: scopes.len(),
      current_scopes: scopes,
      ..Self::new()
    }
  }

  /// Copies the state and locks all scopes which are open now
  pub fn nested(&self) -> Self {
    Self {
      scope_floor: self.current_scopes.len(),
      ..self.clone()
    }
  }
}

impl Default for ParserState {
  fn default() -> Self {
    Self::new()
  }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CssScope {
  pub name: String,
  #[serde(rename = "type")]
  pub scope_type: ScopeType,
}

#[derive(Serialize_repr, Deserialize_repr, PartialEq, Debug, Clone)]
#[repr(u8)]
pub enum ScopeType {
  Selector = 0,
  AtRule = 1,
}

#[derive(Serialize_repr, Deserialize_repr, PartialEq, Debug, Clone)]
#[repr(u8)]
pub enum CommentStateType {
  None = 0,
  SingleLine = 1,
  MultiLine = 2,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Declaration {
  pub property: String,
  pub value: String,
  pub scope: Vec<CssScope>,
  pub closed: bool,
}

impl Declaration {
  fn new() -> Self {
    Self {
      property: String::new(),
      value: String::new(),
      scope: Vec::new(),
      closed: false,
    }
  }
}

/// The result of `parse_css`
#[must_use]
#[derive(Debug)]
pub struct ParsedCss {
  /// The state to continue parsing with the next css string
  pub state: ParserState,
  pub declarations: Vec<Declaration>,
  pub errors: Vec<CssError>,
  /// The byte position of the `(` or `{` which is still open at the end of the css string
  /// `None` if all brackets are closed or if the bracket opened in a previous `parse_css` call
  /// e.g. @media (min-width: 600px {
  ///             ^
  pub unclosed_bracket: Option<usize>,
}

/// All offsets are byte positions in the css string of the `parse_css` call
#[derive(Debug, Clone, PartialEq)]
pub enum CssError {
  /// A `}` without an open block
  /// e.g. color: red; }
  UnexpectedClosingBrace { offset: usize },
  /// A `{` without a selector before it
  /// e.g. color: red; { color: blue; }
  EmptySelector { offset: usize },
  /// A declaration without a `:`
  /// e.g. color red;
  /// `start` is 0 if the declaration started in a previous `parse_css` call
  /// `end` is the position of the `;` or `}` after the declaration
  MissingColon { start: usize, end: usize },
}

impl CssError {
  /// The bytes of the css string which the error is about
  pub fn range(&self) -> std::ops::Range<usize> {
    match *self {
      CssError::UnexpectedClosingBrace { offset } | CssError::EmptySelector { offset } => {
        offset..offset + 1
      }
      CssError::MissingColon { start, end } => start..end,
    }
  }
}

/// A declaration like `color red;` has a property but no `:`
/// At-rules like `@import url(a.css);` have no `:` either
fn is_missing_colon(state: &ParserState) -> bool {
  !state.current_declaration.property.is_empty()
    && !state.is_inside_property_value
    && !state.is_inside_at_rule
}

/// Parses a CSS string and returns the final parser state, the parsed declarations and the errors.
///
/// # Arguments
///
/// * `css_string` - A string slice containing the CSS to parse
/// * `initial_state` - An optional initial parser state from a previous parsing
pub fn parse_css(css_string: &str, initial_state: Option<ParserState>) -> ParsedCss {
  let mut state = initial_state.unwrap_or_default();
  // The error offsets start at `css_string`
  let pending_css_segment_length = state.pending_css_segment.len();

  // Prepend any pending CSS segment from the previous state
  let css_to_parse = if !state.pending_css_segment.is_empty() {
    // Reset the state to properly parse the pending CSS segment
    state.is_inside_string = None;
    state.current_comment_state = CommentStateType::None;
    state.is_inside_property_value = false;
    state.is_inside_at_rule = false;
    state.paren_depth = 0;
    state.brace_depth = 0;
    state.current_declaration = Declaration::new();
    state.pending_css_segment.clone() + css_string
  } else {
    css_string.to_string()
  };

  let mut current_code = String::new();
  let mut back_slashes = 0;
  let mut declarations = Vec::new();
  let mut errors = Vec::new();
  // Byte position of the current property
  let mut property_start = 0;
  // Byte position of the outermost open `(` or `{` in a value or an at-rule
  let mut open_bracket_position = None;

  let bytes = css_to_parse.as_bytes();
  // Byte position in `css_string` (without the pending css segment of the previous call)
  let offset = |position: usize| position.saturating_sub(pending_css_segment_length);
  // Byte position in `css_to_parse`
  let mut position = 0;

  while let Some(current_character) = css_to_parse[position..].chars().next() {
    let previous_back_slashes = back_slashes;

    // Count backslashes to detect escaped characters
    // e.g.:
    // .foo { content: "Hello, \"World!\\\""; }
    if current_character == '\\' {
      back_slashes += 1;
    } else {
      back_slashes = 0;
    }

    // TODO: Consider resetting backslashes
    match state.current_comment_state {
      // Parse until the end of the current multi line comment is reached
      CommentStateType::MultiLine => {
        // The search is bytewise, as no byte of a multi-byte char matches an ASCII char
        while position < bytes.len() {
          if bytes[position] == b'*' && bytes.get(position + 1) == Some(&b'/') {
            state.current_comment_state = CommentStateType::None;
            position += 2;
            break;
          }
          position += 1;
        }
        continue;
      }
      // Parse until the end of the current multi line comment is reached
      CommentStateType::SingleLine => {
        while position < bytes.len() {
          if bytes[position] == b'\n' {
            state.current_comment_state = CommentStateType::None;
            break;
          }
          position += 1;
        }
        continue;
      }
      CommentStateType::None => {
        // Proceed with the normal parsing
      }
    }

    // Detect unescaped strings and store the string delimiter
    // e.g.:
    // url("Hello, World!")
    //     ^                  -> is_inside_string = Some('"')
    // or
    // url('Hello, World!')
    //     ^                  -> is_inside_string = Some('\'')
    if previous_back_slashes % 2 == 0 && (current_character == '"' || current_character == '\'') {
      if state.is_inside_string == Some(current_character) {
        state.is_inside_string = None;
      } else if state.is_inside_string.is_none() {
        state.is_inside_string = Some(current_character);
      }
    }

    // Detect parens outside of strings for property values and at-rules
    // e.g.
    // .foo { background: url('https://example.com'); }
    // @apply --foo({ color: red });
    let was_inside_brackets = state.paren_depth + state.brace_depth > 0;
    if state.is_inside_string.is_none()
      && (state.is_inside_property_value || state.is_inside_at_rule)
    {
      if current_character == '(' {
        state.paren_depth += 1;
      } else if current_character == ')' && state.paren_depth > 0 {
        state.paren_depth -= 1;
      }
    }

    // Detect a block as the value of a custom property
    // e.g. --foo: { color: red };
    // A `{` after other value text opens a scope
    // e.g. --foo: red .bar { color: blue; }
    let is_custom_property_brace = state.is_inside_string.is_none()
      && state.paren_depth == 0
      && state.is_inside_property_value
      && state.current_declaration.property.starts_with("--")
      && match current_character {
        '{' => state.brace_depth > 0 || state.current_declaration.value.is_empty(),
        '}' => state.brace_depth > 0,
        _ => false,
      };
    if is_custom_property_brace {
      if current_character == '{' {
        state.brace_depth += 1;
      } else {
        state.brace_depth -= 1;
      }
    }

    let is_inside_brackets = state.paren_depth + state.brace_depth > 0;
    if !is_inside_brackets {
      open_bracket_position = None;
    } else if !was_inside_brackets {
      open_bracket_position = Some(position);
    }

    // Inside a string or brackets, just add the character to the current code no matter what
    // e.g. content: "{ ; } @ !"
    if state.is_inside_string.is_some() || is_inside_brackets || is_custom_property_brace {
      current_code.push(current_character);
      state.current_declaration.value.push(current_character);
      position += current_character.len_utf8();
      continue;
    }
    // Detect multi-line comments
    // e.g.
    // .foo { color: red; } /* This is a comment */
    //                      ^
    else if current_character == '/' && bytes.get(position + 1) == Some(&b'*') {
      state.current_comment_state = CommentStateType::MultiLine;
      position += 2;
      continue;
    }
    // Detect single line comments
    // e.g.
    // .foo { color: red; } // This is a comment
    //                       ^
    else if current_character == '/' && bytes.get(position + 1) == Some(&b'/') {
      state.current_comment_state = CommentStateType::SingleLine;
      position += 2;
      continue;
    }
    // Detect scope closing
    // e.g.
    // .foo { color: black; }
    //                      ^
    // or
    // .foo { color: black }
    //                     ^
    else if current_character == '}' {
      if is_missing_colon(&state) {
        errors.push(CssError::MissingColon {
          start: offset(property_start),
          end: offset(position),
        });
      }
      current_code.clear();
      state.is_inside_property_value = false;
      // a closing brace also ends the declaration before it
      // e.g. .foo { color: black }
      if !state.current_declaration.property.is_empty() {
        state
          .current_declaration
          .scope
          .clone_from(&state.current_scopes);
        state.current_declaration.closed = true;
        declarations.push(state.current_declaration.clone());
        state.current_declaration = Declaration::new();
      }
      // Skip a closing brace without an open block and remember its position
      // e.g. color: black; }
      //                    ^
      if state.current_scopes.len() > state.scope_floor {
        state.current_scopes.pop();
      } else {
        errors.push(CssError::UnexpectedClosingBrace {
          offset: offset(position),
        });
      }
    }
    // Detect scope opening
    // e.g.
    // .foo {
    //      ^
    // or
    // @media (max-width: 600px) {
    //                           ^
    else if current_character == '{' {
      // e.g. color: red; { color: blue; }
      //                  ^
      if current_code.trim().is_empty() {
        errors.push(CssError::EmptySelector {
          offset: offset(position),
        });
      }
      state.current_scopes.push(CssScope {
        name: current_code.trim().to_string(),
        scope_type: if state.is_inside_at_rule {
          ScopeType::AtRule
        } else {
          ScopeType::Selector
        },
      });
      current_code.clear();
      state.is_inside_property_value = false;
      state.is_inside_at_rule = false;
      state.current_declaration.property.clear();
      state.current_declaration.value.clear();
    }
    // Detect declaration closing
    // e.g.
    // color: red;
    //           ^
    else if current_character == ';' {
      if is_missing_colon(&state) {
        errors.push(CssError::MissingColon {
          start: offset(property_start),
          end: offset(position),
        });
      }
      current_code.clear();
      state.is_inside_property_value = false;
      state.is_inside_at_rule = false;
      // a semicolon closes the current declaration
      if !state.current_declaration.property.is_empty() {
        state.current_declaration.closed = true;
        state
          .current_declaration
          .scope
          .clone_from(&state.current_scopes);
        declarations.push(state.current_declaration.clone());
        state.current_declaration = Declaration::new();
      }
    }
    // Detect property value separator
    // e.g.
    // color: red;
    //      ^
    else if !state.is_inside_property_value
      && !state.is_inside_at_rule
      && current_character == ':'
    {
      state.is_inside_property_value = true;
      current_code.push(current_character);
    }
    // Detect at-rules
    // e.g.
    // @media (max-width: 600px) {
    // ^
    else if !state.is_inside_property_value && current_character == '@' {
      state.is_inside_at_rule = true;
      current_code.push(current_character);
    }
    // Detect other characters
    // e.g.
    // color: red;
    // ^
    // Trim any leading whitespace in front of the value
    else {
      let previous_character = if position == 0 {
        state.current_declaration.value.chars().last()
      } else {
        css_to_parse[..position].chars().next_back()
      };

      let is_previous_character_empty = (position > 0 && current_code.is_empty())
        || previous_character.is_none_or(|c| c.is_whitespace());
      let is_current_character_empty = current_character.is_whitespace();

      if !is_previous_character_empty || !is_current_character_empty {
        current_code.push(current_character);
        if state.is_inside_property_value {
          if !is_current_character_empty || !state.current_declaration.value.is_empty() {
            state.current_declaration.value.push(current_character);
          }
        } else {
          if state.current_declaration.property.is_empty() {
            property_start = position;
          }
          state.current_declaration.property.push(current_character);
        }
      }
    }

    position += current_character.len_utf8();
  }

  // Store any uncategorized CSS code for later parsing
  // The reason behind that is the following example where it is unclear from the syntax wether
  // the ending is a property declaration or a selector:
  // .foo { section:has(bar)
  // .foo { background:url(bar)
  if !current_code.is_empty() {
    state.pending_css_segment = current_code;
  } else {
    state.pending_css_segment.clear();
  }

  ParsedCss {
    state,
    declarations,
    errors,
    // A bracket in the pending css segment opened in a previous call
    unclosed_bracket: open_bracket_position
      .filter(|&position| position >= pending_css_segment_length)
      .map(offset),
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use insta::assert_debug_snapshot;

  #[test]
  fn test_parse_css_incomplete_css_1() {
    let ParsedCss {
      state,
      declarations,
      errors,
      ..
    } = parse_css(
      r#"
        .foo {
                .fancy {
                        /* hello .world { color: red; } */
                        color: blue;
    "#,
      None,
    );
    assert!(errors.is_empty());
    assert_debug_snapshot!((state, declarations));
  }

  #[test]
  fn test_parse_css_incomplete_css_1_ending_inside_a_comment() {
    let ParsedCss {
      state,
      declarations,
      errors,
      ..
    } = parse_css(
      r#"
        .foo {
                .fancy {
                        /* hello .world { color: red; }
    "#,
      None,
    );
    assert!(errors.is_empty());
    assert_debug_snapshot!((state, declarations));
  }

  #[test]
  fn test_parse_css_incomplete_css_1_ending_inside_a_string() {
    let ParsedCss {
      state,
      declarations,
      errors,
      ..
    } = parse_css(
      r#"
        .foo {
                .fancy {
                        background: url('https://example.com
    "#,
      None,
    );
    assert!(errors.is_empty());
    assert_debug_snapshot!((state, declarations));
  }

  #[test]
  fn test_parse_css_incomplete_css_1_ending_inside_a_double_quote_string() {
    let ParsedCss {
      state,
      declarations,
      errors,
      ..
    } = parse_css(
      r#"
        .foo {
                .fancy {
                        background: url("https://example.com
    "#,
      None,
    );
    assert!(errors.is_empty());
    assert_debug_snapshot!((state, declarations));
  }

  #[test]
  fn test_parse_css_incomplete_css_1_ending_inside_parens_string() {
    let ParsedCss {
      state,
      declarations,
      errors,
      ..
    } = parse_css(
      r#"
        .foo {
                .fancy {
                        background: url(https://example.com
    "#,
      None,
    );
    assert!(errors.is_empty());
    assert_debug_snapshot!((state, declarations));
  }

  #[test]
  fn test_parse_css_incomplete_css_1_ending_outside_a_comment() {
    let ParsedCss {
      state,
      declarations,
      errors,
      ..
    } = parse_css(
      r#"
        .foo {
                .fancy section {
                        /* background: url("https://example.com */
                        color: blue
    "#,
      None,
    );
    assert!(errors.is_empty());
    assert_debug_snapshot!((state, declarations));
  }

  #[test]
  fn test_parse_css_incomplete_css_1_with_media_rule() {
    let ParsedCss {
      state,
      declarations,
      errors,
      ..
    } = parse_css(
      r#"
                .foo {
                                .fancy {
                                                background: url('https://example.com');



                @media (max-width: 600px) {
                                .baz {
                                                color: red;

        "#,
      None,
    );
    assert!(errors.is_empty());
    assert_debug_snapshot!((state, declarations));
  }

  #[test]
  fn test_parse_css_complete_css_with_media_rule() {
    let ParsedCss {
      state,
      declarations,
      errors,
      ..
    } = parse_css(
      r#"
    .foo {
      .fancy {
        background: url("https://example.com");

        @media (max-width: 600px) {
          .baz {
            color: red;
          }
        }
      }
      background: url(https://example.com);
      body {
        padding: 0;
      }
    }
  "#,
      None,
    );
    assert!(errors.is_empty());
    assert_debug_snapshot!((state, declarations));
  }

  #[test]
  fn test_parse_css_incomplete_css_ending_without_semicolon() {
    let ParsedCss {
      state,
      declarations,
      errors,
      ..
    } = parse_css(
      r#"
        .foo {
          color: orange
    "#,
      None,
    );
    assert!(errors.is_empty());
    assert_debug_snapshot!((state, declarations));
  }

  #[test]
  fn test_parse_css_resume_incomplete_css_ending_without_semicolon() {
    let ParsedCss {
      state: state1,
      declarations,
      errors,
      ..
    } = parse_css(
      r#"
        .foo {
          color: orange
    "#,
      None,
    );
    assert!(errors.is_empty());
    let ParsedCss {
      state: state2,
      declarations: declarations2,
      errors,
      ..
    } = parse_css(
      r#"
        ;
    "#,
      Some(state1.clone()),
    );
    assert!(errors.is_empty());
    let all_declarations = declarations
      .into_iter()
      .chain(declarations2)
      .collect::<Vec<_>>();
    assert_debug_snapshot!((state1, state2, all_declarations));
  }

  #[test]
  fn test_parse_css_starting_with_an_invalid_curly() {
    let ParsedCss {
      state,
      declarations,
      errors,
      ..
    } = parse_css(
      r#"
        }
        .foo {
          color: orange
    "#,
      None,
    );
    assert_eq!(errors, vec![CssError::UnexpectedClosingBrace { offset: 9 }]);
    assert_debug_snapshot!((state, declarations));
  }

  #[test]
  fn test_parse_css_with_dynamic_values() {
    let ParsedCss {
      state: state1,
      declarations: _,
      errors,
      ..
    } = parse_css(
      r#"
          .foo {
              transform: translate(-50%, -50%) rotate("#,
      None,
    );
    assert!(errors.is_empty());
    let ParsedCss {
      state: state2,
      declarations: _,
      errors,
      ..
    } = parse_css(r#"20deg) translate(0, -88px) rotate("#, Some(state1));
    assert!(errors.is_empty());
    let ParsedCss {
      state: _,
      declarations: declarations3,
      errors,
      ..
    } = parse_css(r#"90deg);"#, Some(state2));
    assert!(errors.is_empty());
    assert_eq!(declarations3.len(), 1);
    assert_eq!(
      declarations3[0].value.trim(),
      "translate(-50%, -50%) rotate(20deg) translate(0, -88px) rotate(90deg)"
    );
  }

  #[test]
  fn test_parse_css_last_declaration_without_semicolon_stays_in_block() {
    let result = parse_css(".foo { color: black } color: red;", None);
    assert_eq!(result.declarations.len(), 2);
    assert_eq!(result.declarations[0].property, "color");
    assert_eq!(result.declarations[0].value.trim(), "black");
    assert_eq!(result.declarations[0].scope.len(), 1);
    assert_eq!(result.declarations[0].scope[0].name, ".foo");
    assert!(result.declarations[1].scope.is_empty());
    assert!(result.errors.is_empty());
  }

  #[test]
  fn test_parse_css_closing_brace_does_not_close_the_scope_floor() {
    let initial_state = ParserState::with_scopes(vec![CssScope {
      name: ".root".to_string(),
      scope_type: ScopeType::AtRule,
    }]);
    let result = parse_css("color: red } color: blue;", Some(initial_state));
    assert_eq!(
      result.errors,
      vec![CssError::UnexpectedClosingBrace { offset: 11 }]
    );
    assert_eq!(result.state.current_scopes.len(), 1);
    assert_eq!(result.declarations.len(), 2);
    for declaration in &result.declarations {
      assert_eq!(declaration.scope.len(), 1);
      assert_eq!(declaration.scope[0].name, ".root");
    }
  }

  #[test]
  fn test_parse_css_unexpected_closing_brace_offset_is_relative_to_the_input() {
    let result = parse_css("color: red; } .foo { color: blue; }", None);
    assert_eq!(
      result.errors,
      vec![CssError::UnexpectedClosingBrace { offset: 12 }]
    );
    // The offset does not include the pending css of the previous call
    let result = parse_css(".foo { section:has(a)", None);
    let result = parse_css(" } } color: red;", Some(result.state));
    assert_eq!(
      result.errors,
      vec![CssError::UnexpectedClosingBrace { offset: 3 }]
    );
  }

  #[test]
  fn test_parse_css_nested_literal_does_not_close_outer_blocks() {
    let outer = parse_css(".foo {", Some(ParserState::with_scopes(vec![])));
    let result = parse_css("color: red; } padding: 0;", Some(outer.state.nested()));
    assert_eq!(
      result.errors,
      vec![CssError::UnexpectedClosingBrace { offset: 12 }]
    );
    assert_eq!(result.declarations.len(), 2);
    for declaration in &result.declarations {
      assert_eq!(declaration.scope.len(), 1);
      assert_eq!(declaration.scope[0].name, ".foo");
    }
  }

  #[test]
  fn test_parse_css_empty_selector() {
    let result = parse_css("color: red; { color: blue; } .foo { color: green; }", None);
    assert_eq!(result.errors, vec![CssError::EmptySelector { offset: 12 }]);
  }

  #[test]
  fn test_parse_css_missing_colon() {
    let result = parse_css("color red; padding: 0; .foo { margin 0 }", None);
    assert_eq!(
      result.errors,
      vec![
        CssError::MissingColon { start: 0, end: 9 },
        CssError::MissingColon { start: 30, end: 39 },
      ]
    );
  }

  #[test]
  fn test_parse_css_at_rule_without_colon_is_valid() {
    let result = parse_css("@import url(a.css); @charset 'utf-8';", None);
    assert!(result.errors.is_empty());
  }

  #[test]
  fn test_parse_css_error_offsets_are_bytes() {
    let result = parse_css("content: \"ä\"; }", None);
    assert_eq!(
      result.errors,
      vec![CssError::UnexpectedClosingBrace { offset: 15 }]
    );
    assert_eq!(&"content: \"ä\"; }"[result.errors[0].range()], "}");
    // Multi-byte chars in comments and in a property
    let css = "/* ä */ // ü\n ä red; }";
    let result = parse_css(css, None);
    assert_eq!(result.errors.len(), 2);
    assert_eq!(&css[result.errors[0].range()], "ä red");
    assert_eq!(&css[result.errors[1].range()], "}");
  }

  #[test]
  fn test_parse_css_custom_property_with_block_value() {
    let result = parse_css(".foo { --a: { color: red }; --b: { foo; bar } }", None);
    assert!(result.errors.is_empty());
    assert_eq!(result.state.current_scopes.len(), 0);
    assert_eq!(result.declarations.len(), 2);
    assert_eq!(result.declarations[0].property, "--a");
    assert_eq!(result.declarations[0].value.trim(), "{ color: red }");
    assert_eq!(result.declarations[1].property, "--b");
    assert_eq!(result.declarations[1].value.trim(), "{ foo; bar }");
    for declaration in &result.declarations {
      assert_eq!(declaration.scope.len(), 1);
      assert_eq!(declaration.scope[0].name, ".foo");
    }
  }

  #[test]
  fn test_parse_css_block_in_normal_property_value_opens_a_scope() {
    let result = parse_css(".foo { color: red &:hover { color: blue; } }", None);
    assert_eq!(result.state.current_scopes.len(), 0);
    assert_eq!(result.declarations[0].scope.len(), 2);
    // Only a block at the start of a custom property value is part of the value
    let result = parse_css(".foo { --a: url(a.css) .bar { color: blue; } }", None);
    assert_eq!(result.state.current_scopes.len(), 0);
    assert_eq!(result.declarations[0].property, "color");
    assert_eq!(result.declarations[0].scope.len(), 2);
  }

  #[test]
  fn test_parse_css_block_in_at_rule_parens() {
    let result = parse_css(
      ".foo { @apply --mixin({ color: red; }); padding: 0; }",
      None,
    );
    assert!(result.errors.is_empty());
    assert_eq!(result.state.current_scopes.len(), 0);
    let padding = result.declarations.last().unwrap();
    assert_eq!(padding.property, "padding");
    assert_eq!(padding.scope.len(), 1);
    assert_eq!(padding.scope[0].name, ".foo");
  }

  #[test]
  fn test_parse_css_nested_at_rules() {
    let result = parse_css(
      r#"
        @media (min-width: 600px) {
          @supports (display: grid) and (not (display: inline-grid)) {
            .foo {
              @apply --mixin({ color: red; });
              --a: { color: red };
              color: blue;
            }
          }
        }
      "#,
      None,
    );
    assert!(result.errors.is_empty());
    assert_eq!(result.state.current_scopes.len(), 0);
    let color = result.declarations.last().unwrap();
    assert_eq!(color.property, "color");
    assert_eq!(
      color
        .scope
        .iter()
        .map(|scope| scope.name.as_str())
        .collect::<Vec<_>>(),
      vec![
        "@media (min-width: 600px)",
        "@supports (display: grid) and (not (display: inline-grid))",
        ".foo"
      ]
    );
  }

  #[test]
  fn test_parse_css_newer_at_rules() {
    for css in [
      "@scope (.card) to (.content) { img { border: 1px solid; } }",
      ".foo { @container style(--a: 1) { color: red; } }",
      "@function --double(--a) { result: calc(var(--a) * 2); }",
      "@starting-style { .foo { opacity: 0; } }",
      "@layer base, components;",
    ] {
      let result = parse_css(css, None);
      assert!(result.errors.is_empty(), "{css}");
      assert_eq!(result.state.current_scopes.len(), 0, "{css}");
      assert_eq!(result.unclosed_bracket, None, "{css}");
    }
  }

  #[test]
  fn test_parse_css_unclosed_bracket() {
    let css = "@media (min-width: 600px { color: red; }";
    let result = parse_css(css, None);
    assert_eq!(result.unclosed_bracket, Some(7));
    assert_eq!(result.state.paren_depth, 1);
    let css = ".foo { background: rgb(0 0 0; }";
    assert_eq!(
      &css[parse_css(css, None).unclosed_bracket.unwrap()..][..1],
      "("
    );
    let css = ".foo { --a: { color: red; ";
    assert_eq!(
      &css[parse_css(css, None).unclosed_bracket.unwrap()..][..1],
      "{"
    );
    // Closed brackets
    let result = parse_css(".foo { transform: rotate(1deg) scale(2); }", None);
    assert_eq!(result.unclosed_bracket, None);
  }

  #[test]
  fn test_parse_css_unclosed_bracket_of_a_previous_call() {
    let first = parse_css(".foo { transform: rotate(", None);
    assert_eq!(first.unclosed_bracket, Some(24));
    // The bracket opened in the first call
    let second = parse_css("1deg", Some(first.state));
    assert_eq!(second.unclosed_bracket, None);
    assert_eq!(second.state.paren_depth, 1);
    let third = parse_css(") scale(", Some(second.state));
    assert_eq!(third.unclosed_bracket, Some(7));
    let fourth = parse_css("2); }", Some(third.state));
    assert_eq!(fourth.unclosed_bracket, None);
    assert_eq!(fourth.state.paren_depth, 0);
    assert!(fourth.errors.is_empty());
  }
}

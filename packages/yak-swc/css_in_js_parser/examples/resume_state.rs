use css_in_js_parser::{parse_css, to_css};

// This example demonstrates how to resume parsing from a previous state.
// This is useful when processing styled-components style css-in-js code
// from a Template Literal.
//
// In this example, we parse three incomplete CSS snippets, and merge them
// into a final css string
fn main() {
  let (state1, declarations1) = parse_css(
    r#"
        .foo {
            .fancy {
                color: blue;
            }
    "#,
    None,
  );

  let (state2, declarations2) = parse_css(
    r#"
        &:hover {
            color: orange;
        }
    "#,
    Some(state1),
  );

  let (_, declarations3) = parse_css(
    r#"
            .bar {
                color: red;
            }
        }
    "#,
    Some(state2),
  );

  let combined_declarations: Vec<_> = declarations1
    .into_iter()
    .chain(declarations2)
    .chain(declarations3)
    .collect();

  // Do something with the combined declarations
  println!("{:?}", combined_declarations);

  // Regenerate the CSS
  let regenerated_css = to_css(&combined_declarations);
  println!("Regenerated CSS:\n{}", regenerated_css);
}

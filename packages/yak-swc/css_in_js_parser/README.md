# CSS-in-JS Parser

## Overview

This project implements a specialized CSS parser designed to handle the unique challenges of CSS-in-JS, particularly when dealing with dynamic parts within template literals. Unlike traditional CSS parsers, this tool focuses on maintaining and exporting the current parsing state, allowing for accurate interpretation of CSS intermixed with JavaScript code.

## Features

- Parses CSS while maintaining awareness of the current context (strings, comments, property values, at-rules, etc.)
- Handles incomplete CSS chunks, allowing for incremental parsing
- Exports detailed parser state for integration with CSS-in-JS libraries
- Converts parsed declarations back to CSS, maintaining the original structure
- Supports merging of multiple CSS chunks
- Handles escaped characters and multi-line strings correctly

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
css_in_js_parser = "0.1.0"
```

## Usage

### Parsing CSS

```rust
use css_in_js_parser::parse_css;

let (state, declarations) = parse_css(
    r#"
    .foo {
        .fancy {
            color: blue;
    "#,
    None,
);
```

### Converting Declarations to CSS

To convert the parsed declarations to prettified CSS, use the `to_css` function:

```rust
use css_in_js_parser::to_css;

let css_string = to_css(&declarations);
```

### Resuming Parsing

To resume parsing from a previous state, pass the previous state to the `parse_css` function:

```rust
let (state1, declarations1) = parse_css(chunk1, None);
let (_, declarations2) = parse_css(chunk2, Some(state1));
let combined_declarations: Vec<_> = declarations1.into_iter().chain(declarations2.into_iter()).collect();
let merged_css = to_css(&combined_declarations);
```

## How It Works

The parser processes CSS character by character, maintaining a `ParserState` struct that includes information about:

- Whether the parser is inside a string, comment, property value, or at-rule
- The current CSS scopes (selectors and at-rules)
- The current declaration being parsed

This state allows the parser to correctly interpret CSS even when it's interrupted by JavaScript code, as is common in CSS-in-JS scenarios.

## API

### `parse_css(css_string: &str, initial_state: Option<ParserState>) -> (ParserState, Vec<Declaration>)`

Parses a CSS string and returns the final parser state along with a vector of parsed declarations.

### `to_css(declarations: &[Declaration]) -> String`

Converts a slice of `Declaration`s back into a CSS string.

## Contributing

Contributions are welcome! Please feel free to submit an [Issue](https://github.com/DigitecGalaxus/next-yak/issues) or [Pull](https://github.com/DigitecGalaxus/next-yak/pulls) Request.

## License

This project is licensed under the MIT License
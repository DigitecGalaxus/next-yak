# relative_posix_path

A small utility crate to calculate relative POSIX paths from any two paths, regardless of the current operating system

## Features

- Convert Windows or Unix paths to relative POSIX paths
- Simple and easy-to-use API
- Cross-platform compatibility

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
relative_posix_path = "0.1.0"
```

## Usage

```rust
use relative_posix_path::relative_posix_path;

fn main() {
    let base_path = "/foo/";
    let filename = "/bar/baz.txt";
    let relative_path = relative_posix_path(base_path, filename);
    assert_eq!(relative_path, "../bar/baz.txt");

    // Works with Windows paths too
    let windows_base_path = r"C:\foo\";
    let windows_filename = r"C:\bar\baz.txt";
    let windows_relative_path = relative_posix_path(windows_base_path, windows_filename);
    assert_eq!(windows_relative_path, "../bar/baz.txt");
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

Code is extracted from https://github.com/jantimon/css-variable/

This crate uses the following dependencies:

- [pathdiff](https://crates.io/crates/pathdiff)
- [regex](https://crates.io/crates/regex)

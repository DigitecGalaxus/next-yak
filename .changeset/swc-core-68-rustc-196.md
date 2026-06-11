---
"yak-swc": patch
---

Fix building the SWC plugin on Rust 1.96+ and upgrade swc_core from 56.0.0 to 68.0.6.

Rust 1.96 removed the implicit `--allow-undefined` for wasm targets, which broke linking the plugin (`undefined symbol: __set_transform_result`). The wasm build now passes the link-arg explicitly, the Rust toolchain is pinned via `rust-toolchain.toml`, and swc_core (plus the separately pinned swc crates) moved to the current major. No behavior changes — all transform snapshots are unchanged.

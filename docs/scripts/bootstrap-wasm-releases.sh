#!/usr/bin/env bash
#
# One-time script to build playground WASM for old releases and upload
# the assets to their GitHub releases.
#
# Prerequisites:
#   - gh CLI authenticated
#   - Rust toolchain with wasm32-unknown-unknown target
#   - wasm-pack installed
#
# Usage: bash docs/scripts/bootstrap-wasm-releases.sh

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
TAGS=("yak-swc@9.0.0" "yak-swc@8.0.3" "yak-swc@7.0.0")

for tag in "${TAGS[@]}"; do
  version="${tag#yak-swc@}"
  echo "=== Processing $tag (v$version) ==="

  # Check if release already has WASM assets
  if gh release view "$tag" --json assets --jq '.assets[].name' 2>/dev/null | grep -q 'index_bg.wasm'; then
    echo "  Skipping: WASM assets already uploaded"
    continue
  fi

  # Create a temporary worktree
  worktree_dir="$(mktemp -d)"
  echo "  Creating worktree at $worktree_dir"
  git worktree add "$worktree_dir" "$tag" --detach

  # Build playground WASM
  echo "  Building WASM..."
  wasm-pack build "$worktree_dir/packages/docs/playground-wasm" \
    --out-dir "$worktree_dir/wasm-out" \
    --out-name index \
    --target web

  # Upload to GitHub release
  echo "  Uploading to release $tag..."
  gh release upload "$tag" \
    "$worktree_dir/wasm-out/index.js" \
    "$worktree_dir/wasm-out/index_bg.wasm" \
    --clobber

  # Clean up worktree
  echo "  Cleaning up worktree..."
  git worktree remove "$worktree_dir" --force

  echo "  Done with $tag"
done

echo "All releases bootstrapped."

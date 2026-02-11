#!/usr/bin/env bash
#
# Downloads WASM assets from GitHub releases for old versions,
# copies the current build, and generates a versions.json manifest.
#
# Usage:
#   bash docs/scripts/download-wasm-versions.sh [current_version]
#
# If current_version is not provided, it's read from packages/next-yak/package.json.
#
# Prerequisites:
#   - gh CLI authenticated (for downloading release assets)
#   - Current WASM already built at docs/playground-wasm/out/

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
WASM_DIR="$REPO_ROOT/docs/public/wasm"
OLD_TAGS=("yak-swc@9.0.0" "yak-swc@8.0.3" "yak-swc@7.0.0")

# Determine current version
if [ -n "${1:-}" ]; then
  CURRENT_VERSION="$1"
else
  CURRENT_VERSION="$(node -p "require('$REPO_ROOT/packages/next-yak/package.json').version")"
fi

echo "Current version: $CURRENT_VERSION"

# Ensure output directory exists
mkdir -p "$WASM_DIR"

# Copy current build
echo "Copying current build (v$CURRENT_VERSION)..."
mkdir -p "$WASM_DIR/$CURRENT_VERSION"
cp "$REPO_ROOT/docs/playground-wasm/out/index.js" "$WASM_DIR/$CURRENT_VERSION/index.js"
cp "$REPO_ROOT/docs/playground-wasm/out/index_bg.wasm" "$WASM_DIR/$CURRENT_VERSION/index_bg.wasm"

# Start building versions list (current version first)
VERSIONS="[{\"version\":\"$CURRENT_VERSION\",\"label\":\"v$CURRENT_VERSION (current)\"}"

# Download old versions from GitHub releases
for tag in "${OLD_TAGS[@]}"; do
  version="${tag#yak-swc@}"

  # Skip if this is the current version (already copied above)
  if [ "$version" = "$CURRENT_VERSION" ]; then
    continue
  fi

  echo "Downloading $tag (v$version)..."
  mkdir -p "$WASM_DIR/$version"

  if gh release download "$tag" \
    --pattern "index.js" --pattern "index_bg.wasm" \
    --dir "$WASM_DIR/$version" --clobber 2>/dev/null; then
    VERSIONS="$VERSIONS,{\"version\":\"$version\",\"label\":\"v$version\"}"
    echo "  Downloaded successfully"
  else
    echo "  Warning: Failed to download WASM for $tag (skipping)"
    rm -rf "$WASM_DIR/$version"
  fi
done

VERSIONS="$VERSIONS]"

# Write manifest
echo "$VERSIONS" | python3 -m json.tool > "$WASM_DIR/versions.json"
echo "Generated versions.json:"
cat "$WASM_DIR/versions.json"

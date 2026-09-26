#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/product-src"
OUT="$ROOT/public/products"
rm -rf "$OUT"
mkdir -p "$OUT"
for slug in remote-career-diy ai-project-handoff lnc-expanded; do
  test -d "$SRC/$slug"
  (cd "$SRC/$slug" && zip -qr "$OUT/$slug.zip" .)
  test -s "$OUT/$slug.zip"
done
printf 'Built product archives:\n'
ls -lh "$OUT"/*.zip

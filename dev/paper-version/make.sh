#!/bin/bash
# Rebuild the Unit 1 Review paper materials from js/activities/unit1-review.js.
# usage: dev/paper-version/make.sh [output folder]   (default: ~/Downloads/Unit 1 Review Paper Version)
# needs: node, python3 + python-docx.  Optional preview: render_check.sh (Word on macOS) + sheets.py (Pillow, pdftoppm).
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; REPO="$(cd "$HERE/../.." && pwd)"
OUT="${1:-$HOME/Downloads/Unit 1 Review Paper Version}"; TMP="$(mktemp -d)"
node "$HERE/export.js" "$REPO/js/activities/unit1-review.js" "$TMP/data.json"
(cd "$HERE" && python3 build.py "$TMP/data.json" "$OUT")
rm -rf "$TMP"

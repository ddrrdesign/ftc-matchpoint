#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

git add -A

if git diff --cached --quiet; then
  echo "Nothing to commit (working tree clean or no changes)."
  exit 0
fi

MSG="${MSG:-chore: sync}"
git commit -m "$MSG"
git push origin HEAD

echo "Pushed to origin ($(git branch --show-current))."

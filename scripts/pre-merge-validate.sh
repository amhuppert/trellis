#!/usr/bin/env bash
set -euo pipefail

export CLAUDECODE=1

TARGET_BRANCH="${TARGET_BRANCH:-main}"
merge_base=""
if git rev-parse --verify --quiet "${TARGET_BRANCH}^{commit}" >/dev/null 2>&1; then
  merge_base="$(git merge-base "${TARGET_BRANCH}" HEAD 2>/dev/null || true)"
fi

if [ -z "$merge_base" ]; then
  echo "pre-merge: no merge base against '${TARGET_BRANCH}'; validating entire tree" >&2
fi

pnpm -r typecheck

if [ -z "$merge_base" ]; then
  NODE_ENV=test pnpm -r test -- --no-color
else
  NODE_ENV=test pnpm -r test -- --no-color --changed "$merge_base" --passWithNoTests
fi

#!/usr/bin/env bash
set -euo pipefail

export CLAUDECODE=1

pnpm install --frozen-lockfile

pnpm -r typecheck
pnpm -r lint
pnpm -r test -- --no-color

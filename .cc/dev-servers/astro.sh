#!/usr/bin/env sh
set -eu

pnpm dev postgres-mvcc -- --host 0.0.0.0 --port "${PORT:-4321}"

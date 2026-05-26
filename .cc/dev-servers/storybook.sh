#!/usr/bin/env sh
set -eu

STORYBOOK_DISABLE_TELEMETRY=1 pnpm --filter @trellis/storybook exec storybook dev --host 0.0.0.0 --port "${PORT:-6006}"

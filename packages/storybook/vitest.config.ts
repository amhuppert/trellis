import { defineConfig } from "vitest/config";
import os from "node:os";

const isAI = process.env.CLAUDECODE === "1";
const isCI = process.env.CI === "true";

const GB = 1024 ** 3;
const maxForks = Math.max(
  2,
  Math.min(
    os.availableParallelism(),
    Math.floor(((os.totalmem() / GB) * 0.6) / 2),
  ),
);

function getReporters(): ("default" | "dot" | "github-actions")[] {
  if (isCI) return ["dot", "github-actions"];
  if (isAI) return ["dot"];
  return ["default"];
}

export default defineConfig({
  test: {
    reporters: getReporters(),
    pool: "forks",
    poolOptions: {
      forks: {
        maxForks,
        minForks: 1,
        execArgv: ["--max-old-space-size=2048"]
      }
    },
    ...(isAI && {
      bail: 3,
      onConsoleLog() {
        return false;
      },
      onStackTrace(_error, { file }) {
        if (file.includes("node_modules")) return false;
      },
      diff: {
        truncateThreshold: 2000,
        truncateAnnotation: "... diff truncated",
        expand: false
      }
    })
  }
});

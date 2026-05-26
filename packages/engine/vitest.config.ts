import { defineConfig } from "vitest/config";

const isAI = process.env.CLAUDECODE === "1";
const isCI = process.env.CI === "true";

function getReporters(): ("default" | "dot" | "github-actions")[] {
  if (isCI) return ["dot", "github-actions"];
  if (isAI) return ["dot"];
  return ["default"];
}

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    reporters: getReporters(),
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

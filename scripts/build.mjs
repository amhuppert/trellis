import { spawn } from "node:child_process";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const reportId = args[0] && !args[0].startsWith("-") ? args[0] : process.env.PUBLIC_REPORT_ID ?? "postgres-mvcc";
const rawPassthroughArgs = args[0] && !args[0].startsWith("-") ? args.slice(1) : args;
const passthroughArgs = rawPassthroughArgs[0] === "--" ? rawPassthroughArgs.slice(1) : rawPassthroughArgs;

const child = spawn(
  "pnpm",
  ["--filter", "@trellis/astro-app", "exec", "vite", "build", "--config", "vite.static.config.ts", ...passthroughArgs],
  {
  env: {
    ...process.env,
    PUBLIC_REPORT_ID: reportId,
    REPORT_ID: reportId,
    TRELLIS_OUT_DIR: resolve(process.cwd(), "reports", reportId, "dist")
  },
  shell: process.platform === "win32",
  stdio: "inherit"
  }
);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

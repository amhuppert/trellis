import tailwindcss from "@tailwindcss/vite";
import { loadReport } from "../engine/src/validation/report-loader";
import { validateReport } from "../engine/src/validation/validate";
import { readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const reportId = process.env.REPORT_ID ?? process.env.PUBLIC_REPORT_ID ?? "postgres-mvcc";
const outDir = process.env.TRELLIS_OUT_DIR ?? resolve(process.cwd(), "reports", reportId, "dist");

const virtualReportPlugin = () => ({
  name: "trellis-virtual-report",
  resolveId(id) {
    return id === "virtual:trellis-report" ? "\0virtual:trellis-report" : null;
  },
  async load(id) {
    if (id !== "\0virtual:trellis-report") return null;

    const loaded = await loadReport(reportId);
    const result = validateReport(loaded.report, loaded.context);

    if (result.errors.length > 0) {
      const details = result.errors.map((error) => `${error.filePath}: ${error.message}`).join("\n");
      throw new Error(`Report ${reportId} failed validation:\n${details}`);
    }

    return `export default ${JSON.stringify(loaded.report)};`;
  }
});

const staticHtmlPlugin = () => ({
  name: "trellis-static-html",
  writeBundle() {
    const assetDir = resolve(outDir, "_astro");
    const files = readdirSync(assetDir);
    const jsFile = files.find((file) => file.endsWith(".js"));
    const cssFile = files.find((file) => file.endsWith(".css"));

    if (!jsFile) throw new Error("Trellis static build did not emit an entry script");

    writeFileSync(
      resolve(outDir, "index.html"),
      [
        "<!doctype html>",
        '<html lang="en" class="bg-bg text-ink">',
        "<head>",
        '<meta charset="UTF-8" />',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
        `<title>Trellis - ${reportId}</title>`,
        cssFile ? `<link rel="stylesheet" href="./_astro/${cssFile}" />` : "",
        "</head>",
        '<body class="min-h-screen bg-bg text-ink font-sans">',
        '<div id="trellis-root"></div>',
        `<script src="./_astro/${jsFile}" defer></script>`,
        "</body>",
        "</html>"
      ].join("")
    );
  }
});

export default {
  define: {
    "process.env.NODE_ENV": JSON.stringify("production")
  },
  esbuild: {
    jsx: "automatic",
    jsxDev: false
  },
  plugins: [virtualReportPlugin(), tailwindcss(), staticHtmlPlugin()],
  build: {
    assetsDir: "_astro",
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    emptyOutDir: true,
    lib: {
      entry: resolve(import.meta.dirname, "src/static-entry.tsx"),
      name: "TrellisStaticReport",
      formats: ["iife"],
      fileName: () => "app.js"
    },
    outDir,
    rollupOptions: {
      output: {
        assetFileNames: "_astro/[name][extname]",
        entryFileNames: "_astro/[name].js",
        inlineDynamicImports: true
      }
    }
  }
};

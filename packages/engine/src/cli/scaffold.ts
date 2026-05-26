#!/usr/bin/env tsx
import { access, cp, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";

export type TemplateName = "tutorial" | "codebase" | "feature" | "comparison" | "custom";

type MainOptions = {
  template: TemplateName;
  cwd?: string;
};

const templateNames: TemplateName[] = ["tutorial", "codebase", "feature", "comparison", "custom"];
const textExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".mdx"]);

const exists = async (path: string) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const findRepoRoot = async (cwd: string) => {
  let current = resolve(cwd);
  while (true) {
    if (await exists(resolve(current, "pnpm-workspace.yaml"))) return current;
    const parent = dirname(current);
    if (parent === current) return resolve(cwd);
    current = parent;
  }
};

const assertReportName = (name: string) => {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    throw new Error(`Report name "${name}" must be lowercase kebab-case.`);
  }
};

const replaceTemplateId = async (path: string, oldId: string, newId: string) => {
  const entry = await stat(path);
  if (entry.isDirectory()) {
    const children = await readdir(path);
    await Promise.all(children.map((child) => replaceTemplateId(resolve(path, child), oldId, newId)));
    return;
  }

  if (!entry.isFile() || !textExtensions.has(extname(path))) return;

  const before = await readFile(path, "utf8");
  const after = before.replace(new RegExp(oldId, "g"), newId);
  if (after !== before) await writeFile(path, after);
};

export const main = async (name: string, options: MainOptions): Promise<void> => {
  assertReportName(name);
  if (!templateNames.includes(options.template)) {
    throw new Error(`Unknown template "${options.template}". Expected one of: ${templateNames.join(", ")}.`);
  }

  const repoRoot = await findRepoRoot(options.cwd ?? process.cwd());
  const templateId = `template-${options.template}`;
  const sourceRoot = resolve(repoRoot, "reports", `_${templateId}`);
  const destinationRoot = resolve(repoRoot, "reports", name);

  if (!(await exists(sourceRoot))) {
    throw new Error(`Template "${options.template}" was not found at reports/_${templateId}.`);
  }

  if (await exists(destinationRoot)) {
    throw new Error(`Report destination reports/${name} already exists; refusing to overwrite.`);
  }

  await cp(sourceRoot, destinationRoot, { recursive: true });
  await replaceTemplateId(destinationRoot, templateId, name);

  console.log(`Created reports/${name} from ${options.template} template.`);
  console.log(`Run pnpm validate ${name} to check; pnpm dev ${name} to preview.`);
};

const parseArgs = (args: string[]) => {
  const name = args[0];
  const templateFlagIndex = args.indexOf("--template");
  const template = templateFlagIndex >= 0 ? args[templateFlagIndex + 1] : undefined;

  if (!name || !template) {
    throw new Error("Usage: trellis-scaffold-report <name> --template <tutorial|codebase|feature|comparison|custom>");
  }

  return { name, template: template as TemplateName };
};

const invokedPath = process.argv[1] ? new URL(`file://${process.argv[1]}`).href : undefined;
if (invokedPath === import.meta.url) {
  try {
    const { name, template } = parseArgs(process.argv.slice(2));
    await main(name, { template });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

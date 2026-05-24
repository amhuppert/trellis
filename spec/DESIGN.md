# Design: Agent-Authored Interactive Reports

> Companion to `REQUIREMENTS.md`. The tech stack and most functional decisions are committed. Sections marked **[Open]** flag the small set of items deferred to prototyping or later phases (mostly visual).

## 1. Architecture Overview

The system has **two parallel deliverables**, both shipped from the same repo:

1. **The engine** — design tokens, React component library, Zod schemas, Astro build pipeline, Storybook.
2. **The agent instruction layer** — a set of Claude Code skills that encode how to use the engine well, plus how to research, teach, synthesize, and model knowledge.

A **report** is a directory of content plus a manifest that the engine builds into a self-contained static folder.

```
┌─────────────────────────────────────────────────────────────────┐
│  Authoring surface (agent reads this)                            │
│  ─ Claude Code skills (.claude/skills/*/SKILL.md)                │
│  ─ Storybook (component catalog with real examples)              │
│  ─ Zod schemas with .describe() docstrings                       │
│  ─ AGENTS.md (project orientation; pointers to the above)        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Report source (agent writes this)                               │
│  ─ report.config.ts (manifest)                                   │
│  ─ content/ (TS modules with structured blocks)                  │
│  ─ prose/ (MDX for prose-heavy sections)                         │
│  ─ kg/ (entities.ts, relationships.ts)                           │
│  ─ sources/ (source references)                                  │
│  ─ custom/ (optional one-off React components)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Build pipeline (Astro)                                          │
│  ─ Schema + reference validation                                 │
│  ─ Astro routing (file-based, per-section pages)                 │
│  ─ Shiki build-time code highlighting                            │
│  ─ Static site generation                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Output: reports/<name>/dist/                                    │
│  Self-contained, openable locally, no network deps               │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Tech Stack (committed)

| Concern | Choice |
| --- | --- |
| Framework | **Astro** with React islands |
| UI library | **React** (rendered into Astro pages) |
| Language | **TypeScript** throughout |
| Styling | **Tailwind CSS** as a constrained facade over CSS-variable design tokens (default palette disabled; semantic utilities only) |
| Class composition | **clsx** + **tailwind-merge** via a `cn()` helper |
| Component variants | **class-variance-authority** (cva) |
| Accessibility primitives | **Radix UI** (popovers, tabs, dialogs, dropdowns, tooltips) |
| Schemas | **Zod** |
| Component docs | **Storybook** |
| Graph viz | **react-flow** |
| Charts | **Recharts** (standard); **D3** (custom) |
| Diagrams | **Mermaid** (flow/sequence); custom SVG (bespoke) |
| Code highlighting | **Shiki** (build-time) |
| MDX | Astro's built-in MDX |
| Package manager | **pnpm** with workspaces |
| Agent skills | **Claude Code skill format** (`SKILL.md` with YAML frontmatter) |

## 3. Repository Layout

```
report-system/
├── packages/
│   ├── engine/                     # The shared engine
│   │   ├── design-tokens/          # Tailwind + CSS var sources
│   │   ├── components/             # React component library
│   │   │   ├── layout/             # Page shell, sidebar, mini-map
│   │   │   ├── content/            # Generic content blocks
│   │   │   ├── teaching/           # Teaching components
│   │   │   ├── codebase/           # Codebase-specific components
│   │   │   └── viz/                # Visualization wrappers
│   │   ├── layouts/                # Astro layouts
│   │   ├── schemas/                # Zod schemas
│   │   ├── kg/                     # KG runtime (resolver, hover-card, graph view)
│   │   ├── synthesis/              # Synthesis tree UI
│   │   └── build/                  # Validation + build scripts
│   └── astro-app/                  # Astro app that consumes a report
├── storybook/                      # Component catalog
├── reports/
│   ├── _template-tutorial/         # Starter templates
│   ├── _template-codebase/
│   ├── _template-feature/
│   ├── _template-comparison/
│   ├── postgres-mvcc/              # Example: topic tutorial
│   │   ├── report.config.ts
│   │   ├── content/
│   │   ├── prose/
│   │   ├── kg/
│   │   ├── sources/
│   │   ├── custom/
│   │   └── dist/                   # Build output (gitignored)
│   └── …
├── .claude/
│   └── skills/                     # Claude Code skills
│       ├── report-composition/
│       │   └── SKILL.md
│       ├── component-library-usage/
│       │   └── SKILL.md
│       ├── research-and-analysis/
│       │   └── SKILL.md
│       ├── teaching-tone/
│       │   └── SKILL.md
│       ├── teaching-order/
│       │   └── SKILL.md
│       ├── synthesis/
│       │   └── SKILL.md
│       ├── entity-modeling/
│       │   └── SKILL.md
│       └── visualization-guidelines/
│           └── SKILL.md
├── AGENTS.md                       # Project orientation for agents
├── README.md                       # Project orientation for humans
└── pnpm-workspace.yaml
```

Each report is built independently. The engine is consumed via workspace package references; reports don't bundle the engine, they share it.

## 4. Two Deliverables in More Detail

### 4.1 The Engine

Provides the mechanical surface: design tokens, components, schemas, validation, build. Code in `packages/engine/` and `packages/astro-app/`. Storybook in `storybook/`.

### 4.2 The Agent Instruction Layer

Authored as **Claude Code skills** in `.claude/skills/`. Each skill is a folder containing at minimum a `SKILL.md` with YAML frontmatter:

```markdown
---
name: report-composition
description: Use when assembling a full report from scratch — selecting a template, drafting the section tree, planning the synthesis hierarchy, and wiring entities and sources. Triggers on tasks like "build a report on X" or "scaffold a new report."
---

# Report Composition

Step-by-step guide for assembling a complete report...
```

Skills self-trigger based on context, so the agent doesn't have to read everything every session — relevant guidance loads when relevant.

### 4.3 Skill Modules (V1)

| Skill | Triggers | Covers |
| --- | --- | --- |
| `report-composition` | Building or scaffolding a new report | Picking a template, drafting the outline, wiring the manifest, the report-construction workflow end-to-end |
| `component-library-usage` | Choosing components, composing blocks | Component catalog summary, when to use each, pointer to Storybook for specifics |
| `research-and-analysis` | Investigating a topic or codebase before writing | Gathering sources, distinguishing facts from inferences, tracing code paths, identifying what the reader needs to know first |
| `teaching-tone` | Writing any prose in a report | The voice: clear, calm, precise, teaching-focused, neither shallow nor expert-only |
| `teaching-order` | Sequencing material within a section or report | Big picture first, foundations before mechanisms, examples before abstractions, defer detail until there's a frame for it |
| `synthesis` | Building the synthesis hierarchy | Quality criteria — synthesis identifies common structure, doesn't merely concatenate; linking back to children |
| `entity-modeling` | Building the KG | Selecting useful entities, writing concise definitions, choosing relationship types, noting uncertainty with strength values |
| `visualization-guidelines` | Choosing whether and how to visualize | When visualizations help vs. when they're decorative; choosing among graph, timeline, flow, comparison matrix, etc.; preferring focus over comprehensiveness |

`AGENTS.md` at repo root provides project orientation and points to the skills, schemas, Storybook, and key commands.

Each skill cites the schemas and Storybook rather than restating them, so docs don't drift.

## 5. Design System

### 5.1 Styling approach

Tailwind CSS, but configured as a **thin facade over CSS-variable design tokens**. The agent writes familiar utility classes; the utilities available are the design system's vocabulary, not the open Tailwind palette.

Constraints:

- **Default color palette disabled.** Only semantic color utilities are exposed (e.g. surface, text, accent, border roles). The agent can't reach for raw `bg-blue-500`; the class doesn't exist.
- **Font-size scale replaced with named roles** (heading levels, body, caption, code, etc.) that each bundle size, line-height, weight, and tracking.
- **Spacing scale kept** (Tailwind's default is already constrained and familiar), with a few semantic aliases for rhythm-critical cases.
- **Dark mode via CSS variable flip** on `class="dark"`. Tokens stay the same names; values change. The agent doesn't need `dark:` variants for semantic colors — dark-mode parity is free. Variants are needed only for properties that differ structurally between themes (rare).

Specific tokens — the exact semantic names, the color values, the type roles — are deferred to the visual-prototyping phase. The *shape* of the system is what's committed here; the *vocabulary* is filled in during design.

### 5.2 Where styling lives

The agent rarely writes Tailwind directly. The component library is pre-styled; the agent composes `<Callout variant="info">`, `<KeyTakeaways>`, `<EntityRef>` rather than assembling utility strings. Raw Tailwind appears in:

- The engine's own component implementations (curated, reviewed by hand)
- Report-local `custom/` components (still over the constrained palette)
- Occasionally MDX prose for a one-off tweak — the prose components should make this rare

Design-system enforcement happens at two levels: components handle 90%+ of cases with no styling input from the agent, and the constrained Tailwind config catches the rest.

### 5.3 Token system mechanics

Source of truth lives in `packages/engine/design-tokens/` and exports as both Tailwind theme extensions and CSS variables. Single declaration → both `bg-surface` utility and `var(--color-surface)` for the cases where utilities don't fit (e.g. inline SVG fills, dynamic gradients).

### 5.4 Helper libraries

- **`clsx` + `tailwind-merge`** behind a `cn()` helper for class composition with conflict resolution.
- **`class-variance-authority` (cva)** for component variants. The library defines the variant table once; the consumer (often the agent in a custom component) passes typed props. Most styling decisions are encoded in cva, not at the call site.
- **Radix UI** primitives for accessibility-critical behavior — `<EntityRef>` hover-cards, tabs, dialogs, dropdowns, tooltips. Wrapped by engine components and styled with the same Tailwind tokens.

### 5.5 Visual direction

**[Open]** Six candidates to prototype against the same sample content before committing: *Premium Interactive Technical Atlas*, *Calm Technical Book*, *Interactive Textbook*, *Code Intelligence Cockpit*, *Research Notebook / Lab Manual*, *Premium Documentation Site*. Decision deferred to the design-prototype phase. Typography choices (display family, body sans, mono) and exact palette settle here too.

## 6. Component Library

Tiered by purpose. Each component has a Storybook story with realistic examples, prose on when to use it, and prose on when **not** to use it.

### 6.1 Layout & navigation
`PageShell`, `Sidebar`, `MiniMap`, `Breadcrumbs`, `ContentMap`, `SectionLayout`, `RightRail`, `ModeToggle`, `QuickJump`.

### 6.2 Generic content blocks
`Heading` (auto-anchor + copy-link), `Prose` (typography wrapper for MDX), `Callout` (info/warn/aside/quote), `Definition`, `Figure`, `ComparisonTable`, `CodeBlock`, `InlineCode`, `Diff`, `Footnote`/`Sidenote`, `Tabs`, `Expand`.

### 6.3 Teaching components
These encode pedagogical patterns directly:

`ConceptIntro`, `MentalModelCard`, `KeyTakeaways`, `Example`, `Analogy`, `CommonMisconception`, `StepByStep`, `CheckUnderstanding`, `BeforeYouContinue`, `FoundationsBlock`, `ProgressiveDisclosure`.

The skill `teaching-order` tells the agent which to reach for at each stage of a section.

### 6.4 Codebase-specific components
For reports that touch real code:

`CodeReference` (file path + line range + optional excerpt), `FileReferenceCard`, `SymbolCard` (function/type/component summary), `ComponentHierarchy`, `DataFlowView`, `CallPathView`, `LayeredArchitectureMap`, `DependencyList`.

### 6.5 Synthesis components
`SynthesisNodeView`, `SynthesisTree`, `RollupSummary`, `ParentContextCard`, `ChildSummaryGrid`.

### 6.6 Knowledge graph components
`EntityRef` (inline mention with hover-card and click-to-jump), `EntityGlossary`, `EntityDetailPanel`, `KnowledgeGraphView`, `RelationshipList`, `RelationshipLegend`, `NeighborhoodExplorer`.

### 6.7 Visualization wrappers
`ChartContainer`, `DiagramContainer` (wraps Mermaid), `GraphContainer` (wraps react-flow), `Timeline`, `ComparisonMatrix`, `StateMachineDiagram`, `SequenceDiagram`.

### 6.8 Conventions

- Function components, named exports, TypeScript props.
- Components use the constrained Tailwind utilities + CSS variables; no raw color values or off-scale spacing in either engine or report code.
- Component variants encoded via `cva` where there's more than one shape; otherwise direct utility classes.
- Class composition via the `cn()` helper (`clsx` + `tailwind-merge`).
- Accessibility behavior delegated to Radix primitives where applicable, with our tokens applied as styling.
- No component depends on report-specific context; report context flows through providers wired by the layout.
- Dark mode via `class="dark"` on `<html>`; tokens flip via CSS variables, so most components need no `dark:` variants.

## 7. Routing & Reading Modes

Astro file-based routing. Each top-level section is a route at `/section/<id>`. Child subsections render as anchored regions on the parent's page (long enough to feel like a chapter, short enough that the URL is meaningful).

Additional routes:

- `/` — orientation view (entry)
- `/map` — full content map (Map mode)
- `/glossary` — entity index by type and alphabetical (Reference mode)
- `/graph` — KG graph view
- `/entity/<id>` — entity detail (Deep Dive mode)
- `/synthesis` — synthesis tree (when present)
- `/synthesis/<id>` — focused synthesis node

The sidebar and mini-map persist across routes via Astro's view transitions or shared component hydration; current location is always indicated.

## 8. Data Model (Zod Schemas)

Schemas live in `packages/engine/schemas/`. Every field has a `.describe()` string explaining purpose, expected style, and common mistakes — this content is part of the agent instruction layer.

```ts
// Top-level manifest
export const ReportConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  audience: z.string().optional(),
  goals: z.array(z.string()).default([]),
  authors: z.array(z.string()).default(["Claude"]),
  builtAt: z.string().datetime(),
  template: z.enum(["tutorial", "codebase", "feature", "comparison", "custom"]),

  orientation: OrientationSchema,                       // Required: hero, what-you'll-learn, recommended path
  sections: z.array(SectionSchema),                     // Linear reading flow
  synthesis: SynthesisRootSchema.optional(),            // Parallel synthesis hierarchy
  kg: KnowledgeGraphSchema.optional(),
  sources: z.array(SourceReferenceSchema).default([]), // First-class source inventory
  customComponents: z.array(CustomManifestSchema).default([]),
});

// Orientation view (the entry experience)
export const OrientationSchema = z.object({
  heroSummary: z.string(),
  whatYoullLearn: z.array(z.string()),
  recommendedPath: z.array(z.string()),            // Section ids in suggested order
  keyConceptIds: z.array(z.string()).default([]),  // For the orientation preview
});

// Sections — the linear/navigable content tree
export const SectionSchema: z.ZodType<Section> = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string().optional(),
  blocks: z.array(BlockSchema).default([]),
  children: z.array(z.lazy(() => SectionSchema)).default([]),
  relatedSectionIds: z.array(z.string()).default([]),
  relatedEntityIds: z.array(z.string()).default([]),
  sourceRefIds: z.array(z.string()).default([]),
});

// Blocks — the agent's "menu" of content types
export const BlockSchema = z.discriminatedUnion("type", [
  ProseBlockSchema,             // MDX
  CalloutBlockSchema,
  CodeBlockSchema,
  FigureBlockSchema,
  ComparisonTableBlockSchema,
  DefinitionBlockSchema,
  // Teaching tier
  ConceptIntroBlockSchema,
  MentalModelBlockSchema,
  KeyTakeawaysBlockSchema,
  ExampleBlockSchema,
  AnalogyBlockSchema,
  CommonMisconceptionBlockSchema,
  StepByStepBlockSchema,
  CheckUnderstandingBlockSchema,
  // Codebase tier
  CodeReferenceBlockSchema,
  FileReferenceBlockSchema,
  SymbolCardBlockSchema,
  // Visualization tier
  ChartBlockSchema,
  DiagramBlockSchema,
  // Escape hatch
  CustomBlockSchema,
]);

// Synthesis hierarchy (separate from section tree)
export const SynthesisNodeSchema: z.ZodType<SynthesisNode> = z.object({
  id: z.string(),
  level: z.number().int().min(0),
  title: z.string(),
  summary: z.string(),
  detail: z.string().optional(),                       // Optional longer treatment (MDX-capable)
  keyTakeaways: z.array(z.string()).default([]),
  children: z.array(z.lazy(() => SynthesisNodeSchema)).default([]),
  references: z.array(ReferenceSchema).default([]),    // Back to sections, entities, sources
});

export const SynthesisRootSchema = z.object({
  description: z.string().optional(),
  roots: z.array(SynthesisNodeSchema),
});

// Knowledge graph
export const EntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  aliases: z.array(z.string()).default([]),
  type: z.enum([
    "concept", "module", "function", "type", "component",
    "library", "feature", "paper", "person", "pattern",
    "file", "api", "workflow", "other",
  ]),
  shortDef: z.string(),                                // 1–2 sentences for hover cards
  description: z.string().optional(),                  // Longer treatment (MDX-capable)
  references: z.array(ReferenceSchema).default([]),
  primarySection: z.string().optional(),
});

export const RelationshipSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  type: z.string(),                                    // Free-form but conventions encouraged
  label: z.string().optional(),
  strength: z.enum(["weak", "medium", "strong"]).optional(),
  description: z.string().optional(),
  sourceRefIds: z.array(z.string()).default([]),
});

export const KnowledgeGraphSchema = z.object({
  entities: z.array(EntitySchema),
  relationships: z.array(RelationshipSchema),
});

// Source references — first-class, enumerable
export const SourceReferenceSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("code"),
    id: z.string(),
    path: z.string(),
    lineRange: z.tuple([z.number(), z.number()]).optional(),
    commit: z.string().optional(),
    excerpt: z.string().optional(),
  }),
  z.object({
    kind: z.literal("url"),
    id: z.string(),
    href: z.string().url(),
    title: z.string(),
    accessed: z.string().datetime().optional(),
  }),
  z.object({
    kind: z.literal("document"),
    id: z.string(),
    title: z.string(),
    locationHint: z.string().optional(),
  }),
  z.object({
    kind: z.literal("passage"),
    id: z.string(),
    documentSourceId: z.string(),
    location: z.string(),                              // e.g. "§3.2" or "p. 47"
    excerpt: z.string().optional(),
  }),
]);

// Lightweight reference type used throughout
export const ReferenceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("section"), id: z.string() }),
  z.object({ kind: z.literal("entity"), id: z.string() }),
  z.object({ kind: z.literal("source"), id: z.string() }),
]);

// Customization manifest — required entry per custom component
export const CustomManifestSchema = z.object({
  name: z.string(),                                    // Matches reports/<name>/custom/<Name>.tsx
  purpose: z.string(),
  justification: z.string(),                           // Why standard components weren't enough
  usedIn: z.array(z.string()),                         // Section or block ids where used
});
```

### Validation requirements

Build fails on:

- Duplicate ids within any namespace (sections, entities, sources, custom components, synthesis nodes)
- Section, entity, or source references pointing at missing ids
- Relationship endpoints pointing at missing entity ids
- `CustomBlock` whose `component` name has no matching file in `custom/` or no manifest entry
- Orientation referencing missing section ids in `recommendedPath`

Validation errors are written for agents: clear, specific, file/line where possible.

## 9. Report Templates

Each template under `reports/_template-*/` provides a starter `report.config.ts` with the default structure for that template kind, plus stub content files showing the recommended shape. Scaffolding copies a template.

- **`tutorial`** — orientation, foundations, core concepts, worked examples, advanced concepts, glossary, optional review.
- **`codebase`** — orientation, architecture map, main flows, key modules, data model, dependency graph, code references, synthesis tree, glossary.
- **`feature`** — feature summary, user-facing behavior, frontend flow, backend/API flow, data model, state transitions, error cases, extension points.
- **`comparison`** — decision context, evaluation criteria, comparison matrix, deep dives, tradeoffs, recommendation.
- **`custom`** — empty starter; agent designs the structure.

The `report-composition` skill points the agent at the right template by use case.

## 10. Authoring Workflow

1. **Scaffold.** Agent runs `pnpm scaffold-report <name> --template <tutorial|codebase|feature|comparison|custom>`. Creates the report directory from the chosen template.
2. **Research.** Agent's `research-and-analysis` skill activates. Working notes go to a scratch location (not under `reports/<name>/`); only structured content ships.
3. **Plan.** Agent drafts the orientation, the section tree, the recommended path, and (if applicable) the synthesis hierarchy and entity list. Writes these into the manifest.
4. **Author.** Agent fills in `content/` blocks, MDX in `prose/`, entities and relationships in `kg/`, source references in `sources/`. Teaching components and codebase components used per the relevant skills.
5. **Custom components when justified.** Agent adds files under `custom/` and registers each in the manifest with purpose and justification.
6. **Validate.** Agent runs `pnpm validate <name>`. Fixes any errors.
7. **Build.** Agent runs `pnpm build <name>`. The user reads `dist/` via `pnpm dev <name>` or by opening the static output.

The agent runs validation and build directly; the user is not in the build loop.

## 11. Build & Output

- **Dev:** `pnpm dev <report>` — Astro dev server with HMR. Used during authoring and by the reader.
- **Validate:** `pnpm validate <report>` — schema + reference checks; fast.
- **Build:** `pnpm build <report>` — produces `reports/<name>/dist/`. Self-contained: no CDN fonts, no analytics, no network at runtime.
- **Code highlighting** runs at build time via Shiki; runtime ships pre-styled HTML.
- **Assets** (images, custom SVGs) live alongside content under the report directory; the build copies or inlines them.

Single-file HTML export is V1.x. Search index is V1.x.

## 12. Knowledge Graph Implementation

In `packages/engine/kg/`:

- **Entity resolver** — given an id, returns entity + position in the report.
- **`<EntityRef id="..."/>`** — usable in MDX and structured blocks. Renders as inline link with hover-card showing short def and type badge; click jumps to the entity's primary section or `/entity/<id>`.
- **Glossary page** — auto-generated at `/glossary`. Alphabetical and by-type views.
- **Graph view** — react-flow at `/graph`. Nodes colored by type; edges typed; affordances: search, filter by entity type, filter by relationship type, focus mode, gradual neighborhood expansion.
- **Entity detail pages** — at `/entity/<id>`. Definition, related sections, neighbors, references.

No autolinking in V1: explicit `<EntityRef>` only.

## 13. Customization Mechanism

The escape hatch is a `CustomBlock`:

```ts
{
  type: "custom",
  componentName: "MVCCTimeline",       // matches reports/<name>/custom/MVCCTimeline.tsx
  props: { /* schema-free; agent's responsibility */ },
}
```

Rules:

- File `reports/<name>/custom/<componentName>.tsx` must exist; build verifies.
- A matching entry in `customComponents` in the manifest is required with `purpose`, `justification`, `usedIn`. Missing entry fails validation.
- Custom components must import only from `@engine/*` and standard libraries; ad-hoc UI libraries discouraged. **[V1.x]** lint enforcement.
- The `report-composition` skill instructs: prefer standard components; reach for `CustomBlock` only when the content genuinely requires a unique visualization or interaction.

## 14. Reader State

Minimal `localStorage`, keyed by report id:

- Last visited section route, for "resume reading."
- Expand/collapse state of `Expand` blocks and synthesis nodes.

No highlights, notes, seen/unseen tracking, or sync across devices in V1.

## 15. Milestones

Suggested order; each milestone produces something runnable.

1. **Foundations.** Tokens, base components (layout + a few generic blocks), Astro scaffold, Storybook, initial `ReportConfigSchema` and `SectionSchema`, simplest possible `pnpm validate` and `pnpm build`.
2. **First end-to-end report.** Single example topic-tutorial report rendered through the pipeline. Section navigation, orientation page, content map sidebar. No KG yet.
3. **Synthesis + Knowledge graph.** Synthesis schema and tree view. Entity/relationship schemas, glossary page, hover-cards, graph view, entity detail pages, reference validation.
4. **Codebase template + components.** Codebase-specific components, source-reference schema fleshed out, second example report (codebase architecture).
5. **Skill modules.** All eight skills authored in `.claude/skills/`. AGENTS.md finalized. Iterate against agent runs.

## 16. Open Design Decisions

Mostly visual or deferred.

1. **Visual design vision.** Six candidates listed in §5; prototype 2–3 against the same sample content, then pick.
2. **Mini-map UX.** Tree sidebar with collapsed/expanded state, thumb-style scrubber, or compact graph? Prototype before committing.
3. **Synthesis tree UI.** Nested-card list, indented outline, or zoom interaction? Prototype.
4. **Light vs dark default.** Both supported; default chosen during visual prototyping.
5. **Engine versioning policy.** Probably doesn't matter for many months; revisit when a breaking change is on the table.
6. **Project name.** TBD.

# Design: Trellis — Agent-Authored Interactive Reports

> Companion to `REQUIREMENTS.md`. Updated to reflect the Claude Design handoff and Modular Bento prototype. The Trellis visual direction and five-mode app shell are now committed. **React Flow is the production graph visualization implementation.**

## 1. Source-of-Truth Hierarchy

The repo contains Markdown specs, a design-system handoff, a component-library handoff, and HTML/JS prototypes. To prevent drift, use this hierarchy:

1. **`spec/REQUIREMENTS.md`** — product intent, scope, and acceptance criteria.
2. **`spec/DESIGN.md`** — architecture, schema, component organization, build plan, and implementation decisions.
3. **`claude-design-handoff/project/Trellis Design System.html`** — Trellis token values and visual grammar.
4. **`claude-design-handoff/project/Component Library Handoff.html`** — component contracts, props, interactions, accessibility notes, and build order.
5. **`claude-design-handoff/project/bento/*` and `graph/*`** — behavior and data fixtures. These are prototype references, not production code to copy directly.

If these sources conflict, the Markdown specs should be updated to reflect the intended decision. As of this revision, the prototype decisions below are adopted.

## 2. Adopted Prototype Decisions

- Product name: **Trellis**.
- Visual direction: warm editorial technical atlas with linen/paper surfaces, deep ink, sage/coral/butter accents, serif reading type, sans UI type, and mono metadata/code.
- Reader shell: `TopBar` + persistent `NavPanel` + main mode view + optional guided-only `RightRail`.
- Modes: `orientation`, `guided`, `reference`, `synthesis`, `graph`.
- No standalone Map mode. The persistent `NavPanel` is the map.
- No standalone Deep Dive mode. Focused entity/synthesis/graph states cover deep-dive behavior.
- Core content uses structured blocks and `InlineProse`, not arbitrary Markdown.
- Graph UX follows the prototype’s Atlas / Spotlight / Regions concepts.
- Production graph rendering uses **React Flow**, not the prototype’s hand-authored SVG implementation.
- V1 is delivered in milestones, starting with the guided reader path and one golden topic report.

## 3. Architecture Overview

Trellis has two parallel deliverables:

1. **The engine** — design tokens, React component library, Zod schemas, validation, Astro build pipeline, Storybook, graph/runtime helpers.
2. **The agent instruction layer** — Claude Code skills that teach agents how to research, compose, author, validate, and build Trellis reports.

A report is a directory of structured content and assets. The engine validates it, renders it through the reader shell, and emits a self-contained static output folder.

```text
┌─────────────────────────────────────────────────────────────────┐
│ Authoring surface                                                │
│ ─ AGENTS.md                                                      │
│ ─ Claude Code skills                                             │
│ ─ Zod schemas with .describe() docstrings                        │
│ ─ Storybook component examples                                   │
│ ─ Golden report fixtures                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Report source                                                    │
│ ─ report.config.ts                                               │
│ ─ content/ structured section modules                            │
│ ─ kg/ entities and relationships                                 │
│ ─ synthesis/ synthesis nodes                                     │
│ ─ sources/ source references                                     │
│ ─ custom/ optional custom React components                        │
│ ─ assets/ local images, diagrams, bundled report assets           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Engine                                                           │
│ ─ Schema validation                                              │
│ ─ Reference validation                                           │
│ ─ InlineProse entity-reference validation                         │
│ ─ Astro static rendering                                          │
│ ─ React islands for reader shell and graph interactions           │
│ ─ Shiki build-time code highlighting                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Output: reports/<name>/dist/                                     │
│ Self-contained static report; no backend or runtime network deps  │
└─────────────────────────────────────────────────────────────────┘
```

## 4. Tech Stack

| Concern | Choice |
| --- | --- |
| Framework | **Astro** with React islands |
| UI library | **React** |
| Language | **TypeScript** throughout |
| Styling | **Tailwind CSS** as a constrained facade over CSS-variable design tokens |
| Class composition | **clsx** + **tailwind-merge** via `cn()` |
| Component variants | **class-variance-authority** (`cva`) |
| Accessibility primitives | **Radix UI** where appropriate: popovers, tabs, dialogs, dropdowns, tooltips |
| Schemas | **Zod** |
| Component docs | **Storybook** |
| Graph visualization | **React Flow** with Trellis-styled custom nodes and edges |
| Charts | **Recharts** for standard charts; **D3** only for bespoke custom components |
| Diagrams | **Mermaid** for flow/sequence diagrams; custom components when justified |
| Code highlighting | **Shiki** at build time |
| MDX | Astro MDX as an escape hatch, not the default block authoring surface |
| Package manager | **pnpm** workspaces |
| Agent skills | **Claude Code skill format** (`SKILL.md` with YAML frontmatter) |

## 5. Repository Layout

```text
trellis/
├── packages/
│   ├── engine/
│   │   ├── src/
│   │   │   ├── design-tokens/          # token source, CSS vars, Tailwind theme bridge
│   │   │   ├── components/
│   │   │   │   ├── shell/              # AppShell, TopBar
│   │   │   │   ├── chrome/             # NavPanel, RightRail, mode switchers
│   │   │   │   ├── primitives/         # Card, BentoCard, Eyebrow, Dot, Button, Tabs
│   │   │   │   ├── inline/             # InlineProse, EntityRef, EntityHoverCard
│   │   │   │   ├── blocks/             # guided content blocks
│   │   │   │   ├── views/              # Orientation, Guided, Reference, Synthesis, Graph
│   │   │   │   ├── synthesis/          # synthesis-specific components
│   │   │   │   ├── reference/          # glossary/entity/source components
│   │   │   │   ├── graph/              # React Flow wrappers, nodes, edges, graph toolbar
│   │   │   │   ├── codebase/           # codebase-specific components
│   │   │   │   └── viz/                # chart/diagram wrappers
│   │   │   ├── schemas/                # Zod schemas
│   │   │   ├── validation/             # schema + reference validation
│   │   │   ├── kg/                     # entity resolver, graph layout helpers
│   │   │   ├── report-runtime/         # report loading, providers, URL/localStorage state
│   │   │   ├── build/                  # build scripts
│   │   │   └── utils/                  # cn(), ids, traversal helpers
│   │   └── package.json
│   └── astro-app/                      # Astro app that consumes a selected report
├── storybook/                          # component catalog
├── reports/
│   ├── _template-tutorial/
│   ├── _template-codebase/
│   ├── _template-feature/
│   ├── _template-comparison/
│   ├── _template-custom/
│   └── postgres-mvcc/                  # first golden topic report
│       ├── report.config.ts
│       ├── content/
│       ├── kg/
│       ├── synthesis/
│       ├── sources/
│       ├── custom/
│       ├── assets/
│       └── dist/                       # build output, gitignored
├── .claude/
│   └── skills/
├── spec/
│   ├── REQUIREMENTS.md
│   └── DESIGN.md
├── AGENTS.md
├── README.md
└── pnpm-workspace.yaml
```

Each report is built independently and consumes the shared engine through workspace packages.

## 6. Engine Deliverable

The engine provides the mechanical surface for report production:

- Trellis design tokens.
- Tailwind configuration and semantic utilities.
- React component library.
- Zod schemas and TypeScript types.
- Validation CLI.
- Astro build/dev integration.
- Storybook component catalog.
- React Flow graph runtime.
- Report shell runtime: mode state, navigation helpers, localStorage, and URL state.

The engine should make common report authoring boring and safe. Agents should mostly choose components and fill content slots.

## 7. Agent Instruction Layer

The instruction layer lives in `.claude/skills/`. V1 skills:

| Skill | Covers |
| --- | --- |
| `report-composition` | Choosing templates, planning sections, orientation, recommended path, synthesis, KG scope |
| `component-library-usage` | Which Trellis components to use and when not to use them |
| `research-and-analysis` | Source gathering, code tracing, fact/inference separation, evidence discipline |
| `teaching-tone` | Clear, calm, precise explanatory voice |
| `teaching-order` | Foundations before mechanisms, examples before abstractions, progressive detail |
| `synthesis` | Common structure, contrast, takeaways, open questions, references |
| `entity-modeling` | Entity selection, definitions, aliases, primary sections, relationship types |
| `visualization-guidelines` | Choosing graphs, charts, timelines, diagrams, comparisons, or no visualization |

`AGENTS.md` should orient agents to the source-of-truth hierarchy, commands, schema locations, Storybook, and golden reports.

## 8. Design System

### 8.1 Visual Direction

The V1 visual direction is selected: **Trellis Technical Atlas**.

Keywords: warm, editorial, technical, calm, navigable, premium but not flashy.

Core visual qualities:

- Linen page background.
- White paper-like surfaces.
- Soft borders and sparse shadows.
- Deep green-black ink.
- Sage for mechanism/system/active states.
- Coral for concepts/entities/next actions.
- Butter for caution/maintenance/asides.
- Serif reading typography.
- Sans UI chrome.
- Mono metadata and IDs.
- Quiet transitions that confirm continuity rather than attract attention.

### 8.2 Token Source of Truth

Token values live in `packages/engine/src/design-tokens/` and export:

- CSS custom properties.
- Tailwind theme values.
- Optional TypeScript token metadata for Storybook and documentation.

Production token names mirror the design-system handoff:

```css
--color-bg
--color-surface
--color-surface-2
--color-surface-3
--color-ink
--color-ink-2
--color-ink-3
--color-ink-4
--color-border-soft
--color-border
--color-border-hi
--color-accent-sage
--color-accent-sage-ink
--color-accent-sage-soft
--color-accent-sage-bg
--color-accent-coral
--color-accent-coral-ink
--color-accent-coral-soft
--color-accent-coral-bg
--color-accent-butter
--color-accent-butter-ink
--color-accent-butter-bg
--font-sans
--font-serif
--font-mono
--radius-xs
--radius-sm
--radius-md
--radius-lg
--radius-xl
--radius-2xl
--radius-3xl
--radius-pill
--shadow-sm
--shadow-pop
--motion-fast
--motion-med
--motion-slow
--ease-out
```

Add layout tokens so repeated prototype constants are named:

```css
--layout-topbar-height: 60px;
--layout-nav-width: 296px;
--layout-right-rail-width: 280px;
--layout-reading-width: 720px;
--layout-page-max: 1320px;
```

### 8.3 Tailwind Policy

Tailwind is a constrained facade over Trellis tokens.

Rules:

- Disable the default color palette.
- Replace the default font-size scale with named type roles.
- Keep the standard spacing scale, plus semantic aliases such as `space-block`, `space-section`, and `gutter-rail`.
- Disable arbitrary values for color, font size, border radius, and shadows.
- Allow layout-specific arbitrary values only inside reviewed engine components, preferably via named CSS variables.
- Do not allow arbitrary styling in report-authored content.
- Use `dark` class token flips for color values; avoid `dark:` variants except where markup structure changes.

### 8.4 Type Roles

Use role-based typography rather than raw sizes:

- `display`
- `h1`
- `h2`
- `h3`
- `lead`
- `body`
- `body-sans`
- `label`
- `caption`
- `eyebrow`
- `mono`
- `code`

Each role bundles family, size, line height, weight, and tracking.

### 8.5 Helper Libraries

- `cn()` wraps `clsx` and `tailwind-merge`.
- `cva()` encodes component variants.
- Radix primitives provide accessible behavior for popovers, tabs, dialogs, dropdowns, and tooltips where appropriate.
- React Flow provides graph canvas behavior; Trellis wraps it with tokenized nodes, edges, controls, and layout state.

## 9. Component Library

Every exported component needs:

- Named export.
- TypeScript props.
- Storybook story with realistic report content.
- Variant coverage where applicable.
- Usage notes: when to use and when not to use.
- Token-only styling.
- Accessibility behavior documented.

### 9.1 Shell and Chrome

`AppShell`

- Owns mode, section, entity focus, synthesis focus, graph mode, graph focus, and navigation helpers.
- Coordinates `TopBar`, `NavPanel`, active view, and optional `RightRail`.
- Persists minimal reader state.
- Optionally syncs important state to the URL.

`TopBar`

- Sticky global header.
- Shows Trellis mark, report id, mode switcher, and reserved search/command chip.
- Search/command chip is non-functional in V1 unless global search is later promoted.

`NavPanel`

- Persistent left navigation column.
- Replaces standalone Map mode.
- Sections tab shows section tree and subsection anchors.
- Synthesis tab shows flattened synthesis tree.
- Jump block links to Orientation, Reference, Synthesis, and Graph.
- Highlights current section/subsection in Guided mode.

`RightRail`

- Guided-only context rail.
- Shows neighborhood graph affordance, related entities, and sources.
- Uses graph callbacks to open Graph mode in Spotlight.

### 9.2 Primitives

- `Card`
- `BentoCard`
- `Eyebrow`
- `Dot`
- `InlineTag`
- `Button`
- `SegmentedControl`
- `Tabs`
- `ModeSwitcher`

`Card` should not own grid behavior. `BentoCard` composes `Card` and adds orientation-grid span/tall props.

### 9.3 Inline Components

`InlineProse`

- Parses Trellis inline prose strings.
- Supports entity refs, emphasis, and inline code.
- Does not support arbitrary HTML.
- Should be safe, predictable, and easy to validate.

`EntityRef`

- Inline entity mention.
- Opens hover card on hover/focus.
- Click opens the entity in Reference mode.
- Hover card includes short definition, type badge, primary section cue, “open” action, and “graph” action.

`EntityHoverCard`

- Use Radix Popover or HoverCard behavior rather than hand-rolled portals.
- Must support keyboard/focus behavior.

### 9.4 Guided Blocks

Core V1 blocks from the prototype:

- `ConceptIntro`
- `MentalModel`
- `Callout`
- `StepByStep`
- `KeyTakeaways`
- `CommonMisconception`
- `BeforeYouContinue`
- `BlockHeading`
- `ProseBlock`

Extended blocks may include:

- `CodeBlock`
- `Figure`
- `ComparisonTable`
- `Definition`
- `CodeReference`
- `FileReferenceCard`
- `SymbolCard`
- `CustomBlock`

The first implementation slice should prioritize the prototype’s nine core blocks.

### 9.5 Views

`OrientationView`

- Entry experience.
- Bento composition.
- Shows report hero, what you’ll learn, modes, recommended path, synthesis preview, key entities, and jump targets.

`GuidedView`

- Renders one section at a time.
- Handles block anchors.
- Smooth-scrolls to requested anchors.
- Uses IntersectionObserver to report current visible subsection.
- Includes section pagination.
- Hosts `RightRail`.

`ReferenceView`

- Glossary/entity/source lookup surface.
- Supports focused entity detail.
- Can open primary section and graph spotlight.

`SynthesisView`

- Focused synthesis-node experience.
- Shows breadcrumbs, parent/child context, common structure, contrast, takeaways, open questions, and references.

`GraphView`

- React Flow implementation of knowledge graph modes.
- Supports Atlas, Spotlight, and Regions.
- Integrates with Reference and Guided navigation.

## 10. Reader Shell State

State owned by `AppShell`:

| Key | Type | Persisted | Purpose |
| --- | --- | --- | --- |
| `mode` | `"orientation" | "guided" | "reference" | "synthesis" | "graph"` | yes | Active top-level mode |
| `sectionId` | `string` | yes | Current guided section |
| `scrollTarget` | `string | null` | no | Anchor requested by nav; consumed by `GuidedView` |
| `currentSubId` | `string | null` | no | Most visible guided anchor |
| `focusEntityId` | `string | null` | optional | Focused entity in Reference |
| `synthesisFocusId` | `string | null` | optional | Focused synthesis node |
| `graphMode` | `"atlas" | "spotlight" | "regions"` | yes | Active graph layout mode |
| `graphFocusId` | `string | null` | optional | Focused graph entity |
| `navTick` | `number` | no | Forces same-anchor scroll to re-fire |

Navigation helpers:

```ts
openSection(id: string, anchorId?: string): void;
openEntity(id: string): void;
openSynthesis(id?: string): void;
openGraph(entityId?: string, requestedMode?: GraphMode): void;
setMode(mode: ReaderMode): void;
```

Default behavior:

- Opening a section switches to Guided mode.
- Opening an entity switches to Reference mode.
- Opening graph from an entity defaults to Spotlight unless an explicit graph mode is requested.
- Opening Graph from the mode switcher defaults to Atlas.

Keyboard shortcuts are polish, not first-slice blockers:

- `O` → Orientation
- `G` → Guided
- `R` → Reference
- `S` → Synthesis
- `K` → Graph
- `[` / `H` → previous section in Guided
- `]` / `L` → next section in Guided
- `Cmd/Ctrl+K` reserved for future command palette/search

## 11. Routing and URL State

Trellis should support deep links without abandoning the app-shell model.

Preferred approach for V1: a static app shell with hash-based or search-param state:

```text
#/orientation
#/guided/foundations
#/guided/foundations/found-update
#/reference/snapshot
#/synthesis/syn-visibility
#/graph/atlas
#/graph/spotlight/snapshot
#/graph/regions
```

The exact URL format remains an implementation detail, but the requirements are:

- Report opens locally as static output.
- Reload preserves meaningful mode/location.
- Links can target a section, anchor, entity, synthesis node, or graph focus.
- LocalStorage can restore last position when no URL state is provided.

## 12. Data Model

Schemas live in `packages/engine/src/schemas/`. Every field should have `.describe()` text explaining purpose, expected style, and common mistakes.

The production schema uses `kind` as the discriminant for blocks and sources, matching the prototype/handoff convention. Field names may be slightly more explicit than the prototype fixture where helpful, for example `relatedEntityIds` instead of `relatedEntities`.

### 12.1 Report Config

```ts
export const ReportConfigSchema = z.object({
  id: z.string().describe("Stable report id used for storage keys, output paths, and URL state."),
  title: z.string(),
  subtitle: z.string().optional(),
  audience: z.string().optional(),
  readTime: z.string().optional(),
  builtAt: z.string().datetime().optional(),
  template: z.enum(["tutorial", "codebase", "feature", "comparison", "custom"]),
  authors: z.array(AuthorSchema).default([{ name: "Claude", role: "Authored by" }]),

  orientation: OrientationSchema,
  sections: z.array(SectionSchema),
  synthesis: SynthesisRootSchema.optional(),
  kg: KnowledgeGraphSchema.optional(),
  sources: z.array(SourceReferenceSchema).default([]),
  customComponents: z.array(CustomManifestSchema).default([]),
});
```

### 12.2 Orientation

```ts
export const OrientationSchema = z.object({
  heroSummary: z.string(),
  whatYoullLearn: z.array(z.string()).default([]),
  recommendedPath: z.array(z.string()).default([]), // section ids
  keyEntityIds: z.array(z.string()).default([]),
  jumpTargets: z.array(z.object({
    label: z.string(),
    mode: z.enum(["orientation", "guided", "reference", "synthesis", "graph"]),
    targetId: z.string().optional(),
  })).default([]),
});
```

### 12.3 Sections and Outline Nodes

Top-level sections are the main guided reading units. `children` are outline/anchor nodes for the NavPanel, not full nested routed sections.

```ts
export const SectionKindSchema = z.enum([
  "Concept",
  "Mechanism",
  "Maintenance",
  "Contract",
  "Advanced",
  "Custom",
]);

export const OutlineNodeSchema: z.ZodType<OutlineNode> = z.object({
  id: z.string(),              // should correspond to a block anchorId in this section
  title: z.string(),
  children: z.array(z.lazy(() => OutlineNodeSchema)).default([]),
});

export const SectionSchema = z.object({
  id: z.string(),
  n: z.string().optional(),    // display number, e.g. "01"
  title: z.string(),
  kind: SectionKindSchema.default("Concept"),
  blurb: z.string().optional(),
  summary: z.string().optional(),
  time: z.string().optional(),
  blocks: z.array(BlockSchema).default([]),
  children: z.array(OutlineNodeSchema).default([]),
  relatedSectionIds: z.array(z.string()).default([]),
  relatedEntityIds: z.array(z.string()).default([]),
  sourceRefIds: z.array(z.string()).default([]),
});
```

### 12.4 Blocks

Core block union:

```ts
export const InlineProseStringSchema = z.string().describe(
  "Trellis inline prose. Supports <e id=\"...\">...</e>, <em>...</em>, and <code>...</code>. Not Markdown."
);

export const BlockSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("conceptIntro"),
    anchorId: z.string().optional(),
    title: z.string(),
    body: InlineProseStringSchema,
  }),
  z.object({
    kind: z.literal("mentalModel"),
    anchorId: z.string().optional(),
    title: z.string(),
    body: InlineProseStringSchema,
    aside: InlineProseStringSchema.optional(),
  }),
  z.object({
    kind: z.literal("callout"),
    anchorId: z.string().optional(),
    tone: z.enum(["info", "warn", "aside", "quote"]).default("info"),
    title: z.string(),
    body: InlineProseStringSchema,
  }),
  z.object({
    kind: z.literal("stepByStep"),
    anchorId: z.string().optional(),
    title: z.string(),
    steps: z.array(z.object({
      title: z.string(),
      body: InlineProseStringSchema,
    })),
  }),
  z.object({
    kind: z.literal("keyTakeaways"),
    anchorId: z.string().optional(),
    items: z.array(InlineProseStringSchema),
  }),
  z.object({
    kind: z.literal("misconception"),
    anchorId: z.string().optional(),
    claim: InlineProseStringSchema,
    truth: InlineProseStringSchema,
  }),
  z.object({
    kind: z.literal("beforeContinue"),
    anchorId: z.string().optional(),
    body: InlineProseStringSchema,
    nextSectionId: z.string(),
  }),
  z.object({
    kind: z.literal("heading"),
    anchorId: z.string().optional(),
    level: z.union([z.literal(2), z.literal(3)]),
    text: z.string(),
  }),
  z.object({
    kind: z.literal("prose"),
    anchorId: z.string().optional(),
    body: InlineProseStringSchema,
  }),

  // Extended/content blocks, added as needed for templates and golden reports.
  z.object({
    kind: z.literal("codeBlock"),
    anchorId: z.string().optional(),
    language: z.string(),
    code: z.string(),
    title: z.string().optional(),
    sourceRefId: z.string().optional(),
  }),
  z.object({
    kind: z.literal("figure"),
    anchorId: z.string().optional(),
    src: z.string(),
    alt: z.string(),
    caption: InlineProseStringSchema.optional(),
    sourceRefId: z.string().optional(),
  }),
  z.object({
    kind: z.literal("comparisonTable"),
    anchorId: z.string().optional(),
    title: z.string().optional(),
    columns: z.array(z.string()),
    rows: z.array(z.array(InlineProseStringSchema)),
  }),
  z.object({
    kind: z.literal("custom"),
    anchorId: z.string().optional(),
    componentName: z.string(),
    props: z.record(z.unknown()).default({}),
  }),
]);
```

### 12.5 Synthesis

```ts
export const ReferenceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("section"), id: z.string(), anchorId: z.string().optional() }),
  z.object({ kind: z.literal("entity"), id: z.string() }),
  z.object({ kind: z.literal("source"), id: z.string() }),
]);

export const SynthesisNodeSchema: z.ZodType<SynthesisNode> = z.object({
  id: z.string(),
  level: z.number().int().min(0),
  title: z.string(),
  summary: z.string(),
  detail: InlineProseStringSchema.optional(),
  commonStructure: z.string().optional(),
  contrast: z.string().optional(),
  keyTakeaways: z.array(z.string()).default([]),
  openQuestions: z.array(z.string()).default([]),
  references: z.array(ReferenceSchema).default([]),
  children: z.array(z.lazy(() => SynthesisNodeSchema)).default([]),
});

export const SynthesisRootSchema = z.object({
  description: z.string().optional(),
  roots: z.array(SynthesisNodeSchema),
});
```

### 12.6 Knowledge Graph

```ts
export const EntityTypeSchema = z.enum([
  "concept",
  "pattern",
  "feature",
  "file",
  "module",
  "function",
  "type",
  "component",
  "library",
  "paper",
  "person",
  "api",
  "workflow",
  "other",
]);

export const EntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  aliases: z.array(z.string()).default([]),
  type: EntityTypeSchema,
  shortDef: z.string(),
  description: InlineProseStringSchema.optional(),
  references: z.array(ReferenceSchema).default([]),
  primarySectionId: z.string().optional(),
});

export const RelationshipSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  type: z.string(),
  label: z.string().optional(),
  strength: z.enum(["weak", "medium", "strong"]).default("medium"),
  description: z.string().optional(),
  sourceRefIds: z.array(z.string()).default([]),
});

export const KnowledgeGraphSchema = z.object({
  entities: z.array(EntitySchema).default([]),
  relationships: z.array(RelationshipSchema).default([]),
});
```

### 12.7 Sources

```ts
export const SourceReferenceSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("url"),
    id: z.string(),
    title: z.string(),
    href: z.string().url(),
    host: z.string().optional(),
    accessed: z.string().datetime().optional(),
  }),
  z.object({
    kind: z.literal("code"),
    id: z.string(),
    title: z.string(),
    path: z.string(),
    lineRange: z.tuple([z.number().int().positive(), z.number().int().positive()]).optional(),
    commit: z.string().optional(),
    excerpt: z.string().optional(),
  }),
  z.object({
    kind: z.literal("doc"),
    id: z.string(),
    title: z.string(),
    host: z.string().optional(),
    locationHint: z.string().optional(),
  }),
  z.object({
    kind: z.literal("passage"),
    id: z.string(),
    title: z.string().optional(),
    documentSourceId: z.string(),
    location: z.string(),
    excerpt: z.string().optional(),
  }),
]);
```

### 12.8 Custom Components

```ts
export const CustomManifestSchema = z.object({
  name: z.string(),
  purpose: z.string(),
  justification: z.string(),
  usedIn: z.array(z.string()), // section ids, anchor ids, or block ids when available
});
```

## 13. Validation

Validation runs before build and should be usable by agents.

### 13.1 Hard Failures

Fail on:

- Invalid schema parse.
- Duplicate IDs within namespaces: sections, anchors within a section, entities, relationships, sources, synthesis nodes, custom components.
- `orientation.recommendedPath` section ID missing.
- `orientation.keyEntityIds` entity ID missing.
- Section `relatedSectionIds` missing.
- Section `relatedEntityIds` missing.
- Section `sourceRefIds` missing.
- Outline child ID with no matching block `anchorId` in the same section.
- `beforeContinue.nextSectionId` missing.
- InlineProse `<e id="...">` missing entity.
- Entity `primarySectionId` missing.
- Relationship `from` / `to` missing entity.
- Relationship `sourceRefIds` missing source.
- Synthesis references missing target.
- Source passage `documentSourceId` missing source.
- Custom block missing matching file or manifest entry.

### 13.2 Warnings

Warn on:

- Source defined but unused.
- Entity defined but not referenced anywhere.
- Section has no blocks and is not intentionally a stub.
- Overly long hover-card definitions.
- Too many related entities in a section/right rail.
- Graph too dense for Atlas without meaningful relationship strengths.

### 13.3 Error Shape

Validation errors should include:

- Report id.
- File path when known.
- Section id when relevant.
- Block index and/or anchor id when relevant.
- Missing id.
- Expected namespace.
- Suggested fix.

Example:

```text
reports/postgres-mvcc/content/foundations.ts
Section "foundations", block[3], InlineProse entity ref "snapshop" does not resolve.
Did you mean "snapshot"?
```

## 14. Graph Implementation with React Flow

### 14.1 Design Intent

Production graph views should keep the prototype’s information architecture:

- **Atlas:** overview of the full report graph.
- **Spotlight:** BFS-style neighborhood around one entity.
- **Regions:** graph grouped by section or section kind.

The production renderer is React Flow. The prototype SVG graph is a behavioral reference, not the implementation target.

### 14.2 Package Location

```text
packages/engine/src/components/graph/
├── GraphView.tsx
├── GraphCanvas.tsx
├── GraphToolbar.tsx
├── GraphModeSwitcher.tsx
├── nodes/
│   ├── EntityNode.tsx
│   └── RegionNode.tsx
├── edges/
│   └── RelationshipEdge.tsx
├── MiniGraph.tsx
├── SectionHeaderGraph.tsx
└── graphStyles.ts

packages/engine/src/kg/
├── graph-data.ts           # converts report kg to React Flow nodes/edges
├── layout.ts               # deterministic layout helpers
├── filters.ts              # type/search/strength filtering
├── traversal.ts            # neighbor/BFS helpers
└── colors.ts               # entity/section kind token mapping
```

### 14.3 React Flow Data Mapping

Report entities map to React Flow nodes:

```ts
type EntityFlowNode = Node<{
  entity: Entity;
  degree: number;
  selected: boolean;
  dimmed: boolean;
  sectionIds: string[];
}, "entity">;
```

Relationships map to React Flow edges:

```ts
type RelationshipFlowEdge = Edge<{
  relationship: Relationship;
  strength: "weak" | "medium" | "strong";
  label?: string;
  dimmed: boolean;
}, "relationship">;
```

Node and edge styling must use Trellis tokens, not raw colors.

### 14.4 Graph Modes

`Atlas`

- Shows all visible entities and relationships.
- Supports search, type filters, and minimum strength filter.
- Uses deterministic layout.
- Hover/focus highlights neighbors and dims unrelated nodes.
- Click entity sets graph focus.
- Actions can open Reference or Guided.

`Spotlight`

- Centers on a focused entity.
- Shows one to three hops depending on control state.
- Uses ring or radial layout around the focus entity.
- Maintains local breadcrumb/trail of focused entities if useful.
- Best entry point from `EntityRef` and right-rail graph affordances.

`Regions`

- Groups nodes by primary section or section kind.
- Allows the reader to understand where entities live in the report structure.
- Can use parent/region nodes or grouped layout metadata in React Flow.
- Cross-region relationships should be visible but subdued.

### 14.5 MiniGraph and SectionHeaderGraph

`MiniGraph` and `SectionHeaderGraph` should be implemented as lightweight React Flow-backed graph components when they are interactive. They may use reduced controls and a fixed viewport, but they should share graph data conversion, token styling, and layout helpers with `GraphView`.

Static SVG is acceptable only for decorative icons or non-graph glyphs.

### 14.6 React Flow Accessibility

React Flow graph surfaces need accessible alternatives:

- Node buttons should have meaningful labels.
- The graph should expose an adjacent list/table summary for screen readers.
- Keyboard focus should be visible.
- Graph controls should be reachable by keyboard.
- Color should not be the only signal for type or strength.

## 15. Knowledge Graph Runtime

`packages/engine/src/kg/` provides:

- Entity lookup by id.
- Relationship lookup by endpoint.
- Related-entity calculation.
- Primary section lookup.
- Graph filters.
- BFS/neighborhood traversal.
- React Flow node/edge conversion.
- Deterministic layout helpers.
- Type and section-kind color mappings.

The graph is per-report and static. There is no runtime graph database.

## 16. Report Templates

Each template should include:

- A starter `report.config.ts`.
- Section/content stubs.
- KG stubs.
- Synthesis stubs where applicable.
- Source-reference stubs.
- Comments that point agents to relevant skills and Storybook stories.

Templates:

- `_template-tutorial`
- `_template-codebase`
- `_template-feature`
- `_template-comparison`
- `_template-custom`

Templates are starting points. The agent may adjust section count, graph density, synthesis depth, and block choice based on the actual report.

## 17. Authoring Workflow

1. **Scaffold.** `pnpm scaffold-report <name> --template <template>`.
2. **Research.** Agent gathers sources and code evidence outside the report output surface.
3. **Plan.** Agent drafts orientation, sections, anchors, KG scope, synthesis scope, and source inventory.
4. **Author.** Agent fills structured content blocks, entities, relationships, synthesis nodes, and sources.
5. **Customize only when justified.** Agent adds custom components and manifest entries when standard components are insufficient.
6. **Validate.** `pnpm validate <name>`.
7. **Build.** `pnpm build <name>`.
8. **Review.** User reads through the generated report via `pnpm dev <name>` or static output.

The agent runs validation and build directly; the user is not responsible for manually fixing schema errors.

## 18. Build and Output

- Dev server: `pnpm dev <report>`.
- Validate: `pnpm validate <report>`.
- Build: `pnpm build <report>`.
- Output: `reports/<name>/dist/`.

Output rules:

- Static files only.
- No backend.
- No CDN scripts.
- No CDN fonts.
- Fonts either bundled locally or replaced with acceptable system fallbacks.
- Shiki highlighting performed at build time.
- Assets copied or inlined from the report directory.

## 19. Reader State

Use localStorage with keys scoped by report id.

Persist:

- `mode`
- `sectionId`
- `graphMode`
- NavPanel expansion state if needed
- Expand/collapse state for content/synthesis nodes if implemented

Do not persist in V1:

- Notes
- Highlights
- Bookmarks
- Seen/unseen status
- Cross-device state

URL state should override localStorage when present.

## 20. Customization Mechanism

Custom block shape:

```ts
{
  kind: "custom",
  componentName: "MVCCTimeline",
  props: { /* schema-free; agent responsibility */ },
  anchorId: "optional-anchor"
}
```

Rules:

- File `reports/<name>/custom/<componentName>.tsx` must exist.
- Manifest entry must exist in `customComponents`.
- Custom component should import from engine packages and standard libraries.
- Additional UI libraries are discouraged and should be justified.
- Lint enforcement of allowed imports is V1.x.

## 21. Milestones

Each milestone should produce something runnable.

### M1 — Foundations

- pnpm workspace scaffold.
- Engine package scaffold.
- Astro app scaffold.
- Tokens and CSS variables.
- Tailwind config with constrained palette/type roles.
- `cn()` and `cva()` helpers.
- Storybook scaffold.
- Primitives: `Card`, `BentoCard`, `Eyebrow`, `Dot`, `InlineTag`, `Button`, `SegmentedControl`.

### M2 — Guided Reader

- Schemas for report config, sections, outline nodes, core blocks, entities, relationships, sources.
- Validation for basic schema, duplicates, section references, anchors, and InlineProse entity refs.
- `InlineProse`.
- `EntityRef` basic behavior.
- Nine prototype-guided block components.
- `AppShell`, `TopBar`, `NavPanel` sections tab.
- `GuidedView` with anchors and current-subsection tracking.
- `SectionPagination`.
- Postgres MVCC report fixture rendered end to end.

### M3 — Reference and Entity Layer

- `ReferenceView`.
- `EntityDetailPanel`.
- `EntityHoverCard` using accessible primitive behavior.
- Source inventory surface.
- Related entities and related sections.
- Full entity/source reference validation.

### M4 — React Flow Graph

- React Flow dependency and engine wrappers.
- KG-to-React-Flow node/edge conversion.
- `EntityNode` and `RelationshipEdge`.
- `GraphToolbar` with search/type/strength filters.
- `GraphView` Atlas mode.
- Spotlight mode.
- Regions mode.
- `MiniGraph` and `SectionHeaderGraph` as React Flow-backed graph components.
- RightRail graph affordances.

### M5 — Synthesis

- Synthesis schema.
- Synthesis validation.
- `SynthesisView`.
- Synthesis NavPanel tab.
- Breadcrumbs, sibling/child navigation, reference list.
- Synthesis node quality guidance in skills.

### M6 — Orientation, Templates, Skills, Polish

- `OrientationView` bento composition.
- Remaining templates.
- Claude Code skills.
- AGENTS.md.
- Keyboard shortcuts.
- URL state/deep links.
- Accessibility pass.
- Storybook coverage pass.
- Second golden report: codebase architecture.

## 22. Open Decisions

No major visual/product decisions remain open from the previous prototype phase. Remaining decisions are implementation details:

1. Exact URL/hash state format.
2. Exact React Flow layout algorithms for Atlas, Spotlight, and Regions.
3. Whether `MiniGraph` uses a heavily simplified React Flow instance or a shared read-only graph wrapper.
4. Minimum codebase-specific component set needed for the first codebase golden report.
5. Engine versioning policy once generated reports depend on older schemas.

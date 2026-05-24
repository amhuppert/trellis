# Requirements: Trellis — Agent-Authored Interactive Reports

> Updated to reflect decisions from the Claude Design handoff and Modular Bento prototype. **Production graph visualization uses React Flow**, even where the prototype used hand-authored SVG.

## 1. Overview

**Trellis** is a personal toolkit for producing beautiful, interactive HTML reports with coding agents such as Claude Code and Codex. Instead of asking an agent to design and implement a bespoke report each time, Trellis gives the agent a reusable engine: design tokens, React components, structured schemas, validation, an Astro build pipeline, Storybook examples, and agent-facing skills that teach the authoring workflow.

A Trellis report is a navigable knowledge artifact, not a static document. It combines a guided reading path, persistent structure navigation, inline entity references, a glossary/reference surface, hierarchical synthesis, and a knowledge graph. The reader can start with orientation, read linearly, jump through the map-like sidebar, inspect entities, explore synthesis nodes, or move through the graph.

## 2. Prototype Decisions Now Adopted

The Claude Design handoff and Modular Bento prototype resolve several earlier open questions. These are now V1 decisions:

- **Project name:** use **Trellis** as the working product name.
- **Visual direction:** use the Trellis warm editorial technical-atlas direction: linen background, white paper surfaces, deep ink, sage/coral/butter accents, serif reading typography, sans UI chrome, and mono metadata/code.
- **App structure:** use a single reader shell with a sticky `TopBar`, persistent left `NavPanel`, optional guided-only `RightRail`, and a main view area.
- **Reader modes:** use five top-level modes: **Orientation**, **Guided**, **Reference**, **Synthesis**, and **Graph**.
- **No standalone Map mode:** the persistent `NavPanel` is the map. It exposes sections, subsections, synthesis navigation, and quick jumps.
- **No standalone Deep Dive mode:** deep-dive behavior is represented by focused entity/reference states and graph spotlight states.
- **Content model:** prefer structured block data and `InlineProse` strings over free-form MDX for core authored content.
- **Graph behavior:** preserve the prototype’s Atlas / Spotlight / Regions graph concepts, but implement production graph visualization with **React Flow**.
- **V1 delivery:** implement in staged milestones. The first useful slice is the reading shell and guided report path; reference, graph, synthesis, and orientation polish follow.

## 3. Goals

- **Reduce agent effort per report.** Producing a polished report should be a matter of filling structured slots and using shared components, not designing from scratch.
- **Enforce a coherent visual identity.** Reports should feel like Trellis artifacts without restating design preferences every run.
- **Support non-linear consumption.** The reader can read straight through, jump around, inspect entities, explore synthesis, and return to context easily.
- **Encode explanatory pedagogy.** Components and skills encourage basics-first explanation, concrete examples, synthesis above detail, and progressive disclosure.
- **Make knowledge structure first-class.** Entities, relationships, sources, sections, anchors, and synthesis nodes are explicit data that power navigation and validation.
- **Give the agent an escape hatch.** Custom React/TSX is allowed when standard components cannot express the needed visualization or interaction.
- **Make authoring teachable.** Authoring guidance lives in Claude Code skills and schema descriptions, not in an ever-growing manual.

## 4. Non-Goals

- Not a multi-user product. No accounts, collaboration, permissions, or auth.
- Not a CMS. Trellis is optimized for agent-authored, per-report artifacts, not large hand-authored content operations.
- Not a public general-purpose design system. It is an opinionated single-user system.
- Not a runtime knowledge graph database. The graph is per-report and embedded; no cross-report entity registry in V1.
- Not SEO-focused.
- Not accessibility-certified, though production components should follow good accessibility practice and use accessible primitives where appropriate.
- Not mobile-first in V1. Desktop/tablet reading is the primary target; mobile support can be improved later.

## 5. Users and Use Cases

**Primary reader:** the repo owner.

**Primary author:** a coding agent, usually Claude Code, acting on user prompts.

### 5.1 Learning a technical topic

Example: “Teach me how Postgres MVCC works.” The agent researches the topic, authors a tutorial-style report, introduces foundations before mechanisms, and links concepts through entities and graph relationships.

### 5.2 Understanding a codebase area

Example: “Produce a report on how the auth subsystem works in this repo.” The agent traces code paths, identifies modules/functions/types/components, writes source references, and creates a codebase-oriented knowledge graph.

### 5.3 Feature walkthroughs

Example: “Explain the checkout flow end-to-end.” The report covers user-facing behavior, frontend flow, backend/API flow, data model, state transitions, error cases, and extension points.

### 5.4 Comparison and decision support

Example: “Compare TanStack Router and React Router for this app.” The report defines evaluation criteria, includes a comparison matrix, explains tradeoffs, and makes a recommendation.

### 5.5 Synthesizing research notes

Example: “Turn this folder of articles/transcripts into a navigable synthesis.” The agent turns source material into a structured report with provenance, entities, and synthesis nodes.

## 6. Functional Requirements

### 6.1 Two Parallel Deliverables

Trellis ships two coordinated deliverables:

1. **The engine** — design tokens, component library, schemas, validation, build pipeline, Storybook, graph/runtime helpers.
2. **The agent instruction layer** — Claude Code skills that encode how to compose reports, use components, research topics, teach clearly, model entities, build synthesis, and choose visualizations.

Both are first-class. The engine without the skills leaves too much judgment to each agent run; the skills without the engine make the agent rebuild structure and visual design from scratch.

### 6.2 Authoring Model

The agent produces a report by:

1. Creating or updating a report manifest.
2. Writing structured TypeScript content files that conform to Zod schemas.
3. Writing block bodies as structured data, usually `InlineProse` strings.
4. Defining entities, relationships, synthesis nodes, and source references.
5. Optionally writing report-local custom React/TSX components when standard components are insufficient.
6. Running validation and build commands directly.

Agent scratch notes, draft outlines, and research notes are not part of the built output unless intentionally promoted into structured report content.

### 6.3 InlineProse and Prose Authoring

Core V1 report content uses structured blocks plus `InlineProse`, not arbitrary Markdown.

`InlineProse` supports a small, validated inline dialect:

- `<e id="entity-id">visible text</e>` for entity references.
- `<em>...</em>` for emphasis.
- `<code>...</code>` for inline code.

The build validates that every `<e id="...">` reference resolves to an entity in the report knowledge graph. Full MDX remains an escape hatch for unusual prose-heavy or custom sections, but it is not the default authoring surface for V1.

### 6.4 Design System

Trellis uses the visual direction established by the design handoff:

- Warm linen page background.
- White and near-white paper surfaces.
- Deep green-black ink text.
- Sage accent for mechanisms, active system state, and informational structure.
- Coral accent for concepts, entities, next actions, and primary highlights.
- Butter accent for caution, maintenance, and aside material.
- Source Serif 4 or bundled equivalent for reading prose.
- Manrope or bundled equivalent for UI chrome.
- JetBrains Mono or bundled equivalent for metadata, IDs, entities, and code.

Production output must not depend on Google Fonts, CDN React, CDN Babel, or other network resources. Prototype CDN imports are non-production.

### 6.5 Reader Shell and Modes

Every report renders inside the same reader shell:

- **TopBar** — global header with logo, report id, mode switcher, and a reserved search/command affordance.
- **NavPanel** — persistent left map/navigation panel. Shows section tree, subsection anchors, synthesis navigation, and quick jumps.
- **Main view area** — active mode content.
- **RightRail** — guided-mode-only context column with related entities, sources, and graph affordances.

The five modes are:

1. **Orientation** — entry view that explains what the report covers, what the reader will learn, recommended path, key entities, and jump targets.
2. **Guided** — linear reading view over sections and anchored blocks, with prev/next navigation and current-subsection tracking.
3. **Reference** — entity and source lookup surface: glossary, focused entity detail, related sections, related entities, and source inventory.
4. **Synthesis** — hierarchical synthesis view where parent nodes explain common structure, contrast, takeaways, open questions, and references to children/sections/entities/sources.
5. **Graph** — interactive knowledge graph view implemented with React Flow.

The `NavPanel` replaces a standalone Map mode. Deep-dive experiences happen as focused states inside Reference, Synthesis, and Graph rather than as a separate mode.

### 6.6 Guided Reading

Guided mode renders one section at a time. Each section includes:

- Section title, summary, kind, optional read time, and related entities.
- Optional section-header graph context.
- Structured content blocks.
- Anchored blocks that correspond to subsection rows in `NavPanel`.
- Previous/next section pagination.
- Optional guided-only `RightRail` with neighborhood graph, related entities, and sources.

The current visible anchor should be reported to the shell so `NavPanel` can highlight the current subsection while the reader scrolls.

### 6.7 Component Library

The component library is organized around production components proven by the prototype.

Core shell and chrome:

- `AppShell`
- `TopBar`
- `NavPanel`
- `RightRail`
- `SectionPagination`
- `ModeSwitcher`

Core primitives:

- `Card`
- `BentoCard`
- `Eyebrow`
- `Dot`
- `InlineTag`
- `Button`
- `SegmentedControl`
- `Tabs`

Inline/reference:

- `InlineProse`
- `EntityRef`
- `EntityHoverCard`

Core guided blocks:

- `ConceptIntro`
- `MentalModel`
- `Callout`
- `StepByStep`
- `KeyTakeaways`
- `CommonMisconception`
- `BeforeYouContinue`
- `BlockHeading`
- `ProseBlock`

Views:

- `OrientationView`
- `GuidedView`
- `ReferenceView`
- `SynthesisView`
- `GraphView`

Graph components:

- `GraphView`
- `GraphCanvas`
- `GraphToolbar`
- `GraphModeSwitcher`
- `EntityNode`
- `RelationshipEdge`
- `MiniGraph`
- `SectionHeaderGraph`

Additional generic, codebase, and visualization components can be added when needed by the golden reports and templates.

### 6.8 Knowledge Graph

Each report may define a knowledge graph:

- **Entities** — concepts, patterns, features, files, modules, functions, types, components, libraries, papers, people, APIs, workflows, and other relevant things.
- **Relationships** — typed directed edges with optional label, description, source references, and strength (`weak | medium | strong`).
- **Sources** — enumerable evidence inventory for URLs, code locations, documents, and passages.

The graph powers:

- Inline entity references and hover cards.
- Reference/glossary view.
- Entity detail panels.
- Related-entity affordances in sections and the right rail.
- React Flow graph visualization.

### 6.9 Graph View

The full Graph mode is implemented with **React Flow** in production. The prototype’s graph modes define the desired behavior, not the final rendering technology.

Graph mode supports:

- **Atlas** — whole-report graph overview with filters and search.
- **Spotlight** — focused neighborhood around a selected entity, with hop/ring expansion.
- **Regions** — graph grouped by section or section kind.

Required graph affordances:

- Search entities by name/alias.
- Filter by entity type.
- Filter or threshold by relationship strength.
- Highlight neighbors of hovered/focused nodes.
- Open an entity in Reference mode.
- Open an entity’s primary section in Guided mode.
- Preserve graph mode in reader state; focus is transient.

All interactive graph canvases should use React Flow wrappers styled through Trellis tokens. Static icons and small decorative glyphs may be SVG, but graph visualization itself is React Flow.

### 6.10 Hierarchical Synthesis

Reports may include a synthesis hierarchy independent of the section tree.

A synthesis node should include:

- Title and summary.
- Optional detail.
- Common structure across children.
- Contrast between children.
- Key takeaways.
- Open questions or uncertainty.
- References to sections, anchors, entities, and sources.
- Child synthesis nodes.

Synthesis is not a duplicate outline. It is a higher-level structure that explains how parts fit together.

### 6.11 Report Templates

V1 templates:

- **Topic Tutorial** — orientation, foundations, concepts, mechanisms, examples, synthesis, graph, reference.
- **Codebase Architecture** — orientation, architecture overview, main flows, key modules/components, data model, dependencies, source references, synthesis, graph.
- **Feature Walkthrough** — feature summary, user behavior, frontend flow, backend/API flow, data model, state transitions, edge cases, extension points.
- **Comparison** — decision context, criteria, comparison matrix, deep dives, tradeoffs, recommendation, source references.
- **Custom** — empty starter for unusual reports.

Templates are starting points, not rigid constraints.

### 6.12 Customization

The agent may write custom React/TSX under `reports/<name>/custom/` when standard components cannot express the needed visualization or interaction.

Every custom component must be declared in the manifest with:

- Name.
- Purpose.
- Justification for why standard components were insufficient.
- Where it is used.

In V1, the manifest is the governance mechanism. Lint enforcement of import restrictions is V1.x.

### 6.13 Validation

Validation must fail on:

- Duplicate IDs within a namespace.
- Section references pointing at missing sections.
- Anchor references pointing at missing block anchors.
- Entity references pointing at missing entities.
- Relationship endpoints pointing at missing entities.
- Source references pointing at missing sources.
- InlineProse `<e id="...">` references pointing at missing entities.
- Custom blocks pointing at missing custom component files or missing manifest entries.
- Orientation recommended-path entries pointing at missing sections.

Validation may warn, rather than fail, for unused sources during early implementation.

Errors should be written for agents: precise, actionable, and including file path, section ID, block index, and missing ID where possible.

### 6.14 Build and Output

Commands:

- `pnpm dev <report>` — starts Astro dev server for the selected report.
- `pnpm validate <report>` — runs schemas and reference checks.
- `pnpm build <report>` — emits `reports/<name>/dist/`.
- `pnpm scaffold-report <name> --template <template>` — copies a template and initializes the manifest/content stubs.

Built output must be static and self-contained:

- No backend.
- No analytics.
- No CDN scripts.
- No CDN fonts.
- No network dependencies by default.

Single-file HTML export, PDF export, and full-text report search are out of scope for V1.

## 7. Non-Functional Requirements

- **Consistency:** reports should feel like one product.
- **Authoring efficiency:** agents should spend most tokens on content, not boilerplate.
- **Agent discoverability:** Storybook, schema descriptions, examples, and skills should make correct usage obvious.
- **Reader performance:** reports should open quickly and feel responsive.
- **Static friendliness:** interactivity must work without a backend.
- **Resilience to agent mistakes:** validation catches malformed content and dangling references before build output is trusted.
- **Accessibility baseline:** production components should restore focus rings, use accessible primitives where possible, support keyboard interactions for main controls, and respect reduced-motion preferences.
- **Minimal persistent state:** use localStorage per report for mode, current section, graph mode, and expand/collapse state as needed.

## 8. Constraints

- Personal project; simplicity beats generality.
- Single user; no auth or multi-tenant complexity.
- Astro + React + TypeScript is the committed stack.
- Tailwind is a constrained facade over Trellis tokens, not an open styling palette.
- React Flow is the committed graph visualization implementation.
- Reports must remain static and locally openable.
- The prototype is not production code; it is a behavior, visual, and fixture reference.

## 9. V1 Scope

### 9.1 First Implementation Slice

The first useful slice should ship:

- Repo scaffold with pnpm workspaces.
- Engine package scaffold.
- Astro app scaffold.
- Trellis design tokens and Tailwind config.
- `cn()` and `cva()` helpers.
- Storybook scaffold.
- Core primitives: `Card`, `BentoCard`, `Eyebrow`, `Dot`, `InlineTag`, `Button`, `SegmentedControl`.
- `InlineProse` and `EntityRef` without full graph integration.
- Core guided blocks: `ConceptIntro`, `MentalModel`, `Callout`, `StepByStep`, `KeyTakeaways`, `CommonMisconception`, `BeforeYouContinue`, `BlockHeading`, `ProseBlock`.
- `AppShell`, `TopBar`, `NavPanel` sections tab, `GuidedView`, `SectionPagination`.
- Basic report schema and validation.
- A Postgres MVCC topic tutorial fixture adapted from the prototype.

### 9.2 V1 Complete

V1 complete adds:

- Orientation view with Trellis bento composition.
- Reference view and entity detail panel.
- Entity hover cards using accessible primitives.
- React Flow graph view with Atlas, Spotlight, and Regions modes.
- MiniGraph/SectionHeaderGraph implemented as React Flow-backed graph components.
- Synthesis view and synthesis navigation.
- RightRail with related entities, sources, and graph affordances.
- Full validation for anchors, entity refs, relationships, sources, orientation path, and custom components.
- Topic Tutorial, Codebase Architecture, Feature Walkthrough, Comparison, and Custom templates.
- Claude Code skills.
- Two golden reports: one topic tutorial and one codebase report.

### 9.3 Out of Scope for V1

Good ideas to preserve but not build in V1:

- Full-text search across a report.
- Command palette behavior beyond reserved affordance.
- Highlights, notes, annotations, bookmarks.
- Seen/unseen markers and progress tracking.
- Autolinking entity names in prose.
- Cross-report entity reuse or shared entity registry.
- Multi-report dashboard/library.
- Hosted/shared reports.
- PDF export.
- Single-file HTML export.
- Embedded exercises, quizzes, spaced-repetition cards.
- AI chat over a generated report.
- Source-grounded Q&A over a report.
- Visual regression testing.
- Engine version migration tooling.
- Mobile-first layout.
- Formal accessibility certification.

## 10. Risks

- **Over-engineering.** Mitigation: implement the guided report path first, prove value with one golden report, and add components only when repeated use justifies them.
- **Agent over-customization.** Mitigation: standard components, custom manifest, skills that explicitly prefer standard components.
- **Graph hairball.** Mitigation: React Flow modes, filters, spotlight view, region grouping, and treating the graph as navigation rather than complete truth model.
- **Reports getting too dense.** Mitigation: guided path, right rail, synthesis, progressive disclosure, and clear separation of summary/detail.
- **Skill/schema drift.** Mitigation: schemas remain source of truth; skills cite schemas and Storybook rather than restating everything.
- **Prototype leakage.** Mitigation: production code ports visual output and behavior, not CDN scripts, inline style objects, or prototype globals.

## 11. Remaining Open Questions

The major product and visual decisions are no longer open. Remaining questions are implementation details:

1. **URL state strategy.** Whether the app shell uses hash routes, Astro routes, or a hybrid to support deep links into modes, sections, anchors, entities, graph focus, and synthesis nodes.
2. **React Flow layout strategy.** Exact layout algorithms for Atlas, Spotlight, and Regions modes, and how much custom layout code lives in `packages/engine/kg/`.
3. **Codebase component depth.** Which codebase-specific components are required for the first codebase golden report versus later.
4. **Engine versioning policy.** Defer until breaking changes matter.

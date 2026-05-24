# Requirements: Agent-Authored Interactive Reports

> Working name TBD. Referred to below as **"the system."**

## 1. Overview

The system is a personal toolkit that lets coding agents (Claude Code, Codex, etc.) produce **beautiful, interactive HTML reports** efficiently and consistently. Rather than asking an agent to design and implement a bespoke document each time, the system provides design tokens, a React component library, structured data schemas, an Astro build pipeline, and a set of **Claude Code skills** that teach the agent how to use it all. The agent fills in content; the system enforces consistency and provides the interactive scaffolding.

The reports are not linear documents to read top-to-bottom. They are **navigable knowledge artifacts**: hierarchical, cross-linked, with a built-in map and a knowledge graph, optimized for learning a topic or understanding a codebase.

## 2. Goals

- **Reduce agent effort per report.** Producing a polished report should be a matter of filling structured slots, not designing from scratch.
- **Enforce a coherent visual identity** across reports without re-specifying preferences each time.
- **Support non-linear consumption.** The reader can read straight through, jump around, drill down, or zoom out — and always knows where they are.
- **Encode an explanatory pedagogy.** Material is presented basics-first, with synthesis layered above detail. The component library itself models good teaching moves.
- **Make knowledge structure first-class.** Concepts, components, and their relationships are explicit data, not just prose, so they can power navigation, hover tooltips, a glossary, and a graph view.
- **Give the agent an escape hatch.** When standard components don't fit, the agent can write custom React for a section without breaking the rest of the system.
- **Make the agent's job teachable.** Authoring know-how lives in Claude Code skills that activate when relevant, not in one ever-growing manual.

## 3. Non-Goals

- Not a multi-user product. No accounts, no collaboration, no auth.
- Not a CMS. The system is not for hand-authored content at scale; the agent is the primary author.
- Not a general design system to share publicly. Single-opinion, single-user.
- Not a runtime knowledge graph database. The KG is per-report and embedded; no cross-report entity reuse in V1.
- Not concerned with SEO, accessibility certifications, or formal compliance, beyond the level of good practice that comes for free with a decent component library.

## 4. Users & Use Cases

**Primary user:** me, reading.
**Primary author:** a coding agent (Claude Code, typically) acting on my prompts.

### Use cases

1. **Learning a technical topic** — e.g. "explain how Postgres' MVCC works" or "teach me the WebGPU pipeline." The agent researches and produces a report that introduces fundamentals before drilling into details, with cross-linked concepts and visualizations.
2. **Understanding a codebase area** — e.g. "produce a report on how the auth subsystem works in this repo." The agent reads code, identifies components and relationships, and produces a report whose KG includes real code entities (modules, functions, types) with file references.
3. **Comparison and decision support** — e.g. "compare Tanstack Router vs React Router for this app." Structured tradeoffs, deep dives, and a clear recommendation.
4. **Feature walkthroughs** — e.g. "explain the checkout flow end-to-end." Front-end, back-end, data model, error cases.
5. **Synthesizing research notes** — taking a folder of articles or transcripts and producing a structured, navigable synthesis.

## 5. Functional Requirements

### 5.1 Two Parallel Deliverables

The project produces two coordinated deliverables:

- **The engine** — design tokens, component library, schemas, build pipeline, Storybook. The mechanical surface the agent uses.
- **The agent instruction layer** — a set of Claude Code skills that encode the *judgment* of building a good report (composition, teaching tone, sequencing, synthesis, entity modeling, visualization choice).

Both are first-class. The engine without the skills means inconsistent reports despite good components; the skills without the engine means the agent rebuilds layouts from scratch each time.

### 5.2 Authoring (agent-facing)

- The agent produces a report by:
  1. Writing structured content files (TypeScript modules) that conform to **Zod schemas**.
  2. Optionally writing MDX for prose-heavy sections.
  3. Writing entity and relationship data for the knowledge graph.
  4. Optionally writing custom React/TSX for sections requiring unique treatment.
  5. Wiring everything into a report-level manifest defining structure, the orientation view, and the synthesis hierarchy (where applicable).
- Schema validation runs as part of the build; the agent gets actionable errors when content is malformed.
- A **Storybook** instance documents every component with realistic examples; agents can read it to learn what's available.
- The agent's **working notes** (research scratch, draft synthesis, intermediate outlines) are not part of the shipped report. Only structured content under the report directory is built.
- The agent invokes validation and build commands directly via the shell during authoring; the user is not in the build loop.

### 5.3 Design System

- A defined set of **design tokens**: typography scale, color palette (light + dark), spacing scale, radius, elevation/shadows, motion timings.
- A **component library** in React (rendered by Astro), organized in tiers:
  - **Layout & navigation** — page shell, sidebar, mini-map, content area, breadcrumb.
  - **Generic content blocks** — headings, prose, callouts, definitions, figures, comparison tables, code blocks, diagrams.
  - **Teaching components** — `ConceptIntro`, `MentalModelCard`, `KeyTakeaways`, `Example`, `Analogy`, `CommonMisconception`, `StepByStep`, `CheckUnderstanding`, `BeforeYouContinue`. These encode pedagogical patterns directly.
  - **Codebase-specific components** — `CodeReference`, `FileReference`, `SymbolCard`, `ComponentHierarchy`, `DataFlowView`, `CallPathView`, `DependencyList`. Used when the report touches real code.
  - **Visualization wrappers** — consistent affordances around charts, diagrams, and the KG graph view.
- Visual identity remains **opinionated and singular**. No themes/skins for the reader, but multiple **candidate design visions** are explored during prototyping before a default is chosen (see §10).

### 5.4 Document Structure & Navigation

Every report has:

- An **orientation view** as the entry point: hero summary, "what you'll learn," recommended path, topic-map preview, and a quick-jump to major regions. Designed so a reader who opens the report knows in 30 seconds what it covers and where to start.
- A **content map** — hierarchical structure of sections, always one click away in the sidebar; the reader's current location is always indicated.
- A **mini-map** widget showing position within the broader structure.
- **Four reading modes**, each with discoverable UI affordances:
  - **Guided** — linear path through the recommended reading order, with prev/next.
  - **Map** — outline/tree view of the entire report; click any node to jump.
  - **Reference** — glossary-style index of entities (concepts, code symbols, etc.) for fast lookup.
  - **Deep dive** — focused view on a single entity or section, surfacing its definition, references, neighbors in the KG, and related sections.

Reading modes mostly fall out of the same underlying data; building the KG and section tree gets all four.

### 5.5 Hierarchical Synthesis

Reports optionally include a **synthesis hierarchy** as a separate structure from the section tree:

- **Leaf nodes** correspond to concrete units of understanding (a function, a sub-concept, a paper).
- **Intermediate nodes** synthesize their children — not by concatenating summaries, but by explaining what the children have in common, how they differ, what higher-level pattern emerges, and how the pieces work together.
- **Higher nodes** build further levels of synthesis to whatever depth fits the content.

A good synthesis node:

- Identifies the common structure across its children, not just a union of their content
- States what the reader should take away at this level *before* drilling down
- Points back to the specific child sections, entities, or sources it draws from
- Notes what's contested, uncertain, or remaining open

The synthesis tree is its own navigable view; nodes reference sections and entities but don't duplicate their content.

### 5.6 Knowledge Graph

Each report optionally defines:

- **Entities** — concepts, code components (modules, functions, types, React components), features, libraries, papers, etc. Each has: id, display name, type, short definition, longer description, references (URLs, file paths, section anchors), aliases.
- **Relationships** — typed, directed edges between entities, with optional labels (e.g. "depends on," "is a kind of," "calls," "contradicts") and an optional **strength** (`weak | medium | strong`) that the graph view and filters use.
- **Source references** — first-class, enumerable list of sources (code locations, URLs, documents, passages) with their own IDs that entities, sections, and relationships can point to. The report carries an inventory of its evidentiary basis.

These power:

- A **glossary page** — entities listed alphabetically and by type, each linking to where it's defined and discussed.
- **Hover-card definitions** — inline entity mentions reveal short defs on hover and link to full treatments. Explicit `<EntityRef>` only in V1; no autolinking.
- A **graph view** — interactive visualization with filters by entity type and relationship type, focus-on-node mode, gradual neighborhood expansion. The graph is navigation, not decoration.
- **Related concepts** affordances on entity and section pages.

Build-time validation must fail loudly on dangling references (entity mentioned but not defined, relationship pointing at missing entity, section reference pointing at missing section, source reference unused or undefined).

### 5.7 Report Templates

Reports start from a **template** that supplies a default structure and skill emphasis. V1 templates:

- **Topic Tutorial** — orientation, foundations, core concepts, worked examples, advanced concepts, glossary, optional review prompts.
- **Codebase Architecture** — orientation, architecture map, main flows, key modules/components, data model, dependency graph, code references, synthesis tree, glossary.
- **Feature Walkthrough** — feature summary, user-facing behavior, frontend flow, backend/API flow, data model, state transitions, error cases, extension points.
- **Comparison** — decision context, evaluation criteria, comparison matrix, deep dives, tradeoffs, recommendation.

Templates are starting points, not constraints — the agent adjusts based on the topic. A "custom" template skips the prefilled structure.

### 5.8 Customization

- The agent may write **custom React components** in `reports/<name>/custom/` when standard components don't fit.
- Every custom component must appear in a **customization manifest** in the report config with: name, purpose, why standard components were insufficient, and where it's used.
- The composition skill must direct the agent to prefer standard components and treat custom as a last resort.
- Lint enforcement of allowed imports is V1.x; in V1 the manifest is the governance.

### 5.9 Build & Output

- **Dev:** `pnpm dev <report>` starts a local server with HMR for fast iteration during authoring.
- **Validate:** `pnpm validate <report>` runs schema and reference validation; clear, agent-readable errors.
- **Build:** `pnpm build <report>` produces a self-contained `reports/<name>/dist/` folder that opens locally and can be moved or shared. No CDN fonts, no analytics, no network dependencies by default.
- The output is a folder of static files in V1; single-file HTML export is V1.x.

## 6. Non-Functional Requirements

- **Consistency:** two reports built by different agent runs feel like they came from the same product.
- **Authoring efficiency:** the agent spends the bulk of its tokens on *content*, not boilerplate. The system carries the structural and visual load.
- **Discoverability for the agent:** Storybook stories, schema `.describe()` strings, and the skill modules together let the agent learn what's available without trial and error.
- **Reader performance:** reports open quickly and feel snappy.
- **Resilience to agent mistakes:** schemas and reference checks fail at build time with clear errors.
- **Reader has minimal persistent state:** `localStorage` remembers last visited section and expand/collapse state per report. No highlights, notes, or seen/unseen tracking in V1.

## 7. Constraints

- **Personal project.** Time investment justified only when it noticeably improves my reading and an agent's authoring.
- **Single user.** Implementation choices favor simplicity over generality.
- **Astro + React** is the committed stack. React for components, Astro for static-first builds with islands of interactivity.
- **Static-friendly.** Anything dynamic (graph view, hover cards, mode toggling) must work in a fully static build without a backend.

## 8. V1 Scope

### In scope for V1

- Engine: design tokens, component library (layout + generic content + teaching + codebase tiers + visualizations), schemas, Storybook, validation, static build pipeline.
- Reader experience: orientation view, content map, mini-map, four reading modes, hover cards, graph view, glossary, synthesis tree, minimal reader state (last visited + expand/collapse).
- Knowledge graph: entities, relationships (with strength), source references (first-class), glossary page, graph view, build-time reference validation.
- Customization: `CustomBlock` + report-local `custom/` directory + manifest requirement.
- Agent instruction layer: Claude Code skills (see §5.1 and design doc).
- Report templates: Topic Tutorial, Codebase Architecture, Feature Walkthrough, Comparison.
- Two example "golden path" reports — one topic, one codebase — that future reports imitate.

### Out of scope for V1 (good ideas to preserve)

- Full-text search across a report
- Highlights, notes, annotations, bookmarks
- Seen/unseen section markers, resume-reading dot
- Autolinking entity names in prose
- Cross-report entity reuse / shared entity registry
- Multi-report library/dashboard, hosted/shared reports
- PDF export, single-file HTML export
- Embedded exercises, quizzes, spaced-repetition cards
- AI chat over a generated report, source-grounded Q&A
- Lint enforcement of custom-component imports
- Visual regression testing
- Engine version migration tooling
- Mobile-first layout

## 9. Risks

- **Over-engineering.** Mitigation: start with the smallest useful component set, ship one excellent example report early, add components only when repeated use justifies them.
- **Agent over-customization.** Mitigation: customization manifest, explicit composition skill, prefer-standard rule in the skills.
- **Graph hairball.** Mitigation: filtering, focus mode, treat graph as navigation aid not complete truth model.
- **Reports getting too dense.** Mitigation: progressive disclosure, guided path, separate summary from detail.
- **Skill/schema drift.** Mitigation: schemas remain source of truth; skills cite schemas rather than restate them.

## 10. Open Questions

Mostly visual and deferred items. Functional and technical design is committed.

1. **Visual design direction.** Six candidate visions to prototype against the same sample content before committing: *Premium Interactive Technical Atlas*, *Calm Technical Book*, *Interactive Textbook*, *Code Intelligence Cockpit*, *Research Notebook / Lab Manual*, *Premium Documentation Site*. Decided after prototyping, not before.
2. **Mini-map exact UX.** Tree sidebar with collapsed/expanded state, thumb-style scrubber, or compact graph? Prototype.
3. **Synthesis hierarchy UI.** Nested-card list, indented outline with smooth expand, or "zoom" interaction where a clicked node becomes the focal level? Prototype.
4. **Light theme and dark theme tuning.** Both supported; specific palettes settle during design-vision prototyping.
5. **Project name.** TBD.

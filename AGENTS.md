# AGENTS.md — Authoring Trellis Reports

This file orients agents that create or revise Trellis reports. The report output is structured TypeScript data validated by the engine, not free-form Markdown.

## Source of Truth Hierarchy

Use sources in this order:

1. `spec/REQUIREMENTS.md` — product intent, scope, and acceptance criteria.
2. `spec/DESIGN.md` — architecture, schemas, component organization, build plan, and implementation decisions.
3. `claude-design-handoff/project/Trellis Design System.html` — token values and visual grammar.
4. `claude-design-handoff/project/Component Library Handoff.html` — component contracts, props, interactions, accessibility notes, and build order.
5. `claude-design-handoff/project/bento/*` — prototype reference only; do not copy prototype code into production.

## Build Commands

- `pnpm dev <report>`
- `pnpm validate <report>`
- `pnpm build <report>`
- `pnpm scaffold-report <name> --template <template>`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm storybook`

## Schema Locations

- `packages/engine/src/schemas/`

## Storybook

- `packages/storybook/` is the component catalog and usage reference.

## Golden Reports

- `reports/postgres-mvcc/`
- `reports/trellis-engine-architecture/`

## Skills

- `.claude/skills/report-composition/SKILL.md`
- `.claude/skills/component-library-usage/SKILL.md`
- `.claude/skills/research-and-analysis/SKILL.md`
- `.claude/skills/teaching-tone/SKILL.md`
- `.claude/skills/teaching-order/SKILL.md`
- `.claude/skills/synthesis/SKILL.md`
- `.claude/skills/entity-modeling/SKILL.md`
- `.claude/skills/visualization-guidelines/SKILL.md`

## Authoring Workflow

1. Scaffold with `pnpm scaffold-report <name> --template <template>`.
2. Research sources and code evidence outside the report output surface.
3. Plan orientation, sections, anchors, KG scope, synthesis scope, and source inventory.
4. Author structured content blocks, entities, relationships, synthesis nodes, and sources.
5. Customize only when standard components are insufficient.
6. Validate with `pnpm validate <name>`.
7. Build with `pnpm build <name>`.
8. Review through `pnpm dev <name>` or the static output.

Agents run validation and build directly. Do not leave schema errors for the user to fix manually.

# Type Safety

- Prioritize type-safety
- No `any` / type-system bypass (with rare exceptions)

# Code Standards

- Make impossible states unrepresentable
- Follow principle of colocation (keep related code close together)
- Colocate test files with the file being tested
- Use dependency injection to create testable designs

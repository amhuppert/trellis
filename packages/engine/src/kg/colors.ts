import type { EntityType, Relationship, SectionKind } from "../schemas";

export type TokenColorName =
  | "accent-coral"
  | "accent-sage"
  | "accent-butter"
  | "ink"
  | "ink-2"
  | "ink-3";

const entityTypeColors: Record<EntityType, TokenColorName> = {
  concept: "accent-coral",
  pattern: "accent-coral",
  feature: "accent-sage",
  file: "ink-3",
  module: "accent-sage",
  function: "ink-2",
  type: "accent-sage",
  component: "accent-sage",
  library: "accent-butter",
  paper: "accent-butter",
  person: "ink-3",
  api: "accent-sage",
  workflow: "accent-sage",
  other: "ink-3"
};

const sectionKindColors: Record<SectionKind, TokenColorName> = {
  Concept: "accent-coral",
  Mechanism: "accent-sage",
  Maintenance: "accent-butter",
  Contract: "accent-sage",
  Advanced: "ink",
  Custom: "ink-3"
};

const extraRuntimeTypeColors: Record<string, TokenColorName> = {
  mechanism: "accent-sage",
  maintenance: "accent-butter"
};

const relationshipTypeColors: Record<string, TokenColorName> = {
  "depends-on": "accent-sage",
  "similar-to": "accent-coral"
};

export function entityTypeColor(type: EntityType | string): TokenColorName {
  return entityTypeColors[type as EntityType] ?? extraRuntimeTypeColors[type] ?? "ink-3";
}

export function sectionKindColor(kind: SectionKind | string): TokenColorName {
  return sectionKindColors[kind as SectionKind] ?? "ink-3";
}

export function relationshipTypeColor(type: Relationship["type"]): TokenColorName {
  return relationshipTypeColors[type] ?? "ink-3";
}

export function tokenVar(name: TokenColorName): string {
  return `var(--color-${name})`;
}

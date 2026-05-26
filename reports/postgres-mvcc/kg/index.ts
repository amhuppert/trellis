import type { KnowledgeGraph } from "@trellis/engine";
import { entities } from "./entities.ts";
import { relationships } from "./relationships.ts";

export const kg: KnowledgeGraph = { entities, relationships };

import type { Section } from "@trellis/engine";
import { foundations } from "./foundations.ts";
import { edges, isolation, snapshots, tupleVersions, vacuum, visibility } from "./sections.ts";

export const sections: Section[] = [foundations, tupleVersions, snapshots, visibility, vacuum, isolation, edges];

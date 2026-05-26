import type { SourceReference } from "@trellis/engine";

// Prefer code sources with path and lineRange for architecture claims.
export const sources: SourceReference[] = [
  { id: "sample-code", kind: "code", title: "Replace with file or symbol", path: "path/to/file.ts", lineRange: [1, 20] }
];

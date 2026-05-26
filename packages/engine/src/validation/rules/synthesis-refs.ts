import type { ValidationContext, ValidationError } from "../errors";
import { reportConfigPath } from "../errors";
import type { ReferenceResolver } from "../reference-resolver";
import { validateReference } from "./helpers";

export const validateSynthesisRefs = (context: ValidationContext, resolver: ReferenceResolver): ValidationError[] =>
  [...resolver.synthesisNodes.values()].flatMap(({ node }) =>
    node.references.flatMap((reference) => validateReference(reference, context, resolver, { filePath: reportConfigPath(context) }))
  );

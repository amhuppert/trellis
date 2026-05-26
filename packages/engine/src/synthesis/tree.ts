import type { SynthesisNode } from "../schemas";

export function flatten(rootSynthesisNode: SynthesisNode): SynthesisNode[] {
  return [
    rootSynthesisNode,
    ...(rootSynthesisNode.children ?? []).flatMap((child) => flatten(child))
  ];
}

export function findChain(rootSynthesisNode: SynthesisNode, focusId: string): SynthesisNode[] {
  if (rootSynthesisNode.id === focusId) return [rootSynthesisNode];

  for (const child of rootSynthesisNode.children ?? []) {
    const childChain = findChain(child, focusId);
    if (childChain.length > 0) return [rootSynthesisNode, ...childChain];
  }

  return [];
}

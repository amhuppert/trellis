import React from "react";
import type { OutlineNode, ReportConfig, Section, SynthesisNode } from "../schemas";
import type { GraphMode, ReaderMode, ReaderState } from "../components/shell/reader-state";

export type ParsedRoute =
  | { mode: "orientation" }
  | { mode: "guided"; sectionId: string; anchorId?: string }
  | { mode: "reference"; focusEntityId?: string }
  | { mode: "synthesis"; synthesisFocusId?: string }
  | { mode: "graph"; graphMode: GraphMode; graphFocusId?: string };

const graphModes = new Set<GraphMode>(["atlas", "spotlight", "regions"]);

const decode = (segment: string) => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

const encode = (segment: string) => encodeURIComponent(segment);

function hasOutlineId(items: OutlineNode[], id: string): boolean {
  return items.some((item) => item.id === id || hasOutlineId(item.children ?? [], id));
}

function hasAnchor(section: Section, anchorId: string) {
  return section.blocks.some((block) => block.anchorId === anchorId) || hasOutlineId(section.children ?? [], anchorId);
}

export function validateParsedRoute(report: ReportConfig, route: ParsedRoute): ParsedRoute | null {
  switch (route.mode) {
    case "orientation":
      return route;
    case "guided": {
      const section = report.sections.find((candidate) => candidate.id === route.sectionId);
      if (!section) {
        console.warn(`Unknown section id in URL hash: ${route.sectionId}`);
        return null;
      }

      if (route.anchorId && !hasAnchor(section, route.anchorId)) {
        console.warn(`Unknown anchor id in URL hash: ${route.anchorId}`);
        return { mode: "guided", sectionId: route.sectionId };
      }

      return route;
    }
    case "reference": {
      if (route.focusEntityId && !(report.kg?.entities ?? []).some((entity) => entity.id === route.focusEntityId)) {
        console.warn(`Unknown entity id in URL hash: ${route.focusEntityId}`);
        return { mode: "reference" };
      }

      return route;
    }
    case "synthesis": {
      if (
        route.synthesisFocusId &&
        !(report.synthesis?.roots ?? []).some((root) => flattenSynthesisIds(root).has(route.synthesisFocusId!))
      ) {
        console.warn(`Unknown synthesis id in URL hash: ${route.synthesisFocusId}`);
        return { mode: "synthesis" };
      }

      return route;
    }
    case "graph": {
      if (route.graphFocusId && !(report.kg?.entities ?? []).some((entity) => entity.id === route.graphFocusId)) {
        console.warn(`Unknown graph entity id in URL hash: ${route.graphFocusId}`);
        return { mode: "graph", graphMode: "atlas" };
      }

      return route;
    }
  }
}

function flattenSynthesisIds(node: SynthesisNode): Set<string> {
  const ids = new Set<string>([node.id]);
  for (const child of node.children ?? []) {
    for (const id of flattenSynthesisIds(child)) {
      ids.add(id);
    }
  }
  return ids;
}

export function parseHash(hash: string): ParsedRoute | null {
  if (!hash || hash === "#") return null;

  const normalized = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!normalized.startsWith("/")) return null;

  const parts = normalized
    .slice(1)
    .split("/")
    .filter((part) => part.length > 0)
    .map(decode);

  const [mode, first, second] = parts;

  if (mode === "orientation" && parts.length === 1) {
    return { mode };
  }

  if (mode === "guided" && first && parts.length <= 3) {
    return second ? { mode, sectionId: first, anchorId: second } : { mode, sectionId: first };
  }

  if (mode === "reference" && parts.length <= 2) {
    return first ? { mode, focusEntityId: first } : { mode };
  }

  if (mode === "synthesis" && parts.length <= 2) {
    return first ? { mode, synthesisFocusId: first } : { mode };
  }

  if (mode === "graph" && parts.length === 1) {
    return { mode, graphMode: "atlas" };
  }

  if (mode === "graph" && graphModes.has(first as GraphMode) && parts.length <= 3) {
    const graphMode = first as GraphMode;
    if (second && graphMode !== "spotlight") return null;
    return second ? { mode, graphMode, graphFocusId: second } : { mode, graphMode };
  }

  return null;
}

export function serializeState(state: ReaderState): string {
  switch (state.mode) {
    case "orientation":
      return "#/orientation";
    case "guided":
      return state.scrollTarget
        ? `#/guided/${encode(state.sectionId)}/${encode(state.scrollTarget)}`
        : `#/guided/${encode(state.sectionId)}`;
    case "reference":
      return state.focusEntityId ? `#/reference/${encode(state.focusEntityId)}` : "#/reference";
    case "synthesis":
      return state.synthesisFocusId ? `#/synthesis/${encode(state.synthesisFocusId)}` : "#/synthesis";
    case "graph":
      return state.graphMode === "spotlight" && state.graphFocusId
        ? `#/graph/spotlight/${encode(state.graphFocusId)}`
        : `#/graph/${state.graphMode}`;
  }
}

export function applyParsedRoute(state: ReaderState, route: ParsedRoute): ReaderState {
  switch (route.mode) {
    case "orientation":
      return { ...state, mode: "orientation" };
    case "guided": {
      const target = route.anchorId ?? null;
      return {
        ...state,
        mode: "guided",
        sectionId: route.sectionId,
        scrollTarget: target,
        navTick:
          state.mode === "guided" && state.sectionId === route.sectionId && state.scrollTarget === target
            ? state.navTick + 1
            : state.navTick
      };
    }
    case "reference":
      return { ...state, mode: "reference", focusEntityId: route.focusEntityId ?? null };
    case "synthesis":
      return { ...state, mode: "synthesis", synthesisFocusId: route.synthesisFocusId ?? null };
    case "graph":
      return {
        ...state,
        mode: "graph",
        graphMode: route.graphMode,
        graphFocusId: route.graphFocusId ?? null
      };
  }
}

export function useHashRouter(
  report: ReportConfig,
  state: ReaderState,
  setState: React.Dispatch<React.SetStateAction<ReaderState>>
) {
  const lastWrittenHash = React.useRef<string | null>(null);

  React.useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const route = parseHash(window.location.hash);
    if (!route) return;

    lastWrittenHash.current = window.location.hash;
    const validated = validateParsedRoute(report, route);
    if (!validated) return;

    setState((current) => applyParsedRoute(current, validated));
  }, [report, setState]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const nextHash = serializeState(state);
    if (window.location.hash === nextHash || lastWrittenHash.current === nextHash) {
      lastWrittenHash.current = nextHash;
      return;
    }

    window.history.replaceState(null, "", nextHash);
    lastWrittenHash.current = nextHash;
  }, [
    state.mode,
    state.sectionId,
    state.scrollTarget,
    state.focusEntityId,
    state.synthesisFocusId,
    state.graphMode,
    state.graphFocusId
  ]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const applyCurrentHash = () => {
      const route = parseHash(window.location.hash);
      if (!route) {
        window.history.replaceState(null, "", serializeState(state));
        lastWrittenHash.current = window.location.hash;
        return;
      }

      const validated = validateParsedRoute(report, route);
      if (!validated) {
        window.history.replaceState(null, "", serializeState(state));
        lastWrittenHash.current = window.location.hash;
        return;
      }

      lastWrittenHash.current = window.location.hash;
      setState((current) => applyParsedRoute(current, validated));
    };

    window.addEventListener("popstate", applyCurrentHash);
    window.addEventListener("hashchange", applyCurrentHash);
    return () => {
      window.removeEventListener("popstate", applyCurrentHash);
      window.removeEventListener("hashchange", applyCurrentHash);
    };
  }, [
    report,
    setState,
    state.mode,
    state.sectionId,
    state.scrollTarget,
    state.focusEntityId,
    state.synthesisFocusId,
    state.graphMode,
    state.graphFocusId
  ]);
}

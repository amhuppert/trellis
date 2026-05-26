import React from "react";
import type { ReactNode } from "react";
import type { ReportConfig } from "../../schemas";
import { useKeyboardShortcuts } from "../../report-runtime/keyboard";
import { useHashRouter } from "../../report-runtime/router";
import { NavPanel } from "../chrome/NavPanel";
import { RightRail } from "../chrome/RightRail";
import { GraphView } from "../graph/GraphView";
import { GuidedView } from "../views/GuidedView";
import { OrientationView } from "../views/OrientationView";
import { ReferenceView } from "../views/ReferenceView";
import { SynthesisView } from "../views/SynthesisView";
import { TopBar } from "./TopBar";
import type { GraphMode, PersistentReaderState, ReaderMode, ReaderState } from "./reader-state";
import { persistentReaderState } from "./reader-state";

export type { GraphMode, PersistentReaderState, ReaderMode, ReaderState } from "./reader-state";

export type ReaderContextValue = {
  report: ReportConfig;
  state: ReaderState;
  openSection: (id: string, anchorId?: string) => void;
  openEntity: (id: string) => void;
  openSource: (id: string) => void;
  openSynthesis: (id?: string) => void;
  openGraph: (entityId?: string, requestedMode?: GraphMode) => void;
  setMode: (mode: ReaderMode) => void;
  setCurrentSubId: (id: string | null) => void;
  setState: React.Dispatch<React.SetStateAction<ReaderState>>;
};

export const ReaderContext = React.createContext<ReaderContextValue | null>(null);

export function useReader() {
  const value = React.useContext(ReaderContext);
  if (!value) {
    throw new Error("useReader must be used inside ReaderContext");
  }
  return value;
}

type AppShellProps = {
  report: ReportConfig;
  children?: ReactNode;
};

const isReaderMode = (value: unknown): value is ReaderMode =>
  value === "orientation" ||
  value === "guided" ||
  value === "reference" ||
  value === "synthesis" ||
  value === "graph";

const isGraphMode = (value: unknown): value is GraphMode =>
  value === "atlas" || value === "spotlight" || value === "regions";

const storageKey = (reportId: string) => `trellis:${reportId}`;

function readPersistentState(reportId: string): Partial<PersistentReaderState> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(storageKey(reportId));
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Partial<PersistentReaderState>;
    return {
      ...(isReaderMode(parsed.mode) ? { mode: parsed.mode } : {}),
      ...(typeof parsed.sectionId === "string" ? { sectionId: parsed.sectionId } : {}),
      ...(isGraphMode(parsed.graphMode) ? { graphMode: parsed.graphMode } : {})
    };
  } catch {
    return {};
  }
}

function createInitialState(report: ReportConfig): ReaderState {
  const firstSectionId = report.sections[0]?.id ?? "";
  const saved = readPersistentState(report.id);

  return {
    mode: saved.mode ?? "orientation",
    sectionId: saved.sectionId ?? firstSectionId,
    scrollTarget: null,
    currentSubId: null,
    focusEntityId: null,
    synthesisFocusId: null,
    graphMode: saved.graphMode ?? "atlas",
    graphFocusId: null,
    navTick: 0
  };
}

function PlaceholderView({ mode }: { mode: Exclude<ReaderMode, "orientation" | "guided"> }) {
  return (
    <main className="trellis-view trellis-view--placeholder" data-view={mode}>
      <div className="trellis-placeholder">
        <p className="trellis-eyebrow">{mode}</p>
        <h1>{mode[0].toUpperCase() + mode.slice(1)}</h1>
      </div>
    </main>
  );
}

function ActiveView({ report, state }: { report: ReportConfig; state: ReaderState }) {
  switch (state.mode) {
    case "orientation":
      return <OrientationView />;
    case "guided":
      return <GuidedView />;
    case "reference":
      return <ReferenceView />;
    case "synthesis":
      return <SynthesisView />;
    case "graph":
      return <GraphView />;
  }
}

export function AppShell({ report, children }: AppShellProps) {
  const [state, setState] = React.useState<ReaderState>(() => createInitialState(report));

  useHashRouter(report, state, setState);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(storageKey(report.id), JSON.stringify(persistentReaderState(state)));
    } catch {
      // Storage can fail in private browsing or constrained embeds; the reader still works.
    }
  }, [report.id, state.mode, state.sectionId, state.graphMode]);

  const openSection = React.useCallback((id: string, anchorId?: string) => {
    const target = anchorId ?? null;
    setState((current) => ({
      ...current,
      mode: "guided",
      sectionId: id,
      scrollTarget: target,
      navTick:
        current.sectionId === id && current.scrollTarget === target ? current.navTick + 1 : current.navTick
    }));
  }, []);

  const openEntity = React.useCallback((id: string) => {
    setState((current) => ({
      ...current,
      mode: "reference",
      focusEntityId: id
    }));
  }, []);

  const openSource = React.useCallback((id: string) => {
    setState((current) => ({
      ...current,
      mode: "reference",
      focusEntityId: id
    }));
  }, []);

  const openSynthesis = React.useCallback((id?: string) => {
    setState((current) => ({
      ...current,
      mode: "synthesis",
      synthesisFocusId: id ?? null
    }));
  }, []);

  const openGraph = React.useCallback((entityId?: string, requestedMode?: GraphMode) => {
    setState((current) => ({
      ...current,
      mode: "graph",
      graphMode: requestedMode ?? (entityId ? "spotlight" : "atlas"),
      graphFocusId: entityId ?? null
    }));
  }, []);

  const setMode = React.useCallback((mode: ReaderMode) => {
    setState((current) => ({
      ...current,
      mode,
      ...(mode === "graph" ? { graphMode: "atlas" as GraphMode, graphFocusId: null } : {})
    }));
  }, []);

  const setCurrentSubId = React.useCallback((id: string | null) => {
    setState((current) => (current.currentSubId === id ? current : { ...current, currentSubId: id }));
  }, []);

  useKeyboardShortcuts({ report, state, setMode, openSection });

  const value = React.useMemo<ReaderContextValue>(
    () => ({
      report,
      state,
      openSection,
      openEntity,
      openSource,
      openSynthesis,
      openGraph,
      setMode,
      setCurrentSubId,
      setState
    }),
    [openEntity, openGraph, openSection, openSource, openSynthesis, report, setCurrentSubId, setMode, state]
  );

  return (
    <ReaderContext.Provider value={value}>
      <div className="trellis-shell">
        <TopBar />
        <div
          className={
            state.mode === "guided" ? "trellis-shell__body trellis-shell__body--with-right-rail" : "trellis-shell__body"
          }
        >
          <NavPanel />
          <ActiveView report={report} state={state} />
          {state.mode === "guided" ? <RightRail /> : null}
        </div>
      </div>
      {children}
    </ReaderContext.Provider>
  );
}

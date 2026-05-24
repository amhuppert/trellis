// App shell — state, persistence, layout.
//
// Layout is now: TopBar over a Flex row with NavPanel on the left and the
// active view on the right. NavPanel is always visible and reflects the
// reader's current location, replacing the standalone Map page.
//
// State:
//   mode:         "orient" | "guided" | "reference" | "graph"
//   sectionId:    currently-open section (drives Guided view + NavPanel
//                 expansion default)
//   scrollTarget: when set, GuidedView smooth-scrolls to that anchor.
//                 Cleared on consumption so re-navigating to the same
//                 anchor scrolls again.
//   currentSubId: which subsection is most visible inside the current
//                 reading column — reported up by the IntersectionObserver
//                 in GuidedView, used by NavPanel to highlight the right
//                 leaf.
//   focusEntity:  highlighted entity in Reference view.
//
// Persisted to localStorage so a reload lands the reader where they were.

const LS_KEY = "bento-prototype:v2";

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (typeof s !== "object" || !s) return null;
    return s;
  } catch (e) { return null; }
}

function saveState(s) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch (e) {}
}

function App() {
  const saved = loadState() || {};
  const [mode, setMode]               = React.useState(saved.mode || "orient");
  const [sectionId, setSectionId]     = React.useState(saved.sectionId || "foundations");
  const [scrollTarget, setScrollTgt]  = React.useState(null);
  const [currentSubId, setCurrentSub] = React.useState(null);
  const [focusEntity, setFocusEntity] = React.useState(null);
  const [synFocus, setSynFocus]       = React.useState(null);
  // Graph view state — mode persists (default atlas), focus is transient.
  const [graphMode, setGraphMode]     = React.useState(saved.graphMode || "atlas");
  const [graphFocus, setGraphFocus]   = React.useState(null);
  // Bump every time someone navigates to the same (section, anchor) twice
  // so the scroll effect re-fires.
  const [navTick, setNavTick]         = React.useState(0);

  React.useEffect(() => { saveState({ mode, sectionId, graphMode }); }, [mode, sectionId, graphMode]);

  // Section navigation. anchorId optional. When the click is for a
  // subsection on the section we're already on, we don't change sectionId
  // but still want the scroll effect to fire — that's what navTick is for.
  const openSection = (id, anchorId) => {
    if (id === sectionId && anchorId === scrollTarget) {
      setNavTick((n) => n + 1);
    } else {
      setSectionId(id);
      setScrollTgt(anchorId || null);
    }
    setMode("guided");
  };

  const openEntity = (id) => {
    setFocusEntity(id);
    setMode("reference");
  };

  const openSynthesis = (id) => {
    setSynFocus(id || null);
    setMode("synthesis");
  };

  // Graph view — switch into graph mode. If an entityId is provided we land
  // in spotlight (best for "what's near this thing"); without one, atlas
  // (best for getting one's bearings).
  const openGraph = (entityId, requestedMode) => {
    setGraphFocus(entityId || null);
    if (requestedMode) setGraphMode(requestedMode);
    else if (entityId && graphMode === "atlas") setGraphMode("spotlight");
    setMode("graph");
  };

  // Stamp openGraph onto window so InlineProse / EntityRef can call it
  // without having to thread a prop through every render path.
  React.useEffect(() => {
    window.__openGraph = openGraph;
    return () => { delete window.__openGraph; };
  }, [graphMode]);

  // Keyboard nav.
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey) return;
      const k = e.key.toLowerCase();
      if (k === "g") setMode("guided");
      else if (k === "r") setMode("reference");
      else if (k === "o") setMode("orient");
      else if (k === "s") setMode("synthesis");
      else if (k === "k") setMode("graph");
      else if (k === "[" || k === "h") {
        const i = window.B.sections.findIndex((s) => s.id === sectionId);
        if (i > 0) openSection(window.B.sections[i - 1].id);
      } else if (k === "]" || k === "l") {
        const i = window.B.sections.findIndex((s) => s.id === sectionId);
        if (i < window.B.sections.length - 1) openSection(window.B.sections[i + 1].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sectionId]);

  // Compose scrollTarget key: when the user re-clicks the same anchor,
  // navTick bumps so GuidedView's effect re-fires.
  const scrollKey = scrollTarget ? `${scrollTarget}#${navTick}` : null;

  return (
    <div style={{ minHeight: "100vh", background: TT.bg, color: TT.ink, fontFamily: FF.sans }}>
      <TopBar
        mode={mode}
        onMode={(m) => { setMode(m); }}
        onLogo={() => setMode("orient")}
      />

      <div style={{ display: "flex", alignItems: "stretch", minHeight: "calc(100vh - 60px)" }}>
        <NavPanel
          currentSectionId={mode === "guided" ? sectionId : null}
          currentSubId={mode === "guided" ? currentSubId : null}
          mode={mode}
          onSection={openSection}
          onMode={(m) => setMode(m)}
          synFocus={synFocus}
          onSynFocus={setSynFocus}
        />

        {mode === "orient" && (
          <OrientationView
            onMode={setMode}
            onOpenSection={openSection}
            onOpenEntity={openEntity}
            onOpenSynthesis={openSynthesis}
          />
        )}

        {mode === "guided" && (
          <GuidedView
            sectionId={sectionId}
            onSection={openSection}
            onMode={setMode}
            onOpenEntity={openEntity}
            scrollTarget={scrollKey}
            onCurrentSub={setCurrentSub}
          />
        )}

        {mode === "reference" && (
          <ReferenceView
            focusEntityId={focusEntity}
            onFocusEntity={setFocusEntity}
            onSection={(id) => openSection(id)}
            onMode={setMode}
          />
        )}

        {mode === "graph" && (
          <GraphView
            mode={graphMode}
            focusId={graphFocus}
            onGraphMode={setGraphMode}
            onGraphFocus={setGraphFocus}
            onSection={(id) => openSection(id)}
            onMode={setMode}
            onOpenEntity={openEntity}
          />
        )}

        {mode === "synthesis" && (
          <SynthesisView
            focusId={synFocus}
            onFocus={setSynFocus}
            onSection={(id, anchorId) => openSection(id, anchorId)}
            onOpenEntity={openEntity}
            onMode={setMode}
          />
        )}
      </div>

      {/* Keyboard hint */}
      <div style={{
        position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
        background: TT.surface, border: `1px solid ${TT.borderSoft}`, borderRadius: 999,
        padding: "6px 12px", display: "flex", gap: 12, alignItems: "center",
        fontFamily: FF.mono, fontSize: 10, color: TT.ink3,
        boxShadow: TT.shadow,
        zIndex: 50, pointerEvents: "none",
      }}>
        <span><kbd style={kbd}>O</kbd> orient</span>
        <span><kbd style={kbd}>G</kbd> guided</span>
        <span><kbd style={kbd}>R</kbd> reference</span>
        <span><kbd style={kbd}>S</kbd> synthesis</span>
        <span><kbd style={kbd}>K</kbd> graph</span>
        <span style={{ color: TT.ink4 }}>·</span>
        <span><kbd style={kbd}>[</kbd> <kbd style={kbd}>]</kbd> sections</span>
      </div>
    </div>
  );
}

const kbd = {
  fontFamily: window.FF ? window.FF.mono : "monospace",
  fontSize: 10, padding: "1px 5px", border: `1px solid ${window.TT ? window.TT.borderHi : "#ccc"}`,
  borderRadius: 4, marginRight: 2, color: window.TT ? window.TT.ink2 : "#333",
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

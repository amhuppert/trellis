// Modular Bento — shared design tokens + components.
// Light theme. Sage + coral on linen. Manrope + Source Serif 4.

const TT = {
  bg: "#F4F2EC",
  surface: "#FFFFFF",
  surface2: "#F9F7F1",
  surface3: "#ECE8DC",
  chip: "#ECE8DC",
  border: "rgba(20,30,25,0.10)",
  borderSoft: "rgba(20,30,25,0.05)",
  borderHi: "rgba(20,30,25,0.18)",
  ink: "#16201A",
  ink2: "rgba(22,32,26,0.66)",
  ink3: "rgba(22,32,26,0.44)",
  ink4: "rgba(22,32,26,0.28)",
  sage: "oklch(48% 0.07 155)",
  sageSoft: "oklch(92% 0.04 155)",
  sageBg: "oklch(96% 0.025 155)",
  sageInk: "oklch(35% 0.07 155)",
  coral: "oklch(62% 0.16 30)",
  coralSoft: "oklch(94% 0.05 30)",
  coralBg: "oklch(97% 0.025 30)",
  coralInk: "oklch(45% 0.16 30)",
  butter: "oklch(86% 0.10 90)",
  butterBg: "oklch(96% 0.03 90)",
  butterInk: "oklch(48% 0.10 80)",
  shadow: "0 1px 2px rgba(20,30,25,0.04), 0 6px 24px rgba(20,30,25,0.04)",
  shadowHi: "0 4px 12px rgba(20,30,25,0.06), 0 20px 60px rgba(20,30,25,0.08)"
};

const FF = {
  sans: '"Manrope", -apple-system, system-ui, sans-serif',
  serif: '"Source Serif 4", "Newsreader", Georgia, serif',
  mono: '"JetBrains Mono", monospace'
};

// -- Tiny utilities

const KIND_COLOR = {
  Concept: TT.coral,
  Mechanism: TT.sage,
  Maintenance: TT.butterInk,
  Contract: TT.sage,
  Advanced: TT.coral
};

const ENTITY_TYPE_COLOR = {
  concept: TT.coral,
  pattern: TT.coralInk,
  feature: TT.sage,
  file: TT.butterInk
};

// -- Eyebrow label

function Eyebrow({ children, color, style }) {
  return (
    <div style={{
      fontFamily: FF.sans, fontSize: 11, letterSpacing: "0.14em",
      textTransform: "uppercase", fontWeight: 700, color: color || TT.ink3,
      ...style
    }}>{children}</div>);

}

// -- Reusable Bento card

function Card({ children, span = 1, tall = 1, bg, pad = "20px 22px", style = {} }) {
  return (
    <div style={{
      gridColumn: `span ${span}`,
      gridRow: `span ${tall}`,
      background: bg || TT.surface,
      borderRadius: 18,
      border: `1px solid ${TT.borderSoft}`,
      padding: pad,
      overflow: "hidden",
      display: "flex", flexDirection: "column",
      ...style
    }}>{children}</div>);

}

// -- Dot

function Dot({ color, size = 8, style }) {
  return (
    <span style={{
      display: "inline-block",
      width: size, height: size, borderRadius: size,
      background: color, verticalAlign: "middle", ...style
    }} />);

}

// -- Inline prose renderer: handles <e id="...">...</e> entity refs, <em>,
// and <code>. Simple HTML-ish parser, fast enough for prototype.
function InlineProse({ text, onEntityClick }) {
  // Tokenize.
  const out = [];
  let cursor = 0;
  const re = /<(e|em|code)\s*([^>]*)>([\s\S]*?)<\/\1>/g;
  let m;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > cursor) out.push(text.slice(cursor, m.index));
    const tag = m[1];
    const attrs = m[2];
    const inner = m[3];
    if (tag === "e") {
      const idMatch = attrs.match(/id=["']([^"']+)["']/);
      out.push(<EntityRef key={"e" + key++} id={idMatch ? idMatch[1] : ""} onClick={onEntityClick}>{inner}</EntityRef>);
    } else if (tag === "em") {
      out.push(<em key={"em" + key++} style={{ fontStyle: "italic", color: TT.ink }}>{inner}</em>);
    } else if (tag === "code") {
      out.push(<code key={"c" + key++} style={{ fontFamily: FF.mono, fontSize: "0.92em", background: TT.surface3, padding: "1px 6px", borderRadius: 4 }}>{inner}</code>);
    }
    cursor = m.index + m[0].length;
  }
  if (cursor < text.length) out.push(text.slice(cursor));
  return <>{out}</>;
}

// -- EntityRef — inline entity mention with hover card.
function EntityRef({ id, children, onClick }) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState(null);
  const tref = React.useRef(null);
  const timer = React.useRef(null);

  const entity = (window.B.entities || []).find((e) => e.id === id);

  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!tref.current) return;
      const r = tref.current.getBoundingClientRect();
      setCoords({ left: r.left + r.width / 2, top: r.bottom + 6 });
      setOpen(true);
    }, 140);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 120);
  };

  const handleClick = (e) => {
    e.preventDefault();
    onClick && onClick(id);
  };

  return (
    <>
      <span
        ref={tref}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={handleClick}
        tabIndex={0}
        style={{
          fontFamily: FF.mono,
          fontSize: "0.92em",
          color: TT.coralInk,
          background: TT.coralBg,
          padding: "1px 6px",
          borderRadius: 4,
          cursor: "pointer",
          borderBottom: `1px dotted ${TT.coral}`,
          fontWeight: 500,
          whiteSpace: "nowrap"
        }}>
        {children}</span>
      {open && entity && ReactDOM.createPortal(
        <div
          onMouseEnter={show}
          onMouseLeave={hide}
          className="pop-in"
          style={{
            position: "fixed",
            left: coords.left,
            top: coords.top,
            transform: "translateX(-50%)",
            zIndex: 999,
            width: 320,
            background: TT.surface,
            borderRadius: 12,
            border: `1px solid ${TT.border}`,
            boxShadow: TT.shadowHi,
            padding: "14px 16px",
            fontFamily: FF.sans
          }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontFamily: FF.mono, fontSize: 13, color: TT.coralInk, fontWeight: 600 }}>{entity.name}</span>
            <span style={{ fontFamily: FF.mono, fontSize: 9, color: TT.ink3, letterSpacing: "0.08em", textTransform: "uppercase" }}>{entity.type}</span>
          </div>
          <div style={{ fontFamily: FF.serif, fontSize: 14, lineHeight: 1.45, color: TT.ink, textWrap: "pretty" }}>
            {entity.shortDef}
          </div>
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${TT.borderSoft}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: TT.ink3, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              §{(window.B.sections.find((s) => s.id === entity.primarySection) || {}).n || "—"}
            </span>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button
                onClick={(ev) => { ev.stopPropagation(); if (window.__openGraph) window.__openGraph(entity.id, "spotlight"); }}
                style={{
                  background: TT.surface2, border: `1px solid ${TT.borderSoft}`, color: TT.ink2,
                  borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                  fontFamily: FF.sans, fontSize: 11, fontWeight: 600,
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}
                title="See in knowledge graph">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="5" cy="5" r="1.6" fill="currentColor" /><circle cx="1.6" cy="2" r="1.1" /><circle cx="8.4" cy="2" r="1.1" /><circle cx="2" cy="8.4" r="1.1" /><circle cx="8" cy="8.4" r="1.1" />
                  <path d="M5 5L1.6 2M5 5L8.4 2M5 5L2 8.4M5 5L8 8.4" />
                </svg>
                graph
              </button>
              <button
                onClick={handleClick}
                style={{
                  background: TT.ink, border: "none", color: TT.bg,
                  borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                  fontFamily: FF.sans, fontSize: 11, fontWeight: 700,
                }}>
                open →
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>);

}

// -- TopBar — global app header

function TopBar({ mode, onMode, onLogo }) {
  return (
    <div style={{
      gridColumn: "1 / -1",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 24px",
      borderBottom: `1px solid ${TT.borderSoft}`,
      background: TT.bg,
      position: "sticky", top: 0, zIndex: 20
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={onLogo}>
        <div style={{
          width: 32, height: 32, borderRadius: 10, background: TT.ink,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ width: 12, height: 12, borderRadius: 999, background: TT.coral }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.1, color: TT.ink }}>Trellis
</div>
          <div style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3 }}>postgres-mvcc</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, background: TT.surface, padding: 4, borderRadius: 999, border: `1px solid ${TT.borderSoft}` }}>
        {window.B.modes.map((m) => {const active = m.id === mode;
            return (
              <button
                key={m.id}
                onClick={() => onMode(m.id)}
                style={{
                  fontFamily: FF.sans, fontSize: 12, fontWeight: 600,
                  padding: "7px 14px", borderRadius: 999, border: "none", cursor: "pointer",
                  background: active ? TT.ink : "transparent",
                  color: active ? TT.bg : TT.ink2,
                  transition: "background .14s, color .14s"
                }}>
                {m.name}</button>);

          })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button style={{
          background: TT.surface, border: `1px solid ${TT.borderSoft}`,
          borderRadius: 999, padding: "7px 14px",
          fontFamily: FF.sans, fontSize: 12, color: TT.ink2, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="5.5" cy="5.5" r="3.5" /><path d="M8.5 8.5L11 11" /></svg>
          Search
          <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3, marginLeft: 4 }}>⌘K</span>
        </button>
      </div>
    </div>);

}

// -- NavPanel — persistent navigation panel. Shows the full outline of
// every section as a collapsible tree. The current section auto-expands;
// subsection clicks scroll to the right anchor inside the guided reader.
// Always visible — this is the user's place-keeping device.

function NavPanel({ currentSectionId, currentSubId, mode, onSection, onMode, synFocus, onSynFocus }) {
  const sections = window.B.sections;
  const inSynthesis = mode === "synthesis";

  // Expansion state. Defaults to {current: true}. Updates when current
  // section changes so the new one auto-expands; manual toggles persist.
  const [expanded, setExpanded] = React.useState(() =>
  currentSectionId ? { [currentSectionId]: true } : {}
  );
  React.useEffect(() => {
    if (currentSectionId && mode === "guided") {
      setExpanded((prev) => prev[currentSectionId] ? prev : { ...prev, [currentSectionId]: true });
    }
  }, [currentSectionId, mode]);

  const isExpanded = (id) => !!expanded[id];
  const toggle = (id, e) => {
    e && e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const expandAll = () => setExpanded(Object.fromEntries(sections.map((s) => [s.id, true])));
  const collapseAll = () => setExpanded({});

  const showActiveSection = mode === "guided" ? currentSectionId : null;

  return (
    <aside style={{
      width: 296, flex: "0 0 296px",
      background: TT.surface,
      borderRight: `1px solid ${TT.borderSoft}`,
      position: "sticky", top: 60, alignSelf: "flex-start",
      height: "calc(100vh - 60px)",
      display: "flex", flexDirection: "column"
    }}>
      {/* Mode tabs — section tree vs synthesis tree */}
      <div style={{ display: "flex", borderBottom: `1px solid ${TT.borderSoft}`, padding: "10px 12px 0", gap: 4 }}>
        <NavTab active={!inSynthesis} onClick={() => { if (inSynthesis) onMode("guided"); }} label="Sections" count={window.B.meta.sectionCount} />
        <NavTab active={inSynthesis}  onClick={() => onMode("synthesis")} label="Synthesis" count={countSyn(window.B.synthesis.root)} color={TT.coral} />
      </div>

      {/* Tab-specific body */}
      {inSynthesis
        ? <SynthesisNavBody synFocus={synFocus} onSynFocus={onSynFocus} />
        : <SectionsNavBody
            sections={sections}
            showActiveSection={showActiveSection}
            isExpanded={isExpanded}
            toggle={toggle}
            expandAll={expandAll}
            collapseAll={collapseAll}
            onSection={onSection}
            currentSubId={currentSubId}
            mode={mode}
          />}

      {/* Footer — jump-to */}
      <div style={{ padding: "10px 12px 14px", borderTop: `1px solid ${TT.borderSoft}` }}>
        <div style={{ display: "grid", gap: 2 }}>
          <NavJump active={mode === "orient"}    onClick={() => onMode("orient")}    label="Orientation" hint="Hero · what's here" />
          <NavJump active={mode === "reference"} onClick={() => onMode("reference")} label="Reference"   hint={`${window.B.meta.entityCount} entities · ${window.B.meta.sourceCount} sources`} />
          <NavJump active={mode === "graph"}     onClick={() => onMode("graph")}     label="Knowledge graph" hint="Entities & relationships" />
        </div>
      </div>
    </aside>);

}

function NavTab({ active, onClick, label, count, color }) {
  const c = color || TT.sage;
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent", border: "none", cursor: "pointer",
        padding: "10px 4px 11px", marginBottom: -1,
        borderBottom: `2px solid ${active ? c : "transparent"}`,
        fontFamily: FF.sans, fontSize: 13, fontWeight: active ? 700 : 500,
        color: active ? TT.ink : TT.ink3,
        display: "flex", alignItems: "center", gap: 6,
        transition: "color .12s, border-color .12s",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = TT.ink; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = TT.ink3; }}
    >
      <span>{label}</span>
      <span style={{ fontFamily: FF.mono, fontSize: 10, color: active ? c : TT.ink4, fontWeight: 600 }}>{count}</span>
    </button>
  );
}

function countSyn(node) {
  let n = 1;
  for (const c of (node.children || [])) n += countSyn(c);
  return n;
}

function SectionsNavBody({ sections, showActiveSection, isExpanded, toggle, expandAll, collapseAll, onSection, currentSubId, mode }) {
  return (
    <React.Fragment>
      {/* Report header */}
      <div style={{ padding: "14px 22px 12px", borderBottom: `1px solid ${TT.borderSoft}` }}>
        <div style={{ fontFamily: FF.serif, fontSize: 17, lineHeight: 1.2, fontWeight: 500, color: TT.ink, letterSpacing: "-0.005em" }}>
          How Postgres MVCC Works
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3 }}>
            {window.B.meta.sectionCount} sections · {window.B.meta.readTime}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={expandAll} title="Expand all" style={treeIconBtn}
              onMouseEnter={(e) => e.currentTarget.style.color = TT.ink}
              onMouseLeave={(e) => e.currentTarget.style.color = TT.ink3}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 4l2.5 2.5L8 4" /></svg>
            </button>
            <button onClick={collapseAll} title="Collapse all" style={treeIconBtn}
              onMouseEnter={(e) => e.currentTarget.style.color = TT.ink}
              onMouseLeave={(e) => e.currentTarget.style.color = TT.ink3}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 7l2.5-2.5L8 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tree */}
      <div style={{ flex: 1, overflow: "auto", padding: "10px 8px 12px" }}>
        {sections.map((s) =>
        <NavSection
          key={s.id}
          section={s}
          active={s.id === showActiveSection}
          expanded={isExpanded(s.id)}
          onToggle={(e) => toggle(s.id, e)}
          onSection={onSection}
          currentSubId={currentSubId}
          mode={mode} />
        )}
      </div>
    </React.Fragment>
  );
}

function SynthesisNavBody({ synFocus, onSynFocus }) {
  const root = window.B.synthesis.root;
  const flat = React.useMemo(() => {
    const out = [];
    const walk = (n, depth, chain) => {
      const next = [...chain, n.id];
      out.push({ node: n, depth, chain: next });
      for (const c of (n.children || [])) walk(c, depth + 1, next);
    };
    walk(root, 0, []);
    return out;
  }, [root]);

  const focusId = synFocus || root.id;
  const focusChain = (flat.find((f) => f.node.id === focusId) || flat[0]).chain;

  return (
    <React.Fragment>
      <div style={{ padding: "14px 22px 12px", borderBottom: `1px solid ${TT.borderSoft}` }}>
        <div style={{ fontFamily: FF.serif, fontSize: 16, lineHeight: 1.25, fontWeight: 500, color: TT.ink, letterSpacing: "-0.005em", textWrap: "pretty" }}>
          {root.title}
        </div>
        <div style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3, marginTop: 8 }}>
          {flat.length} nodes · depth {Math.max(...flat.map((f) => f.depth)) + 1}
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "10px 8px 12px" }}>
        {flat.map(({ node, depth }) => {
          const active = node.id === focusId;
          const onPath = focusChain.includes(node.id) && !active;
          const childCount = (node.children || []).length;
          return (
            <button
              key={node.id}
              onClick={() => onSynFocus(node.id)}
              style={{
                width: "100%", textAlign: "left",
                display: "flex", alignItems: "flex-start", gap: 8,
                paddingLeft: 8 + depth * 14, paddingRight: 10,
                paddingTop: 6, paddingBottom: 6,
                marginBottom: 1,
                background: active ? TT.ink : onPath ? TT.surface2 : "transparent",
                color: active ? TT.bg : TT.ink,
                border: "none", cursor: "pointer", borderRadius: 8,
                transition: "background .12s",
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = TT.surface2; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = onPath ? TT.surface2 : "transparent"; }}
            >
              <span style={{
                flex: "0 0 auto", width: 5, height: 5, borderRadius: 5, marginTop: 7,
                background: active ? TT.coral : LEVEL_COLOR_NAV(node.level),
              }} />
              <span style={{ display: "block", flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: FF.sans, fontSize: 12.5, fontWeight: active ? 700 : 500, lineHeight: 1.3, textWrap: "pretty" }}>
                  {node.title}
                </span>
                <span style={{
                  display: "block", marginTop: 2,
                  fontFamily: FF.mono, fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase",
                  color: active ? "rgba(244,242,236,0.55)" : TT.ink4,
                }}>
                  L{node.level} · {childCount === 0 ? "leaf" : `${childCount} child${childCount === 1 ? "" : "ren"}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </React.Fragment>
  );
}

const LEVEL_COLOR_NAV = (lvl) => [TT.ink, TT.sage, TT.coral][lvl] || TT.coralInk;

const treeIconBtn = {
  background: "transparent", border: "none", cursor: "pointer",
  color: "rgba(22,32,26,0.44)", padding: "3px 5px", borderRadius: 4,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  transition: "color .12s, background .12s"
};

function NavJump({ active, onClick, label, hint }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left", border: "none", cursor: "pointer",
        background: active ? TT.sageBg : "transparent",
        padding: "9px 12px", borderRadius: 8,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        transition: "background .12s"
      }}
      onMouseEnter={(e) => {if (!active) e.currentTarget.style.background = TT.surface2;}}
      onMouseLeave={(e) => {if (!active) e.currentTarget.style.background = "transparent";}}>
      
      <span>
        <span style={{ display: "block", fontFamily: FF.sans, fontSize: 13, color: active ? TT.sage : TT.ink, fontWeight: active ? 700 : 600 }}>
          {label}
        </span>
        <span style={{ display: "block", fontFamily: FF.sans, fontSize: 11, color: TT.ink3, marginTop: 1 }}>
          {hint}
        </span>
      </span>
      <span style={{ color: active ? TT.sage : TT.ink4, fontSize: 13 }}>→</span>
    </button>);

}

function NavSection({ section, active, expanded, onToggle, onSection, currentSubId, mode }) {
  const kindColor = KIND_COLOR[section.kind] || TT.sage;
  const hasChildren = section.children && section.children.length > 0;

  return (
    <div style={{ marginBottom: 2 }}>
      {/* Row: chevron · number · title */}
      <div style={{
        display: "flex", alignItems: "stretch", borderRadius: 8,
        background: active ? TT.sageBg : "transparent",
        transition: "background .12s"
      }}>
        <button
          onClick={onToggle}
          title={expanded ? "Collapse" : "Expand"}
          disabled={!hasChildren}
          style={{
            background: "transparent", border: "none", cursor: hasChildren ? "pointer" : "default",
            padding: "8px 4px 8px 10px", display: "flex", alignItems: "center",
            color: active ? TT.sage : TT.ink3,
            opacity: hasChildren ? 1 : 0.0
          }}>
          
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .15s" }}>
            <path d="M3.5 2L6.5 5 3.5 8" />
          </svg>
        </button>
        <button
          onClick={() => onSection(section.id)}
          style={{
            flex: 1, background: "transparent", border: "none", cursor: "pointer",
            padding: "8px 10px 8px 0", textAlign: "left",
            display: "flex", alignItems: "baseline", gap: 10
          }}
          onMouseEnter={(e) => {if (!active) e.currentTarget.parentElement.style.background = TT.surface2;}}
          onMouseLeave={(e) => {if (!active) e.currentTarget.parentElement.style.background = "transparent";}}>
          
          <span style={{
            fontFamily: FF.mono, fontSize: 10, fontWeight: 600,
            color: active ? TT.sage : kindColor, minWidth: 16, flexShrink: 0
          }}>{section.n}</span>
          <span style={{
            fontFamily: FF.sans, fontSize: 13.5, lineHeight: 1.25,
            fontWeight: active ? 700 : 500,
            color: active ? TT.sage : TT.ink
          }}>{section.title}</span>
        </button>
      </div>

      {/* Children outline */}
      {expanded && hasChildren &&
      <div style={{ paddingLeft: 28 }}>
          <NavChildren
          items={section.children}
          sectionId={section.id}
          onSection={onSection}
          currentSubId={mode === "guided" && active ? currentSubId : null}
          depth={0}
          isActiveSection={active} />
        
        </div>
      }
    </div>);

}

function NavChildren({ items, sectionId, onSection, currentSubId, depth, isActiveSection }) {
  return (
    <div style={{
      position: "relative", paddingLeft: depth === 0 ? 0 : 12,
      borderLeft: depth > 0 ? `1px solid ${TT.borderSoft}` : "none",
      marginLeft: depth > 0 ? 2 : 0
    }}>
      {items.map((c) => {
        const isCurrent = currentSubId && c.id === currentSubId;
        const hasKids = c.children && c.children.length > 0;
        return (
          <div key={c.id}>
            <button
              onClick={() => onSection(sectionId, c.id)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                width: "100%", textAlign: "left",
                background: isCurrent ? TT.sageBg : "transparent",
                border: "none", cursor: "pointer",
                padding: "5px 10px 5px 8px", borderRadius: 6,
                margin: "0 -2px",
                position: "relative",
                transition: "background .12s"
              }}
              onMouseEnter={(e) => {if (!isCurrent) e.currentTarget.style.background = TT.surface2;}}
              onMouseLeave={(e) => {if (!isCurrent) e.currentTarget.style.background = "transparent";}}>
              
              {isCurrent &&
              <span style={{
                position: "absolute", left: -14, top: 0, bottom: 0, width: 2,
                background: TT.sage, borderRadius: 2
              }} />
              }
              <span style={{
                width: 4, height: 4, borderRadius: 4, marginTop: 8,
                background: isCurrent ? TT.sage : TT.ink4, flexShrink: 0
              }} />
              <span style={{
                fontFamily: FF.sans,
                fontSize: depth === 0 ? 12.5 : 12,
                lineHeight: 1.35,
                color: isCurrent ? TT.sage : isActiveSection ? TT.ink2 : TT.ink3,
                fontWeight: isCurrent ? 600 : 400
              }}>{c.title}</span>
            </button>
            {hasKids &&
            <div style={{ marginLeft: 10 }}>
                <NavChildren
                items={c.children}
                sectionId={sectionId}
                onSection={onSection}
                currentSubId={currentSubId}
                depth={depth + 1}
                isActiveSection={isActiveSection} />
              
              </div>
            }
          </div>);

      })}
    </div>);

}

// -- Sidebar (legacy alias — kept so any straggler imports keep working) --
const Sidebar = NavPanel;

Object.assign(window, {
  TT, FF, KIND_COLOR, ENTITY_TYPE_COLOR,
  Eyebrow, Card, Dot, InlineProse, EntityRef,
  TopBar, Sidebar, NavPanel
});
// Sketches 1–3 — the three primary graph layout proposals.
//
// All sketches assume the data on window.G. None depend on each other.

const G   = window.G;
const ENT = G.entities;
const REL = G.relationships;

// Degree centrality, used for node sizing.
const DEGREE = (() => {
  const d = Object.fromEntries(ENT.map((e) => [e.id, 0]));
  for (const r of REL) { d[r.from]++; d[r.to]++; }
  return d;
})();

function degreeR(id, base = 6, scale = 1.6) {
  return base + Math.sqrt(DEGREE[id] || 1) * scale;
}

// Neighbor helpers.
function neighborsOf(id) {
  const out = new Set();
  for (const r of REL) {
    if (r.from === id) out.add(r.to);
    if (r.to === id)   out.add(r.from);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// SKETCH 1 — THE ATLAS
// Full force-directed graph; type + strength filters; hover-highlight
// neighborhood; click-to-focus opens an inline detail card.
// ─────────────────────────────────────────────────────────────────────────────

function SketchAtlas() {
  const W = 880, H = 460;
  const [hoverId, setHover] = React.useState(null);
  const [focusId, setFocus] = React.useState("snapshot");
  const [activeTypes, setTypes] = React.useState({ concept: true, pattern: true, feature: true, file: true });
  const [minStrength, setMin]   = React.useState("weak");

  const strengthRank = { weak: 0, medium: 1, strong: 2 };
  const visibleEdges = REL.filter((r) => strengthRank[r.strength] >= strengthRank[minStrength]);
  const visibleEntIds = new Set(ENT.filter((e) => activeTypes[e.type]).map((e) => e.id));

  const pos = React.useMemo(
    () => forceLayout(ENT, REL, W, H, { seed: 13, iters: 280 }),
    []
  );

  const highlight = hoverId || focusId;
  const highlightNbrs = highlight ? neighborsOf(highlight) : null;
  const isLit = (id) =>
    !highlight ? true : (id === highlight || (highlightNbrs && highlightNbrs.has(id)));

  return (
    <div style={{ display: "grid", gridTemplateRows: "auto 1fr", height: "100%" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        padding: "10px 14px", borderBottom: `1px solid ${TT.borderSoft}`, background: TT.surface2,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: TT.surface, border: `1px solid ${TT.borderSoft}`,
          borderRadius: 8, padding: "5px 10px", fontFamily: FF.sans, fontSize: 12,
          color: TT.ink3, width: 180,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="5" cy="5" r="3" /><path d="M7.5 7.5L10 10" /></svg>
          <span style={{ flex: 1 }}>Search entities…</span>
          <span style={{ fontFamily: FF.mono, fontSize: 10 }}>⌘K</span>
        </div>
        <span style={{ width: 1, height: 18, background: TT.borderSoft }} />
        {["concept", "pattern", "feature", "file"].map((t) => (
          <button key={t} onClick={() => setTypes((s) => ({ ...s, [t]: !s[t] }))}
            style={chip(activeTypes[t], TYPE_COLOR[t])}>{t}</button>
        ))}
        <span style={{ width: 1, height: 18, background: TT.borderSoft }} />
        <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3, textTransform: "uppercase", letterSpacing: "0.08em" }}>edges</span>
        {["weak", "medium", "strong"].map((s) => (
          <button key={s} onClick={() => setMin(s)} style={chip(minStrength === s, TT.ink)}>{s}+</button>
        ))}
        <div style={{ flex: 1 }} />
        <button style={btn()}>force ▾</button>
        <button style={btn()}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1h3M1 1v3M10 1H7M10 1v3M1 10h3M1 10v-3M10 10H7M10 10v-3"/></svg>
          fit
        </button>
      </div>

      {/* Canvas */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%", background: TT.surface }}>
          <ArrowMarkers />
          {/* Edges */}
          {visibleEdges.map((r, i) => {
            const a = pos[r.from], b = pos[r.to];
            if (!a || !b) return null;
            if (!visibleEntIds.has(r.from) || !visibleEntIds.has(r.to)) return null;
            const lit = !highlight || r.from === highlight || r.to === highlight;
            const st = STRENGTH[r.strength];
            return (
              <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={lit ? TT.ink : TT.ink}
                strokeOpacity={lit ? st.o : 0.06}
                strokeWidth={st.w}
              />
            );
          })}
          {/* Edge label on hovered/focused node only */}
          {highlight && visibleEdges.filter((r) => r.from === highlight || r.to === highlight).map((r, i) => {
            const a = pos[r.from], b = pos[r.to];
            if (!a || !b) return null;
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            return (
              <g key={"el" + i}>
                <rect x={mx - r.type.length * 3.4} y={my - 8} width={r.type.length * 6.8} height={14}
                  fill={TT.bg} stroke={TT.borderSoft} rx={3} />
                <text x={mx} y={my + 2} textAnchor="middle"
                  style={{ fontFamily: FF.mono, fontSize: 9, fill: TT.ink2 }}>{r.type}</text>
              </g>
            );
          })}
          {/* Nodes */}
          {ENT.map((e) => {
            if (!visibleEntIds.has(e.id)) return null;
            const p = pos[e.id]; if (!p) return null;
            const r = degreeR(e.id, 8, 2.2);
            const lit = isLit(e.id);
            const isFocus = e.id === focusId;
            const color = TYPE_COLOR[e.type] || TT.ink;
            return (
              <g key={e.id}
                style={{ cursor: "pointer", opacity: lit ? 1 : 0.22, transition: "opacity .15s" }}
                onMouseEnter={() => setHover(e.id)} onMouseLeave={() => setHover(null)}
                onClick={() => setFocus(e.id)}>
                {isFocus && <circle cx={p.x} cy={p.y} r={r + 6} fill="none" stroke={TT.ink} strokeWidth="1" strokeDasharray="2 3" />}
                <circle cx={p.x} cy={p.y} r={r} fill={TYPE_BG[e.type]} stroke={color} strokeWidth={isFocus ? 2 : 1.4} />
                <text x={p.x} y={p.y + r + 12} textAnchor="middle"
                  style={{ fontFamily: FF.mono, fontSize: 10.5, fill: TT.ink, fontWeight: 500 }}>
                  {e.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div style={{
          position: "absolute", left: 14, bottom: 14,
          background: "rgba(255,255,255,0.92)", border: `1px solid ${TT.borderSoft}`,
          borderRadius: 10, padding: "10px 12px",
          backdropFilter: "blur(8px)", fontFamily: FF.sans, fontSize: 11, color: TT.ink2,
          display: "grid", gap: 4,
        }}>
          <Eyebrow style={{ fontSize: 9 }}>Legend</Eyebrow>
          {["concept", "pattern", "feature", "file"].map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: 9, background: TYPE_BG[t], border: `1.4px solid ${TYPE_COLOR[t]}` }} />
              <span>{t}</span>
              <span style={{ color: TT.ink4, fontFamily: FF.mono, fontSize: 10 }}>
                · {ENT.filter((e) => e.type === t).length}
              </span>
            </div>
          ))}
        </div>

        {/* Focus detail card */}
        {focusId && (() => {
          const e = ENT.find((x) => x.id === focusId);
          if (!e) return null;
          const ns = [...neighborsOf(e.id)];
          return (
            <div style={{
              position: "absolute", right: 14, top: 14, width: 240,
              background: TT.surface, border: `1px solid ${TT.border}`, borderRadius: 12,
              padding: "12px 14px", boxShadow: TT.shadow, fontFamily: FF.sans,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: FF.mono, fontSize: 14, color: TYPE_COLOR[e.type], fontWeight: 600 }}>{e.name}</span>
                <span style={{ fontFamily: FF.mono, fontSize: 9, color: TT.ink3, letterSpacing: "0.08em", textTransform: "uppercase" }}>{e.type}</span>
              </div>
              <div style={{ fontFamily: FF.serif, fontSize: 13, lineHeight: 1.45, color: TT.ink, marginTop: 6, textWrap: "pretty" }}>{e.shortDef}</div>
              <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${TT.borderSoft}`, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3 }}>{ns.length} neighbors</span>
                <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.coral, fontWeight: 600 }}>open →</span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKETCH 2 — THE SPOTLIGHT
// Focused entity at the centre, rings of neighbours at distance 1, 2, 3.
// User can "expand" outward and "climb" by clicking any neighbour.
// ─────────────────────────────────────────────────────────────────────────────

function SketchSpotlight() {
  const W = 880, H = 460;
  const [focusId, setFocus] = React.useState("vacuum");
  const [maxHops, setMaxHops] = React.useState(2);
  const [trail, setTrail]     = React.useState(["vacuum"]);

  // BFS layers from focus.
  const layers = React.useMemo(() => {
    const seen = new Set([focusId]);
    const out = [[focusId]];
    for (let h = 0; h < maxHops; h++) {
      const next = [];
      for (const id of out[out.length - 1]) {
        for (const n of neighborsOf(id)) {
          if (!seen.has(n)) { seen.add(n); next.push(n); }
        }
      }
      if (!next.length) break;
      out.push(next);
    }
    return out;
  }, [focusId, maxHops]);

  // Positions: ring per layer.
  const cx = W / 2 - 90, cy = H / 2;
  const ringR = [0, 110, 200, 270];
  const pos = {};
  layers.forEach((layer, li) => {
    if (li === 0) { pos[layer[0]] = { x: cx, y: cy }; return; }
    layer.forEach((id, i) => {
      const startAngle = -Math.PI / 2 + (li % 2 ? 0.18 : -0.18);
      const a = startAngle + (i / layer.length) * Math.PI * 2;
      pos[id] = { x: cx + Math.cos(a) * ringR[li], y: cy + Math.sin(a) * ringR[li] };
    });
  });

  const visibleIds = new Set(layers.flat());
  const edgesInView = REL.filter((r) => visibleIds.has(r.from) && visibleIds.has(r.to));

  const focus = ENT.find((e) => e.id === focusId);

  const moveTo = (id) => {
    setFocus(id);
    setTrail((t) => (t[t.length - 1] === id ? t : [...t, id]));
  };

  return (
    <div style={{ display: "grid", gridTemplateRows: "auto 1fr", height: "100%" }}>
      {/* Top strip — breadcrumb of focused entities + ring controls */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        padding: "10px 14px", borderBottom: `1px solid ${TT.borderSoft}`, background: TT.surface2,
      }}>
        <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3, textTransform: "uppercase", letterSpacing: "0.08em" }}>trail</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {trail.map((id, i) => {
            const e = ENT.find((x) => x.id === id);
            const last = i === trail.length - 1;
            return (
              <React.Fragment key={id + i}>
                <button onClick={() => { setFocus(id); setTrail(trail.slice(0, i + 1)); }}
                  style={{ ...chip(last, TYPE_COLOR[e.type]), textTransform: "none", fontSize: 11 }}>
                  {e.name}
                </button>
                {!last && <span style={{ color: TT.ink4, fontFamily: FF.mono, fontSize: 10 }}>›</span>}
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3, textTransform: "uppercase", letterSpacing: "0.08em" }}>rings</span>
        {[1, 2, 3].map((n) => (
          <button key={n} onClick={() => setMaxHops(n)} style={chip(maxHops === n, TT.coral)}>{n}-hop</button>
        ))}
        <button style={btn()} onClick={() => setTrail([focusId])}>clear</button>
      </div>

      <div style={{ position: "relative", overflow: "hidden" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%", background: TT.surface }}>
          <ArrowMarkers />
          {/* Ring guides */}
          {[1, 2, 3].slice(0, maxHops).map((h) => (
            <circle key={h} cx={cx} cy={cy} r={ringR[h]} fill="none"
              stroke={TT.borderSoft} strokeDasharray="2 5" />
          ))}
          {/* Ring labels */}
          {[1, 2, 3].slice(0, maxHops).map((h) => (
            <text key={"rl" + h} x={cx + ringR[h]} y={cy - 6} textAnchor="middle"
              style={{ fontFamily: FF.mono, fontSize: 9, fill: TT.ink4, letterSpacing: "0.08em" }}>
              {h}-HOP
            </text>
          ))}
          {/* Edges */}
          {edgesInView.map((r, i) => {
            const a = pos[r.from], b = pos[r.to];
            if (!a || !b) return null;
            const touchesFocus = r.from === focusId || r.to === focusId;
            const st = STRENGTH[r.strength];
            return (
              <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={touchesFocus ? TT.coral : TT.ink}
                strokeOpacity={touchesFocus ? 0.85 : st.o * 0.7}
                strokeWidth={touchesFocus ? 1.8 : st.w} />
            );
          })}
          {/* Edge labels (only ring 1) */}
          {edgesInView.filter((r) => r.from === focusId || r.to === focusId).map((r, i) => {
            const a = pos[r.from], b = pos[r.to];
            if (!a || !b) return null;
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            return (
              <g key={"el" + i}>
                <rect x={mx - r.type.length * 3.2} y={my - 7} width={r.type.length * 6.4} height={13}
                  fill={TT.bg} stroke={TT.borderSoft} rx={3} />
                <text x={mx} y={my + 3} textAnchor="middle"
                  style={{ fontFamily: FF.mono, fontSize: 9, fill: TT.coralInk }}>{r.type}</text>
              </g>
            );
          })}
          {/* Nodes */}
          {layers.flatMap((layer, li) => layer.map((id) => {
            const e = ENT.find((x) => x.id === id);
            const p = pos[id]; if (!e || !p) return null;
            const isCenter = li === 0;
            const r = isCenter ? 32 : li === 1 ? 18 : 13;
            const color = TYPE_COLOR[e.type];
            return (
              <g key={id} style={{ cursor: "pointer" }} onClick={() => moveTo(id)}>
                <circle cx={p.x} cy={p.y} r={r}
                  fill={isCenter ? TT.ink : TYPE_BG[e.type]}
                  stroke={isCenter ? TT.coral : color}
                  strokeWidth={isCenter ? 2 : 1.5} />
                {isCenter ? (
                  <text x={p.x} y={p.y + 3} textAnchor="middle"
                    style={{ fontFamily: FF.mono, fontSize: 13, fill: TT.bg, fontWeight: 600 }}>{e.name}</text>
                ) : (
                  <text x={p.x} y={p.y + r + 11} textAnchor="middle"
                    style={{ fontFamily: FF.mono, fontSize: 10, fill: TT.ink, fontWeight: 500 }}>{e.name}</text>
                )}
              </g>
            );
          }))}
        </svg>

        {/* Side panel — current focus */}
        <div style={{
          position: "absolute", right: 14, top: 14, width: 220,
          background: TT.surface, border: `1px solid ${TT.borderSoft}`, borderRadius: 12,
          padding: "14px 16px", boxShadow: TT.shadow,
        }}>
          <Eyebrow color={TYPE_COLOR[focus.type]}>{focus.type} · focus</Eyebrow>
          <div style={{ fontFamily: FF.mono, fontSize: 18, color: TYPE_COLOR[focus.type], fontWeight: 600, marginTop: 4 }}>{focus.name}</div>
          <div style={{ fontFamily: FF.serif, fontSize: 13, lineHeight: 1.45, color: TT.ink, marginTop: 8, textWrap: "pretty" }}>{focus.shortDef}</div>
          <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
            <button style={{ ...btn("primary"), fontSize: 11, padding: "5px 9px", flex: 1 }}>open section →</button>
          </div>
        </div>

        <Annotation x={14} y={14}>click any node to recenter</Annotation>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKETCH 3 — THE REGIONS
// Entities clustered by their primary section. Section regions are visible as
// soft tinted bounding shapes; cross-section edges are highlighted because
// those are the conceptual "bridges" worth following.
// ─────────────────────────────────────────────────────────────────────────────

function SketchRegions() {
  const W = 880, H = 460;
  const [hoverSection, setHoverSection] = React.useState(null);
  const [focusId, setFocus] = React.useState(null);

  const { pos, regions } = React.useMemo(
    () => clusterLayout(ENT, G.sections, W, H, 70),
    []
  );

  const isDim = (sectionId) => hoverSection && hoverSection !== sectionId;

  return (
    <div style={{ display: "grid", gridTemplateRows: "auto 1fr", height: "100%" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", borderBottom: `1px solid ${TT.borderSoft}`, background: TT.surface2,
        flexWrap: "wrap",
      }}>
        <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3, textTransform: "uppercase", letterSpacing: "0.08em" }}>regions</span>
        {regions.map((reg) => {
          const acc = SECTION_ACCENT[reg.section.accent];
          const active = hoverSection === reg.id;
          return (
            <button key={reg.id}
              onMouseEnter={() => setHoverSection(reg.id)}
              onMouseLeave={() => setHoverSection(null)}
              style={{
                background: active ? acc.bg : "transparent",
                color: TT.ink, border: `1px solid ${active ? acc.ring : TT.borderSoft}`,
                borderRadius: 999, padding: "4px 10px",
                fontFamily: FF.sans, fontSize: 11.5, fontWeight: 500,
                cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
              <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3 }}>{reg.section.n}</span>
              <span>{reg.section.title}</span>
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.coral, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          ◆ cross-section edges = the bridges worth reading next
        </span>
      </div>

      <div style={{ position: "relative", overflow: "hidden" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%", background: TT.surface }}>
          {/* Section regions */}
          {regions.map((reg) => {
            const acc = SECTION_ACCENT[reg.section.accent];
            const dim = isDim(reg.id);
            return (
              <g key={reg.id} style={{ opacity: dim ? 0.2 : 1, transition: "opacity .15s" }}>
                <rect x={reg.x} y={reg.y} width={reg.w} height={reg.h}
                  rx={28} fill={acc.bg} stroke={acc.ring} strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 4" />
                <text x={reg.x + 12} y={reg.y + 18}
                  style={{ fontFamily: FF.mono, fontSize: 10, fill: acc.ink, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {reg.section.n} · {reg.section.title}
                </text>
              </g>
            );
          })}
          {/* Edges — cross-section highlighted, in-section faint */}
          {REL.map((r, i) => {
            const a = pos[r.from], b = pos[r.to];
            if (!a || !b) return null;
            const ae = ENT.find((e) => e.id === r.from);
            const be = ENT.find((e) => e.id === r.to);
            const cross = ae.primarySection !== be.primarySection;
            const dim =
              hoverSection &&
              ae.primarySection !== hoverSection &&
              be.primarySection !== hoverSection;
            return (
              <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={cross ? TT.coral : TT.ink}
                strokeOpacity={dim ? 0.06 : (cross ? 0.7 : 0.15)}
                strokeWidth={cross ? 1.6 : 1}
                strokeDasharray={cross ? "0" : "2 3"} />
            );
          })}
          {/* Nodes */}
          {ENT.map((e) => {
            const p = pos[e.id]; if (!p) return null;
            const r = 7 + Math.sqrt(DEGREE[e.id] || 1) * 1.6;
            const color = TYPE_COLOR[e.type];
            const dim = hoverSection && e.primarySection !== hoverSection;
            const isFocus = e.id === focusId;
            return (
              <g key={e.id}
                style={{ cursor: "pointer", opacity: dim ? 0.18 : 1, transition: "opacity .15s" }}
                onClick={() => setFocus(e.id)}>
                {isFocus && <circle cx={p.x} cy={p.y} r={r + 5} fill="none" stroke={TT.ink} strokeWidth="1" />}
                <circle cx={p.x} cy={p.y} r={r} fill={TT.surface} stroke={color} strokeWidth="1.5" />
                <text x={p.x} y={p.y + r + 11} textAnchor="middle"
                  style={{ fontFamily: FF.mono, fontSize: 9.5, fill: TT.ink, fontWeight: 500 }}>
                  {e.name}
                </text>
              </g>
            );
          })}
        </svg>

        <Annotation x={14} y={14}>hover a region to isolate its sub-graph</Annotation>
      </div>
    </div>
  );
}

Object.assign(window, { SketchAtlas, SketchSpotlight, SketchRegions });

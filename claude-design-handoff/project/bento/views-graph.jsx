// Graph view — Atlas (default) / Spotlight / Regions.
//
// Props:
//   mode        — "atlas" | "spotlight" | "regions"
//   focusId     — optional entity id to spotlight on entry
//   onMode      — switch the *app* mode (orient / guided / etc.)
//   onGraphMode — switch the graph's internal layout mode
//   onSection   — open a section in guided view
//   onOpenEntity — open an entity in reference view

// Helpers local to graph rendering.
const TYPE_BG = {
  concept: TT.coralBg,
  pattern: TT.coralSoft,
  feature: TT.sageBg,
  file:    TT.butterBg,
};
const STRENGTH = {
  strong: { w: 1.75, o: 0.78 },
  medium: { w: 1.25, o: 0.50 },
  weak:   { w: 0.9,  o: 0.28 },
};
const SECTION_REGION_TINT = {
  Concept:     { ink: TT.coralInk,  bg: TT.coralBg,  ring: TT.coral  },
  Mechanism:   { ink: TT.sageInk,   bg: TT.sageBg,   ring: TT.sage   },
  Maintenance: { ink: TT.butterInk, bg: TT.butterBg, ring: TT.butter },
  Contract:    { ink: TT.sageInk,   bg: TT.sageBg,   ring: TT.sage   },
  Advanced:    { ink: TT.coralInk,  bg: TT.coralBg,  ring: TT.coral  },
};

function GraphView({ mode, focusId, onMode, onGraphMode, onSection, onOpenEntity, onGraphFocus }) {
  const B = window.B;
  const activeMode = mode || "atlas";

  // Default focus only matters for spotlight; pick a hub if nothing set.
  const effectiveFocus = focusId || pickDefaultFocus();

  return (
    <main className="view-enter" style={{
      flex: 1, overflow: "auto", minWidth: 0, height: "calc(100vh - 60px)",
      padding: "28px 40px 96px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: 22 }}>
          <div>
            <h1 style={{
              fontFamily: FF.serif, fontWeight: 500, fontSize: 44, lineHeight: 1.05,
              letterSpacing: "-0.022em", margin: 0, textWrap: "balance",
            }}>Knowledge graph</h1>
            <p style={{
              fontFamily: FF.serif, fontSize: 17, lineHeight: 1.5, color: TT.ink2,
              margin: "8px 0 0", maxWidth: 720, textWrap: "pretty",
            }}>
              Every entity in the report and every typed relationship between them.
              Switch layouts to see the same data through three different lenses.
            </p>
          </div>
          <ModeSwitcher activeMode={activeMode} onGraphMode={onGraphMode} />
        </div>

        {/* Active canvas */}
        {activeMode === "atlas" && (
          <AtlasMode
            focusId={effectiveFocus}
            onGraphFocus={onGraphFocus}
            onOpenEntity={onOpenEntity}
            onSection={onSection}
          />
        )}
        {activeMode === "spotlight" && (
          <SpotlightMode
            focusId={effectiveFocus}
            onGraphFocus={onGraphFocus}
            onOpenEntity={onOpenEntity}
            onSection={onSection}
          />
        )}
        {activeMode === "regions" && (
          <RegionsMode
            focusId={effectiveFocus}
            onGraphFocus={onGraphFocus}
            onOpenEntity={onOpenEntity}
            onSection={onSection}
          />
        )}
      </div>
    </main>
  );
}

function pickDefaultFocus() {
  // Highest-degree entity makes a sensible cold-start focus.
  const d = GraphLayout.degreeMap(window.B.entities, window.B.relationships);
  let best = window.B.entities[0]?.id, bestN = -1;
  for (const id of Object.keys(d)) if (d[id] > bestN) { bestN = d[id]; best = id; }
  return best;
}

function ModeSwitcher({ activeMode, onGraphMode }) {
  const tabs = [
    { id: "atlas",     label: "Atlas",     hint: "full graph"  },
    { id: "spotlight", label: "Spotlight", hint: "neighborhood"},
    { id: "regions",   label: "Regions",   hint: "by section"  },
  ];
  return (
    <div style={{
      display: "flex", gap: 4, padding: 4,
      background: TT.surface, borderRadius: 12, border: `1px solid ${TT.borderSoft}`,
    }}>
      {tabs.map((t) => {
        const active = t.id === activeMode;
        return (
          <button key={t.id} onClick={() => onGraphMode(t.id)}
            style={{
              background: active ? TT.ink : "transparent",
              color: active ? TT.bg : TT.ink2,
              border: "none", cursor: "pointer", borderRadius: 8,
              padding: "8px 14px",
              fontFamily: FF.sans, fontSize: 13, fontWeight: active ? 700 : 600,
              display: "flex", flexDirection: "column", gap: 1, alignItems: "flex-start",
              transition: "background .12s, color .12s",
            }}>
            <span>{t.label}</span>
            <span style={{
              fontFamily: FF.mono, fontSize: 9, letterSpacing: "0.06em",
              color: active ? TT.coral : TT.ink4, textTransform: "uppercase", fontWeight: 600,
            }}>{t.hint}</span>
          </button>
        );
      })}
    </div>
  );
}

// SVG defs shared across modes.
function ArrowMarkers() {
  return (
    <defs>
      <marker id="kg-arr-ink"   markerWidth="6" markerHeight="6" refX="5.5" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L6,3 z" fill={TT.ink} />
      </marker>
      <marker id="kg-arr-coral" markerWidth="6" markerHeight="6" refX="5.5" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L6,3 z" fill={TT.coral} />
      </marker>
    </defs>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ATLAS
// ─────────────────────────────────────────────────────────────────────────────

function AtlasMode({ focusId, onGraphFocus, onOpenEntity, onSection }) {
  const B = window.B;
  const W = 1000, H = 580;
  const [hoverId, setHover] = React.useState(null);
  const [activeTypes, setTypes] = React.useState({ concept: true, pattern: true, feature: true, file: true });
  const [minStrength, setMin] = React.useState("weak");
  const [search, setSearch] = React.useState("");

  const degree = React.useMemo(() => GraphLayout.degreeMap(B.entities, B.relationships), [B]);
  const pos = React.useMemo(
    () => GraphLayout.forceLayout(B.entities, B.relationships, W, H, { seed: 19, iters: 320 }),
    [B]
  );

  const strengthRank = { weak: 0, medium: 1, strong: 2 };
  const visibleIds = React.useMemo(() => {
    return new Set(B.entities.filter((e) => {
      if (!activeTypes[e.type]) return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).map((e) => e.id));
  }, [B, activeTypes, search]);
  const visibleEdges = B.relationships.filter((r) =>
    strengthRank[r.strength || "weak"] >= strengthRank[minStrength] &&
    visibleIds.has(r.from) && visibleIds.has(r.to)
  );

  const highlight = hoverId || focusId;
  const highlightNbrs = highlight ? GraphLayout.neighborsOf(B.relationships, highlight) : null;
  const isLit = (id) =>
    !highlight ? true : (id === highlight || (highlightNbrs && highlightNbrs.has(id)));

  return (
    <div style={{
      background: TT.surface, border: `1px solid ${TT.borderSoft}`, borderRadius: 16,
      overflow: "hidden", boxShadow: TT.shadow,
    }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        padding: "12px 16px", borderBottom: `1px solid ${TT.borderSoft}`,
        background: TT.surface2,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: TT.surface, border: `1px solid ${TT.borderSoft}`,
          borderRadius: 8, padding: "5px 10px", width: 200,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={TT.ink2} strokeWidth="1.6" strokeLinecap="round">
            <circle cx="5" cy="5" r="3" /><path d="M7.5 7.5L10 10" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search entities…"
            style={{
              border: "none", outline: "none", background: "transparent",
              fontFamily: FF.sans, fontSize: 12, color: TT.ink, flex: 1, minWidth: 0,
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: TT.ink3, fontSize: 14, padding: 0, lineHeight: 1,
            }}>×</button>
          )}
        </div>
        <span style={{ width: 1, height: 18, background: TT.borderSoft }} />
        {["concept", "pattern", "feature", "file"].map((t) => (
          <button key={t} onClick={() => setTypes((s) => ({ ...s, [t]: !s[t] }))}
            style={kgChip(activeTypes[t], ENTITY_TYPE_COLOR[t])}>{t}</button>
        ))}
        <span style={{ width: 1, height: 18, background: TT.borderSoft }} />
        <span style={kgGroupLabel}>edges</span>
        {["weak", "medium", "strong"].map((s) => (
          <button key={s} onClick={() => setMin(s)} style={kgChip(minStrength === s, TT.ink)}>{s}+</button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3 }}>
          {visibleIds.size}/{B.entities.length} entities · {visibleEdges.length}/{B.relationships.length} edges
        </span>
      </div>

      {/* Canvas */}
      <div style={{ position: "relative" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", background: TT.surface }}>
          <ArrowMarkers />
          {visibleEdges.map((r, i) => {
            const a = pos[r.from], b = pos[r.to]; if (!a || !b) return null;
            const lit = !highlight || r.from === highlight || r.to === highlight;
            const st = STRENGTH[r.strength || "weak"];
            return (
              <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={TT.ink}
                strokeOpacity={lit ? st.o : 0.06}
                strokeWidth={st.w}
              />
            );
          })}
          {/* Edge labels on hover/focus */}
          {highlight && visibleEdges.filter((r) => r.from === highlight || r.to === highlight).map((r, i) => {
            const a = pos[r.from], b = pos[r.to]; if (!a || !b) return null;
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            return (
              <g key={"el" + i}>
                <rect x={mx - r.type.length * 3.6} y={my - 8} width={r.type.length * 7.2} height={15}
                  fill={TT.bg} stroke={TT.borderSoft} rx={3} />
                <text x={mx} y={my + 3} textAnchor="middle"
                  style={{ fontFamily: FF.mono, fontSize: 10, fill: TT.ink2 }}>{r.type}</text>
              </g>
            );
          })}
          {B.entities.map((e) => {
            if (!visibleIds.has(e.id)) return null;
            const p = pos[e.id]; if (!p) return null;
            const r = 8 + Math.sqrt(degree[e.id] || 1) * 2.4;
            const lit = isLit(e.id);
            const isFocus = e.id === focusId;
            const color = ENTITY_TYPE_COLOR[e.type] || TT.ink;
            return (
              <g key={e.id}
                style={{ cursor: "pointer", opacity: lit ? 1 : 0.22, transition: "opacity .15s" }}
                onMouseEnter={() => setHover(e.id)} onMouseLeave={() => setHover(null)}
                onClick={() => onGraphFocus(e.id)}>
                {isFocus && (
                  <circle cx={p.x} cy={p.y} r={r + 7} fill="none" stroke={TT.ink} strokeWidth="1" strokeDasharray="2 3" />
                )}
                <circle cx={p.x} cy={p.y} r={r}
                  fill={TYPE_BG[e.type]} stroke={color} strokeWidth={isFocus ? 2 : 1.4} />
                <text x={p.x} y={p.y + r + 13} textAnchor="middle"
                  style={{ fontFamily: FF.mono, fontSize: 11, fill: TT.ink, fontWeight: 500 }}>
                  {e.name}
                </text>
              </g>
            );
          })}
        </svg>

        <Legend />
        {focusId && (
          <FocusCard
            entity={B.entities.find((x) => x.id === focusId)}
            onOpenEntity={onOpenEntity}
            onSection={onSection}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPOTLIGHT
// ─────────────────────────────────────────────────────────────────────────────

function SpotlightMode({ focusId, onGraphFocus, onOpenEntity, onSection }) {
  const B = window.B;
  const W = 880, H = 580;
  const [maxHops, setMaxHops] = React.useState(2);
  const [trail, setTrail] = React.useState(() => focusId ? [focusId] : []);

  // Sync trail when focusId changes (e.g. switched modes with an active focus).
  React.useEffect(() => {
    if (focusId && trail[trail.length - 1] !== focusId) {
      setTrail((t) => (t.includes(focusId) ? t : [...t, focusId]));
    }
  }, [focusId]);

  // BFS layers.
  const layers = React.useMemo(() => {
    const seen = new Set([focusId]);
    const out = [[focusId]];
    for (let h = 0; h < maxHops; h++) {
      const next = [];
      for (const id of out[out.length - 1]) {
        for (const n of GraphLayout.neighborsOf(B.relationships, id)) {
          if (!seen.has(n)) { seen.add(n); next.push(n); }
        }
      }
      if (!next.length) break;
      out.push(next);
    }
    return out;
  }, [focusId, maxHops, B.relationships]);

  const cx = W / 2 - 40, cy = H / 2;
  const ringR = [0, 130, 230, 310];
  const pos = {};
  layers.forEach((layer, li) => {
    if (li === 0) { pos[layer[0]] = { x: cx, y: cy }; return; }
    layer.forEach((id, i) => {
      const offset = (li % 2) ? 0.18 : -0.18;
      const a = -Math.PI / 2 + offset + (i / layer.length) * Math.PI * 2;
      pos[id] = { x: cx + Math.cos(a) * ringR[li], y: cy + Math.sin(a) * ringR[li] };
    });
  });

  const visibleIds = new Set(layers.flat());
  const edgesInView = B.relationships.filter((r) => visibleIds.has(r.from) && visibleIds.has(r.to));
  const focus = B.entities.find((e) => e.id === focusId);
  const primarySection = focus ? B.sections.find((s) => s.id === focus.primarySection) : null;

  const moveTo = (id) => {
    onGraphFocus(id);
    setTrail((t) => (t[t.length - 1] === id ? t : [...t, id]));
  };

  return (
    <div style={{
      background: TT.surface, border: `1px solid ${TT.borderSoft}`, borderRadius: 16,
      overflow: "hidden", boxShadow: TT.shadow,
    }}>
      {/* Top strip */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        padding: "12px 16px", borderBottom: `1px solid ${TT.borderSoft}`, background: TT.surface2,
      }}>
        <span style={kgGroupLabel}>trail</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {trail.map((id, i) => {
            const e = B.entities.find((x) => x.id === id);
            if (!e) return null;
            const last = i === trail.length - 1;
            return (
              <React.Fragment key={id + i}>
                <button onClick={() => {
                  onGraphFocus(id);
                  setTrail(trail.slice(0, i + 1));
                }}
                  style={{ ...kgChip(last, ENTITY_TYPE_COLOR[e.type]), textTransform: "none", fontSize: 11 }}>
                  {e.name}
                </button>
                {!last && <span style={{ color: TT.ink4, fontFamily: FF.mono, fontSize: 11 }}>›</span>}
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ flex: 1 }} />
        <span style={kgGroupLabel}>rings</span>
        {[1, 2, 3].map((n) => (
          <button key={n} onClick={() => setMaxHops(n)} style={kgChip(maxHops === n, TT.coral)}>{n}-hop</button>
        ))}
      </div>

      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 280px" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", background: TT.surface }}>
          <ArrowMarkers />
          {[1, 2, 3].slice(0, maxHops).map((h) => (
            <circle key={h} cx={cx} cy={cy} r={ringR[h]} fill="none"
              stroke={TT.borderSoft} strokeDasharray="2 5" />
          ))}
          {[1, 2, 3].slice(0, maxHops).map((h) => (
            <text key={"rl" + h} x={cx + ringR[h]} y={cy - 6} textAnchor="middle"
              style={{ fontFamily: FF.mono, fontSize: 9, fill: TT.ink4, letterSpacing: "0.08em" }}>
              {h}-HOP
            </text>
          ))}
          {edgesInView.map((r, i) => {
            const a = pos[r.from], b = pos[r.to]; if (!a || !b) return null;
            const touchesFocus = r.from === focusId || r.to === focusId;
            const st = STRENGTH[r.strength || "weak"];
            return (
              <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={touchesFocus ? TT.coral : TT.ink}
                strokeOpacity={touchesFocus ? 0.85 : st.o * 0.6}
                strokeWidth={touchesFocus ? 1.8 : st.w} />
            );
          })}
          {/* Edge labels on ring 1 */}
          {edgesInView.filter((r) => r.from === focusId || r.to === focusId).map((r, i) => {
            const a = pos[r.from], b = pos[r.to]; if (!a || !b) return null;
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            return (
              <g key={"el" + i}>
                <rect x={mx - r.type.length * 3.4} y={my - 7} width={r.type.length * 6.8} height={14}
                  fill={TT.bg} stroke={TT.borderSoft} rx={3} />
                <text x={mx} y={my + 3} textAnchor="middle"
                  style={{ fontFamily: FF.mono, fontSize: 9.5, fill: TT.coralInk }}>{r.type}</text>
              </g>
            );
          })}
          {layers.flatMap((layer, li) => layer.map((id) => {
            const e = B.entities.find((x) => x.id === id);
            const p = pos[id]; if (!e || !p) return null;
            const isCenter = li === 0;
            const r = isCenter ? 36 : li === 1 ? 20 : 14;
            const color = ENTITY_TYPE_COLOR[e.type];
            return (
              <g key={id} style={{ cursor: "pointer" }} onClick={() => moveTo(id)}>
                <circle cx={p.x} cy={p.y} r={r}
                  fill={isCenter ? TT.ink : TYPE_BG[e.type]}
                  stroke={isCenter ? TT.coral : color}
                  strokeWidth={isCenter ? 2 : 1.5} />
                {isCenter ? (
                  <text x={p.x} y={p.y + 4} textAnchor="middle"
                    style={{ fontFamily: FF.mono, fontSize: 14, fill: TT.bg, fontWeight: 600 }}>{e.name}</text>
                ) : (
                  <text x={p.x} y={p.y + r + 12} textAnchor="middle"
                    style={{ fontFamily: FF.mono, fontSize: 11, fill: TT.ink, fontWeight: 500 }}>{e.name}</text>
                )}
              </g>
            );
          }))}
        </svg>

        {/* Side panel */}
        <aside style={{
          padding: "18px 20px", borderLeft: `1px solid ${TT.borderSoft}`,
          background: TT.surface2, fontFamily: FF.sans, display: "flex", flexDirection: "column", gap: 12,
        }}>
          {focus && (
            <>
              <div>
                <Eyebrow color={ENTITY_TYPE_COLOR[focus.type]}>{focus.type} · focus</Eyebrow>
                <div style={{ fontFamily: FF.mono, fontSize: 20, color: ENTITY_TYPE_COLOR[focus.type], fontWeight: 600, marginTop: 4 }}>{focus.name}</div>
                <div style={{ fontFamily: FF.serif, fontSize: 14, lineHeight: 1.5, color: TT.ink, marginTop: 8, textWrap: "pretty" }}>{focus.shortDef}</div>
              </div>
              <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
                {primarySection && (
                  <button onClick={() => onSection(primarySection.id)} style={{
                    background: TT.ink, color: TT.bg, border: "none",
                    padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                    fontFamily: FF.sans, fontSize: 12, fontWeight: 700,
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
                  }}>
                    <span>open §{primarySection.n} · {primarySection.title}</span>
                    <span>→</span>
                  </button>
                )}
                <button onClick={() => onOpenEntity(focus.id)} style={{
                  background: TT.surface, color: TT.ink2, border: `1px solid ${TT.borderSoft}`,
                  padding: "7px 12px", borderRadius: 8, cursor: "pointer",
                  fontFamily: FF.sans, fontSize: 12, fontWeight: 600,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span>open in reference</span><span>→</span>
                </button>
              </div>
              <div style={{ marginTop: 6, paddingTop: 12, borderTop: `1px solid ${TT.borderSoft}` }}>
                <Eyebrow>This neighborhood</Eyebrow>
                <div style={{ marginTop: 6, fontFamily: FF.mono, fontSize: 11.5, color: TT.ink2, lineHeight: 1.5 }}>
                  {layers.flat().length} entities · {edgesInView.length} edges across {maxHops} hop{maxHops > 1 ? "s" : ""}
                </div>
              </div>
            </>
          )}
        </aside>

        <div style={{
          position: "absolute", left: 16, top: 14,
          fontFamily: FF.mono, fontSize: 10, color: TT.ink3, letterSpacing: "0.08em",
          textTransform: "uppercase", background: "rgba(244,242,236,0.85)",
          padding: "2px 6px", borderRadius: 4, pointerEvents: "none",
        }}>click any node to recenter</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REGIONS
// ─────────────────────────────────────────────────────────────────────────────

function RegionsMode({ focusId, onGraphFocus, onOpenEntity, onSection }) {
  const B = window.B;
  const W = 1100, H = 600;
  const [hoverSection, setHoverSection] = React.useState(null);

  const { pos, regions } = React.useMemo(
    () => GraphLayout.clusterLayout(B.entities, B.sections, W, H, { pad: 80, padTop: 70 }),
    [B]
  );
  const degree = React.useMemo(() => GraphLayout.degreeMap(B.entities, B.relationships), [B]);

  const isDim = (sectionId) => hoverSection && hoverSection !== sectionId;
  const crossSectionCount = B.relationships.filter((r) => {
    const a = B.entities.find((e) => e.id === r.from);
    const b = B.entities.find((e) => e.id === r.to);
    return a && b && a.primarySection !== b.primarySection;
  }).length;

  return (
    <div style={{
      background: TT.surface, border: `1px solid ${TT.borderSoft}`, borderRadius: 16,
      overflow: "hidden", boxShadow: TT.shadow,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        padding: "12px 16px", borderBottom: `1px solid ${TT.borderSoft}`, background: TT.surface2,
      }}>
        <span style={kgGroupLabel}>regions</span>
        {regions.map((reg) => {
          const tint = SECTION_REGION_TINT[reg.section.kind] || SECTION_REGION_TINT.Mechanism;
          const active = hoverSection === reg.id;
          return (
            <button key={reg.id}
              onMouseEnter={() => setHoverSection(reg.id)}
              onMouseLeave={() => setHoverSection(null)}
              onClick={() => onSection(reg.section.id)}
              style={{
                background: active ? tint.bg : "transparent",
                color: TT.ink, border: `1px solid ${active ? tint.ring : TT.borderSoft}`,
                borderRadius: 999, padding: "4px 10px",
                fontFamily: FF.sans, fontSize: 11.5, fontWeight: 500, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
              <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3 }}>{reg.section.n}</span>
              <span>{reg.section.title}</span>
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.coral, letterSpacing: "0.06em" }}>
          ◆ {crossSectionCount} cross-section edges
        </span>
      </div>

      <div style={{ position: "relative" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", background: TT.surface }}>
          {regions.map((reg) => {
            const tint = SECTION_REGION_TINT[reg.section.kind] || SECTION_REGION_TINT.Mechanism;
            const dim = isDim(reg.id);
            return (
              <g key={reg.id} style={{ opacity: dim ? 0.2 : 1, transition: "opacity .15s" }}>
                <rect x={reg.x} y={reg.y} width={reg.w} height={reg.h}
                  rx={32} fill={tint.bg} stroke={tint.ring}
                  strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 4" />
                <text x={reg.x + 14} y={reg.y + 20}
                  style={{ fontFamily: FF.mono, fontSize: 10.5, fill: tint.ink, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {reg.section.n} · {reg.section.title}
                </text>
              </g>
            );
          })}
          {B.relationships.map((r, i) => {
            const a = pos[r.from], b = pos[r.to]; if (!a || !b) return null;
            const ae = B.entities.find((e) => e.id === r.from);
            const be = B.entities.find((e) => e.id === r.to);
            const cross = ae.primarySection !== be.primarySection;
            const dim = hoverSection && ae.primarySection !== hoverSection && be.primarySection !== hoverSection;
            return (
              <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={cross ? TT.coral : TT.ink}
                strokeOpacity={dim ? 0.05 : (cross ? 0.7 : 0.18)}
                strokeWidth={cross ? 1.6 : 1}
                strokeDasharray={cross ? "0" : "2 3"} />
            );
          })}
          {B.entities.map((e) => {
            const p = pos[e.id]; if (!p) return null;
            const r = 7 + Math.sqrt(degree[e.id] || 1) * 1.8;
            const color = ENTITY_TYPE_COLOR[e.type];
            const dim = hoverSection && e.primarySection !== hoverSection;
            const isFocus = e.id === focusId;
            return (
              <g key={e.id}
                style={{ cursor: "pointer", opacity: dim ? 0.18 : 1, transition: "opacity .15s" }}
                onClick={() => onGraphFocus(e.id)}>
                {isFocus && <circle cx={p.x} cy={p.y} r={r + 6} fill="none" stroke={TT.ink} strokeWidth="1" strokeDasharray="2 3" />}
                <circle cx={p.x} cy={p.y} r={r} fill={TT.surface} stroke={color} strokeWidth="1.5" />
                <text x={p.x} y={p.y + r + 12} textAnchor="middle"
                  style={{ fontFamily: FF.mono, fontSize: 10, fill: TT.ink, fontWeight: 500 }}>
                  {e.name}
                </text>
              </g>
            );
          })}
        </svg>
        {focusId && (
          <FocusCard
            entity={B.entities.find((x) => x.id === focusId)}
            onOpenEntity={onOpenEntity}
            onSection={onSection}
          />
        )}
        <div style={{
          position: "absolute", left: 16, top: 14,
          fontFamily: FF.mono, fontSize: 10, color: TT.ink3, letterSpacing: "0.08em",
          textTransform: "uppercase", background: "rgba(244,242,236,0.85)",
          padding: "2px 6px", borderRadius: 4, pointerEvents: "none",
        }}>hover a region chip to isolate · click to read</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared bits — Legend, FocusCard, chip style.
// ─────────────────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div style={{
      position: "absolute", left: 14, bottom: 14,
      background: "rgba(255,255,255,0.92)", border: `1px solid ${TT.borderSoft}`,
      borderRadius: 10, padding: "10px 12px", backdropFilter: "blur(8px)",
      fontFamily: FF.sans, fontSize: 11, color: TT.ink2, display: "grid", gap: 4,
    }}>
      <span style={{
        fontFamily: FF.mono, fontSize: 9, color: TT.ink3,
        letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600,
      }}>Legend</span>
      {["concept", "pattern", "feature", "file"].map((t) => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 10, height: 10, borderRadius: 10,
            background: TYPE_BG[t], border: `1.4px solid ${ENTITY_TYPE_COLOR[t]}`,
          }} />
          <span>{t}</span>
          <span style={{ color: TT.ink4, fontFamily: FF.mono, fontSize: 10 }}>
            · {window.B.entities.filter((e) => e.type === t).length}
          </span>
        </div>
      ))}
    </div>
  );
}

function FocusCard({ entity, onOpenEntity, onSection }) {
  if (!entity) return null;
  const sec = window.B.sections.find((s) => s.id === entity.primarySection);
  const ns = [...GraphLayout.neighborsOf(window.B.relationships, entity.id)];
  return (
    <div style={{
      position: "absolute", right: 16, top: 16, width: 260,
      background: TT.surface, border: `1px solid ${TT.border}`, borderRadius: 12,
      padding: "14px 16px", boxShadow: TT.shadowHi, fontFamily: FF.sans,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: FF.mono, fontSize: 15, color: ENTITY_TYPE_COLOR[entity.type], fontWeight: 600 }}>{entity.name}</span>
        <span style={{ fontFamily: FF.mono, fontSize: 9, color: TT.ink3, letterSpacing: "0.08em", textTransform: "uppercase" }}>{entity.type}</span>
      </div>
      <div style={{ fontFamily: FF.serif, fontSize: 13.5, lineHeight: 1.45, color: TT.ink, marginTop: 8, textWrap: "pretty" }}>{entity.shortDef}</div>
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${TT.borderSoft}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3 }}>{ns.length} neighbors</span>
        <div style={{ display: "flex", gap: 6 }}>
          {sec && (
            <button onClick={() => onSection(sec.id)} style={{
              background: "transparent", border: `1px solid ${TT.borderHi}`, color: TT.ink2,
              borderRadius: 6, padding: "3px 8px", cursor: "pointer",
              fontFamily: FF.sans, fontSize: 11, fontWeight: 600,
            }}>§ {sec.n}</button>
          )}
          <button onClick={() => onOpenEntity(entity.id)} style={{
            background: TT.ink, color: TT.bg, border: "none",
            borderRadius: 6, padding: "3px 8px", cursor: "pointer",
            fontFamily: FF.sans, fontSize: 11, fontWeight: 600,
          }}>reference →</button>
        </div>
      </div>
    </div>
  );
}

const kgChip = (active, color) => ({
  background: active ? (color || TT.ink) : "transparent",
  color: active ? TT.bg : TT.ink2,
  border: `1px solid ${active ? (color || TT.ink) : TT.borderSoft}`,
  borderRadius: 999, padding: "4px 10px",
  fontFamily: FF.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em",
  cursor: "pointer", textTransform: "lowercase",
});

const kgGroupLabel = {
  fontFamily: FF.mono, fontSize: 10, color: TT.ink3,
  letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600,
};

Object.assign(window, { GraphView });

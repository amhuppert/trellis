// Sketches 4 & 5 — the more specialized layouts.

// ─────────────────────────────────────────────────────────────────────────────
// SKETCH 4 — THE MATRIX
// Entities × entities adjacency grid. Cells are colored by relationship type
// and weighted by strength. Rows / cols grouped by entity type. Great for
// spotting hubs, clusters, and gaps that are invisible in a node-link view.
// ─────────────────────────────────────────────────────────────────────────────

function SketchMatrix() {
  const [hoverCell, setHoverCell] = React.useState(null);

  // Order entities by type, then by degree (descending), so hubs sit at the
  // top-left of each type block.
  const ordered = React.useMemo(() => {
    const typeOrder = ["concept", "pattern", "feature", "file"];
    return [...ENT].sort((a, b) => {
      const ta = typeOrder.indexOf(a.type);
      const tb = typeOrder.indexOf(b.type);
      if (ta !== tb) return ta - tb;
      return (DEGREE[b.id] || 0) - (DEGREE[a.id] || 0);
    });
  }, []);

  const N = ordered.length;
  const cell = 22;
  const headW = 130;
  const headH = 130;

  const edgeMap = React.useMemo(() => {
    const m = {};
    for (const r of REL) {
      m[r.from + "|" + r.to] = r;
    }
    return m;
  }, []);

  const get = (a, b) => edgeMap[a + "|" + b] || edgeMap[b + "|" + a];

  // Color edges by strength (mono ramp on ink for clarity).
  const cellColor = (r) => {
    if (!r) return null;
    const o = STRENGTH[r.strength].o;
    return `rgba(22,32,26,${0.18 + o * 0.55})`;
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", height: "100%" }}>
      <div style={{ overflow: "auto", padding: "18px 14px 18px 18px" }}>
        <div style={{ display: "inline-block", position: "relative" }}>
          <svg width={headW + cell * N + 16} height={headH + cell * N + 16}>
            {/* Column headers */}
            {ordered.map((e, ci) => {
              const x = headW + ci * cell + cell / 2;
              return (
                <g key={"ch" + e.id} transform={`translate(${x},${headH - 6}) rotate(-55)`}>
                  <text style={{
                    fontFamily: FF.mono, fontSize: 10,
                    fill: TYPE_COLOR[e.type], fontWeight: 500,
                  }}>{e.name}</text>
                </g>
              );
            })}
            {/* Row headers */}
            {ordered.map((e, ri) => {
              const y = headH + ri * cell + cell / 2 + 3;
              return (
                <text key={"rh" + e.id} x={headW - 8} y={y} textAnchor="end"
                  style={{
                    fontFamily: FF.mono, fontSize: 10,
                    fill: TYPE_COLOR[e.type], fontWeight: 500,
                  }}>{e.name}</text>
              );
            })}
            {/* Type-block separators */}
            {(() => {
              const lines = [];
              let prev = null;
              ordered.forEach((e, i) => {
                if (prev && e.type !== prev) {
                  const p = headH + i * cell - 0.5;
                  lines.push(<line key={"hl" + i} x1={headW} y1={p} x2={headW + N * cell} y2={p} stroke={TT.borderHi} strokeWidth="1" />);
                  lines.push(<line key={"vl" + i} y1={headH} x1={headW + i * cell - 0.5} y2={headH + N * cell} x2={headW + i * cell - 0.5} stroke={TT.borderHi} strokeWidth="1" />);
                }
                prev = e.type;
              });
              return lines;
            })()}
            {/* Diagonal stripe (self cells) */}
            {ordered.map((e, i) => (
              <rect key={"d" + e.id}
                x={headW + i * cell} y={headH + i * cell} width={cell} height={cell}
                fill={TT.surface3} />
            ))}
            {/* Cells */}
            {ordered.flatMap((row, ri) =>
              ordered.map((col, ci) => {
                if (ri === ci) return null;
                const r = get(row.id, col.id);
                if (!r) return null;
                const x = headW + ci * cell;
                const y = headH + ri * cell;
                const directed = r.from === row.id;
                const c = cellColor(r);
                const isHover = hoverCell && hoverCell.r === ri && hoverCell.c === ci;
                return (
                  <g key={ri + "-" + ci}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoverCell({ r: ri, c: ci, edge: r, row, col })}
                    onMouseLeave={() => setHoverCell(null)}>
                    <rect x={x + 2} y={y + 2} width={cell - 4} height={cell - 4}
                      rx={3} fill={c} />
                    {/* Directional arrow tick — top-left = outgoing, bottom-right = incoming */}
                    {directed && (
                      <path d={`M ${x + cell - 6} ${y + 5} l 0 -2 l 3 1.5 l -3 1.5 z`} fill={TT.bg} />
                    )}
                    {isHover && (
                      <rect x={x + 0.5} y={y + 0.5} width={cell - 1} height={cell - 1}
                        rx={3} fill="none" stroke={TT.coral} strokeWidth="1.5" />
                    )}
                  </g>
                );
              })
            )}
          </svg>
        </div>
      </div>

      {/* Side: legend + tooltip on hover */}
      <aside style={{
        borderLeft: `1px solid ${TT.borderSoft}`, padding: "18px 18px",
        fontFamily: FF.sans, fontSize: 12.5, color: TT.ink2,
        background: TT.surface2, display: "flex", flexDirection: "column", gap: 14,
      }}>
        <div>
          <Eyebrow>Reading the matrix</Eyebrow>
          <p style={{ margin: "8px 0 0", fontFamily: FF.serif, fontSize: 13.5, lineHeight: 1.5, color: TT.ink, textWrap: "pretty" }}>
            Row → column. Darker = stronger. Type blocks separated by hairlines. Empty rows are leaves; full rows are hubs.
          </p>
        </div>

        <div>
          <Eyebrow>Strength</Eyebrow>
          <div style={{ marginTop: 8, display: "grid", gap: 5 }}>
            {["strong", "medium", "weak"].map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FF.mono, fontSize: 11 }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, background: `rgba(22,32,26,${0.18 + STRENGTH[s].o * 0.55})` }} />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {hoverCell ? (
          <div style={{
            background: TT.surface, border: `1px solid ${TT.border}`, borderRadius: 10,
            padding: "10px 12px",
          }}>
            <Eyebrow color={TT.coral}>{hoverCell.edge.type}</Eyebrow>
            <div style={{ display: "grid", gap: 4, marginTop: 6, fontFamily: FF.mono, fontSize: 11.5 }}>
              <span style={{ color: TYPE_COLOR[hoverCell.row.type], fontWeight: 600 }}>{hoverCell.row.name}</span>
              <span style={{ color: TT.ink4 }}>↓ {hoverCell.edge.type}</span>
              <span style={{ color: TYPE_COLOR[hoverCell.col.type], fontWeight: 600 }}>{hoverCell.col.name}</span>
            </div>
            <div style={{
              marginTop: 8, paddingTop: 6, borderTop: `1px solid ${TT.borderSoft}`,
              fontFamily: FF.mono, fontSize: 10, color: TT.ink3,
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>strength · {hoverCell.edge.strength}</div>
          </div>
        ) : (
          <div style={{
            border: `1px dashed ${TT.borderHi}`, borderRadius: 10,
            padding: "10px 12px", fontFamily: FF.serif, fontSize: 13, color: TT.ink3,
            textWrap: "pretty",
          }}>
            Hover any cell. <em>VACUUM</em>'s row, for instance, is dense — it touches xmin, ctid, freezing and the visibility map. The matrix makes hubs literal.
          </div>
        )}
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKETCH 5 — THE PATH
// "How does X connect to Y?" — pick two entities, render the shortest
// undirected path with intermediates. Designed for the question "where do
// these two concepts meet?"
// ─────────────────────────────────────────────────────────────────────────────

function SketchPath() {
  const [from, setFrom] = React.useState("hot-update");
  const [to,   setTo]   = React.useState("wraparound");
  const path = React.useMemo(() => shortestPath(REL, from, to), [from, to]);

  return (
    <div style={{ display: "grid", gridTemplateRows: "auto 1fr", height: "100%" }}>
      {/* Endpoint picker bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px", borderBottom: `1px solid ${TT.borderSoft}`, background: TT.surface2,
        flexWrap: "wrap",
      }}>
        <EntityPicker label="from" value={from} setValue={setFrom} color={TT.coral} />
        <span style={{ fontFamily: FF.mono, fontSize: 14, color: TT.ink3 }}>⇢</span>
        <EntityPicker label="to" value={to} setValue={setTo} color={TT.sage} />
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {path ? `${path.length - 1} hops · ${path.length} entities` : "no path"}
        </span>
        <button style={btn()}>shortest ▾</button>
        <button style={btn()}>alternative paths · 2</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", height: "100%" }}>
        <div style={{
          position: "relative", padding: "30px 30px", overflow: "auto",
        }}>
          {path ? (
            <PathFlow path={path} />
          ) : (
            <div style={{
              fontFamily: FF.serif, fontSize: 16, color: TT.ink3,
              padding: "40px 20px", textAlign: "center",
            }}>No path between these entities in the current report.</div>
          )}
        </div>

        <aside style={{
          borderLeft: `1px solid ${TT.borderSoft}`, padding: "20px 18px",
          background: TT.surface2, fontFamily: FF.sans, fontSize: 12.5, color: TT.ink2,
        }}>
          <Eyebrow>Why this path?</Eyebrow>
          {path && (
            <ol style={{ margin: "10px 0 0", paddingLeft: 18, fontFamily: FF.serif, fontSize: 13.5, lineHeight: 1.5, color: TT.ink, display: "grid", gap: 6 }}>
              {path.slice(0, -1).map((id, i) => {
                const next = path[i + 1];
                const edge = findEdge(REL, id, next);
                const a = ENT.find((e) => e.id === id);
                const b = ENT.find((e) => e.id === next);
                return (
                  <li key={i}>
                    <span style={{ fontFamily: FF.mono, color: TYPE_COLOR[a.type], fontWeight: 600 }}>{a.name}</span>
                    <span style={{ color: TT.ink3 }}> {edge ? edge.type : "—"} </span>
                    <span style={{ fontFamily: FF.mono, color: TYPE_COLOR[b.type], fontWeight: 600 }}>{b.name}</span>
                  </li>
                );
              })}
            </ol>
          )}
          <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1px solid ${TT.borderSoft}` }}>
            <Eyebrow color={TT.coral}>Try</Eyebrow>
            <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
              {[
                ["mvcc", "wraparound"],
                ["xmin", "predicate-lock"],
                ["heapam", "ssi-anomaly"],
              ].map(([a, b]) => (
                <button key={a + b}
                  onClick={() => { setFrom(a); setTo(b); }}
                  style={{
                    textAlign: "left", background: TT.surface,
                    border: `1px solid ${TT.borderSoft}`, borderRadius: 8,
                    padding: "6px 10px", cursor: "pointer",
                    fontFamily: FF.mono, fontSize: 11, color: TT.ink2,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                  <span style={{ color: TT.coral }}>{a}</span>
                  <span style={{ color: TT.ink4 }}>⇢</span>
                  <span style={{ color: TT.sage }}>{b}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function EntityPicker({ label, value, setValue, color }) {
  const [open, setOpen] = React.useState(false);
  const e = ENT.find((x) => x.id === value);
  return (
    <div style={{ position: "relative" }}>
      <div style={{
        fontFamily: FF.mono, fontSize: 9, color: TT.ink3,
        letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3,
      }}>{label}</div>
      <button onClick={() => setOpen((o) => !o)}
        style={{
          background: TT.surface, border: `1px solid ${color}`,
          borderRadius: 8, padding: "6px 12px", cursor: "pointer",
          fontFamily: FF.mono, fontSize: 13, color, fontWeight: 600,
          display: "inline-flex", alignItems: "center", gap: 8, minWidth: 160,
          justifyContent: "space-between",
        }}>
        <span>{e ? e.name : "—"}</span>
        <span style={{ color: TT.ink4 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: 56, left: 0, zIndex: 10,
          background: TT.surface, border: `1px solid ${TT.border}`,
          borderRadius: 10, padding: 6, boxShadow: TT.shadowHi,
          maxHeight: 240, overflow: "auto", minWidth: 200,
        }}>
          {ENT.map((x) => (
            <button key={x.id} onClick={() => { setValue(x.id); setOpen(false); }}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
                width: "100%", textAlign: "left", border: "none", background: "transparent",
                padding: "5px 8px", borderRadius: 6, cursor: "pointer",
                fontFamily: FF.mono, fontSize: 11.5, color: TYPE_COLOR[x.type], fontWeight: 600,
              }}
              onMouseEnter={(ev) => ev.currentTarget.style.background = TT.surface2}
              onMouseLeave={(ev) => ev.currentTarget.style.background = "transparent"}>
              <span>{x.name}</span>
              <span style={{ fontSize: 9, color: TT.ink4, letterSpacing: "0.06em", textTransform: "uppercase" }}>{x.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PathFlow({ path }) {
  const ents = path.map((id) => ENT.find((e) => e.id === id));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", justifyContent: "center", minHeight: 220 }}>
      {ents.map((e, i) => {
        const edge = i > 0 ? findEdge(REL, ents[i - 1].id, e.id) : null;
        const isEndpoint = i === 0 || i === ents.length - 1;
        return (
          <React.Fragment key={e.id + i}>
            {i > 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 14px", minWidth: 120 }}>
                <div style={{
                  fontFamily: FF.mono, fontSize: 10, color: TT.coral, fontWeight: 600,
                  letterSpacing: "0.04em",
                }}>{edge ? edge.type : "—"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 4 }}>
                  <div style={{ width: 60, height: 1, background: TT.ink, opacity: 0.4 }} />
                  <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 5 L8 5 M5 2 L8 5 L5 8" fill="none" stroke={TT.ink} strokeOpacity="0.5" strokeWidth="1.5" /></svg>
                </div>
                <div style={{
                  fontFamily: FF.mono, fontSize: 9, color: TT.ink4,
                  marginTop: 4, letterSpacing: "0.06em", textTransform: "uppercase",
                }}>{edge ? edge.strength : ""}</div>
              </div>
            )}
            <PathNode e={e} endpoint={isEndpoint} sideColor={
              i === 0 ? TT.coral : i === ents.length - 1 ? TT.sage : null
            } />
          </React.Fragment>
        );
      })}
    </div>
  );
}

function PathNode({ e, endpoint, sideColor }) {
  const color = TYPE_COLOR[e.type];
  return (
    <div style={{
      background: endpoint ? TT.surface : TT.surface2,
      border: `${endpoint ? 2 : 1}px solid ${sideColor || color}`,
      borderRadius: 14, padding: endpoint ? "14px 16px" : "10px 12px",
      minWidth: endpoint ? 150 : 130, maxWidth: 180,
      boxShadow: endpoint ? TT.shadow : "none",
    }}>
      <div style={{
        fontFamily: FF.mono, fontSize: 9, color: TT.ink3,
        letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3,
      }}>{e.type}</div>
      <div style={{ fontFamily: FF.mono, fontSize: 14, color, fontWeight: 600 }}>{e.name}</div>
      {endpoint && (
        <div style={{ fontFamily: FF.serif, fontSize: 12, lineHeight: 1.4, color: TT.ink2, marginTop: 6, textWrap: "pretty" }}>
          {e.shortDef.length > 90 ? e.shortDef.slice(0, 90) + "…" : e.shortDef}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { SketchMatrix, SketchPath });

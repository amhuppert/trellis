// Reference (glossary) view. The graph view now lives in views-graph.jsx.

// — Reference: glossary + sources + entity detail panel —

function ReferenceView({ focusEntityId, onFocusEntity, onSection, onMode }) {
  const B = window.B;
  const [tab, setTab] = React.useState("entities");

  const focused = focusEntityId ? B.entities.find((e) => e.id === focusEntityId) : null;
  const primarySection = focused ? B.sections.find((s) => s.id === focused.primarySection) : null;
  const incoming = focused ? B.relationships.filter((r) => r.to === focused.id) : [];
  const outgoing = focused ? B.relationships.filter((r) => r.from === focused.id) : [];

  return (
    <div className="view-enter" style={{ display: "flex", alignItems: "stretch", flex: 1, minWidth: 0 }}>
      <main style={{ flex: 1, overflow: "auto", padding: "32px 40px 96px", minWidth: 0, display: "flex", gap: 24, height: "calc(100vh - 60px)" }}>
        {/* Left side: list */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: FF.serif, fontWeight: 500, fontSize: 40, lineHeight: 1.05, letterSpacing: "-0.02em", margin: "0 0 18px" }}>
            Glossary &amp; sources
          </h1>

          {/* Tab strip */}
          <div style={{ display: "flex", gap: 4, background: TT.surface, padding: 4, borderRadius: 999, border: `1px solid ${TT.borderSoft}`, width: "fit-content", marginBottom: 22 }}>
            {[["entities", `Entities · ${B.entities.length}`], ["sources", `Sources · ${B.sources.length}`]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                background: tab === id ? TT.ink : "transparent",
                color: tab === id ? TT.bg : TT.ink2,
                border: "none", cursor: "pointer",
                fontFamily: FF.sans, fontSize: 12, fontWeight: 600,
                padding: "7px 14px", borderRadius: 999,
              }}>{label}</button>
            ))}
          </div>

          {tab === "entities" && (
            <div style={{ display: "grid", gap: 8 }}>
              {B.entities.map((e) => {
                const active = e.id === focusEntityId;
                return (
                  <button
                    key={e.id}
                    onClick={() => onFocusEntity(e.id)}
                    style={{
                      textAlign: "left", background: active ? TT.coralBg : TT.surface,
                      border: `1px solid ${active ? TT.coral : TT.borderSoft}`,
                      borderRadius: 12, padding: "13px 16px", cursor: "pointer",
                      fontFamily: FF.sans,
                      transition: "background .12s, border-color .12s",
                    }}
                    onMouseEnter={(ev) => { if (!active) ev.currentTarget.style.background = TT.surface2; }}
                    onMouseLeave={(ev) => { if (!active) ev.currentTarget.style.background = TT.surface; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontFamily: FF.mono, fontSize: 14, color: TT.coralInk, fontWeight: 600 }}>{e.name}</span>
                      <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3, letterSpacing: "0.08em", textTransform: "uppercase" }}>{e.type}</span>
                    </div>
                    <div style={{ fontFamily: FF.serif, fontSize: 14.5, color: TT.ink2, marginTop: 5, lineHeight: 1.45, textWrap: "pretty" }}>{e.shortDef}</div>
                  </button>
                );
              })}
            </div>
          )}

          {tab === "sources" && (
            <div style={{ display: "grid", gap: 8 }}>
              {B.sources.map((s) => (
                <div key={s.id} style={{
                  background: TT.surface, border: `1px solid ${TT.borderSoft}`,
                  borderRadius: 12, padding: "13px 16px", fontFamily: FF.sans,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: TT.ink }}>{s.title}</span>
                    <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.kind}</span>
                  </div>
                  <div style={{ fontFamily: FF.mono, fontSize: 12, color: TT.sage, marginTop: 4 }}>{s.path || s.host}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side: detail */}
        <div style={{ width: 380, flex: "0 0 380px" }}>
          {focused ? (
            <div style={{
              position: "sticky", top: 80,
              background: TT.surface, border: `1px solid ${TT.borderSoft}`,
              borderRadius: 14, padding: "22px 24px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontFamily: FF.mono, fontSize: 11, color: TT.ink3, letterSpacing: "0.08em", textTransform: "uppercase" }}>{focused.type}</span>
                <button onClick={() => onFocusEntity(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: TT.ink3, fontSize: 18, lineHeight: 1 }}>×</button>
              </div>
              <div style={{ fontFamily: FF.mono, fontSize: 22, color: TT.coralInk, fontWeight: 600 }}>{focused.name}</div>
              <div style={{ fontFamily: FF.serif, fontSize: 16, lineHeight: 1.55, color: TT.ink, marginTop: 12, textWrap: "pretty" }}>
                {focused.shortDef}
              </div>
              {primarySection && (
                <button
                  onClick={() => onSection(primarySection.id)}
                  style={{
                    marginTop: 16, background: TT.ink, color: TT.bg, border: "none",
                    padding: "9px 14px", borderRadius: 10, cursor: "pointer",
                    fontFamily: FF.sans, fontSize: 12.5, fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 8, width: "100%",
                  }}
                >
                  <span>Open {primarySection.n} · {primarySection.title}</span>
                  <span style={{ marginLeft: "auto" }}>→</span>
                </button>
              )}
              <button
                onClick={() => window.__openGraph && window.__openGraph(focused.id, "spotlight")}
                style={{
                  marginTop: 8, background: TT.surface, color: TT.ink2,
                  border: `1px solid ${TT.borderSoft}`,
                  padding: "8px 14px", borderRadius: 10, cursor: "pointer",
                  fontFamily: FF.sans, fontSize: 12, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="5" cy="5" r="1.6" fill="currentColor" /><circle cx="1.6" cy="2" r="1.1" /><circle cx="8.4" cy="2" r="1.1" /><circle cx="2" cy="8.4" r="1.1" /><circle cx="8" cy="8.4" r="1.1" />
                  <path d="M5 5L1.6 2M5 5L8.4 2M5 5L2 8.4M5 5L8 8.4" />
                </svg>
                <span>See in knowledge graph</span>
                <span style={{ marginLeft: "auto" }}>→</span>
              </button>
              {(incoming.length > 0 || outgoing.length > 0) && (
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${TT.borderSoft}` }}>
                  <Eyebrow>Relationships</Eyebrow>
                  <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                    {outgoing.map((r, i) => {
                      const other = B.entities.find((e) => e.id === r.to);
                      if (!other) return null;
                      return (
                        <button key={"o" + i} onClick={() => onFocusEntity(other.id)} style={{
                          textAlign: "left", background: "transparent", border: "none", cursor: "pointer",
                          padding: "4px 0", fontFamily: FF.mono, fontSize: 12, color: TT.ink2,
                          display: "flex", alignItems: "baseline", gap: 8,
                        }}>
                          <span style={{ color: TT.coral }}>{r.type}</span>
                          <span style={{ color: TT.ink4 }}>→</span>
                          <span style={{ color: TT.coralInk, fontWeight: 600 }}>{other.name}</span>
                        </button>
                      );
                    })}
                    {incoming.map((r, i) => {
                      const other = B.entities.find((e) => e.id === r.from);
                      if (!other) return null;
                      return (
                        <button key={"i" + i} onClick={() => onFocusEntity(other.id)} style={{
                          textAlign: "left", background: "transparent", border: "none", cursor: "pointer",
                          padding: "4px 0", fontFamily: FF.mono, fontSize: 12, color: TT.ink2,
                          display: "flex", alignItems: "baseline", gap: 8,
                        }}>
                          <span style={{ color: TT.coralInk, fontWeight: 600 }}>{other.name}</span>
                          <span style={{ color: TT.ink4 }}>→</span>
                          <span style={{ color: TT.coral }}>{r.type}</span>
                          <span style={{ color: TT.ink4, fontStyle: "italic" }}>(this)</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              background: TT.sageBg, border: `1px dashed ${TT.borderHi}`,
              borderRadius: 14, padding: "22px 24px",
              position: "sticky", top: 80,
            }}>
              <Eyebrow color={TT.sage}>Tip</Eyebrow>
              <div style={{ fontFamily: FF.serif, fontSize: 16, lineHeight: 1.5, color: TT.ink, marginTop: 8, textWrap: "pretty" }}>
                Click any entity to see its definition, its primary section,
                and its incoming and outgoing relationships.
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { ReferenceView });

// Synthesis view — the hierarchical synthesis as its own navigable page.
//
// Per spec §5.5: synthesis is a parallel structure to the section tree.
// Leaf nodes are concrete units of understanding; intermediate nodes
// synthesize their children by explaining what they have in common, how
// they differ, what higher-level pattern emerges. Nodes reference
// sections/entities/sources but don't duplicate their content.
//
// UX: focus-based navigation. One node fills the main pane at a time.
// Tree rail on the left always shows the whole hierarchy with the
// focused node highlighted; breadcrumbs along the top show the path
// from the root. Children render as cards beneath the focus.

// --- helpers ---------------------------------------------------------

function synFlatten(node, depth = 0, parentChain = []) {
  const chain = [...parentChain, node];
  const out = [{ node, depth, chain }];
  for (const c of (node.children || [])) {
    out.push(...synFlatten(c, depth + 1, chain));
  }
  return out;
}

function synFindChain(node, targetId, chain = []) {
  const next = [...chain, node];
  if (node.id === targetId) return next;
  for (const c of (node.children || [])) {
    const r = synFindChain(c, targetId, next);
    if (r) return r;
  }
  return null;
}

const LEVEL_LABEL = ["Root synthesis", "Branch synthesis", "Leaf node"];
const LEVEL_COLOR = (lvl) => [TT.ink, TT.sage, TT.coral][lvl] || TT.coralInk;
const LEVEL_BG    = (lvl) => [TT.surface, TT.sageBg, TT.coralBg][lvl] || TT.surface2;

// --- view ------------------------------------------------------------

function SynthesisView({ focusId: focusIdProp, onFocus, onSection, onOpenEntity, onMode }) {
  const B = window.B;
  const root = B.synthesis.root;
  const flat = React.useMemo(() => synFlatten(root), [root]);

  const focusId = focusIdProp || root.id;
  const setFocusId = (id) => { if (onFocus) onFocus(id); };

  const chain = synFindChain(root, focusId) || [root];
  const focus = chain[chain.length - 1];
  const parent = chain.length > 1 ? chain[chain.length - 2] : null;
  const isLeaf = !focus.children || focus.children.length === 0;

  // Reset scroll when focus changes
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [focusId]);

  // Resolve a reference {kind, id, anchorId?, note?} into a clickable line.
  const resolveRef = (r) => {
    if (r.kind === "section") {
      const s = B.sections.find((x) => x.id === r.id);
      return { kind: "section", label: s ? `§${s.n} · ${s.title}` : r.id, sub: s && s.blurb, hit: s && r.anchorId, target: () => onSection(r.id, r.anchorId) };
    }
    if (r.kind === "entity") {
      const e = B.entities.find((x) => x.id === r.id);
      return { kind: "entity", label: e ? e.name : r.id, sub: e && e.shortDef, hit: e && e.type, target: () => onOpenEntity(r.id) };
    }
    if (r.kind === "source") {
      const s = B.sources.find((x) => x.id === r.id);
      return { kind: "source", label: s ? s.title : r.id, sub: s && (s.path || s.host), hit: s && s.kind, target: () => onMode("reference") };
    }
    return { kind: r.kind, label: r.id, sub: "", hit: "" };
  };

  return (
    <main ref={scrollRef} className="view-enter" style={{ flex: 1, overflow: "auto", minWidth: 0, height: "calc(100vh - 60px)" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 48px 96px" }}>

          {/* Breadcrumbs */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            {chain.map((n, i) => {
              const last = i === chain.length - 1;
              return (
                <React.Fragment key={n.id}>
                  <button
                    onClick={() => setFocusId(n.id)}
                    disabled={last}
                    style={{
                      background: "transparent", border: "none", padding: 0, cursor: last ? "default" : "pointer",
                      fontFamily: FF.mono, fontSize: 11, letterSpacing: "0.04em",
                      color: last ? TT.ink2 : TT.ink3,
                      fontWeight: last ? 700 : 500,
                    }}
                  >
                    {i === 0 ? "synthesis" : n.title.split(" · ")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                  </button>
                  {!last && <span style={{ color: TT.ink4, fontFamily: FF.mono, fontSize: 11 }}>/</span>}
                </React.Fragment>
              );
            })}
          </div>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
            <span style={{
              fontFamily: FF.mono, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: LEVEL_COLOR(focus.level),
              padding: "4px 9px", borderRadius: 999,
              background: LEVEL_BG(focus.level),
              border: `1px solid ${TT.borderSoft}`,
            }}>
              L{focus.level} · {LEVEL_LABEL[focus.level] || `Sub-leaf`}
            </span>
            {parent && (
              <button
                onClick={() => setFocusId(parent.id)}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  fontFamily: FF.mono, fontSize: 11, color: TT.ink3,
                  display: "flex", alignItems: "center", gap: 4,
                }}
              >
                ← up to {parent.title.split(" · ")[0]}
              </button>
            )}
          </div>
          <h1 style={{
            fontFamily: FF.serif, fontWeight: 500, fontSize: 46, lineHeight: 1.05,
            letterSpacing: "-0.025em", margin: 0, textWrap: "balance",
          }}>
            {focus.title}
          </h1>
          <p style={{ fontFamily: FF.serif, fontSize: 19, lineHeight: 1.5, color: TT.ink2, marginTop: 16, textWrap: "pretty" }}>
            {focus.summary}
          </p>

          {/* Synthesis-specific blocks (intermediate nodes) */}
          {(focus.commonStructure || focus.contrast) && (
            <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: focus.contrast ? "1fr 1fr" : "1fr", gap: 12 }}>
              {focus.commonStructure && (
                <div style={{
                  background: TT.sageBg, border: `1px solid ${TT.borderSoft}`, borderRadius: 14,
                  padding: "18px 20px",
                }}>
                  <Eyebrow color={TT.sage}>What the children share</Eyebrow>
                  <div style={{ fontFamily: FF.serif, fontSize: 15.5, lineHeight: 1.5, color: TT.ink, marginTop: 8, textWrap: "pretty" }}>
                    {focus.commonStructure}
                  </div>
                </div>
              )}
              {focus.contrast && (
                <div style={{
                  background: TT.coralBg, border: `1px solid ${TT.borderSoft}`, borderRadius: 14,
                  padding: "18px 20px",
                }}>
                  <Eyebrow color={TT.coral}>Where they differ</Eyebrow>
                  <div style={{ fontFamily: FF.serif, fontSize: 15.5, lineHeight: 1.5, color: TT.ink, marginTop: 8, textWrap: "pretty" }}>
                    {focus.contrast}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Key takeaways */}
          {focus.keyTakeaways && focus.keyTakeaways.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <Eyebrow>Take away at this level</Eyebrow>
              <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                {focus.keyTakeaways.map((t, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{
                      flex: "0 0 auto", width: 20, height: 20, borderRadius: 6, background: TT.ink, color: TT.bg,
                      fontFamily: FF.mono, fontSize: 10, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
                    }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ fontFamily: FF.serif, fontSize: 16, lineHeight: 1.5, color: TT.ink, textWrap: "pretty" }}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Children grid — drill-down */}
          {!isLeaf && (
            <div style={{ marginTop: 32 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
                <Eyebrow color={LEVEL_COLOR(focus.level + 1)}>
                  Drill down · {focus.children.length} {focus.children.length === 1 ? "child" : "children"}
                </Eyebrow>
                <span style={{ fontFamily: FF.mono, fontSize: 11, color: TT.ink3 }}>
                  L{focus.level + 1}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                {focus.children.map((c, i) => {
                  const grand = (c.children || []).length;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setFocusId(c.id)}
                      style={{
                        textAlign: "left", background: TT.surface,
                        border: `1px solid ${TT.borderSoft}`,
                        borderLeft: `3px solid ${LEVEL_COLOR(c.level)}`,
                        borderRadius: 12, padding: "16px 18px",
                        cursor: "pointer", fontFamily: FF.sans,
                        display: "flex", flexDirection: "column", gap: 10,
                        transition: "transform .12s, border-color .12s, background .12s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = TT.surface2; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.background = TT.surface; }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontFamily: FF.mono, fontSize: 10, color: LEVEL_COLOR(c.level), fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          {String(i + 1).padStart(2, "0")} · L{c.level}
                        </span>
                        <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3 }}>
                          {grand > 0 ? `${grand} children` : "leaf"}
                        </span>
                      </div>
                      <div style={{ fontFamily: FF.serif, fontSize: 17, fontWeight: 500, color: TT.ink, lineHeight: 1.2, letterSpacing: "-0.005em", textWrap: "pretty" }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: 12.5, lineHeight: 1.45, color: TT.ink2, textWrap: "pretty" }}>
                        {c.summary}
                      </div>
                      <div style={{ marginTop: "auto", color: LEVEL_COLOR(c.level), fontFamily: FF.mono, fontSize: 11, fontWeight: 600 }}>
                        focus →
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Open / contested */}
          {focus.openQuestions && focus.openQuestions.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <Eyebrow color={TT.butterInk}>Contested · uncertain · open</Eyebrow>
              <div style={{
                marginTop: 12,
                background: TT.butterBg, border: `1px solid ${TT.borderSoft}`,
                borderRadius: 14, padding: "16px 20px",
              }}>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
                  {focus.openQuestions.map((q, i) => (
                    <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{
                        flex: "0 0 auto", marginTop: 6, width: 14, height: 14, borderRadius: 14,
                        border: `1.5px solid ${TT.butterInk}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: FF.mono, fontSize: 9, fontWeight: 700, color: TT.butterInk,
                      }}>?</span>
                      <span style={{ fontFamily: FF.serif, fontSize: 15.5, lineHeight: 1.5, color: TT.ink, textWrap: "pretty" }}>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* References — back to sections / entities / sources */}
          {focus.references && focus.references.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
                <Eyebrow>Drawn from</Eyebrow>
                <span style={{ fontFamily: FF.mono, fontSize: 11, color: TT.ink3 }}>
                  {focus.references.length} reference{focus.references.length === 1 ? "" : "s"}
                </span>
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                {focus.references.map((r, i) => {
                  const res = resolveRef(r);
                  const colorMap = { section: TT.sage, entity: TT.coral, source: TT.butterInk };
                  const c = colorMap[res.kind] || TT.ink3;
                  return (
                    <button
                      key={i}
                      onClick={res.target}
                      style={{
                        textAlign: "left", background: TT.surface,
                        border: `1px solid ${TT.borderSoft}`, borderRadius: 10,
                        padding: "10px 14px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 14,
                        fontFamily: FF.sans,
                        transition: "background .12s, border-color .12s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = TT.surface2; e.currentTarget.style.borderColor = c; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = TT.surface; e.currentTarget.style.borderColor = TT.borderSoft; }}
                    >
                      <span style={{
                        flex: "0 0 auto", width: 64,
                        fontFamily: FF.mono, fontSize: 9, fontWeight: 700,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        color: c,
                      }}>{res.kind}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: TT.ink }}>{res.label}</span>
                        {res.sub && (
                          <span style={{ display: "block", fontFamily: res.kind === "source" ? FF.mono : FF.serif, fontSize: 12, color: TT.ink3, marginTop: 2, textWrap: "pretty" }}>
                            {res.sub}
                          </span>
                        )}
                      </span>
                      {res.hit && (
                        <span style={{
                          fontFamily: FF.mono, fontSize: 9, color: TT.ink3,
                          letterSpacing: "0.08em", textTransform: "uppercase",
                          padding: "3px 8px", borderRadius: 999, background: TT.surface2,
                        }}>{res.hit}</span>
                      )}
                      <span style={{ color: c, fontSize: 14, marginLeft: 6 }}>→</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sibling pager */}
          {parent && (
            <SiblingPager parent={parent} focusId={focus.id} onFocus={setFocusId} />
          )}
        </div>
      </main>
  );
}

function SiblingPager({ parent, focusId, onFocus }) {
  const sibs = parent.children || [];
  const idx = sibs.findIndex((s) => s.id === focusId);
  const prev = idx > 0 ? sibs[idx - 1] : null;
  const next = idx < sibs.length - 1 ? sibs[idx + 1] : null;
  if (!prev && !next) return null;
  return (
    <div style={{ marginTop: 40, paddingTop: 22, borderTop: `1px solid ${TT.borderSoft}`, display: "flex", gap: 12 }}>
      <button
        disabled={!prev}
        onClick={() => prev && onFocus(prev.id)}
        style={{
          flex: 1, textAlign: "left", padding: "14px 16px", borderRadius: 12,
          background: prev ? TT.surface : TT.surface2,
          border: `1px solid ${TT.borderSoft}`,
          cursor: prev ? "pointer" : "default", opacity: prev ? 1 : 0.4,
          fontFamily: FF.sans,
        }}
      >
        <div style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3, letterSpacing: "0.1em", textTransform: "uppercase" }}>← previous sibling</div>
        <div style={{ fontFamily: FF.serif, fontSize: 15, fontWeight: 500, color: TT.ink, marginTop: 4, lineHeight: 1.25, textWrap: "pretty" }}>
          {prev ? prev.title : "first child"}
        </div>
      </button>
      <button
        disabled={!next}
        onClick={() => next && onFocus(next.id)}
        style={{
          flex: 1, textAlign: "right", padding: "14px 16px", borderRadius: 12,
          background: next ? TT.surface : TT.surface2,
          border: `1px solid ${TT.borderSoft}`,
          cursor: next ? "pointer" : "default", opacity: next ? 1 : 0.4,
          fontFamily: FF.sans,
        }}
      >
        <div style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3, letterSpacing: "0.1em", textTransform: "uppercase" }}>next sibling →</div>
        <div style={{ fontFamily: FF.serif, fontSize: 15, fontWeight: 500, color: TT.ink, marginTop: 4, lineHeight: 1.25, textWrap: "pretty" }}>
          {next ? next.title : "last child"}
        </div>
      </button>
    </div>
  );
}

Object.assign(window, { SynthesisView });

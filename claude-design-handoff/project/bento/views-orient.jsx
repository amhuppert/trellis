// Orientation view — the bento grid.

function countSynthNodes(node) {
  let n = 1;
  for (const c of (node.children || [])) n += countSynthNodes(c);
  return n;
}
// Same composition as the design proposal, now wired up: clicking a
// section opens it in Guided mode; clicking modes/jumps moves the view.

function OrientationView({ onMode, onOpenSection, onOpenEntity, onOpenSynthesis }) {
  const B = window.B;
  const sections = B.sections;

  return (
    <div className="view-enter" style={{ flex: 1, overflow: "auto", minWidth: 0, height: "calc(100vh - 60px)" }}>
    <div style={{
      maxWidth: 1320, margin: "0 auto",
      padding: "20px 28px 36px",
      display: "grid",
      gridTemplateColumns: "repeat(12, 1fr)",
      gridAutoRows: "minmax(0, auto)",
      gap: 14,
    }}>
      {/* HERO — span 8 */}
      <Card span={8} pad="34px 38px" style={{ minHeight: 380, position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: TT.coral }}>
            Topic tutorial
          </span>
          <span style={{ color: TT.ink3, fontSize: 12 }}>·</span>
          <span style={{ fontFamily: FF.mono, fontSize: 11, color: TT.ink3 }}>
            {B.meta.sectionCount} sections · {B.meta.entityCount} entities · {B.meta.readTime}
          </span>
        </div>
        <h1 style={{
          fontFamily: FF.serif, fontWeight: 500, fontSize: 68, lineHeight: 1.0,
          letterSpacing: "-0.025em", margin: 0, textWrap: "balance", maxWidth: 640,
        }}>
          How Postgres MVCC works.
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.5, color: TT.ink2, marginTop: 18, maxWidth: 580, textWrap: "pretty" }}>
          {B.meta.subtitle}
        </p>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", gap: 28, marginTop: 28, alignItems: "center" }}>
          <button
            onClick={() => { onMode("guided"); onOpenSection("foundations"); }}
            style={{
              background: TT.ink, color: TT.bg, border: "none",
              padding: "12px 20px", borderRadius: 999,
              fontFamily: FF.sans, fontSize: 14, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            Start reading
            <span style={{ fontFamily: FF.mono, fontSize: 11, opacity: 0.6 }}>§01 Foundations</span>
            <span style={{ fontSize: 14 }}>→</span>
          </button>
          <div style={{ width: 1, height: 36, background: TT.borderSoft }} />
          <div>
            <Eyebrow>For</Eyebrow>
            <div style={{ fontSize: 13, color: TT.ink, marginTop: 5, lineHeight: 1.4, maxWidth: 240 }}>
              Engineers who already use Postgres.
            </div>
          </div>
          <div style={{ width: 1, height: 36, background: TT.borderSoft }} />
          <div>
            <Eyebrow>Built</Eyebrow>
            <div style={{ fontSize: 13, color: TT.ink, marginTop: 5 }}>{B.meta.builtAt}</div>
          </div>
        </div>

        {/* Decorative bento corner */}
        <div style={{
          position: "absolute", top: 28, right: 28,
          display: "grid", gridTemplateColumns: "repeat(3, 24px)", gap: 6,
        }}>
          {Array.from({ length: 9 }).map((_, i) => {
            const colors = [TT.sage, TT.coral, TT.butter];
            const fills  = [1, 0, 1, 0, 1, 1, 1, 0, 0];
            return (
              <div key={i} style={{
                width: 24, height: 24, borderRadius: 7,
                background: fills[i] ? colors[i % 3] : "transparent",
                border: fills[i] ? "none" : `1.5px solid ${TT.border}`,
              }} />
            );
          })}
        </div>
      </Card>

      {/* MODES — span 4 */}
      <Card span={4} pad="22px 24px">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Eyebrow color={TT.sage}>How to read this</Eyebrow>
          <span style={{ fontSize: 11, color: TT.ink3 }}>{B.modes.length} modes</span>
        </div>
        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          {B.modes.slice(1).map((m) => (
            <button
              key={m.id}
              onClick={() => onMode(m.id)}
              style={{
                textAlign: "left", border: `1px solid ${TT.borderSoft}`,
                background: TT.surface2, cursor: "pointer",
                padding: "12px 14px", borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                transition: "background .12s, border-color .12s, transform .12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = TT.sageBg; e.currentTarget.style.borderColor = TT.sage; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = TT.surface2; e.currentTarget.style.borderColor = TT.borderSoft; }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: TT.ink }}>{m.name}</div>
                <div style={{ fontSize: 11.5, color: TT.ink3, marginTop: 1 }}>{m.hint}</div>
              </div>
              <span style={{ color: TT.sage, fontSize: 14 }}>→</span>
            </button>
          ))}
        </div>
      </Card>

      {/* WHAT YOU'LL LEARN — span 5 */}
      <Card span={5} bg={TT.coralBg} pad="22px 24px">
        <Eyebrow color={TT.coral}>What you'll learn</Eyebrow>
        <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 12 }}>
          {B.meta.whatYoullLearn.map((line, i) => (
            <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{
                flex: "0 0 auto", width: 22, height: 22, borderRadius: 8, background: TT.coral,
                color: TT.bg, fontSize: 11, fontWeight: 700, fontFamily: FF.mono,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{i + 1}</span>
              <span style={{ fontFamily: FF.serif, fontSize: 16, lineHeight: 1.42, color: TT.ink, textWrap: "pretty" }}>{line}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* SYNTHESIS PREVIEW — span 7 */}
      <Card span={7} pad="22px 24px">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Eyebrow color={TT.sage}>Synthesis tree</Eyebrow>
          <button
            onClick={() => onMode("synthesis")}
            style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: FF.mono, fontSize: 11, color: TT.sage, fontWeight: 600 }}
          >open tree →</button>
        </div>
        <div style={{ fontFamily: FF.serif, fontSize: 19, lineHeight: 1.42, color: TT.ink, marginTop: 14, textWrap: "pretty" }}>
          {B.synthesis.root.summary}
        </div>
        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {B.synthesis.root.children.map((b, i) => {
            const colors = [TT.coral, TT.sage, TT.butterInk, TT.coral];
            const shortTitle = b.title.split(" · ")[0];
            const shortSummary = b.title.split(" · ")[1] || b.summary;
            return (
              <button
                key={b.id}
                onClick={() => onOpenSynthesis(b.id)}
                style={{
                  textAlign: "left", border: "none",
                  background: TT.surface2, borderRadius: 12,
                  padding: "12px 14px", cursor: "pointer",
                  borderTop: `3px solid ${colors[i]}`,
                  transition: "transform .12s, background .12s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = TT.surface3; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = TT.surface2; }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: TT.ink }}>{shortTitle}</div>
                <div style={{ fontSize: 11, color: TT.ink3, marginTop: 4, lineHeight: 1.4 }}>{shortSummary}</div>
                <div style={{ marginTop: 8, fontFamily: FF.mono, fontSize: 10, color: TT.ink3 }}>
                  {b.children.length} nodes
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* RECOMMENDED PATH — full width 12 */}
      <Card span={12} pad="22px 24px">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
          <Eyebrow>Recommended path · seven sections</Eyebrow>
          <span style={{ fontFamily: FF.mono, fontSize: 11, color: TT.ink3 }}>linear · click any to start</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
          {sections.map((s, i) => {
            const start = i === 0;
            const kindColor = KIND_COLOR[s.kind] || TT.sage;
            return (
              <button
                key={s.id}
                onClick={() => { onMode("guided"); onOpenSection(s.id); }}
                style={{
                  background: start ? TT.ink : TT.surface2,
                  color: start ? TT.bg : TT.ink,
                  border: start ? "none" : `1px solid ${TT.borderSoft}`,
                  borderRadius: 12, padding: "14px 14px", minHeight: 130,
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                  cursor: "pointer", textAlign: "left", fontFamily: FF.sans,
                  transition: "transform .15s, background .15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
              >
                <div>
                  <div style={{ fontFamily: FF.mono, fontSize: 11, color: start ? TT.coral : TT.ink3, fontWeight: 600 }}>
                    {s.n}
                  </div>
                  <div style={{ fontFamily: FF.serif, fontSize: 18, fontWeight: 500, marginTop: 4, lineHeight: 1.15, letterSpacing: "-0.005em" }}>
                    {s.title}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontFamily: FF.mono, color: start ? TT.bg : TT.ink3, opacity: start ? 0.75 : 1 }}>
                  <Dot color={kindColor} />
                  <span>{s.kind}</span>
                  <span style={{ marginLeft: "auto" }}>{s.time}</span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* KEY ENTITIES — span 8 */}
      <Card span={8} pad="22px 24px">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Eyebrow color={TT.coral}>Key entities</Eyebrow>
          <button onClick={() => onMode("graph")} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: FF.mono, fontSize: 11, color: TT.coral, fontWeight: 600 }}>graph view →</button>
        </div>
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {B.entities.slice(0, 6).map((e) => (
            <button
              key={e.id}
              onClick={() => onOpenEntity(e.id)}
              style={{
                textAlign: "left", border: `1px solid ${TT.borderSoft}`,
                padding: "12px 14px", background: TT.surface2, borderRadius: 12,
                cursor: "pointer", fontFamily: FF.sans,
                transition: "background .12s, border-color .12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = TT.coralBg; e.currentTarget.style.borderColor = TT.coralSoft; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = TT.surface2; e.currentTarget.style.borderColor = TT.borderSoft; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: FF.mono, fontSize: 13, color: TT.coralInk, fontWeight: 600 }}>{e.name}</span>
                <span style={{ fontFamily: FF.mono, fontSize: 9, color: TT.ink3, letterSpacing: "0.08em", textTransform: "uppercase" }}>{e.type}</span>
              </div>
              <div style={{ fontSize: 12, color: TT.ink2, marginTop: 6, lineHeight: 1.4, textWrap: "pretty" }}>
                {e.shortDef}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* QUICK JUMP / TOOLS — span 4 */}
      <Card span={4} bg={TT.sageBg} pad="22px 24px">
        <Eyebrow color={TT.sage}>Jump to</Eyebrow>
        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          {[
            ["synthesis", "Synthesis tree",  `${countSynthNodes(B.synthesis.root)} nodes · ${B.synthesis.root.children.length} branches`],
            ["graph",     "Knowledge graph", `${B.entities.length} nodes · ${B.relationships.length} edges`],
            ["reference", "Glossary & sources", `${B.meta.entityCount} entries · ${B.meta.sourceCount} sources`],
          ].map(([m, t, h], i) => (
            <button
              key={m + i}
              onClick={() => onMode(m)}
              style={{
                textAlign: "left", border: `1px solid ${TT.borderSoft}`,
                background: TT.surface, cursor: "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "11px 14px", borderRadius: 10,
                fontFamily: FF.sans,
                transition: "transform .12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TT.ink }}>{t}</div>
                <div style={{ fontSize: 11, color: TT.ink3, marginTop: 1 }}>{h}</div>
              </div>
              <span style={{ color: TT.sage, fontSize: 14 }}>→</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
    </div>
  );
}

Object.assign(window, { OrientationView });

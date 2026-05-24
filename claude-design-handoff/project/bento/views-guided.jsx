// Guided view — section reader. Renders a section's structured blocks
// into a reading column with a right rail. The NavPanel lives in the App
// shell, so this view no longer owns its left chrome.
//
// Block anchoring:
//   • Each block can declare an `anchorId` matching a child id from the
//     section's outline. We wrap those blocks in a div with [data-anchor].
//   • When scrollTarget changes, we find that anchor in the live DOM and
//     scroll the main element to it.
//   • An IntersectionObserver reports which anchored block is currently
//     in view so the NavPanel can highlight that subsection.

function GuidedView({ sectionId, onSection, onMode, onOpenEntity, scrollTarget, onCurrentSub }) {
  const B = window.B;
  const idx = B.sections.findIndex((s) => s.id === sectionId);
  const section = B.sections[idx] || B.sections[0];
  const prev = idx > 0 ? B.sections[idx - 1] : null;
  const next = idx < B.sections.length - 1 ? B.sections[idx + 1] : null;

  const mainRef = React.useRef(null);
  const blocks = section.blocks || [];

  // On scrollTarget / section change, scroll to either the anchor or the
  // top. Always reset on section change first so a missing anchor doesn't
  // strand the reader mid-page.
  React.useLayoutEffect(() => {
    if (!mainRef.current) return;
    if (scrollTarget) {
      const el = mainRef.current.querySelector(`[data-anchor="${scrollTarget}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        const mr = mainRef.current.getBoundingClientRect();
        mainRef.current.scrollTo({ top: mainRef.current.scrollTop + r.top - mr.top - 32, behavior: "smooth" });
        return;
      }
    }
    mainRef.current.scrollTop = 0;
  }, [sectionId, scrollTarget]);

  // Watch which anchored block is most prominently in view, so the
  // NavPanel can highlight the matching subsection.
  React.useEffect(() => {
    if (!onCurrentSub || !mainRef.current) return;
    const root = mainRef.current;
    const nodes = root.querySelectorAll("[data-anchor]");
    if (!nodes.length) { onCurrentSub(null); return; }

    // Map of anchorId → latest intersectionRatio. Whichever has the
    // largest ratio above a small threshold is "current".
    const ratios = new Map();
    let raf = 0;
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        ratios.set(e.target.getAttribute("data-anchor"), e.isIntersecting ? e.intersectionRatio : 0);
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let bestId = null, bestR = 0;
        for (const [id, r] of ratios) {
          if (r > bestR) { bestR = r; bestId = id; }
        }
        onCurrentSub(bestR > 0.05 ? bestId : null);
      });
    }, { root, threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: "-60px 0px -50% 0px" });

    nodes.forEach((n) => observer.observe(n));
    return () => { observer.disconnect(); cancelAnimationFrame(raf); onCurrentSub(null); };
  }, [sectionId, onCurrentSub]);

  return (
    <div className="view-enter" style={{ display: "flex", alignItems: "stretch", flex: 1, minWidth: 0 }}>
      <main ref={mainRef} style={{ flex: 1, overflow: "auto", padding: "32px 56px 96px", minWidth: 0, height: "calc(100vh - 60px)" }}>
        {/* Reading header */}
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h1 style={{
            fontFamily: FF.serif, fontWeight: 500, fontSize: 52, lineHeight: 1.02,
            letterSpacing: "-0.025em", margin: "0 0 14px",
          }}>{section.title}</h1>
          {section.summary && (
            <p style={{
              fontFamily: FF.serif, fontSize: 21, lineHeight: 1.42,
              color: TT.ink2, margin: 0, textWrap: "pretty",
            }}>{section.summary}</p>
          )}
          {section.relatedEntities && section.relatedEntities.length >= 2 && (
            <SectionHeaderGraph section={section} />
          )}
        </div>

        {/* Blocks */}
        <div style={{ maxWidth: 720, margin: "44px auto 0", display: "grid", gap: 28 }}>
          {blocks.length > 0 ? blocks.map((b, i) => (
            <BlockRenderer key={i} block={b} onOpenEntity={onOpenEntity} onSection={onSection} />
          )) : (
            <SectionStub section={section} onSection={onSection} />
          )}
        </div>

        {/* Pagination */}
        <div style={{
          maxWidth: 720, margin: "56px auto 0",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
        }}>
          {prev ? (
            <button
              onClick={() => onSection(prev.id)}
              style={{
                background: TT.surface, border: `1px solid ${TT.borderSoft}`,
                borderRadius: 14, padding: "16px 18px", textAlign: "left", cursor: "pointer",
                transition: "transform .12s, background .12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(-2px)"; e.currentTarget.style.background = TT.surface2; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.background = TT.surface; }}
            >
              <div style={{ fontSize: 11, fontFamily: FF.mono, color: TT.ink3, letterSpacing: "0.05em" }}>← Previous</div>
              <div style={{ fontFamily: FF.serif, fontSize: 17, color: TT.ink, marginTop: 4 }}>{prev.n} · {prev.title}</div>
            </button>
          ) : <div />}
          {next ? (
            <button
              onClick={() => onSection(next.id)}
              style={{
                background: TT.ink, color: TT.bg, border: "none",
                borderRadius: 14, padding: "16px 18px", textAlign: "left", cursor: "pointer",
                transition: "transform .12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ fontSize: 11, fontFamily: FF.mono, color: TT.coral, letterSpacing: "0.05em" }}>Next →</div>
              <div style={{ fontFamily: FF.serif, fontSize: 17, marginTop: 4 }}>{next.n} · {next.title}</div>
            </button>
          ) : <div />}
        </div>
      </main>

      {/* Right rail */}
      <RightRail section={section} onMode={onMode} onOpenEntity={onOpenEntity} />
    </div>
  );
}

// — Block renderers —

function BlockRenderer({ block, onOpenEntity, onSection }) {
  let inner;
  switch (block.kind) {
    case "conceptIntro":  inner = <ConceptIntro b={block} onOpenEntity={onOpenEntity} />; break;
    case "mentalModel":   inner = <MentalModel  b={block} onOpenEntity={onOpenEntity} />; break;
    case "callout":       inner = <Callout     b={block} onOpenEntity={onOpenEntity} />; break;
    case "heading":       inner = <BlockHeading b={block} />; break;
    case "prose":         inner = <Prose       b={block} onOpenEntity={onOpenEntity} />; break;
    case "stepByStep":    inner = <StepByStep  b={block} onOpenEntity={onOpenEntity} />; break;
    case "keyTakeaways":  inner = <KeyTakeaways b={block} />; break;
    case "misconception": inner = <Misconception b={block} onOpenEntity={onOpenEntity} />; break;
    case "beforeContinue":inner = <BeforeContinue b={block} onSection={onSection} />; break;
    default: return null;
  }
  // Wrap blocks declaring an anchorId so the NavPanel can scroll/highlight.
  // scroll-margin-top gives the smooth-scroll a comfortable head-room.
  if (block.anchorId) {
    return <div data-anchor={block.anchorId} style={{ scrollMarginTop: 32 }}>{inner}</div>;
  }
  return inner;
}

function ConceptIntro({ b, onOpenEntity }) {
  return (
    <div style={{
      background: TT.surface, border: `1px solid ${TT.borderSoft}`,
      borderRadius: 16, padding: "26px 28px",
      borderLeft: `4px solid ${TT.coral}`,
    }}>
      <Eyebrow color={TT.coral}>Concept · introducing</Eyebrow>
      <div style={{ fontFamily: FF.serif, fontSize: 26, fontWeight: 500, marginTop: 8, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
        {b.title}
      </div>
      <div style={{ fontFamily: FF.serif, fontSize: 18, lineHeight: 1.55, color: TT.ink, marginTop: 14, textWrap: "pretty" }}>
        <InlineProse text={b.body} onEntityClick={onOpenEntity} />
      </div>
    </div>
  );
}

function MentalModel({ b, onOpenEntity }) {
  return (
    <div style={{
      background: TT.sageBg, border: `1px solid ${TT.borderSoft}`,
      borderRadius: 16, padding: "24px 26px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 9, background: TT.sage,
          color: TT.bg, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 1.5c-2.5 0-4 2-4 4 0 1.5.7 2.6 1.7 3.4v2.6h4.6V8.9C10.3 8.1 11 7 11 5.5c0-2-1.5-4-4-4z"/>
            <path d="M5.5 12.5h3"/>
          </svg>
        </div>
        <Eyebrow color={TT.sageInk}>Mental model</Eyebrow>
      </div>
      <div style={{ fontFamily: FF.serif, fontSize: 22, fontWeight: 500, marginTop: 10, lineHeight: 1.25, letterSpacing: "-0.005em", color: TT.ink }}>
        {b.title}
      </div>
      <div style={{ fontFamily: FF.serif, fontSize: 18, lineHeight: 1.55, color: TT.ink, marginTop: 12, textWrap: "pretty" }}>
        <InlineProse text={b.body} onEntityClick={onOpenEntity} />
      </div>
      {b.aside && (
        <div style={{
          marginTop: 16, paddingTop: 14, borderTop: `1px solid ${TT.borderSoft}`,
          fontFamily: FF.sans, fontSize: 13.5, color: TT.ink2, lineHeight: 1.5, fontStyle: "italic",
        }}>
          {b.aside}
        </div>
      )}
    </div>
  );
}

function Callout({ b, onOpenEntity }) {
  const ACCENT = b.tone === "warn" ? TT.coral : (b.tone === "info" ? TT.sage : TT.butterInk);
  const BG     = b.tone === "warn" ? TT.coralBg : (b.tone === "info" ? TT.sageBg : TT.butterBg);
  return (
    <div style={{
      background: BG, border: `1px solid ${TT.borderSoft}`,
      borderRadius: 14, padding: "18px 22px",
      display: "grid", gridTemplateColumns: "28px 1fr", gap: 14,
    }}>
      <div style={{ paddingTop: 2 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 12, background: ACCENT, color: TT.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: FF.serif, fontSize: 14, fontWeight: 700,
        }}>?</div>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: ACCENT, fontFamily: FF.sans, marginBottom: 4 }}>
          {b.title}
        </div>
        <div style={{ fontFamily: FF.serif, fontSize: 16, lineHeight: 1.5, color: TT.ink, textWrap: "pretty" }}>
          <InlineProse text={b.body} onEntityClick={onOpenEntity} />
        </div>
      </div>
    </div>
  );
}

function BlockHeading({ b }) {
  return (
    <h2 style={{
      fontFamily: FF.serif, fontWeight: 500, fontSize: 28, lineHeight: 1.2,
      letterSpacing: "-0.015em", margin: "10px 0 -4px",
    }}>{b.text}</h2>
  );
}

function Prose({ b, onOpenEntity }) {
  return (
    <div style={{
      fontFamily: FF.serif, fontSize: 18, lineHeight: 1.62, color: TT.ink, textWrap: "pretty",
    }}>
      <InlineProse text={b.body} onEntityClick={onOpenEntity} />
    </div>
  );
}

function StepByStep({ b, onOpenEntity }) {
  return (
    <div style={{
      background: TT.surface, border: `1px solid ${TT.borderSoft}`,
      borderRadius: 16, padding: "22px 24px",
    }}>
      <Eyebrow color={TT.coral}>Step by step</Eyebrow>
      <div style={{ fontFamily: FF.serif, fontSize: 22, fontWeight: 500, marginTop: 8, lineHeight: 1.25, color: TT.ink }}>
        {b.title}
      </div>
      <ol style={{ margin: "16px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 14 }}>
        {b.steps.map((s, i) => (
          <li key={i} style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 14, alignItems: "flex-start" }}>
            <div style={{
              width: 28, height: 28, borderRadius: 10, background: TT.surface3,
              fontFamily: FF.mono, fontSize: 12, fontWeight: 700, color: TT.coralInk,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{i + 1}</div>
            <div style={{ paddingTop: 2 }}>
              <div style={{ fontFamily: FF.sans, fontSize: 14, fontWeight: 700, color: TT.ink, marginBottom: 4 }}>
                {s.t}
              </div>
              <div style={{ fontFamily: FF.serif, fontSize: 16, lineHeight: 1.5, color: TT.ink2, textWrap: "pretty" }}>
                <InlineProse text={s.b} onEntityClick={onOpenEntity} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function KeyTakeaways({ b }) {
  return (
    <div style={{
      background: TT.ink, color: TT.bg,
      borderRadius: 16, padding: "22px 26px",
    }}>
      <Eyebrow color={TT.coral} style={{ color: TT.coral }}>Key takeaways</Eyebrow>
      <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
        {b.items.map((t, i) => (
          <li key={i} style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 10, alignItems: "flex-start" }}>
            <span style={{ color: TT.coral, fontFamily: FF.mono, fontWeight: 700, paddingTop: 4 }}>—</span>
            <span style={{ fontFamily: FF.serif, fontSize: 17, lineHeight: 1.45, textWrap: "pretty" }}>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Misconception({ b, onOpenEntity }) {
  return (
    <div style={{
      background: TT.coralBg, border: `1px solid ${TT.borderSoft}`,
      borderRadius: 16, padding: "20px 24px",
    }}>
      <Eyebrow color={TT.coral}>Common misconception</Eyebrow>
      <div style={{
        fontFamily: FF.serif, fontSize: 20, fontWeight: 500, marginTop: 10, lineHeight: 1.3,
        color: TT.ink, fontStyle: "italic", textWrap: "pretty",
      }}>{b.claim}</div>
      <div style={{
        marginTop: 12, padding: "12px 14px", background: TT.surface, borderRadius: 10,
        fontFamily: FF.serif, fontSize: 16, lineHeight: 1.5, color: TT.ink, textWrap: "pretty",
        borderLeft: `3px solid ${TT.coral}`,
      }}>
        <span style={{ fontFamily: FF.sans, fontSize: 11, fontWeight: 700, color: TT.coral, letterSpacing: "0.1em", textTransform: "uppercase", marginRight: 8 }}>Actually</span>
        <InlineProse text={b.truth} onEntityClick={onOpenEntity} />
      </div>
    </div>
  );
}

function BeforeContinue({ b, onSection }) {
  const next = window.B.sections.find((s) => s.id === b.next);
  return (
    <div style={{
      background: TT.butterBg, border: `1px solid ${TT.borderSoft}`,
      borderRadius: 16, padding: "20px 22px",
    }}>
      <Eyebrow color={TT.butterInk}>Before you continue</Eyebrow>
      <div style={{ fontFamily: FF.serif, fontSize: 16, lineHeight: 1.55, color: TT.ink, marginTop: 10, textWrap: "pretty" }}>
        {b.body}
      </div>
      {next && (
        <button
          onClick={() => onSection(next.id)}
          style={{
            marginTop: 14, background: TT.ink, color: TT.bg, border: "none",
            padding: "10px 16px", borderRadius: 999, cursor: "pointer",
            fontFamily: FF.sans, fontSize: 13, fontWeight: 700,
            display: "inline-flex", alignItems: "center", gap: 8,
          }}
        >
          Continue to {next.n} · {next.title} <span>→</span>
        </button>
      )}
    </div>
  );
}

function SectionStub({ section, onSection }) {
  // Used for sections without authored body content yet — clean stub
  // so navigation feels complete, not broken.
  const idx = window.B.sections.findIndex((s) => s.id === section.id);
  const next = window.B.sections[idx + 1];
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{
        background: TT.surface, border: `1px dashed ${TT.borderHi}`,
        borderRadius: 16, padding: "32px 32px",
        fontFamily: FF.serif,
      }}>
        <Eyebrow color={TT.ink3}>Section preview</Eyebrow>
        <div style={{ fontSize: 22, fontWeight: 500, color: TT.ink, marginTop: 8, lineHeight: 1.3 }}>
          {section.blurb}
        </div>
        <div style={{ marginTop: 16, fontFamily: FF.sans, fontSize: 13, color: TT.ink3, lineHeight: 1.5 }}>
          This section's body isn't part of the interactive prototype — only §01 is fully authored
          so the block library is exercised end-to-end. Navigation, layout, and the surrounding
          chrome work as they will in the real report.
        </div>
        {section.relatedEntities && section.relatedEntities.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <Eyebrow>Entities introduced</Eyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {section.relatedEntities.map((eid) => {
                const e = window.B.entities.find((x) => x.id === eid);
                if (!e) return null;
                return (
                  <span key={eid} style={{
                    fontFamily: FF.mono, fontSize: 12, color: TT.coralInk,
                    background: TT.coralBg, padding: "4px 10px", borderRadius: 6,
                    fontWeight: 500,
                  }}>{e.name}</span>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {next && (
        <BeforeContinue b={{ body: `Move on when you're ready — ${next.title} picks up from here.`, next: next.id }} onSection={onSection} />
      )}
    </div>
  );
}

// — Section-header sub-graph banner — small "you are here" strip showing
// this section's entities + dashed leaders to entities defined elsewhere.
// Sits between the summary and the first block.

function SectionHeaderGraph({ section }) {
  const ids = section.relatedEntities || [];
  if (!ids.length) return null;
  return (
    <div style={{
      marginTop: 22, background: TT.surface, border: `1px solid ${TT.borderSoft}`,
      borderRadius: 12, padding: "10px 14px",
      display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center",
    }}>
      <div style={{ minWidth: 0 }}>
        <MiniGraph
          entityIds={ids}
          width={520} height={110}
          showExternal={true}
          compact
          onOpenGraph={(id) => window.__openGraph && window.__openGraph(id, "spotlight")}
        />
      </div>
      <div style={{ display: "grid", gap: 6, paddingRight: 4 }}>
        <Eyebrow color={TT.coral} style={{ fontSize: 9 }}>This section · in the graph</Eyebrow>
        <div style={{ fontFamily: FF.sans, fontSize: 11, color: TT.ink3, lineHeight: 1.4, maxWidth: 160 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 16, height: 1, background: TT.ink, opacity: 0.4 }} />
            in section
          </span>
          <br />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 16, borderTop: `1px dashed ${TT.coral}`, opacity: 0.7 }} />
            links elsewhere
          </span>
        </div>
        <button
          onClick={() => window.__openGraph && window.__openGraph(ids[0], "spotlight")}
          style={{
            background: "transparent", border: "none", padding: 0, cursor: "pointer",
            fontFamily: FF.mono, fontSize: 10.5, color: TT.coral, fontWeight: 600,
            letterSpacing: "0.04em", textAlign: "left",
          }}>
          see full graph →
        </button>
      </div>
    </div>
  );
}

// — Right rail —

function RightRail({ section, onMode, onOpenEntity }) {
  const B = window.B;
  const related = (section.relatedEntities || []).map((id) => B.entities.find((e) => e.id === id)).filter(Boolean);

  return (
    <aside style={{
      width: 280, flex: "0 0 280px",
      borderLeft: `1px solid ${TT.borderSoft}`,
      padding: "32px 24px 96px",
      position: "sticky", top: 60, alignSelf: "flex-start",
      height: "calc(100vh - 60px)", overflow: "auto",
      background: TT.bg,
    }}>
      {/* Mini-graph — this section's neighborhood */}
      {related.length >= 2 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <Eyebrow color={TT.coral}>Neighborhood</Eyebrow>
            <button
              onClick={() => window.__openGraph && window.__openGraph(related[0].id, "spotlight")}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                fontFamily: FF.mono, fontSize: 10.5, color: TT.coral, fontWeight: 600,
                letterSpacing: "0.04em", padding: 0,
              }}>
              expand →
            </button>
          </div>
          <div style={{
            marginTop: 10, background: TT.surface,
            border: `1px solid ${TT.borderSoft}`, borderRadius: 10,
            padding: "10px 8px",
          }}>
            <MiniGraph
              entityIds={related.map((e) => e.id)}
              width={220} height={160}
              showExternal={true}
              compact
              onOpenGraph={(id) => window.__openGraph && window.__openGraph(id, "spotlight")}
            />
          </div>
        </div>
      )}

      <Eyebrow color={TT.coral}>Related entities</Eyebrow>
      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        {related.length === 0 && <div style={{ fontSize: 12, color: TT.ink3 }}>None linked yet.</div>}
        {related.slice(0, 8).map((e) => (
          <button
            key={e.id}
            onClick={() => onOpenEntity(e.id)}
            style={{
              textAlign: "left", border: `1px solid ${TT.borderSoft}`,
              background: TT.surface, padding: "9px 11px", borderRadius: 10,
              cursor: "pointer", fontFamily: FF.sans,
              transition: "background .12s, transform .12s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = TT.coralBg; e.currentTarget.style.transform = "translateX(2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = TT.surface; e.currentTarget.style.transform = "none"; }}
          >
            <div style={{ fontFamily: FF.mono, fontSize: 12, color: TT.coralInk, fontWeight: 600 }}>{e.name}</div>
            <div style={{ fontSize: 11.5, color: TT.ink3, marginTop: 3, lineHeight: 1.4, textWrap: "pretty" }}>{e.shortDef}</div>
          </button>
        ))}
      </div>

      <div style={{ height: 1, background: TT.borderSoft, margin: "24px 0" }} />

      <Eyebrow color={TT.sage}>Sources</Eyebrow>
      <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
        {window.B.sources.slice(0, 3).map((s) => (
          <div key={s.id} style={{ padding: "8px 10px", background: TT.surface, borderRadius: 8, border: `1px solid ${TT.borderSoft}` }}>
            <div style={{ fontSize: 12.5, color: TT.ink, fontFamily: FF.sans, fontWeight: 600 }}>{s.title}</div>
            <div style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3, marginTop: 2 }}>{s.path || s.host}</div>
          </div>
        ))}
        <button
          onClick={() => onMode("reference")}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            fontFamily: FF.mono, fontSize: 11, color: TT.sage, fontWeight: 600,
            padding: "4px 0", textAlign: "left",
          }}
        >all {window.B.sources.length} sources →</button>
      </div>
    </aside>
  );
}

Object.assign(window, { GuidedView });

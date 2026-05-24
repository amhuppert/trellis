// Sketch-page primitives: section header, sketch frame, eyebrow, captions.

function Eyebrow({ children, color, style }) {
  return (
    <div style={{
      fontFamily: FF.mono, fontSize: 10.5, letterSpacing: "0.18em",
      textTransform: "uppercase", fontWeight: 600,
      color: color || TT.ink3, ...style,
    }}>{children}</div>
  );
}

// Big page-level section divider (like a chapter break in the dossier).
function ChapterBreak({ n, title, sub }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "baseline", gap: 24,
      padding: "64px 0 24px", borderTop: `1px solid ${TT.borderSoft}`, marginTop: 48,
    }}>
      <div style={{
        fontFamily: FF.mono, fontSize: 11, color: TT.ink3, letterSpacing: "0.18em",
        textTransform: "uppercase", fontWeight: 600,
      }}>{n}</div>
      <div>
        <h2 style={{
          fontFamily: FF.serif, fontWeight: 500, fontSize: 36, lineHeight: 1.08,
          letterSpacing: "-0.018em", margin: 0, textWrap: "balance",
        }}>{title}</h2>
        {sub && (
          <p style={{
            fontFamily: FF.serif, fontSize: 17, lineHeight: 1.55, color: TT.ink2,
            margin: "10px 0 0", maxWidth: 680, textWrap: "pretty",
          }}>{sub}</p>
        )}
      </div>
    </div>
  );
}

// One sketch — a header strip (n · title · tag) + a body card + a side caption.
function Sketch({ n, title, tag, summary, pros, cons, nav, children, height = 460 }) {
  return (
    <section style={{
      display: "grid", gridTemplateColumns: "minmax(0,1fr) 280px", gap: 28,
      alignItems: "start", margin: "36px 0 8px",
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14,
          paddingBottom: 12, borderBottom: `1px dashed ${TT.borderSoft}`,
        }}>
          <span style={{
            fontFamily: FF.mono, fontSize: 11, color: TT.ink3, fontWeight: 600,
            letterSpacing: "0.12em",
          }}>SKETCH {n}</span>
          <h3 style={{
            fontFamily: FF.serif, fontWeight: 500, fontSize: 24, lineHeight: 1.15,
            letterSpacing: "-0.012em", margin: 0, color: TT.ink, flex: 1, textWrap: "balance",
          }}>{title}</h3>
          {tag && (
            <span style={{
              fontFamily: FF.mono, fontSize: 10, color: TT.ink3, letterSpacing: "0.08em",
              textTransform: "uppercase", border: `1px solid ${TT.borderHi}`,
              borderRadius: 999, padding: "2px 8px",
            }}>{tag}</span>
          )}
        </div>
        <div style={{
          background: TT.surface, border: `1px solid ${TT.borderSoft}`,
          borderRadius: 16, padding: 0, overflow: "hidden",
          height, boxShadow: TT.shadow, position: "relative",
        }}>
          {children}
        </div>
      </div>

      <aside style={{
        position: "sticky", top: 24, alignSelf: "start",
        fontFamily: FF.sans, fontSize: 13.5, lineHeight: 1.55, color: TT.ink2,
      }}>
        {summary && (
          <p style={{
            margin: "0 0 14px", fontFamily: FF.serif, fontSize: 15.5, lineHeight: 1.55,
            color: TT.ink, textWrap: "pretty",
          }}>{summary}</p>
        )}
        {pros && (
          <CaptionList label="Strengths" color={TT.sage} items={pros} />
        )}
        {cons && (
          <CaptionList label="Trade-offs" color={TT.coral} items={cons} />
        )}
        {nav && (
          <CaptionList label="Navigation" color={TT.ink3} items={nav} />
        )}
      </aside>
    </section>
  );
}

function CaptionList({ label, color, items }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <Eyebrow color={color}>{label}</Eyebrow>
      <ul style={{
        margin: "6px 0 0", padding: 0, listStyle: "none",
        display: "grid", gap: 5,
      }}>
        {items.map((it, i) => (
          <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{
              width: 4, height: 4, borderRadius: 4, background: color,
              marginTop: 9, flexShrink: 0, opacity: 0.7,
            }} />
            <span style={{ textWrap: "pretty" }}>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Tiny "Annotation" label drawn at a position over a sketch.
function Annotation({ x, y, children, anchor = "tl" }) {
  const horiz = anchor.includes("r") ? "right" : "left";
  const vert  = anchor.includes("b") ? "bottom": "top";
  return (
    <div style={{
      position: "absolute", [horiz]: x, [vert]: y,
      fontFamily: FF.mono, fontSize: 10, color: TT.ink3, letterSpacing: "0.08em",
      textTransform: "uppercase", pointerEvents: "none",
      background: "rgba(244,242,236,0.85)", padding: "2px 6px", borderRadius: 4,
      whiteSpace: "nowrap",
    }}>{children}</div>
  );
}

// Pill / chip styling used by toolbars in every sketch.
const chip = (active, color = TT.ink) => ({
  background: active ? color : "transparent",
  color: active ? TT.bg : TT.ink2,
  border: `1px solid ${active ? color : TT.borderSoft}`,
  borderRadius: 999, padding: "4px 10px",
  fontFamily: FF.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em",
  cursor: "pointer", textTransform: "lowercase",
});

const btn = (kind = "ghost") => ({
  background: kind === "primary" ? TT.ink : TT.surface,
  color: kind === "primary" ? TT.bg : TT.ink2,
  border: `1px solid ${kind === "primary" ? TT.ink : TT.borderSoft}`,
  borderRadius: 8, padding: "6px 11px",
  fontFamily: FF.sans, fontSize: 12, fontWeight: 600,
  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
});

// SVG arrowhead defs (reused).
function ArrowMarkers() {
  return (
    <defs>
      <marker id="arr-ink"  markerWidth="6" markerHeight="6" refX="5.5" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L6,3 z" fill={TT.ink} />
      </marker>
      <marker id="arr-soft" markerWidth="6" markerHeight="6" refX="5.5" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L6,3 z" fill={TT.ink3} />
      </marker>
      <marker id="arr-coral" markerWidth="6" markerHeight="6" refX="5.5" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L6,3 z" fill={TT.coral} />
      </marker>
    </defs>
  );
}

Object.assign(window, {
  Eyebrow, ChapterBreak, Sketch, CaptionList, Annotation,
  chip, btn, ArrowMarkers,
});

// Navigation patterns + integration mockups.

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION PATTERNS
// Each pattern is a small standalone widget showing one piece of how the user
// drives the graph view. Composable; the live KG view would mix them.
// ─────────────────────────────────────────────────────────────────────────────

function NavPatterns() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 24 }}>
      <PatternCard
        eyebrow="Command palette"
        title="⌘K — jump to anything"
        caption="Search across entity names, aliases, and relationship types. Inline previews so the user can preview without committing.">
        <CommandPaletteMock />
      </PatternCard>

      <PatternCard
        eyebrow="Trail"
        title="Recently focused entities"
        caption="A horizontal trail of the user's last hops. Click any chip to rewind; the URL mirrors the trail so a tab restore lands the user back where they were.">
        <TrailMock />
      </PatternCard>

      <PatternCard
        eyebrow="Pins"
        title="Keep entities on screen"
        caption="Pinned entities never get dimmed, no matter what filter or focus is active. Useful when comparing how two distant concepts relate.">
        <PinsMock />
      </PatternCard>

      <PatternCard
        eyebrow="Keyboard"
        title="Tab-completion graph traversal"
        caption="Once an entity is focused, J / K cycle through its neighbors; Enter follows the highlighted edge; Backspace climbs back. Power users never reach for the mouse.">
        <KeyboardMock />
      </PatternCard>

      <PatternCard
        eyebrow="Filter"
        title="Type · strength · section · evidence"
        caption="Four orthogonal axes. Filters are AND-ed; chips show counts after filtering so empty filters never sneak in.">
        <FilterMock />
      </PatternCard>

      <PatternCard
        eyebrow="Why is this here?"
        title="Edge provenance"
        caption="Clicking any edge surfaces the source references that justified it — the sentence in the report, the file location, the URL. The graph is never decoration.">
        <EdgeProvenanceMock />
      </PatternCard>
    </div>
  );
}

function PatternCard({ eyebrow, title, caption, children }) {
  return (
    <div style={{
      background: TT.surface, border: `1px solid ${TT.borderSoft}`, borderRadius: 14,
      padding: 18, display: "grid", gap: 12,
    }}>
      <div>
        <Eyebrow color={TT.coral}>{eyebrow}</Eyebrow>
        <div style={{ fontFamily: FF.serif, fontSize: 18, lineHeight: 1.2, fontWeight: 500, color: TT.ink, marginTop: 4, letterSpacing: "-0.01em", textWrap: "balance" }}>
          {title}
        </div>
      </div>
      {children}
      <div style={{
        fontFamily: FF.serif, fontSize: 13.5, lineHeight: 1.5, color: TT.ink2,
        textWrap: "pretty",
      }}>{caption}</div>
    </div>
  );
}

function CommandPaletteMock() {
  return (
    <div style={{
      background: TT.surface2, borderRadius: 10, border: `1px solid ${TT.borderSoft}`,
      padding: 12, fontFamily: FF.sans,
    }}>
      <div style={{
        background: TT.surface, border: `1px solid ${TT.borderHi}`, borderRadius: 8,
        padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
      }}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke={TT.ink2} strokeWidth="1.5"><circle cx="5.5" cy="5.5" r="3.5" /><path d="M8.5 8.5L11 11" /></svg>
        <span style={{ fontFamily: FF.mono, fontSize: 13, color: TT.ink }}>snap<span style={{ background: TT.coralBg, color: TT.coralInk, padding: "1px 2px" }}>|</span></span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3 }}>esc</span>
      </div>
      {[
        { name: "snapshot",  type: "concept", hit: "snap" },
        { name: "xip-list",  type: "concept", hit: "snap-related" },
        { name: "snapshot isolation", type: "alias", hit: "snap" },
      ].map((r, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "6px 8px", borderRadius: 6,
          background: i === 0 ? TT.coralBg : "transparent",
        }}>
          <span style={{ fontFamily: FF.mono, fontSize: 12.5, color: TT.coralInk, fontWeight: 600 }}>{r.name}</span>
          <span style={{ fontFamily: FF.mono, fontSize: 9, color: TT.ink3, letterSpacing: "0.06em", textTransform: "uppercase" }}>{r.type}</span>
          {i === 0 && <span style={{ marginLeft: "auto", fontFamily: FF.mono, fontSize: 10, color: TT.ink4 }}>↵ focus  ⇧↵ open</span>}
        </div>
      ))}
    </div>
  );
}

function TrailMock() {
  const items = [
    { name: "mvcc",      type: "concept" },
    { name: "snapshot",  type: "concept" },
    { name: "vacuum",    type: "feature" },
    { name: "freezing",  type: "concept" },
  ];
  return (
    <div style={{
      background: TT.surface2, borderRadius: 10, border: `1px solid ${TT.borderSoft}`,
      padding: "16px 14px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <React.Fragment key={i}>
              <span style={{
                background: last ? TT.ink : "transparent",
                color: last ? TT.bg : TYPE_COLOR[it.type],
                border: `1px solid ${last ? TT.ink : TT.borderSoft}`,
                borderRadius: 999, padding: "3px 10px",
                fontFamily: FF.mono, fontSize: 11.5, fontWeight: 600,
              }}>{it.name}</span>
              {!last && <span style={{ color: TT.ink4, fontFamily: FF.mono, fontSize: 11 }}>›</span>}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{
        marginTop: 12, fontFamily: FF.mono, fontSize: 10, color: TT.ink3,
        letterSpacing: "0.06em", padding: "5px 8px", background: TT.surface,
        borderRadius: 6, border: `1px solid ${TT.borderSoft}`,
      }}>
        /graph?focus=freezing&trail=mvcc,snapshot,vacuum,freezing
      </div>
    </div>
  );
}

function PinsMock() {
  return (
    <div style={{
      background: TT.surface2, borderRadius: 10, border: `1px solid ${TT.borderSoft}`,
      padding: "14px 14px", display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.ink3, letterSpacing: "0.08em", textTransform: "uppercase" }}>pinned · 2</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: FF.mono, fontSize: 10, color: TT.coral }}>+ pin focus</span>
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {[
          { name: "snapshot", type: "concept", note: "what's a reader carrying" },
          { name: "vacuum",   type: "feature", note: "who reclaims dead tuples" },
        ].map((p, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            background: TT.surface, border: `1px solid ${TT.borderSoft}`,
            borderRadius: 8, padding: "6px 10px",
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill={TT.coral}><path d="M5 0 L7 4 L10 4.5 L7.5 7 L8 10 L5 8 L2 10 L2.5 7 L0 4.5 L3 4 z"/></svg>
            <span style={{ fontFamily: FF.mono, fontSize: 12, color: TYPE_COLOR[p.type], fontWeight: 600 }}>{p.name}</span>
            <span style={{ fontFamily: FF.serif, fontSize: 12, color: TT.ink3, fontStyle: "italic" }}>{p.note}</span>
            <span style={{ flex: 1 }} />
            <span style={{ fontFamily: FF.mono, fontSize: 11, color: TT.ink4 }}>×</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KeyboardMock() {
  return (
    <div style={{
      background: TT.surface2, borderRadius: 10, border: `1px solid ${TT.borderSoft}`,
      padding: "14px 16px", display: "grid", gap: 8,
    }}>
      {[
        ["J / K",     "next / previous neighbor"],
        ["↵",         "focus the highlighted neighbor"],
        ["⌫",         "climb back along the trail"],
        ["F",         "toggle filters panel"],
        ["P",         "pin / unpin current focus"],
        ["⇧E",        "open in entity reference"],
        ["⇧S",        "jump to the section that defines this"],
      ].map(([k, desc]) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: FF.sans, fontSize: 12.5 }}>
          <span style={{
            fontFamily: FF.mono, fontSize: 11, color: TT.ink2,
            background: TT.surface, border: `1px solid ${TT.borderHi}`,
            borderRadius: 4, padding: "2px 7px", minWidth: 38, textAlign: "center", fontWeight: 600,
          }}>{k}</span>
          <span style={{ color: TT.ink2 }}>{desc}</span>
        </div>
      ))}
    </div>
  );
}

function FilterMock() {
  return (
    <div style={{
      background: TT.surface2, borderRadius: 10, border: `1px solid ${TT.borderSoft}`,
      padding: "14px 14px", display: "grid", gap: 10,
    }}>
      {[
        { label: "type",     items: [["concept", 9, true], ["pattern", 1, true], ["feature", 1, true], ["file", 1, false]] },
        { label: "strength", items: [["weak+", 23, true], ["medium+", 19, false], ["strong+", 12, false]] },
        { label: "section",  items: [["foundations", 1, true], ["snapshots", 3, true], ["vacuum", 4, true], ["edges", 3, true], ["+3 more", 5, false]] },
      ].map((row) => (
        <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{
            fontFamily: FF.mono, fontSize: 10, color: TT.ink3,
            width: 64, letterSpacing: "0.08em", textTransform: "uppercase",
          }}>{row.label}</span>
          {row.items.map(([label, count, on], i) => (
            <span key={i} style={{
              background: on ? TT.ink : TT.surface, color: on ? TT.bg : TT.ink2,
              border: `1px solid ${on ? TT.ink : TT.borderSoft}`,
              borderRadius: 999, padding: "2px 8px",
              fontFamily: FF.mono, fontSize: 10.5, fontWeight: 600,
            }}>
              {label} <span style={{ opacity: 0.55, marginLeft: 2 }}>{count}</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function EdgeProvenanceMock() {
  return (
    <div style={{
      background: TT.surface2, borderRadius: 10, border: `1px solid ${TT.borderSoft}`,
      padding: "14px 14px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FF.mono, fontSize: 12.5 }}>
        <span style={{ color: TT.coralInk, fontWeight: 600 }}>freezing</span>
        <span style={{ color: TT.ink3 }}>— prevents →</span>
        <span style={{ color: TT.coralInk, fontWeight: 600 }}>wraparound</span>
        <span style={{ flex: 1 }} />
        <span style={{
          background: TT.ink, color: TT.bg,
          fontFamily: FF.mono, fontSize: 9, padding: "2px 6px", borderRadius: 4,
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>strong</span>
      </div>
      <div style={{
        marginTop: 10, paddingTop: 10, borderTop: `1px solid ${TT.borderSoft}`,
        display: "grid", gap: 6,
      }}>
        {[
          { kind: "section", label: "§5 VACUUM & bloat · vac-freeze", arrow: true },
          { kind: "code", label: "src/backend/access/heap/heapam.c · L4218–L4256" },
          { kind: "url",  label: "postgresql.org/docs/current/routine-vacuuming.html" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FF.mono, fontSize: 11 }}>
            <span style={{
              fontSize: 9, color: TT.ink3, letterSpacing: "0.08em", textTransform: "uppercase",
              width: 50,
            }}>{s.kind}</span>
            <span style={{ color: TT.sage }}>{s.label}</span>
            {s.arrow && <span style={{ marginLeft: "auto", color: TT.coral }}>→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION MOCKUPS
// How the graph view connects to the rest of the app — every other surface
// should be able to drop the reader into the graph, and the graph should be
// able to drop them right back out.
// ─────────────────────────────────────────────────────────────────────────────

function IntegrationMocks() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 24 }}>
      <IntegrationCard
        title="Inline EntityRef hover card → graph"
        caption="Every <EntityRef /> already hover-cards. Add one button: 'see in graph'. The graph opens with that entity focused; the reader's place in the guided text isn't lost — the trail remembers where they came from.">
        <HoverCardMock />
      </IntegrationCard>

      <IntegrationCard
        title="Right-rail mini-graph while reading"
        caption="A small spotlight of the current section's entities sits in the guided view's right rail. As the reader scrolls, the visible subsection's entities highlight. Click any node to jump into the full graph view focused there.">
        <RightRailMock />
      </IntegrationCard>

      <IntegrationCard
        title="Synthesis node ↔ entity highlight"
        caption="When the reader is on a synthesis node, the graph dim-highlights only the entities that node draws from. The graph becomes the visual cross-reference for the synthesis tree.">
        <SynthesisLinkMock />
      </IntegrationCard>

      <IntegrationCard
        title="Section header — sub-graph preview"
        caption="Each section starts with a 60-pixel-tall sub-graph banner: just this section's entities and their links to entities elsewhere. A reader sees, before reading, where this section sits in the larger picture.">
        <SectionHeaderMock />
      </IntegrationCard>
    </div>
  );
}

function IntegrationCard({ title, caption, children }) {
  return (
    <div style={{
      background: TT.surface, border: `1px solid ${TT.borderSoft}`, borderRadius: 14,
      padding: 0, overflow: "hidden",
    }}>
      <div style={{ padding: "16px 18px 0" }}>
        <Eyebrow color={TT.sage}>Integration</Eyebrow>
        <div style={{
          fontFamily: FF.serif, fontSize: 18, lineHeight: 1.2, fontWeight: 500,
          color: TT.ink, marginTop: 4, letterSpacing: "-0.01em", textWrap: "balance",
        }}>{title}</div>
      </div>
      <div style={{ padding: "14px 18px" }}>{children}</div>
      <div style={{
        padding: "12px 18px 16px", borderTop: `1px solid ${TT.borderSoft}`,
        background: TT.surface2,
        fontFamily: FF.serif, fontSize: 13.5, lineHeight: 1.5, color: TT.ink2,
        textWrap: "pretty",
      }}>{caption}</div>
    </div>
  );
}

// — Hover card mock — show a sentence with an EntityRef + hover card + new btn
function HoverCardMock() {
  return (
    <div style={{ background: TT.bg, borderRadius: 10, padding: "16px 18px", position: "relative", minHeight: 220 }}>
      <p style={{
        fontFamily: FF.serif, fontSize: 15, lineHeight: 1.55, color: TT.ink, margin: 0,
        textWrap: "pretty",
      }}>
        Each transaction reads from its own{" "}
        <span style={{
          fontFamily: FF.mono, fontSize: "0.92em",
          color: TT.coralInk, background: TT.coralBg, padding: "1px 6px",
          borderRadius: 4, borderBottom: `1px dotted ${TT.coral}`, fontWeight: 500,
        }}>snapshot</span>
        {" "}of the database — a frozen moment that ignores anything that hasn't committed yet.
      </p>

      {/* Hover card */}
      <div style={{
        position: "absolute", left: "31%", top: 56, width: 240,
        background: TT.surface, border: `1px solid ${TT.border}`, borderRadius: 10,
        padding: "12px 14px", boxShadow: TT.shadowHi, fontFamily: FF.sans,
        transform: "translateX(-30%)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: FF.mono, fontSize: 13, color: TT.coralInk, fontWeight: 600 }}>snapshot</span>
          <span style={{ fontFamily: FF.mono, fontSize: 9, color: TT.ink3, letterSpacing: "0.06em", textTransform: "uppercase" }}>concept</span>
        </div>
        <div style={{ fontFamily: FF.serif, fontSize: 12.5, lineHeight: 1.45, color: TT.ink, marginTop: 6, textWrap: "pretty" }}>
          The set of transaction ids that count as committed for a given backend.
        </div>
        <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${TT.borderSoft}`, display: "flex", gap: 6 }}>
          <button style={{
            background: "transparent", border: `1px solid ${TT.borderHi}`, borderRadius: 6,
            padding: "3px 8px", fontFamily: FF.sans, fontSize: 11, color: TT.ink2,
            cursor: "pointer", flex: 1,
          }}>open §</button>
          <button style={{
            background: TT.ink, border: "none", borderRadius: 6,
            padding: "3px 8px", fontFamily: FF.sans, fontSize: 11, color: TT.bg, fontWeight: 600,
            cursor: "pointer", flex: 1.2,
          }}>see in graph →</button>
        </div>
      </div>
    </div>
  );
}

// — Right rail mini-graph mock — a small spotlight of one section's entities
function RightRailMock() {
  // Use snapshots section entities.
  const ids = ["snapshot", "xip-list", "command-id", "xmin", "xmax"];
  const positions = [
    { x: 130, y: 70 },   // snapshot center
    { x: 60,  y: 30 },   // xip-list
    { x: 200, y: 30 },   // command-id
    { x: 50,  y: 120 },  // xmin (linked elsewhere)
    { x: 210, y: 120 },  // xmax (linked elsewhere)
  ];
  const edges = [
    [0, 1], [0, 2], [0, 3], [0, 4],
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 12, background: TT.bg, borderRadius: 10, padding: "12px 12px 12px 14px" }}>
      <div style={{
        background: TT.surface3, borderRadius: 8, padding: "10px 12px",
        fontFamily: FF.serif, fontSize: 13, lineHeight: 1.5, color: TT.ink2,
      }}>
        <Eyebrow style={{ fontSize: 9 }}>§3.2 Snapshots</Eyebrow>
        <p style={{ margin: "6px 0 0", textWrap: "pretty" }}>
          GetSnapshotData builds three small pieces of data: xmin, the xip list, and a command id…
        </p>
      </div>
      <div style={{
        background: TT.surface, border: `1px solid ${TT.borderSoft}`, borderRadius: 10,
        padding: "8px 6px 4px",
      }}>
        <div style={{ fontFamily: FF.mono, fontSize: 9, color: TT.ink3, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 4px 4px" }}>
          this section
        </div>
        <svg viewBox="0 0 260 160" style={{ width: "100%", height: 140 }}>
          {edges.map(([a, b], i) => (
            <line key={i} x1={positions[a].x} y1={positions[a].y} x2={positions[b].x} y2={positions[b].y}
              stroke={TT.ink} strokeOpacity="0.3" strokeWidth="1" />
          ))}
          {ids.map((id, i) => {
            const p = positions[i];
            const e = ENT.find((x) => x.id === id);
            const center = i === 0;
            return (
              <g key={id}>
                <circle cx={p.x} cy={p.y} r={center ? 16 : 8}
                  fill={center ? TT.ink : TT.surface}
                  stroke={center ? TT.coral : TYPE_COLOR[e.type]}
                  strokeWidth={center ? 2 : 1.4} />
                <text x={p.x} y={p.y + (center ? 4 : 0) + (center ? 0 : 16)} textAnchor="middle"
                  style={{ fontFamily: FF.mono, fontSize: center ? 10 : 9, fill: center ? TT.bg : TT.ink, fontWeight: 500 }}>
                  {e.name}
                </text>
              </g>
            );
          })}
        </svg>
        <button style={{
          width: "100%", background: "transparent", border: "none",
          color: TT.coral, fontFamily: FF.mono, fontSize: 10, fontWeight: 600,
          padding: "4px 0 6px", cursor: "pointer",
          borderTop: `1px solid ${TT.borderSoft}`, marginTop: 4,
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>see full graph →</button>
      </div>
    </div>
  );
}

// — Synthesis ↔ entity highlight mock — show synth nav + graph subset
function SynthesisLinkMock() {
  // Sub-graph subset
  const subset = new Set(["snapshot", "xip-list", "command-id", "visibility-map"]);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 12, background: TT.bg, borderRadius: 10, padding: 12 }}>
      <div style={{
        background: TT.surface, border: `1px solid ${TT.borderSoft}`, borderRadius: 8,
        padding: "10px 10px", fontFamily: FF.sans, fontSize: 12, color: TT.ink,
      }}>
        <Eyebrow style={{ fontSize: 9 }}>Synthesis tree</Eyebrow>
        <div style={{ marginTop: 8, display: "grid", gap: 4 }}>
          {[
            { label: "MVCC contract",    depth: 0, active: false },
            { label: "Storage",          depth: 1, active: false },
            { label: "Visibility",       depth: 1, active: true  },
            { label: "  · Snapshot",     depth: 2, active: false },
            { label: "  · Rules",        depth: 2, active: false },
            { label: "Maintenance",      depth: 1, active: false },
          ].map((n, i) => (
            <div key={i} style={{
              paddingLeft: 8 + n.depth * 10,
              fontSize: 11.5, fontWeight: n.active ? 700 : 400,
              color: n.active ? TT.bg : TT.ink2,
              background: n.active ? TT.ink : "transparent",
              padding: `4px 6px 4px ${8 + n.depth * 10}px`, borderRadius: 4,
            }}>{n.label}</div>
          ))}
        </div>
      </div>
      <div style={{
        background: TT.surface, border: `1px solid ${TT.borderSoft}`, borderRadius: 8,
        padding: "8px 10px",
      }}>
        <div style={{
          fontFamily: FF.mono, fontSize: 9, color: TT.coral,
          letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 4px",
        }}>visibility · {subset.size} entities</div>
        <svg viewBox="0 0 280 140" style={{ width: "100%", height: 130 }}>
          {/* layout: snapshot center, xip + cmd above, vm right */}
          {[
            { id: "snapshot",       x: 110, y: 70, r: 14 },
            { id: "xip-list",       x: 50,  y: 30, r: 9  },
            { id: "command-id",     x: 170, y: 30, r: 9  },
            { id: "visibility-map", x: 220, y: 100, r: 9 },
            // background unhighlighted
            { id: "mvcc",           x: 30,  y: 110, r: 7, dim: true },
            { id: "vacuum",         x: 250, y: 50, r: 7, dim: true },
            { id: "xmin",           x: 170, y: 110, r: 7, dim: true },
          ].map((n) => {
            const e = ENT.find((x) => x.id === n.id);
            const dim = n.dim;
            return (
              <g key={n.id} style={{ opacity: dim ? 0.18 : 1 }}>
                <circle cx={n.x} cy={n.y} r={n.r}
                  fill={n.id === "snapshot" ? TT.ink : TT.surface}
                  stroke={n.id === "snapshot" ? TT.coral : TYPE_COLOR[e.type]}
                  strokeWidth={n.id === "snapshot" ? 2 : 1.4} />
                <text x={n.x} y={n.y + n.r + 10} textAnchor="middle"
                  style={{ fontFamily: FF.mono, fontSize: 9, fill: TT.ink, fontWeight: 500 }}>{e.name}</text>
              </g>
            );
          })}
          {/* visible edges */}
          {[
            [110, 70, 50, 30], [110, 70, 170, 30], [110, 70, 220, 100],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={TT.coral} strokeOpacity="0.75" strokeWidth="1.5" />
          ))}
        </svg>
      </div>
    </div>
  );
}

// — Section header sub-graph banner
function SectionHeaderMock() {
  // Vacuum section entities + their external links
  const nodes = [
    { id: "vacuum",         x: 110, y: 35, big: true, inSection: true  },
    { id: "freezing",       x: 200, y: 22, inSection: true  },
    { id: "wraparound",     x: 290, y: 32, inSection: true  },
    { id: "visibility-map", x: 165, y: 70, inSection: true  },
    { id: "xmin",           x: 50,  y: 70, inSection: false },
    { id: "ctid",           x: 290, y: 70, inSection: false },
    { id: "snapshot",       x: 50,  y: 25, inSection: false },
  ];
  const edges = [
    [0, 1], [0, 3], [1, 2], [1, 4],
    [0, 4], [0, 5], [0, 6],
  ];

  return (
    <div style={{ background: TT.bg, borderRadius: 10, padding: 12 }}>
      <div style={{
        background: TT.surface, border: `1px solid ${TT.borderSoft}`, borderRadius: 12,
        padding: "12px 18px",
      }}>
        <Eyebrow style={{ fontSize: 9 }}>§5 · Maintenance</Eyebrow>
        <h4 style={{
          fontFamily: FF.serif, fontSize: 20, lineHeight: 1.15, fontWeight: 500,
          margin: "4px 0 8px", letterSpacing: "-0.012em",
        }}>VACUUM &amp; bloat</h4>
        <svg viewBox="0 0 350 100" style={{ width: "100%", height: 86 }}>
          {edges.map(([a, b], i) => (
            <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
              stroke={(nodes[a].inSection && nodes[b].inSection) ? TT.ink : TT.coral}
              strokeOpacity={(nodes[a].inSection && nodes[b].inSection) ? 0.3 : 0.55}
              strokeWidth="1" strokeDasharray={(nodes[a].inSection && nodes[b].inSection) ? "0" : "3 3"} />
          ))}
          {nodes.map((n) => {
            const e = ENT.find((x) => x.id === n.id);
            return (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={n.big ? 12 : 6.5}
                  fill={n.inSection ? TT.surface : TT.bg}
                  stroke={TYPE_COLOR[e.type]}
                  strokeOpacity={n.inSection ? 1 : 0.5}
                  strokeWidth={n.big ? 2 : 1.3} />
                <text x={n.x} y={n.y - (n.big ? 18 : 11)} textAnchor="middle"
                  style={{
                    fontFamily: FF.mono, fontSize: n.big ? 11 : 9,
                    fill: n.inSection ? TT.ink : TT.ink3, fontWeight: 500,
                  }}>{e.name}</text>
              </g>
            );
          })}
        </svg>
        <div style={{
          marginTop: 4, display: "flex", gap: 14, fontFamily: FF.mono, fontSize: 9,
          color: TT.ink3, letterSpacing: "0.06em", textTransform: "uppercase",
        }}>
          <span><span style={{ color: TT.ink }}>━</span> in section</span>
          <span><span style={{ color: TT.coral }}>┄┄</span> links elsewhere</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { NavPatterns, IntegrationMocks });

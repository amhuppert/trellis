// Page composition — designer's exploration document.

function GraphDesignDoc() {
  return (
    <div style={{
      maxWidth: 1180, margin: "0 auto", padding: "56px 40px 120px",
      fontFamily: FF.sans, color: TT.ink,
    }}>
      {/* Header */}
      <header style={{ marginBottom: 36 }}>
        <Eyebrow color={TT.coral}>Trellis · design exploration</Eyebrow>
        <h1 style={{
          fontFamily: FF.serif, fontWeight: 500, fontSize: 56, lineHeight: 1.04,
          letterSpacing: "-0.024em", margin: "10px 0 14px", textWrap: "balance",
        }}>
          The knowledge graph view
        </h1>
        <p style={{
          fontFamily: FF.serif, fontSize: 19, lineHeight: 1.55, color: TT.ink2,
          maxWidth: 760, margin: 0, textWrap: "pretty",
        }}>
          Every report carries an explicit knowledge graph — entities, typed
          relationships, source-grounded edges. The graph view is where that
          structure becomes navigable. This document sketches five ways the
          view could look, the navigation patterns I'd want underneath, and
          how it could plug into the rest of the app.
        </p>
        <div style={{
          marginTop: 24, display: "flex", gap: 24, flexWrap: "wrap",
          fontFamily: FF.mono, fontSize: 11, color: TT.ink3,
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          <span>Sample report · how postgres mvcc works</span>
          <span style={{ color: TT.ink4 }}>·</span>
          <span>16 entities · 23 edges · 7 sections</span>
        </div>
      </header>

      {/* CONTEXT — what we need to design for */}
      <section style={{
        background: TT.surface2, border: `1px solid ${TT.borderSoft}`,
        borderRadius: 16, padding: "28px 32px", marginBottom: 12,
      }}>
        <Eyebrow>What the view needs to do</Eyebrow>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22,
          marginTop: 16,
        }}>
          {[
            ["Navigation, not decoration",
             "The graph is a way to get somewhere. Every node and edge should be clickable and lead the reader into the section, entity, or source that justifies it."],
            ["Reveal structure the prose hides",
             "Hubs, isolates, and unexpected bridges between distant sections are facts about the report you can't easily see by scrolling. The graph should surface them."],
            ["Survive density",
             "Sixteen entities is small. Postgres-MVCC fits on one screen. A codebase report could have 200+ — the view has to filter, cluster, and focus, not just zoom out further."],
            ["Be a citizen, not an island",
             "Every entity reference in the report should be able to open the graph here. The graph should bounce the reader back to the prose at the right anchor. No dead-ends in either direction."],
          ].map(([h, p], i) => (
            <div key={i}>
              <div style={{
                fontFamily: FF.serif, fontSize: 17, fontWeight: 500, color: TT.ink,
                lineHeight: 1.25, textWrap: "balance",
              }}>{h}</div>
              <div style={{
                fontFamily: FF.serif, fontSize: 14.5, lineHeight: 1.55, color: TT.ink2,
                marginTop: 6, textWrap: "pretty",
              }}>{p}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SKETCHES — 5 layout proposals */}
      <ChapterBreak n="01 · Layouts" title="Five sketches" sub="Each shows the same data through a different lens. They are not mutually exclusive — the real view probably ships with a small layout switcher (atlas / spotlight / regions) plus matrix and path as dedicated tools." />

      <Sketch
        n="1"
        title="The Atlas"
        tag="default view"
        summary="The whole graph at once, force-directed. Node size encodes degree centrality so hubs are visually obvious. Hover lights up a neighborhood; click sets focus."
        pros={[
          "First impression of the report's structure at a glance",
          "Filters and search live in one toolbar",
          "Familiar — closest to what users expect from 'graph view'",
        ]}
        cons={[
          "Hairball risk past ~50 nodes",
          "Force-directed layouts are non-deterministic; we need a seed",
        ]}
        nav={[
          "⌘K for fuzzy search across names + aliases",
          "Hover to highlight, click to focus",
          "Filter by type and minimum strength; layout chooser switches to spotlight / regions",
        ]}
        height={460}
      >
        <SketchAtlas />
      </Sketch>

      <Sketch
        n="2"
        title="The Spotlight"
        tag="reading companion"
        summary="One entity at the centre, rings of neighbors at distance 1, 2, 3. The reader 'climbs' through the graph one node at a time, with a breadcrumb trail showing where they've been. Best for following a thread."
        pros={[
          "No hairball, ever — the visible set is bounded by hop distance",
          "Trail of recently focused entities makes it easy to back out",
          "Maps cleanly to the question 'what's near this idea?'",
        ]}
        cons={[
          "Hides the big picture by design",
          "Three rings is roughly the legibility ceiling",
        ]}
        nav={[
          "Click any node to recenter; the trail records the hop",
          "1/2/3-hop chips set neighborhood depth",
          "Side panel always shows the current focus + 'open section' jump",
        ]}
        height={460}
      >
        <SketchSpotlight />
      </Sketch>

      <Sketch
        n="3"
        title="The Regions"
        tag="map · structure"
        summary="Entities clustered by the section that primarily defines them. Section regions are soft tinted shapes; cross-section edges are the highlighted bridges — the conceptual links worth following. Doubles as a content map."
        pros={[
          "Connects the KG to the section tree visibly",
          "Cross-section edges are the most interesting edges; this view makes them dominant",
          "Could replace the standalone 'map' view entirely",
        ]}
        cons={[
          "Forces a strict primary-section per entity (which we already require)",
          "Less useful for codebases where most entities cluster under one section",
        ]}
        nav={[
          "Hover a region chip to isolate that section's sub-graph",
          "Click a node to drop into that entity's reference view",
          "Click a region label to jump into the section itself",
        ]}
        height={460}
      >
        <SketchRegions />
      </Sketch>

      <Sketch
        n="4"
        title="The Matrix"
        tag="analyst · audit"
        summary="Entities × entities adjacency grid. Cells filled where a relationship exists; darker = stronger. Rows and columns grouped by type, so type blocks are visible as squares. Great for spotting hubs and gaps that disappear in a node-link layout."
        pros={[
          "Hubs and isolates are literal — dense rows / empty rows",
          "Reveals asymmetry: directed cells only fire on one side of the diagonal",
          "Scales much better than node-link past ~50 entities",
        ]}
        cons={[
          "Feels analytical, not exploratory — the reader's job, not the learner's",
          "Hard to follow a multi-hop path here",
        ]}
        nav={[
          "Hover any cell for the relationship type + strength",
          "Click cell to focus on either endpoint and switch to atlas / spotlight",
          "Sort rows by type, degree, or section",
        ]}
        height={460}
      >
        <SketchMatrix />
      </Sketch>

      <Sketch
        n="5"
        title="The Path"
        tag="answer-a-question"
        summary="Pick two entities; the view shows the shortest path between them. Each step's relationship type and strength are labelled. Designed for the very specific question 'how do these two ideas connect?' — a tool, not a default view."
        pros={[
          "Concrete answer to a concrete question",
          "Naturally surfaces unexpected intermediaries",
          "Looks great in screenshots, links well into prose ('see how X reaches Y')",
        ]}
        cons={[
          "Only one path at a time (we could show k-shortest as a tabset)",
          "Useless until the user has two entities in mind",
        ]}
        nav={[
          "Two type-ahead pickers; suggestions inline",
          "Switch between shortest / alternative / strongest paths",
          "Each step is a click-target into the entity + the source for the edge",
        ]}
        height={460}
      >
        <SketchPath />
      </Sketch>

      {/* NAVIGATION */}
      <ChapterBreak n="02 · Navigation" title="How the reader drives the graph" sub="Affordances that compose on top of whichever layout is active. Most should be present in every layout; the goal is that a keyboard-first power user can do the whole exploration without touching the mouse." />
      <NavPatterns />

      {/* INTEGRATION */}
      <ChapterBreak n="03 · Integration" title="Where the graph touches the rest of the app" sub="The graph view is not the only surface that talks about entities — hover cards, the reference view, the synthesis tree, and every prose paragraph also do. These all need to point into the graph, and the graph needs to point back." />
      <IntegrationMocks />

      {/* RECOMMENDATIONS */}
      <ChapterBreak n="04 · A take" title="What I'd actually ship" sub="A recommendation to argue with." />

      <div style={{
        background: TT.surface, border: `1px solid ${TT.borderSoft}`, borderRadius: 16,
        padding: "28px 32px", marginTop: 24, fontFamily: FF.serif,
      }}>
        <Recommendation
          n="1"
          headline="Atlas is the default; Spotlight and Regions are layout modes."
          body="A single /graph route, with a small switcher in the top-right (atlas / spotlight / regions). Matrix and Path live as separate tabs in the same route — they're tools the reader reaches for deliberately, not default views."
        />
        <Recommendation
          n="2"
          headline="The Spotlight is what gets embedded everywhere else."
          body="The right-rail mini-graph, the section-header banner, the synthesis cross-reference — all of those are versions of the same spotlight component with different focus / depth / dimming rules. Build one, reuse five times."
        />
        <Recommendation
          n="3"
          headline="Every node, every edge, opens a source."
          body="The biggest difference between this graph and most knowledge-graph viewers is that ours is born from a report with sources. An edge should never be a bare line — clicking it reveals the section, the file, or the URL that justifies it."
        />
        <Recommendation
          n="4"
          headline="Trail in the URL, not in localStorage."
          body="The trail of focused entities lives in the URL so back/forward, share, and tab restore all work. localStorage holds only the layout-mode preference."
        />
        <Recommendation
          n="5"
          headline="Don't build the Matrix until the second codebase report."
          body="Matrix shines on dense graphs (>50 entities, >100 edges). For the postgres-mvcc-sized report it's overkill. Build Atlas + Spotlight + Regions first; matrix and path-finder can come in a later milestone alongside the codebase template."
          last
        />
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: 80, paddingTop: 24, borderTop: `1px solid ${TT.borderSoft}`,
        fontFamily: FF.mono, fontSize: 11, color: TT.ink3,
        display: "flex", justifyContent: "space-between", letterSpacing: "0.06em",
      }}>
        <span>TRELLIS · GRAPH VIEW · v0 SKETCHES</span>
        <span>NEXT: PICK A DIRECTION, BUILD A PROTOTYPE IN bento/views-graph.jsx</span>
      </footer>
    </div>
  );
}

function Recommendation({ n, headline, body, last }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "auto 1fr", gap: 22,
      padding: "16px 0", borderBottom: last ? "none" : `1px dashed ${TT.borderSoft}`,
    }}>
      <div style={{
        fontFamily: FF.mono, fontSize: 10, color: TT.coral,
        letterSpacing: "0.12em", fontWeight: 600, padding: "4px 0",
      }}>{String(n).padStart(2, "0")}</div>
      <div>
        <div style={{
          fontFamily: FF.serif, fontSize: 18, fontWeight: 500, color: TT.ink,
          lineHeight: 1.3, letterSpacing: "-0.012em", textWrap: "balance",
        }}>{headline}</div>
        <p style={{
          margin: "6px 0 0", fontFamily: FF.serif, fontSize: 14.5, lineHeight: 1.55,
          color: TT.ink2, textWrap: "pretty",
        }}>{body}</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<GraphDesignDoc />);

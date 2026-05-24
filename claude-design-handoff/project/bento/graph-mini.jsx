// Embeddable mini-spotlight: small force-laid sub-graph showing the entities
// in a section (or any set), with their cross-section edges as dashed leaders
// to external neighbors. Used by GuidedView's section header and right rail.
//
// Props:
//   entityIds    — primary entity ids to render
//   width / height — SVG viewBox dimensions
//   focusId      — optional id to highlight as center
//   showExternal — show one-hop external neighbors as ghost nodes (default true)
//   onOpenGraph  — fired when a node is clicked (id) or "see full graph" pressed
//   compact      — denser layout (smaller fonts, less padding)

function MiniGraph({ entityIds, focusId, width = 280, height = 160, showExternal = true, onOpenGraph, compact = false }) {
  const B = window.B;
  const ents = entityIds.map((id) => B.entities.find((e) => e.id === id)).filter(Boolean);
  if (!ents.length) return null;

  // Internal edge set.
  const idSet = new Set(entityIds);
  const internalEdges = B.relationships.filter((r) => idSet.has(r.from) && idSet.has(r.to));

  // External one-hop neighbors (only if requested).
  const externals = new Map(); // id → entity
  if (showExternal) {
    for (const r of B.relationships) {
      if (idSet.has(r.from) && !idSet.has(r.to)) {
        const e = B.entities.find((x) => x.id === r.to);
        if (e) externals.set(e.id, e);
      } else if (idSet.has(r.to) && !idSet.has(r.from)) {
        const e = B.entities.find((x) => x.id === r.from);
        if (e) externals.set(e.id, e);
      }
    }
  }
  const externalList = [...externals.values()];

  // Layout: internal nodes via force; externals placed at ring around bounds.
  const pos = React.useMemo(() => {
    const innerNodes = ents.slice();
    const innerEdges = internalEdges.slice();
    const p = GraphLayout.forceLayout(innerNodes, innerEdges, width, height, {
      seed: hashSeed(entityIds.join("|")),
      iters: 200,
      pad: compact ? 28 : 34,
      kScale: ents.length <= 3 ? 0.55 : 0.78,
    });
    // Place externals on a halo outside the bounding box.
    if (externalList.length) {
      const cx = width / 2, cy = height / 2;
      const halo = Math.min(width, height) / 2 - 12;
      externalList.forEach((e, i) => {
        const a = (i / externalList.length) * Math.PI * 2 - Math.PI / 2;
        p[e.id] = { x: cx + Math.cos(a) * halo, y: cy + Math.sin(a) * halo };
      });
    }
    return p;
  }, [entityIds.join("|"), width, height, externalList.length, compact]);

  const externalEdges = [];
  if (showExternal) {
    for (const r of B.relationships) {
      if (idSet.has(r.from) && externals.has(r.to)) externalEdges.push(r);
      else if (idSet.has(r.to) && externals.has(r.from)) externalEdges.push(r);
    }
  }

  const nodeR = (id, isCenter) => {
    if (isCenter) return compact ? 12 : 14;
    if (idSet.has(id)) return compact ? 6 : 8;
    return compact ? 4.5 : 5.5;
  };

  const handleClick = (id) => { if (onOpenGraph) onOpenGraph(id); };

  return (
    <svg viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", height: "auto", display: "block", maxHeight: height }}>
      {/* External edges (dashed) */}
      {externalEdges.map((r, i) => {
        const a = pos[r.from], b = pos[r.to]; if (!a || !b) return null;
        return (
          <line key={"ex" + i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={TT.coral} strokeOpacity="0.55" strokeWidth="1" strokeDasharray="3 3" />
        );
      })}
      {/* Internal edges */}
      {internalEdges.map((r, i) => {
        const a = pos[r.from], b = pos[r.to]; if (!a || !b) return null;
        return (
          <line key={"in" + i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={TT.ink} strokeOpacity="0.32" strokeWidth="1" />
        );
      })}
      {/* External nodes */}
      {externalList.map((e) => {
        const p = pos[e.id]; if (!p) return null;
        const color = ENTITY_TYPE_COLOR[e.type] || TT.ink;
        const r = nodeR(e.id, false);
        return (
          <g key={e.id} style={{ cursor: "pointer" }} onClick={() => handleClick(e.id)}>
            <circle cx={p.x} cy={p.y} r={r}
              fill={TT.bg} stroke={color} strokeOpacity="0.55" strokeWidth="1.2" />
            <text x={p.x} y={p.y + r + (compact ? 8 : 10)} textAnchor="middle"
              style={{ fontFamily: FF.mono, fontSize: compact ? 8 : 9, fill: TT.ink3 }}>
              {e.name}
            </text>
          </g>
        );
      })}
      {/* Internal nodes */}
      {ents.map((e) => {
        const p = pos[e.id]; if (!p) return null;
        const isCenter = e.id === focusId;
        const color = ENTITY_TYPE_COLOR[e.type] || TT.ink;
        const r = nodeR(e.id, isCenter);
        return (
          <g key={e.id} style={{ cursor: "pointer" }} onClick={() => handleClick(e.id)}>
            <circle cx={p.x} cy={p.y} r={r}
              fill={isCenter ? TT.ink : TT.surface}
              stroke={isCenter ? TT.coral : color}
              strokeWidth={isCenter ? 2 : 1.4} />
            <text x={p.x} y={p.y + r + (compact ? 9 : 11)} textAnchor="middle"
              style={{
                fontFamily: FF.mono, fontSize: compact ? 8.5 : 9.5,
                fill: TT.ink, fontWeight: isCenter ? 600 : 500,
              }}>
              {e.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Cheap deterministic hash so the same id-set always lays out the same way.
function hashSeed(s) {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

Object.assign(window, { MiniGraph });

// Layout utilities — small deterministic force-directed layout, plus
// helpers for laying entities out in radial / cluster / matrix shapes.

// Seedable RNG so layouts don't jitter between reloads.
function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t |= 0; t = (t + 0x6D2B79F5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Fruchterman–Reingold-ish layout. Good enough for 16 nodes.
function forceLayout(nodes, edges, W, H, opts = {}) {
  const rng = mulberry32(opts.seed || 7);
  const iters = opts.iters || 300;
  const k = opts.k || Math.sqrt((W * H) / nodes.length) * 0.78;
  const pad = opts.pad || 56;
  const pos = {};
  nodes.forEach((n, i) => {
    const a = (i / nodes.length) * Math.PI * 2;
    pos[n.id] = {
      x: W / 2 + Math.cos(a) * 120 + (rng() - 0.5) * 24,
      y: H / 2 + Math.sin(a) * 120 + (rng() - 0.5) * 24,
    };
  });
  let temp = Math.min(W, H) / 8;
  for (let it = 0; it < iters; it++) {
    const disp = {};
    nodes.forEach((n) => (disp[n.id] = { x: 0, y: 0 }));
    // repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i].id;
        const b = nodes[j].id;
        let dx = pos[a].x - pos[b].x;
        let dy = pos[a].y - pos[b].y;
        let d = Math.hypot(dx, dy) || 0.01;
        const f = (k * k) / d;
        dx /= d; dy /= d;
        disp[a].x += dx * f; disp[a].y += dy * f;
        disp[b].x -= dx * f; disp[b].y -= dy * f;
      }
    }
    // attraction
    for (const e of edges) {
      if (!pos[e.from] || !pos[e.to]) continue;
      let dx = pos[e.from].x - pos[e.to].x;
      let dy = pos[e.from].y - pos[e.to].y;
      let d = Math.hypot(dx, dy) || 0.01;
      const f = (d * d) / k;
      dx /= d; dy /= d;
      disp[e.from].x -= dx * f; disp[e.from].y -= dy * f;
      disp[e.to].x   += dx * f; disp[e.to].y   += dy * f;
    }
    for (const n of nodes) {
      const d = disp[n.id];
      const m = Math.hypot(d.x, d.y) || 0.01;
      const step = Math.min(m, temp);
      pos[n.id].x += (d.x / m) * step;
      pos[n.id].y += (d.y / m) * step;
      pos[n.id].x = Math.max(pad, Math.min(W - pad, pos[n.id].x));
      pos[n.id].y = Math.max(pad, Math.min(H - pad, pos[n.id].y));
    }
    temp *= 0.96;
  }
  return pos;
}

// Cluster nodes by section (primarySection), then run a small per-cluster
// circle layout, with the clusters arranged in a row across the canvas.
function clusterLayout(nodes, sections, W, H, pad = 60) {
  const byId = Object.fromEntries(sections.map((s) => [s.id, []]));
  for (const n of nodes) {
    if (byId[n.primarySection]) byId[n.primarySection].push(n);
  }
  // Filter to sections that actually have entities.
  const used = sections.filter((s) => byId[s.id].length > 0);
  const cols = used.length;
  const cellW = (W - pad * 2) / cols;
  const pos = {};
  const regions = [];
  used.forEach((s, ci) => {
    const members = byId[s.id];
    const cx = pad + cellW * (ci + 0.5);
    const cy = H / 2;
    const rx = Math.min(cellW / 2 - 18, 90);
    const ry = Math.min((H / 2) - pad, 105);
    regions.push({ id: s.id, x: cx - rx, y: cy - ry, w: rx * 2, h: ry * 2, section: s });
    if (members.length === 1) {
      pos[members[0].id] = { x: cx, y: cy };
    } else {
      members.forEach((m, i) => {
        const a = (i / members.length) * Math.PI * 2 - Math.PI / 2;
        const r = Math.min(rx, ry) * 0.62;
        pos[m.id] = { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
      });
    }
  });
  return { pos, regions };
}

// Shortest path (BFS) for the path sketch — relationships are treated as
// undirected because reachability matters here, not direction.
function shortestPath(edges, from, to) {
  if (from === to) return [from];
  const adj = {};
  for (const e of edges) {
    (adj[e.from] ||= []).push(e.to);
    (adj[e.to]   ||= []).push(e.from);
  }
  const queue = [[from]];
  const seen = new Set([from]);
  while (queue.length) {
    const path = queue.shift();
    const tail = path[path.length - 1];
    for (const next of (adj[tail] || [])) {
      if (seen.has(next)) continue;
      const np = [...path, next];
      if (next === to) return np;
      seen.add(next);
      queue.push(np);
    }
  }
  return null;
}

// Look up the edge connecting a-b (either direction).
function findEdge(edges, a, b) {
  return edges.find((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a));
}

Object.assign(window, { forceLayout, clusterLayout, shortestPath, findEdge });

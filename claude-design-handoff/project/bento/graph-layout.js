// Graph layout helpers — used by views-graph.jsx and graph-mini.jsx.
//
// Pure functions, no React. All consume `window.B`-shaped data (entities
// with id/type/primarySection; relationships with from/to/type/strength).

(function () {
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

  // Fruchterman–Reingold-ish layout. Good for up to ~50 nodes.
  function forceLayout(nodes, edges, W, H, opts) {
    opts = opts || {};
    const rng = mulberry32(opts.seed || 7);
    const iters = opts.iters || 300;
    const k = opts.k || Math.sqrt((W * H) / nodes.length) * (opts.kScale || 0.78);
    const pad = opts.pad || 56;
    const pos = {};
    nodes.forEach((n, i) => {
      const a = (i / nodes.length) * Math.PI * 2;
      pos[n.id] = {
        x: W / 2 + Math.cos(a) * Math.min(W, H) * 0.25 + (rng() - 0.5) * 24,
        y: H / 2 + Math.sin(a) * Math.min(W, H) * 0.25 + (rng() - 0.5) * 24,
      };
    });
    let temp = Math.min(W, H) / 8;
    for (let it = 0; it < iters; it++) {
      const disp = {};
      nodes.forEach((n) => (disp[n.id] = { x: 0, y: 0 }));
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i].id, b = nodes[j].id;
          let dx = pos[a].x - pos[b].x;
          let dy = pos[a].y - pos[b].y;
          let d = Math.hypot(dx, dy) || 0.01;
          const f = (k * k) / d;
          dx /= d; dy /= d;
          disp[a].x += dx * f; disp[a].y += dy * f;
          disp[b].x -= dx * f; disp[b].y -= dy * f;
        }
      }
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

  // Cluster nodes by primarySection. Returns { pos, regions }.
  function clusterLayout(nodes, sections, W, H, opts) {
    opts = opts || {};
    const pad = opts.pad || 60;
    const padTop = opts.padTop || 90; // room for section labels at top
    const byId = {};
    for (const s of sections) byId[s.id] = [];
    for (const n of nodes) {
      if (byId[n.primarySection]) byId[n.primarySection].push(n);
    }
    const used = sections.filter((s) => byId[s.id].length > 0);

    // Arrange clusters in a roughly even 2-row grid so 7 sections don't get
    // squashed into a single row.
    const total = used.length;
    const rows = total <= 4 ? 1 : 2;
    const cols = Math.ceil(total / rows);
    const cellW = (W - pad * 2) / cols;
    const cellH = (H - padTop - pad) / rows;
    const pos = {};
    const regions = [];

    used.forEach((s, idx) => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      const cx = pad + cellW * (c + 0.5);
      const cy = padTop + cellH * (r + 0.5);
      const rx = Math.min(cellW / 2 - 14, 110);
      const ry = Math.min(cellH / 2 - 14, 95);
      regions.push({
        id: s.id,
        x: cx - rx, y: cy - ry, w: rx * 2, h: ry * 2,
        cx, cy,
        section: s,
      });
      const members = byId[s.id];
      if (members.length === 1) {
        pos[members[0].id] = { x: cx, y: cy + 6 };
      } else {
        members.forEach((m, i) => {
          const a = (i / members.length) * Math.PI * 2 - Math.PI / 2;
          const ringR = Math.min(rx, ry) * 0.58;
          pos[m.id] = { x: cx + Math.cos(a) * ringR, y: cy + Math.sin(a) * ringR };
        });
      }
    });
    return { pos, regions };
  }

  // BFS-shortest path; relationships treated as undirected.
  function shortestPath(edges, from, to) {
    if (from === to) return [from];
    const adj = {};
    for (const e of edges) {
      (adj[e.from] = adj[e.from] || []).push(e.to);
      (adj[e.to]   = adj[e.to]   || []).push(e.from);
    }
    const queue = [[from]];
    const seen = new Set([from]);
    while (queue.length) {
      const path = queue.shift();
      const tail = path[path.length - 1];
      for (const next of (adj[tail] || [])) {
        if (seen.has(next)) continue;
        const np = path.concat([next]);
        if (next === to) return np;
        seen.add(next);
        queue.push(np);
      }
    }
    return null;
  }

  // Compute degree for every entity. Used for node sizing.
  function degreeMap(entities, relationships) {
    const d = {};
    for (const e of entities) d[e.id] = 0;
    for (const r of relationships) { d[r.from] = (d[r.from] || 0) + 1; d[r.to] = (d[r.to] || 0) + 1; }
    return d;
  }

  // Set of neighbors of `id`.
  function neighborsOf(relationships, id) {
    const out = new Set();
    for (const r of relationships) {
      if (r.from === id) out.add(r.to);
      if (r.to === id)   out.add(r.from);
    }
    return out;
  }

  window.GraphLayout = {
    forceLayout, clusterLayout, shortestPath, degreeMap, neighborsOf,
  };
})();

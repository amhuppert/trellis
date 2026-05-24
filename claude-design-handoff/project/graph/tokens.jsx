// Design tokens — mirrors Modular Bento so these sketches feel like part of
// the same exploration.

const TT = {
  bg:         "#F4F2EC",
  surface:    "#FFFFFF",
  surface2:   "#F9F7F1",
  surface3:   "#ECE8DC",
  chip:       "#ECE8DC",
  border:     "rgba(20,30,25,0.10)",
  borderSoft: "rgba(20,30,25,0.05)",
  borderHi:   "rgba(20,30,25,0.18)",
  ink:        "#16201A",
  ink2:       "rgba(22,32,26,0.66)",
  ink3:       "rgba(22,32,26,0.44)",
  ink4:       "rgba(22,32,26,0.28)",
  sage:       "oklch(48% 0.07 155)",
  sageSoft:   "oklch(92% 0.04 155)",
  sageBg:     "oklch(96% 0.025 155)",
  sageInk:    "oklch(35% 0.07 155)",
  coral:      "oklch(62% 0.16 30)",
  coralSoft:  "oklch(94% 0.05 30)",
  coralBg:    "oklch(97% 0.025 30)",
  coralInk:   "oklch(45% 0.16 30)",
  butter:     "oklch(86% 0.10 90)",
  butterBg:   "oklch(96% 0.03 90)",
  butterInk:  "oklch(48% 0.10 80)",
  iris:       "oklch(58% 0.10 285)",
  irisBg:     "oklch(96% 0.025 285)",
  irisInk:    "oklch(40% 0.10 285)",
  shadow:     "0 1px 2px rgba(20,30,25,0.04), 0 6px 24px rgba(20,30,25,0.04)",
  shadowHi:   "0 4px 12px rgba(20,30,25,0.06), 0 20px 60px rgba(20,30,25,0.08)",
};

const FF = {
  sans:  '"Manrope", -apple-system, system-ui, sans-serif',
  serif: '"Source Serif 4", "Newsreader", Georgia, serif',
  mono:  '"JetBrains Mono", monospace',
};

// Color a node by entity type — used by every sketch so type recognition
// transfers across views.
const TYPE_COLOR = {
  concept: TT.coral,
  pattern: TT.coralInk,
  feature: TT.sage,
  file:    TT.butterInk,
};

const TYPE_BG = {
  concept: TT.coralBg,
  pattern: TT.coralBg,
  feature: TT.sageBg,
  file:    TT.butterBg,
};

// Strength → opacity/width helpers for edges.
const STRENGTH = {
  strong: { w: 1.75, o: 0.85 },
  medium: { w: 1.25, o: 0.55 },
  weak:   { w: 0.9,  o: 0.32 },
};

// Section accent → color (used by Sketch 3 for region tints).
const SECTION_ACCENT = {
  coral:  { ink: TT.coralInk, bg: TT.coralBg,  ring: TT.coral  },
  sage:   { ink: TT.sageInk,  bg: TT.sageBg,   ring: TT.sage   },
  butter: { ink: TT.butterInk,bg: TT.butterBg, ring: TT.butter },
};

Object.assign(window, { TT, FF, TYPE_COLOR, TYPE_BG, STRENGTH, SECTION_ACCENT });

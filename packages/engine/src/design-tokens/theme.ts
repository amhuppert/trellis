export type TokenGroup<TKeys extends string> = Record<TKeys, string>;

export type TypeRole = {
  family: "sans" | "serif" | "mono";
  size: string;
  lineHeight: string;
  weight: string;
  tracking: string;
};

export const trellisTokens = {
  colors: {
    bg: "#F4F2EC",
    surface: "#FFFFFF",
    "surface-2": "#F9F7F1",
    "surface-3": "#ECE8DC",
    ink: "#16201A",
    "ink-2": "rgba(22,32,26,0.66)",
    "ink-3": "rgba(22,32,26,0.44)",
    "ink-4": "rgba(22,32,26,0.28)",
    "border-soft": "rgba(20,30,25,0.05)",
    border: "rgba(20,30,25,0.10)",
    "border-hi": "rgba(20,30,25,0.18)",
    "accent-sage": "oklch(48% 0.07 155)",
    "accent-sage-ink": "oklch(35% 0.07 155)",
    "accent-sage-soft": "oklch(92% 0.04 155)",
    "accent-sage-bg": "oklch(96% 0.025 155)",
    "accent-coral": "oklch(62% 0.16 30)",
    "accent-coral-ink": "oklch(45% 0.16 30)",
    "accent-coral-soft": "oklch(94% 0.05 30)",
    "accent-coral-bg": "oklch(97% 0.025 30)",
    "accent-butter": "oklch(86% 0.10 90)",
    "accent-butter-ink": "oklch(48% 0.10 80)",
    "accent-butter-bg": "oklch(96% 0.03 90)"
  },
  fonts: {
    sans: '"Manrope", -apple-system, system-ui, sans-serif',
    serif: '"Source Serif 4", "Newsreader", Georgia, serif',
    mono: '"JetBrains Mono", ui-monospace, monospace'
  },
  radii: {
    xs: "4px",
    sm: "6px",
    md: "8px",
    lg: "10px",
    xl: "12px",
    "2xl": "14px",
    "3xl": "18px",
    pill: "999px"
  },
  shadows: {
    sm: "0 1px 2px rgba(20,30,25,0.04), 0 6px 24px rgba(20,30,25,0.04)",
    pop: "0 4px 12px rgba(20,30,25,0.06), 0 20px 60px rgba(20,30,25,0.08)"
  },
  motion: {
    fast: "120ms",
    med: "220ms",
    slow: "360ms",
    "ease-out": "cubic-bezier(.2,.7,.3,1)"
  },
  layout: {
    "topbar-height": "60px",
    "nav-width": "296px",
    "right-rail-width": "280px",
    "reading-width": "720px",
    "page-max": "1320px"
  }
} as const;

export const trellisTypeRoles = {
  display: { family: "serif", size: "3.5rem", lineHeight: "1.02", weight: "500", tracking: "-0.025em" },
  h1: { family: "serif", size: "2.5rem", lineHeight: "1.08", weight: "500", tracking: "-0.02em" },
  h2: { family: "serif", size: "1.75rem", lineHeight: "1.2", weight: "500", tracking: "-0.015em" },
  h3: { family: "serif", size: "1.375rem", lineHeight: "1.25", weight: "500", tracking: "-0.005em" },
  lead: { family: "serif", size: "1.3125rem", lineHeight: "1.42", weight: "400", tracking: "0" },
  body: { family: "serif", size: "1.125rem", lineHeight: "1.62", weight: "400", tracking: "0" },
  "body-sans": { family: "sans", size: "0.875rem", lineHeight: "1.55", weight: "400", tracking: "0" },
  label: { family: "sans", size: "0.8125rem", lineHeight: "1.3", weight: "600", tracking: "0" },
  caption: { family: "sans", size: "0.75rem", lineHeight: "1.4", weight: "400", tracking: "0" },
  eyebrow: { family: "mono", size: "0.6875rem", lineHeight: "1.1", weight: "700", tracking: "0.14em" },
  mono: { family: "mono", size: "0.75rem", lineHeight: "1.4", weight: "500", tracking: "0" },
  code: { family: "mono", size: "0.8125rem", lineHeight: "1.55", weight: "500", tracking: "0" }
} as const satisfies Record<string, TypeRole>;

export type TrellisTokens = typeof trellisTokens;
export type TrellisTypeRoleName = keyof typeof trellisTypeRoles;

import { trellisTypeRoles } from "./theme";

const fontForRole = {
  sans: ["var(--font-sans)"],
  serif: ["var(--font-serif)"],
  mono: ["var(--font-mono)"]
} as const;

const fontSize = Object.fromEntries(
  Object.entries(trellisTypeRoles).map(([role, value]) => [
    role,
    [
      value.size,
      {
        fontFamily: fontForRole[value.family].join(", "),
        fontWeight: value.weight,
        letterSpacing: value.tracking,
        lineHeight: value.lineHeight
      }
    ]
  ])
);

const trellisTailwindPreset = {
  darkMode: ["class", ".dark"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      bg: "var(--color-bg)",
      surface: "var(--color-surface)",
      "surface-2": "var(--color-surface-2)",
      "surface-3": "var(--color-surface-3)",
      ink: "var(--color-ink)",
      "ink-2": "var(--color-ink-2)",
      "ink-3": "var(--color-ink-3)",
      "ink-4": "var(--color-ink-4)",
      "border-soft": "var(--color-border-soft)",
      border: "var(--color-border)",
      "border-hi": "var(--color-border-hi)",
      sage: "var(--color-accent-sage)",
      "sage-ink": "var(--color-accent-sage-ink)",
      "sage-soft": "var(--color-accent-sage-soft)",
      "sage-bg": "var(--color-accent-sage-bg)",
      coral: "var(--color-accent-coral)",
      "coral-ink": "var(--color-accent-coral-ink)",
      "coral-soft": "var(--color-accent-coral-soft)",
      "coral-bg": "var(--color-accent-coral-bg)",
      butter: "var(--color-accent-butter)",
      "butter-ink": "var(--color-accent-butter-ink)",
      "butter-bg": "var(--color-accent-butter-bg)"
    },
    fontFamily: {
      sans: ["var(--font-sans)"],
      serif: ["var(--font-serif)"],
      mono: ["var(--font-mono)"]
    },
    fontSize,
    extend: {
      spacing: {
        "space-block": "1.75rem",
        "space-section": "3.5rem",
        "gutter-rail": "1.5rem"
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        pill: "var(--radius-pill)"
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        pop: "var(--shadow-pop)"
      },
      transitionDuration: {
        fast: "var(--motion-fast)",
        med: "var(--motion-med)",
        slow: "var(--motion-slow)"
      },
      transitionTimingFunction: {
        out: "var(--ease-out)"
      }
    }
  },
  trellisPolicy: {
    forbidArbitraryValuesFor: ["color", "font-size", "border-radius", "shadow"]
  }
} as const;

export default trellisTailwindPreset;

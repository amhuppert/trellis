import type { Meta, StoryObj } from "@storybook/react";

function Welcome() {
  return (
    <main
      data-testid="trellis-storybook-smoke"
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        color: "var(--color-ink)",
        display: "grid",
        placeItems: "center",
        padding: "var(--layout-topbar-height)"
      }}
    >
      <section
        style={{
          width: "min(100%, var(--layout-reading-width))",
          display: "grid",
          gap: "24px"
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: "54px",
            height: "54px",
            borderRadius: "var(--radius-xl)",
            background: "var(--color-accent-sage-bg)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
            display: "grid",
            placeItems: "center",
            color: "var(--color-accent-sage-ink)",
            fontFamily: "var(--font-serif)",
            fontSize: "32px",
            fontWeight: 600,
            lineHeight: 1
          }}
        >
          T
        </div>
        <div style={{ display: "grid", gap: "10px" }}>
          <p
            style={{
              margin: 0,
              color: "var(--color-ink-2)",
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              lineHeight: 1.2,
              textTransform: "uppercase"
            }}
          >
            Trellis component library
          </p>
          <h1
            style={{
              margin: 0,
              color: "var(--color-ink)",
              fontFamily: "var(--font-serif)",
              fontSize: "48px",
              fontWeight: 500,
              lineHeight: 1.05
            }}
          >
            Tokens render on linen.
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: "46rem",
              color: "var(--color-ink-2)",
              fontFamily: "var(--font-sans)",
              fontSize: "18px",
              lineHeight: 1.65
            }}
          >
            This smoke story confirms Storybook previews inherit the Trellis CSS variables,
            typography, and background before component stories are added.
          </p>
        </div>
      </section>
    </main>
  );
}

const meta = {
  title: "Trellis/Welcome",
  component: Welcome,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof Welcome>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Smoke: Story = {};

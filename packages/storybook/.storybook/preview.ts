import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";

import "@fontsource-variable/manrope";
import "@fontsource/source-serif-4/400.css";
import "@fontsource/source-serif-4/500.css";
import "@fontsource/source-serif-4/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";
import "@trellis/engine/design-tokens/tokens.css";
import "./preview.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "linen",
      values: [
        { name: "linen", value: "var(--color-bg)" },
        { name: "surface", value: "var(--color-surface)" },
        { name: "ink", value: "var(--color-ink)" }
      ]
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    layout: "fullscreen",
    themes: {
      default: "light",
      list: [
        { name: "light", class: "", color: "#F4F2EC" },
        { name: "dark", class: "dark", color: "#16201A" }
      ]
    }
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: "",
        dark: "dark"
      },
      defaultTheme: "light"
    })
  ]
};

export default preview;

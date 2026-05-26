import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const outDir = process.env.TRELLIS_OUT_DIR;

export default defineConfig({
  ...(outDir ? { outDir } : {}),
  build: {
    assetsPrefix: "."
  },
  devToolbar: {
    enabled: false
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  }
});

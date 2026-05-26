import "@trellis/engine/design-tokens/tokens.css";
import "./styles/global.css";

import { AppShell } from "@trellis/engine/components/shell";
import { createRoot } from "react-dom/client";
import report from "virtual:trellis-report";

const root = document.getElementById("trellis-root");

if (!root) {
  throw new Error("Missing #trellis-root mount point");
}

createRoot(root).render(<AppShell report={report} />);

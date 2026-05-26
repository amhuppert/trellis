import React from "react";
import { ModeSwitcher } from "../primitives";
import { useReader } from "./AppShell";

export function TopBar() {
  const { report, state, setMode } = useReader();

  return (
    <header className="trellis-topbar">
      <button type="button" className="trellis-topbar__brand" onClick={() => setMode("orientation")}>
        <span className="trellis-mark" aria-hidden="true">
          <span />
        </span>
        <span>
          <span className="trellis-topbar__name">Trellis</span>
          <span className="trellis-topbar__report">{report.id}</span>
        </span>
      </button>
      <ModeSwitcher mode={state.mode} onChange={setMode} />
      <button type="button" className="trellis-command-chip" title="Coming soon" aria-disabled="true">
        Search <span>Cmd K</span>
      </button>
    </header>
  );
}


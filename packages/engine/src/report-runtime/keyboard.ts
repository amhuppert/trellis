import React from "react";
import type { ReportConfig } from "../schemas";
import type { ReaderMode, ReaderState } from "../components/shell/reader-state";

type KeyboardShortcutOptions = {
  report: ReportConfig;
  state: ReaderState;
  setMode: (mode: ReaderMode) => void;
  openSection: (id: string) => void;
};

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || target.isContentEditable || Boolean(target.closest("[contenteditable='true']"));
}

function previousSectionId(report: ReportConfig, sectionId: string) {
  const index = report.sections.findIndex((section) => section.id === sectionId);
  return index > 0 ? report.sections[index - 1]?.id : undefined;
}

function nextSectionId(report: ReportConfig, sectionId: string) {
  const index = report.sections.findIndex((section) => section.id === sectionId);
  return index >= 0 && index < report.sections.length - 1 ? report.sections[index + 1]?.id : undefined;
}

export function useKeyboardShortcuts({ report, state, setMode, openSection }: KeyboardShortcutOptions) {
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey || isEditableTarget(event.target)) {
        return;
      }

      if (key === "o") {
        setMode("orientation");
        return;
      }

      if (key === "g") {
        setMode("guided");
        return;
      }

      if (key === "r") {
        setMode("reference");
        return;
      }

      if (key === "s") {
        setMode("synthesis");
        return;
      }

      if (key === "k") {
        setMode("graph");
        return;
      }

      if (state.mode !== "guided") return;

      if (key === "[" || key === "h") {
        const id = previousSectionId(report, state.sectionId);
        if (id) openSection(id);
        return;
      }

      if (key === "]" || key === "l") {
        const id = nextSectionId(report, state.sectionId);
        if (id) openSection(id);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openSection, report, setMode, state.mode, state.sectionId]);
}

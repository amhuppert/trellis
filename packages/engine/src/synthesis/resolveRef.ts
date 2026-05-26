import type { Reference, ReportConfig } from "../schemas";

type ResolveRefCallbacks = {
  report: ReportConfig;
  openSection: (id: string, anchorId?: string) => void;
  openEntity: (id: string) => void;
  openSource: (id: string) => void;
};

export type ResolvedReference = {
  kind: Reference["kind"];
  label: string;
  detail?: string;
  tag?: string;
  onClick: () => void;
};

export function resolveRef(ref: Reference, callbacks: ResolveRefCallbacks): ResolvedReference {
  if (ref.kind === "section") {
    const section = callbacks.report.sections.find((candidate) => candidate.id === ref.id);
    return {
      kind: ref.kind,
      label: section ? `${section.n ? `§${section.n} · ` : ""}${section.title}` : ref.id,
      detail: section?.summary,
      tag: ref.anchorId,
      onClick: () => callbacks.openSection(ref.id, ref.anchorId)
    };
  }

  if (ref.kind === "entity") {
    const entity = callbacks.report.kg?.entities.find((candidate) => candidate.id === ref.id);
    return {
      kind: ref.kind,
      label: entity?.name ?? ref.id,
      detail: entity?.shortDef,
      tag: entity?.type,
      onClick: () => callbacks.openEntity(ref.id)
    };
  }

  const source = callbacks.report.sources.find((candidate) => candidate.id === ref.id);
  const detail =
    source?.kind === "url"
      ? source.host ?? source.href
      : source?.kind === "code"
        ? source.path
        : source?.kind === "doc"
          ? source.locationHint ?? source.host
          : source?.kind === "passage"
            ? source.location
            : undefined;

  return {
    kind: ref.kind,
    label: source?.title ?? ref.id,
    detail,
    tag: source?.kind,
    onClick: () => callbacks.openSource(ref.id)
  };
}

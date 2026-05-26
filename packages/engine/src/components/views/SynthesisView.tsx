import React from "react";
import type { SynthesisNode } from "../../schemas";
import { resolveRef } from "../../synthesis/resolveRef";
import { findChain } from "../../synthesis/tree";
import { cn } from "../../utils";
import { InlineProse } from "../inline";
import { useReader } from "../shell/AppShell";

const levelLabel = (level: number) => (level === 0 ? "Root synthesis" : level === 1 ? "Branch synthesis" : "Leaf node");
const levelTone = (level: number) => (level === 0 ? "root" : level === 1 ? "sage" : level === 2 ? "coral" : "butter");

function findFocusedChain(roots: SynthesisNode[], focusId: string | null): SynthesisNode[] {
  if (!roots[0]) return [];
  if (!focusId) return [roots[0]];

  for (const root of roots) {
    const chain = findChain(root, focusId);
    if (chain.length > 0) return chain;
  }

  return [roots[0]];
}

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("trellis-synthesis-eyebrow", className)}>{children}</div>;
}

function SiblingNav({
  siblings,
  focusId,
  onOpen
}: {
  siblings: SynthesisNode[];
  focusId: string;
  onOpen: (id: string) => void;
}) {
  if ((siblings ?? []).length <= 1) return null;

  return (
    <nav className="trellis-synthesis-siblings" aria-label="Sibling synthesis nodes">
      {(siblings ?? []).map((sibling) => (
        <button
          key={sibling.id}
          type="button"
          className={cn("trellis-synthesis-sibling", sibling.id === focusId && "is-current")}
          disabled={sibling.id === focusId}
          onClick={() => onOpen(sibling.id)}
        >
          {sibling.title}
        </button>
      ))}
    </nav>
  );
}

export function SynthesisView() {
  const { report, state, openEntity, openSection, openSynthesis, openSource } = useReader();
  const roots = report.synthesis?.roots ?? [];
  const chain = findFocusedChain(roots, state.synthesisFocusId);
  const focus = chain[chain.length - 1];
  const parent = chain.length > 1 ? chain[chain.length - 2] : null;
  const siblings = parent?.children ?? roots;
  const children = focus?.children ?? [];
  const keyTakeaways = focus?.keyTakeaways ?? [];
  const openQuestions = focus?.openQuestions ?? [];
  const references = focus?.references ?? [];
  const scrollRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo?.({ top: 0 });
  }, [focus?.id]);

  if (!focus) {
    return (
      <main className="trellis-view trellis-synthesis-view" data-view="synthesis">
        <div className="trellis-synthesis-column">
          <p className="trellis-eyebrow">Synthesis</p>
          <h1 className="trellis-synthesis-title">No synthesis available</h1>
        </div>
      </main>
    );
  }

  return (
    <main ref={scrollRef} className="trellis-view trellis-synthesis-view" data-view="synthesis">
      <div className="trellis-synthesis-column">
        <nav className="trellis-synthesis-breadcrumbs" aria-label="Synthesis breadcrumbs">
          {chain.map((node, index) => (
            <React.Fragment key={node.id}>
              <button
                type="button"
                disabled={index === chain.length - 1}
                onClick={() => openSynthesis(node.id)}
              >
                {node.title}
              </button>
              {index < chain.length - 1 ? <span aria-hidden="true">/</span> : null}
            </React.Fragment>
          ))}
        </nav>

        <SiblingNav siblings={siblings} focusId={focus.id} onOpen={openSynthesis} />

        <article className="trellis-synthesis-focus">
          <div className="trellis-synthesis-header-row">
            <span className={cn("trellis-synthesis-level", `trellis-synthesis-level--${levelTone(focus.level)}`)}>
              <span>L{focus.level}</span>
              <span>{levelLabel(focus.level)}</span>
            </span>
            {parent ? (
              <button
                type="button"
                aria-label="Up one synthesis level"
                className="trellis-synthesis-up"
                onClick={() => openSynthesis(parent.id)}
              >
                up to {parent.title}
              </button>
            ) : null}
          </div>

          <h1 className="trellis-synthesis-title">{focus.title}</h1>
          <p className="trellis-synthesis-summary">{focus.summary}</p>

          {focus.detail ? (
            <div className="trellis-synthesis-detail">
              <InlineProse text={focus.detail} entities={report.kg?.entities} onOpenEntity={openEntity} />
            </div>
          ) : null}

          {focus.commonStructure || focus.contrast ? (
            <div className="trellis-synthesis-comparison">
              {focus.commonStructure ? (
                <section className="trellis-synthesis-note trellis-synthesis-note--sage">
                  <Eyebrow>COMMON STRUCTURE</Eyebrow>
                  <p>{focus.commonStructure}</p>
                </section>
              ) : null}
              {focus.contrast ? (
                <section className="trellis-synthesis-note trellis-synthesis-note--coral">
                  <Eyebrow>CONTRAST</Eyebrow>
                  <p>{focus.contrast}</p>
                </section>
              ) : null}
            </div>
          ) : null}

          {keyTakeaways.length > 0 ? (
            <section className="trellis-synthesis-section">
              <Eyebrow>KEY TAKEAWAYS</Eyebrow>
              <ol className="trellis-synthesis-number-list">
                {keyTakeaways.map((takeaway, index) => (
                  <li key={takeaway}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{takeaway}</p>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {openQuestions.length > 0 ? (
            <section className="trellis-synthesis-section">
              <Eyebrow>OPEN QUESTIONS</Eyebrow>
              <ul className="trellis-synthesis-question-list">
                {openQuestions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {references.length > 0 ? (
            <section className="trellis-synthesis-section">
              <div className="trellis-synthesis-section__heading">
                <Eyebrow>REFERENCES</Eyebrow>
                <span>{references.length} references</span>
              </div>
              <div className="trellis-synthesis-references">
                {references.map((ref) => {
                  const resolved = resolveRef(ref, { report, openSection, openEntity, openSource });
                  return (
                    <button
                      key={`${ref.kind}-${ref.id}-${ref.kind === "section" ? ref.anchorId ?? "" : ""}`}
                      type="button"
                      aria-label={`${resolved.kind} ${resolved.label}`}
                      className={cn("trellis-synthesis-ref", `trellis-synthesis-ref--${ref.kind}`)}
                      onClick={resolved.onClick}
                    >
                      <span className="trellis-synthesis-ref__kind">{resolved.kind}</span>
                      <span className="trellis-synthesis-ref__body">
                        <strong>{resolved.label}</strong>
                        {resolved.detail ? <small>{resolved.detail}</small> : null}
                      </span>
                      {resolved.tag ? <span className="trellis-synthesis-ref__tag">{resolved.tag}</span> : null}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}
        </article>

        {children.length > 0 ? (
          <section className="trellis-synthesis-children" aria-label="Child synthesis nodes">
            <div className="trellis-synthesis-section__heading">
              <Eyebrow>CHILD NODES</Eyebrow>
              <span>L{focus.level + 1}</span>
            </div>
            <div className="trellis-synthesis-child-grid">
              {children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  aria-label={`${child.title} ${child.summary}`}
                  className="trellis-synthesis-child"
                  onClick={() => openSynthesis(child.id)}
                >
                  <span className={cn("trellis-synthesis-child__badge", `trellis-synthesis-level--${levelTone(child.level)}`)}>
                    L{child.level}
                  </span>
                  <strong>{child.title}</strong>
                  <p>{child.summary}</p>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

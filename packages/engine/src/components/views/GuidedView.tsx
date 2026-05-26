import React from "react";
import type { Block, Section } from "../../schemas";
import { BlockRenderer } from "../blocks";
import { SectionPagination } from "../chrome/SectionPagination";
import { SectionHeaderGraph } from "../graph/SectionHeaderGraph";
import { useReader } from "../shell/AppShell";

const observerOptions: IntersectionObserverInit = {
  threshold: 0.05,
  rootMargin: "-60px 0px -50% 0px"
};

function sectionLabel(section: Section) {
  return section.n ? `${section.n} · ${section.title}` : section.title;
}

function BlockFrame({ block, children }: { block: Block; children: React.ReactNode }) {
  if (!block.anchorId) return <>{children}</>;

  return (
    <div className="trellis-guided-block-anchor" data-anchor-id={block.anchorId}>
      {children}
    </div>
  );
}

export function GuidedView() {
  const { report, state, openEntity, openSection, openGraph, setCurrentSubId } = useReader();
  const currentIndex = Math.max(
    0,
    report.sections.findIndex((section) => section.id === state.sectionId)
  );
  const currentSection = report.sections[currentIndex] ?? report.sections[0];
  const prevSection = currentIndex > 0 ? report.sections[currentIndex - 1] : undefined;
  const nextSection = currentIndex < report.sections.length - 1 ? report.sections[currentIndex + 1] : undefined;
  const mainRef = React.useRef<HTMLElement | null>(null);

  const sectionTitles = React.useMemo(
    () => Object.fromEntries(report.sections.map((section) => [section.id, section.title])),
    [report.sections]
  );

  React.useEffect(() => {
    if (!state.scrollTarget) return;
    const target = document.getElementById(state.scrollTarget);
    target?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }, [state.scrollTarget, state.navTick]);

  React.useEffect(() => {
    const root = mainRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-anchor-id]"));
    if (nodes.length === 0) {
      setCurrentSubId(null);
      return;
    }

    const ratios = new Map<string, number>();
    let frame = 0;
    const flush = () => {
      let bestId: string | null = null;
      let bestRatio = 0;

      for (const [id, ratio] of ratios) {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      }

      setCurrentSubId(bestRatio >= 0.05 ? bestId : null);
    };

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const id = entry.target.getAttribute("data-anchor-id");
        if (id) ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
      }

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(flush);
    }, { ...observerOptions, root });

    for (const node of nodes) observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      setCurrentSubId(null);
    };
  }, [currentSection?.id, setCurrentSubId]);

  React.useEffect(() => {
    const root = mainRef.current;
    if (!root) return;

    let frame = 0;
    const updateFromScrollPosition = () => {
      const rootRect = root.getBoundingClientRect();
      const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-anchor-id]"));
      let bestId: string | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (const node of nodes) {
        const rect = node.getBoundingClientRect();
        if (rect.bottom < rootRect.top || rect.top > rootRect.bottom) continue;

        const distance = Math.abs(rect.top - rootRect.top - 72);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestId = node.getAttribute("data-anchor-id");
        }
      }

      if (bestId) setCurrentSubId(bestId);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateFromScrollPosition);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    updateFromScrollPosition();

    return () => {
      root.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [currentSection?.id, setCurrentSubId]);

  if (!currentSection) {
    return (
      <main className="trellis-guided-view" data-view="guided">
        <div className="trellis-reading-column">
          <h1>No sections</h1>
        </div>
      </main>
    );
  }

  return (
    <main ref={mainRef} className="trellis-guided-view" data-view="guided">
      <div className="trellis-reading-column">
        <header className="trellis-section-header">
          <div className="trellis-section-header__meta">
            <span>{sectionLabel(currentSection)}</span>
            <span>{currentSection.kind}</span>
            {currentSection.time ? <span>{currentSection.time}</span> : null}
          </div>
          <h1>{currentSection.title}</h1>
          {currentSection.summary ? <p>{currentSection.summary}</p> : null}
          <SectionHeaderGraph section={currentSection} />
        </header>

        <div className="trellis-guided-blocks">
          {currentSection.blocks.map((block, index) => (
            <BlockFrame key={`${block.kind}-${block.anchorId ?? index}`} block={block}>
              <BlockRenderer
                block={block}
                callbacks={{
                  onOpenEntity: openEntity,
                  onOpenSection: openSection,
                  onSeeEntityInGraph: (id) => openGraph(id, "spotlight"),
                  sectionTitles
                }}
              />
            </BlockFrame>
          ))}
        </div>
        <SectionPagination prev={prevSection} next={nextSection} onOpen={openSection} />
      </div>
    </main>
  );
}

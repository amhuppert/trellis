import React from "react";
import type { OutlineNode, Section } from "../../schemas";
import { flatten } from "../../synthesis";
import { cn } from "../../utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../primitives";
import { useReader } from "../shell/AppShell";

function SectionChildren({
  items,
  sectionId,
  currentSubId,
  isActiveSection,
  depth,
  onOpen
}: {
  items: OutlineNode[];
  sectionId: string;
  currentSubId: string | null;
  isActiveSection: boolean;
  depth: number;
  onOpen: (sectionId: string, anchorId?: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="trellis-nav-children" data-depth={depth}>
      {items.map((item) => {
        const active = isActiveSection && currentSubId === item.id;

        return (
          <div key={item.id} className="trellis-nav-child">
            <button
              type="button"
              className={cn("trellis-nav-child__row", active && "is-current-subsection")}
              style={{ paddingLeft: `${8 + depth * 14}px` }}
              onClick={() => onOpen(sectionId, item.id)}
            >
              <span className="trellis-nav-child__dot" aria-hidden="true" />
              <span>{item.title}</span>
            </button>
            <SectionChildren
              items={item.children ?? []}
              sectionId={sectionId}
              currentSubId={currentSubId}
              isActiveSection={isActiveSection}
              depth={depth + 1}
              onOpen={onOpen}
            />
          </div>
        );
      })}
    </div>
  );
}

function SectionRow({
  section,
  active,
  expanded,
  currentSubId,
  onToggle,
  onOpen
}: {
  section: Section;
  active: boolean;
  expanded: boolean;
  currentSubId: string | null;
  onToggle: () => void;
  onOpen: (sectionId: string, anchorId?: string) => void;
}) {
  const hasChildren = (section.children ?? []).length > 0;

  return (
    <div className="trellis-nav-section">
      <div className={cn("trellis-nav-section__row", active && "is-current-section")}>
        <button
          type="button"
          className="trellis-nav-section__toggle"
          aria-label={`${expanded ? "Collapse" : "Expand"} ${section.title}`}
          aria-expanded={expanded}
          disabled={!hasChildren}
          onClick={onToggle}
        >
          <span aria-hidden="true">{expanded ? "v" : ">"}</span>
        </button>
        <button
          type="button"
          aria-label={`${section.n ? `${section.n} ` : ""}${section.title}`}
          className={cn("trellis-nav-section__button", active && "is-current-section")}
          onClick={() => onOpen(section.id)}
        >
          {section.n ? <span className="trellis-nav-section__number">{section.n}</span> : null}
          <span className="trellis-nav-section__title">{section.title}</span>
        </button>
      </div>
      {expanded && hasChildren ? (
        <SectionChildren
          items={section.children ?? []}
          sectionId={section.id}
          currentSubId={currentSubId}
          isActiveSection={active}
          depth={0}
          onOpen={onOpen}
        />
      ) : null}
    </div>
  );
}

function SectionsTab({ sections }: { sections: Section[] }) {
  const { report, state, openSection } = useReader();
  const currentSectionId = state.mode === "guided" ? state.sectionId : null;
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>(() =>
    currentSectionId ? { [currentSectionId]: true } : {}
  );

  React.useEffect(() => {
    if (!currentSectionId) return;
    setExpanded((current) => (current[currentSectionId] ? current : { ...current, [currentSectionId]: true }));
  }, [currentSectionId]);

  return (
    <div className="trellis-nav-panel__content">
      <div className="trellis-nav-report">
        <div className="trellis-nav-report__title">{report.title}</div>
        <div className="trellis-nav-report__meta">
          {sections.length} sections{report.readTime ? ` · ${report.readTime}` : ""}
        </div>
      </div>
      <nav aria-label="Sections" className="trellis-nav-sections">
        {sections.map((section) => (
          <SectionRow
            key={section.id}
            section={section}
            active={section.id === currentSectionId}
            expanded={!!expanded[section.id]}
            currentSubId={section.id === currentSectionId ? state.currentSubId : null}
            onToggle={() => setExpanded((current) => ({ ...current, [section.id]: !current[section.id] }))}
            onOpen={openSection}
          />
        ))}
      </nav>
    </div>
  );
}

function SynthesisTab() {
  const { report, state, openSynthesis } = useReader();
  const nodes = React.useMemo(() => report.synthesis?.roots.flatMap((root) => flatten(root)) ?? [], [report.synthesis]);
  const activeId = state.mode === "synthesis" ? state.synthesisFocusId : null;

  return (
    <div className="trellis-nav-panel__content">
      <div className="trellis-nav-report">
        <div className="trellis-nav-report__title">Synthesis</div>
        <div className="trellis-nav-report__meta">
          {nodes.length} node{nodes.length === 1 ? "" : "s"}
        </div>
      </div>
      <nav aria-label="Synthesis navigation" className="trellis-nav-synthesis">
        {nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            aria-label={`L${node.level} ${node.title}`}
            className={cn("trellis-nav-synthesis__row", node.id === activeId && "is-current-synthesis")}
            style={{ paddingLeft: `${10 + node.level * 16}px` }}
            onClick={() => openSynthesis(node.id)}
          >
            <span className="trellis-nav-synthesis__badge">L{node.level}</span>
            <span className="trellis-nav-synthesis__title">{node.title}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function JumpBlock() {
  const { state, setMode } = useReader();

  return (
    <div className="trellis-nav-jump" aria-label="Jump To">
      <div className="trellis-nav-jump__label">Jump To</div>
      <button
        type="button"
        className={cn(state.mode === "orientation" && "is-active")}
        onClick={() => setMode("orientation")}
      >
        Orientation
      </button>
      <button type="button" className={cn(state.mode === "reference" && "is-active")} onClick={() => setMode("reference")}>
        Reference
      </button>
      <button type="button" className={cn(state.mode === "synthesis" && "is-active")} onClick={() => setMode("synthesis")}>
        Synthesis
      </button>
      <button type="button" className={cn(state.mode === "graph" && "is-active")} onClick={() => setMode("graph")}>
        Graph
      </button>
    </div>
  );
}

export function NavPanel() {
  const { report, state, openSynthesis, setMode } = useReader();
  const activeTab = state.mode === "synthesis" ? "synthesis" : "sections";

  return (
    <aside className="trellis-nav-panel">
      <Tabs
        value={activeTab}
        className="trellis-nav-tabs"
        onValueChange={(value) => {
          if (value === "synthesis") {
            openSynthesis();
            return;
          }

          if (value === "sections" && state.mode === "synthesis") {
            setMode("guided");
          }
        }}
      >
        <TabsList aria-label="Reader navigation" className="trellis-nav-tabs__list">
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="synthesis">Synthesis</TabsTrigger>
        </TabsList>
        <TabsContent value="sections" className="trellis-nav-tabs__content">
          <SectionsTab sections={report.sections} />
        </TabsContent>
        <TabsContent value="synthesis" className="trellis-nav-tabs__content">
          <SynthesisTab />
        </TabsContent>
      </Tabs>
      <JumpBlock />
    </aside>
  );
}

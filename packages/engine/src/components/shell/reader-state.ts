export type ReaderMode = "orientation" | "guided" | "reference" | "synthesis" | "graph";
export type GraphMode = "atlas" | "spotlight" | "regions";

export type ReaderState = {
  mode: ReaderMode;
  sectionId: string;
  scrollTarget: string | null;
  currentSubId: string | null;
  focusEntityId: string | null;
  synthesisFocusId: string | null;
  graphMode: GraphMode;
  graphFocusId: string | null;
  navTick: number;
};

export type PersistentReaderState = Pick<ReaderState, "mode" | "sectionId" | "graphMode">;

export const persistentReaderKeys = ["mode", "sectionId", "graphMode"] as const;

export function persistentReaderState(state: ReaderState): PersistentReaderState {
  return {
    mode: state.mode,
    sectionId: state.sectionId,
    graphMode: state.graphMode
  };
}


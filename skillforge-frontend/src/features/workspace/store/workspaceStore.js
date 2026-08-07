import { create } from "zustand";

/* ==========================================================================
   Workspace store — the shared state of the Learning Workspace.
   Holds the active learning path + selection, per-topic notes and
   highlights (localStorage-backed), and the session stats for the
   bottom session bar. The AI Copilot conversation is intentionally
   NOT stored here (per-workspace local state, exported on demand).
   ========================================================================== */

const NOTES_KEY = "skillforge:workspace:notes";
const HIGHLIGHTS_KEY = "skillforge:workspace:highlights";

function readMap(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(key, map) {
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    /* ignore quota / private mode */
  }
}

export const useWorkspaceStore = create((set, get) => ({
  learningPathId: null,
  selectedWeek: null,
  selectedTopic: null,
  notes: readMap(NOTES_KEY),
  highlights: readMap(HIGHLIGHTS_KEY),
  focusSeconds: 0,
  topicsOpened: 0,

  openPath: (learningPathId) =>
    set({
      learningPathId,
      selectedWeek: null,
      selectedTopic: null,
    }),

  selectTopic: (weekNumber, topicName) =>
    set({
      selectedWeek: weekNumber,
      selectedTopic: topicName,
      topicsOpened: get().topicsOpened + 1,
    }),

  setNote: (key, content) => {
    const notes = { ...get().notes, [key]: content };
    if (!content) delete notes[key];
    writeMap(NOTES_KEY, notes);
    set({ notes });
  },

  toggleHighlight: (key) => {
    const { highlights } = get();
    const next = { ...highlights };
    if (next[key]) delete next[key];
    else next[key] = true;
    writeMap(HIGHLIGHTS_KEY, next);
    set({ highlights: next });
  },

  addFocusSeconds: (seconds) =>
    set({ focusSeconds: get().focusSeconds + seconds }),
}));

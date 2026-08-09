/* --------------------------------------------------------------------------
   Chapters — the /showcase tour model. Single source of truth for the
   chapter list, order, ids (hash anchors), and core/dive-deeper split.

   Rules:
   - `id` is the hash anchor used for deep-links (#architecture style).
   - `deep` chapters are part of the page, but labelled "dive deeper" and
     excluded from the default core tour stepper run.
   -------------------------------------------------------------------------- */

export const CHAPTERS = [
  { id: "welcome", number: "00", title: "Welcome", deep: false },
  { id: "stack", number: "01", title: "The Stack", deep: false },
  { id: "architecture", number: "02", title: "Architecture", deep: false },
  { id: "auth", number: "03", title: "Auth & Security", deep: false },
  { id: "ai", number: "04", title: "The AI Engine", deep: false },
  { id: "performance", number: "05", title: "Performance", deep: false },
  { id: "database", number: "06", title: "Database", deep: true },
  { id: "api", number: "07", title: "API Explorer", deep: true },
  { id: "timeline", number: "08", title: "Timeline", deep: true },
  { id: "done", number: "09", title: "Done", deep: false },
];

/** The default tour order — the 5-chapter core (Welcome..Done). */
export const CORE_TOUR = CHAPTERS.filter((c) => !c.deep);

/** Full ordered list including dive-deeper chapters. */
export const ALL_CHAPTERS = CHAPTERS;

export function chapterIndex(id) {
  return CHAPTERS.findIndex((c) => c.id === id);
}

export function nextChapter(id, includeDeep = false) {
  const chain = includeDeep ? CHAPTERS : CORE_TOUR;
  const i = chain.findIndex((c) => c.id === id);
  return chain[i + 1] ?? null;
}

export function prevChapter(id, includeDeep = false) {
  const chain = includeDeep ? CHAPTERS : CORE_TOUR;
  const i = chain.findIndex((c) => c.id === id);
  return chain[i - 1] ?? null;
}
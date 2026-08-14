/* -------------------------------------------------------------------------- */
/*  geometry — the ONE shared definition of "where does section i live and   */
/*  which section is current". Consumed by useForgeFold (the fold physics)    */
/*  and ScrollProgress (the 01/09 readout) so the two can never disagree.     */
/*                                                                             */
/*  Slots are MEASURED, never assumed: every page's height is its sheet's     */
/*  own offsetHeight (accumulated), so fonts, viewport changes, and content   */
/*  edits cannot desync the model. The static (reduced-motion) root measures  */
/*  its section blocks the same way — one model for both layouts.             */
/* -------------------------------------------------------------------------- */

function clamp01(value) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** Raw scroll progress through one page's slot window (0..1, clamped). */
export function rawProgress(slots, scrollY, index) {
  const slot = slots[index];
  if (!slot) return 0;
  return clamp01((scrollY - slot.top) / slot.height);
}

/**
 * Measure the section stack of a landing root (fold stage or static layout).
 * Returns the slot model { slots: [{ top, height }], total } — never the
 * caller's idea of a viewport, always the rendered sections.
 */
export function measureSlots(root) {
  if (!root) return { slots: [], total: 0 };

  /* Fold root: the sheets ARE the sections (measured, accumulated). */
  const sheets = root.querySelectorAll(".forge-page-sheet");
  if (sheets.length) {
    let top = 0;
    const slots = [];
    for (const sheet of sheets) {
      const height = Math.max(sheet.offsetHeight, window.innerHeight);
      slots.push({ top, height });
      top += height;
    }
    return { slots, total: top };
  }

  /* Static root: sections flow normally — use their own document offsets. */
  const blocks = [...root.children].filter(
    (el) => el.offsetHeight > 0 || el.offsetTop === 0,
  );
  if (blocks.length) {
    const slots = blocks.map((el) => ({
      top: el.offsetTop,
      height: el.offsetHeight,
    }));
    const last = slots[slots.length - 1];
    return { slots, total: last ? last.top + last.height : 0 };
  }

  return { slots: [], total: 0 };
}

/**
 * Resolve the section state from scroll position — the single decision
 * function shared by the fold controller and the progress readout.
 *
 *  current — the first section that hasn't fully handed over (the active
 *            surface; "fully turned" means raw > 0.999, so the handover is
 *            exact the instant scroll lands).
 *  next    — the section underneath (only relevant while current swings).
 *  progress— raw progress through the current section's window (0..1).
 *  global  — scroll completion, 0..1, where 1.0 = the last section has
 *            arrived at the viewport top (it never rotates — everything
 *            after is the closing content).
 */
export function resolveState(slots, scrollY) {
  const count = slots.length;
  if (!count) return { current: 0, next: 0, progress: 0, global: 0, total: 0 };

  let current = 0;
  while (current < count - 1 && rawProgress(slots, scrollY, current) > 0.999) {
    current += 1;
  }
  const next = Math.min(count - 1, current + 1);
  const progress = rawProgress(slots, scrollY, current);

  const last = slots[count - 1];
  const total = last.top + last.height;
  const scrollable = Math.max(1, total - last.height);
  const global = Math.min(1, Math.max(0, scrollY / scrollable));

  return { current, next, progress, global, total };
}

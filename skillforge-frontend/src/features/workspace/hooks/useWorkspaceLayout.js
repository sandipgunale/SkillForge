import { useCallback, useState } from "react";

/* ==========================================================================
   useWorkspaceLayout — persisted, resizable column layout for the workspace.

   - Three columns: nav (left), canvas (center, flexible), copilot (right)
   - Dividers clamp to min/max and the widths are stored in localStorage so
     the layout survives reloads (PHASE 2 persistence).
   ========================================================================== */

const STORAGE_KEY = "skillforge:workspace:layout";
const MIN = { nav: 130, canvas: 340, copilot: 300 };
const MAX = { nav: 520, canvas: 1400, copilot: 560 };

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sizesValid(sizes) {
  return (
    Number.isFinite(sizes.nav) &&
    Number.isFinite(sizes.copilot) &&
    sizes.nav >= MIN.nav &&
    sizes.nav <= MAX.nav &&
    sizes.copilot >= MIN.copilot &&
    sizes.copilot <= MAX.copilot
  );
}

export function useWorkspaceLayout() {
  const [sizes, setSizes] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (saved && sizesValid(saved)) return saved;
    } catch {
      /* fall through to defaults */
    }
    return { nav: 240, copilot: 360 };
  });

  const setNav = useCallback((width) => {
    setSizes((prev) => ({ ...prev, nav: clamp(width, MIN.nav, MAX.nav) }));
  }, []);

  const setCopilot = useCallback((width) => {
    setSizes((prev) => ({
      ...prev,
      copilot: clamp(width, MIN.copilot, MAX.copilot),
    }));
  }, []);

  const persist = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes));
    } catch {
      /* ignore quota / private mode */
    }
  }, [sizes]);

  return { sizes, setNav, setCopilot, persist };
}

export const WORKSPACE_MIN = MIN;
import { useEffect, useState } from "react";

import { ALL_CHAPTERS } from "../data/chapters";

/* --------------------------------------------------------------------------
   useActiveChapter — tracks which chapter is in view via IntersectionObserver.
   Returns the active chapter id (used by the rail for the highlight), and
   the hash for deep-linking.
   -------------------------------------------------------------------------- */

export default function useActiveChapter() {
  const [activeId, setActiveId] = useState("welcome");

  useEffect(() => {
    const sections = ALL_CHAPTERS
      .map(({ id }) => document.getElementById(`chapter-${id}`))
      .filter(Boolean);

    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id.replace("chapter-", ""));
          }
        }
      },
      // trigger when the chapter top crosses ~40% viewport
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return activeId;
}
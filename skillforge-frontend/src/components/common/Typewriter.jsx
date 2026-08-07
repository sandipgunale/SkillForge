import { useEffect, useState } from "react";

/* ==========================================================================
   Typewriter — progressive text reveal with a caret. Reduced-motion shows
   the full text immediately (no animation). Used by the AI Copilot and the
   dashboard command center for streaming-style replies.
   ========================================================================== */

export default function Typewriter({ text, reduced, speed = 16, className }) {
  const [len, setLen] = useState(() => (reduced ? text.length : 0));
  const finished = len >= text.length;

  useEffect(() => {
    if (reduced || finished) return undefined;

    const id = window.setInterval(() => {
      setLen((l) => (l >= text.length ? l : Math.min(l + 2, text.length)));
    }, speed);

    return () => window.clearInterval(id);
  }, [reduced, text, speed, finished]);

  return (
    <p className={className ?? "mt-1 text-sm leading-relaxed text-muted-foreground"}>
      {text.slice(0, len)}
      {!finished && (
        <span
          className="ml-0.5 inline-block h-3 w-[2px] animate-pulse bg-ember"
          aria-hidden="true"
        />
      )}
    </p>
  );
}
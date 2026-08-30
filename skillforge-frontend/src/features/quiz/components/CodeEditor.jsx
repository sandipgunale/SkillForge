import { useRef } from "react";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * IDE-style code surface: a line-number gutter beside a monospaced
 * editor. This is a presentation/input shell only — there is no execution
 * backend, so it intentionally exposes no run/reset/test controls and
 * fabricates no runtime/memory statistics. It preserves the answer string
 * (controlled `value`/`onChange`) so navigation never loses code.
 */
export default function CodeEditor({
  value,
  onChange,
  language = "code",
  minHeight = 320,
  ariaLabel = "Code editor",
  placeholder = "// Write your solution here",
}) {
  const textareaRef = useRef(null);
  const gutterRef = useRef(null);

  const lineCount = Math.max((value ?? "").split("\n").length, 1);

  const syncScroll = () => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[oklch(1_0_0/12%)] bg-[oklch(0.18_0.012_260)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[oklch(1_0_0/10%)] px-4 py-2.5">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-[oklch(0.72_0.01_90)]">
          {language}
        </span>

        <span className="flex items-center gap-1.5 text-xs text-[oklch(0.72_0.01_90)]">
          <Circle className="size-2 fill-[oklch(0.74_0.17_160)] text-[oklch(0.74_0.17_160)]" />
          Ready
        </span>
      </div>

      <div className="flex" style={{ minHeight }}>
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="select-none overflow-hidden py-3 text-right font-mono text-xs leading-6 text-[oklch(1_0_0/35%)]"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="px-3">
              {i + 1}
            </div>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          onScroll={syncScroll}
          spellCheck={false}
          aria-label={ariaLabel}
          placeholder={placeholder}
          className={cn(
            "flex-1 resize-none bg-transparent py-3 pr-4 font-mono text-[0.85rem] leading-6",
            "text-[oklch(0.92_0.005_90)] outline-none placeholder:text-[oklch(1_0_0/30%)]",
          )}
          style={{ minHeight }}
        />
      </div>
    </div>
  );
}

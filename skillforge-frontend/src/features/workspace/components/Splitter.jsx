import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

/* ==========================================================================
   Splitter — the drag handle between workspace columns.
   Pure pointer-capture resize: the parent provides the column width math.
   ========================================================================== */

export default function Splitter({ onResize, onDragEnd, label, className }) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!dragging) return;
    onResize(event.clientX);
  };

  const finish = (event) => {
    if (!dragging) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
    onDragEnd();
  };

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={dragging ? 100 : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finish}
      onPointerCancel={finish}
      onPointerLeave={finish}
      className={cn(
        "group relative w-1.5 shrink-0 touch-none select-none",
        "cursor-col-resize bg-transparent",
        dragging && "bg-ember/20",
        className,
      )}
    >
      <span
        className={cn(
          "absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition-colors",
          dragging ? "bg-ember/70" : "group-hover:bg-ember/50",
        )}
      />
    </div>
  );
}

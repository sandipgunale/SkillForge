import { useRef } from "react";
import { Flame } from "lucide-react";

import { useReveal, useMicroInteractions } from "@/lib/motion-gsap";

export default function EmptyState({ icon, title, description, action }) {
  const Icon = icon ?? Flame;

  const containerRef = useRef(null);
  const iconRef = useRef(null);

  useReveal(containerRef, { y: 14, duration: 0.45 });
  useMicroInteractions(iconRef, { hover: { scale: 1.06, rotate: -3 } });

  return (
    <div
      ref={containerRef}
      className="flex h-80 flex-col items-center justify-center rounded-3xl border border-dashed bg-card/40 px-6 text-center"
    >
      <div ref={iconRef} className="relative mb-6">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-2xl bg-ember/20 blur-2xl"
        />
        <div className="flex size-16 items-center justify-center rounded-2xl border bg-card text-ember shadow-sm">
          <Icon className="size-8" strokeWidth={1.75} />
        </div>
      </div>

      <h3 className="display text-xl font-bold">{title}</h3>

      <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
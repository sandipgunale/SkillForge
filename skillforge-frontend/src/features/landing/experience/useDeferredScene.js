import { useEffect, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  useDeferredScene — mount the 3D scene only after first paint, the        */
/*  browser is idle, and the hero is actually in view. Keeps the graduation   */
/*  cap out of the critical rendering path (FCP budget: < 1.5s).              */
/* -------------------------------------------------------------------------- */

export default function useDeferredScene() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      const t = setTimeout(() => setReady(true), 1500);
      return () => clearTimeout(t);
    }
    const root = document.getElementById("top");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const idle =
          "requestIdleCallback" in window
            ? requestIdleCallback(() => setReady(true), { timeout: 2000 })
            : setTimeout(() => setReady(true), 1200);
        return () => {
          if (typeof idle === "number") clearTimeout(idle);
          else cancelIdleCallback(idle);
        };
      },
      { rootMargin: "200px" },
    );
    observer.observe(root ?? document.body);
    return () => observer.disconnect();
  }, []);

  return ready;
}

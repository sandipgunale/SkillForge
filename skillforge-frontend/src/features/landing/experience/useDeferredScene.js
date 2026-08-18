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
    let idle = 0;
    let idleTimer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if ("requestIdleCallback" in window) {
          idle = requestIdleCallback(() => setReady(true), { timeout: 2000 });
        } else {
          idleTimer = setTimeout(() => setReady(true), 1200);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(root ?? document.body);
    return () => {
      observer.disconnect();
      if ("requestIdleCallback" in window) cancelIdleCallback(idle);
      else clearTimeout(idleTimer);
    };
  }, []);

  return ready;
}

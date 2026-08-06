import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useOutlet } from "react-router-dom";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

import { pageTransition } from "@/lib/motion";

export default function MainLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div className="min-h-screen bg-muted/30">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <div className="flex">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Navbar />

          <main
            id="main-content"
            className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-8 sm:py-8"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={pageTransition.initial}
                animate={pageTransition.animate}
                exit={pageTransition.exit}
                transition={pageTransition.transition}
              >
                {outlet}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

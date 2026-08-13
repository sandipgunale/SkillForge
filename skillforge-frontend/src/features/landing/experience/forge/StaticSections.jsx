import CapEmblem from "../cap/CapEmblem";
import { SECTIONS } from "./registry";

/* -------------------------------------------------------------------------- */
/*  StaticSections — prefers-reduced-motion layout for the Forge Fold.        */
/*  The flipping stage never mounts; the same nine sections render in normal  */
/*  document flow with no transforms, no scrubbing, no motion. The hero gets  */
/*  the static CapEmblem instead of the WebGL cap.                            */
/* -------------------------------------------------------------------------- */

export default function StaticSections() {
  return (
    <div className="forge-static">
      {SECTIONS.map(({ id, Component }) => (
        <div key={id}>
          <Component
            cap={
              id === "top" ? (
                <CapEmblem className="h-full w-full opacity-80" />
              ) : undefined
            }
          />
        </div>
      ))}
    </div>
  );
}
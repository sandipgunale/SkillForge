import LandingFooter from "../components/LandingFooter";
import Cursor from "../components/Cursor";
import ScrollProgress from "../components/ScrollProgress";
import { useContentResizeSync } from "./useEntrance";
import { SECTIONS } from "./registry";

/* -------------------------------------------------------------------------- */
/*  LandingExperience — the 15-scene narrative (00 ARRIVAL → 14 FOOTER),     */
/*  rendered in native document flow. Approach A: no fold machinery, sticky   */
/*  scenes own their pins, sections own their entrances. The navbar and the   */
/*  main#main-content landmark belong to LandingLayout/LandingPage — this     */
/*  component renders sections only.                                           */
/* -------------------------------------------------------------------------- */

export default function LandingExperience() {
  useContentResizeSync();

  return (
    <>
      <ScrollProgress />
      {SECTIONS.map(({ id, Component }) => (
        <Component key={id} />
      ))}
      <LandingFooter />
      <Cursor />
    </>
  );
}
import { useEffect, useRef } from "react";

/* -------------------------------------------------------------------------- */
/*  ForgePage — one section of the Forge Fold.                                 */
/*  The sheet is the flipping surface (rotateY around its right edge). It      */
/*  carries the section content, the ember edge hairline on the hinge, and    */
/*  the cast-shadow overlay that the PREVIOUS page's swing reveals.            */
/*  Registers its refs with the fold controller via onBind so the controller   */
/*  drives all transforms directly (no per-frame React state).                 */
/* -------------------------------------------------------------------------- */

export default function ForgePage({ index, zIndex, children, onBind }) {
  const sheetRef = useRef(null);
  const edgeRef = useRef(null);
  const castRef = useRef(null);

  useEffect(() => {
    if (onBind) {
      onBind(index, {
        sheet: sheetRef.current,
        edge: edgeRef.current,
        cast: castRef.current,
        id: sheetRef.current?.querySelector("section")?.id ?? null,
      });
    }
    return () => {
      if (onBind) onBind(index, null);
    };
  }, [index, onBind]);

  return (
    <div className="forge-page" style={{ zIndex }}>
      <div ref={sheetRef} className="forge-page-sheet">
        <div ref={edgeRef} className="forge-page-edge" aria-hidden="true" />
        {children}
        <div ref={castRef} className="forge-page-cast" aria-hidden="true" />
      </div>
    </div>
  );
}
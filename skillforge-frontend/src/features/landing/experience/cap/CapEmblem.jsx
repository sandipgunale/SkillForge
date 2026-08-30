/* -------------------------------------------------------------------------- */
/*  CapEmblem — the graduation cap as a flat SVG emblem.                      */
/*  Used as the book-cover emblem, the WebGL fallback for the hero cap, and   */
/*  the static cap under prefers-reduced-motion. All colors are design        */
/*  tokens, so the emblem re-tints with the theme via CSS.                    */
/* -------------------------------------------------------------------------- */

export default function CapEmblem({ className }) {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <linearGradient id="cap-fabric-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--cap-fabric)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--cap-fabric)" />
        </linearGradient>
        <linearGradient id="cap-board-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--cap-board)" stopOpacity="0.82" />
          <stop offset="1" stopColor="var(--cap-board)" />
        </linearGradient>
      </defs>

      {/* Skullcap */}
      <path
        d="M22 56 C22 34 66 22 98 34 C104 36 104 46 98 50 L22 56 Z"
        fill="url(#cap-fabric-grad)"
        stroke="var(--cap-board)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Mortarboard — tilted ellipse with thickness */}
      <ellipse cx="60" cy="50" rx="44" ry="12" fill="url(#cap-board-grad)" />
      <path
        d="M16 50 L16 55 C16 62 84 62 104 55 L104 50 C84 57 16 57 16 50 Z"
        fill="var(--cap-board)"
        opacity="0.85"
      />

      {/* Board top sheen */}
      <path
        d="M22 48 C40 41 80 41 98 48 C80 44 40 44 22 48 Z"
        fill="var(--book-cover-text)"
        opacity="0.14"
      />

      {/* Button */}
      <circle cx="60" cy="48" r="3.4" fill="var(--cap-board)" />

      {/* Tassel — gold string from the button out over the edge */}
      <path
        d="M63 47 C76 45 84 44 88 49 C90 52 91 56 90 61"
        fill="none"
        stroke="var(--cap-gold)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M90 61 C89 67 92 72 89 78 C87 82 83 82 81 78 C79 72 81 66 82 61 Z"
        fill="var(--cap-gold)"
        opacity="0.9"
      />

      {/* Ember glint on the board */}
      <circle cx="38" cy="46" r="2" fill="var(--ember)" opacity="0.75" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  ChapterOpener — shared opener layout: chapter number, title, lead, and    */
/*  page-specific content.                                                    */
/* -------------------------------------------------------------------------- */

import { PAGE } from "./styles";

export default function ChapterOpener({ number, chapter, title, lead, children }) {
  return (
    <div className="flex h-full flex-col">
      <p className={`${PAGE.overline} ${PAGE.ember}`}>
        Chapter {number}
        <span className="mx-2 opacity-50">—</span>
        {chapter}
      </p>
      <h2 className={`${PAGE.h2} mt-3`}>{title}</h2>
      {lead && (
        <p className={`${PAGE.body} ${PAGE.muted} mt-3 max-w-[52ch]`}>{lead}</p>
      )}
      <div className="mt-auto pt-5">{children}</div>
    </div>
  );
}
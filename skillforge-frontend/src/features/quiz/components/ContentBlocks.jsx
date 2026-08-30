import { cn } from "@/lib/utils";

const CODE_RE = /```([a-zA-Z0-9]*)\n([\s\S]*?)```/g;

/**
 * Splits a question body into text paragraphs and fenced code blocks.
 * The backend returns question content as a plain string; this is a
 * presentation-only parser that never mutates the source data. Anything
 * it cannot classify falls back to a plain paragraph, so malformed or
 * ambiguous content still renders readably.
 */
function parseContent(content) {
  if (!content) return [];

  const segments = [];
  let last = 0;
  let match;

  CODE_RE.lastIndex = 0;

  while ((match = CODE_RE.exec(content)) !== null) {
    const before = content.slice(last, match.index).trim();

    if (before) segments.push({ type: "text", text: before });

    segments.push({
      type: "code",
      lang: match[1] || "text",
      text: match[2].replace(/\n$/, ""),
    });

    last = CODE_RE.lastIndex;
  }

  const tail = content.slice(last).trim();

  if (tail) segments.push({ type: "text", text: tail });

  const out = [];

  for (const seg of segments) {
    if (seg.type === "code") {
      out.push(seg);
      continue;
    }

    seg.text
      .split(/\n{2,}/)
      .forEach((paragraph) => {
        const trimmed = paragraph.trim();
        if (trimmed) out.push({ type: "text", text: trimmed });
      });
  }

  return out;
}

/**
 * Renders question content with structured spacing and first-class code
 * blocks. Used by Coding / Interview / Scenario so any embedded example
 * code is never shown as a flat paragraph.
 */
export default function ContentBlocks({ content, className }) {
  const segments = parseContent(content);

  if (!segments.length) return null;

  return (
    <div className={cn("space-y-3 text-[0.95rem] leading-relaxed text-foreground/90", className)}>
      {segments.map((segment, i) =>
        segment.type === "code" ? (
          <pre
            key={i}
            className="overflow-x-auto rounded-xl border border-[oklch(1_0_0/12%)] bg-[oklch(0.18_0.012_260)] p-4 text-[0.82rem] leading-6 text-[oklch(0.92_0.005_90)]"
          >
            <code className="font-mono">{segment.text}</code>
          </pre>
        ) : (
          <p key={i}>{segment.text}</p>
        ),
      )}
    </div>
  );
}

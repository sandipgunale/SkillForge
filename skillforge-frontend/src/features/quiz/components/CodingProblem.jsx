import { cn } from "@/lib/utils";

/**
 * Presentation-only parser for a coding problem body.
 *
 * The backend returns the problem as a plain string. This renderer detects
 * common section headings (Description / Constraints / Examples / Input /
 * Output / Expected Output / Explanation — as Markdown `#` headings or
 * `Label:` lines) and lays the content out as scannable modules instead of a
 * single text wall. Code blocks (```fence```) are preserved verbatim inside
 * whatever section they belong to.
 *
 * It NEVER mutates the source data. If no section structure is detected it
 * returns `null` so the caller can fall back to the plain `ContentBlocks`
 * renderer — ambiguous content still renders readably.
 */

const SECTION_LABELS = {
  description: "Description",
  constraints: "Constraints",
  examples: "Examples",
  example: "Example",
  input: "Input",
  output: "Output",
  expectedoutput: "Expected Output",
  explanation: "Explanation",
  notes: "Notes",
  note: "Note",
  hints: "Hints",
  hint: "Hint",
  edgecases: "Edge Cases",
};

const HEADER_RE =
  /^(#{1,4}\s+)?(description|constraints?|examples?|example\s*\d+|input|output|expected\s*output|explanation|notes?|hints?|edge\s*cases?)\b[:\s-]*/i;

function tokenize(content) {
  const tokens = [];
  const codeRe = /```(\w*)\n([\s\S]*?)```/g;
  let last = 0;
  let match;

  while ((match = codeRe.exec(content)) !== null) {
    const before = content.slice(last, match.index);
    if (before.trim()) tokens.push({ type: "text", text: before });
    tokens.push({ type: "code", lang: match[1] || "text", text: match[2].replace(/\n$/, "") });
    last = codeRe.lastIndex;
  }

  const tail = content.slice(last);
  if (tail.trim()) tokens.push({ type: "text", text: tail });

  return tokens;
}

function parseSections(content) {
  if (!content) return null;

  const tokens = tokenize(content);
  const sections = [];
  let current = null;

  const pushCurrent = () => {
    if (current) sections.push(current);
    current = null;
  };

  for (const token of tokens) {
    if (token.type === "code") {
      if (!current) current = { title: null, blocks: [] };
      current.blocks.push({ type: "code", lang: token.lang, text: token.text });
      continue;
    }

    const lines = token.text.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        if (current) current.blocks.push({ type: "blank" });
        continue;
      }

      const headerMatch = trimmed.match(HEADER_RE);

      if (headerMatch) {
        pushCurrent();
        const raw = (headerMatch[2] || "").toLowerCase().replace(/\s*\d+$/, "");
        const label = SECTION_LABELS[raw] ?? "Section";
        current = { title: label, blocks: [] };
        // Capture any inline text after the colon on the same line.
        const rest = trimmed.slice(headerMatch[0].length).trim();
        if (rest) current.blocks.push({ type: "text", text: rest });
        continue;
      }

      if (!current) current = { title: null, blocks: [] };
      current.blocks.push({ type: "text", text: trimmed });
    }
  }

  pushCurrent();

  if (!sections.length) return null;

  const hasTitles = sections.some((s) => s.title);
  if (!hasTitles) return null;

  return sections;
}

function CodeBlock({ lang, text }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-[oklch(1_0_0/12%)] bg-[oklch(0.18_0.012_260)] p-4 text-[0.82rem] leading-6 text-[oklch(0.92_0.005_90)]">
      {lang && lang !== "text" && (
        <code className="mb-2 block font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[oklch(0.6_0.01_90)]">
          {lang}
        </code>
      )}
      <code className="font-mono">{text}</code>
    </pre>
  );
}

function Section({ title, blocks }) {
  return (
    <div className="space-y-2">
      {title && (
        <h4 className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-primary/80">
          {title}
        </h4>
      )}
      <div className="space-y-2">
        {blocks.map((block, i) => {
          if (block.type === "blank") return <div key={i} className="h-1" />;
          if (block.type === "code") return <CodeBlock key={i} {...block} />;
          return (
            <p key={i} className="text-[0.95rem] leading-relaxed text-foreground/90">
              {block.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export default function CodingProblem({ content, className, children }) {
  const sections = parseSections(content);

  if (!sections) return children ?? null;

  return (
    <div className={cn("space-y-5", className)}>
      {sections.map((section, i) => (
        <Section key={i} title={section.title} blocks={section.blocks} />
      ))}
    </div>
  );
}

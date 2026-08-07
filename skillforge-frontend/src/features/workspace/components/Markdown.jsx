import { useEffect, useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

/* ==========================================================================
   Markdown — a small, safe renderer for the Learning Workspace.

   Deliberately NOT a full CommonMark implementation: the only markdown we
   render is produced by the copilot engine / the user's own notes. All text
   is escaped — arbitrary HTML never reaches the DOM. Supports the constructs
   we emit: headings, bold/italic, inline + fenced code (with copy),
   bullet/numbered lists, blockquotes, hr, links and paragraphs.
   ========================================================================== */

function escape(text) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(text).replace(/[&<>"']/g, (char) => map[char]);
}

function renderInline(text, keyPrefix) {
  const INLINE = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  const nodes = [];
  let lastIndex = 0;
  let match;
  let index = 0;

  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(escape(text.slice(lastIndex, match.index)));
    const [, , bold, italic, code, linkText, linkUrl] = match;
    const key = `${keyPrefix}-${index}`;
    if (bold) nodes.push(<strong key={key}>{escape(bold)}</strong>);
    else if (italic) nodes.push(<em key={key}>{escape(italic)}</em>);
    else if (code) nodes.push(<TextCode key={key}>{code}</TextCode>);
    else if (linkText) {
      nodes.push(
        <a key={key} href={escape(linkUrl)} target="_blank" rel="noopener noreferrer" className="text-ember underline underline-offset-2">
          {escape(linkText)}
        </a>,
      );
    }
    index += 1;
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(escape(text.slice(lastIndex)));
  return nodes;
}

function TextCode({ children }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
      {children}
    </code>
  );
}

function FenceBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border bg-[color:color-mix(in_oklch,var(--foreground)_4%,var(--background))]">
      <div className="flex items-center justify-between border-b px-3 py-1.5 text-3xs font-semibold uppercase tracking-widest text-muted-foreground">
        <span>{language || "code"}</span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 hover:text-foreground"
          aria-label="Copy code"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-overline leading-relaxed">{escape(code)}</pre>
    </div>
  );
}

function parseBlocks(content) {
  const lines = content.split("\n");
  const output = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      const lang = line.trim().replace(/^```/, "").trim();
      const code = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      output.push({ type: "fence", lang, code: code.join("\n") });
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      output.push({ type: "hr" });
      i += 1;
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      output.push({ type: "h", level: heading[1].length, text: heading[2] });
      i += 1;
      continue;
    }

    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      output.push({ type: "quote", text: quote[1] });
      i += 1;
      continue;
    }

    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      const items = [bullet[1]];
      i += 1;
      while (i < lines.length && /^\s*[-*]\s+\S/.test(lines[i])) {
        const next = /^\s*[-*]\s+(.*)$/.exec(lines[i]);
        items.push(next[1]);
        i += 1;
      }
      output.push({ type: "ul", items });
      continue;
    }

    const ordered = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (ordered) {
      const items = [ordered[1]];
      i += 1;
      while (i < lines.length && /^\s*\d+\.\s+\S/.test(lines[i])) {
        const next = /^\s*\d+\.\s+(.*)$/.exec(lines[i]);
        items.push(next[1]);
        i += 1;
      }
      output.push({ type: "ol", items });
      continue;
    }

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    output.push({ type: "p", text: line.trim() });
    i += 1;
  }

  return output;
}

export default function Markdown({ children }) {
  const content = useMemo(() => String(children ?? ""), [children]);
  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground">
      {blocks.map((block, i) => {
        const key = `b-${i}`;
        switch (block.type) {
          case "h":
            if (block.level <= 2)
              return <h3 key={key} className="text-base font-semibold">{renderInline(block.text, key)}</h3>;
            return <h4 key={key} className="text-sm font-semibold">{renderInline(block.text, key)}</h4>;
          case "quote":
            return (
              <blockquote key={key} className="border-l-2 border-ember/60 pl-3 text-muted-foreground">
                {renderInline(block.text, key)}
              </blockquote>
            );
          case "ul":
            return (
              <ul key={key} className="list-disc space-y-1 pl-4 marker:text-muted-foreground">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item, `${key}-${j}`)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={key} className="list-decimal space-y-1 pl-4 marker:text-muted-foreground">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item, `${key}-${j}`)}</li>
                ))}
              </ol>
            );
          case "fence":
            return <FenceBlock key={key} language={block.lang} code={block.code} />;
          case "hr":
            return <hr key={key} className="border-border" />;
          default:
            return <p key={key}>{renderInline(block.text, key)}</p>;
        }
      })}
    </div>
  );
}

export function StreamedMarkdown({ text = "", reduced = false, speed = 14 }) {
  const content = String(text);
  const [done, setDone] = useState(() => reduced);
  const [len, setLen] = useState(() => (reduced ? content.length : 24));
  const finished = len >= content.length;

  useEffect(() => {
    if (reduced) return undefined;
    if (!finished) {
      const id = window.setInterval(
        () => setLen((l) => Math.min(l + 2, content.length)),
        speed,
      );
      return () => window.clearInterval(id);
    }
    const timeout = window.setTimeout(() => setDone(true), 300);
    return () => window.clearTimeout(timeout);
  }, [reduced, finished, content, speed]);

  if (!reduced && !done) {
    return (
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {content.slice(0, len)}
        <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-ember" aria-hidden="true" />
      </p>
    );
  }

  return <Markdown>{content}</Markdown>;
}
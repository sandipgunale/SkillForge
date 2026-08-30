import {
  ArrowUpRight,
  BookOpen,
  Code2,
  Dumbbell,
  FileText,
  Link as LinkIcon,
  ListChecks,
  PlayCircle,
} from "lucide-react";

import { useContentItems } from "../../hooks/useContentItems";
import ResourceViewer from "./ResourceViewer";
import { Skeleton } from "@/components/ui/skeleton";

const CONTENT_TYPE_META = {
  VIDEO: { icon: PlayCircle, label: "Video" },
  ARTICLE: { icon: FileText, label: "Article" },
  BOOK: { icon: BookOpen, label: "Book" },
  PDF: { icon: FileText, label: "PDF" },
  DOCUMENT: { icon: FileText, label: "Document" },
  LINK: { icon: LinkIcon, label: "Link" },
  GITHUB: { icon: Code2, label: "GitHub" },
  EXERCISE: { icon: Dumbbell, label: "Exercise" },
};

export default function ResourceContentSections({ resource, resourceId }) {
  const { data: items = [], isLoading } = useContentItems(resourceId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <ResourceViewer resource={resource} />;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <ListChecks className="size-5 text-ember" />
        <h2 className="text-lg font-semibold">Content</h2>
        <span className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "section" : "sections"}
        </span>
      </div>

      <ol className="space-y-3">
        {items.map((item, index) => {
          const meta = CONTENT_TYPE_META[item.type] ?? {
            icon: FileText,
            label: item.type,
          };
          const Icon = meta.icon;

          return (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border bg-background p-4"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ember/10 text-sm font-semibold text-ember">
                {index + 1}
              </div>

              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="size-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {meta.label}
                  {item.durationMinutes
                    ? ` · ${item.durationMinutes} min`
                    : ""}
                  {item.author ? ` · ${item.author}` : ""}
                </p>
                {item.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-foreground/5"
                >
                  Open
                  <ArrowUpRight className="size-4" />
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

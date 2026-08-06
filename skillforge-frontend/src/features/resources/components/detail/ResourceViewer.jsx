import { ExternalLink, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";

import { getYoutubeEmbedUrl } from "../../utils/youtube";

export default function ResourceViewer({ resource }) {
  switch (resource.type) {
    case "VIDEO": {
      const embedUrl = getYoutubeEmbedUrl(resource.url);

      if (!embedUrl) {
        return (
          <div className="rounded-xl border bg-card p-8 text-center">
            <p className="text-muted-foreground">Invalid YouTube video URL.</p>
          </div>
        );
      }

      return (
        <iframe
          className="aspect-video w-full rounded-xl border"
          src={embedUrl}
          title={resource.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    case "DOCS":
      return (
        <iframe
          className="h-200 w-full rounded-xl border"
          src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
            resource.url,
          )}`}
          title={resource.title}
        />
      );

    case "ARTICLE":
    default:
      return (
        <div className="rounded-xl border bg-card p-8">
          <div className="flex flex-col items-center gap-5 text-center">
            <FileText className="h-12 w-12 text-primary" />

            <div>
              <h3 className="text-xl font-semibold">External Resource</h3>

              <p className="mt-2 text-muted-foreground">
                Click below to open this resource in a new tab.
              </p>
            </div>

            <Button asChild>
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                Open Resource
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      );
  }
}

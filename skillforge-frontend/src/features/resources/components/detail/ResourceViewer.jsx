export default function ResourceViewer({ resource }) {
  switch (resource.type) {
    case "VIDEO":
      return (
        <iframe
          className="aspect-video w-full rounded-xl border"
          src={`https://www.youtube.com/embed/${resource.youtubeVideoId}`}
          title={resource.title}
          allowFullScreen
        />
      );

    case "PDF":
      return (
        <iframe
          className="h-175 w-full rounded-xl border"
          src={resource.url}
          title={resource.title}
        />
      );

    default:
      return (
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline"
        >
          Open Article
        </a>
      );
  }
}

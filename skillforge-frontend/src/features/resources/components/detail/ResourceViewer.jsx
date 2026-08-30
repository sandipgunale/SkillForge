import MediaPlayer from "@/components/media/MediaPlayer";

export default function ResourceViewer({ resource }) {
  return (
    <MediaPlayer
      url={resource.url}
      type={resource.type}
      title={resource.title}
      youtubeVideoId={resource.youtubeVideoId}
    />
  );
}

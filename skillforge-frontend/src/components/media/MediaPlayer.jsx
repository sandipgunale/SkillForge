import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { ExternalLink, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resolveMediaSource } from "@/lib/media";
import { useMotionSafe } from "@/hooks/useMotionSafe";

const IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";

/**
 * SkillForge-native media player. Plays video inline (no external redirect):
 *  - YouTube / Vimeo via sandboxed embeds (privacy-enhanced YouTube)
 *  - HLS (.m3u8) via hls.js (with native fallback on Safari)
 *  - progressive files (mp4/webm/...) via the native <video> element
 *  - documents (pdf/doc) via sandboxed viewer
 *  - anything else degrades to a link-out (never an untrusted iframe)
 */
export default function MediaPlayer({
  url,
  type,
  title,
  poster,
  youtubeVideoId,
  autoPlay = false,
  controls = true,
  className = "",
  onProgress,
  startTime = 0,
}) {
  const motion = useMotionSafe();
  const videoRef = useRef(null);
  const resolved = resolveMediaSource({ url, type, youtubeVideoId });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || resolved.provider !== "hls") return undefined;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = resolved.src;
      return undefined;
    }
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(resolved.src);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
    return undefined;
  }, [resolved.provider, resolved.src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || (resolved.provider !== "file" && resolved.provider !== "hls")) {
      return undefined;
    }
    if (startTime > 0) video.currentTime = startTime;
    const handle = () => {
      if (onProgress && Number.isFinite(video.currentTime)) {
        onProgress(Math.floor(video.currentTime));
      }
    };
    video.addEventListener("timeupdate", handle);
    return () => video.removeEventListener("timeupdate", handle);
  }, [resolved.provider, startTime, onProgress]);

  const shell = cn(
    "overflow-hidden rounded-xl border bg-card",
    motion ? "transition-opacity duration-300" : "",
    className,
  );

  if (!url) {
    return (
      <div className={cn(shell, "p-8 text-center text-muted-foreground")}>
        No media available for this resource.
      </div>
    );
  }

  if (resolved.provider === "youtube" || resolved.provider === "vimeo") {
    return (
      <iframe
        className={cn("aspect-video w-full border-0 bg-black", className)}
        src={resolved.src}
        title={title || "Media"}
        allow={IFRAME_ALLOW}
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        loading="lazy"
      />
    );
  }

  if (resolved.provider === "hls" || resolved.provider === "file") {
    return (
      <video
        ref={videoRef}
        className={cn("aspect-video w-full border-0 bg-black", className)}
        src={resolved.provider === "file" ? resolved.src : undefined}
        poster={poster}
        controls={controls}
        autoPlay={autoPlay}
        preload="metadata"
        playsInline
      />
    );
  }

  if (resolved.provider === "document") {
    const isPdf = /\.pdf(\?|$)/i.test(url);
    const viewSrc = !isPdf
      ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`
      : url;
    return (
      <iframe
        className={cn("h-[70vh] w-full border-0", className)}
        src={viewSrc}
        title={title || "Document"}
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
      />
    );
  }

  return (
    <div className={cn(shell, "flex flex-col items-center gap-5 p-8 text-center")}>
      <PlayCircle className="size-12 text-primary" />
      <div>
        <h3 className="text-xl font-semibold">{title || "External Resource"}</h3>
        <p className="mt-2 text-muted-foreground">
          Open this resource in a new tab to continue.
        </p>
      </div>
      <Button asChild>
        <a href={url} target="_blank" rel="noopener noreferrer">
          Open Resource
          <ExternalLink className="ml-2 size-4" />
        </a>
      </Button>
    </div>
  );
}

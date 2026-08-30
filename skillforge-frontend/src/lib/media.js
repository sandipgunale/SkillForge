/* Media provider resolution + safe embed URL building.
   External media is treated as untrusted: only allowlisted hosts may be
   embedded, and everything else degrades to a link-out. */

const YOUTUBE_EMBED = "https://www.youtube-nocookie.com/embed";
const VIMEO_EMBED = "https://player.vimeo.com/video";

const ALLOWED_EMBED_HOSTS = [
  "youtube.com",
  "www.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
  "m.youtube.com",
  "vimeo.com",
  "player.vimeo.com",
  "docs.google.com",
  "drive.google.com",
];

function hostOf(url) {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return null;
  }
}

export function isAllowedEmbedHost(url) {
  const host = hostOf(url);
  return host ? ALLOWED_EMBED_HOSTS.includes(host) : false;
}

export function getYoutubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube-nocookie\.com\/embed\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function getVimeoId(url) {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

/**
 * Maps a resource/content URL + type into a concrete media source.
 * Never returns an untrusted host as an embed target.
 */
export function resolveMediaSource({ url, type, youtubeVideoId }) {
  if (!url) return { provider: "none" };

  const youtube = youtubeVideoId || getYoutubeId(url);
  if (youtube) {
    return { provider: "youtube", videoId: youtube, src: `${YOUTUBE_EMBED}/${youtube}` };
  }

  const vimeo = getVimeoId(url);
  if (vimeo) {
    return { provider: "vimeo", videoId: vimeo, src: `${VIMEO_EMBED}/${vimeo}` };
  }

  const lower = url.toLowerCase();
  if (lower.endsWith(".m3u8")) {
    return { provider: "hls", src: url };
  }
  if (/\.(mp4|webm|ogg|ogv|mov)(\?|$)/.test(lower)) {
    return { provider: "file", src: url };
  }
  if (/\.pdf(\?|$)/i.test(lower) || type === "PDF" || type === "DOCUMENT" || type === "DOCS") {
    return { provider: "document", src: url };
  }

  return { provider: "link", src: url };
}

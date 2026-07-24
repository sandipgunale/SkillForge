export function getYoutubeEmbedUrl(url) {
  if (!url) return "";

  try {
    // https://www.youtube.com/watch?v=abc123
    if (url.includes("watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // https://youtu.be/abc123
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Already an embed URL
    if (url.includes("/embed/")) {
      return url;
    }

    return "";
  } catch {
    return "";
  }
}
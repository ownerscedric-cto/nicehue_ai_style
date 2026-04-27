import type { VideoContent } from "./types";

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

interface YouTubeSearchItem {
  id: { kind: string; videoId?: string };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
  };
}

interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/g, " ")
    .replace(/&#\d+;/g, " ");
}

function formatPublishedAt(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

export function hasYoutubeKey(): boolean {
  return Boolean(process.env.YOUTUBE_API_KEY);
}

export async function searchVideos(
  query: string,
  maxResults = 6,
): Promise<VideoContent[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams({
    key: apiKey,
    q: query,
    part: "snippet",
    type: "video",
    maxResults: String(Math.min(Math.max(maxResults, 1), 10)),
    relevanceLanguage: "ko",
    regionCode: "KR",
    safeSearch: "moderate",
  });

  try {
    const res = await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[youtube] HTTP ${res.status}: ${text.slice(0, 200)}`);
      return [];
    }

    const data = (await res.json()) as YouTubeSearchResponse;

    return data.items
      .filter((item) => item.id.videoId)
      .map((item) => {
        const videoId = item.id.videoId!;
        const thumb =
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url ||
          item.snippet.thumbnails.default?.url ||
          "";
        return {
          videoId,
          title: decodeHtmlEntities(item.snippet.title),
          description: decodeHtmlEntities(item.snippet.description),
          thumbnail: thumb,
          channel: item.snippet.channelTitle,
          publishedAt: formatPublishedAt(item.snippet.publishedAt),
          link: `https://www.youtube.com/watch?v=${videoId}`,
        };
      });
  } catch (err) {
    console.error("[youtube] failed:", err);
    return [];
  }
}

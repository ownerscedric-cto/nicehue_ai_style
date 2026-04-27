import type { NewsContent } from "./types";

const NAVER_NEWS_URL = "https://openapi.naver.com/v1/search/news.json";

interface NaverNewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

interface NaverNewsResponse {
  total: number;
  items: NaverNewsItem[];
}

function strip(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z]+;/g, " ")
    .replace(/&#\d+;/g, " ")
    .trim();
}

function formatPubDate(rfc822: string): string {
  try {
    const d = new Date(rfc822);
    if (isNaN(d.getTime())) return "";
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

export async function searchNews(
  query: string,
  display = 5,
): Promise<NewsContent[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return [];
  }

  const params = new URLSearchParams({
    query,
    display: String(Math.min(Math.max(display, 1), 10)),
    sort: "sim",
  });

  try {
    const res = await fetch(`${NAVER_NEWS_URL}?${params.toString()}`, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("[naver-news] HTTP error:", res.status);
      return [];
    }

    const data = (await res.json()) as NaverNewsResponse;

    return data.items.map((item) => ({
      title: strip(item.title),
      description: strip(item.description),
      link: item.link,
      pubDate: formatPubDate(item.pubDate),
    }));
  } catch (err) {
    console.error("[naver-news] failed:", err);
    return [];
  }
}

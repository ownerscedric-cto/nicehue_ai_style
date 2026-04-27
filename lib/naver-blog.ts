import type { RelatedContent } from "./types";

const NAVER_BLOG_URL = "https://openapi.naver.com/v1/search/blog.json";

interface NaverBlogItem {
  title: string;
  link: string;
  description: string;
  bloggername: string;
  bloggerlink: string;
  postdate: string;
}

interface NaverBlogResponse {
  total: number;
  items: NaverBlogItem[];
}

function strip(text: string): string {
  return text.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/g, " ").trim();
}

function formatPostDate(yyyymmdd: string): string {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}.${yyyymmdd.slice(4, 6)}.${yyyymmdd.slice(6, 8)}`;
}

export async function searchBlogs(
  query: string,
  display = 5,
): Promise<RelatedContent[]> {
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
    const res = await fetch(`${NAVER_BLOG_URL}?${params.toString()}`, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("[naver-blog] HTTP error:", res.status);
      return [];
    }

    const data = (await res.json()) as NaverBlogResponse;

    return data.items.map((item) => ({
      title: strip(item.title),
      description: strip(item.description),
      link: item.link,
      blogger: item.bloggername,
      postdate: formatPostDate(item.postdate),
    }));
  } catch (err) {
    console.error("[naver-blog] failed:", err);
    return [];
  }
}

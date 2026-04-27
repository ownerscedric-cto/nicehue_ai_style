import { NextResponse } from "next/server";
import {
  buildPersonalizedQueries,
  extractKeywords,
  generateAIComment,
  getStyleSummary,
} from "@/lib/mock-ai";
import {
  loadMockProducts,
  filterProducts as filterMockProducts,
  assignReasons,
} from "@/lib/mock-products";
import {
  hasNaverKeys,
  searchMultiple,
  NaverApiError,
} from "@/lib/naver-shopping";
import { searchBlogs } from "@/lib/naver-blog";
import { searchNews } from "@/lib/naver-news";
import { searchVideos } from "@/lib/youtube";
import { fetchNicehueProducts } from "@/lib/nicehue";
import type {
  NewsContent,
  Product,
  RelatedContent,
  UserProfile,
  VideoContent,
} from "@/lib/types";

const SIMULATED_MIN_DELAY_MS = 1500;

function buildContentQuery(prompt: string, keywords: string[]): string {
  const cleaned = prompt
    .replace(/(\d+\s*만\s*원\s*(이하|이내|미만)?)/g, "")
    .replace(/(\d+\s*천\s*원\s*(이하|이내|미만)?)/g, "")
    .replace(/예산.*?(?=,|$)/g, "")
    .replace(/(남자|남성)\s*/g, "")
    .replace(/[,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const base = cleaned || keywords.slice(0, 3).join(" ") || "패션";
  const withGender = /여자|여성/.test(base) ? base : `여자 ${base}`;
  const truncated =
    withGender.length > 30 ? withGender.slice(0, 30) : withGender;
  return `${truncated} 코디`;
}

export async function POST(request: Request) {
  const startedAt = Date.now();

  try {
    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const profile: UserProfile | undefined = body.profile;

    if (!prompt) {
      return NextResponse.json(
        { error: "스타일을 입력해주세요." },
        { status: 400 },
      );
    }

    const extracted = extractKeywords(prompt);
    let products: Product[] = [];
    let featuredProducts: Product[] = [];
    let usedSource: "naver" | "mock" = "mock";
    let blogs: RelatedContent[] = [];
    let news: NewsContent[] = [];
    let videos: VideoContent[] = [];

    const contentQuery = buildContentQuery(prompt, extracted.keywords);

    const featuredPromise = fetchNicehueProducts({
      prompt,
      styleTags: extracted.style_tags,
      budgetMax: extracted.budget_max,
      limit: 6,
    });

    if (hasNaverKeys()) {
      const queries = buildPersonalizedQueries(
        prompt,
        extracted.keywords,
        profile,
      );

      const [shopResults, blogResults, newsResults, videoResults, featured] =
        await Promise.allSettled([
          searchMultiple(queries, 20),
          searchBlogs(contentQuery, 5),
          searchNews(contentQuery, 5),
          searchVideos(contentQuery, 6),
          featuredPromise,
        ]);

      if (shopResults.status === "fulfilled" && shopResults.value.length > 0) {
        products = shopResults.value;
        usedSource = "naver";
      } else if (shopResults.status === "rejected") {
        const reason = shopResults.reason;
        if (reason instanceof NaverApiError) {
          console.error(
            `[curate] Naver shop API ${reason.status}: ${reason.message}`,
          );
        } else {
          console.error("[curate] Naver shop search failed:", reason);
        }
      }

      if (blogResults.status === "fulfilled") blogs = blogResults.value;
      if (newsResults.status === "fulfilled") news = newsResults.value;
      if (videoResults.status === "fulfilled") videos = videoResults.value;
      if (featured.status === "fulfilled") featuredProducts = featured.value;
    } else {
      const [videoResults, featured] = await Promise.allSettled([
        searchVideos(contentQuery, 6),
        featuredPromise,
      ]);
      if (videoResults.status === "fulfilled") videos = videoResults.value;
      if (featured.status === "fulfilled") featuredProducts = featured.value;
    }

    if (extracted.budget_max) {
      products = products.filter((p) => p.price <= extracted.budget_max!);
    }

    if (products.length === 0) {
      const allMock = await loadMockProducts();
      products = filterMockProducts(
        allMock,
        extracted.style_tags,
        extracted.budget_max,
      );
      usedSource = "mock";
    } else {
      products = products.slice(0, 12);
    }

    const withReasons = assignReasons(products, extracted.style_tags);
    const summary = getStyleSummary(prompt, extracted.style_tags);
    const aiComment = generateAIComment({
      prompt,
      styleTags: extracted.style_tags,
      budgetMax: extracted.budget_max,
      productCount: withReasons.length,
      profile,
    });

    const elapsed = Date.now() - startedAt;
    const remaining = SIMULATED_MIN_DELAY_MS - elapsed;
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }

    return NextResponse.json({
      style_summary: summary,
      keywords_used:
        extracted.keywords.length > 0 ? extracted.keywords : ["전체"],
      featured_products: featuredProducts,
      products: withReasons,
      ai_comment: aiComment,
      related_content: blogs,
      related_news: news,
      related_videos: videos,
      _source: usedSource,
    });
  } catch (error) {
    console.error("[curate] error:", error);
    return NextResponse.json(
      { error: "큐레이션 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

import type { Product } from "./types";

const NAVER_API_URL = "https://openapi.naver.com/v1/search/shop.json";

interface NaverShopItem {
  productId: string;
  title: string;
  link: string;
  image: string;
  lprice: string;
  hprice?: string;
  mallName: string;
  brand?: string;
  maker?: string;
  category4?: string;
}

interface NaverShopResponse {
  total: number;
  items: NaverShopItem[];
}

function cleanTitle(title: string): string {
  return title.replace(/<[^>]*>/g, "").trim();
}

export class NaverApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export function hasNaverKeys(): boolean {
  return Boolean(
    process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET,
  );
}

export async function searchProducts(
  query: string,
  display = 20,
): Promise<Product[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new NaverApiError("Naver API keys not configured", 500);
  }

  const params = new URLSearchParams({
    query,
    display: String(Math.min(Math.max(display, 1), 100)),
    sort: "sim",
  });

  const res = await fetch(`${NAVER_API_URL}?${params.toString()}`, {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new NaverApiError(
      `Naver API error ${res.status}: ${text.slice(0, 200)}`,
      res.status,
    );
  }

  const data = (await res.json()) as NaverShopResponse;

  return data.items.map((item) => {
    const cleaned = cleanTitle(item.title);
    return {
      id: `naver_${item.productId}`,
      title: cleaned,
      brand: item.brand || item.maker || item.mallName || "",
      price: parseInt(item.lprice, 10) || 0,
      image: item.image,
      link: item.link,
      mall: item.mallName || "쇼핑몰",
      tags: [],
    } satisfies Product;
  });
}

export async function searchMultiple(
  queries: string[],
  perQuery = 20,
): Promise<Product[]> {
  if (queries.length === 0) return [];

  const settled = await Promise.allSettled(
    queries.map((q) => searchProducts(q, perQuery)),
  );

  const flat: Product[] = [];
  for (const result of settled) {
    if (result.status === "fulfilled") {
      flat.push(...result.value);
    } else {
      console.error("[naver-shopping] query failed:", result.reason);
    }
  }

  const seen = new Set<string>();
  return flat.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

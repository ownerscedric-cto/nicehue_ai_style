import type { Product } from "./types";

const NICEHUE_HOME = "https://nicehue.co.kr/";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) StyleAI-Demo/1.0";

const CACHE_TTL_SECONDS = 300;

const PRODUCT_BLOCK_RE =
  /<div class="prdImg"[^>]*product_no=(\d+)[^>]*>([\s\S]*?)<div class="description">([\s\S]*?)<\/div>\s*<\/div>\s*<\/li>/g;

function parseProductsFromHtml(html: string): Product[] {
  const products: Product[] = [];
  PRODUCT_BLOCK_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = PRODUCT_BLOCK_RE.exec(html)) !== null) {
    const productNo = match[1];
    const imgBlock = match[2];
    const descBlock = match[3];

    const imgMatch =
      imgBlock.match(/<img[^>]+class="thumb_Img"[^>]+src="([^"]+)"/) ||
      imgBlock.match(/<img[^>]+src="([^"]+)"[^>]+class="thumb_Img"/);
    const altMatch = imgBlock.match(
      /<img[^>]+class="thumb_Img"[^>]+alt="([^"]*)"/,
    );

    const titleMatch = descBlock.match(
      /<strong class="name">[\s\S]*?<span[^>]*>([^<]+)<\/span>/,
    );

    const priceMatch = descBlock.match(/(\d{1,3}(?:,\d{3})+)\s*원/);

    const title = (titleMatch?.[1] || altMatch?.[1] || "").trim();
    const rawImage = imgMatch?.[1] || "";
    const image = rawImage.startsWith("//")
      ? `https:${rawImage}`
      : rawImage;
    const price = priceMatch
      ? parseInt(priceMatch[1].replace(/,/g, ""), 10)
      : 0;

    if (!title || !image || price <= 0) continue;

    products.push({
      id: `nicehue_${productNo}`,
      title,
      brand: "니스휴",
      price,
      image,
      link: `https://nicehue.co.kr/product/detail.html?product_no=${productNo}`,
      mall: "니스휴",
      tags: [],
    });
  }

  return products;
}

async function fetchNicehueHomeHtml(): Promise<string> {
  const res = await fetch(NICEHUE_HOME, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "ko,en;q=0.9",
    },
    next: { revalidate: CACHE_TTL_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`nicehue HTTP ${res.status}`);
  }

  return res.text();
}

function matchByPromptKeywords(
  products: Product[],
  prompt: string,
): Product[] {
  const tokens = prompt
    .replace(/[\d,]+\s*원/g, " ")
    .replace(/(\d+\s*만\s*원\s*(이하|이내|미만)?)/g, " ")
    .replace(/예산|이하|이내|미만|스타일|코디|룩/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);

  if (tokens.length === 0) return [];

  const scored = products.map((p) => {
    const haystack = p.title.toLowerCase();
    const score = tokens.reduce(
      (acc, t) => (haystack.includes(t.toLowerCase()) ? acc + 1 : acc),
      0,
    );
    return { product: p, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.product);
}

interface FetchOptions {
  prompt: string;
  budgetMax: number | null;
  limit?: number;
}

export async function fetchNicehueProducts(
  options: FetchOptions,
): Promise<Product[]> {
  const { prompt, budgetMax, limit = 6 } = options;

  try {
    const html = await fetchNicehueHomeHtml();
    let products = parseProductsFromHtml(html);

    if (budgetMax !== null) {
      products = products.filter((p) => p.price <= budgetMax);
    }

    const matched = matchByPromptKeywords(products, prompt);
    const ordered = matched.length > 0 ? matched : products;

    return ordered.slice(0, limit);
  } catch (err) {
    console.error("[nicehue] fetch failed:", err);
    return [];
  }
}

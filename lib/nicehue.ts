import type { Product } from "./types";

const NICEHUE_HOME = "https://nicehue.co.kr/";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) StyleAI-Demo/1.0";
const CACHE_TTL_SECONDS = 300;

const NICEHUE_CATEGORIES: Array<{
  cateNo: number;
  name: string;
  tags: string[];
}> = [
  { cateNo: 43, name: "Outer", tags: ["outer", "jacket"] },
  { cateNo: 44, name: "Top", tags: ["top"] },
  { cateNo: 45, name: "Dress", tags: ["dress"] },
  { cateNo: 46, name: "Pants", tags: ["pants"] },
  { cateNo: 48, name: "Acc", tags: ["accessory"] },
];

const TITLE_KEYWORD_TAGS: Record<string, string[]> = {
  레이스: ["feminine", "lace"],
  플라워: ["feminine", "floral"],
  플로럴: ["feminine", "floral"],
  쉬폰: ["feminine"],
  새틴: ["feminine"],
  실크: ["feminine"],
  프릴: ["feminine"],
  리본: ["feminine"],
  러플: ["feminine"],
  도트: ["vintage", "feminine"],
  체크: ["vintage"],
  스트라이프: ["minimal"],
  솔리드: ["minimal"],
  베이직: ["minimal"],
  심플: ["minimal"],

  원피스: ["dress"],
  드레스: ["dress"],
  미니원피스: ["dress"],
  미디원피스: ["dress"],
  롱원피스: ["dress"],
  뷔스티에: ["top", "feminine"],
  블라우스: ["top", "shirt", "feminine"],
  셔츠: ["top", "shirt"],
  티셔츠: ["top", "tshirt"],
  티: ["top", "tshirt"],
  나시: ["top", "summer"],
  슬리브리스: ["top", "summer"],
  홀터넥: ["top", "summer", "feminine"],
  반팔: ["top", "summer"],
  반팔니트: ["top", "knit", "summer"],
  긴팔: ["top"],
  니트: ["top", "knit"],
  가디건: ["cardigan"],
  스웨터: ["knit"],

  스커트: ["skirt"],
  치마: ["skirt"],
  팬츠: ["pants"],
  슬랙스: ["pants", "formal"],
  바지: ["pants"],
  청바지: ["pants", "jeans"],
  데님: ["jeans"],
  쇼츠: ["pants", "summer"],

  자켓: ["outer", "jacket"],
  재킷: ["outer", "jacket"],
  코트: ["outer", "coat", "winter"],
  점퍼: ["outer"],
  베스트: ["outer"],
  가운: ["outer"],

  스카프: ["accessory"],
  가방: ["accessory"],

  여름: ["summer"],
  봄: ["spring"],
  가을: ["fall"],
  겨울: ["winter"],
};

const PRODUCT_BLOCK_RE =
  /<div class="prdImg"[^>]*product_no=(\d+)[^>]*>([\s\S]*?)<div class="description">([\s\S]*?)<\/div>\s*<\/div>\s*<\/li>/g;

interface NicehueProduct extends Product {
  inferredTags: string[];
}

function parseProductsFromHtml(
  html: string,
  categoryTags: string[],
): NicehueProduct[] {
  const products: NicehueProduct[] = [];
  const re = new RegExp(PRODUCT_BLOCK_RE.source, "g");

  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
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
    const image = rawImage.startsWith("//") ? `https:${rawImage}` : rawImage;
    const price = priceMatch
      ? parseInt(priceMatch[1].replace(/,/g, ""), 10)
      : 0;

    if (!title || !image || price <= 0) continue;

    const inferredTags = inferTagsFromTitle(title, categoryTags);

    products.push({
      id: `nicehue_${productNo}`,
      title,
      brand: "니스휴",
      price,
      image,
      link: `https://nicehue.co.kr/product/detail.html?product_no=${productNo}`,
      mall: "니스휴",
      tags: inferredTags,
      inferredTags,
    });
  }

  return products;
}

function inferTagsFromTitle(title: string, categoryTags: string[]): string[] {
  const tags = new Set<string>(categoryTags);
  for (const [keyword, mapped] of Object.entries(TITLE_KEYWORD_TAGS)) {
    if (title.includes(keyword)) {
      mapped.forEach((t) => tags.add(t));
    }
  }
  return Array.from(tags);
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "ko,en;q=0.9",
    },
    next: { revalidate: CACHE_TTL_SECONDS },
  });
  if (!res.ok) throw new Error(`nicehue HTTP ${res.status} for ${url}`);
  return res.text();
}

async function fetchAllProducts(): Promise<NicehueProduct[]> {
  const tasks: Promise<NicehueProduct[]>[] = [
    fetchHtml(NICEHUE_HOME)
      .then((html) => parseProductsFromHtml(html, []))
      .catch((err) => {
        console.error("[nicehue] home fetch failed:", err);
        return [];
      }),
    ...NICEHUE_CATEGORIES.map((cat) =>
      fetchHtml(
        `https://nicehue.co.kr/product/list.html?cate_no=${cat.cateNo}`,
      )
        .then((html) => parseProductsFromHtml(html, cat.tags))
        .catch((err) => {
          console.error(
            `[nicehue] cate=${cat.cateNo} fetch failed:`,
            err,
          );
          return [];
        }),
    ),
  ];

  const results = await Promise.all(tasks);

  const merged = new Map<string, NicehueProduct>();
  for (const list of results) {
    for (const product of list) {
      const existing = merged.get(product.id);
      if (existing) {
        const tagSet = new Set([...existing.inferredTags, ...product.inferredTags]);
        existing.inferredTags = Array.from(tagSet);
        existing.tags = existing.inferredTags;
      } else {
        merged.set(product.id, product);
      }
    }
  }

  return Array.from(merged.values());
}

interface FetchOptions {
  prompt: string;
  styleTags: string[];
  budgetMax: number | null;
  limit?: number;
}

export async function fetchNicehueProducts(
  options: FetchOptions,
): Promise<Product[]> {
  const { prompt, styleTags, budgetMax, limit = 6 } = options;

  try {
    let products = await fetchAllProducts();

    if (budgetMax !== null) {
      products = products.filter((p) => p.price <= budgetMax);
    }

    const promptTokens = prompt
      .replace(/[\d,]+\s*원/g, " ")
      .replace(/(\d+\s*만\s*원\s*(이하|이내|미만)?)/g, " ")
      .replace(/예산|이하|이내|미만|스타일|코디|룩/g, " ")
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2);

    const scored = products.map((p) => {
      let score = 0;
      const haystack = p.title.toLowerCase();

      for (const t of promptTokens) {
        if (haystack.includes(t.toLowerCase())) score += 2;
      }

      for (const tag of styleTags) {
        if (p.inferredTags.includes(tag)) score += 3;
      }

      return { product: p, score };
    });

    const matched = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.product);

    if (matched.length >= limit) {
      return matched.slice(0, limit).map(stripInferred);
    }

    const remaining = products
      .filter((p) => !matched.some((m) => m.id === p.id))
      .slice(0, limit - matched.length);

    return [...matched, ...remaining].slice(0, limit).map(stripInferred);
  } catch (err) {
    console.error("[nicehue] fetch failed:", err);
    return [];
  }
}

function stripInferred(p: NicehueProduct): Product {
  const { inferredTags: _it, ...rest } = p;
  void _it;
  return rest;
}

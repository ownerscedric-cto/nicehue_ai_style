import type { Product } from "./types";
import productsData from "@/public/mock-products.json";

const REASON_MAP: Record<string, string> = {
  minimal: "미니멀한 실루엣에 적합",
  casual: "캐주얼한 매력이 돋보이는 아이템",
  formal: "포멀한 자리에 잘 어울리는 아이템",
  street: "스트릿 무드를 완성해주는 아이템",
  feminine: "여성스러운 분위기의 아이템",
  vintage: "빈티지한 감성이 묻어나는 아이템",
  spring: "봄 시즌에 잘 어울리는 아이템",
  summer: "여름에 시원하게 입기 좋은 아이템",
  fall: "가을 무드와 어울리는 아이템",
  winter: "겨울에 따뜻하게 입기 좋은 아이템",
  date: "데이트룩으로 딱 좋은 아이템",
  office: "출근룩으로 활용도 높은 아이템",
  daily: "데일리하게 입기 좋은 아이템",
};

export async function loadMockProducts(): Promise<Product[]> {
  return productsData as Product[];
}

export function filterProducts(
  products: Product[],
  styleTags: string[],
  budgetMax: number | null,
): Product[] {
  const budgetFiltered = budgetMax
    ? products.filter((p) => p.price <= budgetMax)
    : products;

  const scored = budgetFiltered.map((product) => {
    const matchCount = product.tags.filter((tag) =>
      styleTags.includes(tag),
    ).length;
    return { product, score: matchCount };
  });

  const matched = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.product);

  if (matched.length >= 12) {
    return matched.slice(0, 12);
  }

  const remaining = budgetFiltered.filter((p) => !matched.includes(p));
  const shuffledRemaining = [...remaining].sort(() => Math.random() - 0.5);
  return [...matched, ...shuffledRemaining].slice(0, 12);
}

export function assignReasons(
  products: Product[],
  styleTags: string[],
): Product[] {
  return products.map((product) => {
    const matchedTag = product.tags.find((t) => styleTags.includes(t));
    const reason =
      (matchedTag && REASON_MAP[matchedTag]) ??
      "스타일과 잘 어울리는 아이템입니다";
    return { ...product, reason };
  });
}

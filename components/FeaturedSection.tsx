"use client";

import { Sparkles } from "lucide-react";
import { ProductGrid } from "@/components/ProductGrid";
import type { Product } from "@/lib/types";

interface Props {
  products: Product[];
}

export function FeaturedSection({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <Sparkles className="h-6 w-6 text-pink-500" />
            니스휴 셀렉션
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            여성 패션 큐레이팅 추천
          </p>
        </div>
        <a
          href="https://nicehue.co.kr/"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
        >
          쇼핑몰 바로가기 →
        </a>
      </div>

      <ProductGrid products={products} />
    </section>
  );
}

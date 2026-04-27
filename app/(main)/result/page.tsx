"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AICommentBox } from "@/components/AICommentBox";
import { FeaturedSection } from "@/components/FeaturedSection";
import { ProductGrid } from "@/components/ProductGrid";
import { RelatedContentSection } from "@/components/RelatedContent";
import { Button } from "@/components/ui/button";
import type { CurationResult } from "@/lib/types";

const RESULT_STORAGE_KEY = "styleai_last_result";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<CurationResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(RESULT_STORAGE_KEY);
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      setResult(JSON.parse(raw) as CurationResult);
    } catch {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready || !result) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 space-y-10">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {result.style_summary}
        </h1>
      </div>

      {result.ai_comment && (
        <AICommentBox
          comment={result.ai_comment}
          keywords={result.keywords_used}
        />
      )}

      {result.featured_products && result.featured_products.length > 0 && (
        <FeaturedSection products={result.featured_products} />
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          네이버 쇼핑 추천 ({result.products.length})
        </h2>
        {result.products.length > 0 ? (
          <ProductGrid products={result.products} />
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            매칭되는 상품을 찾지 못했어요.
          </div>
        )}
      </section>

      <RelatedContentSection
        blogs={result.related_content ?? []}
        news={result.related_news ?? []}
        videos={result.related_videos ?? []}
      />

      <div className="flex justify-center pt-4">
        <Button variant="outline" size="lg" asChild>
          <Link href="/">다른 스타일 찾기</Link>
        </Button>
      </div>
    </div>
  );
}

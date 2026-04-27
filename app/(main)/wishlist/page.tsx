"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/ProductGrid";
import { useSession } from "@/lib/session-context";
import { getWishlist } from "@/lib/wishlist-storage";
import type { Product, WishlistItem } from "@/lib/types";

export default function WishlistPage() {
  const router = useRouter();
  const { user, hydrated } = useSession();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    setItems(getWishlist());
    setLoaded(true);
  }, [hydrated, user, router]);

  if (!loaded) return null;

  const productsForGrid: Product[] = items.map((it) => ({
    id: it.id,
    title: it.title,
    brand: it.brand,
    price: it.price,
    image: it.image,
    link: it.link,
    mall: it.mall,
    tags: it.tags,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-8 text-2xl font-bold sm:text-3xl">찜 목록</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-muted-foreground">아직 찜한 아이템이 없어요.</p>
          <Button asChild>
            <Link href="/">큐레이션 시작하기</Link>
          </Button>
        </div>
      ) : (
        <ProductGrid products={productsForGrid} />
      )}
    </div>
  );
}

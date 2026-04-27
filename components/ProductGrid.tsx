"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { getWishlist } from "@/lib/wishlist-storage";
import type { Product } from "@/lib/types";

interface Props {
  products: Product[];
  compact?: boolean;
}

export function ProductGrid({ products, compact = false }: Props) {
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const ids = new Set(getWishlist().map((it) => it.id));
    setWishlistedIds(ids);
  }, []);

  function handleToggle(id: string, next: boolean) {
    setWishlistedIds((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(id);
      else copy.delete(id);
      return copy;
    });
  }

  const gridClassName = compact
    ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
    : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={gridClassName}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isWishlisted={wishlistedIds.has(product.id)}
          onWishlistToggle={(next) => handleToggle(product.id, next)}
          compact={compact}
        />
      ))}
    </div>
  );
}

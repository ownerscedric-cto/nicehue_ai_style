"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { getWishlist } from "@/lib/wishlist-storage";
import type { Product } from "@/lib/types";

interface Props {
  products: Product[];
}

export function ProductGrid({ products }: Props) {
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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isWishlisted={wishlistedIds.has(product.id)}
          onWishlistToggle={(next) => handleToggle(product.id, next)}
        />
      ))}
    </div>
  );
}

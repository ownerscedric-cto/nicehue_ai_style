"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { WishlistButton } from "@/components/WishlistButton";
import type { Product } from "@/lib/types";

interface Props {
  product: Product;
  isWishlisted: boolean;
  onWishlistToggle: (next: boolean) => void;
}

export function ProductCard({
  product,
  isWishlisted,
  onWishlistToggle,
}: Props) {
  function handleCardClick() {
    window.open(product.link, "_blank", "noopener,noreferrer");
  }

  return (
    <Card
      onClick={handleCardClick}
      className="group cursor-pointer overflow-hidden pt-0 transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square bg-muted">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute right-2 top-2">
          <WishlistButton
            product={product}
            isWishlisted={isWishlisted}
            onToggle={onWishlistToggle}
          />
        </div>
      </div>

      <CardContent className="space-y-2 pb-4">
        <p className="text-xs text-muted-foreground">
          {product.brand} · {product.mall}
        </p>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
          {product.title}
        </h3>
        <p className="text-base font-bold">
          {product.price.toLocaleString()}원
        </p>
        {product.reason && (
          <Badge variant="secondary" className="max-w-full truncate">
            {product.reason}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
import type { Product } from "@/lib/types";

interface Props {
  products: Product[];
}

export function FeaturedSection({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-pink-500" />
          니스휴 셀렉션
          <span className="text-xs font-normal text-muted-foreground">
            여성 패션 큐레이션
          </span>
        </h2>
        <a
          href="https://nicehue.co.kr/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          쇼핑몰 바로가기 →
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {products.map((product) => (
          <a
            key={product.id}
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group overflow-hidden rounded-lg border bg-background transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-square bg-muted">
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform group-hover:scale-105"
                unoptimized
              />
            </div>
            <div className="space-y-1 p-2.5">
              <h3 className="line-clamp-2 text-xs font-medium leading-snug">
                {product.title}
              </h3>
              <p className="text-sm font-bold">
                {product.price.toLocaleString()}원
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

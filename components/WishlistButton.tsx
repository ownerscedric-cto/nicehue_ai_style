"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session-context";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/lib/wishlist-storage";
import type { Product } from "@/lib/types";

interface Props {
  product: Product;
  isWishlisted: boolean;
  onToggle: (next: boolean) => void;
}

export function WishlistButton({ product, isWishlisted, onToggle }: Props) {
  const { user } = useSession();

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    if (isWishlisted) {
      removeFromWishlist(product.id);
      onToggle(false);
      toast.success("찜 목록에서 제거되었습니다.");
    } else {
      addToWishlist(product);
      onToggle(true);
      toast.success("찜 목록에 추가되었습니다.");
    }
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      onClick={handleClick}
      className="rounded-full bg-background/80 backdrop-blur hover:bg-background"
      aria-label={isWishlisted ? "찜 해제" : "찜하기"}
    >
      <Heart
        className={
          isWishlisted
            ? "fill-red-500 stroke-red-500"
            : "stroke-foreground"
        }
      />
    </Button>
  );
}

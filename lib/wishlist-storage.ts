import type { Product, WishlistItem } from "./types";

const STORAGE_KEY = "styleai_wishlist";

function readStorage(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WishlistItem[];
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function writeStorage(items: WishlistItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getWishlist(): WishlistItem[] {
  return readStorage();
}

export function addToWishlist(product: Product): WishlistItem[] {
  const items = readStorage();
  if (items.some((it) => it.id === product.id)) return items;
  const { reason: _reason, ...productWithoutReason } = product;
  void _reason;
  const next: WishlistItem[] = [
    { ...productWithoutReason, addedAt: new Date().toISOString() },
    ...items,
  ];
  writeStorage(next);
  return next;
}

export function removeFromWishlist(productId: string): WishlistItem[] {
  const next = readStorage().filter((it) => it.id !== productId);
  writeStorage(next);
  return next;
}

export function isWishlisted(productId: string): boolean {
  return readStorage().some((it) => it.id === productId);
}

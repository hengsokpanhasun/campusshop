// Cart = PURE logic (add/remove/total) + thin localStorage persistence.
// The pure functions are unit-tested in tests/cart.test.ts (Week 11). Reuses the same
// money idea as the API's pricing lib — one source of truth for "cents".
import type { CartLine, Product } from "./types";

const KEY = "campusshop_cart";

export function addLine(cart: CartLine[], product: Product, qty = 1): CartLine[] {
  const next = cart.map((l) => ({ ...l }));
  const found = next.find((l) => l.productId === product.id);
  if (found) found.qty += qty;
  else next.push({ productId: product.id, title: product.title, priceCents: product.priceCents, image: product.image, qty });
  return next.filter((l) => l.qty > 0);
}

export function setQty(cart: CartLine[], productId: number, qty: number): CartLine[] {
  return cart.map((l) => (l.productId === productId ? { ...l, qty } : l)).filter((l) => l.qty > 0);
}

export function removeLine(cart: CartLine[], productId: number): CartLine[] {
  return cart.filter((l) => l.productId !== productId);
}

export function cartCount(cart: CartLine[]): number {
  return cart.reduce((n, l) => n + Math.max(0, l.qty), 0);
}

export function cartTotalCents(cart: CartLine[]): number {
  return cart.reduce((s, l) => s + Math.max(0, l.qty) * Math.max(0, l.priceCents), 0);
}

export const formatPrice = (cents: number) => (cents <= 0 ? "Free" : "$" + (cents / 100).toFixed(2));

// ---- persistence (browser only) ----
export function loadCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
export function saveCart(cart: CartLine[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(cart));
}

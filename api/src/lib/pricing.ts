// Pure money/cart logic — NO database, NO Express. Data in, data out.
// Kept pure on purpose so it is trivial to unit-test (Week 11) and reuse on the web.

export type LineInput = { priceCents: number; qty: number };

/** Sum a cart's line items into a total in cents. Ignores non-positive quantities. */
export function cartTotalCents(lines: LineInput[]): number {
  return lines.reduce((sum, l) => {
    const qty = Number.isFinite(l.qty) ? Math.max(0, Math.trunc(l.qty)) : 0;
    const price = Number.isFinite(l.priceCents) ? Math.max(0, Math.trunc(l.priceCents)) : 0;
    return sum + qty * price;
  }, 0);
}

/** Format integer cents as a human price, e.g. 1850 -> "$18.50", 0 -> "Free". */
export function formatPrice(cents: number): string {
  if (!Number.isFinite(cents) || cents <= 0) return "Free";
  return "$" + (cents / 100).toFixed(2);
}

/** Can we fulfil `qty` of a product with `stock` left? */
export function canFulfil(stock: number, qty: number): boolean {
  return Number.isInteger(qty) && qty > 0 && Number.isInteger(stock) && stock >= qty;
}

// Unit tests for the pure cart logic (Week 11). No React, no browser.
import { describe, it, expect } from "vitest";
import { addLine, setQty, removeLine, cartCount, cartTotalCents, formatPrice } from "../src/lib/cart";
import type { Product } from "../src/lib/types";

const p = (id: number, priceCents: number): Product => ({
  id, title: `P${id}`, description: "", priceCents, stock: 10, image: "",
  category: { id: 1, name: "X", slug: "x" }, shop: { id: 1, name: "S" },
});

describe("cart", () => {
  it("adds a new line and merges quantities", () => {
    let c = addLine([], p(1, 1000), 1);
    expect(cartCount(c)).toBe(1);
    c = addLine(c, p(1, 1000), 2);
    expect(cartCount(c)).toBe(3);
    expect(c).toHaveLength(1);
  });

  it("sets quantity and removes at zero", () => {
    let c = addLine([], p(1, 500), 3);
    c = setQty(c, 1, 1);
    expect(cartCount(c)).toBe(1);
    c = setQty(c, 1, 0);
    expect(c).toHaveLength(0);
  });

  it("removes a line", () => {
    let c = addLine(addLine([], p(1, 500)), p(2, 700));
    c = removeLine(c, 1);
    expect(c.map((l) => l.productId)).toEqual([2]);
  });

  it("totals and formats money", () => {
    const c = addLine(addLine([], p(1, 1000), 2), p(2, 250), 3);
    expect(cartTotalCents(c)).toBe(2750);
    expect(formatPrice(2750)).toBe("$27.50");
    expect(formatPrice(0)).toBe("Free");
  });
});

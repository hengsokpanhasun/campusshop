// Unit tests on the PURE logic — no DB, no server. Fast and reliable (Week 11, test pyramid base).
import { describe, it, expect } from "vitest";
import { cartTotalCents, formatPrice, canFulfil } from "../src/lib/pricing.js";

describe("cartTotalCents", () => {
  it("sums price * qty across lines", () => {
    expect(cartTotalCents([{ priceCents: 1000, qty: 2 }, { priceCents: 250, qty: 3 }])).toBe(2750);
  });
  it("ignores negative or non-integer quantities", () => {
    expect(cartTotalCents([{ priceCents: 1000, qty: -1 }, { priceCents: 1000, qty: 2.9 }])).toBe(2000);
  });
  it("is 0 for an empty cart", () => {
    expect(cartTotalCents([])).toBe(0);
  });
});

describe("formatPrice", () => {
  it("formats cents as dollars", () => {
    expect(formatPrice(1850)).toBe("$18.50");
    expect(formatPrice(999)).toBe("$9.99");
  });
  it("shows Free for zero or less", () => {
    expect(formatPrice(0)).toBe("Free");
  });
});

describe("canFulfil", () => {
  it("allows when stock covers the qty", () => {
    expect(canFulfil(5, 3)).toBe(true);
    expect(canFulfil(3, 3)).toBe(true);
  });
  it("rejects when stock is short or qty is invalid", () => {
    expect(canFulfil(2, 3)).toBe(false);
    expect(canFulfil(5, 0)).toBe(false);
    expect(canFulfil(5, -1)).toBe(false);
  });
});

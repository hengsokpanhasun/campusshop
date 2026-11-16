"use client";
import { useState } from "react";
import { addLine, loadCart, saveCart } from "../../../lib/cart";
import type { Product } from "../../../lib/types";

// Client component: add this product to the localStorage cart (Week 5 state + Week 3/4 DOM/storage).
export function AddToCart({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function add() {
    const next = addLine(loadCart(), product, qty);
    saveCart(next);
    window.dispatchEvent(new Event("cart:changed")); // update the nav badge
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="row" style={{ marginTop: 18, justifyContent: "flex-start" }}>
      <label htmlFor="qty" className="sr-only">Quantity</label>
      <input
        id="qty" className="qty" type="number" min={1} max={product.stock || 1}
        value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} disabled={soldOut}
      />
      <button className="btn btn-primary" onClick={add} disabled={soldOut}>
        {soldOut ? "Sold out" : added ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}

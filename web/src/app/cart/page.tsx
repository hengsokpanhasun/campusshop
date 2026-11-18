"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cartTotalCents, formatPrice, loadCart, removeLine, saveCart, setQty } from "../../lib/cart";
import { createOrder } from "../../lib/api";
import type { CartLine } from "../../lib/types";
import { KhqrPay } from "./KhqrPay";

// Cart + checkout (client). Checkout POSTs to the API, which validates stock + price server-side.
export default function CartPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [placing, setPlacing] = useState(false);
  const [payOrderId, setPayOrderId] = useState<number | null>(null);

  useEffect(() => setCart(loadCart()), []);

  function update(next: CartLine[]) {
    setCart(next);
    saveCart(next);
    window.dispatchEvent(new Event("cart:changed"));
  }

  async function checkout() {
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg({ type: "err", text: "Please log in to check out." });
      return;
    }
    setPlacing(true);
    setMsg(null);
    try {
      const order = await createOrder(cart.map((l) => ({ productId: l.productId, qty: l.qty })));
      setPayOrderId(order.id); // show the KHQR payment panel; clear the cart once paid
    } catch (e: unknown) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Checkout failed." });
    } finally {
      setPlacing(false);
    }
  }

  const total = cartTotalCents(cart);

  // after checkout: show the KHQR payment panel
  if (payOrderId !== null) {
    return (
      <>
        <h1>Pay for your order</h1>
        <KhqrPay orderId={payOrderId} onPaid={() => update([])} />
        <p className="muted" style={{ textAlign: "center", marginTop: 16 }}>
          <Link href="/orders">View my orders</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1>Your cart</h1>
      {msg && <div className={`notice ${msg.type}`}>{msg.text}</div>}
      {cart.length === 0 ? (
        <div className="notice">Your cart is empty. <Link href="/">Browse products</Link>.</div>
      ) : (
        <div className="panel">
          {cart.map((l) => (
            <div className="cart-line" key={l.productId}>
              <div className="cart-thumb" style={{ backgroundImage: `url('${l.image}')` }} role="img" aria-label={l.title} />
              <div style={{ flex: 1 }}>
                <strong>{l.title}</strong>
                <div className="muted">{formatPrice(l.priceCents)} each</div>
              </div>
              <label htmlFor={`q-${l.productId}`} className="sr-only">Quantity for {l.title}</label>
              <input
                id={`q-${l.productId}`} className="qty" type="number" min={1} value={l.qty}
                onChange={(e) => update(setQty(cart, l.productId, Math.max(1, Number(e.target.value) || 1)))}
              />
              <strong>{formatPrice(l.priceCents * l.qty)}</strong>
              <button className="btn btn-ghost" onClick={() => update(removeLine(cart, l.productId))} aria-label={`Remove ${l.title}`}>✕</button>
            </div>
          ))}
          <div className="row" style={{ marginTop: 18 }}>
            <strong style={{ fontSize: 20 }}>Total: {formatPrice(total)}</strong>
            <button className="btn btn-primary" onClick={checkout} disabled={placing}>
              {placing ? "Placing…" : "Check out"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

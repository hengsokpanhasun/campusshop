"use client";
import { useEffect, useRef, useState } from "react";
import { orderKhqr, orderKhqrCheck, orderKhqrSimulate } from "../../lib/api";

// Shows a KHQR for the order and polls until it's paid. "Simulate payment" is the classroom
// sandbox (no real money). On real use, the shopper scans the QR in their bank app.
export function KhqrPay({ orderId, onPaid }: { orderId: number; onPaid: () => void }) {
  const [qr, setQr] = useState<{ image: string; md5: string; amount: string } | null>(null);
  const [err, setErr] = useState("");
  const [paid, setPaid] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // make the QR once
  useEffect(() => {
    let active = true;
    orderKhqr(orderId)
      .then((r) => active && setQr(r))
      .catch((e) => active && setErr(e instanceof Error ? e.message : "Could not create the QR"));
    return () => { active = false; };
  }, [orderId]);

  // poll for payment every 3s
  useEffect(() => {
    if (!qr || paid) return;
    timer.current = setInterval(async () => {
      try {
        const r = await orderKhqrCheck(orderId, qr.md5);
        if (r.paid) { setPaid(true); onPaid(); }
      } catch { /* keep polling */ }
    }, 3000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [qr, paid, orderId, onPaid]);

  async function simulate() {
    if (!qr) return;
    await orderKhqrSimulate(orderId, qr.md5);
    const r = await orderKhqrCheck(orderId, qr.md5);
    if (r.paid) { setPaid(true); onPaid(); }
  }

  if (err) return <div className="notice err">{err}</div>;
  if (paid) return <div className="notice ok">Payment received — your order is confirmed. Thank you! ✓</div>;
  if (!qr) return <div className="notice">Creating your KHQR…</div>;

  return (
    <div className="panel" style={{ textAlign: "center", maxWidth: 420, margin: "0 auto" }}>
      <h2>Scan to pay{qr.amount ? ` $${qr.amount}` : ""}</h2>
      <p className="muted">Open any Cambodian bank app (ABA, ACLEDA, Wing…) and scan this KHQR.</p>
      {qr.image && <img src={qr.image} alt="KHQR payment code" style={{ width: 240, height: 240 }} />}
      <p className="muted">Waiting for payment… (checks automatically)</p>
      <button className="btn btn-ghost" onClick={simulate}>Simulate payment (classroom sandbox)</button>
    </div>
  );
}

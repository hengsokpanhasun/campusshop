"use client";
import { useEffect, useState } from "react";
import { createProduct, getCategories } from "../../lib/api";
import type { Category, User } from "../../lib/types";

// Merchant dashboard — add a product (protected: needs a MERCHANT login). The API enforces the
// real authorization; this page just gates the UI. (Week 8 + Week 12)
export default function Dashboard() {
  const [me, setMe] = useState<User | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [image, setImage] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    try {
      setMe(JSON.parse(localStorage.getItem("user") || "null"));
    } catch {
      setMe(null);
    }
    getCategories().then(setCats).catch(() => setCats([]));
  }, []);

  if (!me) return <div className="notice err">Please <a href="/login">log in</a> as a merchant.</div>;
  if (me.role !== "MERCHANT") return <div className="notice err">This page is for merchant accounts only.</div>;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await createProduct({
        title,
        priceCents: Math.round(Number(price) * 100),
        stock: Number(stock),
        categoryId: Number(categoryId),
        image: image || undefined,
      });
      setMsg({ type: "ok", text: `Added "${title}".` });
      setTitle(""); setPrice(""); setStock("1"); setImage("");
    } catch (e: unknown) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Could not add product." });
    }
  }

  return (
    <div className="panel" style={{ maxWidth: 520, margin: "0 auto" }}>
      <h1>Add a product</h1>
      <p className="muted">Merchant: {me.name}</p>
      {msg && <div className={`notice ${msg.type}`}>{msg.text}</div>}
      <form onSubmit={add}>
        <label htmlFor="t">Title</label>
        <input id="t" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label htmlFor="p">Price (USD)</label>
        <input id="p" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <label htmlFor="s">Stock</label>
        <input id="s" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} required />
        <label htmlFor="c">Category</label>
        <select id="c" value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} required>
          <option value="">Choose…</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label htmlFor="im">Image URL (optional)</label>
        <input id="im" type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" />
        <button className="btn btn-primary" style={{ marginTop: 18 }} type="submit">Add product</button>
      </form>
    </div>
  );
}

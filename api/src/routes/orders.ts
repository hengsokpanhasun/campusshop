// Checkout + order history. Creating an order validates stock, snapshots prices, decrements
// stock, and writes Order + OrderItems in ONE transaction. (Week 7, 9, 10, 12)
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { canFulfil, cartTotalCents } from "../lib/pricing.js";
import { khqrGenerate, khqrSimulate, khqrCheck } from "../lib/khqr.js";
import type { Request, Response } from "express";

export const ordersRouter = Router();

const checkoutSchema = z.object({
  items: z.array(z.object({ productId: z.number().int(), qty: z.number().int().min(1) })).min(1),
});

// POST /api/orders  — place an order from the cart (logged-in customer)
ordersRouter.post("/", requireAuth, async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid cart" });
  const { items } = parsed.data;

  // load the real products from the DB — never trust prices from the client
  const ids = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: ids } } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: { productId: number; qty: number; priceCents: number }[] = [];
  for (const item of items) {
    const p = byId.get(item.productId);
    if (!p) return res.status(400).json({ error: `Product ${item.productId} not found` });
    if (!canFulfil(p.stock, item.qty)) return res.status(409).json({ error: `Not enough stock for "${p.title}"` });
    lines.push({ productId: p.id, qty: item.qty, priceCents: p.priceCents });
  }
  const totalCents = cartTotalCents(lines);

  // one transaction: create order + items, decrement stock
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        customerId: req.user!.id,
        totalCents,
        status: "PENDING", // -> "PAID" after KHQR confirmation (stretch)
        items: { create: lines },
      },
      include: { items: true },
    });
    for (const l of lines) {
      await tx.product.update({ where: { id: l.productId }, data: { stock: { decrement: l.qty } } });
    }
    return created;
  });

  res.status(201).json(order);
});

// GET /api/orders  — the logged-in customer's own orders
ordersRouter.get("/", requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { customerId: req.user!.id },
    include: { items: { include: { product: { select: { title: true, image: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

// ---------- KHQR payment (Week 8 ownership + the capstone payment stretch) ----------
// The key stays server-side (Week 12): the browser calls OUR API, which calls the KHQR API.
async function ownOrder(req: Request, res: Response) {
  const order = await prisma.order.findUnique({ where: { id: Number(req.params.id) } });
  if (!order) { res.status(404).json({ error: "Order not found" }); return null; }
  if (order.customerId !== req.user!.id) { res.status(403).json({ error: "Not your order" }); return null; }
  return order;
}

// POST /api/orders/:id/khqr  — make a KHQR for this order's total
ordersRouter.post("/:id/khqr", requireAuth, async (req, res) => {
  const order = await ownOrder(req, res); if (!order) return;
  const r = await khqrGenerate(order.totalCents / 100, `Order #${order.id}`);
  if (!r?.ok) return res.status(502).json({ error: r?.error || "KHQR generation failed" });
  res.json({ qr: r.qr, md5: r.md5, image: r.image, amount: r.amount });
});

// POST /api/orders/:id/khqr/simulate  — sandbox: pretend the QR was paid (classroom)
ordersRouter.post("/:id/khqr/simulate", requireAuth, async (req, res) => {
  const order = await ownOrder(req, res); if (!order) return;
  const md5 = String(req.body?.md5 || "").trim();
  const r = await khqrSimulate(md5);
  res.json({ ok: !!r?.ok });
});

// GET /api/orders/:id/khqr/check?md5=  — poll; on paid, mark the order PAID
ordersRouter.get("/:id/khqr/check", requireAuth, async (req, res) => {
  const order = await ownOrder(req, res); if (!order) return;
  const md5 = String(req.query.md5 || "");
  const r = await khqrCheck(md5);
  if (r?.paid && order.status !== "PAID") {
    await prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } });
  }
  res.json({ paid: !!r?.paid, mode: r?.mode, status: r?.paid ? "PAID" : order.status });
});

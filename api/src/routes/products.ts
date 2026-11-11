// Products: public browse (search/filter/paginate) + merchant-only create/update/delete,
// with OWNERSHIP checks (a merchant may only touch products in their own shop). (Week 7, 8, 12)
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const productsRouter = Router();

// GET /api/products?q=&category=&page=&limit=
productsRouter.get("/", async (req, res) => {
  const q = String(req.query.q || "").trim();
  const categorySlug = String(req.query.category || "").trim();
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));

  const where: any = {};
  if (q) where.title = { contains: q, mode: "insensitive" };
  if (categorySlug && categorySlug !== "all") where.category = { slug: categorySlug };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, shop: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

// GET /api/products/:id
productsRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, shop: { select: { id: true, name: true } } },
  });
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

const productSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional().default(""),
  priceCents: z.number().int().min(0),
  stock: z.number().int().min(0).default(0),
  image: z.string().url().max(500).optional().or(z.literal("")).default(""),
  categoryId: z.number().int(),
});

// helper: find the logged-in merchant's shop
async function shopOf(userId: number) {
  return prisma.shop.findFirst({ where: { ownerId: userId } });
}

// POST /api/products  (merchant only)
productsRouter.post("/", requireAuth, requireRole("MERCHANT"), async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  const shop = await shopOf(req.user!.id);
  if (!shop) return res.status(400).json({ error: "You have no shop" });
  const product = await prisma.product.create({ data: { ...parsed.data, shopId: shop.id } });
  res.status(201).json(product);
});

// PUT /api/products/:id  (owner only)
productsRouter.put("/:id", requireAuth, requireRole("MERCHANT"), async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.product.findUnique({ where: { id }, include: { shop: true } });
  if (!existing) return res.status(404).json({ error: "Product not found" });
  if (existing.shop.ownerId !== req.user!.id) return res.status(403).json({ error: "Not your product" });

  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const product = await prisma.product.update({ where: { id }, data: parsed.data });
  res.json(product);
});

// DELETE /api/products/:id  (owner only)
productsRouter.delete("/:id", requireAuth, requireRole("MERCHANT"), async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.product.findUnique({ where: { id }, include: { shop: true } });
  if (!existing) return res.status(404).json({ error: "Product not found" });
  if (existing.shop.ownerId !== req.user!.id) return res.status(403).json({ error: "Not your product" });
  await prisma.product.delete({ where: { id } });
  res.status(204).end();
});

// Seed the database with categories, a demo merchant + shop, products, and a demo customer.
// Run: npm run prisma:seed   (Week 9/10)
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // categories
  const catData = [
    { name: "Electronics", slug: "electronics" },
    { name: "Books", slug: "books" },
    { name: "Fashion", slug: "fashion" },
    { name: "Home", slug: "home" },
  ];
  for (const c of catData) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  const cats = await prisma.category.findMany();
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  // a merchant + their shop
  const merchant = await prisma.user.upsert({
    where: { email: "merchant@demo.com" },
    update: {},
    create: {
      name: "Demo Merchant",
      email: "merchant@demo.com",
      passwordHash: await bcrypt.hash("password", 10),
      role: "MERCHANT",
    },
  });
  let shop = await prisma.shop.findFirst({ where: { ownerId: merchant.id } });
  if (!shop) shop = await prisma.shop.create({ data: { name: "Demo Shop", ownerId: merchant.id } });

  // a customer
  await prisma.user.upsert({
    where: { email: "customer@demo.com" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "customer@demo.com",
      passwordHash: await bcrypt.hash("password", 10),
      role: "CUSTOMER",
    },
  });

  // products
  const products = [
    { title: "Wireless Earbuds", priceCents: 2499, stock: 20, category: "electronics", seed: "earbuds" },
    { title: "Mechanical Keyboard", priceCents: 4999, stock: 12, category: "electronics", seed: "keyboard" },
    { title: "Intro to Programming (Book)", priceCents: 1500, stock: 30, category: "books", seed: "book" },
    { title: "Cotton T-Shirt", priceCents: 999, stock: 50, category: "fashion", seed: "tshirt" },
    { title: "Desk Lamp", priceCents: 1799, stock: 25, category: "home", seed: "lamp" },
    { title: "Water Bottle", priceCents: 799, stock: 40, category: "home", seed: "bottle" },
  ];
  // only seed products if the shop has none yet (idempotent-ish)
  const existing = await prisma.product.count({ where: { shopId: shop.id } });
  if (existing === 0) {
    for (const p of products) {
      await prisma.product.create({
        data: {
          title: p.title,
          description: `A great ${p.title.toLowerCase()} for your campus life.`,
          priceCents: p.priceCents,
          stock: p.stock,
          image: `https://picsum.photos/seed/campusshop-${p.seed}/600/400`,
          shopId: shop.id,
          categoryId: catBySlug[p.category],
        },
      });
    }
  }
  console.log("Seed complete. Logins: merchant@demo.com / customer@demo.com (password: password)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

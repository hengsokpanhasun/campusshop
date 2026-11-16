// Shared TypeScript types for the storefront (Week 5).
export type Category = { id: number; name: string; slug: string };

export type Product = {
  id: number;
  title: string;
  description: string;
  priceCents: number;
  stock: number;
  image: string;
  category: Category;
  shop: { id: number; name: string };
};

export type ProductList = { items: Product[]; total: number; page: number; pages: number };

export type User = { id: number; name: string; email: string; role: "CUSTOMER" | "MERCHANT" };

export type CartLine = { productId: number; title: string; priceCents: number; image: string; qty: number };

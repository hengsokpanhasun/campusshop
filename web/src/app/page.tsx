import { Suspense } from "react";
import { getCategories, getProducts } from "../lib/api";
import { ProductCard } from "../components/ProductCard";
import { Filters } from "../components/Filters";

// Home / storefront. SERVER component: it fetches on the server (Week 6 data fetching),
// using the URL query for search + category + page.
export default async function Home({ searchParams }: { searchParams: { q?: string; category?: string; page?: string } }) {
  const q = searchParams.q || "";
  const category = searchParams.category || "all";
  const page = Number(searchParams.page) || 1;

  let products, categories;
  try {
    [products, categories] = await Promise.all([getProducts(q, category, page), getCategories()]);
  } catch {
    return (
      <div className="notice err">
        Could not reach the API. Start it with <code>npm run dev</code> in <code>/api</code>, then refresh.
      </div>
    );
  }

  return (
    <>
      <h1>Shop the campus store</h1>
      <p className="muted">Browse products, add to your cart, and check out.</p>

      <Suspense fallback={<div className="toolbar" />}>
        <Filters categories={categories} />
      </Suspense>

      <p className="muted">{products.total} product{products.total === 1 ? "" : "s"}</p>

      {products.items.length === 0 ? (
        <div className="notice">No products match your filters.</div>
      ) : (
        <section className="grid" aria-label="Products">
          {products.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </section>
      )}
    </>
  );
}

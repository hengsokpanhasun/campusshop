import Link from "next/link";
import type { Product } from "../lib/types";
import { formatPrice } from "../lib/cart";

// A single product card. Pure presentational component (Week 5). Uses textContent-safe
// JSX (React escapes by default — Week 12 XSS safety comes for free here).
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="card" aria-label={product.title}>
      <div className="card-img" style={{ backgroundImage: `url('${product.image}')` }} role="img" aria-label={product.title} />
      <div className="card-body">
        <span className="tag">{product.category.name}</span>
        <h3>{product.title}</h3>
        <p className="price">{formatPrice(product.priceCents)}</p>
        <p className="muted">{product.stock > 0 ? `${product.stock} in stock` : "Sold out"}</p>
      </div>
    </Link>
  );
}

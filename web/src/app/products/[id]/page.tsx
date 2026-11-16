import Link from "next/link";
import { getProduct } from "../../../lib/api";
import { formatPrice } from "../../../lib/cart";
import { AddToCart } from "./AddToCart";

// Product detail — SERVER component, dynamic route /products/[id] (Week 6). Handles not-found.
export default async function ProductDetail({ params }: { params: { id: string } }) {
  let product;
  try {
    product = await getProduct(params.id);
  } catch {
    return (
      <div className="notice err">
        Product not found. <Link href="/">Back to the shop</Link>
      </div>
    );
  }

  return (
    <article className="detail">
      <div className="detail-img" style={{ backgroundImage: `url('${product.image}')` }} role="img" aria-label={product.title} />
      <div>
        <Link href="/" className="muted">&larr; Back to all products</Link>
        <span className="tag" style={{ display: "inline-block", marginTop: 10 }}>{product.category.name}</span>
        <h1 style={{ marginTop: 6 }}>{product.title}</h1>
        <p className="price" style={{ fontSize: 26 }}>{formatPrice(product.priceCents)}</p>
        <p>{product.description}</p>
        <p className="muted">Sold by {product.shop.name} · {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}</p>
        <AddToCart product={product} />
      </div>
    </article>
  );
}

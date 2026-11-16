// One small client for talking to the CampusShop API (Week 4 fetch/async + Week 6 data fetching).
import type { Category, Product, ProductList, User } from "./types";

// Server components (SSR) reach the API over the internal network (API_URL, e.g. http://api:4000 in Docker);
// the browser reaches it over the published port (NEXT_PUBLIC_API_URL, e.g. http://localhost:4000).
const API =
  (typeof window === "undefined"
    ? process.env.API_URL || process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL) || "http://localhost:4000";

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

// ---- public reads (used by server components) ----
export const getProducts = (q = "", category = "all", page = 1) =>
  req<ProductList>(`/api/products?q=${encodeURIComponent(q)}&category=${category}&page=${page}`);
export const getProduct = (id: string | number) => req<Product>(`/api/products/${id}`);
export const getCategories = () => req<Category[]>(`/api/categories`);

// ---- auth (browser) ----
export const login = (email: string, password: string) =>
  req<{ token: string; user: User }>(`/api/auth/login`, { method: "POST", body: JSON.stringify({ email, password }) });
export const register = (name: string, email: string, password: string, role: "CUSTOMER" | "MERCHANT") =>
  req<{ token: string; user: User }>(`/api/auth/register`, { method: "POST", body: JSON.stringify({ name, email, password, role }) });

// ---- authed actions (browser) — token from localStorage ----
function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
export const createOrder = (items: { productId: number; qty: number }[]) =>
  req<{ id: number; totalCents: number; status: string }>(`/api/orders`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ items }) });

// ---- KHQR payment for an order (server proxies the KHQR API) ----
export const orderKhqr = (id: number) =>
  req<{ qr: string; md5: string; image: string; amount: string }>(`/api/orders/${id}/khqr`, { method: "POST", headers: authHeaders() });
export const orderKhqrSimulate = (id: number, md5: string) =>
  req<{ ok: boolean }>(`/api/orders/${id}/khqr/simulate`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ md5 }) });
export const orderKhqrCheck = (id: number, md5: string) =>
  req<{ paid: boolean; mode: string; status: string }>(`/api/orders/${id}/khqr/check?md5=${md5}`, { headers: authHeaders() });
export const createProduct = (p: { title: string; priceCents: number; stock: number; categoryId: number; description?: string; image?: string }) =>
  req<Product>(`/api/products`, { method: "POST", headers: authHeaders(), body: JSON.stringify(p) });

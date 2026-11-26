# CampusShop — Full-Stack E-Commerce Store

A working **e-commerce store** (Shopify-lite): merchants list products, customers browse,
add to cart, and check out — with real relational data, authentication, role/ownership rules,
automated tests, containers, and CI. **TypeScript end to end.**

> Two roles (customer / merchant) · PostgreSQL + Prisma · JWT auth + ownership · transactional
> checkout · KHQR payment · unit + integration tests · Docker Compose · GitHub Actions CI.

**Stack:** TypeScript · Node + Express · Prisma · PostgreSQL · Next.js (App Router) · React ·
Docker · GitHub Actions

---

## What's here

```
e-commerce/
├── api/                  Node + Express + TypeScript REST API (run with tsx, no build step)
│   ├── prisma/           schema.prisma (data model) + seed.ts
│   ├── src/
│   │   ├── routes/       auth · products · categories · orders
│   │   ├── middleware/   auth.ts (JWT + role/ownership)
│   │   ├── lib/          pricing.ts (PURE, tested) · khqr.ts (payment client)
│   │   └── server.ts     Express app (helmet, cors, /health)
│   └── tests/            pricing.test.ts (unit) · api.test.ts (integration)
├── web/                  Next.js + React + TypeScript storefront
│   ├── src/app/          pages: / · /products/[id] · /cart · /login · /dashboard
│   ├── src/components/   Nav · ProductCard · Filters
│   └── src/lib/          api.ts · cart.ts (PURE, tested) · types.ts
├── db/reports.sql        raw SQL analytics (JOINs) — SQL, not just the ORM
├── docker-compose.yml    run web + api + postgres with one command
├── .github/workflows/ci.yml   CI: typecheck + test + build on every push
└── .env.example
```

---

## Engineering highlights

| Area | What it does |
|------|--------------|
| **API** | Express + TypeScript REST API with status codes and `zod` validation |
| **Auth** | JWT + bcrypt, customer/merchant **roles**, and per-resource **ownership** checks |
| **Data** | PostgreSQL with Prisma; relational schema; a **transactional checkout** (order + stock, all-or-nothing) |
| **SQL** | hand-written analytics queries with JOINs in `db/reports.sql` (not only the ORM) |
| **Frontend** | Next.js App Router — server components, dynamic routes, URL-driven filters, a merchant dashboard |
| **Payments** | real, scannable **KHQR** checkout; the API key stays server-side; polls until paid, then marks the order `PAID` |
| **Security** | `helmet`, input validation, ownership checks, secrets in `.env`, React auto-escaping |
| **Quality** | unit tests (pricing, cart) + integration tests against a real Postgres |
| **Ops** | `Dockerfile`s + `docker-compose.yml`, 12-factor config, and GitHub Actions CI (typecheck + test + build) |

---

## Run it

### Option A — everything with Docker (one command)
```bash
docker compose up --build
# open http://localhost:3000   (API on :4000, Postgres on :5432, demo data seeded)
```

### Option B — run each app yourself (for development)
**1. Database** (local Postgres or Docker):
```bash
docker run --name campusshop-db -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=campusshop -p 5432:5432 -d postgres:16-alpine
```
**2. API**:
```bash
cd api
cp ../.env.example .env        # then edit DATABASE_URL / JWT_SECRET
npm install
npx prisma migrate dev --name init   # create the schema
npm run prisma:seed                  # demo products + users
npm run dev                          # API on http://localhost:4000
```
**3. Web**:
```bash
cd web
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
npm install
npm run dev                          # store on http://localhost:3000
```

**Demo logins** (password `password`): `merchant@demo.com` (can add products), `customer@demo.com` (can buy).

### Test
```bash
cd api && npm test     # pricing unit tests (+ API integration tests against a test DB)
cd web && npm test     # cart unit tests
```

---

## The flow (try it)
1. Register as a **merchant** → go to **Dashboard** → add a product.
2. Register / log in as a **customer** → browse, open a product, **Add to cart**.
3. Open **Cart** → **Check out** → a **KHQR** appears → scan it in a bank app, or click
   **Simulate payment** (sandbox). The order flips **PENDING → PAID** automatically.

## KHQR payment
Checkout shows a real, scannable **KHQR**. The browser never sees the payment key — the CampusShop API
calls the KHQR service server-side (`api/src/lib/khqr.ts`), then polls until the QR is paid and marks
the order `PAID` (`api/src/routes/orders.ts`). To enable it, copy `.env.example` → `.env` and set
`KHQR_API_KEY`. Without a key the panel still renders but generation returns `401`. "Simulate payment"
is a no-money sandbox for local testing.

## Deploy
- **Web** → Vercel (set `NEXT_PUBLIC_API_URL` to your API URL).
- **API + Postgres** → Railway / Render / Fly (set `DATABASE_URL`, `JWT_SECRET`, `WEB_ORIGIN`).
- Keep secrets in the host's env vars, never in the repo.

## License
MIT

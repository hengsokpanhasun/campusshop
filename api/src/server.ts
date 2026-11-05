// The Express app. Security middleware (helmet), CORS for the web app, JSON parsing,
// all routes, a /health check (Week 14), and a safe JSON error handler. (Week 7, 12, 14)
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { ENV } from "./env.js";
import { authRouter } from "./routes/auth.js";
import { productsRouter } from "./routes/products.js";
import { categoriesRouter } from "./routes/categories.js";
import { ordersRouter } from "./routes/orders.js";

export const app = express();

app.use(helmet()); // sensible security headers
app.use(cors({ origin: ENV.WEB_ORIGIN }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/orders", ordersRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// never leak stack traces to clients
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[error]", err);
  res.status(500).json({ error: "Internal server error" });
});

// Only start listening when run directly (so tests can import `app` without a live port).
const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`;
if (isMain) {
  app.listen(ENV.PORT, () => console.log(`CampusShop API on http://localhost:${ENV.PORT}`));
}

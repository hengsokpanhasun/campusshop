// Config comes from the ENVIRONMENT, never hard-coded (Week 12 security + Week 13 twelve-factor).
import "dotenv/config";

export const ENV = {
  PORT: Number(process.env.PORT || 4000),
  JWT_SECRET: process.env.JWT_SECRET || "dev-only-change-me",
  DATABASE_URL: process.env.DATABASE_URL || "",
  WEB_ORIGIN: process.env.WEB_ORIGIN || "http://localhost:3000",
};

if (ENV.JWT_SECRET === "dev-only-change-me") {
  console.warn("[warn] JWT_SECRET is the default — set a real one in .env before production.");
}

// Integration tests on the API with Supertest (Week 11, middle of the test pyramid).
// These hit the real Express app + a real database, so run them against a TEST database:
//   DATABASE_URL=postgresql://.../campusshop_test npm test
import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/server.js";

describe("public endpoints", () => {
  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("GET /api/products returns a paged list", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(typeof res.body.total).toBe("number");
  });

  it("GET a missing product returns 404", async () => {
    const res = await request(app).get("/api/products/99999999");
    expect(res.status).toBe(404);
  });
});

describe("auth + authorization", () => {
  it("rejects registration with a bad body (400)", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "nope" });
    expect(res.status).toBe(400);
  });

  it("blocks creating a product without a token (401)", async () => {
    const res = await request(app).post("/api/products").send({ title: "x", priceCents: 100, categoryId: 1 });
    expect(res.status).toBe(401);
  });

  it("registers + logs in a customer and reads /me", async () => {
    const email = `t${Date.now()}@demo.com`;
    const reg = await request(app).post("/api/auth/register").send({ name: "T", email, password: "password" });
    expect(reg.status).toBe(201);
    const token = reg.body.token as string;
    expect(token).toBeTruthy();

    const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(email);

    // a CUSTOMER must not be able to create products (403)
    const create = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "x", priceCents: 100, categoryId: 1 });
    expect(create.status).toBe(403);
  });
});

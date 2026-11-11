import { Router } from "express";
import { prisma } from "../db.js";

export const categoriesRouter = Router();

// GET /api/categories  — public, for the filter bar
categoriesRouter.get("/", async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json(categories);
});

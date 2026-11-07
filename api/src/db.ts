// One shared Prisma client for the whole API (Week 10).
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// Authentication + authorization (Week 8 + Week 12).
// - requireAuth: verifies the JWT in the Authorization header, attaches req.user.
// - requireRole: blocks anyone who isn't the right role (e.g. MERCHANT-only routes).
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../env.js";

export type AuthUser = { id: number; role: "CUSTOMER" | "MERCHANT" };

// augment Express' Request so TypeScript knows about req.user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ sub: user.id, role: user.role }, ENV.JWT_SECRET, { expiresIn: "7d" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as unknown as { sub: number; role: AuthUser["role"] };
    req.user = { id: Number(payload.sub), role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(role: AuthUser["role"]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (req.user.role !== role) return res.status(403).json({ error: "Forbidden — " + role + " only" });
    next();
  };
}

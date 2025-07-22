// server/routes/tokens.ts
import { Router } from "express";
import { db } from "../db"; // adjust if db.ts is in a different path
import { eq } from "drizzle-orm";
import { tokens } from "@shared/schema"; // assumes tokens table is here

const router = Router();

// Middleware to check if logged in
function requireAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  next();
}

// Get all tokens for the current user
router.get("/", requireAuth, async (req: any, res) => {
  const result = await db.select().from(tokens).where(eq(tokens.userId, req.user.id));
  res.json(result);
});

// Create a new token
router.post("/", requireAuth, async (req: any, res) => {
  const { service, tokenName, tokenValue, configuration } = req.body;
  if (!service || !tokenName || !tokenValue) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const inserted = await db.insert(tokens).values({
    userId: req.user.id,
    service,
    tokenName,
    tokenValue,
    configuration,
  }).returning();

  res.status(201).json(inserted[0]);
});

// Delete a token
router.delete("/:id", requireAuth, async (req: any, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

  await db.delete(tokens).where(eq(tokens.id, id));
  res.status(200).json({ message: "Token deleted" });
});

export default router;

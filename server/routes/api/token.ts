// server/routes/api/tokens.ts
import { Router } from "express";
import { db } from "../../db";
import { tokens } from "@shared/schema/tokens";
import { eq } from "drizzle-orm";

const router = Router();

// Use static dev user ID
const DEV_USER_ID = "dev-user";

// GET /api/tokens
router.get("/", async (_req, res) => {
  try {
    const userTokens = await db.select().from(tokens).where(eq(tokens.userId, DEV_USER_ID));
    res.json(userTokens);
  } catch (err) {
    console.error("❌ Failed to fetch tokens:", err);
    res.status(500).json({ message: "Failed to fetch tokens" });
  }
});

// POST /api/tokens
router.post("/", async (req, res) => {
  const { service, tokenName, tokenValue, configuration } = req.body;

  if (!service || !tokenName || !tokenValue) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await db.insert(tokens).values({
      userId: DEV_USER_ID,
      service,
      tokenName,
      tokenValue,
      configuration,
    });

    res.status(201).json({ message: "Token saved" });
  } catch (err) {
    console.error("❌ Error inserting token:", err);
    res.status(500).json({ message: "Failed to create token" });
  }
});

// DELETE /api/tokens/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await db.delete(tokens).where(eq(tokens.id, id));
    res.status(200).json({ message: "Token deleted" });
  } catch (err) {
    console.error("❌ Failed to delete token:", err);
    res.status(500).json({ message: "Failed to delete token" });
  }
});

export default router;
// server/routes/api/tokens.ts
import { Router } from "express";
import { db } from "../../db";
import { tokens } from "@shared/schema/tokens";
import { eq } from "drizzle-orm";

const router = Router();

// Middleware must ensure req.user.email is populated

// GET /api/tokens
router.get("/", async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ message: "Unauthorized" });

    const userTokens = await db.select().from(tokens).where(eq(tokens.email, email));
    res.json(userTokens);
  } catch (err) {
    console.error("❌ Failed to fetch tokens:", err);
    res.status(500).json({ message: "Failed to fetch tokens" });
  }
});

// POST /api/tokens
router.post("/", async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ message: "Unauthorized" });

    const { service, tokenName, tokenValue, configuration } = req.body;

    if (!service || !tokenName || !tokenValue) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await db.insert(tokens).values({
      email,
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
    const email = req.user?.email;
    if (!email) return res.status(401).json({ message: "Unauthorized" });

    const id = req.params.id;

    // Delete only if the token belongs to the user
    await db.delete(tokens).where(eq(tokens.id, id)).where(eq(tokens.email, email));
    res.status(200).json({ message: "Token deleted" });
  } catch (err) {
    console.error("❌ Failed to delete token:", err);
    res.status(500).json({ message: "Failed to delete token" });
  }
});

export default router;

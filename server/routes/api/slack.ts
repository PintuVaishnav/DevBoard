import { Router } from "express";
import { db } from "../../db";
import { tokens } from "@shared/schema/tokens";
import { eq, and } from "drizzle-orm";

const router = Router();

async function getSlackToken(userId: string) {
  const result = await db
    .select()
    .from(tokens)
    .where(and(eq(tokens.userId, userId), eq(tokens.service, "slack")))
    .limit(1);
  return result[0];
}

router.post("/notify", async (req, res) => {
  const userId = req.user?.id || "dev-user";
  const { message } = req.body;

  try {
    const slack = await getSlackToken(userId);
    if (!slack?.tokenValue) return res.status(401).json({ error: "No Slack webhook found" });

    await fetch(slack.tokenValue, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Slack notify error:", err);
    res.status(500).json({ error: "Failed to send Slack message" });
  }
});

export default router;

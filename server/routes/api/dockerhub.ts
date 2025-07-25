import { Router } from "express";
import { db } from "../../db";
import { tokens } from "@shared/schema/tokens";
import { and, eq } from "drizzle-orm";

const router = Router();

async function getDockerToken(userId: string) {
  const result = await db
    .select()
    .from(tokens)
    .where(and(eq(tokens.userId, userId), eq(tokens.service, "dockerhub")))
    .limit(1);
  return result[0]?.tokenValue;
}

router.get("/stats", async (req, res) => {
  const userId = req.user?.id || "dev-user";
  const username = "vaishnavyejju";

  try {
    const token = await getDockerToken(userId);
    if (!token) return res.status(401).json({ error: "DockerHub token not found" });

    const basic = Buffer.from(`${username}:${token}`).toString("base64");

    const response = await fetch(`https://hub.docker.com/v2/repositories/${username}/`, {
      headers: {
        Authorization: `Basic ${basic}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ DockerHub API error:", data);
      return res.status(response.status).json({ error: data });
    }

    res.json(data);
  } catch (err) {
    console.error("💥 Error fetching DockerHub stats:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

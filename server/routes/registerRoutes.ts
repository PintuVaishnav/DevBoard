// server/routes/registerRoutes.ts
import { Express } from "express";
import tokensRouter from "../routes/api/token";
import githubRouter from "../routes/api/github";

export async function registerRoutes(app: Express) {
  app.use("/api/tokens", tokensRouter);

  console.log("✅ GitHub routes registered at /api/github");
}

export default registerRoutes;
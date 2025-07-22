// server/routes/index.ts
import { Express } from "express";
import tokensRoute from "./tokens";

export async function registerRoutes(app: Express) {
  app.use("/api/tokens", tokensRoute);
  return app;
}

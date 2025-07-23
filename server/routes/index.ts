import { Express } from "express";
import githubRoutes from "./api/github";
import slackRoutes from "./api/slack";

export function registerRoutes(app: Express) {
  app.use("/api/github", githubRoutes);
  app.use("/api/slack", slackRoutes);

  return app;
}

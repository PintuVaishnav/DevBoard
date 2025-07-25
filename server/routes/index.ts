import { Express } from "express";
import githubRoutes from "./api/github";
import slackRoutes from "./api/slack";
import dockerhub from "./api/dockerhub";
import gcpRoutes from "./api/gcp";



export function registerRoutes(app: Express) {
  app.use("/api/github", githubRoutes);
  app.use("/api/slack", slackRoutes);
  app.use("/api/dockerhub", dockerhub);
  app.use("/api/gcp", gcpRoutes);



  return app;
}

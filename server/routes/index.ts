import { Express } from "express";
import githubRoutes from "./api/github";
import slackRoutes from "./api/slack";
import dockerhub from "./api/dockerhub";
import gcpRoutes from "./api/gcp";
import helmRoutes from "./api/helm";
import kubernetes from "./api/kubernetes";
import aws from "./api/aws"
import infraCostsRoute from "./api/infra-costs";


export function registerRoutes(app: Express) {
  app.use("/api/github", githubRoutes);
  app.use("/api/slack", slackRoutes);
  app.use("/api/dockerhub", dockerhub);
  app.use("/api/gcp", gcpRoutes);
  app.use("/api/helm", helmRoutes);
  app.use("/api/kubernetes", kubernetes);
  app.use("/api/aws",aws);
  app.use('/api/infra-costs', infraCostsRoute);


  return app;
}

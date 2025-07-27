import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import passport from "passport";
import "./googleauth";
import "./githubauth";
import {
  insertPipelineSchema,
  insertFeatureFlagSchema,
  insertHealthMetricSchema,
  insertInfraCostSchema,
  insertApiTokenSchema,
  insertReleaseNoteSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ✅ Google Auth Init + Callback
  app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get("/auth/google/callback", passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "/overview" // ✅ dashboard page
  }));

  // ✅ GitHub Auth Init + Callback
  app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

  app.get("/auth/github/callback", passport.authenticate("github", {
    failureRedirect: "/login",
    successRedirect: "/overview"
  }));

  // ✅ Generic failure route
  app.get("/auth/fail", (_req, res) => {
    res.send("Authentication Failed");
  });

  // ✅ Get authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id || req.user.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ✅ Logout
  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/login");
    });
  });

  const getUserId = (req: any) => req.user.id || req.user.sub;

  // ✅ Pipelines
  app.get("/api/pipelines", isAuthenticated, async (req: any, res) => {
    try {
      const pipelines = await storage.getPipelines(getUserId(req));
      res.json(pipelines);
    } catch {
      res.status(500).json({ message: "Failed to fetch pipelines" });
    }
  });

  app.post("/api/pipelines", isAuthenticated, async (req: any, res) => {
    try {
      const data = insertPipelineSchema.parse({ ...req.body, userId: getUserId(req) });
      const pipeline = await storage.createPipeline(data);
      res.json(pipeline);
    } catch {
      res.status(500).json({ message: "Failed to create pipeline" });
    }
  });

  app.patch("/api/pipelines/:id", isAuthenticated, async (req, res) => {
    try {
      const pipeline = await storage.updatePipeline(parseInt(req.params.id), req.body);
      res.json(pipeline);
    } catch {
      res.status(500).json({ message: "Failed to update pipeline" });
    }
  });

  // ✅ Feature Flags
  app.get("/api/feature-flags", isAuthenticated, async (req, res) => {
    try {
      const flags = await storage.getFeatureFlags(getUserId(req));
      res.json(flags);
    } catch {
      res.status(500).json({ message: "Failed to fetch feature flags" });
    }
  });

  app.post("/api/feature-flags", isAuthenticated, async (req, res) => {
    try {
      const data = insertFeatureFlagSchema.parse({ ...req.body, userId: getUserId(req) });
      const flag = await storage.createFeatureFlag(data);
      res.json(flag);
    } catch {
      res.status(500).json({ message: "Failed to create feature flag" });
    }
  });

  app.patch("/api/feature-flags/:id", isAuthenticated, async (req, res) => {
    try {
      const flag = await storage.updateFeatureFlag(parseInt(req.params.id), req.body);
      res.json(flag);
    } catch {
      res.status(500).json({ message: "Failed to update feature flag" });
    }
  });

  app.delete("/api/feature-flags/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteFeatureFlag(parseInt(req.params.id));
      res.json({ message: "Feature flag deleted successfully" });
    } catch {
      res.status(500).json({ message: "Failed to delete feature flag" });
    }
  });

  // ✅ Health Metrics
  app.get("/api/health-metrics", isAuthenticated, async (req, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const metrics = await storage.getHealthMetrics(hours);
      res.json(metrics);
    } catch {
      res.status(500).json({ message: "Failed to fetch health metrics" });
    }
  });

  app.post("/api/health-metrics", isAuthenticated, async (req, res) => {
    try {
      const metric = await storage.createHealthMetric(insertHealthMetricSchema.parse(req.body));
      res.json(metric);
    } catch {
      res.status(500).json({ message: "Failed to create health metric" });
    }
  });

  // ✅ Infra Costs
  app.get("/api/infra-costs", isAuthenticated, async (req, res) => {
    try {
      const start = new Date(req.query.startDate as string || Date.now() - 30 * 86400000);
      const end = new Date(req.query.endDate as string || Date.now());
      const costs = await storage.getInfraCosts(start, end);
      res.json(costs);
    } catch {
      res.status(500).json({ message: "Failed to fetch infra costs" });
    }
  });

  app.post("/api/infra-costs", isAuthenticated, async (req, res) => {
    try {
      const cost = await storage.createInfraCost(insertInfraCostSchema.parse(req.body));
      res.json(cost);
    } catch {
      res.status(500).json({ message: "Failed to create infra cost" });
    }
  });

  // ✅ Tokens
  app.get("/api/tokens", isAuthenticated, async (req, res) => {
    try {
      const tokens = await storage.getApiTokens(getUserId(req));
      const sanitized = tokens.map(t => ({ ...t, tokenValue: '***' }));
      res.json(sanitized);
    } catch {
      res.status(500).json({ message: "Failed to fetch API tokens" });
    }
  });

  app.post("/api/tokens", isAuthenticated, async (req, res) => {
    try {
      const data = insertApiTokenSchema.parse({ ...req.body, userId: getUserId(req) });
      const token = await storage.createApiToken(data);
      res.json({ ...token, tokenValue: '***' });
    } catch {
      res.status(500).json({ message: "Failed to create token" });
    }
  });

  app.patch("/api/tokens/:id", isAuthenticated, async (req, res) => {
    try {
      const token = await storage.updateApiToken(parseInt(req.params.id), req.body);
      res.json({ ...token, tokenValue: '***' });
    } catch {
      res.status(500).json({ message: "Failed to update token" });
    }
  });

  app.delete("/api/tokens/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteApiToken(parseInt(req.params.id));
      res.json({ message: "Token deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete token" });
    }
  });

  // ✅ Release Notes
  app.get("/api/release-notes", isAuthenticated, async (req, res) => {
    try {
      const notes = await storage.getReleaseNotes(getUserId(req));
      res.json(notes);
    } catch {
      res.status(500).json({ message: "Failed to fetch release notes" });
    }
  });

  app.post("/api/release-notes", isAuthenticated, async (req, res) => {
    try {
      const data = insertReleaseNoteSchema.parse({ ...req.body, userId: getUserId(req) });
      const note = await storage.createReleaseNote(data);
      res.json(note);
    } catch {
      res.status(500).json({ message: "Failed to create release note" });
    }
  });

  app.patch("/api/release-notes/:id", isAuthenticated, async (req, res) => {
    try {
      const note = await storage.updateReleaseNote(parseInt(req.params.id), req.body);
      res.json(note);
    } catch {
      res.status(500).json({ message: "Failed to update release note" });
    }
  });

  app.delete("/api/release-notes/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteReleaseNote(parseInt(req.params.id));
      res.json({ message: "Release note deleted" });
    } catch {
      res.status(500).json({ message: "Failed to delete release note" });
    }
  });

  return createServer(app);
}

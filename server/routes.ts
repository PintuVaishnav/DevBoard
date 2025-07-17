import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertPipelineSchema, 
  insertFeatureFlagSchema, 
  insertHealthMetricSchema, 
  insertInfraCostSchema, 
  insertApiTokenSchema, 
  insertReleaseNoteSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Pipeline routes
  app.get('/api/pipelines', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pipelines = await storage.getPipelines(userId);
      res.json(pipelines);
    } catch (error) {
      console.error("Error fetching pipelines:", error);
      res.status(500).json({ message: "Failed to fetch pipelines" });
    }
  });

  app.post('/api/pipelines', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pipelineData = insertPipelineSchema.parse({ ...req.body, userId });
      const pipeline = await storage.createPipeline(pipelineData);
      res.json(pipeline);
    } catch (error) {
      console.error("Error creating pipeline:", error);
      res.status(500).json({ message: "Failed to create pipeline" });
    }
  });

  app.patch('/api/pipelines/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const pipeline = await storage.updatePipeline(id, updates);
      res.json(pipeline);
    } catch (error) {
      console.error("Error updating pipeline:", error);
      res.status(500).json({ message: "Failed to update pipeline" });
    }
  });

  // Feature flag routes
  app.get('/api/feature-flags', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const flags = await storage.getFeatureFlags(userId);
      res.json(flags);
    } catch (error) {
      console.error("Error fetching feature flags:", error);
      res.status(500).json({ message: "Failed to fetch feature flags" });
    }
  });

  app.post('/api/feature-flags', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const flagData = insertFeatureFlagSchema.parse({ ...req.body, userId });
      const flag = await storage.createFeatureFlag(flagData);
      res.json(flag);
    } catch (error) {
      console.error("Error creating feature flag:", error);
      res.status(500).json({ message: "Failed to create feature flag" });
    }
  });

  app.patch('/api/feature-flags/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const flag = await storage.updateFeatureFlag(id, updates);
      res.json(flag);
    } catch (error) {
      console.error("Error updating feature flag:", error);
      res.status(500).json({ message: "Failed to update feature flag" });
    }
  });

  app.delete('/api/feature-flags/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFeatureFlag(id);
      res.json({ message: "Feature flag deleted successfully" });
    } catch (error) {
      console.error("Error deleting feature flag:", error);
      res.status(500).json({ message: "Failed to delete feature flag" });
    }
  });

  // Health metrics routes
  app.get('/api/health-metrics', isAuthenticated, async (req: any, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const metrics = await storage.getHealthMetrics(hours);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching health metrics:", error);
      res.status(500).json({ message: "Failed to fetch health metrics" });
    }
  });

  app.post('/api/health-metrics', isAuthenticated, async (req: any, res) => {
    try {
      const metricData = insertHealthMetricSchema.parse(req.body);
      const metric = await storage.createHealthMetric(metricData);
      res.json(metric);
    } catch (error) {
      console.error("Error creating health metric:", error);
      res.status(500).json({ message: "Failed to create health metric" });
    }
  });

  // Infrastructure costs routes
  app.get('/api/infra-costs', isAuthenticated, async (req: any, res) => {
    try {
      const startDate = new Date(req.query.startDate as string || Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date(req.query.endDate as string || Date.now());
      const costs = await storage.getInfraCosts(startDate, endDate);
      res.json(costs);
    } catch (error) {
      console.error("Error fetching infrastructure costs:", error);
      res.status(500).json({ message: "Failed to fetch infrastructure costs" });
    }
  });

  app.post('/api/infra-costs', isAuthenticated, async (req: any, res) => {
    try {
      const costData = insertInfraCostSchema.parse(req.body);
      const cost = await storage.createInfraCost(costData);
      res.json(cost);
    } catch (error) {
      console.error("Error creating infrastructure cost:", error);
      res.status(500).json({ message: "Failed to create infrastructure cost" });
    }
  });

  // API tokens routes
  app.get('/api/tokens', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tokens = await storage.getApiTokens(userId);
      // Don't return token values for security
      const sanitizedTokens = tokens.map(token => ({
        ...token,
        tokenValue: token.tokenValue ? '***' : null
      }));
      res.json(sanitizedTokens);
    } catch (error) {
      console.error("Error fetching API tokens:", error);
      res.status(500).json({ message: "Failed to fetch API tokens" });
    }
  });

  app.post('/api/tokens', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tokenData = insertApiTokenSchema.parse({ ...req.body, userId });
      const token = await storage.createApiToken(tokenData);
      res.json({ ...token, tokenValue: '***' });
    } catch (error) {
      console.error("Error creating API token:", error);
      res.status(500).json({ message: "Failed to create API token" });
    }
  });

  app.patch('/api/tokens/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const token = await storage.updateApiToken(id, updates);
      res.json({ ...token, tokenValue: '***' });
    } catch (error) {
      console.error("Error updating API token:", error);
      res.status(500).json({ message: "Failed to update API token" });
    }
  });

  app.delete('/api/tokens/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteApiToken(id);
      res.json({ message: "API token deleted successfully" });
    } catch (error) {
      console.error("Error deleting API token:", error);
      res.status(500).json({ message: "Failed to delete API token" });
    }
  });

  // Release notes routes
  app.get('/api/release-notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notes = await storage.getReleaseNotes(userId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching release notes:", error);
      res.status(500).json({ message: "Failed to fetch release notes" });
    }
  });

  app.post('/api/release-notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const noteData = insertReleaseNoteSchema.parse({ ...req.body, userId });
      const note = await storage.createReleaseNote(noteData);
      res.json(note);
    } catch (error) {
      console.error("Error creating release note:", error);
      res.status(500).json({ message: "Failed to create release note" });
    }
  });

  app.patch('/api/release-notes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const note = await storage.updateReleaseNote(id, updates);
      res.json(note);
    } catch (error) {
      console.error("Error updating release note:", error);
      res.status(500).json({ message: "Failed to update release note" });
    }
  });

  app.delete('/api/release-notes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReleaseNote(id);
      res.json({ message: "Release note deleted successfully" });
    } catch (error) {
      console.error("Error deleting release note:", error);
      res.status(500).json({ message: "Failed to delete release note" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

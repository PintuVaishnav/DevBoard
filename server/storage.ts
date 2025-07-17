import {
  users,
  pipelines,
  featureFlags,
  healthMetrics,
  infraCosts,
  apiTokens,
  releaseNotes,
  type User,
  type UpsertUser,
  type Pipeline,
  type InsertPipeline,
  type FeatureFlag,
  type InsertFeatureFlag,
  type HealthMetric,
  type InsertHealthMetric,
  type InfraCost,
  type InsertInfraCost,
  type ApiToken,
  type InsertApiToken,
  type ReleaseNote,
  type InsertReleaseNote,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, gte, lte, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Pipeline operations
  getPipelines(userId: string): Promise<Pipeline[]>;
  createPipeline(pipeline: InsertPipeline): Promise<Pipeline>;
  updatePipeline(id: number, updates: Partial<InsertPipeline>): Promise<Pipeline>;
  
  // Feature flag operations
  getFeatureFlags(userId: string): Promise<FeatureFlag[]>;
  createFeatureFlag(flag: InsertFeatureFlag): Promise<FeatureFlag>;
  updateFeatureFlag(id: number, updates: Partial<InsertFeatureFlag>): Promise<FeatureFlag>;
  deleteFeatureFlag(id: number): Promise<void>;
  
  // Health metrics operations
  getHealthMetrics(hours: number): Promise<HealthMetric[]>;
  createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric>;
  
  // Infrastructure costs operations
  getInfraCosts(startDate: Date, endDate: Date): Promise<InfraCost[]>;
  createInfraCost(cost: InsertInfraCost): Promise<InfraCost>;
  
  // API tokens operations
  getApiTokens(userId: string): Promise<ApiToken[]>;
  createApiToken(token: InsertApiToken): Promise<ApiToken>;
  updateApiToken(id: number, updates: Partial<InsertApiToken>): Promise<ApiToken>;
  deleteApiToken(id: number): Promise<void>;
  
  // Release notes operations
  getReleaseNotes(userId: string): Promise<ReleaseNote[]>;
  createReleaseNote(note: InsertReleaseNote): Promise<ReleaseNote>;
  updateReleaseNote(id: number, updates: Partial<InsertReleaseNote>): Promise<ReleaseNote>;
  deleteReleaseNote(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Pipeline operations
  async getPipelines(userId: string): Promise<Pipeline[]> {
    return await db
      .select()
      .from(pipelines)
      .where(eq(pipelines.userId, userId))
      .orderBy(desc(pipelines.createdAt));
  }

  async createPipeline(pipeline: InsertPipeline): Promise<Pipeline> {
    const [newPipeline] = await db
      .insert(pipelines)
      .values(pipeline)
      .returning();
    return newPipeline;
  }

  async updatePipeline(id: number, updates: Partial<InsertPipeline>): Promise<Pipeline> {
    const [updatedPipeline] = await db
      .update(pipelines)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pipelines.id, id))
      .returning();
    return updatedPipeline;
  }

  // Feature flag operations
  async getFeatureFlags(userId: string): Promise<FeatureFlag[]> {
    return await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.userId, userId))
      .orderBy(desc(featureFlags.createdAt));
  }

  async createFeatureFlag(flag: InsertFeatureFlag): Promise<FeatureFlag> {
    const [newFlag] = await db
      .insert(featureFlags)
      .values(flag)
      .returning();
    return newFlag;
  }

  async updateFeatureFlag(id: number, updates: Partial<InsertFeatureFlag>): Promise<FeatureFlag> {
    const [updatedFlag] = await db
      .update(featureFlags)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(featureFlags.id, id))
      .returning();
    return updatedFlag;
  }

  async deleteFeatureFlag(id: number): Promise<void> {
    await db.delete(featureFlags).where(eq(featureFlags.id, id));
  }

  // Health metrics operations
  async getHealthMetrics(hours: number): Promise<HealthMetric[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await db
      .select()
      .from(healthMetrics)
      .where(gte(healthMetrics.timestamp, since))
      .orderBy(desc(healthMetrics.timestamp));
  }

  async createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric> {
    const [newMetric] = await db
      .insert(healthMetrics)
      .values(metric)
      .returning();
    return newMetric;
  }

  // Infrastructure costs operations
  async getInfraCosts(startDate: Date, endDate: Date): Promise<InfraCost[]> {
    return await db
      .select()
      .from(infraCosts)
      .where(and(
        gte(infraCosts.date, startDate),
        lte(infraCosts.date, endDate)
      ))
      .orderBy(desc(infraCosts.date));
  }

  async createInfraCost(cost: InsertInfraCost): Promise<InfraCost> {
    const [newCost] = await db
      .insert(infraCosts)
      .values(cost)
      .returning();
    return newCost;
  }

  // API tokens operations
  async getApiTokens(userId: string): Promise<ApiToken[]> {
    return await db
      .select()
      .from(apiTokens)
      .where(eq(apiTokens.userId, userId))
      .orderBy(desc(apiTokens.createdAt));
  }

  async createApiToken(token: InsertApiToken): Promise<ApiToken> {
    const [newToken] = await db
      .insert(apiTokens)
      .values(token)
      .returning();
    return newToken;
  }

  async updateApiToken(id: number, updates: Partial<InsertApiToken>): Promise<ApiToken> {
    const [updatedToken] = await db
      .update(apiTokens)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(apiTokens.id, id))
      .returning();
    return updatedToken;
  }

  async deleteApiToken(id: number): Promise<void> {
    await db.delete(apiTokens).where(eq(apiTokens.id, id));
  }

  // Release notes operations
  async getReleaseNotes(userId: string): Promise<ReleaseNote[]> {
    return await db
      .select()
      .from(releaseNotes)
      .where(eq(releaseNotes.userId, userId))
      .orderBy(desc(releaseNotes.createdAt));
  }

  async createReleaseNote(note: InsertReleaseNote): Promise<ReleaseNote> {
    const [newNote] = await db
      .insert(releaseNotes)
      .values(note)
      .returning();
    return newNote;
  }

  async updateReleaseNote(id: number, updates: Partial<InsertReleaseNote>): Promise<ReleaseNote> {
    const [updatedNote] = await db
      .update(releaseNotes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(releaseNotes.id, id))
      .returning();
    return updatedNote;
  }

  async deleteReleaseNote(id: number): Promise<void> {
    await db.delete(releaseNotes).where(eq(releaseNotes.id, id));
  }
}

export const storage = new DatabaseStorage();

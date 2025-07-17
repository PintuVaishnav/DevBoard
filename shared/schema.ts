import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("developer").notNull(), // admin, developer, viewer
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pipelines table
export const pipelines = pgTable("pipelines", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  status: varchar("status").notNull(), // success, running, failed, pending
  branch: varchar("branch").notNull(),
  duration: integer("duration"), // in seconds
  userId: varchar("user_id").references(() => users.id),
  repository: varchar("repository"),
  commitHash: varchar("commit_hash"),
  commitMessage: text("commit_message"),
  logs: text("logs"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Feature flags table
export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  enabled: boolean("enabled").default(false),
  rolloutPercentage: integer("rollout_percentage").default(0),
  environment: varchar("environment").default("production"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Health metrics table
export const healthMetrics = pgTable("health_metrics", {
  id: serial("id").primaryKey(),
  metricType: varchar("metric_type").notNull(), // cpu, memory, disk, network
  value: decimal("value").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  service: varchar("service").default("main"),
});

// Infrastructure costs table
export const infraCosts = pgTable("infra_costs", {
  id: serial("id").primaryKey(),
  service: varchar("service").notNull(), // ec2, s3, rds, etc.
  cost: decimal("cost").notNull(),
  currency: varchar("currency").default("USD"),
  period: varchar("period").notNull(), // daily, monthly
  date: timestamp("date").notNull(),
  region: varchar("region"),
  createdAt: timestamp("created_at").defaultNow(),
});

// API tokens table
export const apiTokens = pgTable("api_tokens", {
  id: serial("id").primaryKey(),
  service: varchar("service").notNull(), // github, aws, prometheus, slack
  tokenName: varchar("token_name").notNull(),
  tokenValue: text("token_value"), // encrypted
  configuration: jsonb("configuration"), // additional config like repo, region, etc.
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Release notes table
export const releaseNotes = pgTable("release_notes", {
  id: serial("id").primaryKey(),
  version: varchar("version").notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  type: varchar("type").default("release"), // release, hotfix, feature
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertPipelineSchema = createInsertSchema(pipelines);
export const insertFeatureFlagSchema = createInsertSchema(featureFlags);
export const insertHealthMetricSchema = createInsertSchema(healthMetrics);
export const insertInfraCostSchema = createInsertSchema(infraCosts);
export const insertApiTokenSchema = createInsertSchema(apiTokens);
export const insertReleaseNoteSchema = createInsertSchema(releaseNotes);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Pipeline = typeof pipelines.$inferSelect;
export type InsertPipeline = typeof pipelines.$inferInsert;
export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;
export type HealthMetric = typeof healthMetrics.$inferSelect;
export type InsertHealthMetric = typeof healthMetrics.$inferInsert;
export type InfraCost = typeof infraCosts.$inferSelect;
export type InsertInfraCost = typeof infraCosts.$inferInsert;
export type ApiToken = typeof apiTokens.$inferSelect;
export type InsertApiToken = typeof apiTokens.$inferInsert;
export type ReleaseNote = typeof releaseNotes.$inferSelect;
export type InsertReleaseNote = typeof releaseNotes.$inferInsert;

// shared/schema/tokens.ts
import { pgTable, serial, text, jsonb, varchar } from "drizzle-orm/pg-core";

export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Google sub ID
  service: varchar("service", { length: 50 }).notNull(),
  tokenName: varchar("token_name", { length: 100 }).notNull(),
  tokenValue: text("token_value").notNull(),
  configuration: jsonb("configuration").default({}),
});

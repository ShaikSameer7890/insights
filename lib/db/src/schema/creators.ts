import {
  pgTable,
  text,
  serial,
  integer,
  real,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const creatorsTable = pgTable("creators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  bio: text("bio"),
  category: text("category").notNull(),
  platform: text("platform").notNull(),
  followers: integer("followers").notNull().default(0),
  engagementRate: real("engagement_rate").notNull().default(0),
  location: text("location").notNull(),
  avatarUrl: text("avatar_url"),
  portfolioUrl: text("portfolio_url"),
  totalEarnings: real("total_earnings").default(0),
  campaignsCompleted: integer("campaigns_completed").default(0),
  rating: real("rating").default(0),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCreatorSchema = createInsertSchema(creatorsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertCreator = z.infer<typeof insertCreatorSchema>;
export type Creator = typeof creatorsTable.$inferSelect;

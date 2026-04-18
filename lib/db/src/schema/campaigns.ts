import {
  pgTable,
  text,
  serial,
  integer,
  real,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const campaignsTable = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull(),
  brandName: text("brand_name").notNull().default("Brand"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  budget: real("budget").notNull(),
  status: text("status").notNull().default("draft"),
  requiredFollowers: integer("required_followers").default(0),
  requiredEngagement: real("required_engagement").default(0),
  platforms: text("platforms"),
  deadline: text("deadline"),
  deliverables: text("deliverables"),
  applicationsCount: integer("applications_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCampaignSchema = createInsertSchema(campaignsTable).omit({
  id: true,
  createdAt: true,
  applicationsCount: true,
});
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaignsTable.$inferSelect;

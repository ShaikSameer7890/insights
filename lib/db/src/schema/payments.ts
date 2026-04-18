import { pgTable, serial, integer, real, timestamp, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  brandId: integer("brand_id").notNull(),
  creatorId: integer("creator_id").notNull(),
  amount: real("amount").notNull(),
  status: text("status").notNull().default("pending"),
  platformFee: real("platform_fee"),
  creatorPayout: real("creator_payout"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;

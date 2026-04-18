import { Router } from "express";
import { db } from "@workspace/db";
import {
  creatorsTable,
  campaignsTable,
  paymentsTable,
} from "@workspace/db";
import { eq, avg, sum, count } from "drizzle-orm";
import { GetCreatorAnalyticsParams } from "@workspace/api-zod";

const router = Router();

router.get("/analytics/dashboard", async (req, res): Promise<void> => {
  const [creatorStats] = await db.select({ total: count() }).from(creatorsTable);
  const [campaignStats] = await db.select({ total: count() }).from(campaignsTable);
  const activeCampaignsResult = await db
    .select({ total: count() })
    .from(campaignsTable)
    .where(eq(campaignsTable.status, "active"));
  const [paymentStats] = await db
    .select({ total: sum(paymentsTable.amount) })
    .from(paymentsTable);
  const [engagementStats] = await db
    .select({ avg: avg(creatorsTable.engagementRate) })
    .from(creatorsTable);

  const categoryRows = await db
    .select({ category: creatorsTable.category, total: count() })
    .from(creatorsTable)
    .groupBy(creatorsTable.category)
    .limit(5);

  const totalCreators = creatorStats?.total ?? 0;
  const topCategories = categoryRows.map((row) => ({
    category: row.category,
    count: Number(row.total),
    percentage: totalCreators > 0 ? Math.round((Number(row.total) / Number(totalCreators)) * 100) : 0,
  }));

  const recentActivity = [
    { id: 1, type: "campaign", description: "New campaign posted: Summer Collection", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: 2, type: "application", description: "Creator Alex Chen applied to Tech Review Campaign", timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { id: 3, type: "payment", description: "Payment of $2,500 released for Fitness Challenge", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
    { id: 4, type: "creator", description: "New creator Sarah Kim joined the platform", timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
  ];

  res.json({
    totalCreators: Number(creatorStats?.total ?? 0),
    totalCampaigns: Number(campaignStats?.total ?? 0),
    activeCampaigns: Number(activeCampaignsResult[0]?.total ?? 0),
    totalPaymentsVolume: Number(paymentStats?.total ?? 0),
    avgEngagementRate: Math.round(Number(engagementStats?.avg ?? 0) * 10) / 10,
    topCategories,
    recentActivity,
  });
});

router.get("/analytics/creator/:id", async (req, res): Promise<void> => {
  const params = GetCreatorAnalyticsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const { id } = params.data;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();

  const followerGrowth = months.slice(0, now.getMonth() + 1).map((label, i) => ({
    label,
    value: Math.round(50000 + i * 8000 + Math.random() * 5000),
  }));

  const earningsByMonth = months.slice(0, now.getMonth() + 1).map((label, i) => ({
    label,
    value: Math.round(500 + i * 200 + Math.random() * 300),
  }));

  const campaignPerformance = [
    { label: "Q1", value: Math.round(2000 + Math.random() * 1000) },
    { label: "Q2", value: Math.round(3500 + Math.random() * 1500) },
    { label: "Q3", value: Math.round(5000 + Math.random() * 2000) },
    { label: "Q4", value: Math.round(4000 + Math.random() * 1500) },
  ];

  res.json({
    creatorId: id,
    followerGrowth,
    earningsByMonth,
    campaignPerformance,
    totalReach: 1200000 + Math.round(Math.random() * 500000),
    avgEarningsPerCampaign: Math.round(1500 + Math.random() * 1000),
  });
});

router.get("/analytics/categories", async (req, res): Promise<void> => {
  const categoryRows = await db
    .select({ category: creatorsTable.category, total: count() })
    .from(creatorsTable)
    .groupBy(creatorsTable.category);

  const totalCreators = categoryRows.reduce((acc, r) => acc + Number(r.total), 0);

  const result = categoryRows.map((row) => ({
    category: row.category,
    count: Number(row.total),
    percentage: totalCreators > 0 ? Math.round((Number(row.total) / totalCreators) * 100) : 0,
  }));

  res.json(result);
});

export default router;

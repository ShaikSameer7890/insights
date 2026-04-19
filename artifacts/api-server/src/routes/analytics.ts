import { Router } from "express";
import { db } from "@workspace/db";
import {
  creatorsTable,
  campaignsTable,
  paymentsTable,
  conversationsTable,
} from "@workspace/db";
import { eq, avg, sum, count, desc } from "drizzle-orm";
import { GetCreatorAnalyticsParams } from "@workspace/api-zod";

const router = Router();

const INDIAN_COMPANIES = [
  { name: "Zomato", sector: "Food & Delivery", logo: "Z", city: "Gurugram", hiring: 4, budget: "₹8L–₹20L" },
  { name: "Meesho", sector: "E-Commerce", logo: "M", city: "Bengaluru", hiring: 7, budget: "₹5L–₹15L" },
  { name: "Mamaearth", sector: "Beauty & Wellness", logo: "Ma", city: "Gurugram", hiring: 3, budget: "₹3L–₹12L" },
  { name: "Boat", sector: "Consumer Electronics", logo: "B", city: "New Delhi", hiring: 5, budget: "₹6L–₹18L" },
  { name: "Nykaa", sector: "Fashion & Beauty", logo: "N", city: "Mumbai", hiring: 6, budget: "₹4L–₹14L" },
  { name: "CRED", sector: "Fintech", logo: "C", city: "Bengaluru", hiring: 2, budget: "₹10L–₹25L" },
  { name: "Lenskart", sector: "Eyewear & Lifestyle", logo: "L", city: "Faridabad", hiring: 4, budget: "₹5L–₹16L" },
  { name: "Sugar Cosmetics", sector: "Beauty", logo: "S", city: "Mumbai", hiring: 5, budget: "₹3L–₹10L" },
];

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

  const recentConversations = await db
    .select()
    .from(conversationsTable)
    .orderBy(desc(conversationsTable.createdAt))
    .limit(4);

  const totalCreators = creatorStats?.total ?? 0;
  const topCategories = categoryRows.map((row) => ({
    category: row.category,
    count: Number(row.total),
    percentage: totalCreators > 0 ? Math.round((Number(row.total) / Number(totalCreators)) * 100) : 0,
  }));

  const recentHires = recentConversations.map((c, i) => {
    const names: string[] = JSON.parse(c.participantNames ?? "[]");
    const creatorName = names[1] || "Creator";
    const budgets = [125000, 83000, 249000, 166000];
    return {
      id: c.id,
      creatorName,
      campaignTitle: c.campaignTitle || "Brand Collaboration",
      amount: budgets[i % budgets.length],
      hiredAt: c.createdAt.toISOString(),
    };
  });

  const recentActivity = [
    ...recentHires.slice(0, 2).map((h, i) => ({
      id: 100 + i,
      type: "hire",
      description: `${h.creatorName} hired for "${h.campaignTitle}" — ₹${(h.amount / 1000).toFixed(0)}K`,
      timestamp: h.hiredAt,
    })),
    { id: 1, type: "campaign", description: "Summer Collection campaign posted — seeking lifestyle creators", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: 2, type: "application", description: "3 new creators applied to Tech Review Campaign", timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { id: 3, type: "payment", description: "Payment of ₹2.07L released for Fitness Challenge campaign", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
    { id: 4, type: "creator", description: "New creator Priya Singh joined — Fashion · Mumbai · 4.2L followers", timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
  ];

  res.json({
    totalCreators: Number(creatorStats?.total ?? 0),
    totalCampaigns: Number(campaignStats?.total ?? 0),
    activeCampaigns: Number(activeCampaignsResult[0]?.total ?? 0),
    totalPaymentsVolume: Number(paymentStats?.total ?? 0),
    avgEngagementRate: Math.round(Number(engagementStats?.avg ?? 0) * 10) / 10,
    topCategories,
    recentActivity,
    recentHires,
    companiesHiring: INDIAN_COMPANIES,
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
  const seed = id * 7;

  const followerGrowth = months.slice(0, now.getMonth() + 1).map((label, i) => ({
    label,
    value: Math.round(50000 + i * 9000 + (seed * (i + 1)) % 8000),
  }));

  const earningsByMonth = months.slice(0, now.getMonth() + 1).map((label, i) => ({
    label,
    value: Math.round((40000 + i * 15000 + (seed * (i + 2)) % 25000)),
  }));

  const campaignPerformance = [
    { label: "Q1", value: Math.round(150000 + (seed * 3) % 100000) },
    { label: "Q2", value: Math.round(290000 + (seed * 2) % 150000) },
    { label: "Q3", value: Math.round(415000 + (seed * 4) % 200000) },
    { label: "Q4", value: Math.round(332000 + (seed * 1) % 130000) },
  ];

  res.json({
    creatorId: id,
    followerGrowth,
    earningsByMonth,
    campaignPerformance,
    totalReach: 1200000 + (seed * 11) % 500000,
    avgEarningsPerCampaign: Math.round(85000 + (seed * 3) % 75000),
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

router.get("/analytics/notifications", async (_req, res): Promise<void> => {
  const recentConvs = await db
    .select()
    .from(conversationsTable)
    .orderBy(desc(conversationsTable.lastMessageAt))
    .limit(5);

  const notifications = [
    ...recentConvs.map((c, i) => {
      const names: string[] = JSON.parse(c.participantNames ?? "[]");
      return {
        id: `conv-${c.id}`,
        type: "message",
        title: "New message",
        body: `${names[1] || "Creator"}: ${c.lastMessage?.slice(0, 50) || "Started a conversation"}`,
        time: c.lastMessageAt?.toISOString() ?? c.createdAt.toISOString(),
        read: i > 1,
      };
    }),
    { id: "n1", type: "campaign", title: "Campaign milestone", body: "Summer Collection reached 1M impressions", time: new Date(Date.now() - 3600000).toISOString(), read: false },
    { id: "n2", type: "payment", title: "Payment processed", body: "₹83,000 released to Priya Singh", time: new Date(Date.now() - 7200000).toISOString(), read: true },
    { id: "n3", type: "creator", title: "New application", body: "Rohan Mehta applied to Tech Review Campaign", time: new Date(Date.now() - 14400000).toISOString(), read: true },
  ];

  res.json(notifications);
});

export default router;

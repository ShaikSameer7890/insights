import { Router } from "express";
import { db } from "@workspace/db";
import { creatorsTable } from "@workspace/db";
import { eq, ilike, gte, lte, and, desc } from "drizzle-orm";
import {
  CreateCreatorBody,
  GetCreatorParams,
  GetTopCreatorsQueryParams,
} from "@workspace/api-zod";

const router = Router();

function computeAiScore(engagementRate: number, followers: number, rating: number | null): number {
  const engagementPoints = Math.min(engagementRate * 4, 40);
  const followerPoints = Math.min((followers / 100000) * 3, 30);
  const ratingPoints = Math.min((rating ?? 0) * 6, 30);
  return Math.min(99, Math.round(engagementPoints + followerPoints + ratingPoints));
}

router.get("/creators", async (req, res): Promise<void> => {
  const q = req.query as {
    category?: string;
    platform?: string;
    minFollowers?: string;
    maxFollowers?: string;
    search?: string;
    location?: string;
  };

  const conditions = [];
  if (q.category) conditions.push(eq(creatorsTable.category, q.category));
  if (q.platform) conditions.push(eq(creatorsTable.platform, q.platform));
  if (q.minFollowers) conditions.push(gte(creatorsTable.followers, Number(q.minFollowers)));
  if (q.maxFollowers) conditions.push(lte(creatorsTable.followers, Number(q.maxFollowers)));
  if (q.search) conditions.push(ilike(creatorsTable.name, `%${q.search}%`));
  if (q.location && q.location !== "all") conditions.push(ilike(creatorsTable.location, `%${q.location}%`));

  const creators = await db
    .select()
    .from(creatorsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(creatorsTable.followers));

  const scored = creators.map((c) => ({
    ...c,
    aiScore: computeAiScore(c.engagementRate, c.followers, c.rating ?? null),
  }));

  res.json(scored);
});

router.post("/creators", async (req, res): Promise<void> => {
  const body = CreateCreatorBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [creator] = await db.insert(creatorsTable).values(body.data).returning();
  res.status(201).json(creator);
});

router.get("/creators/top", async (req, res): Promise<void> => {
  const query = GetTopCreatorsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { limit = 10, category } = query.data;

  const conditions = [];
  if (category) conditions.push(eq(creatorsTable.category, category));

  const creators = await db
    .select()
    .from(creatorsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(creatorsTable.engagementRate), desc(creatorsTable.followers))
    .limit(limit);

  const scored = creators.map((c) => ({
    ...c,
    aiScore: computeAiScore(c.engagementRate, c.followers, c.rating ?? null),
    matchReason: `${c.engagementRate}% engagement · ${(c.followers / 1000).toFixed(0)}K followers · ${c.category}`,
  }));

  res.json(scored);
});

router.get("/creators/:id", async (req, res): Promise<void> => {
  const params = GetCreatorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [creator] = await db
    .select()
    .from(creatorsTable)
    .where(eq(creatorsTable.id, params.data.id));
  if (!creator) {
    res.status(404).json({ error: "Creator not found" });
    return;
  }
  res.json({
    ...creator,
    aiScore: computeAiScore(creator.engagementRate, creator.followers, creator.rating ?? null),
  });
});

router.put("/creators/:id", async (req, res): Promise<void> => {
  const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const body = CreateCreatorBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [updated] = await db
    .update(creatorsTable)
    .set(body.data)
    .where(eq(creatorsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Creator not found" });
    return;
  }
  res.json(updated);
});

export default router;

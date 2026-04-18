import { Router } from "express";
import { db } from "@workspace/db";
import { creatorsTable } from "@workspace/db";
import { eq, ilike, gte, lte, and, desc } from "drizzle-orm";
import {
  ListCreatorsQueryParams,
  CreateCreatorBody,
  GetCreatorParams,
  GetTopCreatorsQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/creators", async (req, res): Promise<void> => {
  const query = ListCreatorsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { category, platform, minFollowers, maxFollowers, search } = query.data;

  const conditions = [];
  if (category) conditions.push(eq(creatorsTable.category, category));
  if (platform) conditions.push(eq(creatorsTable.platform, platform));
  if (minFollowers != null)
    conditions.push(gte(creatorsTable.followers, minFollowers));
  if (maxFollowers != null)
    conditions.push(lte(creatorsTable.followers, maxFollowers));
  if (search) conditions.push(ilike(creatorsTable.name, `%${search}%`));

  const creators = await db
    .select()
    .from(creatorsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(creatorsTable.followers));

  res.json(creators);
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
    aiScore:
      Math.round(
        (0.4 * c.engagementRate + 0.3 * (c.followers / 100000) * 10 + 0.3 * (c.rating ?? 0)) * 10
      ) / 10,
    matchReason: `High engagement rate of ${c.engagementRate}% with ${c.followers.toLocaleString()} followers in ${c.category}`,
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
  res.json(creator);
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

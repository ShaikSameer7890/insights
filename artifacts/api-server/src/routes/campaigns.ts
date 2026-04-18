import { Router } from "express";
import { db } from "@workspace/db";
import {
  campaignsTable,
  applicationsTable,
  creatorsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListCampaignsQueryParams,
  CreateCampaignBody,
  GetCampaignParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/campaigns", async (req, res): Promise<void> => {
  const query = ListCampaignsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { status, category, brandId } = query.data;

  const conditions = [];
  if (status) conditions.push(eq(campaignsTable.status, status));
  if (category) conditions.push(eq(campaignsTable.category, category));
  if (brandId != null) conditions.push(eq(campaignsTable.brandId, brandId));

  const campaigns = await db
    .select()
    .from(campaignsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  res.json(campaigns);
});

router.post("/campaigns", async (req, res): Promise<void> => {
  const body = CreateCampaignBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const platforms = Array.isArray(body.data.platforms)
    ? body.data.platforms.join(",")
    : body.data.platforms;
  const [campaign] = await db
    .insert(campaignsTable)
    .values({ ...body.data, platforms: platforms ?? null })
    .returning();
  res.status(201).json({ ...campaign, platforms: campaign.platforms?.split(",") ?? [] });
});

router.get("/campaigns/:id/recommend", async (req, res): Promise<void> => {
  const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.id, id));
  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }
  const creators = await db
    .select()
    .from(creatorsTable)
    .where(eq(creatorsTable.category, campaign.category));

  const scored = creators.map((c) => ({
    ...c,
    aiScore:
      Math.round(
        (0.4 * c.engagementRate +
          0.3 * Math.min(c.followers / (campaign.requiredFollowers ?? 10000), 1) * 10 +
          0.3 * (c.rating ?? 0)) *
          10
      ) / 10,
    matchReason: `Matches ${campaign.category} category with ${c.engagementRate}% engagement`,
  }));

  scored.sort((a, b) => b.aiScore - a.aiScore);
  res.json(scored.slice(0, 5));
});

router.get("/campaigns/:id", async (req, res): Promise<void> => {
  const params = GetCampaignParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.id, params.data.id));
  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }
  res.json({
    ...campaign,
    platforms: campaign.platforms?.split(",") ?? [],
  });
});

router.put("/campaigns/:id", async (req, res): Promise<void> => {
  const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
  const body = CreateCampaignBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const platforms = Array.isArray(body.data.platforms)
    ? body.data.platforms.join(",")
    : body.data.platforms;
  const [updated] = await db
    .update(campaignsTable)
    .set({ ...body.data, platforms: platforms ?? null })
    .where(eq(campaignsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }
  res.json({ ...updated, platforms: updated.platforms?.split(",") ?? [] });
});

export default router;

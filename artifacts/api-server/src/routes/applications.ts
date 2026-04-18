import { Router } from "express";
import { db } from "@workspace/db";
import { applicationsTable, creatorsTable, campaignsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListApplicationsQueryParams,
  CreateApplicationBody,
  UpdateApplicationParams,
  UpdateApplicationBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/applications", async (req, res): Promise<void> => {
  const query = ListApplicationsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { campaignId, creatorId, status } = query.data;

  const conditions = [];
  if (campaignId != null) conditions.push(eq(applicationsTable.campaignId, campaignId));
  if (creatorId != null) conditions.push(eq(applicationsTable.creatorId, creatorId));
  if (status) conditions.push(eq(applicationsTable.status, status));

  const apps = await db
    .select()
    .from(applicationsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const enriched = await Promise.all(
    apps.map(async (app) => {
      const [creator] = await db
        .select()
        .from(creatorsTable)
        .where(eq(creatorsTable.id, app.creatorId));
      const [campaign] = await db
        .select()
        .from(campaignsTable)
        .where(eq(campaignsTable.id, app.campaignId));
      return {
        ...app,
        creatorName: creator?.name ?? "Unknown",
        creatorAvatarUrl: creator?.avatarUrl ?? null,
        campaignTitle: campaign?.title ?? "Unknown Campaign",
      };
    })
  );

  res.json(enriched);
});

router.post("/applications", async (req, res): Promise<void> => {
  const body = CreateApplicationBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [app] = await db.insert(applicationsTable).values(body.data).returning();

  await db
    .update(campaignsTable)
    .set({ applicationsCount: db.$count(applicationsTable, eq(applicationsTable.campaignId, app.campaignId)) })
    .where(eq(campaignsTable.id, app.campaignId));

  const [creator] = await db
    .select()
    .from(creatorsTable)
    .where(eq(creatorsTable.id, app.creatorId));
  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.id, app.campaignId));

  res.status(201).json({
    ...app,
    creatorName: creator?.name ?? "Unknown",
    creatorAvatarUrl: creator?.avatarUrl ?? null,
    campaignTitle: campaign?.title ?? "Unknown Campaign",
  });
});

router.put("/applications/:id", async (req, res): Promise<void> => {
  const params = UpdateApplicationParams.safeParse(req.params);
  const body = UpdateApplicationBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [updated] = await db
    .update(applicationsTable)
    .set({ status: body.data.status })
    .where(eq(applicationsTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  res.json(updated);
});

export default router;

import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable, creatorsTable, campaignsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ListPaymentsQueryParams, CreatePaymentBody } from "@workspace/api-zod";

const router = Router();

router.get("/payments", async (req, res): Promise<void> => {
  const query = ListPaymentsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { campaignId, status } = query.data;

  const conditions = [];
  if (campaignId != null) conditions.push(eq(paymentsTable.campaignId, campaignId));
  if (status) conditions.push(eq(paymentsTable.status, status));

  const payments = await db
    .select()
    .from(paymentsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const enriched = await Promise.all(
    payments.map(async (p) => {
      const [creator] = await db
        .select()
        .from(creatorsTable)
        .where(eq(creatorsTable.id, p.creatorId));
      const [campaign] = await db
        .select()
        .from(campaignsTable)
        .where(eq(campaignsTable.id, p.campaignId));
      return {
        ...p,
        creatorName: creator?.name ?? "Unknown",
        campaignTitle: campaign?.title ?? "Unknown Campaign",
      };
    })
  );

  res.json(enriched);
});

router.post("/payments", async (req, res): Promise<void> => {
  const body = CreatePaymentBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const platformFee = body.data.amount * 0.05;
  const creatorPayout = body.data.amount - platformFee;

  const [payment] = await db
    .insert(paymentsTable)
    .values({
      ...body.data,
      platformFee,
      creatorPayout,
      status: "escrow",
    })
    .returning();

  res.status(201).json(payment);
});

export default router;

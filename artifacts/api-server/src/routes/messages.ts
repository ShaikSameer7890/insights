import { Router } from "express";
import { db } from "@workspace/db";
import { conversationsTable, messagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListMessagesQueryParams,
  SendMessageBody,
  CreateConversationBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/conversations", async (req, res): Promise<void> => {
  const conversations = await db.select().from(conversationsTable).orderBy(conversationsTable.lastMessageAt);
  const parsed = conversations.map((c) => ({
    ...c,
    participantIds: JSON.parse(c.participantIds ?? "[]"),
    participantNames: JSON.parse(c.participantNames ?? "[]"),
    lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
  })).reverse();
  res.json(parsed);
});

router.post("/conversations", async (req, res): Promise<void> => {
  const body = CreateConversationBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const reqBody = req.body as Record<string, unknown>;
  const participantNamesRaw: string[] = Array.isArray(reqBody.participantNames) ? reqBody.participantNames as string[] : [];
  const campaignTitleRaw = typeof reqBody.campaignTitle === "string" ? reqBody.campaignTitle : undefined;

  const [conv] = await db
    .insert(conversationsTable)
    .values({
      participantIds: JSON.stringify(body.data.participantIds),
      participantNames: JSON.stringify(participantNamesRaw),
      campaignId: body.data.campaignId ?? null,
      campaignTitle: campaignTitleRaw ?? null,
      unreadCount: 0,
    })
    .returning();
  res.status(201).json({
    ...conv,
    participantIds: JSON.parse(conv.participantIds),
    participantNames: JSON.parse(conv.participantNames),
    lastMessageAt: conv.lastMessageAt?.toISOString() ?? null,
  });
});

router.post("/hire", async (req, res): Promise<void> => {
  const body = req.body as {
    creatorId?: unknown;
    creatorName?: unknown;
    brandName?: unknown;
    budget?: unknown;
    campaignTitle?: unknown;
  };

  const creatorId = typeof body.creatorId === "number" ? body.creatorId : Number(body.creatorId);
  const creatorName = typeof body.creatorName === "string" ? body.creatorName : "Creator";
  const brandName = typeof body.brandName === "string" ? body.brandName : "Brand";
  const budget = typeof body.budget === "number" ? body.budget : undefined;
  const campaignTitle = typeof body.campaignTitle === "string" ? body.campaignTitle : "Brand Collaboration";

  if (!creatorId || isNaN(creatorId)) {
    res.status(400).json({ error: "creatorId required" });
    return;
  }

  const existing = await db.select().from(conversationsTable);
  const existingConv = existing.find((c) => {
    const ids: number[] = JSON.parse(c.participantIds ?? "[]");
    return ids.includes(1) && ids.includes(creatorId);
  });

  if (existingConv) {
    res.json({
      conversation: {
        ...existingConv,
        participantIds: JSON.parse(existingConv.participantIds ?? "[]"),
        participantNames: JSON.parse(existingConv.participantNames ?? "[]"),
        lastMessageAt: existingConv.lastMessageAt?.toISOString() ?? null,
      },
      isNew: false,
    });
    return;
  }

  const greeting = `Hi ${creatorName}! We are interested in collaborating with you${campaignTitle ? ` for "${campaignTitle}"` : ""}. ${budget ? `Budget: ₹${(budget / 100000).toFixed(1)}L.` : ""} Looking forward to working with you!`;

  const [conv] = await db
    .insert(conversationsTable)
    .values({
      participantIds: JSON.stringify([1, creatorId]),
      participantNames: JSON.stringify([brandName, creatorName]),
      campaignTitle,
      unreadCount: 0,
      lastMessage: greeting,
      lastMessageAt: new Date(),
    })
    .returning();

  await db.insert(messagesTable).values({
    conversationId: conv.id,
    senderId: 1,
    senderName: brandName,
    content: greeting,
  });

  res.status(201).json({
    conversation: {
      ...conv,
      participantIds: JSON.parse(conv.participantIds),
      participantNames: JSON.parse(conv.participantNames),
      lastMessageAt: conv.lastMessageAt?.toISOString() ?? null,
    },
    isNew: true,
  });
});

router.get("/messages", async (req, res): Promise<void> => {
  const query = ListMessagesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const msgs = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, query.data.conversationId))
    .orderBy(messagesTable.createdAt);
  res.json(msgs.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })));
});

router.post("/messages", async (req, res): Promise<void> => {
  const body = SendMessageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const reqBody = req.body as Record<string, unknown>;
  const senderNameRaw = typeof reqBody.senderName === "string" ? reqBody.senderName : "Raj Kumar";

  const [msg] = await db
    .insert(messagesTable)
    .values({
      conversationId: body.data.conversationId,
      senderId: body.data.senderId,
      senderName: senderNameRaw,
      content: body.data.content,
    })
    .returning();

  await db
    .update(conversationsTable)
    .set({
      lastMessage: body.data.content,
      lastMessageAt: new Date(),
      unreadCount: 0,
    })
    .where(eq(conversationsTable.id, body.data.conversationId));

  res.status(201).json({ ...msg, createdAt: msg.createdAt.toISOString() });
});

export default router;

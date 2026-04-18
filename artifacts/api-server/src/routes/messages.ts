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
  const conversations = await db.select().from(conversationsTable);
  const parsed = conversations.map((c) => ({
    ...c,
    participantIds: JSON.parse(c.participantIds ?? "[]"),
    participantNames: JSON.parse(c.participantNames ?? "[]"),
    lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
  }));
  res.json(parsed);
});

router.post("/conversations", async (req, res): Promise<void> => {
  const body = CreateConversationBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [conv] = await db
    .insert(conversationsTable)
    .values({
      participantIds: JSON.stringify(body.data.participantIds),
      participantNames: JSON.stringify([]),
      campaignId: body.data.campaignId ?? null,
      unreadCount: 0,
    })
    .returning();
  res.status(201).json({
    ...conv,
    participantIds: JSON.parse(conv.participantIds),
    participantNames: JSON.parse(conv.participantNames),
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
    .where(eq(messagesTable.conversationId, query.data.conversationId));
  res.json(msgs);
});

router.post("/messages", async (req, res): Promise<void> => {
  const body = SendMessageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [msg] = await db
    .insert(messagesTable)
    .values({
      conversationId: body.data.conversationId,
      senderId: body.data.senderId,
      senderName: "User",
      content: body.data.content,
    })
    .returning();

  await db
    .update(conversationsTable)
    .set({
      lastMessage: body.data.content,
      lastMessageAt: new Date(),
    })
    .where(eq(conversationsTable.id, body.data.conversationId));

  res.status(201).json(msg);
});

export default router;

import { AppLayout } from "@/components/layout/AppLayout";
import { useListConversations, useListMessages, useSendMessage } from "@workspace/api-client-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Send, MessageSquare, Circle, Paperclip, MoreVertical, CheckCheck } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface OptimisticMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
  pending?: boolean;
}

function formatMsgTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

export default function Messages({ initialConvId }: { initialConvId?: number }) {
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const convFromUrl = search.get("conv") ? Number(search.get("conv")) : null;
  const [activeConvId, setActiveConvId] = useState<number | null>(initialConvId ?? convFromUrl);
  const [message, setMessage] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: conversations, isLoading: convsLoading, refetch: refetchConvs } = useListConversations({
    query: { refetchInterval: 3000 }
  });

  useEffect(() => {
    if (conversations?.length && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  const { data: serverMessages, isLoading: msgsLoading, refetch } = useListMessages(
    { conversationId: activeConvId! },
    { query: { enabled: !!activeConvId, refetchInterval: 2000 } }
  );

  const sendMessage = useSendMessage();

  // Merge server messages with optimistic ones (deduplicate by content+senderId)
  const messages = useCallback(() => {
    if (!serverMessages) return optimisticMessages.filter(m => m.conversationId === activeConvId);
    const serverIds = new Set(serverMessages.map(m => `${m.senderId}-${m.content}-${m.createdAt.toString().slice(0, 16)}`));
    const pending = optimisticMessages.filter(m =>
      m.conversationId === activeConvId &&
      !serverIds.has(`${m.senderId}-${m.content}-${m.createdAt.slice(0, 16)}`)
    );
    return [...serverMessages, ...pending] as OptimisticMessage[];
  }, [serverMessages, optimisticMessages, activeConvId])();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Clear optimistic messages when server messages catch up
  useEffect(() => {
    if (!serverMessages || serverMessages.length === 0) return;
    setOptimisticMessages(prev => prev.filter(m => {
      const serverIds = new Set(serverMessages.map(s => `${s.senderId}-${s.content}`));
      return !serverIds.has(`${m.senderId}-${m.content}`);
    }));
  }, [serverMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeConvId) return;

    const content = message.trim();
    setMessage("");

    // Optimistic update — show message immediately
    const optimistic: OptimisticMessage = {
      id: Date.now(),
      conversationId: activeConvId,
      senderId: 1,
      senderName: "Raj Kumar",
      content,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setOptimisticMessages(prev => [...prev, optimistic]);

    sendMessage.mutate(
      { data: { conversationId: activeConvId, senderId: 1, content } },
      {
        onSuccess: () => {
          refetch();
          refetchConvs();
        },
        onError: () => {
          setOptimisticMessages(prev => prev.filter(m => m.id !== optimistic.id));
          setMessage(content);
        }
      }
    );
  };

  const filteredConvs = conversations?.filter(c =>
    !searchQ ||
    c.participantNames.some(n => n.toLowerCase().includes(searchQ.toLowerCase())) ||
    c.campaignTitle?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const activeConv = conversations?.find(c => c.id === activeConvId);

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-7rem)]">
        <div className="mb-4 shrink-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Messages</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time communication with creators and brands.</p>
        </div>

        <Card className="flex-1 flex overflow-hidden bg-card border-border/60 min-h-0">
          {/* Conversation list */}
          <div className="w-full lg:w-72 xl:w-80 border-r border-border/60 flex flex-col shrink-0">
            <div className="p-3 border-b border-border/60">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-8 h-8 text-sm bg-muted/50 border-border/60"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {convsLoading ? (
                <div className="p-3 space-y-3">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConvs?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs mt-1 opacity-60">Hire a creator to start chatting</p>
                </div>
              ) : (
                filteredConvs?.map(conv => {
                  const other = conv.participantNames[1] || conv.participantNames[0] || "Creator";
                  const isActive = activeConvId === conv.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      className={`w-full text-left p-3 border-b border-border/40 transition-colors hover:bg-accent/60 flex items-start gap-3
                        ${isActive ? "bg-accent/80 border-l-2 border-l-primary" : ""}
                      `}
                    >
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                          {other.charAt(0)}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-card" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="text-sm font-semibold text-foreground truncate">{other}</span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                            {conv.lastMessageAt ? formatMsgTime(conv.lastMessageAt as string) : ""}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conv.lastMessage || "Start a conversation"}</p>
                        {conv.campaignTitle && (
                          <Badge variant="outline" className="mt-1 text-[10px] h-4 border-border/60 text-muted-foreground truncate max-w-full">
                            {conv.campaignTitle}
                          </Badge>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="hidden lg:flex flex-col flex-1 min-w-0">
            {activeConvId ? (
              <>
                {/* Chat header */}
                <div className="h-14 border-b border-border/60 flex items-center px-4 bg-card/50 backdrop-blur-sm shrink-0">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {(activeConv?.participantNames[1] || "C").charAt(0)}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-card" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{activeConv?.participantNames[1] || "Creator"}</span>
                        <Circle className="w-1.5 h-1.5 fill-emerald-400 text-emerald-400" />
                        <span className="text-xs text-emerald-400">Online</span>
                      </div>
                      {activeConv?.campaignTitle && (
                        <p className="text-xs text-muted-foreground truncate">Re: {activeConv.campaignTitle}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreVertical className="w-4 h-4" /></Button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                  {msgsLoading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-sm">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {messages.map((msg) => {
                        const isMe = msg.senderId === 1;
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className={`flex max-w-[75%] gap-2 ${isMe ? "self-end flex-row-reverse" : "self-start"}`}
                          >
                            {!isMe && (
                              <div className="w-7 h-7 rounded-full bg-accent border border-border flex items-center justify-center text-xs font-bold text-foreground shrink-0 mt-auto">
                                {msg.senderName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                                isMe
                                  ? `bg-primary text-primary-foreground rounded-br-sm ${(msg as OptimisticMessage).pending ? "opacity-70" : ""}`
                                  : "bg-accent text-foreground rounded-bl-sm border border-border/60"
                              }`}>
                                {msg.content}
                              </div>
                              <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                                <p className="text-[10px] text-muted-foreground">
                                  {format(new Date(msg.createdAt), "h:mm a")}
                                </p>
                                {isMe && !((msg as OptimisticMessage).pending) && (
                                  <CheckCheck className="w-3 h-3 text-primary opacity-70" />
                                )}
                                {isMe && (msg as OptimisticMessage).pending && (
                                  <div className="w-2.5 h-2.5 border border-muted-foreground border-t-transparent rounded-full animate-spin opacity-50" />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-border/60 bg-card/50 backdrop-blur-sm shrink-0">
                  <form onSubmit={handleSend} className="flex gap-2 items-center">
                    <Button variant="ghost" size="icon" type="button" className="h-9 w-9 text-muted-foreground shrink-0">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      ref={inputRef}
                      placeholder="Type a message..."
                      className="flex-1 h-9 text-sm bg-muted/50 border-border/60 focus-visible:ring-primary"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend(e as unknown as React.FormEvent)}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="h-9 w-9 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40"
                      disabled={!message.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                <h3 className="text-base font-medium text-foreground mb-1">Your Messages</h3>
                <p className="text-sm">Select a conversation or hire a creator to chat</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

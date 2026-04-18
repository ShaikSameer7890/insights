import { AppLayout } from "@/components/layout/AppLayout";
import { useListConversations, useListMessages, useSendMessage } from "@workspace/api-client-react";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Send, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export default function Messages() {
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: convsLoading } = useListConversations();
  
  // Set initial active conversation
  useEffect(() => {
    if (conversations?.length && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  const { data: messages, isLoading: msgsLoading, refetch } = useListMessages(
    { conversationId: activeConvId! },
    { query: { enabled: !!activeConvId } }
  );

  const sendMessage = useSendMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeConvId) return;

    sendMessage.mutate(
      {
        data: {
          conversationId: activeConvId,
          senderId: 1, // Mock current user ID
          content: message
        }
      },
      {
        onSuccess: () => {
          setMessage("");
          refetch();
        }
      }
    );
  };

  const activeConv = conversations?.find(c => c.id === activeConvId);

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-6rem)]">
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-1">Communicate with creators and manage campaign logistics.</p>
        </div>

        <Card className="flex-1 flex overflow-hidden border-emerald-500/20 bg-white/60 backdrop-blur shadow-sm">
          {/* Sidebar */}
          <div className="w-full md:w-80 border-r border-emerald-100 flex flex-col bg-white/40">
            <div className="p-4 border-b border-emerald-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search messages..." className="pl-9 bg-white border-emerald-200" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {convsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 border-b border-emerald-50 flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))
              ) : conversations?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                conversations?.map((conv) => {
                  const otherParticipant = conv.participantNames[1] || conv.participantNames[0];
                  return (
                    <div 
                      key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      className={`p-4 border-b border-emerald-50 cursor-pointer transition-colors hover:bg-emerald-50 flex items-start gap-3
                        ${activeConvId === conv.id ? 'bg-emerald-100/50 border-l-4 border-l-emerald-500' : ''}
                      `}
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-200 flex-shrink-0 flex items-center justify-center text-emerald-800 font-bold">
                        {otherParticipant.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-semibold text-sm truncate">{otherParticipant}</h4>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                            {conv.lastMessageAt ? format(new Date(conv.lastMessageAt), 'MMM d') : ''}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conv.lastMessage || 'Start a conversation'}</p>
                        {conv.campaignTitle && (
                          <div className="text-[10px] text-emerald-600 mt-1 bg-emerald-50 inline-block px-1.5 rounded truncate max-w-full">
                            {conv.campaignTitle}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="hidden md:flex flex-col flex-1 bg-white/20">
            {activeConvId ? (
              <>
                <div className="h-16 border-b border-emerald-100 flex items-center px-6 bg-white/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-800 font-bold">
                      {(activeConv?.participantNames[1] || 'C').charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{activeConv?.participantNames[1] || 'Creator'}</h3>
                      {activeConv?.campaignTitle && (
                        <p className="text-xs text-emerald-700">Re: {activeConv.campaignTitle}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                  {msgsLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    </div>
                  ) : messages?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                      <p>Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages?.map((msg) => {
                      const isMe = msg.senderId === 1; // Mock current user ID
                      return (
                        <div key={msg.id} className={`flex max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                          {!isMe && (
                            <div className="w-8 h-8 rounded-full bg-emerald-200 flex-shrink-0 flex items-center justify-center text-emerald-800 font-bold mr-2 mt-auto">
                              {msg.senderName.charAt(0)}
                            </div>
                          )}
                          <div className={`px-4 py-2 rounded-2xl ${
                            isMe 
                              ? 'bg-emerald-600 text-white rounded-br-none' 
                              : 'bg-white border border-emerald-100 text-foreground rounded-bl-none shadow-sm'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-emerald-100' : 'text-muted-foreground'}`}>
                              {format(new Date(msg.createdAt), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-emerald-100 bg-white/50">
                  <form onSubmit={handleSend} className="flex gap-2">
                    <Input 
                      placeholder="Type your message..." 
                      className="flex-1 border-emerald-200 focus-visible:ring-emerald-500 bg-white"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button type="submit" disabled={!message.trim() || sendMessage.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-xl font-medium text-foreground mb-2">Your Messages</h3>
                <p>Select a conversation from the sidebar to view messages.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

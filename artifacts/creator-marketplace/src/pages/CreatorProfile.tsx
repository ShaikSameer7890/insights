import { AppLayout } from "@/components/layout/AppLayout";
import { useGetCreator, useGetCreatorAnalytics } from "@workspace/api-client-react";
import { useParams, Link, useLocation as useWouterLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { MapPin, Globe, Mail, Star, Users, Activity, TrendingUp, CheckCircle2, ArrowLeft, MessageCircle, Handshake, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const formatINR = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
};

export default function CreatorProfile() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [, navigate] = useWouterLocation();
  const [hiringState, setHiringState] = useState<"idle" | "loading" | "done">("idle");
  const [messagingState, setMessagingState] = useState<"idle" | "loading">("idle");

  const { data: creator, isLoading: creatorLoading } = useGetCreator(id, { query: { enabled: !!id } });
  const { data: analytics, isLoading: analyticsLoading } = useGetCreatorAnalytics(id, { query: { enabled: !!id } });

  const handleHire = async () => {
    if (!creator || hiringState !== "idle") return;
    setHiringState("loading");
    try {
      const res = await fetch("/api/hire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: creator.id,
          creatorName: creator.name,
          brandName: "Raj Kumar (BrandCo)",
          budget: Math.round((creator.followers / 1000) * 83 * 0.8),
          campaignTitle: "Brand Collaboration",
        }),
      });
      const data = await res.json() as { conversation: { id: number } };
      setHiringState("done");
      setTimeout(() => navigate(`/messages?conv=${data.conversation.id}`), 400);
    } catch {
      setHiringState("idle");
    }
  };

  const handleMessage = async () => {
    if (!creator || messagingState !== "idle") return;
    setMessagingState("loading");
    try {
      const res = await fetch("/api/hire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: creator.id,
          creatorName: creator.name,
          brandName: "Raj Kumar (BrandCo)",
          campaignTitle: "General Inquiry",
        }),
      });
      const data = await res.json() as { conversation: { id: number } };
      navigate(`/messages?conv=${data.conversation.id}`);
    } catch {
      setMessagingState("idle");
    }
  };

  if (creatorLoading) return (
    <AppLayout>
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid lg:grid-cols-3 gap-4">
          <Skeleton className="h-80 rounded-xl" />
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-60 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    </AppLayout>
  );

  if (!creator) return <AppLayout><div className="py-12 text-center text-muted-foreground">Creator not found</div></AppLayout>;

  const aiScore = (creator as typeof creator & { aiScore?: number }).aiScore ?? Math.min(99,
    Math.round(0.4 * Math.min(creator.engagementRate * 8, 40) + 0.3 * 25 + 0.3 * Math.min((creator.rating ?? 0) * 6, 30))
  );

  const estimatedRate = formatINR(Math.round((creator.followers / 1000) * 83 * 0.8));

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        {/* Back */}
        <div className="flex items-center gap-3">
          <Link href="/creators">
            <Button variant="outline" size="icon" className="h-8 w-8 border-border/60 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">Back to Creators</p>
        </div>

        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden bg-card border-border/60">
            <div className="h-28 md:h-40 relative" style={{
              background: `linear-gradient(135deg, hsl(${(id * 47) % 360} 40% 12%) 0%, hsl(${(id * 47 + 80) % 360} 35% 8%) 100%)`
            }}>
              <div className="absolute -bottom-10 left-5 md:left-8 w-20 h-20 rounded-full border-2 border-border bg-card flex items-center justify-center text-primary text-2xl font-bold overflow-hidden shadow-lg">
                {creator.avatarUrl
                  ? <img src={creator.avatarUrl} alt={creator.name} className="w-full h-full object-cover" />
                  : creator.name.charAt(0)
                }
              </div>
              <div className="absolute bottom-3 right-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-white/20 bg-black/30 text-white hover:bg-white/10 backdrop-blur gap-1.5"
                  onClick={handleMessage}
                  disabled={messagingState !== "idle"}
                >
                  {messagingState === "loading" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
                  Message
                </Button>
                <Button
                  size="sm"
                  className={`h-8 text-xs gap-1.5 transition-all ${
                    hiringState === "done"
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
                  onClick={handleHire}
                  disabled={hiringState !== "idle"}
                >
                  {hiringState === "loading" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : hiringState === "done" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Handshake className="w-3.5 h-3.5" />
                  )}
                  {hiringState === "done" ? "Hired!" : "Hire Creator"}
                </Button>
              </div>
            </div>

            <div className="pt-14 pb-5 px-5 md:px-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h1 className="text-xl font-bold text-foreground">{creator.name}</h1>
                    {creator.isVerified && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">@{creator.username}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {creator.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{creator.location}</span>}
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{creator.platform}</span>
                    <span className="flex items-center gap-1 text-amber-400"><Star className="w-3 h-3 fill-amber-400" />{creator.rating || "4.9"} Rating</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                    {creator.bio || `${creator.name} is a top creator in the ${creator.category} space, known for high-quality content and authentic audience engagement across India.`}
                  </p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <div className="flex flex-col items-center justify-center w-20 h-20 rounded-xl border border-amber-500/30 bg-amber-500/10">
                    <div className="text-2xl font-bold text-amber-400">{aiScore}</div>
                    <div className="text-[10px] text-muted-foreground text-center leading-tight">AI Score</div>
                  </div>
                  <div className="flex flex-col items-center justify-center w-20 h-20 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                    <div className="text-base font-bold text-emerald-400">{estimatedRate}</div>
                    <div className="text-[10px] text-muted-foreground text-center leading-tight">Est. Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Stats sidebar */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            <Card className="bg-card border-border/60">
              <CardHeader><CardTitle className="text-sm font-semibold">Key Metrics</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Users, label: "Total Followers", value: creator.followers.toLocaleString("en-IN"), color: "bg-amber-500/15 text-amber-400" },
                  { icon: Activity, label: "Engagement Rate", value: `${creator.engagementRate}%`, color: "bg-emerald-500/15 text-emerald-400" },
                  { icon: TrendingUp, label: "Campaigns Done", value: creator.campaignsCompleted ?? 12, color: "bg-violet-500/15 text-violet-400" },
                  { icon: Mail, label: "Avg. Earnings", value: formatINR(analytics?.avgEarningsPerCampaign ?? 85000), color: "bg-sky-500/15 text-sky-400" },
                ].map(m => (
                  <div key={m.label} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.color} shrink-0`}>
                      <m.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-foreground">{m.value}</div>
                      <div className="text-xs text-muted-foreground">{m.label}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader><CardTitle className="text-sm font-semibold">Tags & Niches</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">{creator.category}</Badge>
                  {["Sponsored Content", "Product Reviews", "UGC", creator.platform, "Brand Deals"].map(t => (
                    <Badge key={t} variant="outline" className="text-xs border-border/60 text-muted-foreground">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hire CTA card */}
            <Card className="bg-primary/8 border-primary/20">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-foreground mb-1">Ready to collaborate?</p>
                <p className="text-xs text-muted-foreground mb-3">Estimated rate: <span className="text-amber-400 font-semibold">{estimatedRate}</span> per campaign</p>
                <Button
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="sm"
                  onClick={handleHire}
                  disabled={hiringState !== "idle"}
                >
                  {hiringState === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Handshake className="w-4 h-4" />}
                  {hiringState === "done" ? "Opening chat..." : "Hire & Start Chat"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main charts area */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-4">
            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Audience Growth</CardTitle>
                <CardDescription className="text-xs">Follower growth over months (in thousands)</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? <Skeleton className="h-48 w-full rounded-xl" /> : (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics?.followerGrowth || []}>
                        <defs>
                          <linearGradient id="follGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "hsl(210 14% 55%)", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(210 14% 55%)", fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                        <Tooltip contentStyle={{ background: "hsl(222 22% 11%)", border: "1px solid hsl(222 18% 18%)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${(v / 1000).toFixed(1)}K`, "Followers"]} />
                        <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#follGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Monthly Earnings (₹)</CardTitle>
                <CardDescription className="text-xs">Campaign earnings over time in INR</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? <Skeleton className="h-40 w-full rounded-xl" /> : (
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics?.earningsByMonth || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "hsl(210 14% 55%)", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(210 14% 55%)", fontSize: 11 }} tickFormatter={v => formatINR(v)} />
                        <Tooltip contentStyle={{ background: "hsl(222 22% 11%)", border: "1px solid hsl(222 18% 18%)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [formatINR(v), "Earnings"]} />
                        <Bar dataKey="value" fill="#34d399" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}

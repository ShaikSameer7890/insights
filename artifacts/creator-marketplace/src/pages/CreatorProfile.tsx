import { AppLayout } from "@/components/layout/AppLayout";
import { useGetCreator, useGetCreatorAnalytics } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MapPin, Globe, Mail, Star, Users, Activity, TrendingUp, CheckCircle2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function CreatorProfile() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data: creator, isLoading: creatorLoading } = useGetCreator(id, { query: { enabled: !!id } });
  const { data: analytics, isLoading: analyticsLoading } = useGetCreatorAnalytics(id, { query: { enabled: !!id } });

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
                <Button variant="outline" size="sm" className="h-8 text-xs border-white/20 bg-black/30 text-white hover:bg-white/10 backdrop-blur gap-1.5">
                  <Mail className="w-3.5 h-3.5" />Message
                </Button>
                <Button size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5">
                  Hire Creator
                </Button>
              </div>
            </div>

            <div className="pt-14 pb-5 px-5 md:px-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h1 className="text-xl font-bold text-foreground">{creator.name}</h1>
                    {creator.isVerified && <CheckCircle2 className="w-4.5 h-4.5 text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">@{creator.username}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {creator.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{creator.location}</span>}
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{creator.platform}</span>
                    <span className="flex items-center gap-1 text-amber-400"><Star className="w-3 h-3 fill-amber-400" />{creator.rating || "4.9"} Rating</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                    {creator.bio || `${creator.name} is a top creator in the ${creator.category} space, known for high-quality content and authentic audience engagement.`}
                  </p>
                </div>
                <div className="shrink-0">
                  <div className="flex flex-col items-center justify-center w-20 h-20 rounded-xl border border-amber-500/30 bg-amber-500/10">
                    <div className="text-2xl font-bold text-amber-400">{creator.aiScore ?? 98}</div>
                    <div className="text-[10px] text-muted-foreground text-center leading-tight">AI Score</div>
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
              <CardHeader><CardTitle className="text-sm font-semibold">Tags & Categories</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">{creator.category}</Badge>
                  {["Sponsored Content", "Product Reviews", "UGC", creator.platform].map(t => (
                    <Badge key={t} variant="outline" className="text-xs border-border/60 text-muted-foreground">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main charts area */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-4">
            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Audience Growth</CardTitle>
                <CardDescription className="text-xs">Follower growth over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? <Skeleton className="h-52 w-full rounded-xl" /> : (
                  <div className="h-52">
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
                        <Tooltip contentStyle={{ background: "hsl(222 22% 11%)", border: "1px solid hsl(222 18% 18%)", borderRadius: 8, fontSize: 12 }} />
                        <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#follGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Recent Campaigns</CardTitle>
                <CardDescription className="text-xs">Brands {creator.name} has worked with</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/40">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-muted-foreground text-xs font-bold shrink-0">B{i}</div>
                        <div>
                          <div className="text-sm font-medium text-foreground">Brand Campaign {i}</div>
                          <div className="text-xs text-muted-foreground">{creator.category} Promotion</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">Completed</Badge>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{i} month{i > 1 ? "s" : ""} ago</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}

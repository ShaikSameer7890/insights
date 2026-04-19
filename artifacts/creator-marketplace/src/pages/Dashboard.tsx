import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDashboardStats, useGetTopCreators, useGetCategoryBreakdown } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, IndianRupee, TrendingUp, Activity, ArrowUpRight, Zap, Building2, MapPin, Handshake, Brain, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";

const CHART_COLORS = ["#f59e0b", "#34d399", "#a78bfa", "#60a5fa", "#f87171", "#fb923c"];

const sparklineData = [
  { v: 42 }, { v: 48 }, { v: 45 }, { v: 60 }, { v: 55 }, { v: 72 }, { v: 68 }, { v: 80 }, { v: 75 }, { v: 90 }
];

const formatINR = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
};

function StatCard({ title, value, sub, icon: Icon, color, delay, trend }: {
  title: string; value?: string | number; sub?: string;
  icon: React.ElementType; color: string; delay: number; trend?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <Card className="bg-card border-border/60 hover:border-border transition-colors overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <ArrowUpRight className="w-3 h-3" />
              {trend || "+12%"}
            </div>
          </div>
          <div>
            {value === undefined ? (
              <Skeleton className="h-7 w-28 mb-1" />
            ) : (
              <div className="text-2xl font-bold text-foreground tracking-tight">{value}</div>
            )}
            <div className="text-xs text-muted-foreground mt-0.5">{title}</div>
            {sub && <div className="text-xs text-muted-foreground mt-1 opacity-60">{sub}</div>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface DashboardStats {
  totalCreators: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalPaymentsVolume: number;
  avgEngagementRate: number;
  topCategories: { category: string; count: number; percentage: number }[];
  recentActivity: { id: number; type: string; description: string; timestamp: string }[];
  recentHires: { id: number; creatorName: string; campaignTitle: string; amount: number; hiredAt: string }[];
  companiesHiring: { name: string; sector: string; logo: string; city: string; hiring: number; budget: string }[];
}

const AI_SUGGESTIONS = [
  {
    id: 1,
    title: "Launch a tech-focused micro-campaign",
    reason: "Tech creators in Bengaluru have 34% higher engagement this month",
    action: "Browse Tech Creators",
    href: "/creators?category=Tech",
    color: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    icon: Brain,
  },
  {
    id: 2,
    title: "Boost with lifestyle creators for Diwali",
    reason: "Festival season campaigns drive 2.4× more conversions in Fashion & Lifestyle",
    action: "Find Lifestyle Creators",
    href: "/creators?category=Lifestyle",
    color: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    icon: Zap,
  },
  {
    id: 3,
    title: "Re-engage your top performer",
    reason: "Your previous campaign creator had 9.2% engagement — above platform avg",
    action: "View Profile",
    href: "/creators",
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    icon: TrendingUp,
  },
];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { refetchInterval: 15000 } });
  const { data: topCreators, isLoading: creatorsLoading } = useGetTopCreators({ limit: 5 });
  const { data: categoryBreakdown, isLoading: breakdownLoading } = useGetCategoryBreakdown();
  const [, navigate] = useLocation();

  const dashStats = stats as unknown as DashboardStats | undefined;

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Good morning, Raj</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {format(new Date(), "EEEE, MMMM d yyyy")} — Platform is healthy
            </p>
          </div>
          <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 gap-1.5">
            <Zap className="w-3 h-3" /> Live
          </Badge>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Creators" value={statsLoading ? undefined : dashStats?.totalCreators.toLocaleString("en-IN")} sub="Verified Indian profiles" icon={Users} color="bg-amber-500/15 text-amber-400" delay={0} trend="+8%" />
          <StatCard title="Active Campaigns" value={statsLoading ? undefined : dashStats?.activeCampaigns} sub={`of ${dashStats?.totalCampaigns ?? "—"} total`} icon={Briefcase} color="bg-violet-500/15 text-violet-400" delay={0.05} trend="+18%" />
          <StatCard title="Total Volume" value={statsLoading ? undefined : formatINR((dashStats?.totalPaymentsVolume ?? 0) * 83)} sub="Lifetime payouts (INR)" icon={IndianRupee} color="bg-emerald-500/15 text-emerald-400" delay={0.1} trend="+24%" />
          <StatCard title="Avg Engagement" value={statsLoading ? undefined : `${dashStats?.avgEngagementRate ?? 0}%`} sub="Across all creators" icon={Activity} color="bg-sky-500/15 text-sky-400" delay={0.15} trend="+2.1%" />
        </div>

        {/* Activity sparkline */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-card border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Platform Activity (last 10 days)</CardTitle>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2} fill="url(#sparkGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Two column: Top creators + Category breakdown */}
        <div className="grid gap-4 lg:grid-cols-5">
          {/* Top AI creators */}
          <motion.div className="lg:col-span-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="bg-card border-border/60 h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Top AI-Ranked Creators</CardTitle>
                  <Link href="/creators" className="text-xs text-primary hover:underline">View all</Link>
                </div>
              </CardHeader>
              <CardContent>
                {creatorsLoading ? (
                  <div className="space-y-3">{[0,1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
                ) : (
                  <div className="space-y-1">
                    {topCreators?.map((creator, i) => (
                      <Link href={`/creators/${creator.id}`} key={creator.id}>
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/60 transition-colors cursor-pointer group"
                        >
                          <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground text-xs font-bold shrink-0">
                            #{i + 1}
                          </div>
                          <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {creator.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{creator.name}</div>
                            <div className="text-xs text-muted-foreground">{creator.category} · {creator.followers.toLocaleString("en-IN")} followers</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold text-amber-400">{(creator as typeof creator & { aiScore?: number }).aiScore ?? 85}<span className="text-xs text-muted-foreground font-normal">/100</span></div>
                            <div className="text-[10px] text-muted-foreground">AI Score</div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Category breakdown */}
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-card border-border/60 h-full">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {breakdownLoading ? (
                  <Skeleton className="h-52 w-full rounded-xl" />
                ) : (
                  <>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={4} dataKey="count" nameKey="category">
                            {categoryBreakdown?.map((_, index) => (
                              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: "hsl(222 22% 11%)", border: "1px solid hsl(222 18% 18%)", borderRadius: 8, fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2">
                      {categoryBreakdown?.map((cat, i) => (
                        <div key={cat.category} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                          {cat.category}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Companies Hiring in India */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
          <Card className="bg-card border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    Companies Actively Hiring Creators in India
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Real-time brand activity across Indian markets</p>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[0,1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                  {(dashStats?.companiesHiring || []).slice(0, 8).map((company, i) => (
                    <motion.div
                      key={company.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-3 rounded-xl border border-border/50 bg-accent/20 hover:border-primary/30 hover:bg-accent/40 transition-all cursor-pointer group"
                      onClick={() => navigate("/campaigns")}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                          {company.logo}
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] px-1.5 py-0">
                          {company.hiring} open
                        </Badge>
                      </div>
                      <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{company.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{company.sector}</div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{company.city}</span>
                      </div>
                      <div className="text-[10px] text-amber-400 font-medium mt-1">{company.budget}/campaign</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Suggestions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-400" />
                AI-Powered Suggestions for You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                {AI_SUGGESTIONS.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={`p-4 rounded-xl border ${s.color} bg-opacity-10`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <s.icon className="w-4 h-4 mt-0.5 shrink-0" />
                      <p className="text-sm font-medium text-foreground leading-snug">{s.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{s.reason}</p>
                    <Link href={s.href}>
                      <Button size="sm" variant="outline" className="h-7 text-xs border-current opacity-70 hover:opacity-100 gap-1">
                        {s.action} <ArrowUpRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent hires + activity in 2 columns */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Recent Hires */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
            <Card className="bg-card border-border/60 h-full">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-amber-400" />
                  Recent Hires
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="space-y-3">{[0,1,2].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
                ) : (dashStats?.recentHires?.length ?? 0) === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Handshake className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No hires yet</p>
                    <p className="text-xs opacity-60 mt-1">Hire a creator to see them here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dashStats?.recentHires?.map((hire, i) => (
                      <motion.div
                        key={hire.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-accent/20 border border-border/40"
                      >
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                          {hire.creatorName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">{hire.creatorName}</div>
                          <div className="text-xs text-muted-foreground truncate">{hire.campaignTitle}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold text-amber-400">{formatINR(hire.amount * 83)}</div>
                          <div className="text-[10px] text-muted-foreground">{format(new Date(hire.hiredAt), "d MMM")}</div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
            <Card className="bg-card border-border/60 h-full">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="space-y-3">{[0,1,2].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
                ) : (
                  <div className="space-y-1">
                    {dashStats?.recentActivity?.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent/40 transition-colors"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                          item.type === "hire" ? "bg-emerald-400" :
                          item.type === "payment" ? "bg-amber-400" :
                          item.type === "campaign" ? "bg-violet-400" : "bg-sky-400"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{item.description}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(item.timestamp), "MMM d, h:mm a")}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0 border-border/60 text-muted-foreground capitalize">
                          {item.type}
                        </Badge>
                      </motion.div>
                    ))}
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

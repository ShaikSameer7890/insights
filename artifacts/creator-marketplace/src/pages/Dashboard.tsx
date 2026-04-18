import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDashboardStats, useGetTopCreators, useGetCategoryBreakdown } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, IndianRupee, TrendingUp, Activity, ArrowUpRight, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const CHART_COLORS = ["#f59e0b", "#34d399", "#a78bfa", "#60a5fa", "#f87171", "#fb923c"];

const sparklineData = [
  { v: 42 }, { v: 48 }, { v: 45 }, { v: 60 }, { v: 55 }, { v: 72 }, { v: 68 }, { v: 80 }, { v: 75 }, { v: 90 }
];

function StatCard({ title, value, sub, icon: Icon, color, delay }: {
  title: string; value?: string | number; sub?: string;
  icon: React.ElementType; color: string; delay: number;
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
              +12%
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

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: topCreators, isLoading: creatorsLoading } = useGetTopCreators({ limit: 6 });
  const { data: categoryBreakdown, isLoading: breakdownLoading } = useGetCategoryBreakdown();

  const formatINR = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

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
          <StatCard
            title="Total Creators"
            value={statsLoading ? undefined : stats?.totalCreators.toLocaleString("en-IN")}
            sub="Verified profiles"
            icon={Users}
            color="bg-amber-500/15 text-amber-400"
            delay={0}
          />
          <StatCard
            title="Active Campaigns"
            value={statsLoading ? undefined : stats?.activeCampaigns}
            sub={`of ${stats?.totalCampaigns ?? "—"} total`}
            icon={Briefcase}
            color="bg-violet-500/15 text-violet-400"
            delay={0.05}
          />
          <StatCard
            title="Total Volume"
            value={statsLoading ? undefined : formatINR((stats?.totalPaymentsVolume ?? 0) * 83)}
            sub="Lifetime payouts"
            icon={IndianRupee}
            color="bg-emerald-500/15 text-emerald-400"
            delay={0.1}
          />
          <StatCard
            title="Avg Engagement"
            value={statsLoading ? undefined : `${stats?.avgEngagementRate ?? 0}%`}
            sub="Across all creators"
            icon={Activity}
            color="bg-sky-500/15 text-sky-400"
            delay={0.15}
          />
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
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {creator.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{creator.name}</div>
                            <div className="text-xs text-muted-foreground">{creator.category} · {creator.followers.toLocaleString("en-IN")} followers</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold text-amber-400">{creator.aiScore}<span className="text-xs text-muted-foreground font-normal">/100</span></div>
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
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={4} dataKey="count" nameKey="category">
                            {categoryBreakdown?.map((_, index) => (
                              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: "hsl(222 22% 11%)", border: "1px solid hsl(222 18% 18%)", borderRadius: 8, fontSize: 12 }}
                            labelStyle={{ color: "hsl(210 18% 90%)" }}
                          />
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

        {/* Recent activity */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">{[0,1,2].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : (
                <div className="space-y-1">
                  {stats?.recentActivity?.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent/40 transition-colors"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
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
    </AppLayout>
  );
}

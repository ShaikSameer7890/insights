import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDashboardStats, useGetCategoryBreakdown } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, IndianRupee, Users, BarChart3, Zap } from "lucide-react";
import Chart3DBar from "@/components/charts/Chart3DBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CHART_COLORS = ["#f59e0b", "#34d399", "#a78bfa", "#60a5fa", "#f87171", "#fb923c"];

const roiTrend = [
  { month: "Oct", revenue: 280000, spend: 120000, roi: 2.3 },
  { month: "Nov", revenue: 390000, spend: 145000, roi: 2.7 },
  { month: "Dec", revenue: 320000, spend: 130000, roi: 2.5 },
  { month: "Jan", revenue: 510000, spend: 160000, roi: 3.2 },
  { month: "Feb", revenue: 460000, spend: 155000, roi: 3.0 },
  { month: "Mar", revenue: 680000, spend: 180000, roi: 3.8 },
  { month: "Apr", revenue: 620000, spend: 170000, roi: 3.6 },
];

const radarData = [
  { subject: "Reach", A: 85, fullMark: 100 },
  { subject: "Engagement", A: 92, fullMark: 100 },
  { subject: "Conversion", A: 67, fullMark: 100 },
  { subject: "Brand Safety", A: 88, fullMark: 100 },
  { subject: "Cost Efficiency", A: 74, fullMark: 100 },
  { subject: "Content Quality", A: 91, fullMark: 100 },
];

const engagementByPlatform = [
  { label: "YouTube", value: 8.2, displayValue: "8.2%", color: "#f87171" },
  { label: "Instagram", value: 6.5, displayValue: "6.5%", color: "#fb923c" },
  { label: "TikTok", value: 12.1, displayValue: "12.1%", color: "#34d399" },
  { label: "Twitch", value: 11.3, displayValue: "11.3%", color: "#a78bfa" },
];

const campaignsByCategory = [
  { label: "Tech", value: 6, displayValue: "6 campaigns", color: "#60a5fa" },
  { label: "Fashion", value: 9, displayValue: "9 campaigns", color: "#f59e0b" },
  { label: "Fitness", value: 7, displayValue: "7 campaigns", color: "#34d399" },
  { label: "Gaming", value: 5, displayValue: "5 campaigns", color: "#a78bfa" },
  { label: "Food", value: 4, displayValue: "4 campaigns", color: "#f87171" },
  { label: "Travel", value: 3, displayValue: "3 campaigns", color: "#fb923c" },
];

const earningsByCategory = [
  { label: "Fashion", value: 8200000, displayValue: "₹82L", color: "#f59e0b" },
  { label: "Tech", value: 6500000, displayValue: "₹65L", color: "#60a5fa" },
  { label: "Gaming", value: 5800000, displayValue: "₹58L", color: "#a78bfa" },
  { label: "Fitness", value: 4200000, displayValue: "₹42L", color: "#34d399" },
  { label: "Food", value: 2800000, displayValue: "₹28L", color: "#f87171" },
];

function formatINR(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export default function Analytics() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: categoryBreakdown, isLoading: breakdownLoading } = useGetCategoryBreakdown();

  const kpis = [
    { label: "Creators Onboarded", value: statsLoading ? null : stats?.totalCreators.toLocaleString("en-IN"), icon: Users, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Total Campaigns", value: statsLoading ? null : stats?.totalCampaigns, icon: BarChart3, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Avg Engagement", value: statsLoading ? null : `${stats?.avgEngagementRate ?? 0}%`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Creator Payouts", value: statsLoading ? null : formatINR((stats?.totalPaymentsVolume ?? 0) * 83), icon: IndianRupee, color: "text-sky-400", bg: "bg-sky-500/10" },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Platform Analytics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Real-time performance metrics and 3D visual insights</p>
          </div>
          <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 gap-1.5">
            <Zap className="w-3 h-3" /> Live Data
          </Badge>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="bg-card border-border/60">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.bg}`}>
                    <k.icon className={`w-4.5 h-4.5 ${k.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    {k.value === null ? <Skeleton className="h-5 w-16 mt-0.5" /> : (
                      <p className="text-lg font-bold text-foreground">{k.value}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 3D Charts Showcase */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="bg-card border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Interactive 3D Analytics</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Drag to rotate · Scroll to zoom · Hover bars for details</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs border-violet-500/40 text-violet-400 bg-violet-500/10">3D</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="engagement">
                <TabsList className="mb-4 bg-muted/60 h-8">
                  <TabsTrigger value="engagement" className="text-xs h-7">Engagement by Platform</TabsTrigger>
                  <TabsTrigger value="campaigns" className="text-xs h-7">Campaigns by Category</TabsTrigger>
                  <TabsTrigger value="earnings" className="text-xs h-7">Earnings by Category</TabsTrigger>
                </TabsList>
                <TabsContent value="engagement">
                  <Chart3DBar data={engagementByPlatform} height={380} />
                </TabsContent>
                <TabsContent value="campaigns">
                  <Chart3DBar data={campaignsByCategory} height={380} />
                </TabsContent>
                <TabsContent value="earnings">
                  <Chart3DBar data={earningsByCategory} height={380} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* 2-col: ROI trend + Category pie */}
        <div className="grid gap-4 lg:grid-cols-3">
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-card border-border/60 h-full">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Revenue vs Spend (₹)</CardTitle>
                <CardDescription className="text-xs">Monthly campaign investment and returns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={roiTrend}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(210 14% 55%)" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(210 14% 55%)" }} tickFormatter={v => formatINR(v)} />
                      <Tooltip
                        contentStyle={{ background: "hsl(222 22% 11%)", border: "1px solid hsl(222 18% 18%)", borderRadius: 8, fontSize: 12 }}
                        formatter={(v: number, name: string) => [formatINR(v), name === "revenue" ? "Revenue" : "Spend"]}
                      />
                      <Area type="monotone" dataKey="revenue" name="revenue" stroke="#f59e0b" strokeWidth={2} fill="url(#revGrad)" />
                      <Area type="monotone" dataKey="spend" name="spend" stroke="#a78bfa" strokeWidth={2} fill="url(#spendGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="bg-card border-border/60 h-full">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Creator Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {breakdownLoading ? <Skeleton className="h-52 w-full rounded-xl" /> : (
                  <>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryBreakdown} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="count" nameKey="category"
                            label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                            labelLine={false}
                          >
                            {categoryBreakdown?.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: "hsl(222 22% 11%)", border: "1px solid hsl(222 18% 18%)", borderRadius: 8, fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
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

        {/* Radar chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Platform Performance Score</CardTitle>
              <CardDescription className="text-xs">Composite score across key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(210 14% 55%)", fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(210 14% 40%)", fontSize: 10 }} />
                    <Radar name="Platform" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ background: "hsl(222 22% 11%)", border: "1px solid hsl(222 18% 18%)", borderRadius: 8, fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}

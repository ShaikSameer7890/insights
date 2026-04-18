import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDashboardStats, useGetTopCreators, useGetCategoryBreakdown } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, DollarSign, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: topCreators, isLoading: creatorsLoading } = useGetTopCreators({ limit: 5 });
  const { data: categoryBreakdown, isLoading: breakdownLoading } = useGetCategoryBreakdown();

  const COLORS = ['#10b981', '#059669', '#34d399', '#047857', '#064e3b'];

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening today.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Creators" 
            value={stats?.totalCreators} 
            icon={<Users className="w-4 h-4 text-emerald-500" />} 
            loading={statsLoading} 
          />
          <StatCard 
            title="Active Campaigns" 
            value={stats?.activeCampaigns} 
            icon={<Briefcase className="w-4 h-4 text-emerald-500" />} 
            loading={statsLoading} 
          />
          <StatCard 
            title="Total Volume" 
            value={stats ? `$${(stats.totalPaymentsVolume / 1000).toFixed(1)}k` : undefined} 
            icon={<DollarSign className="w-4 h-4 text-emerald-500" />} 
            loading={statsLoading} 
          />
          <StatCard 
            title="Avg Engagement" 
            value={stats ? `${stats.avgEngagementRate}%` : undefined} 
            icon={<Activity className="w-4 h-4 text-emerald-500" />} 
            loading={statsLoading} 
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4 bg-white/50 backdrop-blur border-emerald-500/20 shadow-sm">
            <CardHeader>
              <CardTitle>Top AI-Ranked Creators</CardTitle>
            </CardHeader>
            <CardContent>
              {creatorsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {topCreators?.map((creator, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={creator.id} 
                      className="flex items-center justify-between p-2 hover:bg-emerald-500/5 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                          {creator.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{creator.name}</div>
                          <div className="text-xs text-muted-foreground">{creator.category} • {creator.followers.toLocaleString()} followers</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-600">{creator.aiScore}/100</div>
                          <div className="text-xs text-muted-foreground">AI Score</div>
                        </div>
                        <Link href={`/creators/${creator.id}`} className="text-xs text-primary hover:underline">View</Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 bg-white/50 backdrop-blur border-emerald-500/20 shadow-sm">
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {breakdownLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="category"
                      >
                        {categoryBreakdown?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#065f46', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {categoryBreakdown?.slice(0, 4).map((cat, i) => (
                  <div key={cat.category} className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{cat.category}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, icon, loading }: { title: string, value?: string | number, icon: React.ReactNode, loading: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className="bg-white/50 backdrop-blur border-emerald-500/20 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="p-2 bg-emerald-100 rounded-full">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-bold text-foreground">{value}</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

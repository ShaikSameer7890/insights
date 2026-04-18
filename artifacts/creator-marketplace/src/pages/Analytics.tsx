import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDashboardStats, useGetCategoryBreakdown } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Analytics() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: categoryBreakdown, isLoading: breakdownLoading } = useGetCategoryBreakdown();

  const COLORS = ['#10b981', '#059669', '#34d399', '#047857', '#064e3b', '#022c22'];

  // Mock data for the bar chart
  const performanceData = [
    { name: 'Jan', campaigns: 4, roi: 2.4 },
    { name: 'Feb', campaigns: 6, roi: 3.1 },
    { name: 'Mar', campaigns: 5, roi: 2.8 },
    { name: 'Apr', campaigns: 8, roi: 4.2 },
    { name: 'May', campaigns: 12, roi: 5.1 },
    { name: 'Jun', campaigns: 9, roi: 4.8 },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into platform performance and creator metrics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="h-full border-emerald-500/20 bg-white/60 backdrop-blur shadow-sm">
              <CardHeader>
                <CardTitle>Creator Categories</CardTitle>
                <CardDescription>Distribution of creators across niches</CardDescription>
              </CardHeader>
              <CardContent>
                {breakdownLoading ? (
                  <Skeleton className="w-full h-[300px]" />
                ) : (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {categoryBreakdown?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-full border-emerald-500/20 bg-white/60 backdrop-blur shadow-sm">
              <CardHeader>
                <CardTitle>Campaign ROI Trend</CardTitle>
                <CardDescription>Average return on investment over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={performanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" orientation="left" stroke="#059669" axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" stroke="#0f766e" axisLine={false} tickLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #d1fae5', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="campaigns" name="Campaigns" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="roi" name="Avg ROI (x)" fill="#047857" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Card className="border-emerald-500/20 bg-white/60 backdrop-blur shadow-sm">
          <CardHeader>
            <CardTitle>Platform Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col justify-center items-center text-center">
                  <div className="text-3xl font-bold text-emerald-700">{stats?.totalCreators.toLocaleString()}</div>
                  <div className="text-sm font-medium text-emerald-800/70 mt-1">Vetted Creators</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col justify-center items-center text-center">
                  <div className="text-3xl font-bold text-emerald-700">{stats?.totalCampaigns.toLocaleString()}</div>
                  <div className="text-sm font-medium text-emerald-800/70 mt-1">Campaigns Launched</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col justify-center items-center text-center">
                  <div className="text-3xl font-bold text-emerald-700">{stats?.avgEngagementRate}%</div>
                  <div className="text-sm font-medium text-emerald-800/70 mt-1">Platform Avg Engagement</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col justify-center items-center text-center">
                  <div className="text-3xl font-bold text-emerald-700">${(stats?.totalPaymentsVolume! / 1000000).toFixed(2)}M</div>
                  <div className="text-sm font-medium text-emerald-800/70 mt-1">Total Creator Payouts</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

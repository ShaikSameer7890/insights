import { AppLayout } from "@/components/layout/AppLayout";
import { useGetCreator, useGetCreatorAnalytics } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MapPin, Globe, Mail, Star, Users, Activity, TrendingUp, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function CreatorProfile() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  
  const { data: creator, isLoading: creatorLoading } = useGetCreator(id, { 
    query: { enabled: !!id } 
  });
  
  const { data: analytics, isLoading: analyticsLoading } = useGetCreatorAnalytics(id, {
    query: { enabled: !!id }
  });

  if (creatorLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-96 w-full lg:col-span-2 rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!creator) return <AppLayout><div>Creator not found</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border-emerald-500/20 bg-white/60 backdrop-blur">
            <div className="h-32 md:h-48 bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-500 relative">
              <div className="absolute -bottom-16 left-6 md:left-10 w-32 h-32 rounded-full border-4 border-background bg-emerald-100 flex items-center justify-center text-4xl font-bold text-emerald-800 shadow-xl overflow-hidden">
                {creator.avatarUrl ? (
                  <img src={creator.avatarUrl} alt={creator.name} className="w-full h-full object-cover" />
                ) : (
                  creator.name.charAt(0)
                )}
              </div>
              <div className="absolute bottom-4 right-6 flex gap-2">
                <Button className="bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200">
                  <Mail className="w-4 h-4 mr-2" /> Message
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Hire Creator
                </Button>
              </div>
            </div>
            
            <div className="pt-20 pb-8 px-6 md:px-10">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold text-foreground">{creator.name}</h1>
                    {creator.isVerified && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                  </div>
                  <p className="text-lg text-muted-foreground mb-4">@{creator.username}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {creator.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" /> {creator.platform}
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 font-medium">
                      <Star className="w-4 h-4 fill-emerald-600" /> {creator.rating || '4.9'} Rating
                    </div>
                  </div>
                  
                  <p className="max-w-3xl text-foreground/80 leading-relaxed">
                    {creator.bio || `${creator.name} is a top creator in the ${creator.category} space, known for high-quality content and authentic audience engagement.`}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <Card className="bg-emerald-50/50 border-emerald-100 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="font-semibold text-emerald-800">AI Match Score</div>
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                        98
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Sidebar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
            <Card className="border-emerald-500/20 bg-white/60 backdrop-blur">
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{creator.followers.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Followers</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{creator.engagementRate}%</div>
                    <div className="text-sm text-muted-foreground">Avg. Engagement Rate</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{creator.campaignsCompleted || 12}</div>
                    <div className="text-sm text-muted-foreground">Campaigns Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 bg-white/60 backdrop-blur">
              <CardHeader>
                <CardTitle>Tags & Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">{creator.category}</Badge>
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700">Sponsored Content</Badge>
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700">Product Reviews</Badge>
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700">UGC</Badge>
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700">{creator.platform}</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Area */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-6">
            <Card className="border-emerald-500/20 bg-white/60 backdrop-blur">
              <CardHeader>
                <CardTitle>Audience Growth</CardTitle>
                <CardDescription>Follower growth over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Skeleton className="w-full h-[300px]" />
                ) : (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics?.followerGrowth || []}>
                        <defs>
                          <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="label" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#6b7280', fontSize: 12 }} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                          tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid #d1fae5', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorFollowers)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 bg-white/60 backdrop-blur">
              <CardHeader>
                <CardTitle>Recent Campaigns</CardTitle>
                <CardDescription>Brands {creator.name} has worked with</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-emerald-100 rounded-lg hover:bg-emerald-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold border">
                          B{i}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">Brand Campaign {i}</div>
                          <div className="text-sm text-muted-foreground">{creator.category} Promotion</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none mb-1">Completed</Badge>
                        <div className="text-xs text-muted-foreground text-right">{i} month{i>1?'s':''} ago</div>
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

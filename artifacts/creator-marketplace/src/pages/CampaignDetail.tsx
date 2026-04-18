import { AppLayout } from "@/components/layout/AppLayout";
import { useGetCampaign, useGetRecommendedCreators, useListApplications, useUpdateApplication } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, DollarSign, Users, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListApplicationsQueryKey } from "@workspace/api-client-react";

export default function CampaignDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: campaign, isLoading: campaignLoading } = useGetCampaign(id, { 
    query: { enabled: !!id } 
  });
  
  const { data: recommended, isLoading: recommendedLoading } = useGetRecommendedCreators(id, {
    query: { enabled: !!id }
  });

  const { data: applications, isLoading: appsLoading } = useListApplications({ campaignId: id }, {
    query: { enabled: !!id }
  });

  const updateApplication = useUpdateApplication();

  const handleUpdateStatus = (appId: number, status: 'accepted' | 'rejected') => {
    updateApplication.mutate({
      id: appId,
      data: { status }
    }, {
      onSuccess: () => {
        toast({
          title: `Application ${status}`,
          description: `Creator has been notified.`,
        });
        queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey({ campaignId: id }) });
      }
    });
  };

  if (campaignLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!campaign) return <AppLayout><div>Campaign not found</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/campaigns">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-emerald-200 text-emerald-800 hover:bg-emerald-50">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{campaign.title}</h1>
            <Badge className={
              campaign.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-none' : 
              campaign.status === 'draft' ? 'bg-gray-100 text-gray-800 border-none' : 
              'bg-blue-100 text-blue-800 border-none'
            }>
              {campaign.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-emerald-500/20 bg-white/60 backdrop-blur shadow-sm">
              <CardHeader>
                <CardTitle>Campaign Brief</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose max-w-none text-foreground/80">
                  <p>{campaign.description}</p>
                </div>
                
                {campaign.deliverables && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Deliverables</h3>
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 text-emerald-900">
                      {campaign.deliverables}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="recommended" className="w-full">
              <TabsList className="w-full grid grid-cols-2 bg-emerald-50 p-1">
                <TabsTrigger value="recommended" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700">
                  <Sparkles className="w-4 h-4 mr-2" /> AI Recommended
                </TabsTrigger>
                <TabsTrigger value="applicants" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700">
                  <Users className="w-4 h-4 mr-2" /> Applicants ({applications?.length || 0})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="recommended" className="mt-6 space-y-4">
                {recommendedLoading ? (
                  Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
                ) : recommended?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed border-emerald-200">
                    No recommendations available yet. Our AI is analyzing profiles.
                  </div>
                ) : (
                  recommended?.map((creator, i) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1 }} key={creator.id}>
                      <Card className="border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
                        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-4 w-full">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center text-emerald-800 text-xl font-bold">
                              {creator.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg truncate">{creator.name}</h3>
                                <Badge className="bg-emerald-100 text-emerald-800 border-none">
                                  {creator.aiScore}/100 Match
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">@{creator.username} • {creator.followers.toLocaleString()} followers</p>
                              {creator.matchReason && (
                                <p className="text-xs text-emerald-700 mt-1 line-clamp-1 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> {creator.matchReason}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Link href={`/creators/${creator.id}`}>
                              <Button variant="outline" className="border-emerald-200 text-emerald-800 w-full sm:w-auto">View</Button>
                            </Link>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">Invite</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="applicants" className="mt-6 space-y-4">
                {appsLoading ? (
                  Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
                ) : applications?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed border-emerald-200 bg-white/50">
                    No applications received yet.
                  </div>
                ) : (
                  applications?.map((app, i) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1 }} key={app.id}>
                      <Card className={`border-emerald-500/20 ${app.status === 'accepted' ? 'border-emerald-500 bg-emerald-50/30' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
                                {app.creatorName?.charAt(0) || 'C'}
                              </div>
                              <div>
                                <h3 className="font-bold">{app.creatorName}</h3>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  Applied {format(new Date(app.createdAt), 'MMM d, yyyy')}
                                  <Badge variant="outline" className={
                                    app.status === 'accepted' ? 'border-emerald-500 text-emerald-700' :
                                    app.status === 'rejected' ? 'border-red-200 text-red-700' :
                                    'border-yellow-500 text-yellow-700'
                                  }>
                                    {app.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="font-semibold text-emerald-800">
                              Proposed: ${app.proposedRate?.toLocaleString() || campaign.budget.toLocaleString()}
                            </div>
                          </div>
                          
                          {app.pitch && (
                            <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 italic border-l-4 border-emerald-300 mb-4">
                              "{app.pitch}"
                            </div>
                          )}
                          
                          {app.status === 'pending' && (
                            <div className="flex gap-2 justify-end mt-2">
                              <Button 
                                variant="outline" 
                                className="border-red-200 text-red-700 hover:bg-red-50"
                                onClick={() => handleUpdateStatus(app.id, 'rejected')}
                                disabled={updateApplication.isPending}
                              >
                                <XCircle className="w-4 h-4 mr-2" /> Reject
                              </Button>
                              <Button 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => handleUpdateStatus(app.id, 'accepted')}
                                disabled={updateApplication.isPending}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Accept & Hire
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <Card className="border-emerald-500/20 bg-white/60 backdrop-blur shadow-sm">
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="w-4 h-4 mr-2" /> Budget
                  </div>
                  <div className="font-bold text-emerald-800">${campaign.budget.toLocaleString()}</div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" /> Deadline
                  </div>
                  <div className="font-medium">
                    {campaign.deadline ? format(new Date(campaign.deadline), 'MMM d, yyyy') : 'Open'}
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                  <div className="flex items-center text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" /> Min Followers
                  </div>
                  <div className="font-medium">
                    {campaign.requiredFollowers ? `${(campaign.requiredFollowers/1000).toFixed(0)}k+` : 'Any'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

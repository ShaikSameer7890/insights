import { AppLayout } from "@/components/layout/AppLayout";
import { useGetCampaign, useGetRecommendedCreators, useListApplications, useUpdateApplication } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, IndianRupee, Users, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListApplicationsQueryKey } from "@workspace/api-client-react";

function statusStyle(s: string) {
  if (s === "active") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (s === "draft") return "bg-muted text-muted-foreground border-border/60";
  return "bg-sky-500/15 text-sky-400 border-sky-500/30";
}

export default function CampaignDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: campaign, isLoading: campaignLoading } = useGetCampaign(id, { query: { enabled: !!id } });
  const { data: recommended, isLoading: recommendedLoading } = useGetRecommendedCreators(id, { query: { enabled: !!id } });
  const { data: applications, isLoading: appsLoading } = useListApplications({ campaignId: id }, { query: { enabled: !!id } });
  const updateApplication = useUpdateApplication();

  const handleUpdateStatus = (appId: number, status: "accepted" | "rejected") => {
    updateApplication.mutate({ id: appId, data: { status } }, {
      onSuccess: () => {
        toast({ title: `Application ${status}`, description: "Creator has been notified." });
        queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey({ campaignId: id }) });
      },
    });
  };

  if (campaignLoading) return (
    <AppLayout>
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </AppLayout>
  );

  if (!campaign) return <AppLayout><div className="text-muted-foreground py-12 text-center">Campaign not found</div></AppLayout>;

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        {/* Back + title */}
        <div className="flex items-center gap-3">
          <Link href="/campaigns">
            <Button variant="outline" size="icon" className="h-8 w-8 border-border/60 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">{campaign.title}</h1>
            <Badge className={`text-[10px] ${statusStyle(campaign.status)}`}>{campaign.status.toUpperCase()}</Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Campaign Brief</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{campaign.description}</p>
                {campaign.deliverables && (
                  <div>
                    <div className="text-xs font-semibold text-foreground mb-2">Deliverables</div>
                    <div className="bg-muted/40 border border-border/60 rounded-lg p-3 text-sm text-muted-foreground">
                      {campaign.deliverables}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="recommended">
              <TabsList className="bg-muted/60 h-9 mb-4">
                <TabsTrigger value="recommended" className="text-xs gap-1.5 h-7">
                  <Sparkles className="w-3.5 h-3.5" />AI Recommended
                </TabsTrigger>
                <TabsTrigger value="applicants" className="text-xs gap-1.5 h-7">
                  <Users className="w-3.5 h-3.5" />Applicants ({applications?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recommended" className="space-y-3">
                {recommendedLoading ? (
                  [0,1,2].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
                ) : recommended?.length === 0 ? (
                  <div className="text-center py-12 text-sm text-muted-foreground border border-dashed border-border/60 rounded-xl">
                    No recommendations yet. AI is analyzing creator profiles.
                  </div>
                ) : recommended?.map((creator, i) => (
                  <motion.div key={creator.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card className="bg-card border-border/60 hover:border-primary/30 transition-colors">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {creator.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-semibold text-sm text-foreground truncate">{creator.name}</span>
                              <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px]">{creator.aiScore}/100</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">@{creator.username} · {creator.followers.toLocaleString("en-IN")} followers</p>
                            {creator.matchReason && (
                              <p className="text-[10px] text-amber-400/80 mt-0.5 flex items-center gap-1 truncate">
                                <Sparkles className="w-2.5 h-2.5 shrink-0" />{creator.matchReason}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Link href={`/creators/${creator.id}`}>
                            <Button variant="outline" size="sm" className="border-border/60 h-7 text-xs">View</Button>
                          </Link>
                          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground h-7 text-xs">Invite</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="applicants" className="space-y-3">
                {appsLoading ? (
                  [0,1].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
                ) : applications?.length === 0 ? (
                  <div className="text-center py-12 text-sm text-muted-foreground border border-dashed border-border/60 rounded-xl">
                    No applications received yet.
                  </div>
                ) : applications?.map((app, i) => (
                  <motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card className={`bg-card border-border/60 ${app.status === "accepted" ? "border-emerald-500/30" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                              {app.creatorName?.charAt(0) || "C"}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-foreground">{app.creatorName}</div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                Applied {format(new Date(app.createdAt), "MMM d, yyyy")}
                                <Badge variant="outline" className={`text-[10px] ${
                                  app.status === "accepted" ? "border-emerald-500/40 text-emerald-400" :
                                  app.status === "rejected" ? "border-red-500/40 text-red-400" :
                                  "border-amber-500/40 text-amber-400"
                                }`}>{app.status}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-amber-400">₹{((app.proposedRate ?? campaign.budget) * 83).toLocaleString("en-IN")}</div>
                        </div>
                        {app.pitch && (
                          <div className="bg-muted/30 border-l-2 border-primary/40 rounded pl-3 pr-2 py-2 text-xs text-muted-foreground italic mb-3">
                            "{app.pitch}"
                          </div>
                        )}
                        {app.status === "pending" && (
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-7 text-xs gap-1"
                              onClick={() => handleUpdateStatus(app.id, "rejected")} disabled={updateApplication.isPending}>
                              <XCircle className="w-3.5 h-3.5" />Reject
                            </Button>
                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground h-7 text-xs gap-1"
                              onClick={() => handleUpdateStatus(app.id, "accepted")} disabled={updateApplication.isPending}>
                              <CheckCircle2 className="w-3.5 h-3.5" />Accept & Hire
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="bg-card border-border/60">
              <CardHeader><CardTitle className="text-sm font-semibold">Campaign Details</CardTitle></CardHeader>
              <CardContent className="space-y-0 divide-y divide-border/40">
                {[
                  { icon: IndianRupee, label: "Budget", value: `₹${(campaign.budget * 83).toLocaleString("en-IN")}`, color: "text-amber-400" },
                  { icon: Calendar, label: "Deadline", value: campaign.deadline ? format(new Date(campaign.deadline), "MMM d, yyyy") : "Open" },
                  { icon: Users, label: "Min. Followers", value: campaign.requiredFollowers ? `${(campaign.requiredFollowers / 1000).toFixed(0)}K+` : "Any" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <item.icon className="w-3.5 h-3.5" />{item.label}
                    </div>
                    <div className={`text-sm font-semibold ${item.color || "text-foreground"}`}>{item.value}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Badge variant="outline" className="w-full justify-center py-2 text-xs border-border/60 text-muted-foreground capitalize">
              Category: {campaign.category}
            </Badge>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

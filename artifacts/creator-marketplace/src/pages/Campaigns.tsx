import { AppLayout } from "@/components/layout/AppLayout";
import { useListCampaigns } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Plus, Calendar, IndianRupee, Users, Target } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

function statusStyle(s: string) {
  if (s === "active") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (s === "draft") return "bg-muted text-muted-foreground border-border/60";
  if (s === "completed") return "bg-sky-500/15 text-sky-400 border-sky-500/30";
  return "bg-amber-500/15 text-amber-400 border-amber-500/30";
}

export default function Campaigns() {
  const { data: campaigns, isLoading } = useListCampaigns();

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Campaigns</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your influencer marketing campaigns.</p>
          </div>
          <Link href="/campaigns/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 text-sm gap-1.5 shadow-md shadow-amber-500/10">
              <Plus className="w-4 h-4" />New Campaign
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-card border-border/60 overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent><Skeleton className="h-16 w-full" /></CardContent>
              </Card>
            ))
          ) : campaigns?.length === 0 ? (
            <div className="col-span-full py-20 text-center rounded-xl border border-dashed border-border/60 bg-muted/10">
              <div className="w-14 h-14 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">No campaigns yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-5">Create your first campaign to start matching with creators.</p>
              <Link href="/campaigns/new">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 text-sm">Create Campaign</Button>
              </Link>
            </div>
          ) : (
            campaigns?.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full flex flex-col bg-card border-border/60 hover:border-border transition-colors group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <Badge className={`text-[10px] ${statusStyle(c.status)}`}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-border/60 text-muted-foreground">{c.category}</Badge>
                    </div>
                    <CardTitle className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{c.title}</CardTitle>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{c.description}</p>
                  </CardHeader>

                  <CardContent className="flex-1 pb-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-semibold text-foreground">₹{(c.budget * 83).toLocaleString("en-IN")}</span>
                        <span className="text-xs">budget</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-3.5 h-3.5 text-violet-400" />
                        <span>{c.applicationsCount || 0} applications</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        <span>{c.deadline ? format(new Date(c.deadline), "MMM d, yyyy") : "No deadline"}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t border-border/40 pt-3">
                    <Link href={`/campaigns/${c.id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full border-border/60 text-sm h-8 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}

import { AppLayout } from "@/components/layout/AppLayout";
import { useListCampaigns } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Plus, Calendar, DollarSign, Users, Target } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Campaigns() {
  const { data: campaigns, isLoading } = useListCampaigns();

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-muted-foreground mt-1">Manage your active and upcoming influencer campaigns.</p>
          </div>
          <Link href="/campaigns/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto shadow-md">
              <Plus className="w-4 h-4 mr-2" /> New Campaign
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : campaigns?.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white/50 backdrop-blur rounded-xl border border-dashed border-emerald-200">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">Create your first campaign to start finding and matching with perfect creators for your brand.</p>
              <Link href="/campaigns/new">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                  Create Campaign
                </Button>
              </Link>
            </div>
          ) : (
            campaigns?.map((campaign, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={campaign.id}
              >
                <Card className="h-full flex flex-col bg-white/60 backdrop-blur border-emerald-500/20 hover:shadow-lg transition-all hover:border-emerald-500/40 group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={
                        campaign.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-none' : 
                        campaign.status === 'draft' ? 'bg-gray-100 text-gray-800 border-none' : 
                        'bg-blue-100 text-blue-800 border-none'
                      }>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50/50">
                        {campaign.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-emerald-700 transition-colors line-clamp-1">{campaign.title}</CardTitle>
                    <div className="text-sm text-muted-foreground line-clamp-2 mt-2 h-10">
                      {campaign.description}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-2">
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center text-sm text-foreground/80">
                        <DollarSign className="w-4 h-4 mr-2 text-emerald-600" />
                        <span className="font-semibold">${campaign.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-foreground/80">
                        <Users className="w-4 h-4 mr-2 text-emerald-600" />
                        <span>{campaign.applicationsCount || 0} Applications</span>
                      </div>
                      <div className="flex items-center text-sm text-foreground/80">
                        <Calendar className="w-4 h-4 mr-2 text-emerald-600" />
                        <span>{campaign.deadline ? format(new Date(campaign.deadline), 'MMM d, yyyy') : 'No deadline'}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-emerald-100/50">
                    <Link href={`/campaigns/${campaign.id}`} className="w-full">
                      <Button variant="outline" className="w-full border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
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

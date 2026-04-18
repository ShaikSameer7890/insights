import { AppLayout } from "@/components/layout/AppLayout";
import { useCreateCampaign } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, IndianRupee, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  budget: z.coerce.number().min(1000, "Budget must be at least ₹1,000"),
  requiredFollowers: z.coerce.number().min(0).optional(),
  deadline: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const inputClass = "h-9 text-sm bg-muted/50 border-border/60 focus-visible:ring-primary";

export default function NewCampaign() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createCampaign = useCreateCampaign();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      budget: 83000,
      requiredFollowers: 10000,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  });

  const onSubmit = (values: FormValues) => {
    createCampaign.mutate(
      {
        data: {
          brandId: 1,
          title: values.title,
          description: values.description,
          category: values.category,
          budget: Math.round(values.budget / 83),
          requiredFollowers: values.requiredFollowers,
          deadline: values.deadline ? new Date(values.deadline).toISOString() : undefined,
          platforms: ["Instagram", "TikTok"],
        },
      },
      {
        onSuccess: campaign => {
          toast({ title: "Campaign created", description: "Your campaign is live. AI matching has begun." });
          setLocation(`/campaigns/${campaign.id}`);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create campaign. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Link href="/campaigns">
            <Button variant="outline" size="icon" className="h-8 w-8 border-border/60 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Campaign</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Let AI match you with the perfect creators.</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card border-border/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">Campaign Details</CardTitle>
                <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                  <Sparkles className="w-3 h-3" /> AI Matching
                </span>
              </div>
              <CardDescription className="text-xs mt-0.5">Fill in the details below and our AI will recommend the best creators.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Campaign Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Collection Launch" className={inputClass} {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Campaign Brief</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your brand, goals, target audience, and what you're looking for in a creator..."
                          className="min-h-[100px] text-sm bg-muted/50 border-border/60 focus-visible:ring-primary resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={inputClass}>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover border-border/60">
                            <SelectItem value="Tech">Tech & Software</SelectItem>
                            <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                            <SelectItem value="Fashion">Fashion & Beauty</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Gaming">Gaming</SelectItem>
                            <SelectItem value="Food">Food & Beverage</SelectItem>
                            <SelectItem value="Travel">Travel</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="budget" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Total Budget (₹)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <IndianRupee className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input type="number" className={`${inputClass} pl-8`} {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="requiredFollowers" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Min. Followers Required</FormLabel>
                        <FormControl>
                          <Input type="number" className={inputClass} {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="deadline" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Application Deadline</FormLabel>
                        <FormControl>
                          <Input type="date" className={inputClass} {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
                    <Link href="/campaigns">
                      <Button type="button" variant="outline" size="sm" className="border-border/60 text-sm h-9">Cancel</Button>
                    </Link>
                    <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 text-sm px-5" disabled={createCampaign.isPending}>
                      {createCampaign.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                      Post Campaign
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}

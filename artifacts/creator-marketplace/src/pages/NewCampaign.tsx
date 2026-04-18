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
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  budget: z.coerce.number().min(100, "Budget must be at least $100"),
  requiredFollowers: z.coerce.number().min(0).optional(),
  deadline: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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
      budget: 1000,
      requiredFollowers: 10000,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    },
  });

  const onSubmit = (values: FormValues) => {
    createCampaign.mutate(
      {
        data: {
          brandId: 1, // Mock brand ID for now
          title: values.title,
          description: values.description,
          category: values.category,
          budget: values.budget,
          requiredFollowers: values.requiredFollowers,
          deadline: values.deadline ? new Date(values.deadline).toISOString() : undefined,
          platforms: ["Instagram", "TikTok"], // Defaulting for simplicity
        }
      },
      {
        onSuccess: (campaign) => {
          toast({
            title: "Campaign created",
            description: "Your campaign has been successfully created and AI matching has begun.",
            variant: "default",
          });
          setLocation(`/campaigns/${campaign.id}`);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to create campaign. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href="/campaigns">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-emerald-200 text-emerald-800 hover:bg-emerald-50">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
            <p className="text-muted-foreground mt-1">Post a new brief and let our AI find the perfect creators.</p>
          </div>
        </div>

        <Card className="border-emerald-500/20 bg-white/60 backdrop-blur shadow-md">
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Fill out the information below to start your campaign.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Collection Launch" className="border-emerald-200 focus-visible:ring-emerald-500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brief Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your brand, goals, and what you're looking for..." 
                          className="min-h-[120px] border-emerald-200 focus-visible:ring-emerald-500" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-emerald-200 focus-visible:ring-emerald-500">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Tech">Tech & Software</SelectItem>
                            <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                            <SelectItem value="Fashion">Fashion & Beauty</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Gaming">Gaming</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Budget ($)</FormLabel>
                        <FormControl>
                          <Input type="number" className="border-emerald-200 focus-visible:ring-emerald-500" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requiredFollowers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Followers Required</FormLabel>
                        <FormControl>
                          <Input type="number" className="border-emerald-200 focus-visible:ring-emerald-500" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Deadline</FormLabel>
                        <FormControl>
                          <Input type="date" className="border-emerald-200 focus-visible:ring-emerald-500" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-emerald-100">
                  <Link href="/campaigns">
                    <Button type="button" variant="outline" className="border-emerald-200 text-emerald-800">Cancel</Button>
                  </Link>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md" disabled={createCampaign.isPending}>
                    {createCampaign.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Post Campaign
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

import { AppLayout } from "@/components/layout/AppLayout";
import { useListCreators } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, Star, Users, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

export default function Creators() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: creators, isLoading } = useListCreators({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
  });

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Creators</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Discover AI-vetted talent for your next campaign.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search creators..."
                className="pl-8 h-9 w-48 lg:w-60 text-sm bg-muted/50 border-border/60"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 w-40 text-sm bg-muted/50 border-border/60">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/60">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Tech">Tech & Software</SelectItem>
                <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Fashion">Fashion</SelectItem>
                <SelectItem value="Gaming">Gaming</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="bg-card border-border/60 overflow-hidden">
                <div className="h-16 bg-muted/40 animate-pulse" />
                <CardContent className="p-4 pt-10 relative">
                  <div className="absolute -top-6 left-4 w-12 h-12 rounded-full bg-muted animate-pulse" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-3" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))
          ) : creators?.map((creator, i) => (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/creators/${creator.id}`}>
                <Card className="bg-card border-border/60 overflow-hidden cursor-pointer hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 group">
                  {/* Banner */}
                  <div className="h-16 bg-muted/30 relative" style={{
                    background: `linear-gradient(135deg, hsl(${(i * 47) % 360} 40% 14%) 0%, hsl(${(i * 47 + 60) % 360} 40% 10%) 100%)`
                  }}>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-black/40 text-amber-400 border-amber-500/30 backdrop-blur gap-1 text-[10px]">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        {creator.rating || "4.8"}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4 pt-8 relative">
                    {/* Avatar */}
                    <div className="absolute -top-6 left-4 w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center text-primary font-bold text-base">
                      {creator.name.charAt(0)}
                    </div>

                    <div className="mb-2">
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{creator.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">@{creator.username} · {creator.platform}</p>
                    </div>

                    <Badge variant="outline" className="text-[10px] border-border/60 text-muted-foreground mb-3">{creator.category}</Badge>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-border/40 pt-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span className="font-medium text-foreground">{creator.followers.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-medium text-foreground">{creator.engagementRate}%</span>
                      </div>
                    </div>

                    {/* AI score bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>AI Score</span>
                        <span className="text-amber-400 font-semibold">{creator.aiScore}/100</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${creator.aiScore}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}

          {!isLoading && creators?.length === 0 && (
            <div className="col-span-full py-16 text-center rounded-xl border border-dashed border-border/60 bg-muted/10">
              <Search className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-30" />
              <h3 className="text-base font-semibold text-foreground mb-1">No creators found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

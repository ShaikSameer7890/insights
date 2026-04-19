import { AppLayout } from "@/components/layout/AppLayout";
import { useListCreators } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, Star, Users, TrendingUp, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";

const INDIA_CITIES = [
  "all",
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Pune",
  "Chennai", "Kolkata", "Jaipur", "Ahmedabad", "Surat",
  "Lucknow", "Gurugram", "Noida", "Chandigarh", "Indore",
];

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "Tech", label: "Tech & Software" },
  { value: "Lifestyle", label: "Lifestyle" },
  { value: "Finance", label: "Finance" },
  { value: "Education", label: "Education" },
  { value: "Fashion", label: "Fashion" },
  { value: "Gaming", label: "Gaming" },
  { value: "Food", label: "Food & Cooking" },
  { value: "Travel", label: "Travel" },
  { value: "Fitness", label: "Fitness & Health" },
  { value: "Beauty", label: "Beauty" },
];

export default function Creators() {
  const urlSearch = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("search") || "" : "";
  const urlCategory = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("category") || "all" : "all";
  const [search, setSearch] = useState(urlSearch);
  const [category, setCategory] = useState(urlCategory);
  const [location, setLocation] = useState("all");
  const debouncedSearch = useDebounce(search, 350);

  const { data: allCreators, isLoading } = useListCreators({
    search: debouncedSearch || undefined,
    category: category !== "all" ? category : undefined,
  });

  const creators = location !== "all"
    ? allCreators?.filter(c => c.location?.toLowerCase().includes(location.toLowerCase()))
    : allCreators;

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Creators</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Discover AI-vetted talent across India.
              {!isLoading && creators !== undefined && (
                <span className="ml-1 text-amber-400 font-medium">{creators.length} found</span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                className="pl-8 h-9 w-44 lg:w-52 text-sm bg-muted/50 border-border/60"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Category filter */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 w-40 text-sm bg-muted/50 border-border/60">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/60">
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location filter */}
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="h-9 w-36 text-sm bg-muted/50 border-border/60">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="City" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/60">
                {INDIA_CITIES.map(city => (
                  <SelectItem key={city} value={city}>
                    {city === "all" ? "All India" : city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filters */}
        {(category !== "all" || location !== "all" || debouncedSearch) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Filters:</span>
            {debouncedSearch && (
              <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400 gap-1 cursor-pointer" onClick={() => setSearch("")}>
                "{debouncedSearch}" ✕
              </Badge>
            )}
            {category !== "all" && (
              <Badge variant="outline" className="text-xs border-border/60 text-muted-foreground gap-1 cursor-pointer" onClick={() => setCategory("all")}>
                {CATEGORIES.find(c => c.value === category)?.label} ✕
              </Badge>
            )}
            {location !== "all" && (
              <Badge variant="outline" className="text-xs border-border/60 text-muted-foreground gap-1 cursor-pointer" onClick={() => setLocation("all")}>
                <MapPin className="w-2.5 h-2.5" />{location} ✕
              </Badge>
            )}
          </div>
        )}

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
          ) : creators?.map((creator, i) => {
            const aiScore = (creator as typeof creator & { aiScore?: number }).aiScore ?? Math.min(99,
              Math.round(0.4 * Math.min(creator.engagementRate * 8, 40) + 0.3 * 20 + 0.3 * Math.min((creator.rating ?? 0) * 6, 30))
            );
            return (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <Link href={`/creators/${creator.id}`}>
                  <Card className="bg-card border-border/60 overflow-hidden cursor-pointer hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 group h-full">
                    {/* Banner */}
                    <div className="h-14 relative" style={{
                      background: `linear-gradient(135deg, hsl(${(i * 47) % 360} 40% 14%) 0%, hsl(${(i * 47 + 60) % 360} 40% 10%) 100%)`
                    }}>
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-black/40 text-amber-400 border-amber-500/30 backdrop-blur gap-1 text-[10px]">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />
                          {creator.rating?.toFixed(1) || "4.8"}
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

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <Badge variant="outline" className="text-[10px] border-border/60 text-muted-foreground">{creator.category}</Badge>
                        {creator.location && (
                          <Badge variant="outline" className="text-[10px] border-border/60 text-muted-foreground gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />{creator.location.split(",")[0]}
                          </Badge>
                        )}
                      </div>

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
                          <span className="text-amber-400 font-semibold">{aiScore}/100</span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${aiScore}%` }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}

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

import { AppLayout } from "@/components/layout/AppLayout";
import { useListCreators } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, Star } from "lucide-react";
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
    category: category !== "all" ? category : undefined
  });

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Creators</h1>
            <p className="text-muted-foreground mt-1">Discover top talent for your next campaign.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search creators..."
                className="pl-9 bg-white/50 backdrop-blur border-emerald-500/30"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white/50 border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Tech">Tech & Software</SelectItem>
                <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-24 bg-emerald-100 animate-pulse" />
                <CardContent className="p-5 pt-12 relative">
                  <div className="absolute -top-10 left-5 w-20 h-20 rounded-full bg-white p-1 border animate-pulse" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            creators?.map((creator, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={creator.id}
              >
                <Link href={`/creators/${creator.id}`}>
                  <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 bg-white/60 backdrop-blur border-emerald-500/20 group">
                    <div className="h-24 bg-gradient-to-r from-emerald-600 to-teal-500 relative">
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur border-none flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{creator.rating || "4.8"}</span>
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-5 pt-12 relative">
                      <div className="absolute -top-10 left-5 w-20 h-20 rounded-full bg-white p-1 shadow-md border-2 border-emerald-100 overflow-hidden">
                        <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-2xl font-bold">
                          {creator.name.charAt(0)}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-emerald-700 transition-colors truncate pr-2">{creator.name}</h3>
                        {/* {creator.isVerified && <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 px-1 py-0 h-5">✓</Badge>} */}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">@{creator.username} • {creator.platform}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="bg-emerald-50/50 border-emerald-200 text-emerald-800">
                          {creator.category}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm border-t border-emerald-100/50 pt-4">
                        <div>
                          <div className="text-muted-foreground text-xs">Followers</div>
                          <div className="font-semibold text-foreground">{creator.followers.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs">Engagement</div>
                          <div className="font-semibold text-foreground">{creator.engagementRate}%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
          
          {!isLoading && creators?.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold">No creators found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

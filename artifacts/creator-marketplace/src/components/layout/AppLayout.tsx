import { Sidebar } from "./Sidebar";
import { useLocation } from "wouter";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/creators": "Creators",
  "/campaigns": "Campaigns",
  "/messages": "Messages",
  "/payments": "Payments & Escrow",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const title = pageTitles[location] || pageTitles[Object.keys(pageTitles).find(k => k !== "/" && location.startsWith(k)) || "/"] || "Marketplace";

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-60 min-w-0">
        {/* Transparent sticky topbar */}
        <header className="sticky top-0 z-30 h-14 flex items-center gap-4 px-4 md:px-6 bg-background/70 backdrop-blur-xl border-b border-border/50">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground truncate">{title}</h2>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Quick search..."
                className="h-8 w-44 lg:w-60 pl-8 text-sm bg-muted/50 border-border/60 focus-visible:ring-primary"
              />
            </div>
          </div>
          <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
          </Button>
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            RK
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 pt-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

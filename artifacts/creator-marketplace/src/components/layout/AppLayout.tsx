import { Sidebar } from "./Sidebar";
import { useLocation } from "wouter";
import { Bell, Search, MessageSquare, Briefcase, Users, IndianRupee, Handshake, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/creators": "Creators",
  "/campaigns": "Campaigns",
  "/messages": "Messages",
  "/payments": "Payments & Escrow",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const notifIcon: Record<string, React.ReactNode> = {
  message: <MessageSquare className="w-3.5 h-3.5" />,
  campaign: <Briefcase className="w-3.5 h-3.5" />,
  payment: <IndianRupee className="w-3.5 h-3.5" />,
  creator: <Users className="w-3.5 h-3.5" />,
  hire: <Handshake className="w-3.5 h-3.5" />,
};

const notifColor: Record<string, string> = {
  message: "bg-sky-500/15 text-sky-400",
  campaign: "bg-violet-500/15 text-violet-400",
  payment: "bg-amber-500/15 text-amber-400",
  creator: "bg-emerald-500/15 text-emerald-400",
  hire: "bg-emerald-500/15 text-emerald-400",
};

function formatNotifTime(time: string) {
  const d = new Date(time);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return format(d, "MMM d");
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const title = pageTitles[location] || pageTitles[Object.keys(pageTitles).find(k => k !== "/" && location.startsWith(k)) || "/"] || "Marketplace";

  const [searchValue, setSearchValue] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifsRead, setNotifsRead] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/analytics/notifications");
        const data = await res.json() as Notification[];
        setNotifications(data);
      } catch {}
    };
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  // Close notif panel on outside click
  useEffect(() => {
    if (!showNotifs) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifs]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    navigate(`/creators?search=${encodeURIComponent(searchValue.trim())}`);
    setSearchValue("");
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-60 min-w-0">
        {/* Transparent sticky topbar */}
        <header className="sticky top-0 z-30 h-14 flex items-center gap-4 px-4 md:px-6 bg-background/70 backdrop-blur-xl border-b border-border/50">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground truncate">{title}</h2>
          </div>

          {/* Global search */}
          <div className="hidden sm:flex items-center gap-2">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search creators..."
                className="h-8 w-44 lg:w-56 pl-8 text-sm bg-muted/50 border-border/60 focus-visible:ring-primary"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
              />
            </form>
          </div>

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => { setShowNotifs(v => !v); setNotifsRead(true); }}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && !notifsRead && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Button>

            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-10 w-80 bg-card border border-border/60 rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                    <span className="text-sm font-semibold text-foreground">Notifications</span>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && <span className="text-[10px] text-primary font-medium">{unreadCount} new</span>}
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => setShowNotifs(false)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground text-sm">No notifications</div>
                    ) : notifications.map(n => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-border/40 hover:bg-accent/40 transition-colors cursor-pointer ${!n.read && !notifsRead ? "bg-primary/5" : ""}`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${notifColor[n.type] || "bg-muted/40 text-muted-foreground"}`}>
                          {notifIcon[n.type] || <Bell className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">{n.title}</p>
                          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{n.body}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatNotifTime(n.time)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 text-center">
                    <button className="text-xs text-primary hover:underline" onClick={() => setShowNotifs(false)}>View all activity</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold cursor-pointer">
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

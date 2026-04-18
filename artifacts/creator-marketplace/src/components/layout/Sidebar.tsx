import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  MessageSquare, 
  CreditCard, 
  BarChart3,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Creators", href: "/creators" },
  { icon: Briefcase, label: "Campaigns", href: "/campaigns" },
  { icon: MessageSquare, label: "Messages", href: "/messages" },
  { icon: CreditCard, label: "Payments", href: "/payments" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-50 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-xl">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white text-lg">AI</span>
          </div>
          CreatorMatch
        </div>
        <Button variant="ghost" size="icon" onClick={toggleMobile} className="text-white">
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={toggleMobile} />
      )}

      <div className={`
        fixed top-0 bottom-0 left-0 w-64 bg-sidebar border-r border-sidebar-border z-50
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        flex flex-col
      `}>
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border/50 justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-white text-sm">AI</span>
            </div>
            CreatorMatch
          </div>
          <Button variant="ghost" size="icon" onClick={toggleMobile} className="md:hidden text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-4">
            Menu
          </div>
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
                <div
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors
                    ${isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-white"
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : ""}`} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-sidebar-border/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-white">
              JD
            </div>
            <div className="flex-1 min-w-0 text-white">
              <div className="text-sm font-medium truncate">Jane Doe</div>
              <div className="text-xs text-sidebar-foreground/60 truncate">Acme Corp</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

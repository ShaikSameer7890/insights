import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Dashboard from "./pages/Dashboard";
import Creators from "./pages/Creators";
import CreatorProfile from "./pages/CreatorProfile";
import Campaigns from "./pages/Campaigns";
import NewCampaign from "./pages/NewCampaign";
import CampaignDetail from "./pages/CampaignDetail";
import Messages from "./pages/Messages";
import Payments from "./pages/Payments";
import Analytics from "./pages/Analytics";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/creators" component={Creators} />
      <Route path="/creators/:id" component={CreatorProfile} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/campaigns/new" component={NewCampaign} />
      <Route path="/campaigns/:id" component={CampaignDetail} />
      <Route path="/messages" component={Messages} />
      <Route path="/payments" component={Payments} />
      <Route path="/analytics" component={Analytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

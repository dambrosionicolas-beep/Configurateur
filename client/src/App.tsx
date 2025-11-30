import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Router, Route, Switch } from "wouter";
import IndustrySelection from "@/pages/industry-selection";
import HubSpotConnection from "@/pages/hubspot-connection";
import AIConfiguration from "@/pages/ai-configuration";
import ConfigurationDashboard from "@/pages/configuration-dashboard";
import Clients from "@/pages/clients";
import Templates from "@/pages/templates";
import NotFound from "@/pages/not-found";

export default function App() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Router>
            <SidebarProvider style={style as React.CSSProperties}>
              <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col flex-1">
                  <header className="flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <ThemeToggle />
                  </header>
                  <main className="flex-1 overflow-hidden">
                    <Switch>
                      <Route path="/" component={IndustrySelection} />
                      <Route path="/clients" component={Clients} />
                      <Route path="/templates" component={Templates} />
                      <Route path="/connect" component={HubSpotConnection} />
                      <Route path="/configure" component={AIConfiguration} />
                      <Route path="/ai-configuration" component={AIConfiguration} />
                      <Route path="/dashboard" component={ConfigurationDashboard} />
                      <Route component={NotFound} />
                    </Switch>
                  </main>
                </div>
              </div>
            </SidebarProvider>
          </Router>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

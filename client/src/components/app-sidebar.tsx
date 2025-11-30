import {
  Building2,
  FileText,
  LayoutDashboard,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Link, useLocation } from "wouter";

const menuItems = [
  {
    title: "Tableau de bord",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Nouvelle configuration",
    url: "/",
    icon: Sparkles,
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Users,
  },
  {
    title: "Templates",
    url: "/templates",
    icon: FileText,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground rounded-lg">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">HubSpot AI</span>
            <span className="text-xs text-muted-foreground">Configuration automatique</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground px-2 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url || (item.url === "/" && location === "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`cursor-pointer ${isActive ? "bg-sidebar-accent" : ""}`}
                      data-testid={`sidebar-link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Propulsé par IA</p>
            <p>Configuration intelligente de HubSpot pour votre secteur d'activité</p>
          </div>
        </Card>
      </SidebarFooter>
    </Sidebar>
  );
}

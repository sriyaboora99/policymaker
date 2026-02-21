import { NavLink, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Play, 
  BarChart3, 
  GitCompare, 
  AlertTriangle,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Settings,
  Database
} from 'lucide-react';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { useSimulator } from '@/context/SimulatorContext';
import { cn } from '@/lib/utils';

const modules = [
  { 
    title: 'Dashboard', 
    url: '/', 
    icon: LayoutDashboard,
    description: 'Overview & metrics'
  },
  { 
    title: 'Policy Definition', 
    url: '/policy', 
    icon: FileText,
    description: 'Create & edit schemes'
  },
  { 
    title: 'Population Generator', 
    url: '/population', 
    icon: Users,
    description: 'Synthetic citizens'
  },
  { 
    title: 'Simulation Engine', 
    url: '/simulation', 
    icon: Play,
    description: 'Run adoption models'
  },
  { 
    title: 'Impact Analysis', 
    url: '/impact', 
    icon: BarChart3,
    description: 'Gap analysis'
  },
  { 
    title: 'What-If Comparison', 
    url: '/comparison', 
    icon: GitCompare,
    description: 'Policy experiments'
  },
  { 
    title: 'Risk Alerts', 
    url: '/alerts', 
    icon: AlertTriangle,
    description: 'Early warnings'
  },
  { 
    title: 'Database', 
    url: '/database', 
    icon: Database,
    description: 'System data registry'
  },
];

const roleLabels = {
  policymaker: 'Policymaker',
  implementing_agency: 'Implementing Agency',
  researcher: 'Researcher',
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { userRole, setUserRole, alerts } = useSimulator();

  const activeAlerts = alerts.filter(a => a.level === 'high' || a.level === 'medium').length;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <BarChart3 className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">Policy Impact</span>
              <span className="text-xs text-sidebar-foreground/60">Simulator</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs uppercase tracking-wider text-sidebar-foreground/50">
            {!collapsed && 'Modules'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {modules.map((item) => {
                const isActive = location.pathname === item.url;
                const hasAlert = item.url === '/alerts' && activeAlerts > 0;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <NavLink
                        to={item.url}
                        className={cn(
                          'relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                          isActive 
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{item.title}</span>
                            <span className={cn(
                              'text-xs',
                              isActive ? 'text-sidebar-primary-foreground/70' : 'text-sidebar-foreground/50'
                            )}>
                              {item.description}
                            </span>
                          </div>
                        )}
                        {hasAlert && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                            {activeAlerts}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed && (
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wider text-sidebar-foreground/50">
              View As
            </label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="w-full rounded-lg border-0 bg-sidebar-accent px-3 py-2 text-sm text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
            >
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

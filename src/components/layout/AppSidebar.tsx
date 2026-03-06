import { NavLink, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Play, 
  BarChart3, 
  GitCompare, 
  AlertTriangle,
  LayoutDashboard,
  Database,
  Sparkles,
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
  { title: 'Dashboard', url: '/', icon: LayoutDashboard, description: 'Overview & metrics' },
  { title: 'Policy Definition', url: '/policy', icon: FileText, description: 'Create & edit schemes' },
  { title: 'Population', url: '/population', icon: Users, description: 'Synthetic citizens' },
  { title: 'Simulation', url: '/simulation', icon: Play, description: 'Run adoption models' },
  { title: 'Impact Analysis', url: '/impact', icon: BarChart3, description: 'Gap analysis' },
  { title: 'What-If', url: '/comparison', icon: GitCompare, description: 'Policy experiments' },
  { title: 'Risk Alerts', url: '/alerts', icon: AlertTriangle, description: 'Early warnings' },
  { title: 'Database', url: '/database', icon: Database, description: 'System data registry' },
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
      <SidebarHeader className="border-b border-sidebar-border p-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 shadow-lg">
            <Sparkles className="h-5 w-5 text-sidebar-primary-foreground" />
            <div className="absolute inset-0 rounded-xl bg-sidebar-primary/20 blur-sm" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground tracking-tight">Policy Impact</span>
              <span className="text-[11px] font-medium text-sidebar-foreground/50 uppercase tracking-widest">Simulator</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-5">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 mb-2 text-[10px] uppercase tracking-[0.15em] font-semibold text-sidebar-foreground/40">
            {!collapsed && 'Modules'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
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
                          'relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group',
                          isActive 
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md' 
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        )}
                      >
                        <div className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                          isActive ? 'bg-sidebar-primary-foreground/15' : 'bg-sidebar-accent group-hover:bg-sidebar-accent'
                        )}>
                          <item.icon className="h-4 w-4 shrink-0" />
                        </div>
                        {!collapsed && (
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-semibold truncate">{item.title}</span>
                            <span className={cn(
                              'text-[11px] truncate',
                              isActive ? 'text-sidebar-primary-foreground/60' : 'text-sidebar-foreground/40'
                            )}>
                              {item.description}
                            </span>
                          </div>
                        )}
                        {hasAlert && (
                          <span className="absolute right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-sm">
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
            <label className="text-[10px] uppercase tracking-[0.15em] font-semibold text-sidebar-foreground/40">
              View As
            </label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="w-full rounded-xl border-0 bg-sidebar-accent px-3 py-2.5 text-sm font-medium text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring transition-all"
            >
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

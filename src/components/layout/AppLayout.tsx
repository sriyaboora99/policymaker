import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useSimulator } from '@/context/SimulatorContext';
import { useAuth } from '@/context/AuthContext';
import { Bell, User, Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: ReactNode;
}

const roleLabels = {
  policymaker: 'Policymaker',
  implementing_agency: 'Implementing Agency',
  researcher: 'Researcher',
};

export function AppLayout({ children }: AppLayoutProps) {
  const { userRole, alerts } = useSimulator();
  const activeAlerts = alerts.filter(a => a.level === 'high' || a.level === 'medium').length;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
              <div className="hidden sm:flex items-center gap-3">
                <div className="h-6 w-px bg-border" />
                <h1 className="text-base font-bold text-foreground tracking-tight">
                  Policy Impact Simulator
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground">
                <Search className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="icon" className="relative rounded-xl text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
                {activeAlerts > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground ring-2 ring-background">
                    {activeAlerts}
                  </span>
                )}
              </Button>
              
              <div className="ml-1 flex items-center gap-2.5 rounded-xl bg-muted/60 px-3 py-1.5 border border-border/50">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary">
                  <User className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {roleLabels[userRole]}
                </span>
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto bg-background p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

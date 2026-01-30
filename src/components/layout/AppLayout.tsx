import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useSimulator } from '@/context/SimulatorContext';
import { Bell, User } from 'lucide-react';
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
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">
                  Adaptive Policy Impact Simulator
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {activeAlerts > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {activeAlerts}
                  </span>
                )}
              </Button>
              
              <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-1.5">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {roleLabels[userRole]}
                </span>
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto bg-background p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

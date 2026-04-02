import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { SimulatorProvider } from "@/context/SimulatorContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
import { PolicyDefinition } from "@/pages/PolicyDefinition";
import { PopulationGenerator } from "@/pages/PopulationGenerator";
import { SimulationEngine } from "@/pages/SimulationEngine";
import { ImpactAnalysis } from "@/pages/ImpactAnalysis";
import { WhatIfComparison } from "@/pages/WhatIfComparison";
import { RiskAlerts } from "@/pages/RiskAlerts";
import { DatabaseView } from "@/pages/DatabaseView";
import { Auth } from "@/pages/Auth";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    <Route
      path="/*"
      element={
        <ProtectedRoute>
          <SimulatorProvider>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/policy" element={<PolicyDefinition />} />
                <Route path="/population" element={<PopulationGenerator />} />
                <Route path="/simulation" element={<SimulationEngine />} />
                <Route path="/impact" element={<ImpactAnalysis />} />
                <Route path="/comparison" element={<WhatIfComparison />} />
                <Route path="/alerts" element={<RiskAlerts />} />
                <Route path="/database" element={<DatabaseView />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </SimulatorProvider>
        </ProtectedRoute>
      }
    />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

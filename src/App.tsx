import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimulatorProvider } from "@/context/SimulatorContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
import { PolicyDefinition } from "@/pages/PolicyDefinition";
import { PopulationGenerator } from "@/pages/PopulationGenerator";
import { SimulationEngine } from "@/pages/SimulationEngine";
import { ImpactAnalysis } from "@/pages/ImpactAnalysis";
import { WhatIfComparison } from "@/pages/WhatIfComparison";
import { RiskAlerts } from "@/pages/RiskAlerts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SimulatorProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/policy" element={<PolicyDefinition />} />
              <Route path="/population" element={<PopulationGenerator />} />
              <Route path="/simulation" element={<SimulationEngine />} />
              <Route path="/impact" element={<ImpactAnalysis />} />
              <Route path="/comparison" element={<WhatIfComparison />} />
              <Route path="/alerts" element={<RiskAlerts />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </SimulatorProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

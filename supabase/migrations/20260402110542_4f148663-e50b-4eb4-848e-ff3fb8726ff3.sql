
-- Policies table
CREATE TABLE public.policies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  target_population INTEGER NOT NULL,
  geographic_scope TEXT NOT NULL,
  eligibility JSONB NOT NULL DEFAULT '{}',
  documents_required INTEGER NOT NULL DEFAULT 0,
  benefit_type TEXT NOT NULL,
  benefit_value NUMERIC NOT NULL DEFAULT 0,
  expected_adoption_percentage NUMERIC NOT NULL DEFAULT 0,
  rollout_duration_days INTEGER NOT NULL DEFAULT 180,
  assumptions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Simulation results table
CREATE TABLE public.simulation_results (
  id TEXT PRIMARY KEY,
  policy_id TEXT REFERENCES public.policies(id) ON DELETE CASCADE NOT NULL,
  total_population INTEGER NOT NULL,
  eligible_population INTEGER NOT NULL,
  final_beneficiaries INTEGER NOT NULL,
  adoption_rate NUMERIC NOT NULL,
  stages JSONB NOT NULL DEFAULT '[]',
  time_series_data JSONB NOT NULL DEFAULT '[]',
  cost_per_beneficiary NUMERIC NOT NULL DEFAULT 0,
  budget_utilization NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_results ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (no auth required for this simulator tool)
CREATE POLICY "Allow public read policies" ON public.policies FOR SELECT USING (true);
CREATE POLICY "Allow public insert policies" ON public.policies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update policies" ON public.policies FOR UPDATE USING (true);

CREATE POLICY "Allow public read simulations" ON public.simulation_results FOR SELECT USING (true);
CREATE POLICY "Allow public insert simulations" ON public.simulation_results FOR INSERT WITH CHECK (true);

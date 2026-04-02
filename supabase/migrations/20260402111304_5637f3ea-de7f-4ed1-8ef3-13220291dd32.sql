
-- Add user_id to policies
ALTER TABLE public.policies ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to simulation_results
ALTER TABLE public.simulation_results ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old public policies
DROP POLICY IF EXISTS "Allow public read policies" ON public.policies;
DROP POLICY IF EXISTS "Allow public insert policies" ON public.policies;
DROP POLICY IF EXISTS "Allow public update policies" ON public.policies;
DROP POLICY IF EXISTS "Allow public read simulations" ON public.simulation_results;
DROP POLICY IF EXISTS "Allow public insert simulations" ON public.simulation_results;

-- New user-scoped RLS policies
CREATE POLICY "Users can read own policies" ON public.policies FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own policies" ON public.policies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own policies" ON public.policies FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own policies" ON public.policies FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can read own simulations" ON public.simulation_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own simulations" ON public.simulation_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own simulations" ON public.simulation_results FOR DELETE TO authenticated USING (auth.uid() = user_id);

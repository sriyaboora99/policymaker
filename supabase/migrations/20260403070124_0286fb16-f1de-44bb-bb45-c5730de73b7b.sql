
-- 1. Fix privilege escalation: drop the broad UPDATE policy on user_profiles
--    and replace with one that prevents role changes
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "Users can update own profile no role change"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND role = (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()));

-- 2. Add missing UPDATE policy on simulation_results
CREATE POLICY "Users can update own simulations"
ON public.simulation_results
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

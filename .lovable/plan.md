
The user is preparing for a viva (oral exam) on this Policy Impact Simulator project. They want help understanding:
1. Datasets used
2. Frameworks
3. Tech stack
4. Accuracy comparison vs existing systems

This is a **research/explanation request**, not an implementation task. No code changes needed. I'll provide a comprehensive viva preparation guide based on what I know about the codebase.

Key facts from codebase:
- No external datasets — uses **synthetic population generation** (Monte Carlo + Gaussian distributions)
- Frontend: React 18, TypeScript, Vite, Tailwind, shadcn/ui, Recharts
- Backend: Lovable Cloud (Supabase) — Postgres, Auth, RLS
- Simulation engine: probabilistic, rule-based, 6-stage funnel (`src/lib/simulationEngine.ts`)
- Custom formula: `adoption ≈ awareness × trust × (1 - friction)`

I'll structure this as a viva cheat sheet — no plan needed since nothing is being built. Let me reframe as a knowledge response inside the plan tag (since instructions say plans for implementation only, but this is pure Q&A I should answer directly without `<lov-plan>`).

Actually re-reading: "Skip [plans] for research ('how does X work?')." — This is research. I should answer directly, not use presentation-plan.

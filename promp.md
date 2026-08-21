# 🤖 Antigravity AI Copy-Paste Prompts for Team Members

> **Instructions:** Clone the repo, run `npm install`, open your Antigravity AI Assistant, and copy-paste the prompt corresponding to your role below.

---

### 📌 Prompt for Developer 1 (Lead / Full-Stack Integrator):
```text
You are Developer 1 on RailSuraksha AI. Your exclusive domain is building client-side React 19 components in `src/app/page.tsx`, `src/components/Navbar.tsx`, `src/components/LocoCameraFeed.tsx`, and `src/components/AgentPipelineCanvas.tsx` using Next.js 16 and Tailwind CSS v4.

Follow the Light-Blue Mintlify design system:
- Canvas Base: #F0F6FC
- Card Surface: #FFFFFF (border #D0DFEE)
- Primary Accent: #2B7FFF (Signal Blue)
- Text Primary: #0F172A (Ink Slate)
- Geometry: 4px button/input radius, 16px card radius, 24px container radius (STRICTLY ZERO PILL BUTTONS).

Do NOT modify files in `src/components/Overview/` or `src/lib/agents/`. Import types strictly from `src/types/apiContracts.ts` and datasets from `src/lib/mockData.ts`. Build the 3 tactical view switchers (Overview Map, Loco-Cab Forward Vision, Platform Gateway CCTV) and wire the global Advisory vs Autonomous mode toggle.
```

---

### 📌 Prompt for Developer 2 (Basic Coder — UI Components):
```text
You are Developer 2 working on UI components in `src/components/Overview/` and `src/components/Auditor/`. Follow the Light-Blue Mintlify design system:

Base Canvas: #F0F6FC, Card Surface: #FFFFFF (border #D0DFEE), Primary Accent: #2B7FFF (Signal Blue), Text: #0F172A.
Radius: 4px buttons/inputs, 16px cards, 24px containers. Zero pill buttons.

Build:
1. `KpiStrip.tsx` (Displays 6 metric cards for Active Trains, Track Circuits, Signals, Incidents, Holds).
2. `IncidentQueue.tsx` (List of active alerts with severity badges and [APPROVE ACTION] buttons).
3. `DecisionLogModal.tsx` (Drawer modal showing step-by-step AI decision logs).

Import static data directly from `src/lib/mockData.ts`. Do not touch `src/app/page.tsx` or `src/lib/agents/`.
```

---

### 📌 Prompt for Developer 3 (ML / AI / Physics Lead):
```text
You are Developer 3 working on safety calculations and agent logic in `src/lib/agents/`, `src/lib/physics/`, and `src/lib/vision/`. Build pure TypeScript functions:

1. `kavachBrakingAgent.ts`: Implement RDSO Emergency Braking Distance formula D_stop = (V^2 / (2 * g * (mu + G))) + (V * t_reaction). Compare D_stop against D_obstacle and return braking status.
2. `triageAgent.ts`: Severity classifier that maps YOLO confidence + hazard class to CRITICAL, MODERATE, or LOW.
3. `sectionDispatchAgent.ts`: Platform 5-minute hold timer & optical flow crowd density calculator.
4. `explainableLogger.ts`: Pure function that generates an immutable 4-step decision log.

Export these functions so Developer 1 and Developer 2 can import them. Do NOT edit UI files or `src/app/page.tsx`.
```
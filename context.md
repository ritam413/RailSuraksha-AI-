# Project Context: RailSuraksha AI (रेल-सुरक्षा)

## 1. Project Overview
RailSuraksha AI is a national-grade railway safety, interlocking monitoring, and incident intelligence platform built for Indian Railways operations. It bridges computer vision hazard detection, deterministic RDSO-standard stopping physics (Kavach EBD), platform crowd surge control, and transparent explainable AI compliance auditing.

## 2. Team Architecture & Ownership Matrix
- **Developer 1 (Lead / Integrator):** `src/app/page.tsx`, `src/components/Navbar.tsx`, `src/components/LocoCameraFeed.tsx`, `src/components/AgentPipelineCanvas.tsx`, `src/components/PlatformGatewayFeed.tsx`, `src/app/globals.css`.
- **Developer 2 (UI Components Lead):** `src/components/Overview/KpiStrip.tsx`, `src/components/Overview/IncidentQueue.tsx`, `src/components/Overview/InterlockingMap.tsx`, `src/components/Auditor/DecisionLogModal.tsx`, `src/components/Common/**`.
- **Developer 3 (ML / AI / Physics Lead):** `src/lib/agents/**`, `src/lib/physics/**`, `src/lib/vision/**`.

## 3. Architecture & Tech Stack
- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4 with Light-Blue Mintlify Design Tokens:
  - Base Canvas (Surface 0): `#F0F6FC`
  - Card/Panel Surface (Surface 1): `#FFFFFF` (1px border `#D0DFEE`)
  - Elevated Tabs/Inputs (Surface 2): `#E6F0FA`
  - Primary Accent: `#2B7FFF` (Signal Blue)
  - Atmospheric Accent: `#426188` (Twilight Blue)
  - Typography Primary: `#0F172A` (Ink Slate)
  - Radii: 4px button/input, 16px card, 24px container (strictly 0 pill buttons)
- **State Management & Agent Flow:** Modular pure TypeScript agents in `src/lib/agents/` communicating with React UI components.
- **Contracts & Data:** Shared interface contracts in `src/types/apiContracts.ts` and static mock data generator in `src/lib/mockData.ts`.

## 4. Directory Structure
```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                      # Main Command Center page
├── components/
│   ├── Navbar.tsx                    # Top navigation & Advisory/Autonomous switcher
│   ├── LocoCameraFeed.tsx            # Forward loco cab video & hazard overlay
│   ├── AgentPipelineCanvas.tsx       # 4-stage Kavach execution pipeline visualizer
│   ├── PlatformGatewayFeed.tsx       # View 3 Platform CCTV crowd surge monitor
│   ├── Common/
│   │   └── Card.tsx                  # Standard Mintlify card wrapper
│   ├── Overview/
│   │   ├── KpiStrip.tsx              # 6-metric operational summary strip
│   │   ├── InterlockingMap.tsx       # Track block & signaling aspect diagram
│   │   └── IncidentQueue.tsx         # AI Triage incident priority list
│   └── Auditor/
│       └── DecisionLogModal.tsx      # 4-step explainable AI audit timeline modal
├── lib/
│   ├── agents/
│   │   ├── kavachBrakingAgent.ts     # RDSO Emergency Braking Distance physics
│   │   ├── triageAgent.ts            # Severity scoring & classifier
│   │   ├── sectionDispatchAgent.ts   # Platform hold timer & crowd density agent
│   │   └── explainableLogger.ts      # Immutable 4-step decision log generator
│   ├── mockData.ts                   # Static datasets, circuits, incidents, demo video URLs
│   ├── physics/                      # Physics calculation helpers
│   └── vision/                       # Computer vision inference helpers
└── types/
    └── apiContracts.ts               # Shared TypeScript interfaces & types
```

## 5. Key Rules & Constraints
- Strict role boundaries according to the team ownership matrix.
- Zero pill buttons across all components (strictly 4px radius).
- All AI automated interventions must produce an immutable 4-step explainable decision log.

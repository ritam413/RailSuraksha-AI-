# Implementation Plan: TICKET-DEV1-07 Master 3-View Cockpit & Horizon Switcher Assembly

> **Design Mode (`/impeccable`, `/taste`, `/animate`, `/addyosmani-perf`):** **`OPERATE`**  
> *"Reading this as: Mission-Critical Railway Corridor Operations Command Cockpit (SIH 26027) for Divisional Section Controllers (`Sr. DOM`), Signal & Telecom Engineers, and Operations Dispatchers, with a high-density industrial control language, Light-Blue Mintlify Design Tokens (`#F0F6FC` canvas, `#FFFFFF` cards, `#D0DFEE` borders, `#2B7FFF` Signal Blue, 4px micro-radii, strictly zero pill buttons) + Sub-50ms INP React 19 Transitions + Zero-CLS Layout Architecture."*

---

## ⚡ Core Web Vitals & Performance Architecture (`/addyosmani-perf`)

### 1. Web Vitals Targets & Audit Benchmarks

| Metric | Target Benchmark | Addy Osmani Performance Implementation |
| :--- | :---: | :--- |
| **LCP** (Largest Contentful Paint) | **`< 1.2s`** (Well under 2.5s) | SVG Marey String Chart coordinate matrices memoized via `useMemo`; static SVG grid rendered immediately; dynamic views (`PlatformGatewayFeed`, `LocoCameraFeed`) code-split to unblock initial viewport paint. |
| **INP** (Interaction to Next Paint) | **`< 50ms`** (Well under 200ms) | React 19 `useTransition` / `startTransition` wrapping rolling horizon filter shifts (`24h` $\to$ `7D` $\to$ `30D`) and demand search queries. Interactive tab state commits on frame 0 (<16ms); expensive data calculations yield to the main thread. |
| **CLS** (Cumulative Layout Shift) | **`0.000`** (Well under 0.1) | Fixed container reservations: SVG chart viewBox `860x440`, KPI card grid `h-[110px]`, and CSS grid overlay stacking (`col-start-1 row-start-1`) with `AnimatePresence` preventing layout jumps during tab switching. |
| **FPS** (Compositor Frame Rate) | **`60 / 120 FPS`** | Zero layout thrashing: animations restricted exclusively to GPU compositor properties (`transform: translate3d/scale`, `opacity`). Zero layout recalculations (`top`, `left`, `width`, `height` strictly banned in animations). |

### 2. DOM Layout Thrashing Elimination Rules
1. **Zero Layout Thrashing (Read/Write Segregation):** Never query layout geometry (`offsetWidth`, `getBoundingClientRect()`, `scrollY`) immediately preceding DOM style mutations in React render cycles.
2. **GPU Composited Transforms:** Use Motion `transform: translate3d(0, 0, 0)` and CSS transforms for layout indicators, eliminating reflow and paint triggers.
3. **Memory & Timer Hygiene:** All Web Audio synthesizers, WebSocket intervals, and deceleration kinematic loops bound to `useRef` and rigorously terminated in `useEffect` cleanup return functions.
4. **React 19 Concurrent Scheduling:**
   ```tsx
   const [isPending, startTransition] = useTransition();

   const handleHorizonSwitch = (newHorizon: HorizonTier) => {
     setImmediateHorizonTab(newHorizon); // Frame 0 immediate active tab indicator
     startTransition(() => {
       setPlanningHorizon(newHorizon);  // Non-blocking background data slicing
     });
   };
   ```

---

## 🎛️ Design Dials (`/taste` & `/ui-ux-pro-max`)

| Dial | Value | Rationale & Architectural Rule |
| :--- | :---: | :--- |
| **`DESIGN_VARIANCE`** | **`6`** | Structured mission-critical 70/30 split-view operational layout without generic AI centering. |
| **`MOTION_INTENSITY`** | **`5`** | Tactile interactive feedback, sub-second step transitions, telemetry ping animations, instant tab switching with **zero layout shifts** and full `prefers-reduced-motion` compliance. |
| **`VISUAL_DENSITY`** | **`8`** | Industrial high-density telemetry HUD, 6-metric summary strip, compact 4-aspect signal diagrams, and dense demand queues. |

---

## 🎨 Impeccable Design System Tokens

```text
Tokens & Spatial Harmony:
├── Surface 0 (Base Canvas):     #F0F6FC
├── Surface 1 (Card Panels):     #FFFFFF (1px solid #D0DFEE, 16px radius)
├── Surface 2 (Elevated Tabs):   #E6F0FA (4px radius)
├── Primary Accent:              #2B7FFF (Signal Blue, active states & CTAs)
├── Atmospheric Accent:          #426188 (Twilight Slate, subtitles & axes)
├── Text Primary:                #0F172A (Ink Slate, WCAG AAA 14.2:1 contrast)
├── Text Muted:                  #64748B (Muted Slate, WCAG AA 5.8:1 contrast)
└── Geometry Rules:              Strictly 4px buttons, 16px cards, 24px modals (0 pill buttons)
```

---

## 🏛️ Master Cockpit Wireframe & Structural Grid

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ NAVBAR: [RailSuraksha AI] | [24h Tactical | 7D Operational | 30D Strategic] | [1. Planner | 2. Map | 3. Cab]│
│         Right: [IST Live Clock] | [API: ONLINE] | [Theme ☾/☀] | [Audio 🔊] | [⚠️ ADVISORY / ⚡ AUTO]        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ KPI SUMMARY STRIP (h-[110px], CLS=0): [38.4% Downtime Saved] [96.2% Availability] [03 Blocks] [08 Demands] │
├─────────────────────────────────────────────────────────────────────────────┬───────────────────────────────┤
│ VIEW 1 (70%): CORRIDOR MAREY STRING CHART (SVG Canvas 860x440)              │ VIEW 1 (30%): DEMAND QUEUE    │
│   • Time (X: 00:00 to 24:00) vs Distance (Y: CSMT to Kalyan, 54 KM)         │   • Filter: [All] [P1] [P2]   │
│   • Multi-tier Train Trajectories (Vande Bharat, Express, Suburban, Freight)│   • [P1] TMS-804 (TC-03)      │
│   • Shaded Rectangles: Bundled Shadow Blocks (01:30 - 04:45 IST)            │     [APPROVE & SANCTION]      │
│   • Click Shadow Block ──► Opens Decision Dossier Modal                     │   • [P2] TDMS-312 (TC-03)     │
├─────────────────────────────────────────────────────────────────────────────┤     [APPROVE & SANCTION]      │
│ PERIPHERAL ANALYTICS TABS: [Hide / Show Analytics] [Triage Donut] [Deceleration Curve]                      │
│   (Collapsible high-density analytics drawer with Recharts components)                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ MODAL: EXPLAINABLE DECISION DOSSIER (RFC 8785 SHA-256 Seal Verification, 4-Step Timeline & RDSO Form 14B)   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Manifest

| Target File | Operation | Description |
| :--- | :---: | :--- |
| `src/components/Navbar.tsx` | **Modify** | Add Horizon Switcher (`24H` / `7D` / `30D`), 4 tactical views with `motion.div` layout indicators, live clock, and audio toggle. |
| `src/app/page.tsx` | **Modify** | Assemble master 4-view command cockpit with React 19 `useTransition`, `AnimatePresence` view transitions, rolling horizon filters, and atomic sanction event bus. |
| `tests/MainCockpit.test.tsx` | **Create** | Automated Vitest test suite covering horizon switching, tab switching, performance invariants, and sanctioning workflows. |

---

## 🛠️ Step-by-Step Implementation Roadmap (TDD)

### Step 1: Modernize `src/components/Navbar.tsx`
- Add segmented horizon switcher (`[24h Tactical]`, `[7D Operational]`, `[30D Strategic]`) using `motion.div` active indicator.
- Add prop interface: `horizon?: HorizonTier`, `onHorizonChange?: (horizon: HorizonTier) => void`.
- Update View Switcher tabs:
  - `Master Corridor Planner` (`CORRIDOR_PLANNER` / `OVERVIEW`)
  - `Interlocking Map` (`INTERLOCKING`)
  - `Cab Vision & Kavach HUD` (`LOCO_CAB`)
  - `Platform Gateway CCTV` (`PLATFORM_GATEWAY`)
- Standardize all buttons with `rounded-[4px]`, `#FFFFFF` backdrop with `backdrop-blur-md`, 1px `#D0DFEE` border.

### Step 2: Implement Master Cockpit Assembly in `src/app/page.tsx`
- **Performance & State Orchestration**:
  - `planningHorizon`: Rolling horizon filter for active blocks & demands scheduled via `useTransition`.
  - `activeTab`: Tactical view selection with zero-CLS CSS grid overlay.
  - `interlockingState`: Live circuit telemetry with atomic mutation support.
  - `selectedBlockId` & `selectedDossier`: Bound to Explainable Decision Dossier Modal.
  - `analyticsTab`: Toggleable analytics drawer state (`'COLLAPSED' | 'TRIAGE_DONUT' | 'DECEL_CURVE'`).
- **Master Sanction Event Bus (`handleSanctionBlock`)**:
  - **Atomic State Mutation:** Updates target circuit (`TC-03`, `TC-04`) to `BLOCK_SANCTIONED` and `POWER_ISOLATED`.
  - **API Mutation:** Dispatches `sanctionBlockRequest(blockId, 'CTRL-MUM-402')`.
  - **Cryptographic Audit:** Invokes `buildExplainableDossier()` generating SHA-256 seal.
  - **Acoustic Feedback:** Plays RDSO chime (`playActionConfirmedChime()`).
  - **Modal Trigger:** Opens `DecisionLogModal` with 4-step timeline and RDSO Form 14B certificate.
  - **Feedback Toast:** Shows 5-second dismissable toast with GPU spring transition.
- **View 1 Assembly (`CORRIDOR_PLANNER`)**:
  - Top: 6-metric `KpiStrip`.
  - Left (70%): `CorridorStringChart` + Collapsible Analytics Drawer (`TriageDonut` and `DecelerationCurve`).
  - Right (30%): `IncidentQueue` with sanction action triggers.
- **View 2 Assembly (`INTERLOCKING`)**:
  - `InterlockingMap` with 6-circuit schematic, 4-aspect signal heads, switch SW-04, and Form S&T/T-351 lockout banner.
  - Full-width `IncidentQueue`.
- **View 3 Assembly (`LOCO_CAB`)**:
  - `LocoCameraFeed` with multi-angle switcher, weather simulator, and speedometer HUD.
  - `AgentPipelineCanvas` 4-stage safety visualizer.
- **View 4 Assembly (`PLATFORM_GATEWAY`)**:
  - `PlatformGatewayFeed` with crowd surge overlay, 1s countdown ticker, and Station Master override controls.

### Step 3: Implement Automated Vitest Suite in `tests/MainCockpit.test.tsx`
- **Test 1:** Renders Master Cockpit with default 24h Tactical horizon, KPI strip, and Marey String Chart.
- **Test 2:** Toggles rolling horizon tabs (`7D Operational`, `30D Strategic`) and verifies state propagation.
- **Test 3:** Switches seamlessly across all 4 tactical views (`CORRIDOR_PLANNER`, `INTERLOCKING`, `LOCO_CAB`, `PLATFORM_GATEWAY`) with zero DOM errors.
- **Test 4:** Simulates clicking a shadow block in `CorridorStringChart` or `IncidentQueue`, asserting that circuit status updates to `BLOCK_SANCTIONED` and `DecisionLogModal` opens.
- **Test 5:** Toggles deployment mode between `ADVISORY` and `AUTONOMOUS`.
- **Test 6:** Verifies theme toggle and audio alert mute states.

### Step 4: Verification & Regression Testing
- Run `npx vitest run tests/MainCockpit.test.tsx`
- Run full test suite: `npm test`
- Run TypeScript compile check: `npx tsc --noEmit`

---

## 🛡️ Anti-Slop & Quality Checklist

- [x] **Strict Zero-Pill Geometry:** 4px radius for all interactive elements, 16px for cards, 24px for modals.
- [x] **Sub-50ms INP:** React 19 `useTransition` for non-blocking horizon shifts and filtering.
- [x] **Zero CLS (`CLS = 0.000`):** Fixed aspect-ratio containers and CSS grid stacking preventing reflow jumps.
- [x] **GPU-Accelerated Motion:** Animate only `transform` and `opacity`; zero layout thrashing.
- [x] **Light-Blue Mintlify Palette:** `#F0F6FC` background, `#FFFFFF` cards, `#D0DFEE` borders, `#2B7FFF` accent.
- [x] **Real Cryptographic Verification:** RFC 8785 SHA-256 seal dynamically verified in the modal.
- [x] **Accessible Micro-Interactions:** Keyboard navigation (`Enter`/`Space`), focus rings, and `prefers-reduced-motion` compliance.

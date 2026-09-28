# TICKET-01: 3D Quadrupled Corridor Twin Component (`CorridorTwin3D.tsx`)

## 1. Objective
Build the client-side React 19 / Next.js 16 3D Corridor Digital Twin component (`src/components/Three/CorridorTwin3D.tsx`) using React Three Fiber, Drei, and GSAP. Integrate it into `src/components/Planner/CorridorStringChart.tsx` with a view switcher tab (`[2D String Chart]` $\leftrightarrow$ `[🌐 3D Digital Twin]`).

---

## 2. Public Seams & Behavioral Specification
- **Component Seam**: `<CorridorTwin3D trains={trainData} shadowBlock={shadowBlockData} />`
- **Behavioral Guarantees**:
  - Renders 4 parallel tracks representing CSMT $\rightarrow$ KYN quadrupled corridor (Up Through, Up Slow, Down Through, Down Slow).
  - Renders active train capsules moving smoothly along the corridor with speeds/delays pinned via Drei `<Html>` overlays.
  - Renders the Nocturnal Shadow Maintenance block with a translucent cyan bounding box and breathing GSAP glow.
  - Wraps inside an explicit container (`h-80`, `border border-[#D0DFEE]`, `bg-[#0A0E17]`) to guarantee zero Cumulative Layout Shift (CLS = 0).
  - Handles complete WebGL scene traversal disposal and GSAP animation cleanup on unmount.

---

## 3. TDD (Red $\rightarrow$ Green $\rightarrow$ Refactor) Execution Plan

### Step 1: Red (Failing Test)
- Create `tests/Three/CorridorTwin3D.test.tsx`.
- Test Seams:
  1. Component mounts without crashing and renders container with proper test IDs and accessibility attributes.
  2. Renders spatial train badges (`● 12051 Jan Shatabdi`, `● 12137 Punjab Mail`).
  3. Renders CP-SAT solver status badge and maintenance block indicator.
  4. Disposes WebGL and animation context cleanly on unmount.
- Run `npm test tests/Three/CorridorTwin3D.test.tsx` $\rightarrow$ **Fails (RED)**.

### Step 2: Green (Minimal Implementation)
- Create `src/components/Three/CorridorTwin3D.tsx` with `@react-three/fiber` `<Canvas>`, Drei `<Html>`, `<OrbitControls>`, and `useFrame` traversal.
- Integrate into `CorridorStringChart.tsx` via `next/dynamic({ ssr: false })`.
- Run `npm test tests/Three/CorridorTwin3D.test.tsx` $\rightarrow$ **Passes (GREEN)**.

### Step 3: Refactor & Verification
- Check Addy Osmani perf guidelines (zero React state re-renders during 60 FPS loop, direct ref mutations).
- Run full test suite: `npm test` (all tests passing).

---

## 4. Dependencies & Subsystems Touched
- `src/components/Three/CorridorTwin3D.tsx` (New)
- `src/components/Planner/CorridorStringChart.tsx` (Update view switcher)
- `tests/Three/CorridorTwin3D.test.tsx` (New test suite)

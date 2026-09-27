# TICKET-03: Refined 3D UIC-60 Rail Flaw Hologram & Kavach Cab Run (`RailFlawHologram3D.tsx` & `KavachCabRun3D.tsx`)

## 1. Objective
Build the dual-viewport 3D vision console components in `src/components/Three/`:
1. **Left Viewport (`RailFlawHologram3D.tsx`)**: Refine the rail cross-section geometry into an authentic extruded **UIC-60 rail profile** (rounded crown head, tapered web, wide base flange) with translucent X-ray steel, internal ruby transverse flaw, and oscillating ultrasonic beam cone.
2. **Right Viewport (`KavachCabRun3D.tsx`)**: Retain the smooth forward high-speed cab perspective run with interactive **[Simulate Kavach Braking]** triggering GSAP deceleration ($110 \rightarrow 30\text{ km/h}$).
3. Integrate both into `src/components/Vision/DefectVisionTelemetry.tsx`.

---

## 2. Public Seams & Behavioral Specification
- **Component Seams**:
  ```tsx
  interface RailFlawHologram3DProps {
    flawType?: string;
    depthMm?: number;
    showXRay?: boolean;
    onToggleXRay?: () => void;
  }

  interface KavachCabRun3DProps {
    initialSpeed?: number;
    tsrClampSpeed?: number;
    isBraking?: boolean;
    onSimulateBraking?: () => void;
  }
  ```
- **Behavioral Guarantees**:
  - `RailFlawHologram3D`: Renders authentic UIC-60 extruded geometry, floating motion via `<Float>`, pulsating ultrasonic transducer cone, and pinned flaw badge `<Html>`.
  - `KavachCabRun3D`: Renders forward-running track sleepers at 60 FPS in `useFrame`. Clicking brake simulation triggers a smooth GSAP deceleration curve clamp without UI hitching.
  - Memory Discipline: Complete WebGL traversal disposal and animation context cleanup on unmount.

---

## 3. TDD (Red $\rightarrow$ Green $\rightarrow$ Refactor) Execution Plan

### Step 1: Red (Failing Test)
- Create `tests/Three/DefectVisionKavach3D.test.tsx`.
- Test Seams:
  1. `RailFlawHologram3D` mounts and displays "3D USFD VOLUMETRIC X-RAY (UIC-60)" badge and defect classification ("Transverse Fracture").
  2. Clicking "Toggle X-Ray Steel" triggers the `onToggleXRay` callback.
  3. `KavachCabRun3D` displays speed ("110 KM/H" / "30 KM/H") and "450 MHz UHF Locked".
  4. Clicking "Simulate Kavach Braking" triggers the deceleration state and callback.
  5. Both components clean up WebGL geometries and GSAP timelines on unmount.
- Run `npm test tests/Three/DefectVisionKavach3D.test.tsx` $\rightarrow$ **Fails (RED)**.

### Step 2: Green (Minimal Implementation)
- Create `src/components/Three/RailFlawHologram3D.tsx` (using standard UIC-60 `THREE.Shape` and `ExtrudeGeometry`).
- Create `src/components/Three/KavachCabRun3D.tsx` (using procedural track sleepers and GSAP speed tween).
- Integrate both into `DefectVisionTelemetry.tsx`.
- Run `npm test tests/Three/DefectVisionKavach3D.test.tsx` $\rightarrow$ **Passes (GREEN)**.

### Step 3: Refactor & Verification
- Check Addy Osmani perf guidelines (sub-50ms INP, zero React re-renders in sleeper animation loop).
- Run full test suite: `npm test`.

---

## 4. Dependencies & Subsystems Touched
- `src/components/Three/RailFlawHologram3D.tsx` (New)
- `src/components/Three/KavachCabRun3D.tsx` (New)
- `src/components/Vision/DefectVisionTelemetry.tsx` (Integrate 3D viewports)
- `tests/Three/DefectVisionKavach3D.test.tsx` (New test suite)

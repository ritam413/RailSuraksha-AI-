# TICKET-02: 3D Yard Point Switch Turnout & 4-Aspect Signal Twin (`PointSwitchTurnout3D.tsx`)

## 1. Objective
Build the reactive 3D Yard Point Switch (SW-04) and 4-Aspect Signal Twin component (`src/components/Three/PointSwitchTurnout3D.tsx`). Wire its state dynamically to `src/components/Overview/InterlockingMap.tsx` so selecting track circuits/signals updates switch blade position and signal mast lenses in real time.

---

## 2. Public Seams & Behavioral Specification
- **Component Seam**:
  ```tsx
  interface PointSwitchTurnout3DProps {
    switchId?: string;
    signalId?: string;
    signalAspect?: 'CLEAR' | 'CAUTION' | 'ATTENTION' | 'DANGER';
    switchRoute?: 'MAINLINE' | 'TURNOUT' | 'REVERSE';
    onToggleRoute?: (route: 'MAINLINE' | 'TURNOUT') => void;
    isLockedOut?: boolean;
  }
  ```
- **Behavioral Guarantees**:
  - Mechanical Tie-Rod Stroke: Animates electric point machine rod with GSAP elastic damping (`115mm` stroke) when `switchRoute` toggles.
  - 4-Aspect Signal Mast: Lights up the corresponding emissive lens (**Green** for CLEAR, **Double Yellow** for ATTENTION, **Yellow** for CAUTION, **Red** for DANGER/Lockout).
  - Pinned `<Html>` Route Controls: Interactive button inside the 3D viewport allowing direct operator route switching.
  - Sub-50ms INP: UI button click triggers immediate visual state transition via React 19 `startTransition`.
  - Zero CLS: Self-contained within fixed `h-80` container.

---

## 3. TDD (Red $\rightarrow$ Green $\rightarrow$ Refactor) Execution Plan

### Step 1: Red (Failing Test)
- Create `tests/Three/PointSwitchTurnout3D.test.tsx`.
- Test Seams:
  1. Mounts and displays switch header ("DADAR JUNCTION SW-04", 115mm stroke).
  2. Renders correct signal aspect indicator when `signalAspect="CLEAR"` vs `signalAspect="DANGER"`.
  3. Fires `onToggleRoute` callback when route switch buttons are pressed.
  4. Correctly applies lockout styling when `isLockedOut=true`.
  5. Cleans up GSAP tweens and WebGL resources on unmount.
- Run `npm test tests/Three/PointSwitchTurnout3D.test.tsx` $\rightarrow$ **Fails (RED)**.

### Step 2: Green (Minimal Implementation)
- Create `src/components/Three/PointSwitchTurnout3D.tsx` with R3F `<Canvas>`, Drei `<Html>`, `<meshStandardMaterial>` for signal lenses, and GSAP stroke timeline.
- Wire to `InterlockingMap.tsx` via dynamic import.
- Run `npm test tests/Three/PointSwitchTurnout3D.test.tsx` $\rightarrow$ **Passes (GREEN)**.

### Step 3: Refactor & Verification
- Verify sub-50ms interaction latency with `startTransition`.
- Run full test suite: `npm test`.

---

## 4. Dependencies & Subsystems Touched
- `src/components/Three/PointSwitchTurnout3D.tsx` (New)
- `src/components/Overview/InterlockingMap.tsx` (Integrate 3D switch inspector)
- `tests/Three/PointSwitchTurnout3D.test.tsx` (New test suite)

# Decouple Screens into Dedicated RBAC-Guarded Endpoints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decouple the monolithic command center into dedicated, independent Next.js App Router page routes (`/planner`, `/interlocking`, `/vision-telemetry`, `/auditor`, `/field-checkin`, `/login`, `/unauthorized`) protected by a strict Role-Based Access Control (RBAC) engine with client-side route guards, dynamic role-aware navigation, and protected API endpoints.

**Architecture:** Implement a hexagonal RBAC domain subsystem (`src/lib/rbac.ts`) defining Indian Railways operational roles and route permission matrices. Wrap the Next.js App Router in an `AuthProvider` (`src/context/AuthContext.tsx`) with localStorage persistence and pre-seeded officer personas for seamless 1-click evaluation. Wrap each route in a `ProtectedRoute` boundary, extract screen views into clean dedicated page entrypoints, and update `Navbar.tsx` to dynamically render only authorized routes with active role badges and a fast switch dropdown.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 (Light-Blue Mintlify Theme), Vitest / React Testing Library.

---

## Global Constraints

- **Design System:** Strictly follow Light-Blue Mintlify tokens: Base Canvas `#F0F6FC`, Card Surfaces `#FFFFFF` (border `#D0DFEE`), Primary Accent `#2B7FFF` (Signal Blue), Text Primary `#0F172A` (Ink Slate), 4px button/input radius, 16px card radius (STRICTLY ZERO PILL BUTTONS).
- **Type Safety:** Import types strictly from `src/types/apiContracts.ts` and `src/lib/rbac.ts`. No `any` types.
- **Testing & Stability:** Maintain 100% test pass rate across all existing 20 test suites (146+ tests) and add new test suites for RBAC and decoupled routes.
- **YAGNI / Demo Accessibility:** Provide pre-seeded official railway officer personas so judges/developers can switch roles with 1 click without requiring external cloud databases, while maintaining full Supabase/PostgreSQL schema compatibility.

---

## File Structure & Module Decomposition

```
src/
├── app/
│   ├── layout.tsx                     # Wrap root layout in AuthProvider
│   ├── page.tsx                       # Root redirector / Master Cockpit for ADMIN
│   ├── login/
│   │   └── page.tsx                   # Interactive Railway Officer Auth & Role Switcher
│   ├── unauthorized/
│   │   └── page.tsx                   # Statutory RDSO Access Violation / Security Notice
│   ├── planner/
│   │   └── page.tsx                   # SCREEN 1: Corridor Planner & CP-SAT String Chart
│   ├── interlocking/
│   │   └── page.tsx                   # SCREEN 2: Interlocking Track Circuit Schematic & Point Switch
│   ├── vision-telemetry/
│   │   └── page.tsx                   # SCREEN 3: Defect Vision & Kavach TCAS Cab Telemetry
│   ├── auditor/
│   │   └── page.tsx                   # SCREEN 4: Auditor Workspace & 3D Cryptographic Seal
│   └── field-checkin/
│       └── page.tsx                   # SCREEN 5: Ground Crew Geofenced Check-In Portal
├── components/
│   ├── Auth/
│   │   ├── ProtectedRoute.tsx         # Client-side RBAC route gatekeeper
│   │   └── RoleSwitcherDropdown.tsx   # Fast 1-click role switcher chip for Navbar
│   ├── Navbar.tsx                     # Dynamic role-filtered navigation tabs
│   └── Field/
│       └── GroundCheckinPortal.tsx    # Geofenced Anti-Ghost Block field check-in component
├── context/
│   └── AuthContext.tsx                # Auth state, current user, role switcher, localStorage
├── lib/
│   └── rbac.ts                        # Roles, permissions, route matrix, pre-seeded personas
└── types/
    └── apiContracts.ts                # Update with AppRole, UserProfile, and Auth contracts
```

---

## Role & Route Permission Matrix

| Role | Designation | Permitted Routes | Gated Actions |
| :--- | :--- | :--- | :--- |
| **`CORRIDOR_PLANNER`** | Chief Passenger Transportation Manager (CPTM) | `/planner` | Demand bundling, CP-SAT optimizer, joint block sanctioning |
| **`SECTION_CONTROLLER`** | Chief Section Controller / Station Master | `/interlocking` | Emergency S&T signal clamp, switch SW-04 routing, track circuit lockout |
| **`LOCO_PILOT`** | Kavach TCAS Cab Crew / Loco Pilot | `/vision-telemetry` | Forward cab USFD, TCAS speedometer, EBD deceleration simulation |
| **`SAFETY_AUDITOR`** | Commissioner of Railway Safety (CRS) / Sr. DSO | `/auditor` | RDSO Form 14B attestation, SHA-256 tamper penetration test |
| **`FIELD_WORKER`** | Senior Section Engineer (SSE P-Way/TRD/S&T) | `/field-checkin` | GPS Geofenced check-in, YOLOv11 PPE photo telemetry upload |
| **`ADMIN`** | Divisional Railway Manager (DRM / HQ Admin) | **ALL ROUTES** (`/planner`, `/interlocking`, `/vision-telemetry`, `/auditor`, `/field-checkin`) | Full master access and cross-screen command cockpit |

---

## Tasks Decomposition

### Task 1: RBAC Domain Contracts & Definitions (`src/lib/rbac.ts` & `src/types/apiContracts.ts`)

**Files:**
- Create: `src/lib/rbac.ts`
- Modify: `src/types/apiContracts.ts`
- Test: `tests/rbac.test.ts`

**Interfaces:**
- Produces: `AppRole`, `UserProfile`, `OFFICER_PERSONAS`, `ROLE_ALLOWED_ROUTES`, `ROLE_DEFAULT_ROUTE`, `isRouteAllowedForRole`, `hasRequiredRole`.

- [ ] **Step 1: Write the failing test for RBAC permissions and route matching**

```typescript
// tests/rbac.test.ts
import { describe, it, expect } from 'vitest';
import {
  isRouteAllowedForRole,
  getPermittedTabsForRole,
  ROLE_DEFAULT_ROUTE,
  OFFICER_PERSONAS
} from '../src/lib/rbac';
import { AppRole } from '../src/types/apiContracts';

describe('RBAC Domain Engine', () => {
  it('allows CORRIDOR_PLANNER only on /planner and /login', () => {
    expect(isRouteAllowedForRole('CORRIDOR_PLANNER', '/planner')).toBe(true);
    expect(isRouteAllowedForRole('CORRIDOR_PLANNER', '/interlocking')).toBe(false);
    expect(isRouteAllowedForRole('CORRIDOR_PLANNER', '/auditor')).toBe(false);
  });

  it('allows SECTION_CONTROLLER only on /interlocking', () => {
    expect(isRouteAllowedForRole('SECTION_CONTROLLER', '/interlocking')).toBe(true);
    expect(isRouteAllowedForRole('SECTION_CONTROLLER', '/planner')).toBe(false);
  });

  it('allows LOCO_PILOT only on /vision-telemetry', () => {
    expect(isRouteAllowedForRole('LOCO_PILOT', '/vision-telemetry')).toBe(true);
    expect(isRouteAllowedForRole('LOCO_PILOT', '/auditor')).toBe(false);
  });

  it('allows SAFETY_AUDITOR only on /auditor', () => {
    expect(isRouteAllowedForRole('SAFETY_AUDITOR', '/auditor')).toBe(true);
    expect(isRouteAllowedForRole('SAFETY_AUDITOR', '/interlocking')).toBe(false);
  });

  it('allows FIELD_WORKER only on /field-checkin', () => {
    expect(isRouteAllowedForRole('FIELD_WORKER', '/field-checkin')).toBe(true);
    expect(isRouteAllowedForRole('FIELD_WORKER', '/planner')).toBe(false);
  });

  it('allows ADMIN across all operational routes', () => {
    const roles: AppRole[] = ['ADMIN'];
    expect(isRouteAllowedForRole('ADMIN', '/planner')).toBe(true);
    expect(isRouteAllowedForRole('ADMIN', '/interlocking')).toBe(true);
    expect(isRouteAllowedForRole('ADMIN', '/vision-telemetry')).toBe(true);
    expect(isRouteAllowedForRole('ADMIN', '/auditor')).toBe(true);
    expect(isRouteAllowedForRole('ADMIN', '/field-checkin')).toBe(true);
  });

  it('resolves correct default landing route per role', () => {
    expect(ROLE_DEFAULT_ROUTE.CORRIDOR_PLANNER).toBe('/planner');
    expect(ROLE_DEFAULT_ROUTE.SECTION_CONTROLLER).toBe('/interlocking');
    expect(ROLE_DEFAULT_ROUTE.LOCO_PILOT).toBe('/vision-telemetry');
    expect(ROLE_DEFAULT_ROUTE.SAFETY_AUDITOR).toBe('/auditor');
    expect(ROLE_DEFAULT_ROUTE.FIELD_WORKER).toBe('/field-checkin');
    expect(ROLE_DEFAULT_ROUTE.ADMIN).toBe('/planner');
  });

  it('provides pre-seeded personas for all 6 roles', () => {
    expect(OFFICER_PERSONAS).toHaveLength(6);
    expect(OFFICER_PERSONAS.find(p => p.role === 'SAFETY_AUDITOR')?.employeeId).toBe('CRS-MUM-01');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/rbac.test.ts`
Expected: FAIL (modules not found).

- [ ] **Step 3: Update `src/types/apiContracts.ts` and implement `src/lib/rbac.ts`**

In `src/types/apiContracts.ts`:
```typescript
export type AppRole =
  | 'CORRIDOR_PLANNER'
  | 'SECTION_CONTROLLER'
  | 'LOCO_PILOT'
  | 'SAFETY_AUDITOR'
  | 'FIELD_WORKER'
  | 'ADMIN';

export interface UserProfile {
  id: string;
  employeeId: string;
  fullName: string;
  designation: string;
  role: AppRole;
  department: string;
  division: string;
  stationOrSection: string;
  badgeCode: string;
}
```

In `src/lib/rbac.ts`:
```typescript
import { AppRole, UserProfile } from '@/types/apiContracts';
import { NavbarTab } from '@/components/Navbar';

export const ROLE_DEFAULT_ROUTE: Record<AppRole, string> = {
  CORRIDOR_PLANNER: '/planner',
  SECTION_CONTROLLER: '/interlocking',
  LOCO_PILOT: '/vision-telemetry',
  SAFETY_AUDITOR: '/auditor',
  FIELD_WORKER: '/field-checkin',
  ADMIN: '/planner'
};

export const ROLE_ALLOWED_ROUTES: Record<AppRole, string[]> = {
  CORRIDOR_PLANNER: ['/planner', '/login', '/unauthorized'],
  SECTION_CONTROLLER: ['/interlocking', '/login', '/unauthorized'],
  LOCO_PILOT: ['/vision-telemetry', '/login', '/unauthorized'],
  SAFETY_AUDITOR: ['/auditor', '/login', '/unauthorized'],
  FIELD_WORKER: ['/field-checkin', '/login', '/unauthorized'],
  ADMIN: ['/planner', '/interlocking', '/vision-telemetry', '/auditor', '/field-checkin', '/login', '/unauthorized']
};

export const ROLE_ALLOWED_TABS: Record<AppRole, NavbarTab[]> = {
  CORRIDOR_PLANNER: ['CORRIDOR_PLANNER'],
  SECTION_CONTROLLER: ['INTERLOCKING'],
  LOCO_PILOT: ['VISION_TELEMETRY'],
  SAFETY_AUDITOR: ['AUDITOR_WORKSPACE'],
  FIELD_WORKER: ['FIELD_CHECKIN'],
  ADMIN: ['CORRIDOR_PLANNER', 'INTERLOCKING', 'VISION_TELEMETRY', 'AUDITOR_WORKSPACE', 'FIELD_CHECKIN']
};

export const OFFICER_PERSONAS: UserProfile[] = [
  {
    id: 'usr-cptm-01',
    employeeId: 'CPTM-CR-8801',
    fullName: 'Rajesh Sharma, IRTS',
    designation: 'Chief Passenger Transportation Manager (CPTM)',
    role: 'CORRIDOR_PLANNER',
    department: 'OPERATIONS',
    division: 'Mumbai Division (CR)',
    stationOrSection: 'CSMT HQ Operating Wing',
    badgeCode: 'CPTM'
  },
  {
    id: 'usr-ctrl-02',
    employeeId: 'CTRL-CSMT-402',
    fullName: 'Sunil Deshmukh',
    designation: 'Chief Section Controller (Kalyan Section)',
    role: 'SECTION_CONTROLLER',
    department: 'OPERATING_DISPATCH',
    division: 'Mumbai Division (CR)',
    stationOrSection: 'CSMT Section Control Board',
    badgeCode: 'SC-KYN'
  },
  {
    id: 'usr-loco-03',
    employeeId: 'LP-KYN-9912',
    fullName: 'Vikramjit Singh',
    designation: 'Chief Loco Pilot / TCAS Specialist',
    role: 'LOCO_PILOT',
    department: 'MECHANICAL_RUNNING',
    division: 'Mumbai Division (CR)',
    stationOrSection: 'Kalyan Electric Loco Shed',
    badgeCode: 'LP-CAB'
  },
  {
    id: 'usr-crs-04',
    employeeId: 'CRS-MUM-01',
    fullName: 'Dr. Amitabh Sen, IRSE',
    designation: 'Commissioner of Railway Safety (Central Circle)',
    role: 'SAFETY_AUDITOR',
    department: 'SAFETY_CRS',
    division: 'Ministry of Civil Aviation / Railway Safety',
    stationOrSection: 'Apex Safety Directorate',
    badgeCode: 'CRS-AUDIT'
  },
  {
    id: 'usr-field-05',
    employeeId: 'SSE-PW-BYC-104',
    fullName: 'Rameshwar Patil',
    designation: 'Senior Section Engineer (P-Way Byculla)',
    role: 'FIELD_WORKER',
    department: 'CIVIL_ENGINEERING',
    division: 'Mumbai Division (CR)',
    stationOrSection: 'TC-03 Dadar-Kurla Section',
    badgeCode: 'SSE-FIELD'
  },
  {
    id: 'usr-admin-06',
    employeeId: 'DRM-MUM-001',
    fullName: 'Divisional Railway Manager (DRM)',
    designation: 'DRM Mumbai / Unified Commander',
    role: 'ADMIN',
    department: 'EXECUTIVE_HEADQUARTERS',
    division: 'Central Railway Mumbai Division',
    stationOrSection: 'All Sectors (CSMT-KYN 54KM)',
    badgeCode: 'DRM-HQ'
  }
];

export function isRouteAllowedForRole(role: AppRole, path: string): boolean {
  const allowed = ROLE_ALLOWED_ROUTES[role] || [];
  return allowed.some(route => path === route || path.startsWith(`${route}/`));
}

export function getPermittedTabsForRole(role: AppRole): NavbarTab[] {
  return ROLE_ALLOWED_TABS[role] || [];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/rbac.test.ts`
Expected: PASS (7/7 tests pass).

- [ ] **Step 5: Commit**

```bash
git add src/types/apiContracts.ts src/lib/rbac.ts tests/rbac.test.ts
git commit -m "feat(rbac): implement RBAC domain engine and role-to-route matrix"
```

---

### Task 2: Auth Context & Client-Side Route Guard (`src/context/AuthContext.tsx` & `src/components/Auth/ProtectedRoute.tsx`)

**Files:**
- Create: `src/context/AuthContext.tsx`
- Create: `src/components/Auth/ProtectedRoute.tsx`
- Test: `tests/AuthContext.test.tsx`

**Interfaces:**
- Consumes: `AppRole`, `UserProfile`, `OFFICER_PERSONAS`, `isRouteAllowedForRole`
- Produces: `useAuth()`, `<AuthProvider>`, `<ProtectedRoute allowedRoles={[...]} fallbackUrl="/unauthorized" />`

- [ ] **Step 1: Write the failing test for AuthContext and ProtectedRoute**

```typescript
// tests/AuthContext.test.tsx
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ProtectedRoute } from '../src/components/Auth/ProtectedRoute';

function TestConsumer() {
  const { user, switchRole, logout } = useAuth();
  return (
    <div>
      <span data-testid="user-role">{user?.role}</span>
      <span data-testid="user-name">{user?.fullName}</span>
      <button onClick={() => switchRole('SAFETY_AUDITOR')}>Switch to Auditor</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext & ProtectedRoute Component', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('initializes with default ADMIN persona', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId('user-role').textContent).toBe('ADMIN');
  });

  it('switches persona and persists to localStorage', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    act(() => {
      screen.getByText('Switch to Auditor').click();
    });
    expect(screen.getByTestId('user-role').textContent).toBe('SAFETY_AUDITOR');
    expect(window.localStorage.getItem('railsuraksha_auth_role')).toBe('SAFETY_AUDITOR');
  });

  it('renders children when role is allowed in ProtectedRoute', () => {
    render(
      <AuthProvider>
        <ProtectedRoute allowedRoles={['ADMIN', 'CORRIDOR_PLANNER']}>
          <div data-testid="protected-content">Authorized Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    expect(screen.getByTestId('protected-content')).toBeDefined();
  });

  it('renders statutory access violation when role is forbidden in ProtectedRoute', () => {
    window.localStorage.setItem('railsuraksha_auth_role', 'LOCO_PILOT');
    render(
      <AuthProvider>
        <ProtectedRoute allowedRoles={['CORRIDOR_PLANNER', 'ADMIN']}>
          <div data-testid="protected-content">Authorized Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    expect(screen.queryByTestId('protected-content')).toBeNull();
    expect(screen.getByText(/Access Restricted/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/AuthContext.test.tsx`
Expected: FAIL (modules missing).

- [ ] **Step 3: Implement `src/context/AuthContext.tsx` and `src/components/Auth/ProtectedRoute.tsx`**

In `src/context/AuthContext.tsx`:
```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppRole, UserProfile } from '@/types/apiContracts';
import { OFFICER_PERSONAS } from '@/lib/rbac';

interface AuthContextType {
  user: UserProfile | null;
  role: AppRole;
  isAuthenticated: boolean;
  switchRole: (role: AppRole) => void;
  loginByEmployeeId: (employeeId: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<AppRole>('ADMIN');
  const [user, setUser] = useState<UserProfile | null>(OFFICER_PERSONAS.find(p => p.role === 'ADMIN') || null);

  useEffect(() => {
    const savedRole = window.localStorage.getItem('railsuraksha_auth_role') as AppRole;
    if (savedRole && OFFICER_PERSONAS.some(p => p.role === savedRole)) {
      setRole(savedRole);
      setUser(OFFICER_PERSONAS.find(p => p.role === savedRole) || null);
    }
  }, []);

  const switchRole = (newRole: AppRole) => {
    setRole(newRole);
    const persona = OFFICER_PERSONAS.find(p => p.role === newRole) || null;
    setUser(persona);
    window.localStorage.setItem('railsuraksha_auth_role', newRole);
  };

  const loginByEmployeeId = (employeeId: string): boolean => {
    const persona = OFFICER_PERSONAS.find(p => p.employeeId.toLowerCase() === employeeId.toLowerCase().trim());
    if (persona) {
      switchRole(persona.role);
      return true;
    }
    return false;
  };

  const logout = () => {
    window.localStorage.removeItem('railsuraksha_auth_role');
    setRole('ADMIN');
    setUser(OFFICER_PERSONAS.find(p => p.role === 'ADMIN') || null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        switchRole,
        loginByEmployeeId,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

In `src/components/Auth/ProtectedRoute.tsx`:
```typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { AppRole } from '@/types/apiContracts';
import { useAuth } from '@/context/AuthContext';
import { ROLE_DEFAULT_ROUTE } from '@/lib/rbac';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
  screenName?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  screenName = 'Operational Workspace'
}) => {
  const { role, user } = useAuth();

  const isAllowed = allowedRoles.includes(role);

  if (!isAllowed) {
    const defaultRoute = ROLE_DEFAULT_ROUTE[role] || '/login';
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-white border border-[#D0DFEE] shadow-sm rounded-[16px] text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-amber-50 border border-amber-300 rounded-[12px] flex items-center justify-center text-3xl">
          🛡️
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-[4px] uppercase tracking-wider">
            Statutory Access Control (IRPWM Ch 5 / RDSO Cyber Protocol)
          </span>
          <h2 className="text-xl font-bold text-[#0F172A]">
            Access Restricted: {screenName}
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Your current authenticated role <strong className="text-slate-900 font-mono">[{user?.designation || role}]</strong> is not authorized to access this operational screen.
          </p>
        </div>

        <div className="p-4 bg-[#F0F6FC] border border-[#D0DFEE] rounded-[8px] max-w-md mx-auto text-left text-xs font-mono space-y-1">
          <div className="text-slate-500">Authorized Roles:</div>
          <div className="text-[#2B7FFF] font-semibold">{allowedRoles.join(' • ')}</div>
        </div>

        <div className="flex justify-center items-center gap-3 pt-2">
          <Link
            href={defaultRoute}
            className="px-4 py-2 bg-[#2B7FFF] text-white font-bold text-xs rounded-[4px] hover:bg-blue-600 transition-all shadow-xs"
          >
            Go to Your Authorized Workspace ({role})
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-white text-slate-700 border border-[#D0DFEE] font-bold text-xs rounded-[4px] hover:bg-slate-50 transition-all"
          >
            Switch Role / Re-Authenticate
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/AuthContext.test.tsx`
Expected: PASS (4/4 tests pass).

- [ ] **Step 5: Commit**

```bash
git add src/context/AuthContext.tsx src/components/Auth/ProtectedRoute.tsx tests/AuthContext.test.tsx
git commit -m "feat(auth): add AuthProvider and ProtectedRoute gatekeeper"
```

---

### Task 3: Ground Execution Check-in Component (`src/components/Field/GroundCheckinPortal.tsx`)

**Files:**
- Create: `src/components/Field/GroundCheckinPortal.tsx`
- Test: `tests/GroundCheckinPortal.test.tsx`

**Interfaces:**
- Consumes: `TrackCircuitId`, `MOCK_TRACK_CIRCUITS`
- Produces: `<GroundCheckinPortal />` with GPS Geofencing verification ($\pm 100\text{m}$), YOLOv11 Headcount & PPE check, and OHE double earthing rod telemetry.

- [ ] **Step 1: Write the failing test for GroundCheckinPortal**

```typescript
// tests/GroundCheckinPortal.test.tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GroundCheckinPortal } from '../src/components/Field/GroundCheckinPortal';
import { AuthProvider } from '../src/context/AuthContext';

describe('GroundCheckinPortal Component', () => {
  it('renders GPS Geofence boundary inspector and track circuits', () => {
    render(
      <AuthProvider>
        <GroundCheckinPortal />
      </AuthProvider>
    );
    expect(screen.getByText(/Ground Execution Verification Portal/i)).toBeDefined();
    expect(screen.getByText(/Anti-Ghost Block/i)).toBeDefined();
    expect(screen.getByText(/TC-03/i)).toBeDefined();
  });

  it('triggers GPS simulation verification and displays on-site check-in stamp', () => {
    render(
      <AuthProvider>
        <GroundCheckinPortal />
      </AuthProvider>
    );
    const verifyBtn = screen.getByText(/Verify GPS & Submit Work Check-In/i);
    fireEvent.click(verifyBtn);
    expect(screen.getByText(/Verified On-Site Activity/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/GroundCheckinPortal.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/components/Field/GroundCheckinPortal.tsx`**

Implement the full Light-Blue Mintlify component with GPS Geofencing table (KM 0.0 - 54.0), simulated YOLOv11 PPE & headcount inspection, OHE 25kV earthing rod validation, and instant field work order submission.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/GroundCheckinPortal.test.tsx`
Expected: PASS (2/2 tests pass).

- [ ] **Step 5: Commit**

```bash
git add src/components/Field/GroundCheckinPortal.tsx tests/GroundCheckinPortal.test.tsx
git commit -m "feat(field): add ground execution checkin portal with anti-ghost block geofencing"
```

---

### Task 4: Decouple 5 Dedicated Screen Pages & Login/Unauthorized Routes in Next.js App Router

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/unauthorized/page.tsx`
- Create: `src/app/planner/page.tsx`
- Create: `src/app/interlocking/page.tsx`
- Create: `src/app/vision-telemetry/page.tsx`
- Create: `src/app/auditor/page.tsx`
- Create: `src/app/field-checkin/page.tsx`
- Modify: `src/app/layout.tsx` (wrap with `<AuthProvider>`)
- Test: `tests/DecoupledRoutes.test.tsx`

**Interfaces:**
- Consumes: Screen components (`CorridorStringChart`, `InterlockingMap`, `DefectVisionTelemetry`, `AuditorWorkspace`, `GroundCheckinPortal`, `ProtectedRoute`)
- Produces: Independent Next.js endpoints guarded by explicit RBAC rules.

- [ ] **Step 1: Write the failing test for decoupled page endpoints**

```typescript
// tests/DecoupledRoutes.test.tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../src/context/AuthContext';
import PlannerPage from '../src/app/planner/page';
import InterlockingPage from '../src/app/interlocking/page';
import VisionTelemetryPage from '../src/app/vision-telemetry/page';
import AuditorPage from '../src/app/auditor/page';
import FieldCheckinPage from '../src/app/field-checkin/page';
import LoginPage from '../src/app/login/page';
import UnauthorizedPage from '../src/app/unauthorized/page';

describe('Decoupled RBAC Screen Endpoints', () => {
  it('renders PlannerPage under ADMIN role', () => {
    render(
      <AuthProvider>
        <PlannerPage />
      </AuthProvider>
    );
    expect(screen.getByText(/Peripheral Recharts Analytics Suite/i)).toBeDefined();
  });

  it('renders InterlockingPage under ADMIN role', () => {
    render(
      <AuthProvider>
        <InterlockingPage />
      </AuthProvider>
    );
    expect(screen.getByText(/Section Interlocking & Track Circuit Schematic/i)).toBeDefined();
  });

  it('renders VisionTelemetryPage under ADMIN role', () => {
    render(
      <AuthProvider>
        <VisionTelemetryPage />
      </AuthProvider>
    );
    expect(screen.getByText(/Tactical Maintenance & Cab Vision Console/i)).toBeDefined();
  });

  it('renders AuditorPage under ADMIN role', () => {
    render(
      <AuthProvider>
        <AuditorPage />
      </AuthProvider>
    );
    expect(screen.getByText(/Statutory Compliance Terminal/i)).toBeDefined();
  });

  it('renders FieldCheckinPage under ADMIN role', () => {
    render(
      <AuthProvider>
        <FieldCheckinPage />
      </AuthProvider>
    );
    expect(screen.getByText(/Ground Execution Verification Portal/i)).toBeDefined();
  });

  it('renders LoginPage with all 6 official railway personas', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );
    expect(screen.getByText(/Railway Officer Authentication & Role Selector/i)).toBeDefined();
    expect(screen.getByText(/Rajesh Sharma, IRTS/i)).toBeDefined();
    expect(screen.getByText(/Dr. Amitabh Sen, IRSE/i)).toBeDefined();
  });

  it('renders UnauthorizedPage with statutory violation warnings', () => {
    render(
      <AuthProvider>
        <UnauthorizedPage />
      </AuthProvider>
    );
    expect(screen.getByText(/Statutory Role Violation/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/DecoupledRoutes.test.tsx`
Expected: FAIL (pages do not exist).

- [ ] **Step 3: Implement decoupled page routes**

1. `src/app/layout.tsx`: Wrap `children` in `<AuthProvider>`.
2. `src/app/login/page.tsx`: 6 interactive persona cards with 1-click login and immediate redirect to default route.
3. `src/app/unauthorized/page.tsx`: Compliance warning with link to permitted views.
4. `src/app/planner/page.tsx`: Protected by `allowedRoles={['CORRIDOR_PLANNER', 'ADMIN']}`.
5. `src/app/interlocking/page.tsx`: Protected by `allowedRoles={['SECTION_CONTROLLER', 'ADMIN']}`.
6. `src/app/vision-telemetry/page.tsx`: Protected by `allowedRoles={['LOCO_PILOT', 'ADMIN']}`.
7. `src/app/auditor/page.tsx`: Protected by `allowedRoles={['SAFETY_AUDITOR', 'ADMIN']}`.
8. `src/app/field-checkin/page.tsx`: Protected by `allowedRoles={['FIELD_WORKER', 'ADMIN']}`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/DecoupledRoutes.test.tsx`
Expected: PASS (7/7 tests pass).

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/login/page.tsx src/app/unauthorized/page.tsx src/app/planner/page.tsx src/app/interlocking/page.tsx src/app/vision-telemetry/page.tsx src/app/auditor/page.tsx src/app/field-checkin/page.tsx tests/DecoupledRoutes.test.tsx
git commit -m "feat(routes): create individual decoupled Next.js pages with RBAC protection"
```

---

### Task 5: Dynamic Role-Aware Navbar & Fast Role Switcher (`src/components/Navbar.tsx`)

**Files:**
- Modify: `src/components/Navbar.tsx`
- Create: `src/components/Auth/RoleSwitcherDropdown.tsx`
- Test: `tests/NavbarRbac.test.tsx`

**Interfaces:**
- Consumes: `useAuth()`, `getPermittedTabsForRole`, `NavbarTab`
- Produces: Dynamic navigation bar rendering only authorized tabs with direct Next.js link navigation and active role badge.

- [ ] **Step 1: Write the failing test for dynamic role-filtered navigation**

```typescript
// tests/NavbarRbac.test.tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Navbar } from '../src/components/Navbar';
import { AuthProvider } from '../src/context/AuthContext';

describe('Navbar RBAC Dynamic Tab Filtering', () => {
  it('renders all 5 tabs when logged in as ADMIN', () => {
    window.localStorage.setItem('railsuraksha_auth_role', 'ADMIN');
    render(
      <AuthProvider>
        <Navbar
          activeTab="CORRIDOR_PLANNER"
          onTabChange={() => {}}
          deploymentMode="ADVISORY"
          onModeToggle={() => {}}
          isDarkMode={false}
          onThemeToggle={() => {}}
        />
      </AuthProvider>
    );
    expect(screen.getByText(/1. Corridor Planner/i)).toBeDefined();
    expect(screen.getByText(/2. Interlocking Map/i)).toBeDefined();
    expect(screen.getByText(/3. Defect Vision & Telemetry/i)).toBeDefined();
    expect(screen.getByText(/4. Auditor Workspace/i)).toBeDefined();
  });

  it('renders only Auditor Workspace tab when logged in as SAFETY_AUDITOR', () => {
    window.localStorage.setItem('railsuraksha_auth_role', 'SAFETY_AUDITOR');
    render(
      <AuthProvider>
        <Navbar
          activeTab="AUDITOR_WORKSPACE"
          onTabChange={() => {}}
          deploymentMode="ADVISORY"
          onModeToggle={() => {}}
          isDarkMode={false}
          onThemeToggle={() => {}}
        />
      </AuthProvider>
    );
    expect(screen.getByText(/4. Auditor Workspace/i)).toBeDefined();
    expect(screen.queryByText(/1. Corridor Planner/i)).toBeNull();
    expect(screen.queryByText(/2. Interlocking Map/i)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/NavbarRbac.test.tsx`
Expected: FAIL (Navbar not consuming role context).

- [ ] **Step 3: Update `Navbar.tsx` and create `RoleSwitcherDropdown.tsx`**

Integrate `useAuth()` into `Navbar.tsx`, filter rendered tabs by `getPermittedTabsForRole(role)`, add active officer badge, and embed the 1-click `RoleSwitcherDropdown.tsx` for easy demonstration and testing.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/NavbarRbac.test.tsx`
Expected: PASS (2/2 tests pass).

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.tsx src/components/Auth/RoleSwitcherDropdown.tsx tests/NavbarRbac.test.tsx
git commit -m "feat(navbar): add dynamic role-based tab filtering and role switcher dropdown"
```

---

### Task 6: Full Regression Verification & Documentation Update

**Files:**
- Modify: `context.md`
- Modify: `features_implemented.md`
- Modify: `tracker.md`

- [ ] **Step 1: Run complete Vitest test suite**

Run: `npm test` (`npx vitest run`)
Expected: 100% pass across all test files (both legacy test suites and new RBAC suites).

- [ ] **Step 2: Verify Next.js build and TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: 0 errors (clean exit code 0).

- [ ] **Step 3: Update persistent tracking files**

Update `context.md`, `features_implemented.md`, and `tracker.md` with the decoupled route architecture and RBAC specifications.

- [ ] **Step 4: Commit**

```bash
git add context.md features_implemented.md tracker.md
git commit -m "docs: record decoupled RBAC endpoints and ground verification in tracking files"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-28-decouple-screens-rbac-endpoints.md`. Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach would you like to take?**

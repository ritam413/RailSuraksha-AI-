// tests/rbac.test.ts
import { describe, it, expect } from 'vitest';
import {
  ALL_APP_ROLES,
  isValidAppRole,
  ROLE_DEFAULT_ROUTE,
  ROLE_ALLOWED_ROUTES,
  ROLE_ALLOWED_TABS,
  OFFICER_PERSONAS,
  isRouteAllowedForRole,
  getPermittedTabsForRole
} from '@/lib/rbac';
import { AppRole } from '@/types/apiContracts';

describe('RBAC Domain & Route Permission Matrix', () => {
  it('defines exactly the 6 required operational roles', () => {
    expect(ALL_APP_ROLES).toEqual([
      'CORRIDOR_PLANNER',
      'SECTION_CONTROLLER',
      'LOCO_PILOT',
      'SAFETY_AUDITOR',
      'FIELD_WORKER',
      'ADMIN'
    ]);
  });

  it('validates strings with isValidAppRole', () => {
    expect(isValidAppRole('CORRIDOR_PLANNER')).toBe(true);
    expect(isValidAppRole('ADMIN')).toBe(true);
    expect(isValidAppRole('LOCO_PILOT')).toBe(true);
    expect(isValidAppRole('RANDOM_USER')).toBe(false);
    expect(isValidAppRole(123)).toBe(false);
    expect(isValidAppRole(null)).toBe(false);
  });

  it('assigns correct default routes per role', () => {
    expect(ROLE_DEFAULT_ROUTE.CORRIDOR_PLANNER).toBe('/planner');
    expect(ROLE_DEFAULT_ROUTE.SECTION_CONTROLLER).toBe('/interlocking');
    expect(ROLE_DEFAULT_ROUTE.LOCO_PILOT).toBe('/vision-telemetry');
    expect(ROLE_DEFAULT_ROUTE.SAFETY_AUDITOR).toBe('/auditor');
    expect(ROLE_DEFAULT_ROUTE.FIELD_WORKER).toBe('/field-checkin');
    expect(ROLE_DEFAULT_ROUTE.ADMIN).toBe('/admin');
  });

  it('correctly validates route permissions with isRouteAllowedForRole', () => {
    // CORRIDOR_PLANNER
    expect(isRouteAllowedForRole('CORRIDOR_PLANNER', '/planner')).toBe(true);
    expect(isRouteAllowedForRole('CORRIDOR_PLANNER', '/interlocking')).toBe(false);
    expect(isRouteAllowedForRole('CORRIDOR_PLANNER', '/vision-telemetry')).toBe(false);

    // SECTION_CONTROLLER
    expect(isRouteAllowedForRole('SECTION_CONTROLLER', '/interlocking')).toBe(true);
    expect(isRouteAllowedForRole('SECTION_CONTROLLER', '/planner')).toBe(false);

    // LOCO_PILOT
    expect(isRouteAllowedForRole('LOCO_PILOT', '/vision-telemetry')).toBe(true);
    expect(isRouteAllowedForRole('LOCO_PILOT', '/auditor')).toBe(false);

    // SAFETY_AUDITOR
    expect(isRouteAllowedForRole('SAFETY_AUDITOR', '/auditor')).toBe(true);
    expect(isRouteAllowedForRole('SAFETY_AUDITOR', '/field-checkin')).toBe(false);

    // FIELD_WORKER
    expect(isRouteAllowedForRole('FIELD_WORKER', '/field-checkin')).toBe(true);
    expect(isRouteAllowedForRole('FIELD_WORKER', '/planner')).toBe(false);

    // ADMIN (Master Cockpit)
    expect(isRouteAllowedForRole('ADMIN', '/planner')).toBe(true);
    expect(isRouteAllowedForRole('ADMIN', '/interlocking')).toBe(true);
    expect(isRouteAllowedForRole('ADMIN', '/vision-telemetry')).toBe(true);
    expect(isRouteAllowedForRole('ADMIN', '/auditor')).toBe(true);
    expect(isRouteAllowedForRole('ADMIN', '/field-checkin')).toBe(true);
  });

  it('filters navbar tabs correctly with getPermittedTabsForRole', () => {
    expect(getPermittedTabsForRole('CORRIDOR_PLANNER')).toEqual(['CORRIDOR_PLANNER']);
    expect(getPermittedTabsForRole('SECTION_CONTROLLER')).toEqual(['INTERLOCKING']);
    expect(getPermittedTabsForRole('LOCO_PILOT')).toEqual(['VISION_TELEMETRY']);
    expect(getPermittedTabsForRole('SAFETY_AUDITOR')).toEqual(['AUDITOR_WORKSPACE']);
    expect(getPermittedTabsForRole('FIELD_WORKER')).toEqual(['FIELD_CHECKIN']);
    expect(getPermittedTabsForRole('ADMIN')).toEqual([
      'CORRIDOR_PLANNER',
      'INTERLOCKING',
      'VISION_TELEMETRY',
      'AUDITOR_WORKSPACE',
      'FIELD_CHECKIN'
    ]);
  });

  it('contains 6 fully configured officer personas with valid employee IDs', () => {
    expect(OFFICER_PERSONAS.length).toBe(6);
    const cptm = OFFICER_PERSONAS.find((p) => p.role === 'CORRIDOR_PLANNER');
    expect(cptm?.employeeId).toBe('CPTM-CR-8801');
    expect(cptm?.badgeCode).toBe('CPTM');

    const loco = OFFICER_PERSONAS.find((p) => p.role === 'LOCO_PILOT');
    expect(loco?.employeeId).toBe('LP-KYN-9912');

    const sse = OFFICER_PERSONAS.find((p) => p.role === 'FIELD_WORKER');
    expect(sse?.employeeId).toBe('SSE-PW-BYC-104');
  });
});

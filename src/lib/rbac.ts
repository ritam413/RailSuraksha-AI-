import { AppRole, UserProfile } from '@/types/apiContracts';
import { NavbarTab } from '@/components/Navbar';

export const ALL_APP_ROLES: AppRole[] = [
  'CORRIDOR_PLANNER',
  'SECTION_CONTROLLER',
  'LOCO_PILOT',
  'SAFETY_AUDITOR',
  'FIELD_WORKER',
  'ADMIN'
];

export function isValidAppRole(value: unknown): value is AppRole {
  return typeof value === 'string' && ALL_APP_ROLES.includes(value as AppRole);
}

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

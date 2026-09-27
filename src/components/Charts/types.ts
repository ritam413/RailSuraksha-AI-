// src/components/Charts/types.ts
// Contract Definitions and Design Tokens for Recharts Analytics Suite (TICKET-DEV2-03)

import { WeatherCondition, MaintenanceDemand, DepartmentCode } from '@/types/apiContracts';

export interface DecelerationCurveProps {
  initialSpeedKmh?: number;            // Train initial/target cruising speed (default: 90 km/h)
  targetObstacleDistanceMeters?: number;// Distance to target signal/obstacle (default: 850m)
  currentDistanceMeters?: number;       // Live position for telemetry marker dot
  currentSpeedKmh?: number;            // Live telemetry speed
  tsrSpeedLimitKmh?: number;           // Enforced TSR ceiling speed (default: 30 km/h)
  weatherCondition?: WeatherCondition;  // Atmospheric grip state (default: 'DRY')
  gradientPercent?: number;            // Track gradient (default: 0.002)
  width?: number | string;             // Container override for responsive/test rendering
  height?: number | string;            // Default: 320px
  showLegend?: boolean;                // Default: true
  showTelemetryMarker?: boolean;       // Default: true
  showMetricsStrip?: boolean;          // Default: true
  showControls?: boolean;              // Default: false
  className?: string;
}

export interface CurveDataPoint {
  distanceMeters: number;
  serviceSpeedKmh: number;
  emergencySpeedKmh: number;
  tsrSpeedKmh: number;
}

export interface PhysicsCalculationResult {
  v0_ms: number;
  a_emergency: number;
  a_service: number;
  ebdDistance_m: number;
  safeMargin_m: number;
  timeToStop_sec: number;
  status: 'SAFE' | 'ADVISORY' | 'CRITICAL';
}

export interface DepartmentMetadata {
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  darkColor: string;
  bgColor: string;
  borderColor: string;
}

export const DEPARTMENT_METADATA_MAP: Record<DepartmentCode | 'ROLLING_STOCK' | 'OTHER', DepartmentMetadata> = {
  TMS_CIVIL: {
    label: 'TMS Track Civil Engineering',
    shortLabel: 'TMS Track Civil',
    description: 'Rail fractures, Turnout tamping, USFD defects',
    color: '#F97316',      // Orange
    darkColor: '#991B1B',  // Crimson
    bgColor: '#FFF7ED',
    borderColor: '#FFEDD5'
  },
  TDMS_ELECTRICAL: {
    label: 'TDMS Traction & OHE Electrical',
    shortLabel: 'TDMS Traction OHE',
    description: '25kV power blocks, Catenary tensioning, Droppers',
    color: '#FBBF24',      // Amber
    darkColor: '#92400E',  // Dark Amber
    bgColor: '#FEFCE8',
    borderColor: '#FEF08A'
  },
  SMMS_SIGNAL: {
    label: 'SMMS Signal & Telecom (S&T)',
    shortLabel: 'SMMS Signal & Telecom',
    description: 'Point machines, AFTC tuning, Axle counters',
    color: '#3B82F6',      // Blue
    darkColor: '#1E40AF',  // Deep Blue
    bgColor: '#EFF6FF',
    borderColor: '#DBEAFE'
  },
  ROLLING_STOCK: {
    label: 'Rolling Stock & Others',
    shortLabel: 'Rolling Stock',
    description: 'Loco maintenance, rake stabling, coach wash',
    color: '#64748B',      // Slate
    darkColor: '#334155',  // Dark Slate
    bgColor: '#F8FAFC',
    borderColor: '#E2E8F0'
  },
  OTHER: {
    label: 'Miscellaneous Demands',
    shortLabel: 'Other Demands',
    description: 'General corridor maintenance and logistics',
    color: '#94A3B8',      // Dim Slate
    darkColor: '#475569',
    bgColor: '#F1F5F9',
    borderColor: '#CBD5E1'
  }
};

export interface DepartmentSliceData {
  department: DepartmentCode | 'ROLLING_STOCK' | 'OTHER';
  label: string;
  shortLabel: string;
  description: string;
  count: number;
  p1Count: number;
  totalDurationMinutes: number;
  totalDurationHours: number;
  color: string;
  darkColor: string;
  bgColor: string;
  borderColor: string;
  percentage: number;
}

export interface TriageDonutProps {
  demands?: MaintenanceDemand[];        // Ingests live demand array or falls back to MOCK_DEMANDS
  selectedDepartment?: DepartmentCode | 'ALL' | string;
  onSelectDepartment?: (dept: DepartmentCode | 'ALL') => void;
  width?: number | string;
  height?: number | string;            // Default: 280px
  innerRadius?: number | string;       // Default: '62%'
  outerRadius?: number | string;       // Default: '88%'
  showCenterSummary?: boolean;         // Default: true (Displays count & total time in donut hole)
  showBreakdownList?: boolean;         // Default: true
  className?: string;
}

export const CHART_PALETTE = {
  service: '#2B7FFF',
  emergency: '#EF4444',
  tsr: '#F59E0B',
  marker: '#10B981',
  target: '#DC2626',
  border: '#D0DFEE',
  grid: '#E2E8F0',
  surface: '#FFFFFF',
  base: '#F0F6FC'
};

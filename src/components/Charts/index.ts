// src/components/Charts/index.ts
// Barrel Export for Recharts Analytics Suite (TICKET-DEV2-03)

export {
  DecelerationCurve,
  calculateDecelerationPhysics,
  generateDecelerationPoints
} from './DecelerationCurve';

export {
  TriageDonut,
  aggregateDemandsByDepartment
} from './TriageDonut';

export {
  CHART_PALETTE,
  DEPARTMENT_METADATA_MAP
} from './types';

export type {
  DecelerationCurveProps,
  CurveDataPoint,
  PhysicsCalculationResult,
  TriageDonutProps,
  DepartmentSliceData,
  DepartmentMetadata
} from './types';

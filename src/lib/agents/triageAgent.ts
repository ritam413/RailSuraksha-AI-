// src/lib/agents/triageAgent.ts
// AI Triage Severity Scoring Classifier

import { IncidentRecord, SeverityCategory } from '@/types/apiContracts';

export function classifyIncidentSeverity(
  hazardClass: 'BOULDER' | 'RAIL_FRACTURE' | 'CROWD_SURGE' | 'CATTLE',
  confidence: number,
  distanceMeters: number
): { severityCategory: SeverityCategory; severityScore: number } {
  let baseScore = confidence * 0.7;

  if (hazardClass === 'BOULDER' || hazardClass === 'RAIL_FRACTURE') {
    baseScore += 0.3;
  } else if (hazardClass === 'CROWD_SURGE') {
    baseScore += 0.2;
  } else {
    baseScore += 0.1;
  }

  // Distance penalty
  if (distanceMeters < 500) {
    baseScore += 0.1;
  }

  const severityScore = Number(Math.min(1.0, baseScore).toFixed(3));
  let severityCategory: SeverityCategory = 'LOW';

  if (severityScore >= 0.85) {
    severityCategory = 'CRITICAL';
  } else if (severityScore >= 0.65) {
    severityCategory = 'MODERATE';
  }

  return { severityCategory, severityScore };
}

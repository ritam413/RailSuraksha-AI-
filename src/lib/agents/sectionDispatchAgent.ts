// src/lib/agents/sectionDispatchAgent.ts
// Section Dispatch Platform Hold & Crowd Density Agent

import { PlatformHoldState } from '@/types/apiContracts';

export function calculatePlatformHoldState(
  stationCode: string = 'CSMT',
  heldPlatformId: string = 'PLATFORM_18',
  adjacentPlatformId: string = 'PLATFORM_17',
  gatewayCrowdCount: number = 482,
  remainingSeconds: number = 252
): PlatformHoldState {
  // Density index rho bounded between 0.0 and 1.0
  const gatewayOccupancyIndex = Number(Math.min(1.0, gatewayCrowdCount / 550).toFixed(2));
  const isMlExtensionActive = gatewayOccupancyIndex > 0.8;

  let status: PlatformHoldState['status'] = 'HOLD_ACTIVE';
  if (remainingSeconds <= 0) {
    status = 'RELEASED';
  } else if (remainingSeconds < 60) {
    status = 'CLEARING';
  }

  return {
    stationCode,
    heldPlatformId,
    adjacentPlatformId,
    gatewayOccupancyIndex,
    gatewayCrowdCount,
    remainingHoldSeconds: remainingSeconds,
    isMlExtensionActive,
    status
  };
}

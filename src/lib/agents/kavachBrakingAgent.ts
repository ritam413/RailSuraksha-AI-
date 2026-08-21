// src/lib/agents/kavachBrakingAgent.ts
// Kavach Emergency Braking Distance (EBD) Physics Agent

import { EbdCalculationResult } from '@/types/apiContracts';

export interface BrakingInputs {
  trainId: string;
  velocityKmh: number;
  obstacleDistanceMeters: number;
  frictionCoefficient?: number; // default steel rail mu = 0.134
  gradientPercent?: number;     // default G = 0.002
  reactionTimeSeconds?: number;// default t_reaction = 2.0s
}

/**
 * Calculates RDSO Emergency Braking Distance (EBD):
 * D_stop = (V^2 / (2 * g * (mu + G))) + (V * t_reaction)
 */
export function calculateKavachEbd(inputs: BrakingInputs): EbdCalculationResult {
  const {
    trainId,
    velocityKmh,
    obstacleDistanceMeters,
    frictionCoefficient = 0.134,
    gradientPercent = 0.002,
    reactionTimeSeconds = 1.96
  } = inputs;

  const g = 9.81; // Acceleration due to gravity (m/s^2)
  const vMs = (velocityKmh * 1000) / 3600; // Convert km/h to m/s

  // Braking distance component
  const dBrake = Math.pow(vMs, 2) / (2 * g * (frictionCoefficient + gradientPercent));
  
  // Reaction distance component
  const dReaction = vMs * reactionTimeSeconds;
  
  // Total calculated stopping distance
  const calculatedStoppingDistanceMeters = Math.round(dBrake + dReaction);
  const marginDistanceMeters = obstacleDistanceMeters - calculatedStoppingDistanceMeters;
  const isCollisionRisk = calculatedStoppingDistanceMeters >= obstacleDistanceMeters;

  return {
    trainId,
    velocityKmh,
    obstacleDistanceMeters,
    calculatedStoppingDistanceMeters,
    marginDistanceMeters,
    isCollisionRisk,
    requiredDecelerationMs2: Number((Math.pow(vMs, 2) / (2 * obstacleDistanceMeters)).toFixed(2)),
    brakeState: isCollisionRisk ? 'EMERGENCY_SOLENOID_ACTUATED' : 'CLEAR'
  };
}

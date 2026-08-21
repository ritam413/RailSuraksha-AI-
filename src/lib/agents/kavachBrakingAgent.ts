import { EbdCalculationResult, WeatherCondition } from '@/types/apiContracts';

export interface BrakingInputs {
  trainId: string;
  velocityKmh: number;
  obstacleDistanceMeters: number;
  frictionCoefficient?: number; // default steel rail mu = 0.134
  gradientPercent?: number;     // default G = 0.002
  reactionTimeSeconds?: number;// default t_reaction = 2.0s
  weatherCondition?: WeatherCondition;
}

/**
 * Returns RDSO-standard adjusted friction coefficient and reaction buffer based on atmospheric conditions
 */
export function getWeatherFrictionParams(weather: WeatherCondition): {
  frictionCoefficient: number;
  reactionTimeMultiplier: number;
  label: string;
  riskFactor: string;
} {
  switch (weather) {
    case 'WET_MONSOON':
      return {
        frictionCoefficient: 0.095, // Hydroplaning risk on wet steel rail
        reactionTimeMultiplier: 1.25,
        label: 'Monsoon Heavy Rain',
        riskFactor: 'HIGH SLIPPAGE (+35% Stopping Distance)',
      };
    case 'DENSE_FOG':
      return {
        frictionCoefficient: 0.115, // Dew/moisture on cold rail
        reactionTimeMultiplier: 1.4,
        label: 'Severe Winter Fog',
        riskFactor: 'LIMITED SIGHT DISTANCE (220m HUD Cap)',
      };
    case 'NIGHT_IR':
      return {
        frictionCoefficient: 0.130,
        reactionTimeMultiplier: 1.1,
        label: 'Night Vision IR',
        riskFactor: 'THERMAL SPECTRAL ENHANCED',
      };
    case 'DRY':
    default:
      return {
        frictionCoefficient: 0.134,
        reactionTimeMultiplier: 1.0,
        label: 'Clear Dry Track',
        riskFactor: 'OPTIMAL ADHESION',
      };
  }
}

/**
 * Calculates RDSO Emergency Braking Distance (EBD):
 * D_stop = (V^2 / (2 * g * (mu + G))) + (V * t_reaction)
 */
export function calculateKavachEbd(inputs: BrakingInputs): EbdCalculationResult {
  const weatherParams = inputs.weatherCondition ? getWeatherFrictionParams(inputs.weatherCondition) : null;
  const effectiveFriction = weatherParams ? weatherParams.frictionCoefficient : (inputs.frictionCoefficient ?? 0.134);
  const effectiveReactionTime = weatherParams ? (1.96 * weatherParams.reactionTimeMultiplier) : (inputs.reactionTimeSeconds ?? 1.96);

  const {
    trainId,
    velocityKmh,
    obstacleDistanceMeters,
    gradientPercent = 0.002,
  } = inputs;

  const frictionCoefficient = effectiveFriction;
  const reactionTimeSeconds = effectiveReactionTime;

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

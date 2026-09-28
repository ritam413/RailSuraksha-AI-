// src/components/Charts/DecelerationCurve.tsx
// RDSO Kavach Ver 4.0 Deceleration Curve & Braking Physics Visualizer (TICKET-DEV2-03)

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot
} from 'recharts';
import { WeatherCondition } from '@/types/apiContracts';
import {
  DecelerationCurveProps,
  CurveDataPoint,
  PhysicsCalculationResult,
  CHART_PALETTE
} from './types';
import { getWeatherFrictionParams } from '@/lib/agents/kavachBrakingAgent';

/**
 * Calculates RDSO Kavach Ver 4.0 Kinematic Braking Parameters with safety clamps.
 */
export function calculateDecelerationPhysics(
  v0_kmh: number = 90,
  targetDistance_m: number = 850,
  weather: WeatherCondition = 'DRY',
  gradient: number = 0.002
): PhysicsCalculationResult {
  const safeV0Kmh = Math.max(0, Math.min(160, isNaN(v0_kmh) ? 90 : v0_kmh));
  const safeTargetMeters = Math.max(100, isNaN(targetDistance_m) ? 850 : targetDistance_m);
  const safeGradient = isNaN(gradient) ? 0.002 : gradient;

  const weatherParams = getWeatherFrictionParams(weather);
  const mu_rail = weatherParams.frictionCoefficient;
  const t_reaction = 1.0 * weatherParams.reactionTimeMultiplier;

  const v0_ms = safeV0Kmh * (1000 / 3600);
  const g = 9.81;

  // Effective Emergency Deceleration (adjusted for rail grip & track slope)
  // FDE Defensive clamp: deceleration cannot fall below 0.15 m/s² even on steep downhills
  const raw_a_emergency = g * (mu_rail + safeGradient);
  const a_emergency = Math.max(0.15, raw_a_emergency);

  // Standard Service Deceleration
  const a_service = 0.65;

  // Emergency Braking Distance: d_EBD = v^2 / (2 * a_eff) + (v * t_reaction)
  const ebdDistance_m = (Math.pow(v0_ms, 2) / (2 * a_emergency)) + (v0_ms * t_reaction);

  // Safe Stopping Margin
  const safeMargin_m = safeTargetMeters - ebdDistance_m;

  // Total Time to Full Stop
  const timeToStop_sec = (v0_ms / a_emergency) + t_reaction;

  let status: 'SAFE' | 'ADVISORY' | 'CRITICAL' = 'SAFE';
  if (safeMargin_m < 0) {
    status = 'CRITICAL';
  } else if (safeMargin_m < 150) {
    status = 'ADVISORY';
  }

  return {
    v0_ms,
    a_emergency: Number(a_emergency.toFixed(2)),
    a_service,
    ebdDistance_m: Math.round(ebdDistance_m),
    safeMargin_m: Math.round(safeMargin_m),
    timeToStop_sec: Number(timeToStop_sec.toFixed(1)),
    status
  };
}

/**
 * Generates coordinate array for Recharts deceleration profiles.
 */
export function generateDecelerationPoints(
  v0_kmh: number = 90,
  weather: WeatherCondition = 'DRY',
  gradient: number = 0.002,
  tsrLimitKmh: number = 30,
  maxDistance: number = 1200,
  stepMeters: number = 25
): CurveDataPoint[] {
  const physics = calculateDecelerationPhysics(v0_kmh, maxDistance, weather, gradient);
  const v0_ms = physics.v0_ms;
  const a_emergency = physics.a_emergency;
  const a_service = physics.a_service;

  const points: CurveDataPoint[] = [];

  for (let d = 0; d <= maxDistance; d += stepMeters) {
    // Kinematic speed profile: v(d) = sqrt(max(0, v0^2 - 2 * a * d))
    const vEmergencySq = Math.max(0, Math.pow(v0_ms, 2) - 2 * a_emergency * d);
    const emergencyKmh = Number((Math.sqrt(vEmergencySq) * 3.6).toFixed(1));

    const vServiceSq = Math.max(0, Math.pow(v0_ms, 2) - 2 * a_service * d);
    const serviceKmh = Number((Math.sqrt(vServiceSq) * 3.6).toFixed(1));

    points.push({
      distanceMeters: d,
      emergencySpeedKmh: emergencyKmh,
      serviceSpeedKmh: serviceKmh,
      tsrSpeedKmh: tsrLimitKmh
    });
  }

  return points;
}

export const DecelerationCurve: React.FC<DecelerationCurveProps> = ({
  initialSpeedKmh = 90,
  targetObstacleDistanceMeters = 850,
  currentDistanceMeters = 420,
  currentSpeedKmh,
  tsrSpeedLimitKmh = 30,
  weatherCondition = 'DRY',
  gradientPercent = 0.002,
  width,
  height = 320,
  showLegend = true,
  showTelemetryMarker = true,
  showMetricsStrip = true,
  className = ''
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [visibleCurves, setVisibleCurves] = useState({
    service: true,
    emergency: true,
    tsr: true
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const physics = useMemo(() => {
    return calculateDecelerationPhysics(
      initialSpeedKmh,
      targetObstacleDistanceMeters,
      weatherCondition,
      gradientPercent
    );
  }, [initialSpeedKmh, targetObstacleDistanceMeters, weatherCondition, gradientPercent]);

  const chartData = useMemo(() => {
    return generateDecelerationPoints(
      initialSpeedKmh,
      weatherCondition,
      gradientPercent,
      tsrSpeedLimitKmh,
      1200,
      25
    );
  }, [initialSpeedKmh, weatherCondition, gradientPercent, tsrSpeedLimitKmh]);

  // Derived live speed if not explicitly passed
  const telemetrySpeed = useMemo(() => {
    if (currentSpeedKmh !== undefined) return currentSpeedKmh;
    const v0_ms = physics.v0_ms;
    const vLiveSq = Math.max(0, Math.pow(v0_ms, 2) - 2 * physics.a_emergency * (currentDistanceMeters || 0));
    return Number((Math.sqrt(vLiveSq) * 3.6).toFixed(1));
  }, [currentSpeedKmh, physics.v0_ms, physics.a_emergency, currentDistanceMeters]);

  // Status Badge Rendering
  const statusBadge = useMemo(() => {
    if (physics.status === 'SAFE') {
      return (
        <span
          data-testid="kavach-status-badge"
          className="bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] text-[11px] font-bold px-2 py-0.5 rounded-[4px] font-mono tracking-wider inline-flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
          SAFE BRAKING MARGIN
        </span>
      );
    } else if (physics.status === 'ADVISORY') {
      return (
        <span
          data-testid="kavach-status-badge"
          className="bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] text-[11px] font-bold px-2 py-0.5 rounded-[4px] font-mono tracking-wider inline-flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse"></span>
          ADVISORY EBD INTERVENTION
        </span>
      );
    } else {
      return (
        <span
          data-testid="kavach-status-badge"
          className="bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] text-[11px] font-bold px-2 py-0.5 rounded-[4px] font-mono tracking-wider inline-flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-ping"></span>
          CRITICAL OVERSHOOT HAZARD
        </span>
      );
    }
  }, [physics.status]);

  const toggleCurve = (key: 'service' | 'emergency' | 'tsr') => {
    setVisibleCurves(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      data-testid="deceleration-curve-card"
      className={`bg-white border border-[#D0DFEE] rounded-[6px] p-5 shadow-sm flex flex-col ${className}`}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4 pb-3 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-[15px] font-bold text-[#0F172A] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#2B7FFF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 3v18h18" />
              <path d="M19 9l-5 5-4-4-3 3" />
            </svg>
            <span>Kavach Braking Physics &amp; Deceleration Curve</span>
          </h2>
          <p className="text-[12px] text-[#64748B] mt-0.5">
            RDSO Kavach Ver 4.0 Emergency Braking Distance (EBD) envelope vs Normal Service &amp; TSR Ceiling
          </p>
        </div>
        {statusBadge}
      </div>

      {/* Chart Canvas Area */}
      <div
        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-2 relative overflow-hidden"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        {isMounted ? (
          <ResponsiveContainer width={(width as number | `${number}%`) ?? '100%'} height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 25, bottom: 20, left: 10 }}>
              <defs>
                <linearGradient id="ebdGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="serviceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2B7FFF" stopOpacity={0.14} />
                  <stop offset="100%" stopColor="#2B7FFF" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={true} horizontal={true} />

              <XAxis
                dataKey="distanceMeters"
                domain={[0, 1200]}
                type="number"
                tickCount={7}
                unit="m"
                tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }}
                stroke="#CBD5E1"
              />

              <YAxis
                domain={[0, 140]}
                type="number"
                tickCount={8}
                unit=" km/h"
                tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }}
                stroke="#CBD5E1"
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as CurveDataPoint;
                    return (
                      <div className="bg-white border border-[#CBD5E1] rounded-[4px] p-2.5 shadow-lg text-[11.5px] font-sans">
                        <div className="font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-1 mb-1.5 font-mono">
                          Distance: {data.distanceMeters}m
                        </div>
                        {visibleCurves.emergency && (
                          <div className="flex items-center justify-between gap-4 text-[#EF4444] font-medium">
                            <span>Kavach EBD:</span>
                            <span className="font-mono font-bold">{data.emergencySpeedKmh} km/h</span>
                          </div>
                        )}
                        {visibleCurves.service && (
                          <div className="flex items-center justify-between gap-4 text-[#2B7FFF] font-medium">
                            <span>Normal Service:</span>
                            <span className="font-mono font-bold">{data.serviceSpeedKmh} km/h</span>
                          </div>
                        )}
                        {visibleCurves.tsr && (
                          <div className="flex items-center justify-between gap-4 text-[#D97706] font-medium">
                            <span>TSR Ceiling:</span>
                            <span className="font-mono font-bold">{data.tsrSpeedKmh} km/h</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Stop Target Obstacle Vertical Reference Line */}
              <ReferenceLine
                x={targetObstacleDistanceMeters}
                stroke="#DC2626"
                strokeDasharray="4 3"
                strokeWidth={1.8}
                label={{
                  value: `STOP TARGET: ${targetObstacleDistanceMeters}m`,
                  position: 'insideTopRight',
                  fill: '#DC2626',
                  fontSize: 10,
                  fontFamily: 'monospace',
                  fontWeight: 700
                }}
              />

              {/* TSR 30 km/h Ceiling Horizontal Reference Line */}
              {visibleCurves.tsr && (
                <ReferenceLine
                  y={tsrSpeedLimitKmh}
                  stroke="#F59E0B"
                  strokeDasharray="5 4"
                  strokeWidth={1.8}
                  label={{
                    value: `TSR CEILING: ${tsrSpeedLimitKmh} km/h`,
                    position: 'insideBottomRight',
                    fill: '#92400E',
                    fontSize: 9.5,
                    fontFamily: 'monospace',
                    fontWeight: 700
                  }}
                />
              )}

              {/* Emergency Kavach EBD Area & Line */}
              {visibleCurves.emergency && (
                <Area
                  type="monotone"
                  dataKey="emergencySpeedKmh"
                  stroke={CHART_PALETTE.emergency}
                  strokeWidth={2.8}
                  fill="url(#ebdGradient)"
                  isAnimationActive={false}
                  name="Emergency Kavach EBD"
                />
              )}

              {/* Normal Service Braking Line */}
              {visibleCurves.service && (
                <Line
                  type="monotone"
                  dataKey="serviceSpeedKmh"
                  stroke={CHART_PALETTE.service}
                  strokeWidth={2.2}
                  strokeDasharray="5 4"
                  dot={false}
                  isAnimationActive={false}
                  name="Normal Service Braking"
                />
              )}

              {/* Live Telemetry Coordinate Marker */}
              {showTelemetryMarker && currentDistanceMeters !== undefined && (
                <ReferenceDot
                  x={currentDistanceMeters}
                  y={telemetrySpeed}
                  r={6}
                  fill="#10B981"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[12px] text-[#64748B] font-mono">
            Initializing RDSO Physics Renderer...
          </div>
        )}
      </div>

      {/* Interactive Legend Bar */}
      {showLegend && (
        <div className="flex items-center justify-start gap-4 mt-3 flex-wrap p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px]">
          <button
            type="button"
            onClick={() => toggleCurve('service')}
            className={`flex items-center gap-1.5 text-[11.5px] font-semibold cursor-pointer select-none transition-opacity ${
              visibleCurves.service ? 'text-[#334155]' : 'text-[#94A3B8] opacity-50'
            }`}
          >
            <span
              className="w-4 h-0.5 inline-block"
              style={{
                background: 'repeating-linear-gradient(90deg, #2B7FFF 0, #2B7FFF 3px, transparent 3px, transparent 6px)'
              }}
            ></span>
            <span>Normal Service (a=0.65m/s²)</span>
          </button>

          <button
            type="button"
            onClick={() => toggleCurve('emergency')}
            className={`flex items-center gap-1.5 text-[11.5px] font-semibold cursor-pointer select-none transition-opacity ${
              visibleCurves.emergency ? 'text-[#334155]' : 'text-[#94A3B8] opacity-50'
            }`}
          >
            <span className="w-4 h-1 rounded-[1px] bg-[#EF4444] inline-block"></span>
            <span>Kavach EBD (a_eff={physics.a_emergency}m/s²)</span>
          </button>

          <button
            type="button"
            onClick={() => toggleCurve('tsr')}
            className={`flex items-center gap-1.5 text-[11.5px] font-semibold cursor-pointer select-none transition-opacity ${
              visibleCurves.tsr ? 'text-[#334155]' : 'text-[#94A3B8] opacity-50'
            }`}
          >
            <span className="w-4 h-0.5 rounded-[1px] bg-[#F59E0B] inline-block"></span>
            <span>TSR Permanent Clamp (30 km/h)</span>
          </button>

          {showTelemetryMarker && (
            <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#334155]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block"></span>
              <span>Live Telemetry Marker</span>
            </div>
          )}
        </div>
      )}

      {/* Real-Time Telemetry Metrics Strip */}
      {showMetricsStrip && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-2.5">
            <div className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">Calculated EBD</div>
            <div className="text-[17px] font-extrabold font-mono text-[#0F172A] mt-0.5 flex items-baseline gap-1">
              <span>{physics.ebdDistance_m}</span>
              <span className="text-[11px] font-normal text-[#64748B]">m</span>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-2.5">
            <div className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">Safe Stop Margin</div>
            <div
              className={`text-[17px] font-extrabold font-mono mt-0.5 flex items-baseline gap-1 ${
                physics.safeMargin_m >= 150
                  ? 'text-[#10B981]'
                  : physics.safeMargin_m >= 0
                  ? 'text-[#D97706]'
                  : 'text-[#DC2626]'
              }`}
            >
              <span>{physics.safeMargin_m >= 0 ? `+${physics.safeMargin_m}` : physics.safeMargin_m}</span>
              <span className="text-[11px] font-normal text-[#64748B]">m</span>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-2.5">
            <div className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">Effective Decel (a_eff)</div>
            <div className="text-[17px] font-extrabold font-mono text-[#0F172A] mt-0.5 flex items-baseline gap-1">
              <span>{physics.a_emergency}</span>
              <span className="text-[11px] font-normal text-[#64748B]">m/s²</span>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-2.5">
            <div className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">Time to Full Stop</div>
            <div className="text-[17px] font-extrabold font-mono text-[#0F172A] mt-0.5 flex items-baseline gap-1">
              <span>{physics.timeToStop_sec}</span>
              <span className="text-[11px] font-normal text-[#64748B]">sec</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

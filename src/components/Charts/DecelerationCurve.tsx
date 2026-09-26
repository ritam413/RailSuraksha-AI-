// src/components/Charts/DecelerationCurve.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { Card } from '../Common/Card';
import { WeatherCondition } from '@/types/apiContracts';
import {
  calculateKavachEbd,
  getWeatherFrictionParams
} from '@/lib/agents/kavachBrakingAgent';

export interface DecelerationCurveProps {
  initialSpeedKmh?: number;
  obstacleDistanceMeters?: number;
  initialWeather?: WeatherCondition;
  trainId?: string;
  onWeatherChange?: (weather: WeatherCondition) => void;
  className?: string;
}

interface DataPoint {
  distance: number;
  emergencySpeed: number | null;
  serviceSpeed: number | null;
  tsrClamp: number;
}

export const DecelerationCurve: React.FC<DecelerationCurveProps> = ({
  initialSpeedKmh = 110,
  obstacleDistanceMeters = 450,
  initialWeather = 'DRY',
  trainId = '12345 (Vande Bharat)',
  onWeatherChange,
  className = ''
}) => {
  const [speedKmh, setSpeedKmh] = useState<number>(initialSpeedKmh);
  const [obstacleDistance, setObstacleDistance] = useState<number>(obstacleDistanceMeters);
  const [weather, setWeather] = useState<WeatherCondition>(initialWeather);
  const [activePreset, setActivePreset] = useState<number>(initialSpeedKmh);

  const weatherParams = useMemo(() => getWeatherFrictionParams(weather), [weather]);

  const ebdResult = useMemo(() => {
    return calculateKavachEbd({
      trainId,
      velocityKmh: speedKmh,
      obstacleDistanceMeters: obstacleDistance,
      weatherCondition: weather,
      gradientPercent: 0.002
    });
  }, [trainId, speedKmh, obstacleDistance, weather]);

  // Compute physics curve points
  const chartData = useMemo<DataPoint[]>(() => {
    const data: DataPoint[] = [];
    const v0Ms = (speedKmh * 1000) / 3600;
    const g = 9.81;
    const mu = weatherParams.frictionCoefficient;
    const G = 0.002;
    const tReact = 1.20 * weatherParams.reactionTimeMultiplier;
    const dReact = v0Ms * tReact;

    const maxDist = Math.max(1000, Math.ceil((ebdResult.calculatedStoppingDistanceMeters + 150) / 100) * 100);
    const step = 20;

    const aService = 0.65; // m/s^2 nominal service braking

    for (let x = 0; x <= maxDist; x += step) {
      // Emergency Kavach EBD calculation
      let vEmergencyKmh: number | null = 0;
      if (x <= dReact) {
        vEmergencyKmh = speedKmh;
      } else {
        const xBrake = x - dReact;
        const vSquared = Math.pow(v0Ms, 2) - 2 * g * (mu + G) * xBrake;
        if (vSquared > 0) {
          vEmergencyKmh = Number(((Math.sqrt(vSquared) * 3600) / 1000).toFixed(1));
        } else {
          vEmergencyKmh = 0;
        }
      }

      // Service braking calculation
      let vServiceKmh: number | null = 0;
      const vServiceSq = Math.pow(v0Ms, 2) - 2 * aService * x;
      if (vServiceSq > 0) {
        vServiceKmh = Number(((Math.sqrt(vServiceSq) * 3600) / 1000).toFixed(1));
      } else {
        vServiceKmh = 0;
      }

      data.push({
        distance: x,
        emergencySpeed: vEmergencyKmh,
        serviceSpeed: vServiceKmh,
        tsrClamp: 30
      });
    }

    return data;
  }, [speedKmh, weatherParams, ebdResult.calculatedStoppingDistanceMeters]);

  const handleWeatherSelect = (newWeather: WeatherCondition) => {
    setWeather(newWeather);
    if (onWeatherChange) {
      onWeatherChange(newWeather);
    }
  };

  const handleSpeedPreset = (speed: number) => {
    setSpeedKmh(speed);
    setActivePreset(speed);
  };

  const isCollision = ebdResult.isCollisionRisk;

  return (
    <Card className={`p-5 bg-white border-[#D0DFEE] rounded-2xl shadow-sm ${className}`}>
      {/* Header & Standard Reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D0DFEE]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#2B7FFF] inline-block" />
            <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
              RDSO Kavach Kinematic Deceleration & EBD Curve
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#E6F0FA] text-[#2B7FFF] font-semibold border border-[#D0DFEE]">
              RDSO/SPN/196/2020
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic Emergency Braking Distance profile calculated across active atmospheric friction conditions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold rounded border ${
              isCollision
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isCollision ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}
            />
            {isCollision ? 'CRITICAL COLLISION RISK' : 'FAIL-SAFE MARGIN SECURED'}
          </span>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-[#D0DFEE] bg-[#F0F6FC]/50 -mx-5 px-5 my-2">
        {/* Speed Presets */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
            Initial Train Speed (V₀)
          </label>
          <div className="flex items-center gap-1.5">
            {[75, 90, 110, 130, 160].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => handleSpeedPreset(speed)}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-all ${
                  activePreset === speed
                    ? 'bg-[#2B7FFF] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-[#D0DFEE] hover:bg-slate-50'
                }`}
              >
                {speed}k
              </button>
            ))}
          </div>
        </div>

        {/* Weather Friction Selector */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
            Atmospheric Friction (μ)
          </label>
          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center">
            {(
              [
                { id: 'DRY', label: 'Dry (0.134)' },
                { id: 'WET_MONSOON', label: 'Monsoon (0.095)' },
                { id: 'DENSE_FOG', label: 'Fog (0.115)' },
                { id: 'NIGHT_IR', label: 'Night (0.130)' }
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleWeatherSelect(item.id)}
                className={`px-2 py-1 text-[11px] font-medium rounded text-left sm:text-center transition-all ${
                  weather === item.id
                    ? 'bg-[#0F172A] text-white font-semibold'
                    : 'bg-white text-slate-600 border border-[#D0DFEE] hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Obstacle Distance Slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Obstacle Chainage Offset
            </label>
            <span className="text-xs font-mono font-bold text-[#0F172A]">
              {obstacleDistance}m
            </span>
          </div>
          <input
            type="range"
            min="200"
            max="800"
            step="25"
            value={obstacleDistance}
            onChange={(e) => setObstacleDistance(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2B7FFF]"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>200m</span>
            <span>400m</span>
            <span>600m</span>
            <span>800m</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="w-full h-[320px] my-3">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
          >
            <defs>
              <linearGradient id="emergencyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="serviceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2B7FFF" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2B7FFF" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={true} />

            <XAxis
              dataKey="distance"
              unit="m"
              stroke="#64748B"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              label={{
                value: 'Deceleration Travel Distance (Meters)',
                position: 'insideBottom',
                offset: -12,
                fill: '#64748B',
                fontSize: 11
              }}
            />

            <YAxis
              unit=" km/h"
              stroke="#64748B"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              domain={[0, Math.max(140, speedKmh + 10)]}
              label={{
                value: 'Train Velocity (km/h)',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748B',
                fontSize: 11
              }}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0]?.payload as DataPoint;
                return (
                  <div className="bg-white p-3 rounded-lg shadow-lg border border-[#D0DFEE] text-xs font-mono">
                    <div className="font-bold text-[#0F172A] border-b border-slate-100 pb-1 mb-1.5">
                      Distance: {d.distance}m
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center gap-4 text-rose-600 font-semibold">
                        <span>Emergency EBD:</span>
                        <span>{d.emergencySpeed} km/h</span>
                      </div>
                      <div className="flex justify-between items-center gap-4 text-blue-600">
                        <span>Service Braking:</span>
                        <span>{d.serviceSpeed} km/h</span>
                      </div>
                      <div className="flex justify-between items-center gap-4 text-amber-600">
                        <span>TSR Clamp:</span>
                        <span>{d.tsrClamp} km/h</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            {/* Target Obstacle Distance Marker */}
            <ReferenceLine
              x={obstacleDistance}
              stroke="#DC2626"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{
                value: `Obstacle (${obstacleDistance}m)`,
                position: 'top',
                fill: '#DC2626',
                fontSize: 11,
                fontFamily: 'monospace',
                fontWeight: 'bold'
              }}
            />

            {/* Calculated Kavach Full Stop Point */}
            <ReferenceLine
              x={ebdResult.calculatedStoppingDistanceMeters}
              stroke="#059669"
              strokeWidth={2}
              label={{
                value: `D_stop (${ebdResult.calculatedStoppingDistanceMeters}m)`,
                position: 'insideTopLeft',
                fill: '#059669',
                fontSize: 11,
                fontFamily: 'monospace',
                fontWeight: 'bold'
              }}
            />

            {/* Danger Zone Shading if Overrun */}
            {isCollision && (
              <ReferenceArea
                x1={obstacleDistance}
                x2={ebdResult.calculatedStoppingDistanceMeters}
                fill="#FEE2E2"
                fillOpacity={0.4}
              />
            )}

            {/* Service Braking Curve */}
            <Area
              type="monotone"
              dataKey="serviceSpeed"
              name="Normal Service Braking"
              stroke="#2B7FFF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#serviceGrad)"
              dot={false}
              activeDot={{ r: 4, stroke: '#2B7FFF', strokeWidth: 2 }}
            />

            {/* Emergency Kavach EBD Curve */}
            <Area
              type="monotone"
              dataKey="emergencySpeed"
              name="Emergency Kavach EBD"
              stroke="#DC2626"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#emergencyGrad)"
              dot={false}
              activeDot={{ r: 5, stroke: '#DC2626', strokeWidth: 2 }}
            />

            {/* Permanent Speed Restriction (TSR 30 km/h) */}
            <Line
              type="monotone"
              dataKey="tsrClamp"
              name="TSR 30 km/h Limit"
              stroke="#F59E0B"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Physics Telemetry Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#D0DFEE]">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Calculated D_stop
          </div>
          <div className="text-lg font-black text-[#0F172A] font-mono mt-0.5">
            {ebdResult.calculatedStoppingDistanceMeters}m
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            V={speedKmh}km/h | μ={weatherParams.frictionCoefficient}
          </div>
        </div>

        <div
          className={`p-2.5 rounded-lg border ${
            isCollision
              ? 'bg-rose-50 border-rose-200'
              : 'bg-emerald-50 border-emerald-200'
          }`}
        >
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Clearance Margin
          </div>
          <div
            className={`text-lg font-black font-mono mt-0.5 ${
              isCollision ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {ebdResult.marginDistanceMeters > 0 ? `+${ebdResult.marginDistanceMeters}m` : `${ebdResult.marginDistanceMeters}m`}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
            {isCollision ? 'COLLISION HAZARD' : 'SAFE STOPPING GAP'}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Req. Deceleration
          </div>
          <div className="text-lg font-black text-[#0F172A] font-mono mt-0.5">
            {ebdResult.requiredDecelerationMs2} m/s²
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            Nominal max: 1.15 m/s²
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Kavach Solenoid
          </div>
          <div className="text-sm font-bold text-[#0F172A] font-mono mt-1">
            {ebdResult.brakeState === 'EMERGENCY_SOLENOID_ACTUATED'
              ? 'ACTUATED (0.0s)'
              : 'ARMED (STANDBY)'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            Form T/409 Dispatched
          </div>
        </div>
      </div>
    </Card>
  );
};

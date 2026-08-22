// src/components/LocoCameraFeed.tsx
'use client';

import React, { useState } from 'react';
import { Card } from './Common/Card';
import { DeploymentMode, WeatherCondition, TacticalCameraAngle } from '@/types/apiContracts';
import { getWeatherFrictionParams } from '@/lib/agents/kavachBrakingAgent';

export interface TacticalScenario {
  id: string;
  key: 'BOULDER_CRITICAL' | 'CATTLE_WARNING' | 'FRACTURE_CRITICAL';
  title: string;
  hazardClass: 'BOULDER' | 'CATTLE' | 'RAIL_FRACTURE';
  confidence: number;
  distanceMeters: number;
  initialSpeedKmh: number;
  trainId: string;
  trackSection: string;
  boxStyle: { top: string; left: string; width: string; height: string };
  badgeLabel: string;
}

export const SCENARIOS: Record<string, TacticalScenario> = {
  BOULDER_CRITICAL: {
    id: 'RS-2048',
    key: 'BOULDER_CRITICAL',
    title: 'Scenario 1: 1.2m Boulder on Track 1A',
    hazardClass: 'BOULDER',
    confidence: 0.982,
    distanceMeters: 340,
    initialSpeedKmh: 110,
    trainId: '12345 (Vande Bharat)',
    trackSection: 'Section 14B — Up Main Line',
    boxStyle: { top: '56%', left: '47%', width: '120px', height: '115px' },
    badgeLabel: 'BOULDER 98.2% (340m)'
  },
  CATTLE_WARNING: {
    id: 'RS-2051',
    key: 'CATTLE_WARNING',
    title: 'Scenario 2: Stray Cattle on Track 2',
    hazardClass: 'CATTLE',
    confidence: 0.941,
    distanceMeters: 680,
    initialSpeedKmh: 110,
    trainId: '22691 (Rajdhani Exp)',
    trackSection: 'Section 16A — Down Main Line',
    boxStyle: { top: '41%', left: '46%', width: '110px', height: '65px' },
    badgeLabel: 'CATTLE 94.1% (680m)'
  },
  FRACTURE_CRITICAL: {
    id: 'RS-2052',
    key: 'FRACTURE_CRITICAL',
    title: 'Scenario 3: Linear Rail Fracture (Fishplate Gap)',
    hazardClass: 'RAIL_FRACTURE',
    confidence: 0.965,
    distanceMeters: 210,
    initialSpeedKmh: 90,
    trainId: '12137 (Punjab Mail)',
    trackSection: 'Section 08C — Curve 4 Loop',
    boxStyle: { top: '78%', left: '56%', width: '95px', height: '70px' },
    badgeLabel: 'RAIL FRACTURE 96.5% (210m)'
  }
};

const scenarioImageUrls: Record<TacticalScenario['key'], string> = {
  BOULDER_CRITICAL: '/assets/locomotive_pov_boulder.png',
  CATTLE_WARNING: '/assets/locomotive_pov_cattle.png',
  FRACTURE_CRITICAL: '/assets/locomotive_pov_fracture.png'
};

interface LocoCameraFeedProps {
  currentScenario: TacticalScenario;
  onSelectScenario: (scenario: TacticalScenario) => void;
  onTriggerBraking: () => void;
  onResetSimulation: () => void;
  brakeState: 'CLEAR' | 'EMERGENCY_SOLENOID_ACTUATED';
  isExecuting: boolean;
  currentSpeedKmh: number;
  brakePressureBar: number;
  deploymentMode: DeploymentMode;
  activeStage: number;
  weatherCondition?: WeatherCondition;
  onWeatherChange?: (weather: WeatherCondition) => void;
  cameraAngle?: TacticalCameraAngle;
  onCameraAngleChange?: (angle: TacticalCameraAngle) => void;
}

export const LocoCameraFeed: React.FC<LocoCameraFeedProps> = ({
  currentScenario,
  onSelectScenario,
  onTriggerBraking,
  onResetSimulation,
  brakeState,
  isExecuting,
  currentSpeedKmh,
  brakePressureBar,
  deploymentMode,
  activeStage,
  weatherCondition = 'DRY',
  onWeatherChange,
  cameraAngle = 'FORWARD_CAB',
  onCameraAngleChange
}) => {
  const [internalWeather, setInternalWeather] = useState<WeatherCondition>(weatherCondition);
  const [internalAngle, setInternalAngle] = useState<TacticalCameraAngle>(cameraAngle);

  const activeWeather = onWeatherChange ? weatherCondition : internalWeather;
  const activeAngle = onCameraAngleChange ? cameraAngle : internalAngle;

  const handleWeatherSelect = (w: WeatherCondition) => {
    if (onWeatherChange) onWeatherChange(w);
    else setInternalWeather(w);
  };

  const handleAngleSelect = (a: TacticalCameraAngle) => {
    if (onCameraAngleChange) onCameraAngleChange(a);
    else setInternalAngle(a);
  };

  const isEmergency = brakeState === 'EMERGENCY_SOLENOID_ACTUATED';
  const isStopped = currentSpeedKmh === 0 && isEmergency;
  const weatherInfo = getWeatherFrictionParams(activeWeather);

  // Auxiliary live feeds remain video; the forward cab is the supplied local POV.
  const videoUrls: Record<TacticalCameraAngle, string> = {
    FORWARD_CAB: 'https://assets.mixkit.co/videos/preview/mixkit-train-passing-through-a-green-landscape-42211-large.mp4',
    OHE_PANTOGRAPH: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-cargo-train-running-on-tracks-42214-large.mp4',
    BOGIE_UNDERCARRIAGE: 'https://assets.mixkit.co/videos/preview/mixkit-cargo-train-running-on-railroad-tracks-42215-large.mp4'
  };

  return (
    <Card
      title={`Tactical Multi-Sensor Telemetry & Vision Feed (Cab #204 — ${currentScenario.trainId})`}
      className="mb-6"
    >
      {/* Scenario Switcher Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-[#D0DFEE]">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-[#0F172A]">TACTICAL SCENARIO:</span>
          <div className="flex flex-wrap gap-1">
            {Object.values(SCENARIOS).map((sc) => {
              const isSelected = sc.key === currentScenario.key;
              return (
                <button
                  key={sc.key}
                  disabled={isExecuting && activeStage > 0 && activeStage < 5}
                  onClick={() => onSelectScenario(sc)}
                  className={`px-3 py-1 text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-[#2B7FFF] text-white border-[#2B7FFF] shadow-xs'
                      : 'bg-white text-[#0F172A] border-[#D0DFEE] hover:bg-[#F0F6FC]'
                  } disabled:opacity-50`}
                  style={{ borderRadius: '4px' }}
                >
                  {sc.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode & Section Badge */}
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 bg-[#F0F6FC] border border-[#D0DFEE] text-[11px] font-mono text-slate-700 rounded" style={{ borderRadius: '4px' }}>
            {currentScenario.trackSection}
          </span>
          <span
            className={`px-2 py-0.5 text-[11px] font-mono font-bold border rounded ${
              deploymentMode === 'ADVISORY'
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-emerald-50 text-emerald-700 border-emerald-300'
            }`}
            style={{ borderRadius: '4px' }}
          >
            {deploymentMode === 'ADVISORY' ? '⚠️ ADVISORY' : '⚡ AUTONOMOUS'}
          </span>
        </div>
      </div>

      {/* Sub-Toolbar: Multi-Angle Sensor Feeds & Environmental Friction Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 pb-3 border-b border-[#D0DFEE]">
        {/* Camera Angle Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Camera Angle:</span>
          <div className="flex space-x-1 bg-[#F0F6FC] p-0.5 border border-[#D0DFEE]" style={{ borderRadius: '4px' }}>
            <button
              onClick={() => handleAngleSelect('FORWARD_CAB')}
              className={`px-2.5 py-1 text-[11px] font-mono font-semibold transition-all ${
                activeAngle === 'FORWARD_CAB' ? 'bg-[#2B7FFF] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
              }`}
              style={{ borderRadius: '4px' }}
            >
              🎥 Forward Cab
            </button>
            <button
              onClick={() => handleAngleSelect('OHE_PANTOGRAPH')}
              className={`px-2.5 py-1 text-[11px] font-mono font-semibold transition-all ${
                activeAngle === 'OHE_PANTOGRAPH' ? 'bg-[#2B7FFF] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
              }`}
              style={{ borderRadius: '4px' }}
            >
              ⚡ OHE Pantograph
            </button>
            <button
              onClick={() => handleAngleSelect('BOGIE_UNDERCARRIAGE')}
              className={`px-2.5 py-1 text-[11px] font-mono font-semibold transition-all ${
                activeAngle === 'BOGIE_UNDERCARRIAGE' ? 'bg-[#2B7FFF] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
              }`}
              style={{ borderRadius: '4px' }}
            >
              🛤️ Undercarriage
            </button>
          </div>
        </div>

        {/* Environmental Weather Simulator */}
        <div className="flex items-center justify-start md:justify-end space-x-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Weather / Track:</span>
          <div className="flex space-x-1 bg-[#F0F6FC] p-0.5 border border-[#D0DFEE]" style={{ borderRadius: '4px' }}>
            <button
              onClick={() => handleWeatherSelect('DRY')}
              className={`px-2 py-1 text-[11px] font-mono font-medium transition-all ${
                activeWeather === 'DRY' ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300 shadow-xs' : 'text-slate-600 hover:bg-white'
              }`}
              style={{ borderRadius: '4px' }}
              title="Clear dry track (mu = 0.134)"
            >
              ☀️ Dry
            </button>
            <button
              onClick={() => handleWeatherSelect('WET_MONSOON')}
              className={`px-2 py-1 text-[11px] font-mono font-medium transition-all ${
                activeWeather === 'WET_MONSOON' ? 'bg-blue-100 text-blue-900 font-bold border border-blue-300 shadow-xs' : 'text-slate-600 hover:bg-white'
              }`}
              style={{ borderRadius: '4px' }}
              title="Heavy Monsoon slippage (mu = 0.095, +35% stopping distance)"
            >
              🌧️ Monsoon
            </button>
            <button
              onClick={() => handleWeatherSelect('DENSE_FOG')}
              className={`px-2 py-1 text-[11px] font-mono font-medium transition-all ${
                activeWeather === 'DENSE_FOG' ? 'bg-slate-200 text-slate-900 font-bold border border-slate-400 shadow-xs' : 'text-slate-600 hover:bg-white'
              }`}
              style={{ borderRadius: '4px' }}
              title="Severe Winter Fog (mu = 0.115, sight limited)"
            >
              🌫️ Fog
            </button>
            <button
              onClick={() => handleWeatherSelect('NIGHT_IR')}
              className={`px-2 py-1 text-[11px] font-mono font-medium transition-all ${
                activeWeather === 'NIGHT_IR' ? 'bg-purple-100 text-purple-900 font-bold border border-purple-300 shadow-xs' : 'text-slate-600 hover:bg-white'
              }`}
              style={{ borderRadius: '4px' }}
              title="Night Vision Infrared (Thermal Spectral)"
            >
              🌙 IR Night
            </button>
          </div>
        </div>
      </div>

      {/* Main Video & HUD Viewport */}
      <div className={`relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 min-h-[420px] flex items-center justify-center shadow-inner ${
        activeWeather === 'NIGHT_IR' ? 'filter hue-rotate-90 saturate-200 contrast-125' : activeWeather === 'DENSE_FOG' ? 'contrast-75 brightness-95' : ''
      }`}>
        {/* Forward vision uses the supplied locomotive cab point-of-view image. */}
        {activeAngle === 'FORWARD_CAB' ? (
          <img
            src={scenarioImageUrls[currentScenario.key]}
            alt={`${currentScenario.hazardClass.toLowerCase().replace('_', ' ')} detection from locomotive cab`}
            className="w-full h-[420px] object-cover opacity-90"
          />
        ) : (
          <video
            key={activeAngle}
            src={videoUrls[activeAngle]}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-[420px] object-cover opacity-90"
          />
        )}

        {/* Environmental Rain Overlay */}
        {activeWeather === 'WET_MONSOON' && (
          <div className="absolute inset-0 pointer-events-none bg-blue-900/15 backdrop-blur-[0.5px]" />
        )}
        {/* Environmental Fog Overlay */}
        {activeWeather === 'DENSE_FOG' && (
          <div className="absolute inset-0 pointer-events-none bg-slate-200/25 backdrop-blur-[1px]" />
        )}

        {/* HTML5 Overlay Grid & Crosshairs */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Dynamic Bounding Box Overlay for Selected Hazard (Only on Forward Cab) */}
        {activeAngle === 'FORWARD_CAB' && (
          <div
            className={`absolute border-2 transition-all flex flex-col justify-between shadow-lg ${
              currentScenario.hazardClass === 'CATTLE'
                ? 'border-amber-400 bg-amber-500/20'
                : 'border-red-500 bg-red-500/20'
            } ${activeStage >= 1 ? 'ring-4 ring-red-400/50 animate-pulse' : ''}`}
            style={{
              top: currentScenario.boxStyle.top,
              left: currentScenario.boxStyle.left,
              width: currentScenario.boxStyle.width,
              height: currentScenario.boxStyle.height,
              borderRadius: '4px'
            }}
          >
            <div
              className={`text-white text-[10px] font-mono font-bold px-1.5 py-0.5 w-max rounded-t-sm shadow ${
                currentScenario.hazardClass === 'CATTLE' ? 'bg-amber-600' : 'bg-red-600'
              }`}
            >
              {currentScenario.badgeLabel}
            </div>
            <div className="text-[9px] font-mono text-white/90 bg-black/75 px-1 py-0.5 rounded-b-sm flex justify-between">
              <span>{currentScenario.hazardClass}</span>
              <span className="text-emerald-300 font-bold">{Math.round(currentScenario.confidence * 100)}% CONF</span>
            </div>
          </div>
        )}

        {/* Pantograph / Catenary HUD Annotation (When OHE Angle selected) */}
        {activeAngle === 'OHE_PANTOGRAPH' && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 border border-cyan-400 bg-cyan-500/20 p-2 text-cyan-200 font-mono text-xs rounded" style={{ borderRadius: '4px' }}>
            ⚡ CATENARY CONTACT: 25.4 kV AC | WIRE TENSION: 10.2 kN (NORMAL)
          </div>
        )}

        {/* Bogie / Undercarriage HUD Annotation (When Undercarriage selected) */}
        {activeAngle === 'BOGIE_UNDERCARRIAGE' && (
          <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 border border-emerald-400 bg-emerald-500/20 p-2 text-emerald-200 font-mono text-xs rounded" style={{ borderRadius: '4px' }}>
            🛤️ AXLE VIBRATION: 1.8 mm/s RMS | WHEEL FLANGE TEMP: 42°C (NOMINAL)
          </div>
        )}

        {/* HUD Telemetry Overlay (Top Left) */}
        <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-xs border border-white/20 p-3.5 text-white font-mono text-xs space-y-1.5 shadow-2xl rounded" style={{ borderRadius: '4px' }}>
          <div className="flex items-center space-x-2 border-b border-white/10 pb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold tracking-tight">
              {activeAngle === 'FORWARD_CAB' ? 'CAM: LOCO-CAB-FRONT-VANDB-204' : activeAngle === 'OHE_PANTOGRAPH' ? 'CAM: OHE-PANTOGRAPH-ROOF-01' : 'CAM: BOGIE-OPTICAL-AXLE-04'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] pt-0.5">
            <div>SPEED: <span className="text-amber-300 font-bold text-sm">{currentSpeedKmh}</span> KM/H</div>
            <div>BRAKE CYL: <span className="text-cyan-300 font-bold text-sm">{brakePressureBar.toFixed(1)}</span> BAR</div>
            <div>DISTANCE: <span className="text-red-300 font-bold">{currentScenario.distanceMeters}</span> M</div>
            <div>CONDITIONS: <span className="text-yellow-200 font-bold">{weatherInfo.label}</span></div>
          </div>
          <div className="border-t border-white/10 pt-1 flex items-center justify-between text-[11px]">
            <span>SOLENOID STATE:</span>
            <span
              className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                isEmergency ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-800 text-emerald-100'
              }`}
              style={{ borderRadius: '2px' }}
            >
              {brakeState}
            </span>
          </div>
        </div>

        {/* Speed & Brake Status Gauge (Top Right) */}
        <div className="absolute top-4 right-4 bg-black/85 backdrop-blur-xs border border-white/20 p-3 text-right font-mono text-xs rounded shadow-2xl" style={{ borderRadius: '4px' }}>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Kinematic Status</div>
          <div className={`text-base font-bold ${isStopped ? 'text-red-400' : isEmergency ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isStopped ? '🛑 FULL STOP (SAFE)' : isEmergency ? '⚠️ DECELERATING (EBD ACTIVE)' : '🟢 CRUISING (CLEAR)'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Friction: <span className="text-white font-bold">μ = {weatherInfo.frictionCoefficient}</span> | Grade: <span className="text-white font-bold">+0.002</span>
          </div>
          <div className="text-[9px] text-amber-300 font-bold mt-0.5">
            {weatherInfo.riskFactor}
          </div>
        </div>

        {/* Action Controls Overlay (Bottom Right) */}
        <div className="absolute bottom-4 right-4 flex items-center space-x-2">
          {isEmergency && (
            <button
              onClick={onResetSimulation}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-600 shadow-lg transition-all"
              style={{ borderRadius: '4px' }}
            >
              🔄 [RESET SIMULATION]
            </button>
          )}

          <button
            onClick={onTriggerBraking}
            disabled={isExecuting && activeStage > 0 && activeStage < 5}
            className={`px-4 py-2.5 text-white font-bold text-xs shadow-xl border transition-all ${
              isEmergency
                ? 'bg-emerald-700 hover:bg-emerald-600 border-emerald-500'
                : 'bg-red-600 hover:bg-red-700 border-red-400'
            } disabled:opacity-50`}
            style={{ borderRadius: '4px' }}
          >
            {isEmergency ? '⚡ [RE-EVALUATE KAVACH PIPELINE]' : '🚨 [RUN 4-AGENT KAVACH PIPELINE]'}
          </button>
        </div>
      </div>
    </Card>
  );
};

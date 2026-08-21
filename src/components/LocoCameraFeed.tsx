// src/components/LocoCameraFeed.tsx
'use client';

import React from 'react';
import { Card } from './Common/Card';
import { DeploymentMode } from '@/types/apiContracts';

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
    boxStyle: { top: '36%', left: '42%', width: '150px', height: '105px' },
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
    boxStyle: { top: '44%', left: '38%', width: '125px', height: '80px' },
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
    boxStyle: { top: '56%', left: '45%', width: '100px', height: '65px' },
    badgeLabel: 'RAIL FRACTURE 96.5% (210m)'
  }
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
  activeStage
}) => {
  const isEmergency = brakeState === 'EMERGENCY_SOLENOID_ACTUATED';
  const isStopped = currentSpeedKmh === 0 && isEmergency;

  return (
    <Card
      title={`Loco-Cab Forward Vision Camera Feed (Cab #204 — ${currentScenario.trainId})`}
      className="mb-6"
    >
      {/* Scenario Switcher Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-[#D0DFEE]">
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

      {/* Main Video & HUD Viewport */}
      <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 min-h-[420px] flex items-center justify-center shadow-inner">
        {/* Real Train Cab Video Stream */}
        <video
          src="https://assets.mixkit.co/videos/preview/mixkit-train-passing-through-a-green-landscape-42211-large.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-[420px] object-cover opacity-90"
        />

        {/* HTML5 Overlay Grid & Crosshairs */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Dynamic Bounding Box Overlay for Selected Hazard */}
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

        {/* HUD Telemetry Overlay (Top Left) */}
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-xs border border-white/20 p-3.5 text-white font-mono text-xs space-y-1.5 shadow-2xl rounded" style={{ borderRadius: '4px' }}>
          <div className="flex items-center space-x-2 border-b border-white/10 pb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold tracking-tight">CAM: LOCO-CAB-FRONT-VANDB-204</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] pt-0.5">
            <div>SPEED: <span className="text-amber-300 font-bold text-sm">{currentSpeedKmh}</span> KM/H</div>
            <div>BRAKE CYL: <span className="text-cyan-300 font-bold text-sm">{brakePressureBar.toFixed(1)}</span> BAR</div>
            <div>DISTANCE: <span className="text-red-300 font-bold">{currentScenario.distanceMeters}</span> M</div>
            <div>MASS: <span className="text-slate-300">1400 T</span></div>
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
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-xs border border-white/20 p-3 text-right font-mono text-xs rounded shadow-2xl" style={{ borderRadius: '4px' }}>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Kinematic Status</div>
          <div className={`text-base font-bold ${isStopped ? 'text-red-400' : isEmergency ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isStopped ? '🛑 FULL STOP (SAFE)' : isEmergency ? '⚠️ DECELERATING (EBD ACTIVE)' : '🟢 CRUISING (CLEAR)'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Friction: <span className="text-white font-bold">μ = 0.134</span> | Grade: <span className="text-white font-bold">+0.002</span>
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

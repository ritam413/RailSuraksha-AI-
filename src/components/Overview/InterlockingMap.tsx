// src/components/Overview/InterlockingMap.tsx
'use client';

import React, { useState } from 'react';
import { Card } from '../Common/Card';
import { SignalAspectState, TrackBlockCircuit } from '@/types/apiContracts';

export type SignalAspect = SignalAspectState['aspect'];

interface InterlockingMapProps {
  onSignalClick?: (signalId: string, currentAspect: SignalAspect) => void;
  onTrackSelect?: (circuitId: string) => void;
  selectedTrackId?: string;
}

export const InterlockingMap: React.FC<InterlockingMapProps> = ({
  onSignalClick,
  onTrackSelect,
  selectedTrackId
}) => {
  // State for dynamic signal overrides
  const [signalStates, setSignalStates] = useState<Record<string, SignalAspect>>({
    'S-12': 'STOP',
    'S-14': 'CLEAR',
    'S-16': 'HOLD_ACTIVE',
    'S-18': 'CAUTION'
  });

  const [activeSwitch, setActiveSwitch] = useState<'NORMAL' | 'REVERSE'>('NORMAL');
  const [selectedCircuit, setSelectedCircuit] = useState<string>(selectedTrackId || 'BLK-101');

  // Cycle signal aspects on click: STOP -> CAUTION -> CLEAR -> STOP
  const handleToggleSignal = (signalId: string) => {
    setSignalStates((prev) => {
      const current = prev[signalId] || 'STOP';
      let next: SignalAspect = 'CLEAR';
      if (current === 'STOP') next = 'CAUTION';
      else if (current === 'CAUTION') next = 'CLEAR';
      else next = 'STOP';

      if (onSignalClick) onSignalClick(signalId, next);
      return { ...prev, [signalId]: next };
    });
  };

  const getAspectColor = (aspect: SignalAspect) => {
    switch (aspect) {
      case 'STOP':
        return 'bg-red-500 text-white border-red-300 shadow-red-200';
      case 'HOLD_ACTIVE':
      case 'CAUTION':
        return 'bg-amber-400 text-slate-900 border-amber-300 shadow-amber-200';
      case 'CLEAR':
        return 'bg-emerald-500 text-white border-emerald-300 shadow-emerald-200';
      default:
        return 'bg-slate-400 text-white border-slate-300';
    }
  };

  return (
    <Card
      title="Railway Track Interlocking & Section Dispatch Map (Section 14B — CSMT Division)"
      className="mb-6"
    >
      <div className="space-y-4">
        {/* Top Control & Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#F0F6FC] border border-[#D0DFEE] rounded-xl text-xs font-mono" style={{ borderRadius: '12px' }}>
          <div className="flex items-center space-x-4">
            <span className="font-bold text-[#0F172A]">ROUTE STATUS:</span>
            <button
              onClick={() => setActiveSwitch((prev) => (prev === 'NORMAL' ? 'REVERSE' : 'NORMAL'))}
              className={`px-3 py-1 font-bold text-xs rounded transition-all flex items-center space-x-1.5 shadow-xs ${
                activeSwitch === 'NORMAL'
                  ? 'bg-[#2B7FFF] text-white hover:bg-blue-600'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
              style={{ borderRadius: '4px' }}
            >
              <span>SWITCH SW-04:</span>
              <span className="underline">{activeSwitch} ROUTE</span>
            </button>
          </div>

          {/* Aspect Legend */}
          <div className="flex items-center space-x-3 text-[11px] text-slate-600">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>STOP (S-12)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>CAUTION/HOLD (S-16)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>CLEAR (S-14)</span>
            </div>
          </div>
        </div>

        {/* Track Line Visual Canvas */}
        <div className="theme-static bg-slate-950 border border-slate-800 rounded-xl p-6 text-white space-y-6 shadow-inner relative overflow-hidden" style={{ borderRadius: '16px' }}>
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

          {/* Line 1: Up Main Line 1A */}
          <div
            onClick={() => {
              setSelectedCircuit('BLK-101');
              if (onTrackSelect) onTrackSelect('BLK-101');
            }}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              selectedCircuit === 'BLK-101'
                ? 'bg-slate-900/90 border-[#2B7FFF] shadow-md'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
            style={{ borderRadius: '8px' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-blue-400">UP MAIN 1A (BLK-101)</span>
                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-mono font-bold rounded border border-red-500/30">
                  OCCUPIED • 130 KM/H
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Length: 1,200m | Gradient: +0.2%</span>
            </div>

            {/* Track Rail Simulation */}
            <div className="h-6 bg-slate-800 rounded relative flex items-center px-2 border border-slate-700">
              {/* Train Block */}
              <div className="w-2/5 h-4 bg-[#2B7FFF] rounded flex items-center justify-between px-2 text-[10px] font-mono font-bold text-white shadow-md">
                <span className="truncate">🚆 #12345 (Vande Bharat)</span>
                <span className="text-[9px] bg-black/40 px-1 rounded">110 km/h</span>
              </div>

              {/* Hazard Marker */}
              <div className="ml-16 px-2 py-0.5 bg-red-600 text-white text-[9px] font-mono font-bold rounded animate-pulse shadow-xs flex items-center space-x-1">
                <span>⚠️ BOULDER @ 340m</span>
              </div>

              {/* Signal S-12 */}
              <div className="ml-auto flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSignal('S-12');
                  }}
                  title="Click to cycle signal aspect"
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] border-2 shadow-xs cursor-pointer active:scale-95 transition-all ${getAspectColor(
                    signalStates['S-12']
                  )}`}
                >
                  {signalStates['S-12'] === 'STOP' ? 'S' : signalStates['S-12'] === 'CAUTION' || signalStates['S-12'] === 'HOLD_ACTIVE' ? 'C' : 'G'}
                </button>
                <span className="text-xs font-mono text-slate-300 font-bold">S-12</span>
              </div>
            </div>
          </div>

          {/* Line 2: Down Main Line 2A */}
          <div
            onClick={() => {
              setSelectedCircuit('BLK-103');
              if (onTrackSelect) onTrackSelect('BLK-103');
            }}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              selectedCircuit === 'BLK-103'
                ? 'bg-slate-900/90 border-[#2B7FFF] shadow-md'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
            style={{ borderRadius: '8px' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-indigo-400">DOWN MAIN 2A (BLK-103)</span>
                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded border border-emerald-500/30">
                  OCCUPIED • 110 KM/H
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Length: 1,400m | Clear Aspect</span>
            </div>

            {/* Track Rail Simulation */}
            <div className="h-6 bg-slate-800 rounded relative flex items-center px-2 border border-slate-700">
              <div className="w-1/3 ml-36 h-4 bg-indigo-600 rounded flex items-center justify-between px-2 text-[10px] font-mono font-bold text-white shadow-md">
                <span className="truncate">🚆 #22691 (Rajdhani Exp)</span>
                <span className="text-[9px] bg-black/40 px-1 rounded">110 km/h</span>
              </div>

              {/* Signal S-14 */}
              <div className="ml-auto flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSignal('S-14');
                  }}
                  title="Click to cycle signal aspect"
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] border-2 shadow-xs cursor-pointer active:scale-95 transition-all ${getAspectColor(
                    signalStates['S-14']
                  )}`}
                >
                  {signalStates['S-14'] === 'STOP' ? 'S' : signalStates['S-14'] === 'CAUTION' || signalStates['S-14'] === 'HOLD_ACTIVE' ? 'C' : 'G'}
                </button>
                <span className="text-xs font-mono text-slate-300 font-bold">S-14</span>
              </div>
            </div>
          </div>

          {/* Line 3: Platform 18 Loop (Bottleneck Hold) */}
          <div
            onClick={() => {
              setSelectedCircuit('BLK-105');
              if (onTrackSelect) onTrackSelect('BLK-105');
            }}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              selectedCircuit === 'BLK-105'
                ? 'bg-slate-900/90 border-[#2B7FFF] shadow-md'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
            style={{ borderRadius: '8px' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-amber-400">PLATFORM 18 LOOP (BLK-105)</span>
                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold rounded border border-amber-500/30">
                  5-MIN DETERMINISTIC HOLD • 30 KM/H LIMIT
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-400 font-bold">Platform 17 Crowd Bottleneck (ρ = 88%)</span>
            </div>

            {/* Track Rail Simulation */}
            <div className="h-6 bg-amber-950/40 rounded relative flex items-center px-2 border border-amber-800/60">
              <div className="flex items-center space-x-2 text-[10px] font-mono text-amber-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>INTERLOCK HOLD: Train #12137 Held at Outer Signal S-16</span>
              </div>

              {/* Signal S-16 */}
              <div className="ml-auto flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSignal('S-16');
                  }}
                  title="Click to cycle signal aspect"
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] border-2 shadow-xs cursor-pointer active:scale-95 transition-all ${getAspectColor(
                    signalStates['S-16']
                  )}`}
                >
                  {signalStates['S-16'] === 'STOP' ? 'S' : signalStates['S-16'] === 'CAUTION' || signalStates['S-16'] === 'HOLD_ACTIVE' ? 'C' : 'G'}
                </button>
                <span className="text-xs font-mono text-slate-300 font-bold">S-16</span>
              </div>
            </div>
          </div>
        </div>

        {/* Circuit Inspector Bottom Strip */}
        <div className="p-3 bg-white border border-[#D0DFEE] rounded-xl flex items-center justify-between text-xs font-mono" style={{ borderRadius: '12px' }}>
          <div className="flex items-center space-x-2 text-slate-600">
            <span className="font-bold text-[#0F172A]">SELECTED BLOCK:</span>
            <span className="font-bold text-[#2B7FFF]">{selectedCircuit}</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-500 text-[11px]">
            <span>Fail-Safe Relays: <strong className="text-emerald-600">ENERGIZED</strong></span>
            <span>Axle Counters: <strong className="text-emerald-600">HEALTHY (4/4)</strong></span>
            <span>Radio Link: <strong className="text-emerald-600">KAVACH 2.4GHz UHF</strong></span>
          </div>
        </div>
      </div>
    </Card>
  );
};

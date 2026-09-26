// src/components/Overview/InterlockingMap.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../Common/Card';
import { SignalHead } from '../Common/SignalHead';
import { TrackCircuitState, SignalAspect, CircuitOperationalStatus } from '@/types/apiContracts';
import { MOCK_TRACK_CIRCUITS } from '@/lib/mockData';
import { ShieldAlert, Zap, ZapOff, Activity, Lock, GitBranch } from 'lucide-react';

export interface InterlockingMapProps {
  circuits?: TrackCircuitState[];
  selectedCircuitId?: string;
  selectedTrackId?: string;
  onTrackSelect?: (circuitId: string) => void;
  onSignalClick?: (signalId: string, currentAspect: SignalAspect) => void;
  onToggleClamp?: (circuitId: string) => void;
}

// Bi-directional normalizer between legacy BLK IDs and standard TC-01..06 IDs
const normalizeCircuitId = (id?: string): string => {
  if (!id) return 'TC-03';
  const mapping: Record<string, string> = {
    'BLK-101': 'TC-01',
    'BLK-102': 'TC-02',
    'BLK-103': 'TC-03',
    'BLK-104': 'TC-04',
    'BLK-105': 'TC-05'
  };
  return mapping[id] || id;
};

const DEFAULT_FALLBACK_CIRCUIT: TrackCircuitState = {
  circuitId: 'TC-03',
  trackLine: 'UP_SLOW',
  stationName: 'Dadar - Kurla',
  kmStart: 9.2,
  kmEnd: 15.5,
  status: 'BLOCK_SANCTIONED',
  signalId: 'S-12',
  signalAspect: 'RED',
  isSignalClamped: true,
  speedLimitKmh: 30,
  oheEnergized: false
};

export const InterlockingMap: React.FC<InterlockingMapProps> = ({
  circuits = MOCK_TRACK_CIRCUITS,
  selectedCircuitId,
  selectedTrackId,
  onTrackSelect,
  onSignalClick,
  onToggleClamp
}) => {
  const [activeSwitch, setActiveSwitch] = useState<'NORMAL' | 'REVERSE'>('NORMAL');
  const [internalSelectedId, setInternalSelectedId] = useState<string>(
    normalizeCircuitId(selectedCircuitId || selectedTrackId)
  );
  const [localCircuits, setLocalCircuits] = useState<TrackCircuitState[]>(
    circuits && circuits.length > 0 ? circuits : MOCK_TRACK_CIRCUITS
  );

  // Sync state when upstream props change (Avoids State Stall)
  useEffect(() => {
    if (circuits && circuits.length > 0) {
      setLocalCircuits(circuits);
    }
  }, [circuits]);

  useEffect(() => {
    const nextNormalized = normalizeCircuitId(selectedCircuitId || selectedTrackId);
    if (nextNormalized) {
      setInternalSelectedId(nextNormalized);
    }
  }, [selectedCircuitId, selectedTrackId]);

  const activeId = normalizeCircuitId(selectedCircuitId || selectedTrackId || internalSelectedId);
  const currentCircuit =
    localCircuits.find((c) => c.circuitId === activeId) ||
    localCircuits[0] ||
    DEFAULT_FALLBACK_CIRCUIT;

  const handleSelectTrack = (circuitId: string) => {
    setInternalSelectedId(circuitId);
    if (onTrackSelect) onTrackSelect(circuitId);
  };

  const handleToggleLocalClamp = (circuitId: string) => {
    setLocalCircuits((prev) =>
      prev.map((c) => {
        if (c.circuitId === circuitId) {
          const nextClamped = !c.isSignalClamped;
          return {
            ...c,
            isSignalClamped: nextClamped,
            // Fail-safe transition: Clamped = RED; Release = YELLOW (Caution approach under GR 3.08)
            signalAspect: nextClamped ? 'RED' : 'YELLOW',
            status: nextClamped ? 'BLOCK_SANCTIONED' : 'MAINTENANCE_SLOTTED',
            oheEnergized: !nextClamped,
            speedLimitKmh: nextClamped ? 30 : Math.min(c.speedLimitKmh, 50)
          };
        }
        return c;
      })
    );
    if (onToggleClamp) onToggleClamp(circuitId);
  };

  const handleLocalSignalClick = (signalId: string, currentAspect: SignalAspect) => {
    setLocalCircuits((prev) =>
      prev.map((c) => {
        if (c.signalId === signalId && !c.isSignalClamped) {
          let nextAspect: SignalAspect = 'GREEN';
          if (currentAspect === 'GREEN') nextAspect = 'YELLOW';
          else if (currentAspect === 'YELLOW') nextAspect = 'DOUBLE_YELLOW';
          else if (currentAspect === 'DOUBLE_YELLOW') nextAspect = 'RED';
          else nextAspect = 'GREEN';

          return { ...c, signalAspect: nextAspect };
        }
        return c;
      })
    );
    if (onSignalClick) onSignalClick(signalId, currentAspect);
  };

  const getStatusBadge = (status: CircuitOperationalStatus) => {
    switch (status) {
      case 'BLOCK_SANCTIONED':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          label: 'BLOCK SANCTIONED'
        };
      case 'MAINTENANCE_SLOTTED':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'SLOTTED'
        };
      case 'OCCUPIED':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'OCCUPIED'
        };
      case 'POWER_ISOLATED':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          label: 'POWER ISOLATED'
        };
      case 'CLEAR':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'LINE CLEAR'
        };
    }
  };

  const hasAnyClampedCircuit = localCircuits.some(
    (c) => c.isSignalClamped || c.status === 'BLOCK_SANCTIONED'
  );

  return (
    <Card
      title="Section Interlocking & Track Circuit Schematic (CSMT - Kalyan 54 KM Quadrupled Corridor)"
      className="mb-6 shadow-xs border-[#D0DFEE]"
    >
      <div className="space-y-4">
        {/* Top Control Bar */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#F0F6FC] border border-[#D0DFEE] text-xs font-mono"
          style={{ borderRadius: '12px' }}
        >
          <div className="flex items-center space-x-3">
            <span className="font-bold text-[#0F172A] flex items-center space-x-1.5">
              <GitBranch className="w-3.5 h-3.5 text-[#2B7FFF]" />
              <span>INTERLOCKING ROUTE:</span>
            </span>
            <button
              onClick={() => setActiveSwitch((prev) => (prev === 'NORMAL' ? 'REVERSE' : 'NORMAL'))}
              className={`px-3 py-1 font-bold text-xs rounded transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer ${
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

          {/* Axle Counter & Lockout Telemetry */}
          <div className="flex items-center space-x-4 text-[11px] text-slate-600">
            <div className="flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                AXLE COUNTER DUAL-DETECTION:{' '}
                <strong className="text-emerald-700">HEALTHY (0 MISMATCH)</strong>
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>CLEAR</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>OCCUPIED</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span>BLOCK SANCTIONED</span>
            </div>
          </div>
        </div>

        {/* Form S&T/T-351 Statutory Lockout Banner */}
        {hasAnyClampedCircuit && (
          <div
            className="p-3 bg-red-50 border-2 border-red-300 text-red-900 flex items-center justify-between gap-3 shadow-xs animate-pulse"
            style={{ borderRadius: '8px' }}
          >
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <span className="font-bold text-xs uppercase font-mono tracking-wide">
                  FORM S&amp;T/T-351 STATUTORY LOCKOUT: Automatic Train Stop Engaged — Signal Clamped Danger at S-12
                </span>
                <p className="text-[11px] text-red-700">
                  Section locked for Joint Shadow Maintenance Block JB-2026-0926-01 (Dadar - Kurla UP Slow Line). Speed clamped to 30 km/h TSR.
                </p>
              </div>
            </div>
            <span
              className="px-2.5 py-1 bg-red-600 text-white font-mono font-bold text-[10px] tracking-wider shrink-0"
              style={{ borderRadius: '4px' }}
            >
              ACT 14B ENFORCED
            </span>
          </div>
        )}

        {/* Horizontal Linear Chainage Track Overview */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[780px] grid grid-cols-6 gap-3 pt-2">
            {localCircuits.map((circuit) => {
              const isSelected = circuit.circuitId === activeId;
              const badge = getStatusBadge(circuit.status);

              return (
                <div
                  key={circuit.circuitId}
                  onClick={() => handleSelectTrack(circuit.circuitId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectTrack(circuit.circuitId);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Track Circuit ${circuit.circuitId}, ${circuit.stationName}, Status ${badge.label}`}
                  className={`p-3 bg-white border-2 rounded-xl transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-[#2B7FFF] shadow-md ring-2 ring-blue-100'
                      : 'border-[#D0DFEE] hover:border-blue-300 shadow-xs'
                  }`}
                  style={{ borderRadius: '12px' }}
                >
                  {/* Circuit Header & Badge */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#0F172A]">
                      {circuit.circuitId}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold font-mono border rounded ${badge.bg}`}
                      style={{ borderRadius: '4px' }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Station Section & Track Line */}
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 tracking-tight line-clamp-1">
                      {circuit.stationName}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
                      <span>{circuit.trackLine}</span>
                      <span>
                        KM {circuit.kmStart.toFixed(1)} - {circuit.kmEnd.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Central Signal Head Visualizer */}
                  <div
                    className="py-2 flex items-center justify-center bg-[#F0F6FC] border border-[#D0DFEE]"
                    style={{ borderRadius: '8px' }}
                  >
                    <SignalHead
                      signalId={circuit.signalId}
                      aspect={circuit.signalAspect}
                      isClamped={circuit.isSignalClamped}
                      onClick={handleLocalSignalClick}
                    />
                  </div>

                  {/* Speed Limit & 25kV OHE Indicators */}
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center space-x-1">
                      {circuit.oheEnergized ? (
                        <span
                          className="flex items-center text-emerald-600 font-bold"
                          title="25kV AC Energized"
                        >
                          <Zap className="w-3 h-3 mr-0.5" /> 25kV
                        </span>
                      ) : (
                        <span
                          className="flex items-center text-red-600 font-bold"
                          title="25kV AC Power Isolated"
                        >
                          <ZapOff className="w-3 h-3 mr-0.5" /> 25kV ISOLATED
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-1.5 py-0.5 font-bold rounded ${
                        circuit.speedLimitKmh <= 30
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                      style={{ borderRadius: '4px' }}
                    >
                      {circuit.speedLimitKmh} km/h{circuit.speedLimitKmh <= 30 ? ' TSR' : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Circuit Deep-Dive Drawer */}
        <div
          className="p-4 bg-[#F0F6FC] border border-[#D0DFEE] flex flex-wrap items-center justify-between gap-4"
          style={{ borderRadius: '12px' }}
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span
                className="px-2 py-0.5 bg-[#2B7FFF] text-white font-mono font-bold text-xs"
                style={{ borderRadius: '4px' }}
              >
                {currentCircuit.circuitId}
              </span>
              <h3 className="font-bold text-sm text-[#0F172A]">
                {currentCircuit.stationName} ({currentCircuit.trackLine})
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Chainage: KM {currentCircuit.kmStart.toFixed(1)} to KM {currentCircuit.kmEnd.toFixed(1)} •
              Controlling Signal: <strong>{currentCircuit.signalId}</strong> • Aspect:{' '}
              <strong>{currentCircuit.signalAspect}</strong>
            </p>
          </div>

          {/* Emergency Clamping Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleToggleLocalClamp(currentCircuit.circuitId)}
              className={`px-4 py-2 font-bold font-mono text-xs rounded transition-all flex items-center space-x-2 shadow-xs cursor-pointer ${
                currentCircuit.isSignalClamped
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              style={{ borderRadius: '4px' }}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>
                {currentCircuit.isSignalClamped
                  ? 'RELEASE S&T LOCKOUT'
                  : 'EMERGENCY CLAMP DANGER'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

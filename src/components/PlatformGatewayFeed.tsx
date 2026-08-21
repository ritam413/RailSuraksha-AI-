// src/components/PlatformGatewayFeed.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './Common/Card';
import { calculatePlatformHoldState } from '@/lib/agents/sectionDispatchAgent';
import { DEMO_VIDEO_STREAMS } from '@/lib/mockData';

interface PlatformGatewayFeedProps {
  initialSeconds?: number;
  initialCrowdCount?: number;
}

export const PlatformGatewayFeed: React.FC<PlatformGatewayFeedProps> = ({
  initialSeconds = 252,
  initialCrowdCount = 482
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);
  const [crowdCount, setCrowdCount] = useState<number>(initialCrowdCount);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Derive dynamic platform hold state from pure TypeScript agent
  const holdState = calculatePlatformHoldState(
    'CSMT',
    'PLATFORM_18',
    'PLATFORM_17',
    crowdCount,
    secondsRemaining
  );

  // Active Real-Time 1-Second Countdown Ticker
  useEffect(() => {
    if (!isTimerRunning || secondsRemaining <= 0) return;

    const intervalId = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isTimerRunning, secondsRemaining]);

  // Format MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const densityPercent = Math.round(holdState.gatewayOccupancyIndex * 100);

  return (
    <Card
      title="Platform Gateway CCTV & Section Dispatch Engine (Platform 17 / 18 Bottleneck)"
      className="mb-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Gateway CCTV Video Stream (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 min-h-[340px] flex items-center justify-center shadow-inner">
            {/* Live Video Feed */}
            <video
              src={DEMO_VIDEO_STREAMS.platformGatewayCctv}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-[340px] object-cover opacity-90"
            />

            {/* Video HUD: Camera Header Overlay */}
            <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs border border-white/20 rounded p-2.5 text-white font-mono text-xs space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-slate-100">CAM: CCTV-CSMT-GATEWAY-P17-P18</span>
              </div>
              <div className="text-[11px] text-slate-300">
                MOUNT: FOB Pillar #1 | RESOLUTION: 1080p @ 30fps
              </div>
            </div>

            {/* YOLOv11 & Optical Flow Detection Bounding Overlay */}
            <div
              className="absolute border-2 border-amber-400 bg-amber-500/15 rounded p-2 flex flex-col justify-between shadow-lg pointer-events-none"
              style={{ top: '22%', left: '15%', width: '70%', height: '65%' }}
            >
              <div className="flex items-center justify-between">
                <span className="bg-amber-500 text-slate-950 text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                  YOLOv11: CROWD SURGE (88.4%)
                </span>
                <span className="bg-black/70 text-amber-300 text-[10px] font-mono px-1.5 py-0.5 rounded">
                  OPTICAL FLOW: V = 0.42 m/s
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-white bg-black/70 px-1.5 py-0.5 rounded">
                  Bottleneck: Staircase 3A
                </span>
              </div>
            </div>

            {/* Bottom Live Crowd Telemetry Bar */}
            <div className="absolute bottom-3 inset-x-3 bg-black/80 backdrop-blur-xs border border-white/15 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-slate-400 text-[10px] block">HEADCOUNT</span>
                  <span className="text-amber-300 font-bold text-sm">{crowdCount} PAX</span>
                </div>
                <div className="h-6 w-px bg-white/20" />
                <div>
                  <span className="text-slate-400 text-[10px] block">DENSITY (ρ)</span>
                  <span className={`font-bold text-sm ${densityPercent > 80 ? 'text-red-400' : 'text-amber-300'}`}>
                    {densityPercent}% ({holdState.gatewayOccupancyIndex})
                  </span>
                </div>
              </div>
              <div>
                <span
                  className={`px-2 py-1 text-[10px] font-bold rounded ${
                    holdState.isMlExtensionActive
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {holdState.isMlExtensionActive ? '⚡ ML AUTO-EXTENSION ARMED' : 'NORMAL CLEARANCE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 5-Minute Hold Countdown & Station Master Controls (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Status Header Box */}
          <div
            className={`border rounded-xl p-5 ${
              secondsRemaining === 0
                ? 'bg-emerald-50 border-emerald-200'
                : secondsRemaining < 60
                ? 'bg-amber-50 border-amber-300'
                : 'bg-[#F0F6FC] border-[#D0DFEE]'
            }`}
            style={{ borderRadius: '16px' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  secondsRemaining === 0
                    ? 'bg-emerald-200 text-emerald-900'
                    : secondsRemaining < 60
                    ? 'bg-amber-200 text-amber-900 animate-pulse'
                    : 'bg-blue-100 text-blue-900'
                }`}
                style={{ borderRadius: '4px' }}
              >
                {secondsRemaining === 0
                  ? '🟢 SIGNAL RELEASED'
                  : secondsRemaining < 60
                  ? '⚠️ CLEARING PHASE'
                  : '🔒 5-MIN DETERMINISTIC HOLD ACTIVE'}
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold">
                S-16 [HOLD]
              </span>
            </div>

            <h3 className="text-sm font-bold text-[#0F172A] mb-1">
              Platform 18 Outer Signal Locked
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Holding train <span className="font-mono font-semibold text-[#0F172A]">#12137 (Punjab Mail)</span> on outer approach until foot-over-bridge staircase bottleneck on Platform 17 drops below critical density threshold.
            </p>

            {/* Digital Timer Display Card */}
            <div
              className="bg-white border border-[#D0DFEE] rounded-xl p-4 text-center shadow-xs mb-3"
              style={{ borderRadius: '12px' }}
            >
              <div
                className={`text-4xl font-mono font-extrabold tracking-wider ${
                  secondsRemaining === 0
                    ? 'text-emerald-600'
                    : secondsRemaining < 60
                    ? 'text-amber-600'
                    : 'text-[#2B7FFF]'
                }`}
              >
                {formattedTime}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1 uppercase">
                {secondsRemaining === 0 ? 'Hold Complete — Signal Clear' : 'Remaining Mandatory Hold Time'}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    secondsRemaining === 0
                      ? 'bg-emerald-500'
                      : secondsRemaining < 60
                      ? 'bg-amber-500'
                      : 'bg-[#2B7FFF]'
                  }`}
                  style={{ width: `${Math.min(100, (secondsRemaining / 300) * 100)}%` }}
                />
              </div>
            </div>

            {/* Density Metrics Summary */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-white/80 border border-[#D0DFEE] p-2 rounded" style={{ borderRadius: '4px' }}>
                <span className="text-slate-500 text-[10px] block">HELD PLATFORM</span>
                <span className="font-bold text-[#0F172A]">Platform 18 (Loop)</span>
              </div>
              <div className="bg-white/80 border border-[#D0DFEE] p-2 rounded" style={{ borderRadius: '4px' }}>
                <span className="text-slate-500 text-[10px] block">BOTTLENECK AREA</span>
                <span className="font-bold text-[#0F172A]">Platform 17 FOB</span>
              </div>
            </div>
          </div>

          {/* Station Master Action Controls */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider">
              Station Master Overrides
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setSecondsRemaining(0);
                  setIsTimerRunning(false);
                }}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs rounded transition-all shadow-xs flex items-center justify-center space-x-1"
                style={{ borderRadius: '4px' }}
              >
                <span>[RELEASE NOW]</span>
              </button>

              <button
                onClick={() => {
                  setSecondsRemaining((prev) => prev + 180);
                  setIsTimerRunning(true);
                  setCrowdCount((prev) => Math.min(600, prev + 40));
                }}
                className="py-2.5 px-3 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold text-xs rounded transition-all shadow-xs flex items-center justify-center space-x-1"
                style={{ borderRadius: '4px' }}
              >
                <span>[EXTEND +3M]</span>
              </button>

              <button
                onClick={() => {
                  setSecondsRemaining(300);
                  setIsTimerRunning(true);
                }}
                className="py-2.5 px-3 bg-[#F0F6FC] hover:bg-[#E6F0FA] active:scale-[0.98] text-[#0F172A] border border-[#D0DFEE] font-bold text-xs rounded transition-all shadow-xs flex items-center justify-center space-x-1"
                style={{ borderRadius: '4px' }}
              >
                <span>[RESET 5M]</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

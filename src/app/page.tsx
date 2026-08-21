// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { KpiStrip } from '@/components/Overview/KpiStrip';
import { InterlockingMap } from '@/components/Overview/InterlockingMap';
import { IncidentQueue } from '@/components/Overview/IncidentQueue';
import { LocoCameraFeed } from '@/components/LocoCameraFeed';
import { AgentPipelineCanvas } from '@/components/AgentPipelineCanvas';
import { DecisionLogModal } from '@/components/Auditor/DecisionLogModal';
import { Card } from '@/components/Common/Card';
import { DeploymentMode } from '@/types/apiContracts';
import { calculateKavachEbd } from '@/lib/agents/kavachBrakingAgent';

export default function CommandCenterPage() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LOCO_CAB' | 'PLATFORM_GATEWAY'>('OVERVIEW');
  const [deploymentMode, setDeploymentMode] = useState<DeploymentMode>('ADVISORY');
  const [isDecisionLogOpen, setIsDecisionLogOpen] = useState(false);
  const [isPipelineExecuting, setIsPipelineExecuting] = useState(false);
  const [brakeState, setBrakeState] = useState<'CLEAR' | 'EMERGENCY_SOLENOID_ACTUATED'>('CLEAR');
  const [holdTimerSeconds, setHoldTimerSeconds] = useState(252);

  // Trigger Kavach Emergency Braking Physics Calculation
  const handleTriggerBraking = () => {
    setIsPipelineExecuting(true);
    const result = calculateKavachEbd({
      trainId: '12345 (Vande Bharat)',
      velocityKmh: 110,
      obstacleDistanceMeters: 340
    });
    setBrakeState(result.brakeState);

    setTimeout(() => {
      setIsDecisionLogOpen(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F0F6FC] flex flex-col">
      {/* Global Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        deploymentMode={deploymentMode}
        onModeToggle={setDeploymentMode}
      />

      {/* Main Command Center Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {/* VIEW 1: OVERVIEW SIGNALING MAP */}
        {activeTab === 'OVERVIEW' && (
          <div>
            <KpiStrip />
            <InterlockingMap />
            <IncidentQueue
              onApproveAction={(id) => {
                alert(`Action for incident ${id} approved by Controller OP-402.`);
                setIsDecisionLogOpen(true);
              }}
            />
          </div>
        )}

        {/* VIEW 2: LOCO-CAB FORWARD VISION & KAVACH BRAKING ENGINE */}
        {activeTab === 'LOCO_CAB' && (
          <div>
            <LocoCameraFeed
              onTriggerBraking={handleTriggerBraking}
              brakeState={brakeState}
            />
            <AgentPipelineCanvas
              isExecuting={isPipelineExecuting}
              onOpenDecisionLog={() => setIsDecisionLogOpen(true)}
            />
          </div>
        )}

        {/* VIEW 3: PLATFORM GATEWAY CCTV & SECTION DISPATCH */}
        {activeTab === 'PLATFORM_GATEWAY' && (
          <div>
            <Card title="Platform Gateway CCTV & Crowd Surge Detector (Platform 17 / 18 Bottleneck)" className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Video Feed */}
                <div className="relative rounded-xl overflow-hidden bg-slate-950 min-h-[300px]">
                  <video
                    src="https://assets.mixkit.co/videos/preview/mixkit-crowd-of-people-walking-in-a-train-station-41553-large.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-[300px] object-cover opacity-85"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 border border-white/20 rounded p-2 text-white font-mono text-xs">
                    <div>CAM: CCTV-CSMT-GATEWAY-P17-P18</div>
                    <div className="text-amber-300 font-bold">CROWD COUNT: 482 | DENSITY (ρ): 88%</div>
                  </div>
                </div>

                {/* 5-Minute Hold Countdown Timer */}
                <div className="bg-[#F0F6FC] border border-[#D0DFEE] rounded-xl p-6 flex flex-col justify-between" style={{ borderRadius: '12px' }}>
                  <div>
                    <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                      ⚠️ Section Dispatch Hold Active
                    </div>
                    <h3 className="text-base font-bold text-[#0F172A] mb-1">Incoming Platform 18 Signal Locked</h3>
                    <p className="text-xs text-slate-600 mb-4">
                      Holding train #12137 (Punjab Mail) on outer signal to clear foot-over-bridge staircase bottleneck on Platform 17.
                    </p>

                    <div className="bg-white border border-[#D0DFEE] rounded-xl p-4 text-center mb-4">
                      <div className="text-3xl font-mono font-bold text-[#2B7FFF]">
                        0{Math.floor(holdTimerSeconds / 60)}:{String(holdTimerSeconds % 60).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1">REMAINING HOLD TIME</div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setHoldTimerSeconds(0)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition-all shadow-xs"
                      style={{ borderRadius: '4px' }}
                    >
                      [RELEASE HOLD NOW]
                    </button>
                    <button
                      onClick={() => setHoldTimerSeconds((prev) => prev + 180)}
                      className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded transition-all shadow-xs"
                      style={{ borderRadius: '4px' }}
                    >
                      [EXTEND HOLD +3M]
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Auditor Decision Log Drawer Modal */}
      <DecisionLogModal
        isOpen={isDecisionLogOpen}
        onClose={() => setIsDecisionLogOpen(false)}
      />
    </div>
  );
}

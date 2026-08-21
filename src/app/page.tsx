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
import { PlatformGatewayFeed } from '@/components/PlatformGatewayFeed';
import { Card } from '@/components/Common/Card';
import { DeploymentMode } from '@/types/apiContracts';
import { calculateKavachEbd } from '@/lib/agents/kavachBrakingAgent';

export default function CommandCenterPage() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LOCO_CAB' | 'PLATFORM_GATEWAY'>('OVERVIEW');
  const [deploymentMode, setDeploymentMode] = useState<DeploymentMode>('ADVISORY');
  const [isDecisionLogOpen, setIsDecisionLogOpen] = useState(false);
  const [isPipelineExecuting, setIsPipelineExecuting] = useState(false);
  const [brakeState, setBrakeState] = useState<'CLEAR' | 'EMERGENCY_SOLENOID_ACTUATED'>('CLEAR');

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
            <PlatformGatewayFeed />
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

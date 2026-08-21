// src/app/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { KpiStrip } from '@/components/Overview/KpiStrip';
import { InterlockingMap } from '@/components/Overview/InterlockingMap';
import { IncidentQueue } from '@/components/Overview/IncidentQueue';
import { LocoCameraFeed, SCENARIOS, TacticalScenario } from '@/components/LocoCameraFeed';
import { AgentPipelineCanvas } from '@/components/AgentPipelineCanvas';
import { DecisionLogModal } from '@/components/Auditor/DecisionLogModal';
import { PlatformGatewayFeed } from '@/components/PlatformGatewayFeed';
import { DeploymentMode, EbdCalculationResult } from '@/types/apiContracts';
import { calculateKavachEbd } from '@/lib/agents/kavachBrakingAgent';

export default function CommandCenterPage() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LOCO_CAB' | 'PLATFORM_GATEWAY'>('OVERVIEW');
  const [deploymentMode, setDeploymentMode] = useState<DeploymentMode>('ADVISORY');
  const [isDecisionLogOpen, setIsDecisionLogOpen] = useState(false);

  // Tactical Scenario & Pipeline State
  const [currentScenario, setCurrentScenario] = useState<TacticalScenario>(SCENARIOS.BOULDER_CRITICAL);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [isPipelineExecuting, setIsPipelineExecuting] = useState(false);
  const [isAdvisoryApproved, setIsAdvisoryApproved] = useState(false);
  const [brakeState, setBrakeState] = useState<'CLEAR' | 'EMERGENCY_SOLENOID_ACTUATED'>('CLEAR');
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(SCENARIOS.BOULDER_CRITICAL.initialSpeedKmh);
  const [brakePressureBar, setBrakePressureBar] = useState<number>(0.0);
  const [ebdResult, setEbdResult] = useState<EbdCalculationResult | null>(null);

  // Deceleration Animation Interval Ref
  const decelIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (decelIntervalRef.current) clearInterval(decelIntervalRef.current);
    };
  }, []);

  // Handle Scenario Selection
  const handleSelectScenario = (scenario: TacticalScenario) => {
    if (decelIntervalRef.current) clearInterval(decelIntervalRef.current);
    setCurrentScenario(scenario);
    setActiveStage(0);
    setIsPipelineExecuting(false);
    setIsAdvisoryApproved(false);
    setBrakeState('CLEAR');
    setCurrentSpeedKmh(scenario.initialSpeedKmh);
    setBrakePressureBar(0.0);
    setEbdResult(null);
  };

  // Reset Simulation State
  const handleResetSimulation = () => {
    if (decelIntervalRef.current) clearInterval(decelIntervalRef.current);
    setActiveStage(0);
    setIsPipelineExecuting(false);
    setIsAdvisoryApproved(false);
    setBrakeState('CLEAR');
    setCurrentSpeedKmh(currentScenario.initialSpeedKmh);
    setBrakePressureBar(0.0);
    setEbdResult(null);
  };

  // Trigger Deceleration Kinematic Animation
  const startDecelerationSequence = () => {
    setBrakeState('EMERGENCY_SOLENOID_ACTUATED');
    setBrakePressureBar(5.0);

    if (decelIntervalRef.current) clearInterval(decelIntervalRef.current);

    decelIntervalRef.current = setInterval(() => {
      setCurrentSpeedKmh((prev) => {
        if (prev <= 0) {
          if (decelIntervalRef.current) clearInterval(decelIntervalRef.current);
          return 0;
        }
        const next = Math.max(0, prev - 12);
        if (next === 0) {
          if (decelIntervalRef.current) clearInterval(decelIntervalRef.current);
        }
        return next;
      });
    }, 150);
  };

  // Execute 4-Stage Kavach Pipeline
  const handleRunPipeline = () => {
    if (decelIntervalRef.current) clearInterval(decelIntervalRef.current);
    setIsPipelineExecuting(true);
    setIsAdvisoryApproved(false);
    setBrakeState('CLEAR');
    setCurrentSpeedKmh(currentScenario.initialSpeedKmh);
    setBrakePressureBar(0.0);

    // Stage 1: YOLOv11 Vision Hazard Detection
    setActiveStage(1);

    // Stage 2: Telemetry Aggregation (after 400ms)
    setTimeout(() => {
      setActiveStage(2);

      // Stage 3: RDSO Physics Engine Computation (after 500ms)
      setTimeout(() => {
        const result = calculateKavachEbd({
          trainId: currentScenario.trainId,
          velocityKmh: currentScenario.initialSpeedKmh,
          obstacleDistanceMeters: currentScenario.distanceMeters,
          frictionCoefficient: 0.134,
          gradientPercent: 0.002,
          reactionTimeSeconds: 1.96
        });
        setEbdResult(result);
        setActiveStage(3);

        // Stage 4: Actuation / Advisory Operator Gate (after 500ms)
        setTimeout(() => {
          setActiveStage(4);

          if (deploymentMode === 'AUTONOMOUS') {
            // Instant Autonomous Actuation
            startDecelerationSequence();
            setTimeout(() => {
              setActiveStage(5);
              setIsPipelineExecuting(false);
              setTimeout(() => {
                setIsDecisionLogOpen(true);
              }, 1200);
            }, 1000);
          } else {
            // Advisory Mode pauses at Stage 4 for operator click
            setIsPipelineExecuting(false);
          }
        }, 500);
      }, 500);
    }, 400);
  };

  // Advisory Mode: Operator approves action at Stage 4
  const handleApproveAdvisoryAction = () => {
    setIsAdvisoryApproved(true);
    startDecelerationSequence();
    setTimeout(() => {
      setActiveStage(5);
      setTimeout(() => {
        setIsDecisionLogOpen(true);
      }, 1000);
    }, 800);
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
              currentScenario={currentScenario}
              onSelectScenario={handleSelectScenario}
              onTriggerBraking={handleRunPipeline}
              onResetSimulation={handleResetSimulation}
              brakeState={brakeState}
              isExecuting={isPipelineExecuting}
              currentSpeedKmh={currentSpeedKmh}
              brakePressureBar={brakePressureBar}
              deploymentMode={deploymentMode}
              activeStage={activeStage}
            />

            <AgentPipelineCanvas
              activeStage={activeStage}
              isExecuting={isPipelineExecuting}
              deploymentMode={deploymentMode}
              ebdResult={ebdResult}
              currentScenario={currentScenario}
              isAdvisoryApproved={isAdvisoryApproved}
              onApproveAdvisoryAction={handleApproveAdvisoryAction}
              onOpenDecisionLog={() => setIsDecisionLogOpen(true)}
              onReset={handleResetSimulation}
              onRunPipeline={handleRunPipeline}
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

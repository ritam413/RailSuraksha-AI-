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
import { DeploymentMode, EbdCalculationResult, IncidentRecord, ExplainableDecisionLog, WeatherCondition, TacticalCameraAngle } from '@/types/apiContracts';
import { calculateEbd, reviewIncidentAction } from '@/lib/apiClient';
import { calculateKavachEbd, getWeatherFrictionParams } from '@/lib/agents/kavachBrakingAgent';
import { buildExplainableDecisionLog } from '@/lib/agents/explainableLogger';
import { MOCK_DECISION_LOG } from '@/lib/mockData';
import { playCabEmergencyAlarm, playActionConfirmedChime } from '@/lib/audioAlerts';

export default function CommandCenterPage() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LOCO_CAB' | 'PLATFORM_GATEWAY'>('OVERVIEW');
  const [deploymentMode, setDeploymentMode] = useState<DeploymentMode>('ADVISORY');
  const [isDecisionLogOpen, setIsDecisionLogOpen] = useState(false);
  const [currentDecisionLog, setCurrentDecisionLog] = useState<ExplainableDecisionLog>(MOCK_DECISION_LOG);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('RS-2048');
  const [selectedTrackId, setSelectedTrackId] = useState<string>('BLK-101');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('railsuraksha-theme');
    setIsDarkMode(savedTheme === 'dark');
  }, []);

  useEffect(() => {
    document.body.classList.toggle('theme-dark', isDarkMode);
    window.localStorage.setItem('railsuraksha-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Tactical Scenario, Weather & Sensor Pipeline State
  const [currentScenario, setCurrentScenario] = useState<TacticalScenario>(SCENARIOS.BOULDER_CRITICAL);
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('DRY');
  const [cameraAngle, setCameraAngle] = useState<TacticalCameraAngle>('FORWARD_CAB');
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
    playCabEmergencyAlarm(1.5);

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

    // Sound cab alarm on hazard start
    playCabEmergencyAlarm(0.8);

    // Stage 1: YOLOv11 Vision Hazard Detection
    setActiveStage(1);

    // Stage 2: Telemetry Aggregation (after 400ms)
    setTimeout(async () => {
      setActiveStage(2);

      // Stage 3: RDSO Physics Engine Computation (with weather friction factors)
      setTimeout(async () => {
        const weatherParams = getWeatherFrictionParams(weatherCondition);
        let result: EbdCalculationResult;
        try {
          result = await calculateEbd({
            trainId: currentScenario.trainId,
            velocityKmh: currentScenario.initialSpeedKmh,
            obstacleDistanceMeters: currentScenario.distanceMeters,
            massTonnes: 1400,
            coefficientFriction: weatherParams.frictionCoefficient,
            trackGradientPercent: 0.2,
            reactionTimeSeconds: 1.2 * weatherParams.reactionTimeMultiplier,
          });
        } catch {
          result = calculateKavachEbd({
            trainId: currentScenario.trainId,
            velocityKmh: currentScenario.initialSpeedKmh,
            obstacleDistanceMeters: currentScenario.distanceMeters,
            weatherCondition: weatherCondition,
            gradientPercent: 0.002,
          });
        }
        setEbdResult(result);
        setActiveStage(3);

        // Generate dynamic decision log
        const log = buildExplainableDecisionLog(
          currentScenario.id === 'BOULDER_CRITICAL' ? 'RS-2048' : currentScenario.id === 'CATTLE_WARNING' ? 'RS-2051' : 'RS-2050',
          currentScenario.trainId,
          'Section 14B — Up Main Line',
          deploymentMode,
          currentScenario.hazardClass,
          currentScenario.distanceMeters,
          result.calculatedStoppingDistanceMeters
        );
        setCurrentDecisionLog(log);

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
    playActionConfirmedChime();
    setIsAdvisoryApproved(true);
    startDecelerationSequence();
    setTimeout(() => {
      setActiveStage(5);
      setTimeout(() => {
        setIsDecisionLogOpen(true);
      }, 1000);
    }, 800);
  };

  // Incident Queue Selection Handler -> Switches view to appropriate feed
  const handleSelectIncident = (incident: IncidentRecord) => {
    setSelectedIncidentId(incident.incidentId);

    if (incident.cameraType === 'LOCO_CAB') {
      if (incident.boundingBoxes[0]?.class === 'BOULDER') {
        handleSelectScenario(SCENARIOS.BOULDER_CRITICAL);
      } else if (incident.boundingBoxes[0]?.class === 'CATTLE') {
        handleSelectScenario(SCENARIOS.CATTLE_WARNING);
      } else {
        handleSelectScenario(SCENARIOS.FRACTURE_CRITICAL);
      }
      setActiveTab('LOCO_CAB');
    } else if (incident.cameraType === 'PLATFORM_GATEWAY') {
      setActiveTab('PLATFORM_GATEWAY');
    }

    const log = buildExplainableDecisionLog(
      incident.incidentId,
      incident.incidentId === 'RS-2048' ? '12345 (Vande Bharat)' : incident.incidentId === 'RS-2049' ? '12137 (Punjab Mail)' : '22691 (Rajdhani)',
      incident.incidentId === 'RS-2049' ? 'CSMT Platform 17/18 Bottleneck' : 'Section 14B Up Main Line',
      deploymentMode,
      incident.boundingBoxes[0]?.class || 'BOULDER',
      incident.boundingBoxes[0]?.estimatedDistanceMeters || 340,
      410
    );
    setCurrentDecisionLog(log);
  };

  // Incident Queue Action Approval
  const handleApproveIncidentAction = async (incidentId: string) => {
    playActionConfirmedChime();
    setSelectedIncidentId(incidentId);
    setActionNotice(`Safety Action for Incident #${incidentId} approved by Section Controller OP-402.`);

    // Dispatch approval to backend API (or fallback)
    try {
      await reviewIncidentAction(incidentId, 'APPROVE', 'OP-402');
    } catch {
      // Handled gracefully in client
    }

    const log = buildExplainableDecisionLog(
      incidentId,
      incidentId === 'RS-2048' ? '12345 (Vande Bharat)' : incidentId === 'RS-2049' ? '12137 (Punjab Mail)' : '22691 (Rajdhani)',
      incidentId === 'RS-2049' ? 'CSMT Platform 17/18 Bottleneck' : 'Section 14B Up Main Line',
      deploymentMode,
      incidentId === 'RS-2049' ? 'CROWD_SURGE' : incidentId === 'RS-2050' ? 'RAIL_FRACTURE' : 'BOULDER',
      incidentId === 'RS-2049' ? 15 : 340,
      410
    );
    setCurrentDecisionLog(log);

    setTimeout(() => {
      setIsDecisionLogOpen(true);
    }, 400);

    setTimeout(() => {
      setActionNotice(null);
    }, 5000);
  };

  // Interlocking Diagram Track / Signal Interaction
  const handleTrackSelect = (circuitId: string) => {
    setSelectedTrackId(circuitId);
    if (circuitId === 'BLK-104' || circuitId === 'BLK-105') {
      setActiveTab('PLATFORM_GATEWAY');
    } else if (circuitId === 'BLK-101') {
      handleSelectScenario(SCENARIOS.BOULDER_CRITICAL);
      setActiveTab('LOCO_CAB');
    } else if (circuitId === 'BLK-103') {
      handleSelectScenario(SCENARIOS.CATTLE_WARNING);
      setActiveTab('LOCO_CAB');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F6FC] flex flex-col">
      {/* Global Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        deploymentMode={deploymentMode}
        onModeToggle={setDeploymentMode}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode((value) => !value)}
      />

      {/* Action Notification Toast Banner */}
      {actionNotice && (
        <div className="max-w-7xl mx-auto w-full px-6 pt-3">
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg flex items-center justify-between text-xs font-mono shadow-xs" style={{ borderRadius: '8px' }}>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Command Center Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {/* VIEW 1: OVERVIEW SIGNALING MAP */}
        {activeTab === 'OVERVIEW' && (
          <div>
            <KpiStrip />
            <InterlockingMap
              onTrackSelect={handleTrackSelect}
              selectedTrackId={selectedTrackId}
            />
            <IncidentQueue
              selectedIncidentId={selectedIncidentId}
              onSelectIncident={handleSelectIncident}
              onApproveAction={handleApproveIncidentAction}
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
              weatherCondition={weatherCondition}
              onWeatherChange={setWeatherCondition}
              cameraAngle={cameraAngle}
              onCameraAngleChange={setCameraAngle}
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
        log={currentDecisionLog}
      />
    </div>
  );
}

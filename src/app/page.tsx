// src/app/page.tsx
'use client';

import React, { useState, useEffect, useRef, useTransition, useMemo } from 'react';
import { Navbar, NavbarTab } from '@/components/Navbar';
import { KpiStrip } from '@/components/Overview/KpiStrip';
import { InterlockingMap } from '@/components/Overview/InterlockingMap';
import { IncidentQueue } from '@/components/Overview/IncidentQueue';
import { CorridorStringChart } from '@/components/Planner/CorridorStringChart';
import { TriageDonut, DecelerationCurve } from '@/components/Charts';
import { LocoCameraFeed, SCENARIOS, TacticalScenario } from '@/components/LocoCameraFeed';
import { AgentPipelineCanvas } from '@/components/AgentPipelineCanvas';
import { DecisionLogModal } from '@/components/Auditor/DecisionLogModal';
import { AuditorWorkspace } from '@/components/Auditor/AuditorWorkspace';
import { DefectVisionTelemetry } from '@/components/Vision/DefectVisionTelemetry';
import { PlatformGatewayFeed } from '@/components/PlatformGatewayFeed';
import { BlockRequisitionModal } from '@/components/Requisition/BlockRequisitionModal';
import {
  DeploymentMode,
  EbdCalculationResult,
  IncidentRecord,
  ExplainableDecisionDossier,
  ExplainableDecisionLog,
  WeatherCondition,
  TacticalCameraAngle,
  HorizonTier,
  TrackCircuitState,
  JointBlockSchedule,
  MaintenanceDemand
} from '@/types/apiContracts';
import { calculateEbd, reviewIncidentAction, sanctionBlockRequest } from '@/lib/apiClient';
import { calculateKavachEbd, getWeatherFrictionParams } from '@/lib/agents/kavachBrakingAgent';
import { buildExplainableDecisionLog, buildExplainableDossier } from '@/lib/agents/explainableLogger';
import {
  MOCK_DECISION_DOSSIER,
  MOCK_DECISION_LOG,
  MOCK_JOINT_BLOCKS,
  MOCK_TRAIN_SCHEDULES,
  MOCK_TRACK_CIRCUITS,
  MOCK_INCIDENTS,
  MOCK_INTERLOCKING_STATE,
  MOCK_DEMANDS
} from '@/lib/mockData';
import { playCabEmergencyAlarm, playActionConfirmedChime } from '@/lib/audioAlerts';

/**
 * Render the command cockpit with local block and circuit state, incident actions,
 * and decision dossiers. Persist the selected theme in browser local storage.
 */
export default function CommandCenterPage() {
  const [activeTab, setActiveTab] = useState<NavbarTab>('CORRIDOR_PLANNER');
  const [horizon, setHorizon] = useState<HorizonTier>('TACTICAL_24H');
  const [isPending, startTransition] = useTransition();

  const [deploymentMode, setDeploymentMode] = useState<DeploymentMode>('ADVISORY');
  const [isDecisionLogOpen, setIsDecisionLogOpen] = useState(false);
  const [isRequisitionOpen, setIsRequisitionOpen] = useState(false);
  const [currentDecisionLog, setCurrentDecisionLog] = useState<ExplainableDecisionLog>(MOCK_DECISION_LOG);
  const [currentDossier, setCurrentDossier] = useState<ExplainableDecisionDossier>(MOCK_DECISION_DOSSIER);

  // Tactical & Block Selection State
  const [demands, setDemands] = useState<MaintenanceDemand[]>(MOCK_DEMANDS);
  const [jointBlocks, setJointBlocks] = useState<JointBlockSchedule[]>(MOCK_JOINT_BLOCKS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('RS-2048');
  const [selectedTrackId, setSelectedTrackId] = useState<string>('TC-03');
  const [selectedBlockId, setSelectedBlockId] = useState<string>('JB-2026-0926-01');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Peripheral Analytics Drawer State
  const [analyticsTab, setAnalyticsTab] = useState<'COLLAPSED' | 'TRIAGE_DONUT' | 'DECEL_CURVE'>('TRIAGE_DONUT');

  // Track Circuits State (with live mutation support for sanctioning)
  const [circuits, setCircuits] = useState<TrackCircuitState[]>(MOCK_TRACK_CIRCUITS);

  // Theme Persistence
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

  useEffect(() => {
    return () => {
      if (decelIntervalRef.current) clearInterval(decelIntervalRef.current);
    };
  }, []);

  // Filter Active Joint Blocks by Planning Horizon
  const filteredBlocks = useMemo(() => {
    if (horizon === 'TACTICAL_24H') {
      return jointBlocks.filter((b) => b.status === 'SANCTIONED' || b.blockId.endsWith('-01'));
    }
    if (horizon === 'OPERATIONAL_7D') {
      return jointBlocks;
    }
    return jointBlocks;
  }, [jointBlocks, horizon]);

  /**
   * Update the selected planning horizon in a transition; all joint blocks remain visible.
   */
  const handleHorizonChange = (newHorizon: HorizonTier) => {
    startTransition(() => {
      setHorizon(newHorizon);
    });
  };

  // Direct Departmental Block Requisition Submission Handler
  /**
   * Add a demand locally and bundle it into the first block sharing its circuit.
   * If none matches, propose a block at 01:30 IST with 20 extra minutes for a power
   * block. Update estimated savings and display a registration notice.
   */
  const handleDemandSubmit = (newDemand: MaintenanceDemand) => {
    setDemands((prev) => [newDemand, ...prev]);

    setJointBlocks((prev) => {
      const existingBlock = prev.find((b) => b.affectedTrackCircuits.includes(newDemand.trackCircuitId));
      if (existingBlock) {
        return prev.map((b) =>
          b.blockId === existingBlock.blockId
            ? {
                ...b,
                bundledDemandIds: Array.from(new Set([...b.bundledDemandIds, newDemand.demandId])),
                downtimeSavedMinutes: b.downtimeSavedMinutes + Math.round(newDemand.durationMinutes * 0.4),
                corridorDowntimeSavedPct: Math.min(48.5, b.corridorDowntimeSavedPct + 3.5)
              }
            : b
        );
      } else {
        const newBlock: JointBlockSchedule = {
          blockId: `JB-2026-0926-${String(prev.length + 1).padStart(2, '0')}`,
          corridorName: `CSMT - Kalyan (${newDemand.trackLine.replace('_', ' ')})`,
          trackLine: newDemand.trackLine,
          startTimeMinutes: 90, // 01:30 IST
          endTimeMinutes: 90 + newDemand.durationMinutes + (newDemand.requiresPowerBlock ? 20 : 0),
          durationMinutes: newDemand.durationMinutes + (newDemand.requiresPowerBlock ? 20 : 0),
          affectedTrackCircuits: [newDemand.trackCircuitId],
          bundledDemandIds: [newDemand.demandId],
          downtimeSavedMinutes: Math.round(newDemand.durationMinutes * 0.35),
          corridorDowntimeSavedPct: 38.4,
          passengerDelaysMinutes: 0,
          kavachTsrSpeedKmh: 30,
          isEmergencyTsrFallback: false,
          status: 'PROPOSED',
          optimizationTimestamp: new Date().toISOString()
        };
        return [newBlock, ...prev];
      }
    });

    setActionNotice(
      `Requisition [${newDemand.demandId}] registered by ${newDemand.department.split('_')[0]}. Bundled into White Corridor (01:30 - 04:45 AM) on ${newDemand.trackCircuitId} with 0 passenger delay.`
    );
  };

  // Master Sanction Event Bus (Atomic Block Possession & Interlocking Clamp)
  /**
   * Mark affected circuits sanctioned, power isolated, and signals red locally,
   * then request backend sanction and schedule the local dossier display.
   * Request failures are ignored; local circuit changes are retained.
   *
   * @throws Audio context initialization errors reject the returned promise.
   */
  const handleSanctionBlock = async (block: JointBlockSchedule) => {
    playActionConfirmedChime();
    setSelectedBlockId(block.blockId);

    setCircuits((prev) =>
      prev.map((c) => {
        if (block.affectedTrackCircuits.includes(c.circuitId)) {
          return {
            ...c,
            status: 'BLOCK_SANCTIONED',
            oheEnergized: false,
            isSignalClamped: true,
            signalAspect: 'RED',
            speedLimitKmh: block.kavachTsrSpeedKmh || 30
          };
        }
        return c;
      })
    );

    try {
      await sanctionBlockRequest(block.blockId, 'CTRL-MUM-402');
    } catch {
      // Fallback
    }

    const dossier = buildExplainableDossier({
      blockId: block.blockId,
      sanctionedBy: `Section Controller CTRL-MUM-402 (${deploymentMode} Mode)`,
      bundledDemandIds: block.bundledDemandIds,
      kavachTsrSpeedKmh: block.kavachTsrSpeedKmh
    });
    setCurrentDossier(dossier);

    setActionNotice(
      `Joint Shadow Block #${block.blockId} Sanctioned on ${block.affectedTrackCircuits.join(
        ', '
      )} — Form S&T/T-351 Lockout active, 25kV OHE Power Isolated.`
    );

    setTimeout(() => {
      setIsDecisionLogOpen(true);
    }, 400);

    setTimeout(() => {
      setActionNotice(null);
    }, 6000);
  };

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

  /**
   * Start the timed scenario pipeline and return before it finishes. Calculate
   * braking distance through the API client, using local physics if it rejects,
   * and prepare decision records. Autonomous mode starts simulated braking;
   * advisory mode pauses at the approval stage.
   *
   * @throws Audio context initialization errors before the timed stages begin.
   */
  const handleRunPipeline = () => {
    if (decelIntervalRef.current) clearInterval(decelIntervalRef.current);
    setIsPipelineExecuting(true);
    setIsAdvisoryApproved(false);
    setBrakeState('CLEAR');
    setCurrentSpeedKmh(currentScenario.initialSpeedKmh);
    setBrakePressureBar(0.0);

    playCabEmergencyAlarm(0.8);

    setActiveStage(1);

    setTimeout(async () => {
      setActiveStage(2);

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
            reactionTimeSeconds: 1.2 * weatherParams.reactionTimeMultiplier
          });
        } catch {
          result = calculateKavachEbd({
            trainId: currentScenario.trainId,
            velocityKmh: currentScenario.initialSpeedKmh,
            obstacleDistanceMeters: currentScenario.distanceMeters,
            weatherCondition: weatherCondition,
            gradientPercent: 0.002
          });
        }
        setEbdResult(result);
        setActiveStage(3);

        const log = buildExplainableDecisionLog(
          currentScenario.id === 'BOULDER_CRITICAL'
            ? 'RS-2048'
            : currentScenario.id === 'CATTLE_WARNING'
            ? 'RS-2051'
            : 'RS-2050',
          currentScenario.trainId,
          'Section 14B — Up Main Line',
          deploymentMode,
          currentScenario.hazardClass,
          currentScenario.distanceMeters,
          result.calculatedStoppingDistanceMeters
        );
        setCurrentDecisionLog(log);

        const dossier = buildExplainableDossier({
          blockId: 'JB-2026-0926-01',
          sanctionedBy: `Section Controller (${deploymentMode} Mode)`,
          bundledDemandIds: ['DEM-TMS-01', 'DEM-TDMS-02'],
          kavachTsrSpeedKmh: 30
        });
        setCurrentDossier(dossier);

        setTimeout(() => {
          setActiveStage(4);

          if (deploymentMode === 'AUTONOMOUS') {
            startDecelerationSequence();
            setTimeout(() => {
              setActiveStage(5);
              setIsPipelineExecuting(false);
              setTimeout(() => {
                setIsDecisionLogOpen(true);
              }, 1200);
            }, 1000);
          } else {
            setIsPipelineExecuting(false);
          }
        }, 500);
      }, 500);
    }, 400);
  };

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

  /**
   * Select an incident, switch to its camera view, and build its local decision log.
   * For cab incidents, choose a scenario from the first detected hazard, defaulting
   * to the rail-fracture scenario for hazards other than boulders or cattle.
   */
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
      setActiveTab('VISION_TELEMETRY');
    } else if (incident.cameraType === 'PLATFORM_GATEWAY') {
      setActiveTab('PLATFORM_GATEWAY');
    }

    const log = buildExplainableDecisionLog(
      incident.incidentId,
      incident.incidentId === 'RS-2048'
        ? '12345 (Vande Bharat)'
        : incident.incidentId === 'RS-2049'
        ? '12137 (Punjab Mail)'
        : '22691 (Rajdhani)',
      incident.incidentId === 'RS-2049' ? 'CSMT Platform 17/18 Bottleneck' : 'Section 14B Up Main Line',
      deploymentMode,
      incident.boundingBoxes[0]?.class || 'BOULDER',
      incident.boundingBoxes[0]?.estimatedDistanceMeters || 340,
      410
    );
    setCurrentDecisionLog(log);
  };

  /**
   * Request incident approval and schedule display of locally generated decision
   * records. Review request failures are ignored, so the approval notice and
   * dossier display do not confirm backend acceptance.
   *
   * @throws Audio context initialization errors reject the returned promise.
   */
  const handleApproveIncidentAction = async (incidentId: string) => {
    playActionConfirmedChime();
    setSelectedIncidentId(incidentId);
    setActionNotice(`Safety Action for Incident #${incidentId} approved by Section Controller CTRL-MUM-402.`);

    try {
      await reviewIncidentAction(incidentId, 'APPROVE', 'CTRL-MUM-402');
    } catch {
      // Handled
    }

    const log = buildExplainableDecisionLog(
      incidentId,
      incidentId === 'RS-2048'
        ? '12345 (Vande Bharat)'
        : incidentId === 'RS-2049'
        ? '12137 (Punjab Mail)'
        : '22691 (Rajdhani)',
      incidentId === 'RS-2049' ? 'CSMT Platform 17/18 Bottleneck' : 'Section 14B Up Main Line',
      deploymentMode,
      incidentId === 'RS-2049' ? 'CROWD_SURGE' : incidentId === 'RS-2050' ? 'RAIL_FRACTURE' : 'BOULDER',
      incidentId === 'RS-2049' ? 15 : 340,
      410
    );
    setCurrentDecisionLog(log);

    const dossier = buildExplainableDossier({
      blockId: 'JB-2026-0926-01',
      sanctionedBy: `Section Controller CTRL-MUM-402 (${deploymentMode} Mode)`,
      bundledDemandIds: ['DEM-TMS-01'],
      kavachTsrSpeedKmh: 30
    });
    setCurrentDossier(dossier);

    setTimeout(() => {
      setIsDecisionLogOpen(true);
    }, 400);

    setTimeout(() => {
      setActionNotice(null);
    }, 5000);
  };

  /**
   * Select a circuit and open the mapped platform or vision view, accepting both
   * TC circuit IDs and legacy BLK IDs. Unmapped IDs leave the current view unchanged.
   */
  const handleTrackSelect = (circuitId: string) => {
    setSelectedTrackId(circuitId);
    if (circuitId === 'TC-04' || circuitId === 'TC-05' || circuitId === 'BLK-104' || circuitId === 'BLK-105') {
      setActiveTab('PLATFORM_GATEWAY');
    } else if (circuitId === 'TC-01' || circuitId === 'BLK-101') {
      handleSelectScenario(SCENARIOS.BOULDER_CRITICAL);
      setActiveTab('VISION_TELEMETRY');
    } else if (circuitId === 'TC-03' || circuitId === 'BLK-103') {
      handleSelectScenario(SCENARIOS.CATTLE_WARNING);
      setActiveTab('VISION_TELEMETRY');
    }
  };

  const isCorridorPlanner = activeTab === 'CORRIDOR_PLANNER' || activeTab === 'OVERVIEW';
  const isVisionTelemetry = activeTab === 'VISION_TELEMETRY' || activeTab === 'LOCO_CAB';
  const isAuditorWorkspace = activeTab === 'AUDITOR_WORKSPACE';

  return (
    <div className="min-h-screen bg-[#F0F6FC] flex flex-col font-sans antialiased text-[#0F172A]">
      {/* Global Persistent Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        horizon={horizon}
        onHorizonChange={handleHorizonChange}
        deploymentMode={deploymentMode}
        onModeToggle={setDeploymentMode}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode((value) => !value)}
        onRequestBlock={() => setIsRequisitionOpen(true)}
      />

      {/* Action Notification Toast Banner */}
      {actionNotice && (
        <div className="max-w-7xl mx-auto w-full px-4 lg:px-6 pt-3">
          <div
            className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs font-mono shadow-xs"
            style={{ borderRadius: '8px' }}
          >
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-0.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Command Center Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        {/* SCREEN 1: MASTER CORRIDOR PLANNER (screen1_master_corridor_cockpit.html) */}
        {isCorridorPlanner && (
          <div className="space-y-6">
            <KpiStrip />

            {/* Quick Departmental Requisition Banner */}
            <div
              className="bg-white border border-[#D0DFEE] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              style={{ borderRadius: '12px' }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-9 h-9 bg-[#E6F0FA] text-[#2B7FFF] flex items-center justify-center font-bold text-lg"
                  style={{ borderRadius: '8px' }}
                >
                  ⚡
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-[#0F172A]">Direct Departmental Requisition Portal</h4>
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2" style={{ borderRadius: '4px' }}>
                      Auto-BDMS Live
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    TDMS (Electrical 25kV OHE), SMMS (S&T Interlocking / SW-04), and TMS (Civil P-Way) officers can directly submit block demands.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRequisitionOpen(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#2B7FFF] hover:bg-blue-600 transition-all flex items-center space-x-1.5 shadow-sm whitespace-nowrap cursor-pointer"
                style={{ borderRadius: '4px' }}
              >
                <span>+</span>
                <span>Submit Block Requisition</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-6">
                <CorridorStringChart
                  activeBlocks={filteredBlocks}
                  trainPaths={MOCK_TRAIN_SCHEDULES}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={(blockId) => {
                    const block = filteredBlocks.find((b) => b.blockId === blockId) || filteredBlocks[0];
                    if (block) {
                      handleSanctionBlock(block);
                    }
                  }}
                  horizon={horizon}
                />

                <div
                  className="bg-white border border-[#D0DFEE] p-5 shadow-xs"
                  style={{ borderRadius: '16px' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D0DFEE]">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📊</span>
                      <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
                        Peripheral Recharts Analytics Suite
                      </h3>
                      <span
                        className="text-[10px] font-mono font-semibold bg-[#E6F0FA] text-[#2B7FFF] px-1.5 py-0.5 border border-[#D0DFEE]"
                        style={{ borderRadius: '4px' }}
                      >
                        RDSO COMPLIANT
                      </span>
                    </div>

                    <div
                      className="flex space-x-1 p-0.5 bg-[#F0F6FC] border border-[#D0DFEE]"
                      style={{ borderRadius: '4px' }}
                    >
                      <button
                        onClick={() => setAnalyticsTab('TRIAGE_DONUT')}
                        className={`px-2.5 py-1 text-xs font-mono font-semibold transition-all ${
                          analyticsTab === 'TRIAGE_DONUT'
                            ? 'bg-[#2B7FFF] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        style={{ borderRadius: '4px' }}
                      >
                        Multi-Dept Demand Donut
                      </button>
                      <button
                        onClick={() => setAnalyticsTab('DECEL_CURVE')}
                        className={`px-2.5 py-1 text-xs font-mono font-semibold transition-all ${
                          analyticsTab === 'DECEL_CURVE'
                            ? 'bg-[#2B7FFF] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        style={{ borderRadius: '4px' }}
                      >
                        Kavach Decel Curve
                      </button>
                      <button
                        onClick={() =>
                          setAnalyticsTab(analyticsTab === 'COLLAPSED' ? 'TRIAGE_DONUT' : 'COLLAPSED')
                        }
                        className={`px-2 py-1 text-xs font-mono font-semibold transition-all ${
                          analyticsTab === 'COLLAPSED'
                            ? 'bg-slate-700 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        style={{ borderRadius: '4px' }}
                      >
                        {analyticsTab === 'COLLAPSED' ? 'Expand' : 'Hide'}
                      </button>
                    </div>
                  </div>

                  {analyticsTab !== 'COLLAPSED' && (
                    <div className="pt-4">
                      {analyticsTab === 'TRIAGE_DONUT' && <TriageDonut />}
                      {analyticsTab === 'DECEL_CURVE' && <DecelerationCurve />}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-4">
                <IncidentQueue
                  selectedIncidentId={selectedIncidentId}
                  onSelectIncident={handleSelectIncident}
                  onApproveAction={handleApproveIncidentAction}
                />
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: INTERLOCKING TRACK CIRCUIT SCHEMATIC (screen2_interlocking_track_map.html) */}
        {activeTab === 'INTERLOCKING' && (
          <div className="space-y-6">
            <KpiStrip />
            <InterlockingMap
              circuits={circuits}
              selectedCircuitId={selectedTrackId}
              onTrackSelect={handleTrackSelect}
            />
            <IncidentQueue
              selectedIncidentId={selectedIncidentId}
              onSelectIncident={handleSelectIncident}
              onApproveAction={handleApproveIncidentAction}
            />
          </div>
        )}

        {/* SCREEN 3: DEFECT VISION & CAB TELEMETRY CONSOLE (screen3_defect_vision_telemetry.html) */}
        {isVisionTelemetry && (
          <div>
            <DefectVisionTelemetry />
          </div>
        )}

        {/* SCREEN 4: AUDITOR WORKSPACE & REGULATORY TERMINAL (screen4_auditor_workspace.html) */}
        {isAuditorWorkspace && (
          <div>
            <AuditorWorkspace />
          </div>
        )}

        {/* AUXILIARY VIEW: PLATFORM GATEWAY CCTV */}
        {activeTab === 'PLATFORM_GATEWAY' && (
          <div>
            <PlatformGatewayFeed />
          </div>
        )}
      </main>

      {/* Explainable Decision Dossier Modal */}
      <DecisionLogModal
        isOpen={isDecisionLogOpen}
        onClose={() => setIsDecisionLogOpen(false)}
        dossier={currentDossier}
        log={currentDecisionLog}
      />

      {/* Direct Block Requisition Modal (TDMS, SMMS, TMS) */}
      <BlockRequisitionModal
        isOpen={isRequisitionOpen}
        onClose={() => setIsRequisitionOpen(false)}
        onSubmitDemand={handleDemandSubmit}
      />
    </div>
  );
}

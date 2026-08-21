// src/components/AgentPipelineCanvas.tsx
'use client';

import React from 'react';
import { Card } from './Common/Card';
import { DeploymentMode, EbdCalculationResult } from '@/types/apiContracts';
import { TacticalScenario } from './LocoCameraFeed';

interface AgentPipelineCanvasProps {
  activeStage: number; // 0 = idle, 1 = vision, 2 = telemetry, 3 = physics, 4 = actuation, 5 = complete
  isExecuting: boolean;
  deploymentMode: DeploymentMode;
  ebdResult: EbdCalculationResult | null;
  currentScenario: TacticalScenario;
  isAdvisoryApproved: boolean;
  onApproveAdvisoryAction: () => void;
  onOpenDecisionLog: () => void;
  onReset: () => void;
  onRunPipeline: () => void;
}

export const AgentPipelineCanvas: React.FC<AgentPipelineCanvasProps> = ({
  activeStage,
  isExecuting,
  deploymentMode,
  ebdResult,
  currentScenario,
  isAdvisoryApproved,
  onApproveAdvisoryAction,
  onOpenDecisionLog,
  onReset,
  onRunPipeline
}) => {
  const dStop = ebdResult?.calculatedStoppingDistanceMeters ?? 410;
  const margin = ebdResult?.marginDistanceMeters ?? (currentScenario.distanceMeters - dStop);
  const isCollisionRisk = ebdResult?.isCollisionRisk ?? (dStop >= currentScenario.distanceMeters);

  const steps = [
    {
      num: 1,
      title: 'Vision Hazard Detector',
      agent: 'YOLOv11 Edge Inference',
      latency: '12ms',
      desc: `${currentScenario.hazardClass} detected @ ${currentScenario.distanceMeters}m (${Math.round(currentScenario.confidence * 100)}% conf)`,
      status: activeStage >= 1 ? 'COMPLETED' : 'IDLE',
      highlight: activeStage === 1
    },
    {
      num: 2,
      title: 'Telemetry Aggregator',
      agent: 'Kavach Radio & Odometer',
      latency: '24ms',
      desc: `V=${currentScenario.initialSpeedKmh} km/h, Mass=1400t, μ=0.134, G=+0.002, t_react=1.96s`,
      status: activeStage >= 2 ? 'COMPLETED' : activeStage === 1 ? 'PENDING' : 'IDLE',
      highlight: activeStage === 2
    },
    {
      num: 3,
      title: 'Kavach Braking Agent',
      agent: 'RDSO Physics Engine',
      latency: '15ms',
      desc: `D_stop=${dStop}m (Margin: ${margin > 0 ? '+' : ''}${margin}m). ${isCollisionRisk ? 'Collision Deficit!' : 'Safe Clearance.'}`,
      status: activeStage >= 3 ? 'COMPLETED' : activeStage === 2 ? 'CALCULATING' : 'IDLE',
      highlight: activeStage === 3
    },
    {
      num: 4,
      title: deploymentMode === 'AUTONOMOUS' ? 'Auto-Brake Actuator' : 'Advisory Dispatcher Gate',
      agent: deploymentMode === 'AUTONOMOUS' ? 'Direct Solenoid Failsafe' : 'Human-in-the-Loop OP-402',
      latency: deploymentMode === 'AUTONOMOUS' ? '20ms' : 'Manual',
      desc:
        deploymentMode === 'AUTONOMOUS'
          ? activeStage >= 4
            ? 'Emergency solenoid valve energized directly.'
            : 'Standby for automated trigger.'
          : isAdvisoryApproved
          ? 'Approved by Controller. Solenoid triggered.'
          : activeStage >= 4
          ? 'Operator authorization required to trip brake.'
          : 'Standby for advisory verification.',
      status:
        deploymentMode === 'AUTONOMOUS'
          ? activeStage >= 4
            ? 'ACTUATED'
            : 'STANDBY'
          : isAdvisoryApproved
          ? 'CONFIRMED'
          : activeStage >= 4
          ? 'WAITING_APPROVAL'
          : 'STANDBY',
      highlight: activeStage === 4
    }
  ];

  return (
    <Card
      title="4-Agent Safety Pipeline Execution Canvas (Kavach Deterministic Flow)"
      className="mb-6"
    >
      {/* Pipeline Header Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#D0DFEE]">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                activeStage === 0
                  ? 'bg-slate-400'
                  : activeStage < 4 || (deploymentMode === 'ADVISORY' && !isAdvisoryApproved)
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="text-xs font-bold text-[#0F172A]">
              STATUS:{' '}
              {activeStage === 0
                ? 'PIPELINE READY'
                : activeStage < 4
                ? `STAGE ${activeStage} EXECUTING...`
                : deploymentMode === 'ADVISORY' && !isAdvisoryApproved
                ? 'WAITING FOR CONTROLLER CONFIRMATION'
                : 'PIPELINE COMPLETED & LOGGED'}
            </span>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            Pipeline Latency: <strong className="text-[#2B7FFF]">51ms</strong> (Edge Compute)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {activeStage > 0 && (
            <button
              onClick={onReset}
              className="px-3 py-1.5 bg-white hover:bg-[#F0F6FC] text-[#0F172A] border border-[#D0DFEE] text-xs font-bold transition-all"
              style={{ borderRadius: '4px' }}
            >
              🔄 Reset Flow
            </button>
          )}

          <button
            onClick={onRunPipeline}
            disabled={isExecuting && activeStage > 0 && activeStage < 4}
            className="px-3 py-1.5 bg-[#2B7FFF] hover:bg-blue-600 text-white text-xs font-bold border border-[#2B7FFF] shadow-xs transition-all disabled:opacity-50"
            style={{ borderRadius: '4px' }}
          >
            ⚡ Run Kavach Pipeline
          </button>
        </div>
      </div>

      {/* 4-Stage Connected Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 relative">
        {steps.map((step, idx) => {
          const isDone = step.status === 'COMPLETED' || step.status === 'ACTUATED' || step.status === 'CONFIRMED';
          const isWaiting = step.status === 'WAITING_APPROVAL';

          return (
            <div
              key={step.num}
              className={`p-4 border transition-all relative flex flex-col justify-between ${
                step.highlight
                  ? 'bg-blue-50/80 border-[#2B7FFF] ring-2 ring-[#2B7FFF]/20 shadow-md'
                  : isDone
                  ? 'bg-emerald-50/40 border-emerald-300'
                  : isWaiting
                  ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/30'
                  : 'bg-white border-[#D0DFEE] opacity-75'
              }`}
              style={{ borderRadius: '16px' }}
            >
              <div>
                {/* Header with Stage Number and Latency */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isWaiting
                          ? 'bg-amber-500 text-white animate-pulse'
                          : step.highlight
                          ? 'bg-[#2B7FFF] text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                      style={{ borderRadius: '4px' }}
                    >
                      {step.num}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">
                      Stage {step.num}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded" style={{ borderRadius: '4px' }}>
                    {step.latency}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-[#0F172A] mb-1">{step.title}</h4>
                <div className="text-[10px] font-mono text-blue-600 mb-2">{step.agent}</div>
                <p className="text-[11px] font-mono text-slate-700 leading-relaxed bg-white/60 p-2 rounded border border-slate-100 mb-3" style={{ borderRadius: '4px' }}>
                  {step.desc}
                </p>
              </div>

              {/* Step Footer Status */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-100">
                  <span className="text-slate-500">STATE:</span>
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : isWaiting
                        ? 'bg-amber-200 text-amber-900 animate-pulse'
                        : step.highlight
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                    style={{ borderRadius: '4px' }}
                  >
                    {step.status}
                  </span>
                </div>

                {/* Stage 4 Interactive Approval CTA (Advisory Mode) */}
                {step.num === 4 && isWaiting && (
                  <div className="mt-3">
                    <button
                      onClick={onApproveAdvisoryAction}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md border border-amber-400 transition-all flex items-center justify-center space-x-1"
                      style={{ borderRadius: '4px' }}
                    >
                      <span>🛡️</span>
                      <span>[APPROVE SOLENOID]</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Advisory Gate Notice Banner (When Waiting) */}
      {deploymentMode === 'ADVISORY' && activeStage >= 4 && !isAdvisoryApproved && (
        <div className="p-3 mb-4 bg-amber-50 border border-amber-300 rounded flex items-center justify-between text-xs" style={{ borderRadius: '4px' }}>
          <div className="flex items-center space-x-2 text-amber-900 font-mono">
            <span className="text-base">⚠️</span>
            <span>
              <strong>PHASE 1 ADVISORY INTERLOCK:</strong> Train #12345 requires Section Controller OP-402 manual clearance before Kavach EBD solenoid actuates.
            </span>
          </div>
          <button
            onClick={onApproveAdvisoryAction}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all"
            style={{ borderRadius: '4px' }}
          >
            Authorize Braking Signal
          </button>
        </div>
      )}

      {/* RDSO Physics Formula Callout Box */}
      <div className="p-3 bg-[#F0F6FC] border border-[#D0DFEE] rounded mb-4 flex flex-wrap items-center justify-between gap-2 text-xs font-mono" style={{ borderRadius: '4px' }}>
        <div className="flex items-center space-x-2 text-slate-700">
          <span className="font-bold text-[#2B7FFF]">RDSO EBD SPEC:</span>
          <span>
            D_stop = (V² / (2 · g · (μ + G))) + (V · t_react) ={' '}
            <strong className="text-[#0F172A]">{dStop}m</strong>
          </span>
        </div>
        <div className="flex items-center space-x-3 text-slate-600">
          <span>Target Obstacle: <strong className="text-red-600">{currentScenario.distanceMeters}m</strong></span>
          <span>Safety Delta: <strong className={margin < 0 ? 'text-red-600' : 'text-emerald-600'}>{margin}m</strong></span>
        </div>
      </div>

      {/* Drawer Open CTA & Audit Link */}
      <div className="flex items-center justify-between pt-2 border-t border-[#D0DFEE]">
        <div className="text-[11px] text-slate-500 font-mono">
          Immutable Compliance Hash: <span className="text-slate-800 font-bold">SHA-256 #9f8c...4a1e</span> (RDSO Sec 4.2)
        </div>
        <button
          onClick={onOpenDecisionLog}
          className="px-4 py-2 bg-white hover:bg-[#F0F6FC] text-[#0F172A] border border-[#D0DFEE] text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5"
          style={{ borderRadius: '4px' }}
        >
          <span>🔍</span>
          <span>View 4-Step Explainable Decision Log Modal</span>
        </button>
      </div>
    </Card>
  );
};

'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { KpiStrip } from '@/components/Overview/KpiStrip';
import { CorridorStringChart } from '@/components/Planner/CorridorStringChart';
import { IncidentQueue } from '@/components/Overview/IncidentQueue';
import { TriageDonut, DecelerationCurve } from '@/components/Charts';
import { DecisionLogModal } from '@/components/Auditor/DecisionLogModal';
import { BlockRequisitionModal } from '@/components/Requisition/BlockRequisitionModal';
import {
  DeploymentMode,
  HorizonTier,
  JointBlockSchedule,
  MaintenanceDemand,
  ExplainableDecisionLog,
  ExplainableDecisionDossier
} from '@/types/apiContracts';
import {
  MOCK_DECISION_DOSSIER,
  MOCK_DECISION_LOG,
  MOCK_JOINT_BLOCKS,
  MOCK_TRAIN_SCHEDULES,
  MOCK_DEMANDS
} from '@/lib/mockData';
import { playActionConfirmedChime } from '@/lib/audioAlerts';

import { useTheme } from '@/context/ThemeContext';

export default function CorridorPlannerPage() {
  const [horizon, setHorizon] = useState<HorizonTier>('TACTICAL_24H');
  const [deploymentMode, setDeploymentMode] = useState<DeploymentMode>('ADVISORY');
  const { isDarkMode, toggleTheme } = useTheme();
  const [isDecisionLogOpen, setIsDecisionLogOpen] = useState(false);
  const [isRequisitionOpen, setIsRequisitionOpen] = useState(false);
  const [currentDecisionLog] = useState<ExplainableDecisionLog>(MOCK_DECISION_LOG);
  const [currentDossier] = useState<ExplainableDecisionDossier>(MOCK_DECISION_DOSSIER);

  const [demands, setDemands] = useState<MaintenanceDemand[]>(MOCK_DEMANDS);
  const [jointBlocks] = useState<JointBlockSchedule[]>(MOCK_JOINT_BLOCKS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('RS-2048');
  const [selectedBlockId, setSelectedBlockId] = useState<string>('JB-2026-0926-01');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [analyticsTab, setAnalyticsTab] = useState<'COLLAPSED' | 'TRIAGE_DONUT' | 'DECEL_CURVE'>('TRIAGE_DONUT');

  const handleApproveIncident = (id: string) => {
    setSelectedIncidentId(id);
    playActionConfirmedChime();
    setActionNotice(`Sanctioned Joint Possession for incident ${id}`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <ProtectedRoute
      allowedRoles={['CORRIDOR_PLANNER', 'ADMIN']}
      screenName="Screen 1: Corridor Planner & Joint Block Optimizer"
    >
      <div className="min-h-screen bg-[#F0F6FC] text-[#0F172A] flex flex-col font-sans">
        <Navbar
          activeTab="CORRIDOR_PLANNER"
          horizon={horizon}
          onHorizonChange={setHorizon}
          deploymentMode={deploymentMode}
          onModeToggle={setDeploymentMode}
          isDarkMode={isDarkMode}
          onThemeToggle={toggleTheme}
          onRequestBlock={() => setIsRequisitionOpen(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 space-y-4">
          {actionNotice && (
            <div
              className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-xs"
              style={{ borderRadius: '4px' }}
            >
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{actionNotice}</span>
              </div>
              <button
                onClick={() => setActionNotice(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* 6 Metric KPI Strip */}
          <KpiStrip />

          {/* Screen 1: Corridor Planner & Demand Queue */}
          <div className="space-y-4">
            <CorridorStringChart
              activeBlocks={jointBlocks}
              trainPaths={MOCK_TRAIN_SCHEDULES}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              onViewDossier={() => setIsDecisionLogOpen(true)}
            />

            <IncidentQueue
              demands={demands}
              selectedDemandId={selectedIncidentId}
              onSelectDemand={(d) => setSelectedIncidentId(d.demandId)}
              onSanctionDemand={handleApproveIncident}
              onViewDossier={() => setIsDecisionLogOpen(true)}
            />
          </div>

          {/* Analytics Drawer */}
          <div className="bg-white border border-[#D0DFEE] p-4 shadow-xs space-y-3" style={{ borderRadius: '16px' }}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Corridor Capacity &amp; Deceleration Analytics
                </h3>
                <span className="text-[10px] font-mono bg-blue-50 text-[#2B7FFF] px-1.5 py-0.2 border border-[#D0DFEE]" style={{ borderRadius: '4px' }}>
                  RDSO EBD &amp; CP-SAT
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setAnalyticsTab(analyticsTab === 'TRIAGE_DONUT' ? 'COLLAPSED' : 'TRIAGE_DONUT')}
                  className={`px-2 py-0.5 text-xs font-semibold border ${
                    analyticsTab === 'TRIAGE_DONUT' ? 'bg-[#2B7FFF] text-white border-[#2B7FFF]' : 'bg-slate-50 text-slate-600 border-[#D0DFEE]'
                  }`}
                  style={{ borderRadius: '4px' }}
                >
                  Department Triage
                </button>
                <button
                  onClick={() => setAnalyticsTab(analyticsTab === 'DECEL_CURVE' ? 'COLLAPSED' : 'DECEL_CURVE')}
                  className={`px-2 py-0.5 text-xs font-semibold border ${
                    analyticsTab === 'DECEL_CURVE' ? 'bg-[#2B7FFF] text-white border-[#2B7FFF]' : 'bg-slate-50 text-slate-600 border-[#D0DFEE]'
                  }`}
                  style={{ borderRadius: '4px' }}
                >
                  Kavach Decel Curve
                </button>
              </div>
            </div>

            {analyticsTab === 'TRIAGE_DONUT' && (
              <div className="pt-2">
                <TriageDonut demands={demands} />
              </div>
            )}

            {analyticsTab === 'DECEL_CURVE' && (
              <div className="pt-2">
                <DecelerationCurve initialSpeedKmh={110} currentDistanceMeters={420} currentSpeedKmh={45} />
              </div>
            )}
          </div>
        </main>

        <DecisionLogModal
          isOpen={isDecisionLogOpen}
          onClose={() => setIsDecisionLogOpen(false)}
          log={currentDecisionLog}
          dossier={currentDossier}
        />

        <BlockRequisitionModal
          isOpen={isRequisitionOpen}
          onClose={() => setIsRequisitionOpen(false)}
          onSubmitDemand={(newDemand: MaintenanceDemand) => {
            setDemands((prev) => [newDemand, ...prev]);
            setActionNotice(`Created Joint Block Demand ${newDemand.demandId} for ${newDemand.stationSection}`);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}

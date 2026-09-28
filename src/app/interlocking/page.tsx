'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { KpiStrip } from '@/components/Overview/KpiStrip';
import { InterlockingMap } from '@/components/Overview/InterlockingMap';
import { IncidentQueue } from '@/components/Overview/IncidentQueue';
import { DecisionLogModal } from '@/components/Auditor/DecisionLogModal';
import { BlockRequisitionModal } from '@/components/Requisition/BlockRequisitionModal';
import {
  DeploymentMode,
  HorizonTier,
  TrackCircuitState,
  MaintenanceDemand,
  ExplainableDecisionLog,
  ExplainableDecisionDossier
} from '@/types/apiContracts';
import {
  MOCK_DECISION_DOSSIER,
  MOCK_DECISION_LOG,
  MOCK_TRACK_CIRCUITS,
  MOCK_DEMANDS
} from '@/lib/mockData';
import { playActionConfirmedChime } from '@/lib/audioAlerts';
import { useTheme } from '@/context/ThemeContext';

export default function InterlockingPage() {
  const [horizon, setHorizon] = useState<HorizonTier>('TACTICAL_24H');
  const [deploymentMode, setDeploymentMode] = useState<DeploymentMode>('ADVISORY');
  const { isDarkMode, toggleTheme } = useTheme();
  const [isDecisionLogOpen, setIsDecisionLogOpen] = useState(false);
  const [isRequisitionOpen, setIsRequisitionOpen] = useState(false);
  const [currentDecisionLog] = useState<ExplainableDecisionLog>(MOCK_DECISION_LOG);
  const [currentDossier] = useState<ExplainableDecisionDossier>(MOCK_DECISION_DOSSIER);

  const [demands, setDemands] = useState<MaintenanceDemand[]>(MOCK_DEMANDS);
  const [circuits, setCircuits] = useState<TrackCircuitState[]>(MOCK_TRACK_CIRCUITS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('RS-2048');
  const [selectedTrackId, setSelectedTrackId] = useState<string>('TC-03');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleApproveIncident = (id: string) => {
    setSelectedIncidentId(id);
    playActionConfirmedChime();
    setActionNotice(`Sanctioned Joint Possession for incident ${id}`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleToggleSignalClamp = (circuitId: string) => {
    setCircuits((prev) =>
      prev.map((c) => {
        if (c.circuitId === circuitId) {
          const nextClamped = !c.isSignalClamped;
          return {
            ...c,
            isSignalClamped: nextClamped,
            signalAspect: nextClamped ? 'RED' : 'GREEN'
          };
        }
        return c;
      })
    );
    playActionConfirmedChime();
    setActionNotice(`Toggled S&T Signal Clamp on Circuit ${circuitId}`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <ProtectedRoute
      allowedRoles={['SECTION_CONTROLLER', 'ADMIN']}
      screenName="Screen 2: Section Interlocking & Signal Controller"
    >
      <div className="min-h-screen bg-[#F0F6FC] text-[#0F172A] flex flex-col font-sans">
        <Navbar
          activeTab="INTERLOCKING"
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

          {/* Screen 2: Track Circuit Interlocking & Incident Queue */}
          <div className="space-y-4">
            <InterlockingMap
              circuits={circuits}
              selectedCircuitId={selectedTrackId}
              onTrackSelect={setSelectedTrackId}
              onToggleClamp={handleToggleSignalClamp}
            />

            <IncidentQueue
              demands={demands}
              selectedDemandId={selectedIncidentId}
              onSelectDemand={(d) => setSelectedIncidentId(d.demandId)}
              onSanctionDemand={handleApproveIncident}
              onViewDossier={() => setIsDecisionLogOpen(true)}
            />
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

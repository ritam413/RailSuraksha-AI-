'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { AuditorWorkspace } from '@/components/Auditor/AuditorWorkspace';
import { DecisionLogModal } from '@/components/Auditor/DecisionLogModal';
import { BlockRequisitionModal } from '@/components/Requisition/BlockRequisitionModal';
import {
  DeploymentMode,
  HorizonTier,
  ExplainableDecisionLog,
  ExplainableDecisionDossier
} from '@/types/apiContracts';
import {
  MOCK_DECISION_DOSSIER,
  MOCK_DECISION_LOG
} from '@/lib/mockData';
import { useTheme } from '@/context/ThemeContext';

export default function AuditorPage() {
  const [horizon, setHorizon] = useState<HorizonTier>('TACTICAL_24H');
  const [deploymentMode, setDeploymentMode] = useState<DeploymentMode>('ADVISORY');
  const { isDarkMode, toggleTheme } = useTheme();
  const [isDecisionLogOpen, setIsDecisionLogOpen] = useState(false);
  const [isRequisitionOpen, setIsRequisitionOpen] = useState(false);
  const [currentDecisionLog] = useState<ExplainableDecisionLog>(MOCK_DECISION_LOG);
  const [currentDossier] = useState<ExplainableDecisionDossier>(MOCK_DECISION_DOSSIER);

  return (
    <ProtectedRoute
      allowedRoles={['SAFETY_AUDITOR', 'ADMIN']}
      screenName="Screen 4: Statutory Safety Auditor Workspace & CRS Form 14B"
    >
      <div className="min-h-screen bg-[#F0F6FC] text-[#0F172A] flex flex-col font-sans">
        <Navbar
          activeTab="AUDITOR_WORKSPACE"
          horizon={horizon}
          onHorizonChange={setHorizon}
          deploymentMode={deploymentMode}
          onModeToggle={setDeploymentMode}
          isDarkMode={isDarkMode}
          onThemeToggle={toggleTheme}
          onRequestBlock={() => setIsRequisitionOpen(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 space-y-4">
          <AuditorWorkspace />
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
          onSubmitDemand={() => {}}
        />
      </div>
    </ProtectedRoute>
  );
}

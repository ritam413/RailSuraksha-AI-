// src/components/Auditor/AuditorWorkspace.tsx
'use client';

import React, { useState } from 'react';
import { Card } from '../Common/Card';
import { ExplainableDecisionDossier, MaintenanceDemand } from '@/types/apiContracts';
import {
  buildExplainableDossier,
  verifyDossierIntegrity,
  computeCanonicalSha256,
  createCanonicalDossierPayload
} from '@/lib/agents/explainableLogger';
import { playActionConfirmedChime, playPlatformHoldChime, playCabEmergencyAlarm } from '@/lib/audioAlerts';

interface LedgerItem {
  id: string;
  blockId: string;
  title: string;
  section: string;
  department: 'TMS' | 'TDMS' | 'SMMS' | 'JOINT';
  timestamp: string;
  status: 'SANCTIONED & LOCKED' | 'COMPLETED & VERIFIED' | 'ARCHIVED';
  downtimeSaved: string;
  demands: string[];
  tsrSpeed: number;
  officer: string;
  ruleClause: string;
}

const EXTENDED_LEDGER_RECORDS: LedgerItem[] = [
  {
    id: '1',
    blockId: 'JB-2026-0926-01',
    title: 'Dadar TC-03 Joint Track + OHE Shadow Block',
    section: 'TC-03 UP Slow Line (KM 9.2 - 15.5)',
    department: 'JOINT',
    timestamp: '2026-09-26 01:30 IST',
    status: 'SANCTIONED & LOCKED',
    downtimeSaved: 'Saved 85 mins (38.4%)',
    demands: ['DEM-TMS-01', 'DEM-TDMS-02', 'DEM-SMMS-03'],
    tsrSpeed: 30,
    officer: 'CTRL-MUM-402 (Sr. DOM / Section Controller)',
    ruleClause: 'IRPWM Ch 5 Para 502 & ACTM Vol II Para 204'
  },
  {
    id: '2',
    blockId: 'JB-2026-0926-02',
    title: 'Kurla-Thane Joint Fast Corridor Block',
    section: 'TC-04/05 DOWN Fast Line (KM 15.5 - 33.2)',
    department: 'JOINT',
    timestamp: '2026-09-26 02:15 IST',
    status: 'SANCTIONED & LOCKED',
    downtimeSaved: 'Saved 60 mins (28.5%)',
    demands: ['DEM-TMS-04', 'DEM-TDMS-05'],
    tsrSpeed: 30,
    officer: 'CTRL-MUM-402 (Sr. DOM / Section Controller)',
    ruleClause: 'IRPWM Ch 5 Para 508 & SEM Part II'
  },
  {
    id: '3',
    blockId: 'BLK-SIG-0925-88',
    title: 'Kurla TC-04 Interlocking Relay Overhaul',
    section: 'TC-04 Signaling Relay Room & Point SW-04',
    department: 'SMMS',
    timestamp: '2026-09-25 23:14 IST',
    status: 'COMPLETED & VERIFIED',
    downtimeSaved: 'Duration: 60 mins • Form S&T/T-351',
    demands: ['DEM-SMMS-03'],
    tsrSpeed: 30,
    officer: 'SM-KURLA-09 (Station Master)',
    ruleClause: 'SEM Part II Para 11.4 Signal Clamping'
  },
  {
    id: '4',
    blockId: 'BLK-TRD-0925-12',
    title: 'Thane-Kalyan 25kV Catenary Routine Inspection',
    section: 'TC-05/06 25kV OHE Catenary',
    department: 'TDMS',
    timestamp: '2026-09-25 03:00 IST',
    status: 'ARCHIVED',
    downtimeSaved: 'Duration: 120 mins • Clean Window',
    demands: ['DEM-TDMS-02'],
    tsrSpeed: 30,
    officer: 'TRD-ADE-THANE-04 (Assistant Div. Electrical)',
    ruleClause: 'ACTM Vol II Para 201 Earthing Protocol'
  },
  {
    id: '5',
    blockId: 'BLK-CIV-0924-44',
    title: 'Byculla UP Fast Deep Track Screening (BCM)',
    section: 'TC-02 UP Fast Line (KM 4.8 - 9.2)',
    department: 'TMS',
    timestamp: '2026-09-24 01:00 IST',
    status: 'COMPLETED & VERIFIED',
    downtimeSaved: 'Duration: 180 mins • Ballast Cleared',
    demands: ['DEM-TMS-01'],
    tsrSpeed: 30,
    officer: 'DEN-TRACK-CSMT-02 (Divisional Engineer)',
    ruleClause: 'IRPWM Ch 3 Para 312 Track Geometry'
  },
  {
    id: '6',
    blockId: 'JB-2026-0924-03',
    title: 'Matunga Car Shed Point & OHE Integration',
    section: 'TC-02/03 Siding Yard Junction',
    department: 'JOINT',
    timestamp: '2026-09-24 02:30 IST',
    status: 'ARCHIVED',
    downtimeSaved: 'Saved 45 mins (22.0%)',
    demands: ['DEM-TMS-04', 'DEM-SMMS-03'],
    tsrSpeed: 30,
    officer: 'CTRL-MUM-402 (Sr. DOM / Section Controller)',
    ruleClause: 'G&SR Chapter XV Rule 15.06'
  }
];

export const AuditorWorkspace: React.FC = () => {
  // Navigation & Filter States
  const [selectedRecordId, setSelectedRecordId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<'ALL' | 'TMS' | 'TDMS' | 'SMMS' | 'JOINT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SANCTIONED & LOCKED' | 'COMPLETED & VERIFIED' | 'ARCHIVED'>('ALL');
  const [activeDossierTab, setActiveDossierTab] = useState<'TIMELINE' | 'FORM14B' | 'PAYLOAD'>('TIMELINE');
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  // Verification & Tamper Simulation States
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [tamperedTsrSpeed, setTamperedTsrSpeed] = useState<number>(60); // Tampered speed > 30 km/h
  const [forgedOfficer, setForgedOfficer] = useState<string>('UNAUTHORIZED_USER_99');
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    type: 'SUCCESS' | 'ERROR';
    message: string;
    expectedHash?: string;
    actualHash?: string;
  } | null>(null);

  // Auditor Attestation State
  const [attestation, setAttestation] = useState<{
    auditorId: string;
    auditorName: string;
    signedAt: string;
    status: 'ATTESTED_COMPLIANT' | 'FLAGGED_FOR_INQUIRY';
    notes: string;
  } | null>(null);

  const selectedRecord =
    EXTENDED_LEDGER_RECORDS.find((r) => r.id === selectedRecordId) || EXTENDED_LEDGER_RECORDS[0];

  // Build authentic baseline dossier
  const authenticDossier: ExplainableDecisionDossier = buildExplainableDossier({
    blockId: selectedRecord.blockId,
    sanctionedBy: selectedRecord.officer,
    bundledDemandIds: selectedRecord.demands,
    kavachTsrSpeedKmh: selectedRecord.tsrSpeed
  });

  // Current active dossier with tamper simulation evaluation
  const effectivePayloadString = isTampered
    ? createCanonicalDossierPayload(
        selectedRecord.blockId,
        forgedOfficer,
        authenticDossier.timestamp,
        selectedRecord.demands,
        tamperedTsrSpeed,
        'RDSO-v4.0'
      )
    : authenticDossier.canonicalPayloadString;

  const effectiveDossier: ExplainableDecisionDossier = {
    ...authenticDossier,
    sanctionedBy: isTampered ? forgedOfficer : authenticDossier.sanctionedBy,
    canonicalPayloadString: effectivePayloadString,
    statutoryForms: {
      ...authenticDossier.statutoryForms,
      formT409CautionOrderNumber: `T409-TSR-${isTampered ? tamperedTsrSpeed : selectedRecord.tsrSpeed}-TC03`
    }
  };

  // Filter Ledger Records
  const filteredRecords = EXTENDED_LEDGER_RECORDS.filter((rec) => {
    const matchesSearch =
      rec.blockId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.officer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || rec.department === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Cryptographic Seal Verification
  const handleVerifySeal = () => {
    const result = verifyDossierIntegrity(effectiveDossier);
    if (result.isValid) {
      playActionConfirmedChime();
      setVerificationFeedback({
        type: 'SUCCESS',
        message: '✓ Cryptographic Seal Validated: 100% SHA-256 tamper-free integrity verified against canonical RFC 8785 delimiter string.',
        expectedHash: result.expectedHash,
        actualHash: result.actualHash
      });
    } else {
      playCabEmergencyAlarm();
      setVerificationFeedback({
        type: 'ERROR',
        message: '⚠️ CRITICAL TAMPER DETECTED: Payload does not match canonical RFC 8785 digital signature! Hash mismatch encountered.',
        expectedHash: result.expectedHash,
        actualHash: result.actualHash
      });
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(effectiveDossier.sha256Signature);
    setCopiedToken(true);
    playPlatformHoldChime();
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleAttestDossier = (status: 'ATTESTED_COMPLIANT' | 'FLAGGED_FOR_INQUIRY') => {
    playActionConfirmedChime();
    const timestampNow = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
    setAttestation({
      auditorId: 'CRS-W-MUM/2026-09',
      auditorName: 'Shri V. K. Sharma (Chief Commissioner of Railway Safety)',
      signedAt: timestampNow,
      status,
      notes:
        status === 'ATTESTED_COMPLIANT'
          ? `Audited under Section 27 of Railways Act 1989. S&T/T-351 lockout and Kavach TSR (${selectedRecord.tsrSpeed} km/h) validated.`
          : 'Flagged for procedural review: Inconsistency in speed restriction or block possession overlap.'
    });
  };

  const handleExportForm14B = () => {
    playActionConfirmedChime();
    const certificatePayload = {
      formHeader: 'GOVERNMENT OF INDIA — MINISTRY OF RAILWAYS',
      directorate: 'Research Designs and Standards Organisation (RDSO) Safety Directorate',
      statutoryAct: 'Section 27 of Railways Act 1989 & Indian Railways General Rules Chapter XV',
      formTitle: 'RDSO FORM 14B — STATUTORY BLOCK SAFETY & INTERLOCKING COMPLIANCE CERTIFICATE',
      dossierId: effectiveDossier.dossierId,
      blockId: effectiveDossier.blockId,
      sanctionedBy: effectiveDossier.sanctionedBy,
      timestamp: effectiveDossier.timestamp,
      trackSection: selectedRecord.section,
      ruleClause: selectedRecord.ruleClause,
      sha256CryptographicSeal: effectiveDossier.sha256Signature,
      canonicalRFC8785Delimiter: effectiveDossier.canonicalPayloadString,
      isTampered: isTampered,
      statutoryPermits: {
        formST351Lockout: effectiveDossier.statutoryForms.formST351LockoutNumber,
        formT409CautionOrder: effectiveDossier.statutoryForms.formT409CautionOrderNumber,
        kavachTsrSpeedLimit: `${isTampered ? tamperedTsrSpeed : selectedRecord.tsrSpeed} km/h`
      },
      bundledDemands: selectedRecord.demands,
      chronologicalAuditTimeline: effectiveDossier.chronologicalTimeline,
      auditorAttestation: attestation || {
        status: 'PENDING_FINAL_AUDITOR_SIGNOFF',
        note: 'Requires CRS token verification before physical track energization'
      }
    };

    const blob = new Blob([JSON.stringify(certificatePayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RDSO_Form14B_Certificate_${effectiveDossier.blockId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Screen 4 Regulatory Terminal Header Banner */}
      <div
        className="bg-white border border-[#D0DFEE] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ borderRadius: '16px' }}
      >
        <div className="flex items-center space-x-3.5">
          <div
            className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0"
            style={{ borderRadius: '8px' }}
          >
            ⚖️
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-[#0F172A] tracking-tight">
                Auditor Workspace &amp; Regulatory Terminal (Screen 4)
              </h2>
              <span
                className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
                style={{ borderRadius: '4px' }}
              >
                CRS &amp; RDSO COMPLIANT
              </span>
              <span
                className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200"
                style={{ borderRadius: '4px' }}
              >
                RFC 8785 IMMUTABLE LEDGER
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Commissioner of Railway Safety (CRS) Statutory Decision Log, Cryptographic Seal &amp; Form 14B Certification
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div
            className="px-3 py-1.5 bg-[#E6F0FA] text-[#2B7FFF] border border-[#D0DFEE] text-xs font-mono font-bold flex items-center space-x-2"
            style={{ borderRadius: '4px' }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>👤 Role: Safety Auditor (CRS-MUM)</span>
          </div>
        </div>
      </div>

      {/* Verification Feedback Banner */}
      {verificationFeedback && (
        <div
          className={`p-4 text-xs font-mono border transition-all space-y-2 shadow-xs ${
            verificationFeedback.type === 'SUCCESS'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-red-50 text-red-900 border-red-300'
          }`}
          style={{ borderRadius: '8px' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm flex items-center space-x-1.5">
              <span>{verificationFeedback.type === 'SUCCESS' ? '🛡️' : '🚨'}</span>
              <span>{verificationFeedback.message}</span>
            </span>
            <button
              onClick={() => setVerificationFeedback(null)}
              className="text-slate-500 hover:text-slate-800 text-xs font-bold"
            >
              ✕ DISMISS
            </button>
          </div>
          {verificationFeedback.expectedHash && (
            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white/80 p-2 rounded border border-slate-300">
                <span className="text-slate-500 block font-semibold">Expected Payload Hash (Calculated):</span>
                <span className="break-all font-mono font-bold text-slate-800">
                  {verificationFeedback.expectedHash}
                </span>
              </div>
              <div className="bg-white/80 p-2 rounded border border-slate-300">
                <span className="text-slate-500 block font-semibold">Digital Signature on Seal:</span>
                <span className="break-all font-mono font-bold text-slate-800">
                  {verificationFeedback.actualHash}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main 5-col / 7-col Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (5 Cols): Interactive Decision Ledger & Search Filter */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            title="Immutable Decision Ledger"
            action={
              <span className="px-2 py-0.5 bg-[#E6F0FA] text-[#2B7FFF] text-[10px] font-mono font-bold border border-[#D0DFEE] rounded">
                {filteredRecords.length} of {EXTENDED_LEDGER_RECORDS.length} Records
              </span>
            }
          >
            <div className="space-y-3.5">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Block ID, station, officer, or section..."
                  className="w-full px-3 py-2 pl-8 text-xs font-mono bg-[#F8FAFC] border border-[#D0DFEE] rounded focus:outline-none focus:border-[#2B7FFF] text-[#0F172A]"
                />
                <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Department & Status Quick Filter Chips */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5 items-center text-[10px] font-mono">
                  <span className="text-slate-400 font-bold mr-1">Dept:</span>
                  {(['ALL', 'JOINT', 'TMS', 'TDMS', 'SMMS'] as const).map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setDeptFilter(dept)}
                      className={`px-2 py-0.5 transition-all ${
                        deptFilter === dept
                          ? 'bg-[#2B7FFF] text-white font-bold'
                          : 'bg-[#F0F6FC] text-slate-600 hover:bg-[#E2EEFA]'
                      }`}
                      style={{ borderRadius: '4px' }}
                    >
                      {dept}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 items-center text-[10px] font-mono">
                  <span className="text-slate-400 font-bold mr-1">Status:</span>
                  {(['ALL', 'SANCTIONED & LOCKED', 'COMPLETED & VERIFIED', 'ARCHIVED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2 py-0.5 transition-all truncate max-w-[130px] ${
                        statusFilter === st
                          ? 'bg-slate-800 text-white font-bold'
                          : 'bg-[#F0F6FC] text-slate-600 hover:bg-[#E2EEFA]'
                      }`}
                      style={{ borderRadius: '4px' }}
                    >
                      {st === 'SANCTIONED & LOCKED'
                        ? '🔒 SANCTIONED'
                        : st === 'COMPLETED & VERIFIED'
                        ? '✓ VERIFIED'
                        : st === 'ARCHIVED'
                        ? '📁 ARCHIVE'
                        : 'ALL'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ledger Item Records */}
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {filteredRecords.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-mono border border-dashed border-[#D0DFEE] rounded">
                    No decision records match your search filter.
                  </div>
                ) : (
                  filteredRecords.map((record) => {
                    const isSelected = selectedRecordId === record.id;
                    const deptColor =
                      record.department === 'JOINT'
                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : record.department === 'TMS'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : record.department === 'TDMS'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                    return (
                      <div
                        key={record.id}
                        onClick={() => {
                          setSelectedRecordId(record.id);
                          setVerificationFeedback(null);
                        }}
                        className={`p-3.5 border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#2B7FFF] bg-blue-50/50 shadow-xs ring-1 ring-[#2B7FFF]'
                            : 'border-[#D0DFEE] bg-white hover:border-[#2B7FFF]'
                        }`}
                        style={{ borderRadius: '8px' }}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-[#2B7FFF]">#{record.blockId}</span>
                            <span className={`px-1.5 py-0.2 text-[9px] font-bold border rounded ${deptColor}`}>
                              {record.department}
                            </span>
                          </div>
                          <span className="text-slate-400">{record.timestamp}</span>
                        </div>

                        <h3 className="text-xs font-bold text-[#0F172A] leading-snug">{record.title}</h3>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{record.section}</p>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] font-mono">
                          <span className="text-emerald-700 font-bold">{record.downtimeSaved}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              record.status.includes('SANCTIONED')
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : record.status.includes('COMPLETED')
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {record.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Cryptographic Ledger Footer */}
              <div className="pt-3 border-t border-[#D0DFEE] flex items-center justify-between text-xs text-slate-500 font-mono">
                <span className="flex items-center space-x-1">
                  <span>Engine:</span>
                  <strong className="text-[#0F172A]">SHA-256 (RFC 8785)</strong>
                </span>
                <button
                  onClick={handleVerifySeal}
                  className="text-[#2B7FFF] font-bold hover:underline flex items-center space-x-1"
                >
                  <span>🛡️ Verify Selected Hash →</span>
                </button>
              </div>
            </div>
          </Card>

          {/* Tamper Simulation & Security Testing Control Box */}
          <div
            className="p-4 bg-slate-900 text-white border border-slate-800 shadow-xs space-y-3 font-mono"
            style={{ borderRadius: '12px' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <span>⚡</span>
                <span>Auditor Penetration &amp; Tamper Test</span>
              </span>
              <span
                className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                  isTampered ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {isTampered ? 'TAMPER ACTIVE' : 'AUTHENTIC'}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Toggle simulated payload tampering to verify the RFC 8785 SHA-256 cryptographic check catches modified speed restrictions or forged operator credentials.
            </p>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={isTampered}
                  onChange={(e) => {
                    setIsTampered(e.target.checked);
                    setVerificationFeedback(null);
                  }}
                  className="w-4 h-4 text-red-600 bg-slate-800 border-slate-700 rounded focus:ring-0"
                />
                <span className={isTampered ? 'text-red-400 font-bold' : 'text-slate-300'}>
                  Simulate Unauthorized Payload Tamper
                </span>
              </label>

              {isTampered && (
                <button
                  onClick={() => setIsTampered(false)}
                  className="text-[10px] text-slate-400 hover:text-white underline"
                >
                  Reset
                </button>
              )}
            </div>

            {isTampered && (
              <div className="p-2.5 bg-red-950/60 border border-red-800/80 rounded text-[11px] space-y-2 text-red-200">
                <div className="flex items-center justify-between">
                  <span>Forged TSR Speed Clamp:</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setTamperedTsrSpeed(45)}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        tamperedTsrSpeed === 45 ? 'bg-red-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      45k
                    </button>
                    <button
                      onClick={() => setTamperedTsrSpeed(60)}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        tamperedTsrSpeed === 60 ? 'bg-red-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      60k (UNSAFE)
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Forged Operator:</span>
                  <span className="font-bold text-red-300">USER_ANONYMOUS_FORGER</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right (7 Cols): Explainable Decision Dossier & Form 14B Terminal */}
        <div className="lg:col-span-7 space-y-4">
          <Card
            title="Explainable AI Decision Dossier"
            action={
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold rounded">
                  RDSO FORM 14B
                </span>
                <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                  Officer: <strong>{selectedRecord.officer.split(' ')[0]}</strong>
                </span>
              </div>
            }
          >
            <div className="space-y-4">
              {/* Cryptographic SHA-256 Seal Banner */}
              <div
                className={`p-4 text-white border shadow-inner font-mono text-xs space-y-2.5 transition-all ${
                  isTampered
                    ? 'bg-red-950 border-red-800'
                    : 'bg-slate-900 border-slate-800'
                }`}
                style={{ borderRadius: '12px' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isTampered ? 'bg-red-400 animate-ping' : 'bg-emerald-400 animate-pulse'
                      }`}
                    />
                    <span className={isTampered ? 'text-red-400' : 'text-emerald-400'}>
                      {isTampered ? '⚠️ TAMPERED SIGNATURE DETECTED' : 'SHA-256 Cryptographic Audit Seal'}
                    </span>
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      isTampered
                        ? 'bg-red-800 text-white'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {isTampered ? 'SIGNATURE MISMATCH' : 'VERIFIED TAMPER-FREE'}
                  </span>
                </div>

                <div className="bg-black/50 p-2.5 border border-slate-800 rounded">
                  <div className="text-[10px] text-slate-400 mb-0.5">SHA-256 Audit Seal Signature:</div>
                  <div
                    className={`font-bold break-all text-xs ${
                      isTampered ? 'text-red-400 line-through' : 'text-emerald-400'
                    }`}
                  >
                    {effectiveDossier.sha256Signature}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between text-[11px] text-slate-300 gap-1 pt-1 border-t border-slate-800">
                  <span>Canonical Block: <strong className="text-white">#{effectiveDossier.blockId}</strong></span>
                  <span>Section Officer: <strong className="text-white">{effectiveDossier.sanctionedBy}</strong></span>
                </div>
              </div>

              {/* 3-Tab View Switcher (Pipeline, Form 14B Certificate, Raw JSON Payload) */}
              <div className="flex border-b border-[#D0DFEE] text-xs font-mono font-bold">
                <button
                  onClick={() => setActiveDossierTab('TIMELINE')}
                  className={`px-3 py-2 border-b-2 transition-all flex items-center space-x-1.5 ${
                    activeDossierTab === 'TIMELINE'
                      ? 'border-[#2B7FFF] text-[#2B7FFF] bg-blue-50/40'
                      : 'border-transparent text-slate-600 hover:text-[#2B7FFF]'
                  }`}
                >
                  <span>1.</span>
                  <span>4-Step Reasoning Pipeline</span>
                </button>
                <button
                  onClick={() => setActiveDossierTab('FORM14B')}
                  className={`px-3 py-2 border-b-2 transition-all flex items-center space-x-1.5 ${
                    activeDossierTab === 'FORM14B'
                      ? 'border-[#2B7FFF] text-[#2B7FFF] bg-blue-50/40'
                      : 'border-transparent text-slate-600 hover:text-[#2B7FFF]'
                  }`}
                >
                  <span>2.</span>
                  <span>RDSO Form 14B Certificate</span>
                </button>
                <button
                  onClick={() => setActiveDossierTab('PAYLOAD')}
                  className={`px-3 py-2 border-b-2 transition-all flex items-center space-x-1.5 ${
                    activeDossierTab === 'PAYLOAD'
                      ? 'border-[#2B7FFF] text-[#2B7FFF] bg-blue-50/40'
                      : 'border-transparent text-slate-600 hover:text-[#2B7FFF]'
                  }`}
                >
                  <span>3.</span>
                  <span>RFC 8785 Raw Payload</span>
                </button>
              </div>

              {/* Tab 1: 4-Step Reasoning Pipeline */}
              {activeDossierTab === 'TIMELINE' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                    <span>Click any step to inspect telemetry details &amp; statutory rules:</span>
                    <span>4 Verification Gates</span>
                  </div>

                  <div className="space-y-2.5">
                    {effectiveDossier.chronologicalTimeline.map((step) => {
                      const isExpanded = expandedStep === step.stepNumber;
                      return (
                        <div
                          key={step.stepNumber}
                          onClick={() => setExpandedStep(isExpanded ? null : step.stepNumber)}
                          className={`border transition-all cursor-pointer ${
                            isExpanded
                              ? 'bg-[#EBF3FC] border-[#2B7FFF] shadow-xs'
                              : 'bg-[#F0F6FC] border-[#D0DFEE] hover:bg-[#EAF2FB]'
                          }`}
                          style={{ borderRadius: '8px' }}
                        >
                          <div className="flex items-start space-x-3 p-3">
                            <div
                              className="w-7 h-7 bg-[#2B7FFF] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs"
                              style={{ borderRadius: '4px' }}
                            >
                              {step.stepNumber}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <strong className="text-xs text-[#0F172A] truncate">{step.title}</strong>
                                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                  {step.timestamp.split('T')[1]?.replace('Z', ' IST') || step.timestamp}
                                </span>
                              </div>
                              <p className="text-slate-600 font-mono text-[11px] mt-0.5 leading-relaxed">
                                {step.description}
                              </p>
                            </div>
                            <span className="text-slate-400 text-xs font-bold shrink-0">
                              {isExpanded ? '▲' : '▼'}
                            </span>
                          </div>

                          {/* Expanded Step Deep Dive */}
                          {isExpanded && (
                            <div className="px-3.5 pb-3 pt-1 border-t border-[#D0DFEE]/60 text-[11px] font-mono space-y-1.5 bg-white/70">
                              <div className="flex items-center justify-between text-slate-600">
                                <span>Agent Subsystem:</span>
                                <strong className="text-[#2B7FFF]">{step.agentName}</strong>
                              </div>
                              <div className="flex items-center justify-between text-slate-600">
                                <span>Regulatory Rule Base:</span>
                                <strong className="text-slate-800">{selectedRecord.ruleClause}</strong>
                              </div>
                              <div className="flex items-center justify-between text-slate-600">
                                <span>Execution Stage:</span>
                                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                                  {step.stageName} • PASS
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: RDSO Form 14B Statutory Certificate View */}
              {activeDossierTab === 'FORM14B' && (
                <div
                  className="p-5 bg-[#FAFCFF] border-2 border-[#D0DFEE] shadow-xs space-y-4 font-mono text-xs"
                  style={{ borderRadius: '12px' }}
                >
                  {/* Ministry Header */}
                  <div className="text-center pb-3 border-b border-slate-200 space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      GOVERNMENT OF INDIA • MINISTRY OF RAILWAYS
                    </div>
                    <div className="text-xs font-black text-[#0F172A]">
                      RESEARCH DESIGNS AND STANDARDS ORGANISATION (RDSO)
                    </div>
                    <div className="text-[11px] font-bold text-[#2B7FFF]">
                      FORM 14B: STATUTORY BLOCK SAFETY &amp; INTERLOCKING COMPLIANCE CERTIFICATE
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Pursuant to Section 27 of Railways Act 1989 &amp; General Rules Chapter XV
                    </div>
                  </div>

                  {/* Certificate Key Parameters Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] bg-white p-3 border border-[#D0DFEE] rounded">
                    <div>
                      <span className="text-slate-400 block text-[10px]">POSSESSION ID</span>
                      <strong className="text-[#0F172A]">#{effectiveDossier.blockId}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">STATUTORY PERMIT</span>
                      <strong className="text-emerald-700">{effectiveDossier.statutoryForms.formST351LockoutNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">CAUTION ORDER</span>
                      <strong className="text-amber-700">{effectiveDossier.statutoryForms.formT409CautionOrderNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">TRACK SECTION</span>
                      <strong className="text-slate-800">{selectedRecord.section.split(' ')[0]}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">TSR SPEED RESTRICTION</span>
                      <strong className={isTampered ? 'text-red-600 font-bold' : 'text-emerald-700'}>
                        {isTampered ? `${tamperedTsrSpeed} km/h (FORGED)` : `${selectedRecord.tsrSpeed} km/h`}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">SANCTIONING OFFICER</span>
                      <strong className="text-slate-800">{effectiveDossier.sanctionedBy.split(' ')[0]}</strong>
                    </div>
                  </div>

                  {/* Bundled Demands & Savings */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-[#0F172A] text-[11px]">Bundled Maintenance Requisitions:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRecord.demands.map((dem) => (
                        <span
                          key={dem}
                          className="px-2 py-0.5 bg-blue-50 text-[#2B7FFF] border border-blue-200 rounded text-[10px] font-bold"
                        >
                          {dem}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">
                        {selectedRecord.downtimeSaved}
                      </span>
                    </div>
                  </div>

                  {/* Auditor Attestation Section */}
                  <div className="p-3 bg-white border border-[#D0DFEE] rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-[#0F172A] flex items-center space-x-1.5">
                        <span>✍️</span>
                        <span>Safety Auditor Attestation (CRS):</span>
                      </span>
                      {attestation ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            attestation.status === 'ATTESTED_COMPLIANT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {attestation.status}
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          AWAITING SIGN-OFF
                        </span>
                      )}
                    </div>

                    {attestation ? (
                      <div className="text-[11px] text-slate-600 space-y-1">
                        <div>Attesting Officer: <strong className="text-[#0F172A]">{attestation.auditorName}</strong></div>
                        <div>Digital Seal Stamp: <span className="font-mono text-slate-500">{attestation.signedAt}</span></div>
                        <div className="italic text-slate-700">"{attestation.notes}"</div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => handleAttestDossier('ATTESTED_COMPLIANT')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded shadow-xs"
                        >
                          ✓ Sign &amp; Attest (Compliant)
                        </button>
                        <button
                          onClick={() => handleAttestDossier('FLAGGED_FOR_INQUIRY')}
                          className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[11px] font-bold rounded"
                        >
                          ⚠️ Flag for Technical Inquiry
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Canonical RFC 8785 Raw Payload */}
              {activeDossierTab === 'PAYLOAD' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="text-slate-500 text-[11px]">
                    Canonical Delimiter Protocol: <code className="text-[#0F172A] bg-[#F0F6FC] px-1 py-0.5 rounded">blockId|sanctionedBy|timestamp|sortedDemands|tsrSpeed|policyVersion</code>
                  </div>

                  <div className="p-3 bg-slate-900 text-emerald-400 rounded border border-slate-800 text-[11px] break-all leading-relaxed">
                    {effectiveDossier.canonicalPayloadString}
                  </div>

                  <div className="p-3 bg-[#F8FAFC] border border-[#D0DFEE] rounded text-[11px] text-slate-700 space-y-1">
                    <div className="font-bold text-[#0F172A]">Payload Metrics:</div>
                    <div>String Character Length: <strong>{effectiveDossier.canonicalPayloadString.length} bytes</strong></div>
                    <div>Digest Length: <strong>256-bit (64 hex characters)</strong></div>
                    <div>Canonical Hashing Policy: <strong>RFC 8785 / RDSO v4.0</strong></div>
                  </div>
                </div>
              )}

              {/* Auditor Action Buttons */}
              <div className="pt-3 border-t border-[#D0DFEE] flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleVerifySeal}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-bold font-mono border border-slate-300 transition-all shadow-xs flex items-center space-x-1.5"
                  style={{ borderRadius: '4px' }}
                >
                  <span>🔒</span>
                  <span>[VERIFY SHA-256 HASH]</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyToken}
                    className="px-3 py-2 bg-[#E6F0FA] hover:bg-[#D0DFEE] text-[#2B7FFF] text-xs font-bold font-mono border border-[#D0DFEE] transition-all"
                    style={{ borderRadius: '4px' }}
                  >
                    {copiedToken ? '✓ COPIED' : '📋 COPY TOKEN'}
                  </button>
                  <button
                    onClick={handleExportForm14B}
                    className="px-4 py-2 bg-[#2B7FFF] hover:bg-blue-600 text-white text-xs font-bold font-mono transition-all shadow-xs flex items-center space-x-1.5"
                    style={{ borderRadius: '4px' }}
                  >
                    <span>📄</span>
                    <span>[EXPORT FORM 14B (JSON)]</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

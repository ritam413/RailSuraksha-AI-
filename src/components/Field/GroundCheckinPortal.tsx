'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface GroundCheckinRecord {
  checkinId: string;
  timestamp: string;
  employeeId: string;
  workerName: string;
  section: string;
  trackCircuitId: string;
  gpsCoords: { lat: number; lng: number };
  gpsAccuracyMeters: number;
  isWithinGeofence: boolean;
  yoloHeadcount: number;
  ppeComplianceScore: number;
  oheEarthingDistanceMeters: number;
  oheClampResistanceOhms: number;
  sha256VerificationHash: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export const GroundCheckinPortal: React.FC = () => {
  const { user } = useAuth();
  const [selectedCircuit, setSelectedCircuit] = useState<string>('TC-03');
  const [selectedSection, setSelectedSection] = useState<string>('Dadar - Kurla (KM 14.2)');
  const [isVerifyingGps, setIsVerifyingGps] = useState(false);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState<GroundCheckinRecord | null>(null);

  // Form Field States
  const [workerCount, setWorkerCount] = useState<number>(6);
  const [helmetsDetected, setHelmetsDetected] = useState<number>(6);
  const [vestsDetected, setVestsDetected] = useState<number>(6);
  const [earthingDistance, setEarthingDistance] = useState<number>(12.4);
  const [clampResistance, setClampResistance] = useState<number>(0.04);
  const [gpsDistance, setGpsDistance] = useState<number>(18.5); // meters from track center

  const isGpsValid = gpsDistance <= 100;
  const isPpeValid = helmetsDetected >= workerCount && vestsDetected >= workerCount;
  const isOheSafe = earthingDistance >= 10.0 && clampResistance <= 0.5;

  const handleSimulateInspection = () => {
    setIsCapturingPhoto(true);
    setTimeout(() => {
      setWorkerCount(6);
      setHelmetsDetected(6);
      setVestsDetected(6);
      setIsCapturingPhoto(false);
    }, 800);
  };

  const handleRefreshGps = () => {
    setIsVerifyingGps(true);
    setTimeout(() => {
      setGpsDistance(14.2);
      setIsVerifyingGps(false);
    }, 600);
  };

  const handleSubmitCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const record: GroundCheckinRecord = {
        checkinId: `CHK-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        employeeId: user?.employeeId || 'SSE-PW-BYC-104',
        workerName: user?.fullName || 'Rameshwar Patil, SSE P-Way',
        section: selectedSection,
        trackCircuitId: selectedCircuit,
        gpsCoords: { lat: 19.0178, lng: 72.8478 },
        gpsAccuracyMeters: gpsDistance,
        isWithinGeofence: isGpsValid,
        yoloHeadcount: workerCount,
        ppeComplianceScore: 100,
        oheEarthingDistanceMeters: earthingDistance,
        oheClampResistanceOhms: clampResistance,
        sha256VerificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        status: isGpsValid && isPpeValid && isOheSafe ? 'VERIFIED' : 'REJECTED'
      };
      setCheckinSuccess(record);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header Banner */}
      <div className="bg-white border border-[#D0DFEE] p-5 shadow-xs flex flex-wrap items-center justify-between gap-4" style={{ borderRadius: '16px' }}>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 animate-pulse rounded-full" />
            <span className="text-[11px] font-mono font-bold bg-[#E6F0FA] text-[#2B7FFF] px-2 py-0.5 border border-[#D0DFEE]" style={{ borderRadius: '4px' }}>
              Screen 5 • Ground Execution Portal
            </span>
            <span className="text-xs font-mono text-slate-500">Anti-Ghost Block Verification Protocol</span>
          </div>
          <h1 className="text-xl font-bold text-[#0F172A]">
            Field Crew Joint Block Check-In &amp; Safety Attestation
          </h1>
          <p className="text-xs text-slate-600">
            Mandatory multi-modal telemetry validation (GPS Geofence + YOLOv11 PPE + 25kV OHE Discharge Grounding) prior to track possession.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-[#F0F6FC] p-3 border border-[#D0DFEE]" style={{ borderRadius: '8px' }}>
          <div className="w-10 h-10 bg-[#2B7FFF] text-white flex items-center justify-center font-black text-sm" style={{ borderRadius: '4px' }}>
            SSE
          </div>
          <div className="text-xs">
            <div className="font-bold text-slate-900">{user?.fullName || 'Rameshwar Patil'}</div>
            <div className="text-slate-500 font-mono text-[11px]">{user?.employeeId || 'SSE-PW-BYC-104'} • {user?.stationOrSection || 'Byculla Section'}</div>
          </div>
        </div>
      </div>

      {checkinSuccess ? (
        /* Success Cryptographic Stamp */
        <div className="bg-white border border-emerald-300 p-6 shadow-sm space-y-5" style={{ borderRadius: '16px' }}>
          <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-2xl" style={{ borderRadius: '8px' }}>
                ✓
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5" style={{ borderRadius: '4px' }}>
                  POSSESSION PERMIT GRANTED
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  On-Site Execution Attestation #{checkinSuccess.checkinId}
                </h2>
              </div>
            </div>
            <button
              onClick={() => setCheckinSuccess(null)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              style={{ borderRadius: '4px' }}
            >
              New Check-In
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-[#F0F6FC] border border-[#D0DFEE]" style={{ borderRadius: '8px' }}>
              <div className="text-slate-500 font-mono text-[10px]">SECTION &amp; CIRCUIT</div>
              <div className="font-bold text-slate-900 mt-1">{checkinSuccess.section}</div>
              <div className="text-[#2B7FFF] font-mono font-bold">{checkinSuccess.trackCircuitId}</div>
            </div>
            <div className="p-3 bg-[#F0F6FC] border border-[#D0DFEE]" style={{ borderRadius: '8px' }}>
              <div className="text-slate-500 font-mono text-[10px]">GEOFENCE &amp; CREW</div>
              <div className="font-bold text-emerald-600 mt-1">✓ Geofence Verified ({checkinSuccess.gpsAccuracyMeters}m radius)</div>
              <div className="text-slate-700 font-mono">{checkinSuccess.yoloHeadcount} Workers • 100% PPE Compliance</div>
            </div>
            <div className="p-3 bg-[#F0F6FC] border border-[#D0DFEE]" style={{ borderRadius: '8px' }}>
              <div className="text-slate-500 font-mono text-[10px]">25kV OHE DISCHARGE</div>
              <div className="font-bold text-emerald-600 mt-1">✓ Earthing Rod Active ({checkinSuccess.oheEarthingDistanceMeters}m)</div>
              <div className="text-slate-700 font-mono">Loop Resistance: {checkinSuccess.oheClampResistanceOhms} Ω</div>
            </div>
          </div>

          <div className="p-3 bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto" style={{ borderRadius: '8px' }}>
            <div className="text-slate-400 text-[10px] mb-1">SHA-256 TELEMETRY DIGEST (ANTI-GHOST BLOCK TIMESTAMP)</div>
            <div className="text-emerald-400 break-all">{checkinSuccess.sha256VerificationHash}</div>
          </div>
        </div>
      ) : (
        /* Multi-Modal Telemetry Form */
        <form onSubmit={handleSubmitCheckin} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: GPS Geofence & Track Location */}
          <div className="bg-white border border-[#D0DFEE] p-5 shadow-xs space-y-4" style={{ borderRadius: '16px' }}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <span>📍</span> 1. GPS Geofence Radar
              </h2>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
                isGpsValid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`} style={{ borderRadius: '4px' }}>
                {isGpsValid ? 'INSIDE ±100M GEOFENCE' : 'OUT OF BOUNDS'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Assigned Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full bg-[#F0F6FC] border border-[#D0DFEE] p-2 text-slate-800 text-xs font-semibold focus:outline-hidden focus:border-[#2B7FFF]"
                  style={{ borderRadius: '4px' }}
                >
                  <option value="Dadar - Kurla (KM 14.2)">Dadar - Kurla (KM 14.2)</option>
                  <option value="Byculla - Chinchpokli (KM 4.8)">Byculla - Chinchpokli (KM 4.8)</option>
                  <option value="Kalyan Yard Switch Point 04 (KM 53.6)">Kalyan Yard Switch Point 04 (KM 53.6)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Track Circuit ID</label>
                <select
                  value={selectedCircuit}
                  onChange={(e) => setSelectedCircuit(e.target.value)}
                  className="w-full bg-[#F0F6FC] border border-[#D0DFEE] p-2 text-slate-800 text-xs font-semibold focus:outline-hidden focus:border-[#2B7FFF]"
                  style={{ borderRadius: '4px' }}
                >
                  <option value="TC-03">TC-03 (UP Slow Line - Dadar)</option>
                  <option value="TC-01">TC-01 (UP Fast Line - Matunga)</option>
                  <option value="TC-04">TC-04 (Down Fast Line - Kurla)</option>
                </select>
              </div>

              <div className="p-3 bg-[#F0F6FC] border border-[#D0DFEE] space-y-2 font-mono" style={{ borderRadius: '8px' }}>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Live Field Coordinates:</span>
                  <span className="text-slate-800 font-bold">19.0178° N, 72.8478° E</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Radial Offset:</span>
                  <span className={`font-bold ${isGpsValid ? 'text-emerald-600' : 'text-rose-600'}`}>{gpsDistance} meters</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Target Geofence:</span>
                  <span className="text-slate-700">100.0 meters</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRefreshGps}
                disabled={isVerifyingGps}
                className="w-full py-2 bg-white border border-[#D0DFEE] hover:bg-slate-50 text-slate-700 font-semibold transition-all flex items-center justify-center gap-1.5"
                style={{ borderRadius: '4px' }}
              >
                <span>{isVerifyingGps ? '📡 Calibrating Satellites...' : '📡 Re-Calibrate GPS Geofence'}</span>
              </button>
            </div>
          </div>

          {/* Column 2: YOLOv11 PPE Inspection */}
          <div className="bg-white border border-[#D0DFEE] p-5 shadow-xs space-y-4" style={{ borderRadius: '16px' }}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <span>🦺</span> 2. YOLOv11 PPE Inspection
              </h2>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
                isPpeValid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`} style={{ borderRadius: '4px' }}>
                {isPpeValid ? 'PPE COMPLIANT (100%)' : 'PPE DEFICIENT'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="h-32 bg-slate-900 border border-slate-800 text-slate-300 flex flex-col items-center justify-center relative overflow-hidden" style={{ borderRadius: '8px' }}>
                <div className="text-center space-y-1">
                  <div className="text-xl">📷</div>
                  <div className="text-[11px] font-mono text-emerald-400">YOLOv11 Crew Detection Active</div>
                  <div className="text-[10px] text-slate-400">6/6 Workers Tagged • 0 Incursions</div>
                </div>
                {/* Bounding box mock overlay */}
                <div className="absolute top-4 left-6 border-2 border-emerald-400 text-[8px] font-mono bg-emerald-950/80 text-emerald-300 px-1">
                  Worker #1 [Vest: 99% | Helmet: 98%]
                </div>
                <div className="absolute top-8 right-6 border-2 border-emerald-400 text-[8px] font-mono bg-emerald-950/80 text-emerald-300 px-1">
                  Worker #2 [Vest: 96% | Helmet: 97%]
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2 bg-[#F0F6FC] border border-[#D0DFEE]" style={{ borderRadius: '4px' }}>
                  <div className="text-[10px] text-slate-500">HEADCOUNT</div>
                  <div className="text-sm font-bold text-slate-900">{workerCount}</div>
                </div>
                <div className="p-2 bg-[#F0F6FC] border border-[#D0DFEE]" style={{ borderRadius: '4px' }}>
                  <div className="text-[10px] text-slate-500">HELMETS</div>
                  <div className="text-sm font-bold text-emerald-600">{helmetsDetected}</div>
                </div>
                <div className="p-2 bg-[#F0F6FC] border border-[#D0DFEE]" style={{ borderRadius: '4px' }}>
                  <div className="text-[10px] text-slate-500">VESTS</div>
                  <div className="text-sm font-bold text-emerald-600">{vestsDetected}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSimulateInspection}
                disabled={isCapturingPhoto}
                className="w-full py-2 bg-white border border-[#D0DFEE] hover:bg-slate-50 text-slate-700 font-semibold transition-all flex items-center justify-center gap-1.5"
                style={{ borderRadius: '4px' }}
              >
                <span>{isCapturingPhoto ? '🔍 Running YOLOv11 Inferences...' : '📸 Capture On-Site Verification Photo'}</span>
              </button>
            </div>
          </div>

          {/* Column 3: 25kV OHE Earthing & Submit */}
          <div className="bg-white border border-[#D0DFEE] p-5 shadow-xs space-y-4 flex flex-col justify-between" style={{ borderRadius: '16px' }}>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <span>⚡</span> 3. 25kV OHE Discharge
                </h2>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
                  isOheSafe ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`} style={{ borderRadius: '4px' }}>
                  {isOheSafe ? 'EARTHING ATTESTED' : 'EARTHING INCOMPLETE'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#F0F6FC] border border-[#D0DFEE] space-y-2 font-mono" style={{ borderRadius: '8px' }}>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Earthing Rod Clamp Distance:</span>
                    <span className="text-emerald-600 font-bold">{earthingDistance}m (Safe &gt;10m)</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Discharge Loop Resistance:</span>
                    <span className="text-slate-800 font-bold">{clampResistance} Ω</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">OHE Residual Voltage:</span>
                    <span className="text-emerald-600 font-bold">0.00 kV (Isolated)</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] leading-relaxed" style={{ borderRadius: '6px' }}>
                  <strong>RDSO Safety Rule:</strong> No physical entry into the track envelope is permitted until the 25kV OHE discharge rod is clamped and certified.
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting || !isGpsValid || !isPpeValid || !isOheSafe}
                className="w-full py-2.5 bg-[#2B7FFF] hover:bg-blue-600 disabled:bg-slate-300 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                style={{ borderRadius: '4px' }}
              >
                <span>{isSubmitting ? '🔐 Attesting & Generating SHA-256 Digest...' : '✓ Submit Check-In & Claim Possession'}</span>
              </button>
              <div className="text-[10px] text-center text-slate-400 font-mono">
                Cryptographic Timestamp • Anti-Ghost Block Audit Trail
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '../Common/Card';
import { WeatherCondition, DepartmentCode } from '@/types/apiContracts';
import { calculateKavachEbd, getWeatherFrictionParams } from '@/lib/agents/kavachBrakingAgent';
import { calculateEbd, executeBrakeCommand } from '@/lib/apiClient';
import { getAudioContext, playCabEmergencyAlarm, playActionConfirmedChime, playPneumaticBrakeSound } from '@/lib/audioAlerts';

const RailFlawHologram3D = dynamic(() => import('@/components/Three/RailFlawHologram3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-[#090D16] border border-[#D0DFEE] rounded-[16px] flex items-center justify-center text-purple-400 font-mono text-xs animate-pulse">
      Loading 3D USFD Rail Hologram Engine...
    </div>
  )
});

const KavachCabRun3D = dynamic(() => import('@/components/Three/KavachCabRun3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-[#090D16] border border-[#D0DFEE] rounded-[16px] flex items-center justify-center text-cyan-400 font-mono text-xs animate-pulse">
      Loading 3D Kavach TCAS Cab Run Engine...
    </div>
  )
});

export interface MaintenanceDefectScenario {
  id: string;
  name: string;
  department: DepartmentCode;
  departmentLabel: string;
  trackSection: string;
  chainage: string;
  defectClass: string;
  defectStandard: string;
  confidence: number;
  remediationMachine: string;
  targetDistanceMeters: number;
  initialSpeedKmh: number;
  tsrSpeedKmh: number;
  imagePath: string;
  cameraAngle: 'FORWARD_CAB' | 'OHE_PANTOGRAPH' | 'BOGIE_TRACK';
  boundingBox: {
    label: string;
    confText: string;
    color: string;
  };
}

export const MAINTENANCE_SCENARIOS: MaintenanceDefectScenario[] = [
  {
    id: 'SCENARIO_TMS_804',
    name: '1. TMS Civil Rail Transverse Fracture (IMR #804)',
    department: 'TMS_CIVIL',
    departmentLabel: 'TMS Civil Engineering',
    trackSection: 'Dadar TC-03 Up Fast Corridor',
    chainage: 'KM 9/2',
    defectClass: 'Transverse Fracture (IMR Flaw)',
    defectStandard: 'IRPWM Chapter 5 Section 504',
    confidence: 98.2,
    remediationMachine: 'CSM Tamper #98 + Rail Joint Clamp',
    targetDistanceMeters: 420,
    initialSpeedKmh: 68,
    tsrSpeedKmh: 30,
    imagePath: '/assets/track_corridor.jpg',
    cameraAngle: 'FORWARD_CAB',
    boundingBox: {
      label: 'IMR FLAW #804',
      confText: '98.2% USFD',
      color: 'border-red-500 bg-red-500/25'
    }
  },
  {
    id: 'SCENARIO_TDMS_312',
    name: '2. TDMS 25kV OHE Catenary Dropper Sag (#312)',
    department: 'TDMS_ELECTRICAL',
    departmentLabel: 'TDMS Electrical TRD',
    trackSection: 'Kurla TC-04 Down Fast Corridor',
    chainage: 'KM 15/4',
    defectClass: 'Catenary Contact Wire Wear (71.5mm²)',
    defectStandard: 'ACTM Vol II Part I Para 203',
    confidence: 96.4,
    remediationMachine: 'OHE Tower Wagon #60515 + Catenary Splicer',
    targetDistanceMeters: 550,
    initialSpeedKmh: 90,
    tsrSpeedKmh: 30,
    imagePath: '/assets/shadow_block_work.jpg',
    cameraAngle: 'OHE_PANTOGRAPH',
    boundingBox: {
      label: 'OHE SAG #312',
      confText: '96.4% CAT-AI',
      color: 'border-amber-500 bg-amber-500/25'
    }
  },
  {
    id: 'SCENARIO_SMMS_105',
    name: '3. SMMS Point Switch Tongue Rail Gap (#105)',
    department: 'SMMS_SIGNAL',
    departmentLabel: 'SMMS Signaling & Telecom',
    trackSection: 'Thane TC-05 Switch SW-04 Crossover',
    chainage: 'KM 33/1',
    defectClass: 'Point Machine Obstruction (3.5mm Gap)',
    defectStandard: 'IRSEM 2021 Para 19.4.2',
    confidence: 99.1,
    remediationMachine: 'S&T Point Fitting Squad #42',
    targetDistanceMeters: 380,
    initialSpeedKmh: 75,
    tsrSpeedKmh: 30,
    imagePath: '/assets/track_corridor.jpg',
    cameraAngle: 'BOGIE_TRACK',
    boundingBox: {
      label: 'SWITCH GAP #105',
      confText: '99.1% OPTICAL',
      color: 'border-red-500 bg-red-500/25'
    }
  },
  {
    id: 'SCENARIO_TMS_601',
    name: '4. TMS Thermite AT Weld Void (#601)',
    department: 'TMS_CIVIL',
    departmentLabel: 'TMS Track Inspection',
    trackSection: 'Byculla TC-02 Up Slow Line',
    chainage: 'KM 4/8',
    defectClass: 'Weld Collar Micro-Fissure',
    defectStandard: 'Manual for Ultrasonic Testing 2020',
    confidence: 94.8,
    remediationMachine: 'Mobile Flash Butt Welder #12',
    targetDistanceMeters: 620,
    initialSpeedKmh: 110,
    tsrSpeedKmh: 30,
    imagePath: '/assets/track_corridor.jpg',
    cameraAngle: 'FORWARD_CAB',
    boundingBox: {
      label: 'WELD VOID #601',
      confText: '94.8% USFD',
      color: 'border-amber-500 bg-amber-500/25'
    }
  }
];

/**
 * Render preset maintenance imagery, weather-dependent braking telemetry,
 * and a local speed simulation with audible alerts. Scenario changes reset
 * speed, brake pressure, and camera selection; dissemination shows a local notice.
 */
export const DefectVisionTelemetry: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SCENARIO_TMS_804');
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('DRY');
  const [activeCameraAngle, setActiveCameraAngle] = useState<'FORWARD_CAB' | 'OHE_PANTOGRAPH' | 'BOGIE_TRACK'>('FORWARD_CAB');
  const [pane1ViewMode, setPane1ViewMode] = useState<'LIVE_CAM' | '3D_HOLOGRAM'>('LIVE_CAM');
  const [pane2ViewMode, setPane2ViewMode] = useState<'TELEMETRY' | '3D_CAB_RUN'>('TELEMETRY');

  const selectedScenario = useMemo(
    () => MAINTENANCE_SCENARIOS.find((s) => s.id === selectedScenarioId) || MAINTENANCE_SCENARIOS[0],
    [selectedScenarioId]
  );

  const [currentSpeed, setCurrentSpeed] = useState<number>(selectedScenario.initialSpeedKmh);
  const [brakePressure, setBrakePressure] = useState<number>(0.0);
  const [isDecelerating, setIsDecelerating] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const decelTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeBrakingScenarioRef = useRef<string | null>(null);
  const stabilizationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial speed when scenario changes
  useEffect(() => {
    if (decelTimerRef.current) clearInterval(decelTimerRef.current);
    activeBrakingScenarioRef.current = null;
    setCurrentSpeed(selectedScenario.initialSpeedKmh);
    setActiveCameraAngle(selectedScenario.cameraAngle);
    setBrakePressure(0.0);
    setIsDecelerating(false);
  }, [selectedScenario]);

  useEffect(() => {
    return () => {
      if (decelTimerRef.current) clearInterval(decelTimerRef.current);
      if (stabilizationTimerRef.current) clearTimeout(stabilizationTimerRef.current);
    };
  }, []);

  // Handle deceleration stop side effects cleanly outside React state updater
  useEffect(() => {
    if (
      !isDecelerating ||
      activeBrakingScenarioRef.current !== selectedScenario.id ||
      currentSpeed > selectedScenario.tsrSpeedKmh
    ) {
      return;
    }

    if (decelTimerRef.current) {
      clearInterval(decelTimerRef.current);
      decelTimerRef.current = null;
    }
    activeBrakingScenarioRef.current = null;
    setIsDecelerating(false);
    setBrakePressure(2.1);
    setNotification(`✓ Train stabilized at Kavach TSR ceiling: ${selectedScenario.tsrSpeedKmh} km/h.`);
    if (stabilizationTimerRef.current) clearTimeout(stabilizationTimerRef.current);
    stabilizationTimerRef.current = setTimeout(() => {
      setNotification(null);
      stabilizationTimerRef.current = null;
    }, 4000);
  }, [currentSpeed, isDecelerating, selectedScenario]);

  // Live RDSO Physics Calculation
  const ebdResult = useMemo(() => {
    return calculateKavachEbd({
      trainId: 'WAP-7 #30412',
      velocityKmh: currentSpeed,
      obstacleDistanceMeters: selectedScenario.targetDistanceMeters,
      weatherCondition: weatherCondition,
      gradientPercent: 0.002
    });
  }, [currentSpeed, selectedScenario.targetDistanceMeters, weatherCondition]);

  // Audio synthesizer functions reusing shared AudioContext
  /**
   * Play a 1,200 Hz tone for 300 ms and show a temporary notice. Synchronous
   * synthesis failures invoke the shared confirmation chime; resume promise
   * rejections are unhandled. Direct synthesis bypasses the shared mute setting.
   *
   * @throws Audio context initialization errors from the fallback chime.
   */
  const playCautionChime = () => {
    try {
      const audioCtx = getAudioContext();
      if (!audioCtx) throw new Error('No AudioContext');
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
      setNotification('🔔 1200 Hz Caution Chime Synthesized (TSR 30 km/h approach signal).');
      setTimeout(() => setNotification(null), 3000);
    } catch {
      playActionConfirmedChime();
    }
  };

  /**
   * Play 800 Hz and 880 Hz tones for 500 ms and show a temporary notice. Synchronous
   * synthesis failures invoke the shared emergency alarm; resume promise
   * rejections are unhandled. Direct synthesis bypasses the shared mute setting.
   *
   * @throws Audio context initialization errors from the fallback alarm.
   */
  const playEmergencyChime = () => {
    try {
      const audioCtx = getAudioContext();
      if (!audioCtx) throw new Error('No AudioContext');
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc2.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.5);
      osc2.stop(audioCtx.currentTime + 0.5);
      setNotification('🚨 800 Hz Emergency Brake Warning Chime Synthesized.');
      setTimeout(() => setNotification(null), 3000);
    } catch {
      playCabEmergencyAlarm(1.0);
    }
  };

  // Continuous Kinematic Deceleration Loop with live FastAPI Backend EBD Trigger
  /**
   * Dispatches RDSO EBD calculation and brake command to FastAPI backend,
   * synthesizes pneumatic exhaust and supervisory alert audio, and executes
   * realistic physics-based deceleration down to the TSR ceiling.
   */
  const handleSimulateBraking = async () => {
    if (currentSpeed <= selectedScenario.tsrSpeedKmh) return;

    activeBrakingScenarioRef.current = selectedScenario.id;
    setIsDecelerating(true);
    setBrakePressure(3.8);
    playPneumaticBrakeSound();
    playCautionChime();

    // 1. Dispatch live backend API requests to /braking/calculate-ebd and /braking/execute-command
    try {
      const [backendEbd, cmdRes] = await Promise.all([
        calculateEbd({
          trainId: 'WAP-7 #30412',
          velocityKmh: currentSpeed,
          obstacleDistanceMeters: selectedScenario.targetDistanceMeters,
          coefficientFriction: weatherParams.frictionCoefficient,
          trackGradientPercent: 0.2,
          reactionTimeSeconds: 1.2
        }),
        executeBrakeCommand({
          incidentId: selectedScenario.id,
          locoId: 'WAP-7-30412',
          mode: 'AUTONOMOUS',
          confirmedBy: 'LOCO_PILOT'
        })
      ]);

      setNotification(
        `⚡ Kavach RDSO Solenoid Command [${cmdRes.commandId}]: Req Decel ${backendEbd.requiredDecelerationMs2} m/s² | Stopping Dist: ${backendEbd.calculatedStoppingDistanceMeters}m (FastAPI 200 OK)`
      );
    } catch {
      setNotification(`⚡ Kavach Local Fallback Solenoid Actuated: Decelerating to TSR ${selectedScenario.tsrSpeedKmh} km/h`);
    }

    if (decelTimerRef.current) clearInterval(decelTimerRef.current);

    decelTimerRef.current = setInterval(() => {
      setCurrentSpeed((prev) => Math.max(selectedScenario.tsrSpeedKmh, prev - 6));
    }, 200);
  };

  /**
   * Stop the braking interval, restore scenario cruising speed, clear brake
   * pressure, and show a temporary reset notice.
   */
  const handleResetSpeed = () => {
    if (decelTimerRef.current) clearInterval(decelTimerRef.current);
    activeBrakingScenarioRef.current = null;
    setCurrentSpeed(selectedScenario.initialSpeedKmh);
    setBrakePressure(0.0);
    setIsDecelerating(false);
    setNotification('↺ Speedometer reset to cruising velocity.');
    setTimeout(() => setNotification(null), 2500);
  };

  /**
   * Play confirmation and show a temporary dispatch notice for the scenario.
   * This action only updates local notification state.
   *
   * @throws Audio context initialization errors before the notice is set.
   */
  const handleDisseminatePWay = () => {
    playActionConfirmedChime();
    setNotification(
      `✓ Defect telemetry for #${selectedScenario.id} dispatched to ${selectedScenario.departmentLabel} & Section Dispatcher OP-402.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const weatherParams = getWeatherFrictionParams(weatherCondition);

  return (
    <div className="space-y-6">
      {/* Screen 3 Header Banner */}
      <div
        className="bg-white border border-[#D0DFEE] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ borderRadius: '16px' }}
      >
        <div className="flex items-center space-x-3.5">
          <div
            className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-xs"
            style={{ borderRadius: '8px' }}
          >
            📹
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-[#0F172A] tracking-tight">
                Defect Vision &amp; Loco Cab Telemetry Console (Screen 3)
              </h2>
              <span
                className="px-2 py-0.5 text-[10px] font-mono font-bold bg-red-100 text-red-700 border border-red-300"
                style={{ borderRadius: '4px' }}
              >
                KAVACH TCAS ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Onboard Locomotive WAP-7 #30412 • Section: {selectedScenario.trackSection} ({selectedScenario.chainage})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className="px-3 py-1 bg-red-50 border border-red-300 text-red-700 text-xs font-mono font-bold animate-pulse"
            style={{ borderRadius: '4px' }}
          >
            ⚠️ TSR {selectedScenario.tsrSpeedKmh} KM/H ENFORCED
          </div>
        </div>
      </div>

      {/* Control Strip: Scenario Switcher, Camera Angles & Weather */}
      <div
        className="bg-white border border-[#D0DFEE] p-4 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3 text-xs font-mono"
        style={{ borderRadius: '12px' }}
      >
        {/* Scenario Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-bold text-slate-600 uppercase text-[11px] mr-1">Maintenance Scenario:</span>
          {MAINTENANCE_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedScenarioId(s.id)}
              className={`px-2.5 py-1 text-xs font-semibold border transition-all ${
                selectedScenarioId === s.id
                  ? 'bg-[#2B7FFF] text-white border-[#2B7FFF] shadow-xs'
                  : 'bg-[#F0F6FC] text-slate-700 border-[#D0DFEE] hover:bg-slate-100'
              }`}
              style={{ borderRadius: '4px' }}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Camera Angle & Weather Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Camera Angles */}
          <div className="flex items-center space-x-1 bg-[#F0F6FC] p-0.5 border border-[#D0DFEE]" style={{ borderRadius: '4px' }}>
            <button
              onClick={() => setActiveCameraAngle('FORWARD_CAB')}
              className={`px-2 py-0.5 text-[11px] font-bold ${
                activeCameraAngle === 'FORWARD_CAB' ? 'bg-[#2B7FFF] text-white' : 'text-slate-600'
              }`}
              style={{ borderRadius: '3px' }}
            >
              📹 USFD Forward
            </button>
            <button
              onClick={() => setActiveCameraAngle('OHE_PANTOGRAPH')}
              className={`px-2 py-0.5 text-[11px] font-bold ${
                activeCameraAngle === 'OHE_PANTOGRAPH' ? 'bg-[#2B7FFF] text-white' : 'text-slate-600'
              }`}
              style={{ borderRadius: '3px' }}
            >
              ⚡ OHE Cam
            </button>
            <button
              onClick={() => setActiveCameraAngle('BOGIE_TRACK')}
              className={`px-2 py-0.5 text-[11px] font-bold ${
                activeCameraAngle === 'BOGIE_TRACK' ? 'bg-[#2B7FFF] text-white' : 'text-slate-600'
              }`}
              style={{ borderRadius: '3px' }}
            >
              🔍 Bogie Cam
            </button>
          </div>

          {/* Weather Multiplier Selector */}
          <div className="flex items-center space-x-1 bg-[#F0F6FC] p-0.5 border border-[#D0DFEE]" style={{ borderRadius: '4px' }}>
            {(['DRY', 'WET_MONSOON', 'DENSE_FOG', 'NIGHT_IR'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setWeatherCondition(w)}
                className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                  weatherCondition === w ? 'bg-amber-500 text-white' : 'text-slate-600'
                }`}
                style={{ borderRadius: '3px' }}
                title={getWeatherFrictionParams(w).riskFactor}
              >
                {w === 'WET_MONSOON' ? '🌧 Monsoon' : w === 'DENSE_FOG' ? '🌫 Fog' : w === 'NIGHT_IR' ? '🌙 IR' : '☀️ Dry'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono text-center shadow-xs"
          style={{ borderRadius: '8px' }}
        >
          {notification}
        </div>
      )}

      {/* 4-PANE TACTICAL GRID (Matching Screen 3 Mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PANE 1: TMS CIVIL TRACK CAM (USFD VISION AI) (6 COLS) */}
        <div className="lg:col-span-6 space-y-4">
          <Card
            title={`1. ${selectedScenario.departmentLabel} Cam (USFD Vision AI)`}
            action={
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 p-0.5 rounded-[4px] border border-slate-200 text-xs font-mono">
                  <button
                    onClick={() => setPane1ViewMode('LIVE_CAM')}
                    className={`px-2 py-0.5 rounded-[3px] font-semibold transition-all cursor-pointer ${
                      pane1ViewMode === 'LIVE_CAM'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📷 Live Cam
                  </button>
                  <button
                    onClick={() => setPane1ViewMode('3D_HOLOGRAM')}
                    className={`px-2 py-0.5 rounded-[3px] font-semibold transition-all cursor-pointer ${
                      pane1ViewMode === '3D_HOLOGRAM'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🔮 3D USFD
                  </button>
                </div>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-mono font-bold border border-red-300 rounded">
                  CONFIDENCE: {selectedScenario.confidence}%
                </span>
              </div>
            }
          >
            {pane1ViewMode === '3D_HOLOGRAM' ? (
              <RailFlawHologram3D
                defectClassification={selectedScenario.defectClass}
                remediationMachine={selectedScenario.remediationMachine}
                depthMm={18}
                onDisseminate={handleDisseminatePWay}
              />
            ) : (
              <div className="space-y-4">
                {/* Photographic Track Feed Container */}
                <div
                  className="relative w-full h-56 bg-slate-950 overflow-hidden border border-slate-700 flex items-center justify-center shadow-md select-none"
                  style={{ borderRadius: '12px' }}
                >
                  <img
                    src={selectedScenario.imagePath}
                    alt={selectedScenario.name}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />

                  {/* Dynamic Bounding Box Overlay on Rail / OHE */}
                  <div
                    className={`absolute bottom-6 left-24 sm:left-36 w-32 h-16 border-2 ${selectedScenario.boundingBox.color} flex flex-col justify-between p-1.5 shadow-xl backdrop-blur-xs`}
                    style={{ borderRadius: '4px' }}
                  >
                    <span className="text-[9px] font-bold text-white bg-red-600 px-1 py-0.5 rounded font-mono">
                      {selectedScenario.boundingBox.label}
                    </span>
                    <span className="text-[9px] font-mono text-white text-right font-black">
                      {selectedScenario.boundingBox.confText}
                    </span>
                  </div>

                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 backdrop-blur-xs text-[10px] text-emerald-400 font-mono rounded">
                    ● REC [LIVE FEED 1080p 60FPS]
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/75 text-[10px] text-sky-300 font-mono rounded">
                    {selectedScenario.chainage} {selectedScenario.trackSection}
                  </div>
                </div>

                <div className="text-xs text-slate-600 font-mono space-y-1.5 bg-[#F0F6FC] p-3 border border-[#D0DFEE] rounded-lg">
                  <div className="flex justify-between">
                    <span>Defect Classification:</span>
                    <strong className="text-red-700 font-bold">{selectedScenario.defectClass}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Governing Standard:</span>
                    <span className="text-slate-800">{selectedScenario.defectStandard}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remediation Machine:</span>
                    <strong className="text-[#0F172A]">{selectedScenario.remediationMachine}</strong>
                  </div>
                </div>

                <button
                  onClick={handleDisseminatePWay}
                  className="w-full py-2 bg-[#E6F0FA] hover:bg-[#D0DFEE] text-[#2B7FFF] text-xs font-bold font-mono border border-[#D0DFEE] transition-all shadow-xs"
                  style={{ borderRadius: '4px' }}
                >
                  [DISSEMINATE DEFECT TELEMETRY TO {selectedScenario.department.replace('_', ' ')}]
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* PANE 2: KAVACH TCAS SPEEDOMETER & BRAKING CURVE (6 COLS) */}
        <div className="lg:col-span-6 space-y-4">
          <div
            className="bg-slate-900 text-white border border-slate-800 p-5 shadow-md flex flex-col justify-between"
            style={{ borderRadius: '16px' }}
          >
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <span>⚡</span>
                  <span>2. Kavach TCAS Cab Speedometer &amp; RDSO Physics</span>
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-800 p-0.5 rounded-[4px] border border-slate-700 text-xs font-mono">
                    <button
                      onClick={() => setPane2ViewMode('TELEMETRY')}
                      className={`px-2 py-0.5 rounded-[3px] font-semibold transition-all cursor-pointer ${
                        pane2ViewMode === 'TELEMETRY'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      📊 Telemetry
                    </button>
                    <button
                      onClick={() => setPane2ViewMode('3D_CAB_RUN')}
                      className={`px-2 py-0.5 rounded-[3px] font-semibold transition-all cursor-pointer ${
                        pane2ViewMode === '3D_CAB_RUN'
                          ? 'bg-cyan-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ⚡ 3D Cab Run
                    </button>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-mono font-bold border ${
                      currentSpeed <= selectedScenario.tsrSpeedKmh
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}
                    style={{ borderRadius: '4px' }}
                  >
                    {currentSpeed <= selectedScenario.tsrSpeedKmh ? 'TSR STABILIZED' : 'BRAKE SUPERVISED'}
                  </span>
                </div>
              </div>

              {pane2ViewMode === '3D_CAB_RUN' ? (
                <div className="my-2">
                  <KavachCabRun3D
                    currentSpeed={currentSpeed}
                    targetTsrSpeed={selectedScenario.tsrSpeedKmh}
                    initialDistanceMeters={selectedScenario.targetDistanceMeters}
                    weatherCondition={weatherCondition}
                    onBrakingComplete={() => {
                      setCurrentSpeed(selectedScenario.tsrSpeedKmh);
                      setIsDecelerating(false);
                      setNotification(`✓ Train stabilized at Kavach TSR ceiling: ${selectedScenario.tsrSpeedKmh} km/h.`);
                      setTimeout(() => setNotification(null), 3000);
                    }}
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 my-2">
                    <div
                      className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-center shadow-inner"
                      style={{ borderRadius: '10px' }}
                    >
                      <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Current Speed</div>
                      <div className="text-3xl font-black text-sky-400 font-mono mt-1">
                        {currentSpeed} <span className="text-xs font-normal text-slate-400">km/h</span>
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                        {isDecelerating ? `Decelerating at ${(ebdResult.requiredDecelerationMs2 || 0.72).toFixed(2)} m/s²` : 'Cruising Nominal'}
                      </div>
                    </div>

                    <div
                      className="p-3.5 bg-slate-950 rounded-lg border border-red-500/40 text-center shadow-inner"
                      style={{ borderRadius: '10px' }}
                    >
                      <div className="text-[10px] text-red-300 uppercase font-mono font-bold">Target TSR Limit</div>
                      <div className="text-3xl font-black text-red-500 font-mono mt-1">
                        {selectedScenario.tsrSpeedKmh} <span className="text-xs font-normal text-slate-400">km/h</span>
                      </div>
                      <div className="text-[10px] text-red-400 font-mono mt-0.5">
                        Target Distance: {selectedScenario.targetDistanceMeters}m
                      </div>
                    </div>
                  </div>

                  {/* Dynamic EBD Gauges */}
                  <div
                    className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 mt-3 text-xs font-mono space-y-2"
                    style={{ borderRadius: '10px' }}
                  >
                    <div className="flex justify-between text-slate-300 text-[11px]">
                      <span>Calculated RDSO EBD Stopping Distance:</span>
                      <span className="font-bold text-emerald-400">{ebdResult.calculatedStoppingDistanceMeters} meters</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>Friction Factor: μ={weatherParams.frictionCoefficient} ({weatherParams.label})</span>
                      <span>Brake Cyl: <strong className="text-sky-300">{brakePressure.toFixed(1)} BAR</strong></span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (ebdResult.calculatedStoppingDistanceMeters / 600) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800 flex justify-between items-center text-xs font-mono text-slate-400">
                    <span>Radio: <strong className="text-emerald-400">450 MHz UHF Locked</strong></span>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleResetSpeed}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded transition-all"
                        style={{ borderRadius: '4px' }}
                      >
                        ↺ Reset
                      </button>
                      <button
                        onClick={handleSimulateBraking}
                        disabled={isDecelerating || currentSpeed <= selectedScenario.tsrSpeedKmh}
                        className={`px-3.5 py-1.5 text-xs font-bold font-mono transition-all shadow-xs ${
                          currentSpeed <= selectedScenario.tsrSpeedKmh
                            ? 'bg-emerald-900 text-emerald-200 cursor-not-allowed'
                            : 'bg-[#2B7FFF] hover:bg-blue-600 text-white active:scale-95'
                        }`}
                        style={{ borderRadius: '4px' }}
                      >
                        {currentSpeed <= selectedScenario.tsrSpeedKmh ? 'TSR 30 LOCKED' : '[SIMULATE BRAKING STEP]'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* PANE 3: TDMS 25kV PANTOGRAPH & SHADOW BLOCK WORK CAM (6 COLS) */}
        <div className="lg:col-span-6 space-y-4">
          <Card
            title="3. TDMS Pantograph Cam & Joint Shadow Block Cam"
            action={
              <span className="px-2 py-0.5 bg-amber-500/15 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 text-[10px] font-mono font-bold border border-amber-400/40 dark:border-amber-500/40 rounded">
                DE-ENERGIZED
              </span>
            }
          >
            <div className="space-y-3">
              {/* Real Photographic Shadow Block Maintenance Feed */}
              <div
                className="relative w-full h-44 bg-slate-950 overflow-hidden border border-slate-700 flex items-center justify-center shadow-md"
                style={{ borderRadius: '12px' }}
              >
                <img
                  src="/assets/shadow_block_work.jpg"
                  alt="Active Joint Shadow Block Maintenance"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2.5 py-1 bg-red-600 text-white text-[10px] font-mono font-bold rounded shadow-sm">
                  ● OHE TOWER WAGON #60515 ACTIVE
                </div>
                <div className="absolute bottom-2 left-2 right-2 p-2 bg-gradient-to-t from-black/90 to-transparent text-white text-[11px] font-mono rounded">
                  <div className="font-bold">25kV OHE Catenary + Track Tamping Concurrent Window</div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-mono text-slate-600 dark:text-[#9194a1] bg-[#F0F6FC] dark:bg-[#121317] p-2.5 border border-[#D0DFEE] dark:border-[#1c1d22] rounded">
                <span>Permit to Work: <strong className="text-[#0F172A] dark:text-[#e2e3e9]">PTW-TRD-0906-88</strong></span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">10m Earthing Buffer Active</span>
              </div>
            </div>
          </Card>
        </div>

        {/* PANE 4: RDSO CAB ALARM SYNTHESIZER (6 COLS) */}
        <div className="lg:col-span-6 space-y-4">
          <Card
            title="4. RDSO Cab Alarm Synthesizer"
            action={
              <span className="px-2 py-0.5 bg-[#E6F0FA] dark:bg-blue-950/50 text-[#2B7FFF] dark:text-blue-400 text-[10px] font-mono font-bold border border-[#D0DFEE] dark:border-blue-500/30 rounded">
                WEB AUDIO API
              </span>
            }
          >
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-[#9194a1] font-mono">
                Authentic RDSO-calibrated locomotive acoustic warning chimes:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={playCautionChime}
                  className="p-3.5 bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 border border-amber-400/40 dark:border-amber-500/40 text-left transition-all shadow-xs cursor-pointer group"
                  style={{ borderRadius: '8px' }}
                >
                  <div className="font-bold text-xs text-amber-900 dark:text-amber-300 font-mono flex items-center gap-1.5">
                    <span>🔔</span>
                    <span>1200 Hz Caution Chime</span>
                  </div>
                  <div className="text-[10px] text-amber-700 dark:text-amber-400/80 font-mono mt-1">
                    300ms Sine Tone (TSR Approach)
                  </div>
                </button>

                <button
                  onClick={playEmergencyChime}
                  className="p-3.5 bg-rose-500/10 hover:bg-rose-500/20 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border border-rose-400/40 dark:border-rose-500/40 text-left transition-all shadow-xs cursor-pointer group"
                  style={{ borderRadius: '8px' }}
                >
                  <div className="font-bold text-xs text-rose-900 dark:text-rose-300 font-mono flex items-center gap-1.5">
                    <span>🚨</span>
                    <span>800 Hz Dual Alarm</span>
                  </div>
                  <div className="text-[10px] text-rose-700 dark:text-rose-400/80 font-mono mt-1">
                    Emergency Brake Warning
                  </div>
                </button>
              </div>

              <div className="pt-2 border-t border-[#D0DFEE] dark:border-[#1c1d22] flex items-center justify-between text-xs font-mono text-slate-500 dark:text-[#9194a1]">
                <span>Synthesizer: <strong className="text-emerald-700 dark:text-emerald-400">Online &amp; Calibrated</strong></span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">RDSO/SPN/196 Ver 4.0</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

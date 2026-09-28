'use client';

import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playPneumaticBrakeSound, playActionConfirmedChime } from '@/lib/audioAlerts';
import { calculateEbd, executeBrakeCommand } from '@/lib/apiClient';
import { WeatherCondition } from '@/types/apiContracts';
import { getWeatherFrictionParams } from '@/lib/agents/kavachBrakingAgent';

export interface KavachCabRun3DProps {
  currentSpeed?: number;
  targetTsrSpeed?: number;
  initialDistanceMeters?: number;
  weatherCondition?: WeatherCondition;
  trackGradientPercent?: number;
  onBrakingComplete?: () => void;
}

/**
 * 60 FPS Particle Simulation for Monsoon Rain Drops
 */
function RainParticles({ speed }: { speed: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 600;

  const [positions, initialY] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const initY = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;      // X: spread across track width
      pos[i * 3 + 1] = Math.random() * 8;           // Y: height from 0 to 8m
      pos[i * 3 + 2] = (Math.random() - 0.5) * 70;  // Z: length of visible track
      initY[i] = pos[i * 3 + 1];
    }
    return [pos, initY];
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const speedFactor = speed * 0.45;

    for (let i = 0; i < count; i++) {
      // Rain drops fall fast vertically
      posArray[i * 3 + 1] -= delta * 32;
      // Rain moves relative to forward train velocity
      posArray[i * 3 + 2] += delta * speedFactor;

      // Reset when hitting ballast or passing behind train
      if (posArray[i * 3 + 1] < 0 || posArray[i * 3 + 2] > 12) {
        posArray[i * 3 + 1] = 7.5 + Math.random() * 2;
        posArray[i * 3 + 2] = -45 - Math.random() * 20;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#BAE6FD"
        size={0.065}
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * 3D Railway Track Corridor & Kinematic Cab Perspective with Weather Reactive Materials
 */
function CabRunScene({
  speed,
  isBraking,
  brakeProgress,
  weatherCondition
}: {
  speed: number;
  isBraking: boolean;
  brakeProgress: number;
  weatherCondition: WeatherCondition;
}) {
  const sleepersGroupRef = useRef<THREE.Group>(null);
  const portalsGroupRef = useRef<THREE.Group>(null);
  const signalGroupRef = useRef<THREE.Group>(null);
  const baliseGroupRef = useRef<THREE.Group>(null);
  const offsetRef = useRef(0);
  const portalOffsetRef = useRef(0);
  const signalZRef = useRef(-45);
  const baliseZRef = useRef(-25);

  // Weather-dependent material and lighting parameters
  const isWet = weatherCondition === 'WET_MONSOON';
  const isFog = weatherCondition === 'DENSE_FOG';
  const isIR = weatherCondition === 'NIGHT_IR';

  const railColor = isIR ? '#10B981' : isWet ? '#CBD5E1' : '#94A3B8';
  const railMetalness = isWet ? 0.98 : 0.95;
  const railRoughness = isWet ? 0.08 : 0.22;
  const railEmissive = isIR ? '#064E3B' : '#000000';
  const railEmissiveIntensity = isIR ? 0.4 : 0.0;

  // 60 FPS realistic forward kinematics with camera rumble and braking pitch
  useFrame((state, delta) => {
    const velocityFactor = speed * 0.45;

    // 1. Moving Sleepers
    if (sleepersGroupRef.current) {
      offsetRef.current += delta * velocityFactor;
      if (offsetRef.current > 2.0) {
        offsetRef.current -= 2.0;
      }
      sleepersGroupRef.current.position.z = offsetRef.current;
    }

    // 2. Moving OHE Mast Portals
    if (portalsGroupRef.current) {
      portalOffsetRef.current += delta * velocityFactor;
      if (portalOffsetRef.current > 24) {
        portalOffsetRef.current -= 24;
      }
      portalsGroupRef.current.position.z = portalOffsetRef.current;
    }

    // 3. Trackside Approaching Signal Post
    if (signalGroupRef.current) {
      signalZRef.current += delta * velocityFactor;
      if (signalZRef.current > 15) {
        signalZRef.current = -70; // Loop back into distance
      }
      signalGroupRef.current.position.z = signalZRef.current;
    }

    // 4. Trackside Kavach RFID Balise
    if (baliseGroupRef.current) {
      baliseZRef.current += delta * velocityFactor;
      if (baliseZRef.current > 15) {
        baliseZRef.current = -50;
      }
      baliseGroupRef.current.position.z = baliseZRef.current;
    }

    // 5. Camera Kinematics: High-speed rail vibration + Deceleration Pitch
    const time = state.clock.getElapsedTime();
    const rumbleY = Math.sin(time * 30) * (speed / 120) * 0.005;
    const rumbleRoll = Math.cos(time * 18) * (speed / 120) * 0.002;

    // Chassis dips nose-down under heavy braking inertia
    const pitchDip = isBraking ? -0.028 * Math.sin(brakeProgress * Math.PI) : 0;

    state.camera.position.y = 1.75 + rumbleY + pitchDip * 0.5;
    state.camera.rotation.x = pitchDip;
    state.camera.rotation.z = rumbleRoll;
  });

  return (
    <group>
      {/* Weather Particle System: Active Rain under Monsoon */}
      {isWet && <RainParticles speed={speed} />}

      {/* 1. Ballast Bed (Dark Basalt Stone Base with Wet Sheen under Monsoon) */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[4.4, 0.12, 100]} />
        <meshStandardMaterial
          color={isIR ? '#06281E' : isWet ? '#0C1322' : '#131B2B'}
          roughness={isWet ? 0.45 : 0.95}
          metalness={isWet ? 0.35 : 0.1}
        />
      </mesh>
      {/* Ballast Shoulder Slopes */}
      <mesh position={[-2.4, -0.1, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.8, 0.1, 100]} />
        <meshStandardMaterial color={isIR ? '#031F17' : '#0F172A'} roughness={0.98} />
      </mesh>
      <mesh position={[2.4, -0.1, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.8, 0.1, 100]} />
        <meshStandardMaterial color={isIR ? '#031F17' : '#0F172A'} roughness={0.98} />
      </mesh>

      {/* 2. Dual Broad Gauge Running Rails (UIC-60 1676mm Broad Gauge with Weather PBR) */}
      {/* Left Rail */}
      <mesh position={[-0.838, 0.08, 0]}>
        <boxGeometry args={[0.075, 0.16, 100]} />
        <meshStandardMaterial
          color={railColor}
          metalness={railMetalness}
          roughness={railRoughness}
          emissive={railEmissive}
          emissiveIntensity={railEmissiveIntensity}
        />
      </mesh>
      {/* Right Rail */}
      <mesh position={[0.838, 0.08, 0]}>
        <boxGeometry args={[0.075, 0.16, 100]} />
        <meshStandardMaterial
          color={railColor}
          metalness={railMetalness}
          roughness={railRoughness}
          emissive={railEmissive}
          emissiveIntensity={railEmissiveIntensity}
        />
      </mesh>

      {/* 3. Pre-Stressed Concrete (PSC) Sleepers with Pandrol Fastener Clips */}
      <group ref={sleepersGroupRef}>
        {Array.from({ length: 50 }).map((_, i) => (
          <group key={i} position={[0, 0.01, (i - 25) * 1.8]}>
            {/* Concrete sleeper body */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[2.5, 0.09, 0.32]} />
              <meshStandardMaterial color={isIR ? '#093A2D' : '#334155'} roughness={0.85} />
            </mesh>
            {/* Left Pandrol Elastic Rail Clip */}
            <mesh position={[-0.838, 0.05, 0]}>
              <boxGeometry args={[0.16, 0.04, 0.18]} />
              <meshStandardMaterial color={isIR ? '#10B981' : '#64748B'} metalness={0.8} roughness={0.4} />
            </mesh>
            {/* Right Pandrol Elastic Rail Clip */}
            <mesh position={[0.838, 0.05, 0]}>
              <boxGeometry args={[0.16, 0.04, 0.18]} />
              <meshStandardMaterial color={isIR ? '#10B981' : '#64748B'} metalness={0.8} roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 4. Overhead Catenary (25kV AC Traction OHE System) */}
      <mesh position={[0, 4.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 100, 8]} />
        <meshStandardMaterial color={isIR ? '#34D399' : '#E2E8F0'} metalness={0.85} roughness={0.3} />
      </mesh>

      <mesh position={[0, 4.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 100, 8]} />
        <meshStandardMaterial color={isIR ? '#059669' : '#94A3B8'} metalness={0.9} roughness={0.35} />
      </mesh>

      {Array.from({ length: 20 }).map((_, idx) => (
        <mesh key={idx} position={[0, 4.45, (idx - 10) * 5]}>
          <cylinderGeometry args={[0.004, 0.004, 0.7]} />
          <meshStandardMaterial color={isIR ? '#10B981' : '#CBD5E1'} metalness={0.8} />
        </mesh>
      ))}

      {/* 5. Overhead OHE Mast Portals (Galvanized Steel Portals) */}
      <group ref={portalsGroupRef}>
        {[-48, -24, 0, 24].map((z, idx) => (
          <group key={idx} position={[0, 0, z]}>
            <mesh position={[-2.8, 2.5, 0]}>
              <boxGeometry args={[0.14, 5.0, 0.14]} />
              <meshStandardMaterial color={isIR ? '#064E3B' : '#475569'} metalness={0.7} roughness={0.5} />
            </mesh>
            <mesh position={[2.8, 2.5, 0]}>
              <boxGeometry args={[0.14, 5.0, 0.14]} />
              <meshStandardMaterial color={isIR ? '#064E3B' : '#475569'} metalness={0.7} roughness={0.5} />
            </mesh>
            <mesh position={[0, 4.9, 0]}>
              <boxGeometry args={[5.8, 0.16, 0.16]} />
              <meshStandardMaterial color={isIR ? '#064E3B' : '#475569'} metalness={0.7} roughness={0.5} />
            </mesh>
            <mesh position={[0, 4.4, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.8]} />
              <meshStandardMaterial color="#64748B" />
            </mesh>
          </group>
        ))}
      </group>

      {/* 6. Trackside Indian Railways 3-Aspect Color Light Signal Post */}
      <group ref={signalGroupRef} position={[-2.4, 0, -45]}>
        <mesh position={[0, 1.8, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 3.6]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} />
        </mesh>
        <mesh position={[0.2, 3.2, 0]}>
          <boxGeometry args={[0.3, 0.9, 0.25]} />
          <meshStandardMaterial color="#090D16" />
        </mesh>
        <mesh position={[0.2, 3.2, 0.14]}>
          <circleGeometry args={[0.09, 16]} />
          <meshBasicMaterial color={isIR ? '#10B981' : '#F59E0B'} />
        </mesh>
        <pointLight position={[0.2, 3.2, 0.4]} color={isIR ? '#10B981' : '#F59E0B'} intensity={isFog ? 3.0 : 1.8} distance={isFog ? 16 : 10} />
      </group>

      {/* 7. Kavach Trackside Yellow RFID Balise Transponder */}
      <group ref={baliseGroupRef} position={[0, 0.06, -25]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.05, 0.7]} />
          <meshStandardMaterial color={isIR ? '#10B981' : '#EAB308'} metalness={0.2} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.35, 0.02, 0.4]} />
          <meshStandardMaterial color="#0F172A" />
        </mesh>
      </group>

      {/* 8. Locomotive High-Beam Forward Illuminators (Volumetric Beam intensification in Fog) */}
      <pointLight position={[0, 1.6, 2.5]} color={isIR ? '#34D399' : '#BAE6FD'} intensity={isFog ? 4.5 : 2.8} distance={isFog ? 22 : 35} />
      <directionalLight position={[0, 8, -12]} intensity={isFog ? 0.4 : isIR ? 0.7 : 0.9} color={isIR ? '#10B981' : '#93C5FD'} />
      <ambientLight intensity={isFog ? 0.2 : isIR ? 0.3 : 0.45} />
    </group>
  );
}

export const KavachCabRun3D: React.FC<KavachCabRun3DProps> = ({
  currentSpeed = 68,
  targetTsrSpeed = 30,
  initialDistanceMeters = 420,
  weatherCondition = 'DRY',
  trackGradientPercent = 0.2,
  onBrakingComplete
}) => {
  const [isClient, setIsClient] = useState(false);
  const [liveSpeed, setLiveSpeed] = useState(currentSpeed);
  const [liveDistance, setLiveDistance] = useState(initialDistanceMeters);
  const [isBraking, setIsBraking] = useState(false);
  const [brakeProgress, setBrakeProgress] = useState(0);

  // Dynamic Windscreen Wiper Angle under Monsoon
  const [wiperAngle, setWiperAngle] = useState(0);

  // RDSO Physics & Backend Telemetry State
  const [backendStatus, setBackendStatus] = useState<'IDLE' | 'CALLING_BACKEND' | 'BACKEND_ACTIVE' | 'LOCAL_FALLBACK'>('IDLE');
  const [backendLatency, setBackendLatency] = useState<number>(0);
  const [rdsoEbdResult, setRdsoEbdResult] = useState<{
    stoppingDistanceM: number;
    requiredDecelMs2: number;
    commandId: string;
    frictionMu: number;
  }>({
    stoppingDistanceM: 248,
    requiredDecelMs2: 0.72,
    commandId: 'CMD-KAVACH-AUTO',
    frictionMu: 0.134
  });

  const weatherParams = useMemo(() => getWeatherFrictionParams(weatherCondition), [weatherCondition]);

  // Atmospheric background and fog parameters based on weather
  const atmosphere = useMemo(() => {
    switch (weatherCondition) {
      case 'WET_MONSOON':
        return {
          bg: '#0A1322',
          fogColor: '#0A1322',
          fogNear: 8,
          fogFar: 42,
          badgeText: '🌧 MONSOON RAIN (WET SLIPPAGE μ=0.095)',
          badgeColor: 'bg-blue-950/90 text-blue-300 border-blue-500/40'
        };
      case 'DENSE_FOG':
        return {
          bg: '#1E293B',
          fogColor: '#1E293B',
          fogNear: 2.5,
          fogFar: 22,
          badgeText: '🌫 DENSE WINTER FOG (SIGHT CAP 220m)',
          badgeColor: 'bg-slate-800/90 text-slate-200 border-slate-500/50'
        };
      case 'NIGHT_IR':
        return {
          bg: '#021A15',
          fogColor: '#022C22',
          fogNear: 10,
          fogFar: 55,
          badgeText: '🌙 FLIR THERMAL IR (8-14μm LWIR)',
          badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
        };
      case 'DRY':
      default:
        return {
          bg: '#070B14',
          fogColor: '#070B14',
          fogNear: 12,
          fogFar: 65,
          badgeText: '☀️ CLEAR DRY TRACK (OPTIMAL ADHESION μ=0.134)',
          badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-500/40'
        };
    }
  }, [weatherCondition]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isBraking) {
      setLiveSpeed(currentSpeed);
      setLiveDistance(initialDistanceMeters);
    }
  }, [currentSpeed, initialDistanceMeters, isBraking]);

  // Windscreen wiper motion simulation under Monsoon
  useEffect(() => {
    if (!isClient || weatherCondition !== 'WET_MONSOON') return;
    let frameId: number;
    let start = Date.now();

    const animateWiper = () => {
      const elapsed = (Date.now() - start) / 1000;
      // 1.2 Hz back and forth sweep
      const angle = Math.sin(elapsed * Math.PI * 2.4) * 42;
      setWiperAngle(angle);
      frameId = requestAnimationFrame(animateWiper);
    };

    frameId = requestAnimationFrame(animateWiper);
    return () => cancelAnimationFrame(frameId);
  }, [isClient, weatherCondition]);

  // Distance countdown tick
  useEffect(() => {
    if (!isClient) return;
    const interval = setInterval(() => {
      setLiveDistance((prev) => {
        const step = Math.max(1, Math.round((liveSpeed / 3.6) * 0.2));
        return prev > 20 ? prev - step : initialDistanceMeters;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isClient, liveSpeed, initialDistanceMeters]);

  const handleSimulateBraking = async () => {
    if (isBraking || liveSpeed <= targetTsrSpeed) return;

    playPneumaticBrakeSound();
    setIsBraking(true);
    setBackendStatus('CALLING_BACKEND');
    const startCallTime = Date.now();

    // 1. Dispatch asynchronous request to FastAPI Backend (/braking/calculate-ebd & /execute-command)
    try {
      const [ebdRes, cmdRes] = await Promise.all([
        calculateEbd({
          trainId: 'WAP-7 #30412',
          velocityKmh: liveSpeed,
          obstacleDistanceMeters: liveDistance,
          coefficientFriction: weatherParams.frictionCoefficient,
          trackGradientPercent: trackGradientPercent,
          reactionTimeSeconds: 1.2
        }),
        executeBrakeCommand({
          incidentId: 'INC-TSR-30',
          locoId: 'WAP-7-30412',
          mode: 'AUTONOMOUS',
          confirmedBy: 'LOCO_PILOT'
        })
      ]);

      const latency = Date.now() - startCallTime;
      setBackendLatency(latency);
      setBackendStatus('BACKEND_ACTIVE');

      setRdsoEbdResult({
        stoppingDistanceM: ebdRes.calculatedStoppingDistanceMeters,
        requiredDecelMs2: ebdRes.requiredDecelerationMs2 || 0.72,
        commandId: cmdRes.commandId,
        frictionMu: weatherParams.frictionCoefficient
      });
    } catch {
      setBackendStatus('LOCAL_FALLBACK');
    }

    // 2. Continuous RDSO Physics Deceleration Loop
    const startSpeed = liveSpeed;
    const startTime = Date.now();
    const v0Ms = startSpeed / 3.6;
    const vTsrMs = targetTsrSpeed / 3.6;
    const decelRate = Math.max(0.65, rdsoEbdResult.requiredDecelMs2 || 0.72);
    const duration = Math.max(2200, Math.min(4500, ((v0Ms - vTsrMs) / decelRate) * 1000));

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setBrakeProgress(progress);

      // Smooth kinematic deceleration curve: v(t) = v0 - (v0 - v_tsr) * (1 - (1 - p)^3)
      const nextSpeed = Math.round(startSpeed - (startSpeed - targetTsrSpeed) * (1 - Math.pow(1 - progress, 3)));
      setLiveSpeed(nextSpeed);

      if (progress >= 1) {
        clearInterval(interval);
        playActionConfirmedChime();
        setTimeout(() => {
          setIsBraking(false);
          setBrakeProgress(0);
          onBrakingComplete?.();
        }, 1200);
      }
    }, 35);
  };

  return (
    <div
      className="relative w-full h-[400px] bg-[#070B14] border border-[#D0DFEE] rounded-[16px] overflow-hidden select-none flex flex-col justify-between"
      data-testid="3d-kavach-run"
    >
      {/* Top Cockpit HUD Telemetry Banner */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#090D16]/90 backdrop-blur-md border-b border-[#2B7FFF]/20 text-xs">
        <div className="flex items-center gap-2.5 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_#F59E0B]" />
          <span className="text-sky-300 font-bold tracking-wide">
            ⚡ 3D FORWARD KAVACH TCAS RUN
          </span>
          <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            WAP-7 #30412 CAB
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] flex-wrap">
          {/* Active Weather Indicator Badge */}
          <span className={`px-2 py-0.5 rounded-[4px] border font-bold text-[10px] shadow-sm ${atmosphere.badgeColor}`}>
            {atmosphere.badgeText}
          </span>

          {backendStatus === 'BACKEND_ACTIVE' && (
            <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-[4px] font-mono text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              API: {backendLatency}ms (RDSO: {rdsoEbdResult.stoppingDistanceM}m)
            </span>
          )}

          <span className="bg-red-950/80 border border-red-500/40 text-red-400 px-2 py-0.5 rounded-[4px] font-bold">
            TSR CLAMP: {targetTsrSpeed} KM/H
          </span>

          <div className="text-[11px] text-slate-400">
            Dist: <strong className="text-amber-400">{liveDistance}m</strong>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 px-2.5 py-0.5 rounded-[4px]">
            <span className="text-cyan-300 font-bold text-xs tracking-tight">{liveSpeed}</span>
            <span className="text-[10px] text-slate-400">KM/H</span>
          </div>
        </div>
      </div>

      {/* 3D WebGL Three.js Canvas */}
      <div className="absolute inset-0 z-0">
        {isClient ? (
          <Canvas
            camera={{ position: [0, 1.75, 5.5], fov: 52 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: false }}
          >
            <color attach="background" args={[atmosphere.bg]} />
            <fog attach="fog" args={[atmosphere.fogColor, atmosphere.fogNear, atmosphere.fogFar]} />
            <Suspense fallback={null}>
              <CabRunScene
                speed={liveSpeed}
                isBraking={isBraking}
                brakeProgress={brakeProgress}
                weatherCondition={weatherCondition}
              />
            </Suspense>
          </Canvas>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#070B14] text-cyan-400/60 font-mono text-xs animate-pulse">
            Initializing Forward Kavach TCAS Perspective...
          </div>
        )}
      </div>

      {/* WAP-7 Windscreen Interior Framing & Active Monsoon Wipers */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between overflow-hidden">
        {/* Top Windscreen Tint Gradient */}
        <div className="w-full h-8 bg-gradient-to-b from-black/80 to-transparent" />
        {/* Left Cab Pillar */}
        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-[#090D16] to-transparent" />
        {/* Right Cab Pillar */}
        <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-gradient-to-l from-[#090D16] to-transparent" />

        {/* Animated Monsoon Windscreen Wipers */}
        {weatherCondition === 'WET_MONSOON' && (
          <div className="absolute bottom-6 inset-x-0 flex justify-around px-24 pointer-events-none">
            {/* Left Wiper */}
            <div
              className="w-1.5 h-28 bg-slate-900 border-l border-slate-600 origin-bottom shadow-lg transition-transform"
              style={{ transform: `rotate(${wiperAngle - 20}deg)` }}
            />
            {/* Right Wiper */}
            <div
              className="w-1.5 h-28 bg-slate-900 border-l border-slate-600 origin-bottom shadow-lg transition-transform"
              style={{ transform: `rotate(${wiperAngle - 20}deg)` }}
            />
          </div>
        )}

        {/* FLIR Thermal Scanlines Overlay under Night IR */}
        {weatherCondition === 'NIGHT_IR' && (
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-emerald-500/5 pointer-events-none opacity-40" />
        )}
      </div>

      {/* Bottom Mission Control Footer & Action Controls */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#090D16]/95 backdrop-blur-md border-t border-[#2B7FFF]/20 text-xs">
        <div className="flex items-center gap-3 font-mono text-xs text-slate-300 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
            <span className="text-slate-400">Kavach Radio:</span>
            <strong className="text-emerald-400">450 MHz UHF Locked</strong>
          </div>
          <div className="hidden sm:block text-[11px] text-slate-400 border-l border-slate-800 pl-3">
            Balise: <span className="text-amber-300">RFID #BL-104</span>
          </div>
          <div className="border-l border-slate-800 pl-3 text-[11px]">
            <span className="text-slate-400 mr-1.5">RDSO Physics:</span>
            <span className={`font-bold ${isBraking ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
              {isBraking
                ? `● EBD ACTUATED (${rdsoEbdResult.requiredDecelMs2.toFixed(2)} m/s² | μ=${weatherParams.frictionCoefficient})`
                : `● NOMINAL (μ=${weatherParams.frictionCoefficient})`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateBraking}
            disabled={isBraking || liveSpeed <= targetTsrSpeed}
            className={`font-mono text-xs font-bold px-4 py-1.5 rounded-[4px] shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
              liveSpeed <= targetTsrSpeed
                ? 'bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 cursor-not-allowed'
                : isBraking
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-[#2B7FFF] hover:bg-blue-600 text-white active:scale-95'
            }`}
          >
            <span>🚨</span>
            <span>{isBraking ? 'Braking to TSR...' : liveSpeed <= targetTsrSpeed ? 'TSR 30 Stabilized' : 'Simulate Kavach Braking'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default KavachCabRun3D;

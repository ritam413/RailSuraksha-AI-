'use client';

import React, { useRef, useEffect, useState, useTransition, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { JointBlockSchedule, TrainScheduleSlot } from '@/types/apiContracts';

export interface CorridorTwin3DProps {
  activeBlocks?: JointBlockSchedule[];
  trainPaths?: TrainScheduleSlot[];
  selectedBlockId?: string;
  onSelectBlock?: (blockId: string) => void;
  onViewDossier?: (blockId: string) => void;
}

// 4 Quadrupled Tracks
const TRACKS = [
  { id: 'UP_THROUGH', name: 'Up Fast (Through)', x: -4.5, color: '#334155' },
  { id: 'UP_SLOW', name: 'Up Slow (Suburban)', x: -1.5, color: '#475569' },
  { id: 'DOWN_FAST', name: 'Down Fast (Through)', x: 1.5, color: '#334155' },
  { id: 'DOWN_SLOW', name: 'Down Slow (Suburban)', x: 4.5, color: '#475569' }
];

interface TrainCapsuleData {
  id: string;
  name: string;
  number: string;
  trackX: number;
  color: string;
  baseSpeed: number;
  initialZ: number;
  blockedTrack?: boolean; // whether this track is inside the possession block zone
}

const DEFAULT_TRAINS: TrainCapsuleData[] = [
  { id: 'T1', name: '12051 Jan Shatabdi', number: '12051', trackX: -4.5, color: '#10B981', baseSpeed: 28, initialZ: -25, blockedTrack: false },
  { id: 'T2', name: '12137 Punjab Mail', number: '12137', trackX: 1.5, color: '#38BDF8', baseSpeed: 26, initialZ: -18, blockedTrack: true },
  { id: 'T3', name: '22221 Rajdhani Express', number: '22221', trackX: 4.5, color: '#EAB308', baseSpeed: 32, initialZ: 12, blockedTrack: false },
  { id: 'T4', name: 'Suburban EMU Local', number: '97004', trackX: -1.5, color: '#818CF8', baseSpeed: 24, initialZ: -12, blockedTrack: true }
];

function MovingTrain({
  train,
  isBlockActive
}: {
  train: TrainCapsuleData;
  isBlockActive: boolean;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const zPosRef = useRef(train.initialZ);
  const currentSpeedRef = useRef(train.baseSpeed);
  const [isBraking, setIsBraking] = useState(false);

  // Block boundary: Z = -7.5 to Z = 7.5
  const BLOCK_START_Z = -8.5;
  const BLOCK_END_Z = 8.0;

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const z = zPosRef.current;
    let targetSpeed = train.baseSpeed; // High cruising speed outside block
    let braking = false;

    if (isBlockActive && train.blockedTrack) {
      // If train is approaching or inside the active shadow block
      if (z >= BLOCK_START_Z - 4.0 && z <= BLOCK_END_Z) {
        braking = true;
        if (train.id === 'T2' && z >= BLOCK_START_Z - 1.5 && z <= BLOCK_START_Z + 0.5) {
          // Punjab Mail executes Kavach TCAS Controlled Stop before entry point
          targetSpeed = 0.0;
        } else {
          // Other affected trains decelerate to Caution TSR crawl (15-20 km/h)
          targetSpeed = train.baseSpeed * 0.2;
        }
      }
    }

    // Smooth speed interpolation
    currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * Math.min(1, delta * 3.5);

    // Advance position
    zPosRef.current += delta * currentSpeedRef.current * 0.5;
    if (zPosRef.current > 36) {
      zPosRef.current = -36;
    }
    meshRef.current.position.z = zPosRef.current;

    if (braking !== isBraking) {
      setIsBraking(braking);
    }
  });

  return (
    <group ref={meshRef} position={[train.trackX, 0.45, train.initialZ]}>
      {/* 3D Train Capsule Body */}
      <mesh castShadow>
        <boxGeometry args={[0.9, 0.7, 4.5]} />
        <meshStandardMaterial
          color={isBraking ? '#EF4444' : train.color}
          roughness={0.2}
          metalness={0.6}
          emissive={isBraking ? '#DC2626' : train.color}
          emissiveIntensity={isBraking ? 0.6 : 0.3}
        />
      </mesh>

      {/* Front Headlights */}
      <mesh position={[0.25, 0.1, 2.26]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={isBraking ? '#FBBF24' : '#E0F2FE'} />
      </mesh>
      <mesh position={[-0.25, 0.1, 2.26]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={isBraking ? '#FBBF24' : '#E0F2FE'} />
      </mesh>

      {/* Floating Spatial HUD Train Label (Native WebGL Billboard Text) */}
      <Billboard position={[0, 1.4, 0]}>
        {/* Badge Background Plate */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[3.2, 0.46]} />
          <meshBasicMaterial
            color={isBraking ? '#450a0a' : '#020617'}
            transparent
            opacity={0.88}
          />
        </mesh>
        {/* Badge Outline */}
        <lineSegments position={[0, 0, -0.01]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(3.2, 0.46)]} />
          <lineBasicMaterial color={isBraking ? '#f43f5e' : '#38bdf8'} transparent opacity={0.7} />
        </lineSegments>
        {/* Status Indicator Dot */}
        <mesh position={[-1.35, 0, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color={isBraking ? '#ef4444' : '#10b981'} />
        </mesh>
        {/* Train Name & Speed Text */}
        <Text
          position={[0.1, 0, 0]}
          fontSize={0.16}
          color={isBraking ? (train.id === 'T2' ? '#fca5a5' : '#fde047') : '#ffffff'}
          anchorX="center"
          anchorY="middle"
        >
          {`${train.name} | ${isBraking ? (train.id === 'T2' ? 'TCAS HOLD' : 'TSR 25 km/h') : '110 km/h'}`}
        </Text>
      </Billboard>
    </group>
  );
}

function TracksScene({
  selectedBlockId,
  isBlockActive,
  onToggleBlock
}: {
  selectedBlockId?: string;
  isBlockActive: boolean;
  onToggleBlock: () => void;
}) {
  const shadowMeshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Breathing animation for Shadow Block
  useFrame((state) => {
    if (shadowMeshRef.current) {
      const mat = shadowMeshRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        const pulseSpeed = isBlockActive ? 3.5 : 1.2;
        const baseOpacity = isBlockActive ? 0.4 : 0.15;
        mat.opacity = baseOpacity + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.12;
      }
    }
  });

  return (
    <group>
      {/* 4 Track Corridors */}
      {TRACKS.map((track) => (
        <group key={track.id} position={[track.x, 0, 0]}>
          {/* Left Rail */}
          <mesh position={[-0.35, 0.08, 0]}>
            <boxGeometry args={[0.08, 0.14, 80]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Right Rail */}
          <mesh position={[0.35, 0.08, 0]}>
            <boxGeometry args={[0.08, 0.14, 80]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Track Sleepers */}
          {Array.from({ length: 40 }).map((_, i) => (
            <mesh key={i} position={[0, 0.02, (i - 20) * 2]}>
              <boxGeometry args={[1.1, 0.06, 0.25]} />
              <meshStandardMaterial color="#0F172A" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Catenary Portals across tracks */}
      {[-24, -8, 8, 24].map((z, idx) => (
        <group key={idx} position={[0, 0, z]}>
          {/* Left Mast */}
          <mesh position={[-5.5, 1.8, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 3.6]} />
            <meshStandardMaterial color="#475569" metalness={0.7} />
          </mesh>
          {/* Right Mast */}
          <mesh position={[5.5, 1.8, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 3.6]} />
            <meshStandardMaterial color="#475569" metalness={0.7} />
          </mesh>
          {/* Crossbeam */}
          <mesh position={[0, 3.5, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 11.2]} />
            <meshStandardMaterial
              color={isBlockActive ? '#F43F5E' : '#38BDF8'}
              emissive={isBlockActive ? '#E11D48' : '#0284C7'}
              emissiveIntensity={0.35}
            />
          </mesh>
        </group>
      ))}

      {/* Nocturnal 4-Hour Possessory Shadow Maintenance Block (Clickable 3D Mesh) */}
      <mesh
        ref={shadowMeshRef}
        position={[0, 0.5, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onToggleBlock();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[6.5, 1.2, 14]} />
        <meshStandardMaterial
          color={isBlockActive ? '#EF4444' : '#22D3EE'}
          emissive={isBlockActive ? '#DC2626' : '#0891B2'}
          emissiveIntensity={isBlockActive ? 0.4 : 0.15}
          transparent
          opacity={isBlockActive ? 0.45 : 0.25}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Active Train Capsules */}
      {DEFAULT_TRAINS.map((train) => (
        <MovingTrain key={train.id} train={train} isBlockActive={isBlockActive} />
      ))}
    </group>
  );
}

export const CorridorTwin3D: React.FC<CorridorTwin3DProps> = ({
  activeBlocks = [],
  trainPaths = [],
  selectedBlockId,
  onSelectBlock,
  onViewDossier
}) => {
  const [isClient, setIsClient] = useState(false);
  // Time simulation state (seconds from midnight). Default 02:15:00 IST (during shadow block window)
  const [simSeconds, setSimSeconds] = useState(2 * 3600 + 15 * 60);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(10);
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);
  const [, startTransition] = useTransition();

  // Scheduled Possession Window: 01:30:00 (5400s) to 04:30:00 (16200s)
  const BLOCK_START_SEC = 1 * 3600 + 30 * 60; // 01:30 IST
  const BLOCK_END_SEC = 4 * 3600 + 30 * 60;   // 04:30 IST

  // Determine if current simulation time is within the scheduled possession window
  const isWithinScheduleWindow = simSeconds >= BLOCK_START_SEC && simSeconds < BLOCK_END_SEC;
  const isBlockActive = manualOverride !== null ? manualOverride : isWithinScheduleWindow;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Clock ticker advancing simulation seconds
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setSimSeconds((prev) => {
        // Advance time by step
        const next = prev + playbackSpeed * 0.5;
        // Loop back after 08:00:00 IST (28800s) to 00:00:00
        return next > 8 * 3600 ? 0 : next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleSelect = (blockId: string) => {
    startTransition(() => {
      onSelectBlock?.(blockId);
    });
  };

  const toggleBlockState = () => {
    setManualOverride((prev) => (prev !== null ? !prev : !isWithinScheduleWindow));
  };

  const resetToSchedule = () => {
    setManualOverride(null);
  };

  const formatTime = (sec: number) => {
    const totalSec = Math.floor(sec);
    const h = Math.floor(totalSec / 3600) % 24;
    const m = Math.floor((totalSec % 3600) / 60);
    const s = Math.floor(totalSec % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} IST`;
  };

  const activeTrainCount = trainPaths.length > 0 ? trainPaths.length : DEFAULT_TRAINS.length;
  const shadowBlockCount = activeBlocks.length > 0 ? activeBlocks.length : 1;

  return (
    <div
      className="relative w-full h-[520px] bg-[#070A12] border border-[#1E293B] rounded-[16px] select-none flex flex-col justify-between shadow-2xl overflow-visible"
      data-testid="3d-corridor-twin"
    >
      {/* Top Telemetry Ribbon (Sleek, Single-Deck, Unobtrusive) */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80 rounded-t-[16px] text-xs">
        {/* Left: Title & Live Clock */}
        <div className="flex items-center gap-3 font-mono">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isBlockActive ? 'bg-rose-500 shadow-[0_0_8px_#F43F5E]' : 'bg-cyan-400 shadow-[0_0_8px_#22D3EE]'}`} />
            <span className="text-cyan-300 font-bold tracking-wider text-[11px]">
              🌐 3D QUADRUPLED CORRIDOR TWIN (CSMT → KYN)
            </span>
          </div>

          <div className="h-3 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Active Train Status Chips */}
          <div className="hidden lg:flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-mono">
              ● {activeTrainCount} ACTIVE TRAIN CAPSULES:
            </span>
            {DEFAULT_TRAINS.map((t) => {
              const isAffected = isBlockActive && t.blockedTrack;
              return (
                <div
                  key={t.id}
                  className={`px-1.5 py-0.5 rounded-[3px] text-[9px] font-mono flex items-center gap-1 border transition-all ${
                    isAffected
                      ? 'bg-rose-950/60 border-rose-600/50 text-rose-300'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="w-1.2 h-1.2 rounded-full" style={{ backgroundColor: isAffected ? '#EF4444' : t.color }} />
                  <span>{t.name}</span>
                  <span className="text-[8px] opacity-75">
                    {isAffected ? (t.id === 'T2' ? '[HOLD]' : '[TSR]') : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Block Status & Manual Toggle */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button
            onClick={toggleBlockState}
            className={`cursor-pointer px-2.5 py-1 rounded-[4px] border font-semibold text-[11px] transition-all flex items-center gap-1.5 shadow-sm ${
              isBlockActive
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 hover:bg-rose-900/90'
                : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80'
            }`}
          >
            <span className="text-[10px]">{isBlockActive ? '🔴' : '🟢'}</span>
            <span>{shadowBlockCount} NOCTURNAL SHADOW BLOCK ({isBlockActive ? '01:30–04:30 ACTIVE' : 'LIFTED'})</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Layer (100% Unobstructed Clean Spatial Canvas) */}
      <div className="absolute inset-0 z-0 rounded-[16px] overflow-hidden">
        {isClient ? (
          <Canvas
            camera={{ position: [0, 15, 30], fov: 40 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: false }}
          >
            <color attach="background" args={['#070A12']} />
            <ambientLight intensity={0.85} />
            <directionalLight position={[12, 22, 10]} intensity={1.6} />
            <directionalLight position={[-10, 10, -10]} intensity={0.5} color="#38BDF8" />

            <Suspense fallback={null}>
              <TracksScene
                selectedBlockId={selectedBlockId}
                isBlockActive={isBlockActive}
                onToggleBlock={toggleBlockState}
              />
            </Suspense>

            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              maxPolarAngle={Math.PI / 2.15}
              minDistance={12}
              maxDistance={50}
            />
          </Canvas>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#070A12] text-cyan-400/60 font-mono text-xs animate-pulse">
            Initializing GPU Corridor Twin Mesh...
          </div>
        )}
      </div>

      {/* Mobile/Tablet Fallback Train Badges (Only on small screens where top ribbon hides them) */}
      <div className="relative z-10 p-2 lg:hidden pointer-events-none">
        <div className="flex flex-wrap gap-1 max-w-[90%]">
          {DEFAULT_TRAINS.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900/90 backdrop-blur border border-slate-800 px-1.5 py-0.5 rounded-[3px] text-[9px] font-mono text-slate-300 flex items-center gap-1"
            >
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: t.color }} />
              <span>{t.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Unified Single-Row Mission Control Dock with Interactive Tooltips */}
      <div className="relative z-30 flex flex-wrap items-center justify-between gap-2.5 px-4 py-2 bg-[#0B0F19]/95 backdrop-blur-md border-t border-slate-800/90 rounded-b-[16px] shadow-2xl text-xs font-mono">
        {/* Left: Playback & Timeline Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-[4px] font-bold text-[11px] cursor-pointer transition-all flex items-center gap-1"
          >
            <span>{isPlaying ? '⏸️ Pause' : '▶️ Play'}</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2 py-1 rounded-[4px]">
            <span className="text-slate-400 text-[10px]">Timeline Control:</span>
            <span className="text-white font-bold text-[11px]">{formatTime(simSeconds)}</span>
          </div>
        </div>

        {/* Center: Slim Scrubber Slider */}
        <div className="flex-1 min-w-[160px] max-w-[340px] flex items-center gap-2">
          <span className="text-[10px] text-slate-500">00:00</span>
          <input
            type="range"
            min={0}
            max={8 * 3600}
            step={30}
            value={simSeconds}
            onChange={(e) => {
              setSimSeconds(Number(e.target.value));
              if (manualOverride !== null) setManualOverride(null);
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#2B7FFF] transition-all"
          />
          <span className="text-[10px] text-slate-500">08:00</span>
        </div>

        {/* Speed presets & Quick Jumps */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-[4px] p-0.5">
            {[1, 10, 60, 120].map((spd) => (
              <button
                key={spd}
                onClick={() => {
                  setPlaybackSpeed(spd);
                  if (!isPlaying) setIsPlaying(true);
                }}
                className={`px-1.5 py-0.5 rounded-[3px] text-[10px] cursor-pointer transition-all ${
                  playbackSpeed === spd
                    ? 'bg-[#2B7FFF] text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setSimSeconds(1 * 3600 + 45 * 60); // 01:45 IST
              if (manualOverride !== null) setManualOverride(null);
            }}
            title="Jump into Possession Block (01:45)"
            className="bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/30 px-2 py-1 rounded-[4px] text-[10px] font-semibold cursor-pointer transition-all"
          >
            01:45 🔴
          </button>
          <button
            onClick={() => {
              setSimSeconds(4 * 3600 + 35 * 60); // 04:35 IST
              if (manualOverride !== null) setManualOverride(null);
            }}
            title="Fast Forward to Block Lift (04:35)"
            className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 px-2 py-1 rounded-[4px] text-[10px] font-semibold cursor-pointer transition-all shadow-xs"
          >
            ⏩ 04:35 (Lift Block) 🟢
          </button>
        </div>

        {/* Right: Hoverable Tooltip Triggers + Action Button */}
        <div className="flex items-center gap-2">
          {/* 1. Spatial Controls Tooltip Hover Card */}
          <div className="relative group">
            <button className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2 py-1 rounded-[4px] text-[11px] font-mono flex items-center gap-1 cursor-help transition-all">
              <span>🖱️</span>
              <span className="text-cyan-400 font-medium">Controls</span>
            </button>
            {/* Popover Tooltip */}
            <div className="absolute bottom-full left-0 mb-2 w-64 p-2.5 bg-[#0F172A]/98 backdrop-blur-xl border border-cyan-500/50 rounded-[8px] shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-[10px] font-mono text-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[9999] pointer-events-none">
              <div className="text-cyan-300 font-bold border-b border-slate-700/60 pb-1 mb-1.5 flex items-center gap-1">
                <span>🎮</span> 3D Corridor Viewport Controls
              </div>
              <div className="flex flex-col gap-1 text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">Orbit: Drag</span>
                  <span className="text-slate-400">Left Mouse / Touch</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400">Zoom: Scroll</span>
                  <span className="text-slate-400">Mouse Wheel / Pinch</span>
                </div>
                <div className="flex items-center justify-between text-amber-300 pt-0.5">
                  <span>Click 3D Block / Scrubber to toggle states</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Solver CP-SAT Telemetry Tooltip Hover Card */}
          <div className="relative group">
            <button className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2 py-1 rounded-[4px] text-[11px] font-mono flex items-center gap-1 cursor-help transition-all">
              <span className="text-amber-400">⚡</span>
              <span>CP-SAT</span>
              <span className="text-cyan-300 text-[10px] font-bold">184ms</span>
            </button>
            {/* Popover Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 w-72 p-2.5 bg-[#0F172A]/98 backdrop-blur-xl border border-cyan-500/50 rounded-[8px] shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-[10px] font-mono text-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[9999] pointer-events-none">
              <div className="text-cyan-300 font-bold border-b border-slate-700/60 pb-1 mb-1.5 flex items-center justify-between">
                <span>⚡ Optimization Engine</span>
                <span className="text-emerald-400 font-mono text-[9px]">184ms Latency</span>
              </div>
              <div className="flex flex-col gap-1 text-slate-300">
                <div>Engine: <strong className="text-white">Google OR-Tools CP-SAT</strong></div>
                <div>Model: <span className="text-slate-400">Disjunctive Interval Graph</span></div>
                <div>Headway: <span className="text-slate-400">Δclear ≥ 15m buffer enforced</span></div>
                <div>Isolation: <span className="text-slate-400">Δearth = 10m 25kV OHE earthing</span></div>
              </div>
            </div>
          </div>

          {/* 3. Action Dossier Button */}
          <button
            onClick={() => handleSelect(selectedBlockId || 'JB-2026-0926-01')}
            className="bg-[#2B7FFF] hover:bg-blue-600 text-white font-mono text-xs font-semibold px-3 py-1.5 rounded-[4px] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            📜 View Decision Dossier (SHA-256)
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorridorTwin3D;



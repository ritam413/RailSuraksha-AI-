'use client';

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface KavachCabRun3DProps {
  currentSpeed?: number;
  targetTsrSpeed?: number;
  onBrakingComplete?: () => void;
}

function CabRunScene({
  speed,
  isBraking
}: {
  speed: number;
  isBraking: boolean;
}) {
  const sleepersGroupRef = useRef<THREE.Group>(null);
  const offsetRef = useRef(0);

  // 60 FPS forward moving track sleepers
  useFrame((_, delta) => {
    if (sleepersGroupRef.current) {
      offsetRef.current += delta * (speed * 0.4);
      if (offsetRef.current > 2) {
        offsetRef.current -= 2;
      }
      sleepersGroupRef.current.position.z = offsetRef.current;
    }
  });

  return (
    <group>
      {/* 1. Continuous Rails */}
      <mesh position={[-0.8, 0.1, 0]}>
        <boxGeometry args={[0.08, 0.14, 80]} />
        <meshStandardMaterial color="#38BDF8" metalness={0.9} roughness={0.2} emissive="#0284C7" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.8, 0.1, 0]}>
        <boxGeometry args={[0.08, 0.14, 80]} />
        <meshStandardMaterial color="#38BDF8" metalness={0.9} roughness={0.2} emissive="#0284C7" emissiveIntensity={0.2} />
      </mesh>

      {/* 2. Procedural Moving Sleepers */}
      <group ref={sleepersGroupRef}>
        {Array.from({ length: 45 }).map((_, i) => (
          <mesh key={i} position={[0, 0.02, (i - 20) * 1.8]}>
            <boxGeometry args={[2.2, 0.08, 0.35]} />
            <meshStandardMaterial color="#1E293B" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* 3. Catenary Masts at Horizon */}
      {[-30, -10, 10, 30].map((z, idx) => (
        <group key={idx} position={[0, 0, z]}>
          <mesh position={[-2.4, 2.2, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 4.4]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          <mesh position={[2.4, 2.2, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 4.4]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          <mesh position={[0, 4.4, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 5.0]} />
            <meshStandardMaterial color="#0284C7" emissive="#0284C7" emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}

      {/* 4. Overhead Catenary Contact Wire */}
      <mesh position={[0, 4.2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 80]} />
        <meshStandardMaterial color="#E2E8F0" emissive="#38BDF8" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export const KavachCabRun3D: React.FC<KavachCabRun3DProps> = ({
  currentSpeed = 68,
  targetTsrSpeed = 30,
  onBrakingComplete
}) => {
  const [isClient, setIsClient] = useState(false);
  const [liveSpeed, setLiveSpeed] = useState(currentSpeed);
  const [isBraking, setIsBraking] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isBraking) {
      setLiveSpeed(currentSpeed);
    }
  }, [currentSpeed, isBraking]);

  const handleSimulateBraking = () => {
    setIsBraking(true);
    const startSpeed = liveSpeed;
    const startTime = Date.now();
    const duration = 2800; // 2.8s smooth deceleration

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Exponential deceleration ease-out curve
      const nextSpeed = Math.round(startSpeed - (startSpeed - targetTsrSpeed) * (1 - Math.pow(1 - progress, 3)));
      setLiveSpeed(nextSpeed);

      if (progress >= 1) {
        clearInterval(interval);
        setTimeout(() => {
          setIsBraking(false);
          onBrakingComplete?.();
        }, 1500);
      }
    }, 40);
  };

  return (
    <div
      className="relative w-full h-[400px] bg-[#090D16] border border-[#D0DFEE] rounded-[16px] overflow-hidden select-none flex flex-col justify-between"
      data-testid="3d-kavach-run"
    >
      {/* Top HUD Telemetry Banner */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0F172A]/90 backdrop-blur-md border-b border-cyan-500/20 text-xs">
        <div className="flex items-center gap-2 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#F59E0B]" />
          <span className="text-cyan-300 font-bold tracking-wide">
            ⚡ 3D FORWARD KAVACH TCAS RUN
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="bg-slate-900 border border-slate-700 text-cyan-300 font-bold px-2.5 py-0.5 rounded-[4px] text-xs">
            {liveSpeed} KM/H
          </span>
        </div>
      </div>

      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        {isClient ? (
          <Canvas
            camera={{ position: [0, 1.6, 6], fov: 55 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: false }}
          >
            <color attach="background" args={['#070B14']} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[0, 10, -10]} intensity={1.5} color="#38BDF8" />
            <pointLight position={[0, 1.8, 4]} color="#38BDF8" intensity={2} distance={20} />

            <Suspense fallback={null}>
              <CabRunScene speed={liveSpeed} isBraking={isBraking} />
            </Suspense>
          </Canvas>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#070B14] text-cyan-400/60 font-mono text-xs animate-pulse">
            Initializing Forward Kavach TCAS Perspective...
          </div>
        )}
      </div>

      {/* TSR Clamp Floating HUD */}
      <div className="relative z-10 pointer-events-none p-3">
        <div className="inline-block bg-slate-950/85 backdrop-blur border border-red-500/40 text-red-400 text-[11px] font-mono px-2.5 py-1 rounded-[4px]">
          TSR CLAMP: {targetTsrSpeed} KM/H
        </div>
      </div>

      {/* Bottom Mission Control HUD & Action */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0F172A]/90 backdrop-blur-md border-t border-cyan-500/20 text-xs">
        <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
          <span>Kavach Radio:</span>
          <strong className="text-emerald-400">450 MHz UHF Locked</strong>
        </div>

        <button
          onClick={handleSimulateBraking}
          disabled={isBraking}
          className="bg-[#2B7FFF] hover:bg-blue-600 disabled:opacity-50 text-white font-mono text-xs font-semibold px-4 py-1.5 rounded-[4px] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          🚨 {isBraking ? 'Braking to TSR...' : 'Simulate Kavach Braking'}
        </button>
      </div>
    </div>
  );
};

export default KavachCabRun3D;

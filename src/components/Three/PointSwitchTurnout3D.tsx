'use client';

import React, { useRef, useState, useEffect, useTransition, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export type SignalAspectType = 'CLEAR' | 'CAUTION' | 'ATTENTION' | 'DANGER';
export type SwitchRouteType = 'MAINLINE' | 'TURNOUT' | 'REVERSE';

export interface PointSwitchTurnout3DProps {
  switchId?: string;
  signalId?: string;
  signalAspect?: SignalAspectType;
  switchRoute?: SwitchRouteType;
  onToggleRoute?: (route: 'MAINLINE' | 'TURNOUT') => void;
  isLockedOut?: boolean;
}

function SwitchTurnoutScene({
  switchRoute,
  signalAspect,
  isSimulatingTrain
}: {
  switchRoute: SwitchRouteType;
  signalAspect: SignalAspectType;
  isSimulatingTrain: boolean;
}) {
  const tieRodRef = useRef<THREE.Mesh>(null);
  const switchBladeRef = useRef<THREE.Group>(null);
  const trainBogieRef = useRef<THREE.Group>(null);
  const bogieZRef = useRef(-25);

  const isReverse = switchRoute === 'TURNOUT' || switchRoute === 'REVERSE';
  const targetX = isReverse ? 0.45 : 0;
  const currentXRef = useRef(0);

  // 60 FPS hardware accelerated tie-rod stroke interpolation
  useFrame((_, delta) => {
    // Lerp tie rod stroke (115mm physical mechanical throw)
    currentXRef.current += (targetX - currentXRef.current) * Math.min(delta * 8, 1);
    
    if (tieRodRef.current) {
      tieRodRef.current.position.x = -1.2 + currentXRef.current;
    }
    if (switchBladeRef.current) {
      switchBladeRef.current.position.x = currentXRef.current * 0.8;
    }

    // Train Passing Simulation
    if (trainBogieRef.current) {
      if (isSimulatingTrain) {
        bogieZRef.current += delta * 20;
        if (bogieZRef.current > 25) {
          bogieZRef.current = -25;
        }
        trainBogieRef.current.position.z = bogieZRef.current;
        // If reverse, steer bogie along turnout curve
        if (isReverse && bogieZRef.current > -5) {
          trainBogieRef.current.position.x = (bogieZRef.current + 5) * 0.15;
          trainBogieRef.current.rotation.y = -0.15;
        } else {
          trainBogieRef.current.position.x = 0;
          trainBogieRef.current.rotation.y = 0;
        }
      } else {
        trainBogieRef.current.position.z = -35;
      }
    }
  });

  return (
    <group>
      {/* 1. Sleepers (Timber & Concrete Turnout Sleepers) */}
      {Array.from({ length: 30 }).map((_, i) => {
        const z = (i - 15) * 1.5;
        const sleeperWidth = z > -5 ? 2.2 + (z + 5) * 0.08 : 2.2;
        const sleeperX = z > -5 ? (z + 5) * 0.04 : 0;
        return (
          <mesh key={i} position={[sleeperX, 0.04, z]}>
            <boxGeometry args={[sleeperWidth, 0.08, 0.35]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>
        );
      })}

      {/* 2. Mainline Left Rail */}
      <mesh position={[-0.8, 0.14, 0]}>
        <boxGeometry args={[0.09, 0.14, 45]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* 3. Mainline Right Rail */}
      <mesh position={[0.8, 0.14, 0]}>
        <boxGeometry args={[0.09, 0.14, 45]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* 4. Turnout Diverging Right Rail (Platform 18 curve) */}
      <group position={[0.8, 0.14, -5]} rotation={[0, -0.14, 0]}>
        <mesh position={[1.5, 0, 12]}>
          <boxGeometry args={[0.09, 0.14, 25]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>

      {/* 5. Moving Switch Tongue Blade Rail */}
      <group ref={switchBladeRef} position={[0, 0.14, -4]}>
        <mesh position={[-0.68, 0, 3]} rotation={[0, 0.02, 0]}>
          <boxGeometry args={[0.06, 0.13, 8]} />
          <meshStandardMaterial color="#0284C7" metalness={0.7} roughness={0.3} emissive="#0284C7" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* 6. Electric Point Machine (Motor Box & Tie-Rod) */}
      <group position={[-1.7, 0.12, -4]}>
        {/* Motor Housing */}
        <mesh>
          <boxGeometry args={[0.7, 0.25, 0.9]} />
          <meshStandardMaterial color="#0284C7" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Stroke Tie-Rod */}
        <mesh ref={tieRodRef} position={[-0.4, 0.02, 0]}>
          <boxGeometry args={[1.5, 0.06, 0.08]} />
          <meshStandardMaterial color="#EAB308" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* 7. 4-Aspect Signal Mast Head */}
      <group position={[-1.8, 0, -8]}>
        {/* Mast Post */}
        <mesh position={[0, 1.8, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 3.6]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        {/* 4-Aspect Head Box */}
        <mesh position={[0, 3.2, 0]}>
          <boxGeometry args={[0.3, 1.1, 0.25]} />
          <meshStandardMaterial color="#0F172A" roughness={0.8} />
        </mesh>

        {/* Lens 1 (Top: Yellow / Attention) */}
        <mesh position={[0, 3.55, 0.13]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial
            color={signalAspect === 'ATTENTION' ? '#FACC15' : '#475569'}
            emissive={signalAspect === 'ATTENTION' ? '#FACC15' : '#000000'}
            emissiveIntensity={signalAspect === 'ATTENTION' ? 3 : 0}
          />
        </mesh>

        {/* Lens 2 (Upper Middle: Green / Clear) */}
        <mesh position={[0, 3.32, 0.13]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial
            color={signalAspect === 'CLEAR' ? '#22C55E' : '#475569'}
            emissive={signalAspect === 'CLEAR' ? '#22C55E' : '#000000'}
            emissiveIntensity={signalAspect === 'CLEAR' ? 3 : 0}
          />
        </mesh>

        {/* Lens 3 (Lower Middle: Yellow / Caution) */}
        <mesh position={[0, 3.09, 0.13]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial
            color={signalAspect === 'CAUTION' || signalAspect === 'ATTENTION' ? '#FACC15' : '#475569'}
            emissive={signalAspect === 'CAUTION' || signalAspect === 'ATTENTION' ? '#FACC15' : '#000000'}
            emissiveIntensity={signalAspect === 'CAUTION' || signalAspect === 'ATTENTION' ? 3 : 0}
          />
        </mesh>

        {/* Lens 4 (Bottom: Red / Danger) */}
        <mesh position={[0, 2.86, 0.13]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial
            color={signalAspect === 'DANGER' ? '#EF4444' : '#475569'}
            emissive={signalAspect === 'DANGER' ? '#EF4444' : '#000000'}
            emissiveIntensity={signalAspect === 'DANGER' ? 3 : 0}
          />
        </mesh>
      </group>

      {/* 8. Simulating Train Wheelset Bogie */}
      <group ref={trainBogieRef} position={[0, 0.45, -35]}>
        {/* Bogie Frame */}
        <mesh>
          <boxGeometry args={[1.5, 0.2, 3.5]} />
          <meshStandardMaterial color="#0284C7" metalness={0.7} />
        </mesh>
        {/* Left Wheels */}
        <mesh position={[-0.8, -0.15, -1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.08]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-0.8, -0.15, 1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.08]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Right Wheels */}
        <mesh position={[0.8, -0.15, -1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.08]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.8, -0.15, 1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.08]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

export const PointSwitchTurnout3D: React.FC<PointSwitchTurnout3DProps> = ({
  switchId = 'SW-04',
  signalId = 'S-14',
  signalAspect = 'CLEAR',
  switchRoute = 'MAINLINE',
  onToggleRoute,
  isLockedOut = false
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isSimulatingTrain, setIsSimulatingTrain] = useState(false);
  const [internalRoute, setInternalRoute] = useState<SwitchRouteType>(switchRoute);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setInternalRoute(switchRoute);
  }, [switchRoute]);

  const handleRouteToggle = (newRoute: 'MAINLINE' | 'TURNOUT') => {
    setInternalRoute(newRoute);
    startTransition(() => {
      onToggleRoute?.(newRoute);
    });
  };

  const handleTrainPass = () => {
    setIsSimulatingTrain(true);
    setTimeout(() => {
      setIsSimulatingTrain(false);
    }, 4500);
  };

  const currentAspect = isLockedOut ? 'DANGER' : signalAspect;

  return (
    <div
      className="relative w-full h-[460px] bg-[#090D16] border border-[#D0DFEE] rounded-[16px] overflow-hidden select-none flex flex-col justify-between"
      data-testid="3d-point-switch-turnout"
    >
      {/* Top HUD Telemetry Banner */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0F172A]/90 backdrop-blur-md border-b border-cyan-500/20 text-xs">
        <div className="flex items-center gap-2 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_#38BDF8]" />
          <span className="text-cyan-300 font-bold tracking-wide">
            🔀 3D YARD POINT SWITCH TURNOUT ({switchId}) & 4-ASPECT SIGNAL TWIN
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-[4px]">
            115mm MECHANICAL STROKE
          </span>
          <span
            className={`px-2 py-0.5 rounded-[4px] border font-semibold ${
              currentAspect === 'CLEAR'
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
                : currentAspect === 'DANGER'
                ? 'bg-red-950/80 border-red-500/30 text-red-300'
                : 'bg-yellow-950/80 border-yellow-500/30 text-yellow-300'
            }`}
          >
            SIGNAL ASPECT: {currentAspect}
          </span>
        </div>
      </div>

      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        {isClient ? (
          <Canvas
            camera={{ position: [0, 8, 14], fov: 45 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: false }}
          >
            <color attach="background" args={['#090D16']} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 18, 10]} intensity={1.4} />
            <directionalLight position={[-10, 10, -10]} intensity={0.6} color="#38BDF8" />

            <Suspense fallback={null}>
              <SwitchTurnoutScene
                switchRoute={internalRoute}
                signalAspect={currentAspect}
                isSimulatingTrain={isSimulatingTrain}
              />
            </Suspense>

            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              maxPolarAngle={Math.PI / 2.15}
              minDistance={8}
              maxDistance={30}
            />
          </Canvas>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#090D16] text-cyan-400/60 font-mono text-xs animate-pulse">
            Initializing 3D Switch Turnout Mesh...
          </div>
        )}
      </div>

      {/* Floating Spatial HUD Banner */}
      <div className="relative z-10 pointer-events-none p-3">
        <div className="inline-flex items-center gap-3 bg-slate-900/85 backdrop-blur border border-cyan-500/30 px-3 py-1.5 rounded-[4px] text-xs font-mono">
          <span className="text-cyan-300 font-semibold">DADAR JUNCTION {switchId} (1:12 TURNOUT)</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">
            ROUTE: <strong className="text-white">{internalRoute === 'MAINLINE' ? 'MAINLINE (NORMAL)' : 'PLATFORM 18 (REVERSE)'}</strong>
          </span>
          {isLockedOut && (
            <>
              <span className="text-slate-500">|</span>
              <span className="text-red-400 font-semibold">⚠️ Form S&T/T-351 Lockout Active</span>
            </>
          )}
        </div>
      </div>

      {/* Bottom Mission Control HUD & Route Switch Buttons */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0F172A]/90 backdrop-blur-md border-t border-cyan-500/20 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRouteToggle('MAINLINE')}
            className={`font-mono text-xs font-semibold px-3 py-1.5 rounded-[4px] transition-all cursor-pointer flex items-center gap-1.5 ${
              internalRoute === 'MAINLINE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            🟢 MAINLINE (NORMAL)
          </button>
          <button
            onClick={() => handleRouteToggle('TURNOUT')}
            className={`font-mono text-xs font-semibold px-3 py-1.5 rounded-[4px] transition-all cursor-pointer flex items-center gap-1.5 ${
              internalRoute === 'TURNOUT' || internalRoute === 'REVERSE'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            🟡 PLATFORM 18 (REVERSE)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTrainPass}
            disabled={isSimulatingTrain}
            className="bg-[#2B7FFF] hover:bg-blue-600 disabled:opacity-50 text-white font-mono text-xs font-semibold px-3 py-1.5 rounded-[4px] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            🚆 Simulate Train Passing
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointSwitchTurnout3D;

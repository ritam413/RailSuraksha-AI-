'use client';

import React, { useRef, useState, useEffect, useTransition, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Billboard, Text } from '@react-three/drei';
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

// Turnout mathematical path curve (Standard 1:12 Indian Railways Turnout geometry)
function getTurnoutPath(z: number): { x: number; angle: number } {
  if (z <= -5.0) {
    return { x: 0, angle: 0 };
  }
  const deltaZ = z - (-5.0);
  if (deltaZ <= 10.0) {
    // Parabolic transition easement
    const curvature = 0.14 / 10.0;
    const x = 0.5 * curvature * deltaZ * deltaZ;
    const slope = curvature * deltaZ;
    const angle = Math.atan(slope);
    return { x, angle };
  } else {
    // Tangent straight diverging line along 1:12 angle (0.14 rad)
    const xTransitionEnd = 0.5 * 0.14 * 10.0; // 0.7m
    const remainingZ = deltaZ - 10.0;
    const x = xTransitionEnd + remainingZ * Math.tan(0.14);
    return { x, angle: 0.14 };
  }
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

  // 60 FPS hardware accelerated tie-rod stroke & train kinematics
  useFrame((_, delta) => {
    // Lerp tie rod stroke (115mm physical mechanical throw)
    currentXRef.current += (targetX - currentXRef.current) * Math.min(delta * 8, 1);

    if (tieRodRef.current) {
      tieRodRef.current.position.x = -1.2 + currentXRef.current;
    }
    if (switchBladeRef.current) {
      switchBladeRef.current.position.x = currentXRef.current * 0.8;
    }

    // Train Passing Simulation with Kinematic Slowdown & Continuous Turn Alignment
    if (trainBogieRef.current) {
      if (isSimulatingTrain) {
        // Dynamic Kinematic Speed Profile:
        // When approaching the direction switcher (z from -18 to -3),
        // if route is TURNOUT, decelerate smoothly from cruise speed (22 m/s) down to 7 m/s caution speed.
        // As it negotiates and exits the turnout blades (z > 2), accelerate smoothly back up!
        let currentSpeed = 22;
        if (isReverse) {
          if (bogieZRef.current >= -18 && bogieZRef.current <= -2) {
            // Decelerating / Slowing down near direction switcher
            const progress = (bogieZRef.current - (-18)) / 16;
            currentSpeed = 22 - 15 * Math.sin(progress * Math.PI * 0.5); // drops smoothly down to 7 m/s
          } else if (bogieZRef.current > -2 && bogieZRef.current <= 8) {
            // Navigating the switch curve at caution TSR speed
            currentSpeed = 7 + (bogieZRef.current - (-2)) * 0.7; // smoothly climbs 7 -> 14 m/s
          } else if (bogieZRef.current > 8) {
            // Clear into Platform 18
            currentSpeed = 16;
          }
        } else {
          // Mainline path: smooth cruising speed
          currentSpeed = 20;
        }

        bogieZRef.current += delta * currentSpeed;
        if (bogieZRef.current > 26) {
          bogieZRef.current = -26;
        }

        const path = isReverse ? getTurnoutPath(bogieZRef.current) : { x: 0, angle: 0 };
        trainBogieRef.current.position.z = bogieZRef.current;
        trainBogieRef.current.position.x = path.x;
        trainBogieRef.current.rotation.y = path.angle;
        // Realistic subtle superelevation / cant lean when on curve
        trainBogieRef.current.rotation.z = isReverse && path.angle > 0 ? -path.angle * 0.12 : 0;
      } else {
        trainBogieRef.current.position.z = -35;
      }
    }
  });

  return (
    <group>
      {/* 1. Sleepers (Timber & Concrete Turnout Sleepers with Variable Spread) */}
      {Array.from({ length: 34 }).map((_, i) => {
        const z = (i - 17) * 1.4;
        const path = getTurnoutPath(z);
        const minX = -0.8;
        const maxX = Math.max(0.8, path.x + 0.8);
        const sleeperWidth = maxX - minX + 0.6;
        const sleeperX = (minX + maxX) / 2;

        return (
          <mesh key={i} position={[sleeperX, 0.04, z]}>
            <boxGeometry args={[sleeperWidth, 0.08, 0.35]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>
        );
      })}

      {/* 2. Mainline Left Rail */}
      <mesh position={[-0.8, 0.14, 0]}>
        <boxGeometry args={[0.09, 0.14, 48]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* 3. Mainline Right Rail */}
      <mesh position={[0.8, 0.14, 0]}>
        <boxGeometry args={[0.09, 0.14, 48]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* 4. Turnout Diverging Rails (Segmented Left & Right Rail Pair for Platform 18) */}
      {Array.from({ length: 16 }).map((_, idx) => {
        const z0 = -5.0 + idx * 1.875;
        const z1 = z0 + 1.875;
        const p0 = getTurnoutPath(z0);
        const p1 = getTurnoutPath(z1);
        const midZ = (z0 + z1) / 2;
        const midX = (p0.x + p1.x) / 2;
        const segAngle = Math.atan2(p1.x - p0.x, z1 - z0);
        const segLength = Math.hypot(p1.x - p0.x, z1 - z0) + 0.05;

        const leftX = midX - 0.8 * Math.cos(segAngle);
        const leftZ = midZ + 0.8 * Math.sin(segAngle);
        const rightX = midX + 0.8 * Math.cos(segAngle);
        const rightZ = midZ - 0.8 * Math.sin(segAngle);

        return (
          <group key={idx}>
            {/* Left Diverging Rail */}
            <mesh position={[leftX, 0.14, leftZ]} rotation={[0, segAngle, 0]}>
              <boxGeometry args={[0.09, 0.14, segLength]} />
              <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.25} />
            </mesh>
            {/* Right Diverging Rail */}
            <mesh position={[rightX, 0.14, rightZ]} rotation={[0, segAngle, 0]}>
              <boxGeometry args={[0.09, 0.14, segLength]} />
              <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.25} />
            </mesh>
          </group>
        );
      })}

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

      {/* 8. Aerodynamic Locomotive Cab & Wheelset Bogie */}
      <group ref={trainBogieRef} position={[0, 0.45, -35]}>
        {/* Locomotive Main Body Chassis */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[1.55, 0.75, 4.4]} />
          <meshStandardMaterial color="#0284C7" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Aerodynamic Tapered Front Nose */}
        <mesh position={[0, 0.35, 2.3]} rotation={[0.22, 0, 0]}>
          <boxGeometry args={[1.52, 0.65, 0.8]} />
          <meshStandardMaterial color="#0369A1" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Front Sloped Driver Windshield */}
        <mesh position={[0, 0.65, 2.05]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[1.35, 0.38, 0.1]} />
          <meshStandardMaterial color="#0F172A" roughness={0.1} metalness={0.9} />
        </mesh>

        {/* High-Beam Dual LED Headlights */}
        <mesh position={[-0.45, 0.32, 2.65]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#FEF08A" emissive="#FEF08A" emissiveIntensity={3} />
        </mesh>
        <mesh position={[0.45, 0.32, 2.65]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#FEF08A" emissive="#FEF08A" emissiveIntensity={3} />
        </mesh>

        {/* Roof Catenary Pantograph Frame */}
        <group position={[0, 0.88, -0.8]}>
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.8, 0.04, 1.2]} />
            <meshStandardMaterial color="#475569" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.3]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.9} />
          </mesh>
        </group>

        {/* Underbody Bogie Sub-frame */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[1.4, 0.18, 3.8]} />
          <meshStandardMaterial color="#0F172A" metalness={0.8} />
        </mesh>

        {/* Left Wheels (Aligned precisely at x = -0.8) */}
        <mesh position={[-0.8, -0.15, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.08]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-0.8, -0.15, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.08]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Right Wheels (Aligned precisely at x = +0.8) */}
        <mesh position={[0.8, -0.15, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.08]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.8, -0.15, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.08]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Floating Spatial HUD Train Label (Native WebGL Billboard Text) */}
        {isSimulatingTrain && (
          <Billboard position={[0, 1.7, 0]}>
            {/* Badge Background Plate */}
            <mesh position={[0, 0, -0.02]}>
              <planeGeometry args={[3.4, 0.46]} />
              <meshBasicMaterial color="#020617" transparent opacity={0.9} />
            </mesh>
            {/* Badge Outline */}
            <lineSegments position={[0, 0, -0.01]}>
              <edgesGeometry args={[new THREE.PlaneGeometry(3.4, 0.46)]} />
              <lineBasicMaterial color="#06b6d4" transparent opacity={0.7} />
            </lineSegments>
            {/* Status Indicator Dot */}
            <mesh position={[-1.45, 0, 0]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            {/* Train Name & Route Text */}
            <Text
              position={[0.08, 0, 0]}
              fontSize={0.14}
              color="#e0f2fe"
              anchorX="center"
              anchorY="middle"
            >
              {`WAP-7 #30412 | ${switchRoute === 'MAINLINE' ? 'MAINLINE (NORMAL)' : 'TURNOUT (PF 18)'}`}
            </Text>
          </Billboard>
        )}
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
        <div className="flex items-center gap-2.5 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_#38BDF8]" />
          <div className="flex items-center gap-2">
            <span className="text-cyan-300 font-bold tracking-wide">
              🔀 3D YARD POINT SWITCH TURNOUT ({switchId})
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              DADAR JUNCTION {switchId} (1:12 TURNOUT)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] flex-wrap">
          {isLockedOut && (
            <span className="bg-red-950/90 border border-red-500/50 text-red-300 font-bold px-2 py-0.5 rounded-[4px] flex items-center gap-1 shadow-sm animate-pulse">
              ⚠️ Form S&T/T-351 Lockout Active
            </span>
          )}
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

      {/* 3D WebGL Canvas Layer (Clean & Unobstructed) */}
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

      {/* Bottom Mission Control HUD & Route Switch Buttons (Grounded) */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0F172A]/90 backdrop-blur-md border-t border-cyan-500/20 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">SET ROUTE:</span>
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

          <div className="h-4 w-[1px] bg-slate-700 hidden md:block mx-1" />

          <div className="hidden md:flex items-center gap-1.5 font-mono text-[11px] bg-slate-900/80 border border-slate-700/50 px-2.5 py-1 rounded-[4px]">
            <span className="text-slate-400">ENGAGED:</span>
            <span className="text-cyan-300 font-bold">
              {internalRoute === 'MAINLINE' ? 'MAINLINE (NORMAL)' : 'PLATFORM 18 (REVERSE)'}
            </span>
          </div>
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

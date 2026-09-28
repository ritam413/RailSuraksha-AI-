'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

function RailwayTracks({ isShadowBlockActive }: { isShadowBlockActive: boolean }) {
  const sleepers = useMemo(() => {
    const items = [];
    for (let z = -25; z <= 25; z += 0.8) {
      items.push(z);
    }
    return items;
  }, []);

  const circuits = useMemo(
    () => [
      { id: 'TC-01', z: -18, label: 'CSMT Approach (Normal)', color: '#38bdf8' },
      { id: 'TC-02', z: -8, label: 'Dadar Inbound (Clear)', color: '#34d399' },
      { id: 'TC-03', z: 2, label: 'Kurla Gap — SHADOW BLOCK ACTIVE', color: '#f59e0b', activeBlock: true },
      { id: 'TC-04', z: 12, label: 'Thane North (Clear)', color: '#34d399' },
      { id: 'TC-05', z: 20, label: 'Kalyan Junction (Normal)', color: '#38bdf8' },
    ],
    []
  );

  return (
    <group>
      {/* Ballast Base Bed */}
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.4, 60]} />
        <meshStandardMaterial color="#0b0d13" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Left & Right Continuous Steel Rails */}
      <mesh position={[-1.1, 0, 0]} castShadow>
        <boxGeometry args={[0.08, 0.12, 60]} />
        <meshStandardMaterial color="#c7c9d1" metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh position={[1.1, 0, 0]} castShadow>
        <boxGeometry args={[0.08, 0.12, 60]} />
        <meshStandardMaterial color="#c7c9d1" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Concrete Sleepers with Fasteners */}
      {sleepers.map((z, idx) => (
        <mesh key={idx} position={[0, -0.05, z]} receiveShadow>
          <boxGeometry args={[2.8, 0.1, 0.35]} />
          <meshStandardMaterial color="#1a1c23" roughness={0.8} />
        </mesh>
      ))}

      {/* Track Circuit Demarcations */}
      {circuits.map((tc) => {
        const isBlock = tc.activeBlock && isShadowBlockActive;
        return (
          <group key={tc.id} position={[0, 0.02, tc.z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[3.2, 0.12]} />
              <meshBasicMaterial
                color={isBlock ? '#f59e0b' : tc.color}
                transparent
                opacity={isBlock ? 0.9 : 0.4}
              />
            </mesh>

            <Billboard position={[2.2, 0.6, 0]}>
              <Text
                fontSize={0.28}
                color={isBlock ? '#f59e0b' : '#9194a1'}
                anchorX="left"
                anchorY="middle"
              >
                {tc.id}
              </Text>
            </Billboard>
          </group>
        );
      })}
    </group>
  );
}

// Maintenance Equipment inside the Shadow Block Work Zone
function WorkZoneEquipment({ isShadowBlockActive }: { isShadowBlockActive: boolean }) {
  const beaconRef = useRef<THREE.PointLight>(null);
  const sparkRef = useRef<THREE.PointLight>(null);
  const sparkMeshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (beaconRef.current) {
      beaconRef.current.intensity = 1.5 + Math.sin(t * 8) * 1.5;
    }
    if (sparkRef.current && sparkMeshRef.current) {
      const sparkActive = Math.sin(t * 12) > 0.1;
      sparkRef.current.intensity = sparkActive ? (3 + Math.random() * 4) : 0.2;
      sparkMeshRef.current.visible = sparkActive;
      sparkMeshRef.current.scale.setScalar(0.8 + Math.random() * 0.6);
    }
  });

  if (!isShadowBlockActive) return null;

  return (
    <group position={[0, 0, 1.8]}>
      {/* 1. Track Welding & Ultrasonic Flaw Grinding Cart (Civil Gang) */}
      <group position={[-1.1, 0.25, 0]}>
        {/* Main Industrial Chassis */}
        <mesh castShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[0.7, 0.4, 1.2]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Flashing Warning Beacon */}
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 12]} />
          <meshBasicMaterial color="#f97316" />
        </mesh>
        <pointLight ref={beaconRef} position={[0, 0.5, 0]} color="#f97316" distance={6} />

        {/* Robotic Welding Torch Arm touching the Rail */}
        <mesh position={[0, -0.15, -0.4]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>

        {/* Dynamic Electric Welding Sparks */}
        <mesh ref={sparkMeshRef} position={[0, -0.25, -0.55]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color="#67e8f9" />
        </mesh>
        <pointLight ref={sparkRef} position={[0, -0.22, -0.55]} color="#38bdf8" distance={4} />

        {/* Equipment Label */}
        <Billboard position={[-0.8, 1.0, 0]}>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[2.2, 0.45]} />
            <meshBasicMaterial color="#040406" transparent opacity={0.9} />
          </mesh>
          <Text fontSize={0.16} color="#34d399" anchorX="center" anchorY="middle">
            ⚙️ Rail Welder #RW-04
          </Text>
        </Billboard>
      </group>

      {/* 2. OHE Tower Platform & 25kV Catenary Scaffolding (TRD Gang) */}
      <group position={[1.5, 0, 0.8]}>
        {/* Steel Lattice Scaffold Tower */}
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.25, 0.35, 3.2, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} wireframe />
        </mesh>

        {/* Elevated Work Basket */}
        <mesh position={[0, 3.2, 0]}>
          <boxGeometry args={[0.9, 0.6, 0.9]} />
          <meshStandardMaterial color="#eab308" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* TRD Crew Avatar Indicator */}
        <mesh position={[0, 3.7, 0]}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 3.82, 0]}>
          <coneGeometry args={[0.16, 0.12, 12]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>

        {/* Work Light Spot */}
        <spotLight
          position={[0, 3.5, 0]}
          target-position={[-1.5, 0, 0]}
          angle={0.6}
          penumbra={0.7}
          intensity={4}
          color="#fef08a"
          distance={10}
        />

        {/* TRD Platform Label */}
        <Billboard position={[0, 4.4, 0]}>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[2.4, 0.45]} />
            <meshBasicMaterial color="#040406" transparent opacity={0.9} />
          </mesh>
          <Text fontSize={0.16} color="#fbbf24" anchorX="center" anchorY="middle">
            ⚡ TRD Catenary Tower #TW-09
          </Text>
        </Billboard>
      </group>

      {/* 3. S&T Point Machine Calibration Unit */}
      <group position={[1.1, 0.15, -1.2]}>
        <mesh castShadow>
          <boxGeometry args={[0.45, 0.25, 0.6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <pointLight position={[0, 0.2, 0]} color="#38bdf8" intensity={1} distance={2} />
      </group>
    </group>
  );
}

// Dynamic Train with Speed Reductions & Complete Hold Simulation
function InteractiveLocomotive({
  isShadowBlockActive,
  onSpeedUpdate,
}: {
  isShadowBlockActive: boolean;
  onSpeedUpdate: (speedKmh: number, status: string) => void;
}) {
  const trainRef = useRef<THREE.Group>(null);
  const zPosRef = useRef<number>(-22);
  const currentSpeedRef = useRef<number>(130);
  const stopTimerRef = useRef<number>(0);

  useFrame((_, delta) => {
    if (!trainRef.current) return;

    let targetSpeed = 130;
    let statusText = '130 km/h (Clear Track)';

    if (isShadowBlockActive) {
      // Zone 1: High-Speed Approach (z < -10) -> 130 km/h
      if (zPosRef.current < -10) {
        targetSpeed = 130;
        statusText = '130 km/h (Express Approach)';
      }
      // Zone 2: Inbound Caution & Braking (z between -10 and -3.45) -> Decelerate smoothly to 30 km/h
      else if (zPosRef.current >= -10 && zPosRef.current < -3.45) {
        targetSpeed = 30;
        statusText = '⚠️ 30 km/h (Kavach TSR Caution Zone)';
      }
      // Zone 3: Work Zone Mandatory SIL-4 Interlock Halt (-3.45 <= z < -3.05)
      // Front of train nose (z + 3.52) halts exactly at z ≈ +0.25 (directly in front of the blue S&T beacon at z = +0.60)
      else if (zPosRef.current >= -3.45 && zPosRef.current < -3.05) {
        if (stopTimerRef.current < 4.5) {
          targetSpeed = 0;
          stopTimerRef.current += delta;
          statusText = '🛑 0 km/h (KAVACH SIL-4 INTERLOCK HOLD)';
        } else {
          targetSpeed = 15;
          statusText = '⚠️ 15 km/h (Caution Pass: Active Track Crew)';
        }
      }
      // Zone 4: Slow Safe Passage through work zone (-3.05 <= z < 3.2)
      else if (zPosRef.current >= -3.05 && zPosRef.current < 3.2) {
        targetSpeed = 25;
        statusText = '⚠️ 25 km/h (Passing Work Gang)';
      }
      // Zone 5: Clearance & Acceleration (z >= 3.2) -> Accelerate to 110 km/h
      else {
        targetSpeed = 110;
        statusText = '✓ 110 km/h (Clearance Speed Restored)';
      }
    } else {
      // Normal Traffic Flow when Shadow Block is Disabled
      targetSpeed = 130;
      statusText = '130 km/h (Normal Line Traffic)';
      stopTimerRef.current = 0;
    }

    // Smooth speed interpolation with rapid braking on stop target
    const lerpRate = targetSpeed === 0 ? Math.min(1, delta * 6.5) : Math.min(1, delta * 3.5);
    currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * lerpRate;
    if (targetSpeed === 0 && currentSpeedRef.current < 1.0) {
      currentSpeedRef.current = 0;
    }

    // Convert km/h to 3D delta translation (only translate if speed > 0)
    if (currentSpeedRef.current > 0) {
      const travelDelta = (currentSpeedRef.current / 130) * delta * 7.5;
      zPosRef.current += travelDelta;
    }

    if (zPosRef.current > 24) {
      zPosRef.current = -24;
      stopTimerRef.current = 0;
    }

    trainRef.current.position.z = zPosRef.current;
    onSpeedUpdate(Math.round(currentSpeedRef.current), statusText);
  });

  const isStopped = currentSpeedRef.current < 5;
  const isCautious = currentSpeedRef.current >= 5 && currentSpeedRef.current <= 45;

  return (
    <group ref={trainRef} position={[0, 0.6, -22]}>
      {/* Vande Bharat / WAP-7 Aerodynamic Nose Body */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[1.9, 1.1, 7]} />
        <meshStandardMaterial
          color={isStopped ? '#3b0764' : '#0f172a'}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Aerodynamic Stripe */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.92, 0.25, 6.8]} />
        <meshStandardMaterial
          color={isStopped ? '#f43f5e' : isCautious ? '#f59e0b' : '#2b7fff'}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Windshield */}
      <mesh position={[0, 0.45, 3.4]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[1.6, 0.5, 0.1]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.05} transparent opacity={0.8} />
      </mesh>

      {/* Headlights: Change color based on Kavach status */}
      <mesh position={[-0.6, 0.1, 3.52]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color={isStopped ? '#ef4444' : isCautious ? '#fef08a' : '#ffffff'} />
      </mesh>
      <mesh position={[0.6, 0.1, 3.52]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color={isStopped ? '#ef4444' : isCautious ? '#fef08a' : '#ffffff'} />
      </mesh>

      {/* Volumetric Forward Light Cone */}
      <spotLight
        position={[0, 0.2, 3.6]}
        target-position={[0, 0, 18]}
        angle={0.4}
        penumbra={0.8}
        intensity={isStopped ? 2 : isCautious ? 5 : 8}
        color={isStopped ? '#fda4af' : isCautious ? '#fef08a' : '#bae6fd'}
        distance={25}
      />

      {/* Spatial 3D HUD Tag tracking train */}
      <Billboard position={[0, 1.8, 0]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[3.2, 0.65]} />
          <meshBasicMaterial
            color={isStopped ? '#450a0a' : isCautious ? '#451a03' : '#040406'}
            transparent
            opacity={0.92}
          />
        </mesh>
        <Text
          fontSize={0.22}
          color={isStopped ? '#f87171' : isCautious ? '#facc15' : '#38bdf8'}
          anchorX="center"
          anchorY="middle"
        >
          {isStopped
            ? '🛑 HELD: 0 km/h (Work in Progress)'
            : isCautious
            ? `⚠️ TSR CAUTION: ${Math.round(currentSpeedRef.current)} km/h`
            : `12051 VB • ${Math.round(currentSpeedRef.current)} km/h`}
        </Text>
      </Billboard>
    </group>
  );
}

function HolographicShadowBlock({ isActive }: { isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isActive) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.18 + Math.sin(state.clock.elapsedTime * 2.5) * 0.08;
    }
  });

  if (!isActive) return null;

  return (
    <group position={[0, 1.2, 1.8]}>
      {/* Holographic Protective Corridor Bounding Field */}
      <mesh ref={meshRef}>
        <boxGeometry args={[4.6, 2.8, 9.5]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>

      {/* Laser Wireframe Edge Cage */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(4.6, 2.8, 9.5)]} />
        <lineBasicMaterial color="#fbbf24" linewidth={2} />
      </lineSegments>

      {/* Top Floating Spatial Callout */}
      <Billboard position={[0, 3.0, 0]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[3.4, 0.7]} />
          <meshBasicMaterial color="#121317" transparent opacity={0.95} />
        </mesh>
        <Text fontSize={0.22} color="#f59e0b" anchorX="center" anchorY="middle">
          🔒 SHADOW BLOCK #JB-2026-0926-01 (KM 9-15)
        </Text>
      </Billboard>
    </group>
  );
}

export function ShadowBlockHero3D() {
  const [isShadowBlockActive, setIsShadowBlockActive] = useState(true);
  const [liveSpeedKmh, setLiveSpeedKmh] = useState<number>(130);
  const [statusMessage, setStatusMessage] = useState<string>('130 km/h (Express Route)');

  return (
    <div className="relative w-full h-[560px] lg:h-[640px] bg-[#08080a] rounded-[24px] overflow-hidden border border-[#1c1d22] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
      {/* 3D Canvas Context */}
      <Canvas
        camera={{ position: [6.8, 5.8, 9.8], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={['#08080a']} />
        <fog attach="fog" args={['#08080a', 15, 45]} />

        {/* Studio & Accent Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 8]} intensity={1.8} castShadow color="#ffffff" />
        <pointLight position={[-8, 6, -2]} intensity={2.5} color="#2b7fff" distance={20} />
        <pointLight position={[0, 4, 2]} intensity={isShadowBlockActive ? 3.5 : 0.5} color="#f59e0b" distance={15} />

        {/* Scene Meshes */}
        <RailwayTracks isShadowBlockActive={isShadowBlockActive} />
        <WorkZoneEquipment isShadowBlockActive={isShadowBlockActive} />
        <InteractiveLocomotive
          isShadowBlockActive={isShadowBlockActive}
          onSpeedUpdate={(speed, status) => {
            setLiveSpeedKmh(speed);
            setStatusMessage(status);
          }}
        />
        <HolographicShadowBlock isActive={isShadowBlockActive} />

        {/* Orbit Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2.15}
          minPolarAngle={Math.PI / 6}
          autoRotate={false}
        />
      </Canvas>

      {/* Top HUD Control Overlay */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-[8px] bg-[#040406]/90 backdrop-blur-md border border-[#1c1d22] text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${isShadowBlockActive ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span className="text-[#e2e3e9]">
            {isShadowBlockActive ? 'SHADOW BLOCK ENGAGED: KM 9-15 (WORK GANG ACTIVE)' : 'OPEN CORRIDOR TRAFFIC'}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setIsShadowBlockActive(!isShadowBlockActive)}
            className={`px-3 py-1.5 rounded-[6px] text-xs font-mono font-medium transition-all cursor-pointer ${
              isShadowBlockActive
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-[#121317] text-[#9194a1] border border-[#1c1d22] hover:text-white'
            }`}
          >
            {isShadowBlockActive ? 'Disable Work Zone' : 'Engage Shadow Block Work Zone'}
          </button>
        </div>
      </div>

      {/* Live Train Kinematics Speedometer Card (Top Right) */}
      <div className="absolute top-16 right-4 p-3 rounded-[12px] bg-[#040406]/90 backdrop-blur-md border border-[#1c1d22] pointer-events-none min-w-[200px]">
        <div className="text-[10px] font-mono text-[#9194a1] uppercase flex justify-between items-center">
          <span>Kavach TCAS Speed</span>
          <span className={liveSpeedKmh === 0 ? 'text-rose-400 font-bold' : liveSpeedKmh <= 35 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
            {liveSpeedKmh === 0 ? 'INTERLOCK STOP' : liveSpeedKmh <= 35 ? 'TSR ACTIVE' : 'EXPRESS'}
          </span>
        </div>
        <div className="text-2xl font-bold font-mono text-[#e2e3e9] mt-1 flex items-baseline gap-1">
          <span>{liveSpeedKmh}</span>
          <span className="text-xs text-[#9194a1] font-normal">km/h</span>
        </div>
        <div className="text-[11px] text-[#c7c9d1] font-mono mt-1 truncate">
          {statusMessage}
        </div>
      </div>

      {/* Floating Spatial Bottom Stats Strip */}
      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pointer-events-none">
        <div className="p-3 rounded-[12px] bg-[#040406]/85 backdrop-blur-md border border-[#1c1d22]">
          <div className="text-[10px] font-mono text-[#9194a1] uppercase">Work Zone Gangs</div>
          <div className="text-sm font-semibold text-amber-400 mt-0.5">3 Units Working</div>
          <div className="text-[10px] text-[#9194a1]">Welder, OHE Tower, S&T</div>
        </div>
        <div className="p-3 rounded-[12px] bg-[#040406]/85 backdrop-blur-md border border-[#1c1d22]">
          <div className="text-[10px] font-mono text-[#9194a1] uppercase">Kavach Deceleration</div>
          <div className="text-sm font-semibold text-rose-400 mt-0.5">Auto-Hold to 0 km/h</div>
          <div className="text-[10px] text-[#9194a1]">SIL-4 Obstacle Failsafe</div>
        </div>
        <div className="p-3 rounded-[12px] bg-[#040406]/85 backdrop-blur-md border border-[#1c1d22]">
          <div className="text-[10px] font-mono text-[#9194a1] uppercase">Window Protection</div>
          <div className="text-sm font-semibold text-emerald-400 mt-0.5">135 min Night Gap</div>
          <div className="text-[10px] text-[#9194a1]">0 Train Cancellations</div>
        </div>
        <div className="p-3 rounded-[12px] bg-[#040406]/85 backdrop-blur-md border border-[#1c1d22]">
          <div className="text-[10px] font-mono text-[#9194a1] uppercase">Speed Restoration</div>
          <div className="text-sm font-semibold text-sky-400 mt-0.5">Auto 110 km/h Clear</div>
          <div className="text-[10px] text-[#9194a1]">Post-Work Release</div>
        </div>
      </div>
    </div>
  );
}
export default ShadowBlockHero3D;

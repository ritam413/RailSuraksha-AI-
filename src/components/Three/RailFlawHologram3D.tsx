'use client';

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

export interface RailFlawHologram3DProps {
  defectClassification?: string;
  remediationMachine?: string;
  depthMm?: number;
  onDisseminate?: () => void;
}

// Construct Authentic UIC-60 Rail Cross-Section (Head, Web, Foot)
function createUIC60RailShape(): THREE.Shape {
  const shape = new THREE.Shape();
  // Standard UIC-60 rail cross-section curve dimensions (scaled to 3D units)
  // Base flange (Foot)
  shape.moveTo(-1.5, -2.0);
  shape.lineTo(1.5, -2.0);
  shape.lineTo(1.5, -1.7);
  shape.lineTo(0.35, -1.2);
  // Web (Stem)
  shape.lineTo(0.25, 0.4);
  // Rail Head
  shape.lineTo(0.85, 0.9);
  shape.quadraticCurveTo(0.9, 1.8, 0.7, 2.0);
  shape.quadraticCurveTo(0.0, 2.2, -0.7, 2.0);
  shape.quadraticCurveTo(-0.9, 1.8, -0.85, 0.9);
  // Left Web
  shape.lineTo(-0.25, 0.4);
  shape.lineTo(-0.35, -1.2);
  shape.lineTo(-1.5, -1.7);
  shape.closePath();

  return shape;
}

function RailGeometryMesh({ isXRay }: { isXRay: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const flawRef = useRef<THREE.Mesh>(null);
  const waveRef = useRef<THREE.Mesh>(null);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 2,
    depth: 4.5,
    bevelEnabled: true,
    bevelThickness: 0.15,
    bevelSize: 0.1,
    bevelSegments: 3
  };

  const railShape = React.useMemo(() => createUIC60RailShape(), []);

  useFrame((state) => {
    // Oscillate internal ruby flaw glow
    if (flawRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      flawRef.current.scale.set(scale, scale, scale);
    }
    // Oscillate ultrasonic transducer pulse wave
    if (waveRef.current) {
      const mat = waveRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 6) * 0.25;
      }
    }
  });

  return (
    <group position={[0, 0, -2.25]}>
      {/* 1. Authentic Extruded UIC-60 Rail Body */}
      <mesh ref={meshRef}>
        <extrudeGeometry args={[railShape, extrudeSettings]} />
        <meshPhysicalMaterial
          color={isXRay ? '#0284C7' : '#334155'}
          roughness={isXRay ? 0.1 : 0.4}
          metalness={isXRay ? 0.2 : 0.8}
          transmission={isXRay ? 0.85 : 0}
          transparent={isXRay}
          opacity={isXRay ? 0.45 : 1.0}
          wireframe={false}
          clearcoat={isXRay ? 1 : 0.2}
        />
      </mesh>

      {/* 2. Wireframe Steel Edge Highlight */}
      <mesh>
        <extrudeGeometry args={[railShape, extrudeSettings]} />
        <meshBasicMaterial color="#38BDF8" wireframe={true} transparent opacity={isXRay ? 0.35 : 0.1} />
      </mesh>

      {/* 3. Internal Ruby Transverse Fracture Flaw (18mm below crown) */}
      <mesh ref={flawRef} position={[0.1, 1.4, 2.25]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial
          color="#EF4444"
          emissive="#DC2626"
          emissiveIntensity={3}
          roughness={0.2}
        />
      </mesh>

      {/* 4. Ultrasonic 70° Angle Probe Wave Cone */}
      <mesh ref={waveRef} position={[0.1, 2.4, 2.25]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.6, 1.4, 16]} />
        <meshBasicMaterial color="#A855F7" transparent opacity={0.4} wireframe={true} />
      </mesh>
    </group>
  );
}

export const RailFlawHologram3D: React.FC<RailFlawHologram3DProps> = ({
  defectClassification = 'Transverse Fracture (IMR Flaw)',
  remediationMachine = 'CSM Tamper #98 + Rail Joint Clamp',
  depthMm = 18,
  onDisseminate
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isXRay, setIsXRay] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div
      className="relative w-full h-[400px] bg-[#090D16] border border-[#D0DFEE] rounded-[16px] overflow-hidden select-none flex flex-col justify-between"
      data-testid="3d-usfd-hologram"
    >
      {/* Top HUD Banner */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0F172A]/90 backdrop-blur-md border-b border-purple-500/20 text-xs">
        <div className="flex items-center gap-2 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#C084FC]" />
          <span className="text-purple-300 font-bold tracking-wide">
            🔮 3D USFD VOLUMETRIC X-RAY (UIC-60)
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-purple-200">
          <span className="bg-purple-950/80 border border-purple-500/30 px-2 py-0.5 rounded-[4px]">
            ● 70° ANGLE PROBE
          </span>
          <span className="bg-red-950/80 border border-red-500/30 text-red-300 px-2 py-0.5 rounded-[4px]">
            DEPTH: {depthMm}mm (IMR)
          </span>
        </div>
      </div>

      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        {isClient ? (
          <Canvas
            camera={{ position: [0, 2, 7.5], fov: 45 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: false }}
          >
            <color attach="background" args={['#090D16']} />
            <ambientLight intensity={0.9} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <directionalLight position={[-10, 10, -10]} intensity={0.8} color="#A855F7" />
            <pointLight position={[0.1, 1.4, 2.25]} color="#EF4444" intensity={4} distance={6} />

            <Suspense fallback={null}>
              <Float speed={1.5} rotationIntensity={0.25} floatIntensity={0.3}>
                <RailGeometryMesh isXRay={isXRay} />
              </Float>
            </Suspense>

            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              maxPolarAngle={Math.PI / 1.8}
              minDistance={4}
              maxDistance={15}
            />
          </Canvas>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#090D16] text-purple-400/60 font-mono text-xs animate-pulse">
            Initializing UIC-60 Extruded Rail Mesh...
          </div>
        )}
      </div>

      {/* Floating Center Orbit Tag */}
      <div className="relative z-10 pointer-events-none p-3 flex justify-end">
        <div className="bg-slate-900/80 backdrop-blur border border-purple-500/30 px-2.5 py-1 rounded-[4px] text-[10px] font-mono text-purple-200">
          🖱️ Orbit to inspect internal flaw depth
        </div>
      </div>

      {/* Bottom Mission Control HUD & Actions */}
      <div className="relative z-10 p-3 bg-[#0F172A]/90 backdrop-blur-md border-t border-purple-500/20 text-xs">
        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-2.5">
          <div className="text-slate-300">
            Defect Classification: <strong className="text-red-400">{defectClassification}</strong>
          </div>
          <div className="text-slate-300 text-right">
            Remediation Machine: <strong className="text-white">{remediationMachine}</strong>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setIsXRay((prev) => !prev)}
            className="bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/40 font-mono text-xs font-semibold px-3 py-1.5 rounded-[4px] transition-all cursor-pointer"
          >
            {isXRay ? '🔒 Toggle Solid Steel' : '👁️ Toggle X-Ray Steel'}
          </button>

          <button
            onClick={onDisseminate}
            className="bg-[#2B7FFF] hover:bg-blue-600 text-white font-mono text-xs font-semibold px-4 py-1.5 rounded-[4px] shadow-sm transition-all cursor-pointer"
          >
            📢 Disseminate to P-Way
          </button>
        </div>
      </div>
    </div>
  );
};

export default RailFlawHologram3D;

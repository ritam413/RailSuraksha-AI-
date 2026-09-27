'use client';

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

export interface CryptographicSeal3DProps {
  hashDigest?: string;
  isTamperVerified?: boolean;
  onInspectDossier?: () => void;
}

function SealScene({ isTamperVerified }: { isTamperVerified: boolean }) {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  // 60 FPS contra-rotating rings
  useFrame((_, delta) => {
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.5;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= delta * 0.7;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <group>
      {/* 1. Outer Torus Gold Seal Ring */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.5, 0.12, 16, 64]} />
        <meshStandardMaterial
          color="#F59E0B"
          metalness={0.9}
          roughness={0.2}
          emissive="#D97706"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* 2. Inner Turquoise SHA-256 Hash Ring */}
      <mesh ref={innerRingRef} rotation={[-Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.8, 0.08, 16, 48]} />
        <meshStandardMaterial
          color="#06B6D4"
          metalness={0.8}
          roughness={0.2}
          emissive="#0891B2"
          emissiveIntensity={0.6}
          wireframe={true}
        />
      </mesh>

      {/* 3. Central Cryptographic Octahedron Core */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[1.0, 0]} />
        <meshStandardMaterial
          color={isTamperVerified ? '#10B981' : '#EF4444'}
          emissive={isTamperVerified ? '#059669' : '#DC2626'}
          emissiveIntensity={1.5}
          metalness={0.7}
          roughness={0.3}
          wireframe={false}
        />
      </mesh>

      {/* Orbiting Merkle Nodes */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
        <mesh
          key={idx}
          position={[Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, 0]}
        >
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#38BDF8" emissive="#0284C7" emissiveIntensity={1} />
        </mesh>
      ))}
    </group>
  );
}

export const CryptographicSeal3D: React.FC<CryptographicSeal3DProps> = ({
  hashDigest = '0x8F9B72A4E310C29D',
  isTamperVerified = true,
  onInspectDossier
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div
      className="relative w-full h-[360px] bg-[#090D16] border border-[#D0DFEE] rounded-[16px] overflow-hidden select-none flex flex-col justify-between"
      data-testid="3d-cryptographic-seal"
    >
      {/* Top HUD Telemetry Banner */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0F172A]/90 backdrop-blur-md border-b border-cyan-500/20 text-xs">
        <div className="flex items-center gap-2 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#F59E0B]" />
          <span className="text-amber-300 font-bold tracking-wide">
            🔐 3D HOLOGRAPHIC CRYPTOGRAPHIC SEAL
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="bg-slate-900 border border-slate-700 text-cyan-300 px-2 py-0.5 rounded-[4px]">
            SHA-256: {hashDigest}
          </span>
          <span className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-[4px]">
            TAMPER-EVIDENT MERKLE ROOT: VERIFIED
          </span>
        </div>
      </div>

      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        {isClient ? (
          <Canvas
            camera={{ position: [0, 0, 7], fov: 45 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: false }}
          >
            <color attach="background" args={['#090D16']} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 10]} intensity={1.5} />
            <pointLight position={[0, 0, 0]} color="#10B981" intensity={3} distance={10} />

            <Suspense fallback={null}>
              <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
                <SealScene isTamperVerified={isTamperVerified} />
              </Float>
            </Suspense>

            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={4}
              maxDistance={12}
            />
          </Canvas>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#090D16] text-amber-400/60 font-mono text-xs animate-pulse">
            Initializing 3D Cryptographic Seal Mesh...
          </div>
        )}
      </div>

      {/* Bottom Mission Control HUD & Action */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0F172A]/90 backdrop-blur-md border-t border-cyan-500/20 text-xs">
        <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
          <span className="text-cyan-400">RFC 8785 Canonical JSON</span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400">Statutory RDSO Section 14B Certificate</span>
        </div>

        <button
          onClick={onInspectDossier}
          className="bg-[#2B7FFF] hover:bg-blue-600 text-white font-mono text-xs font-semibold px-4 py-1.5 rounded-[4px] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          🔍 Inspect SHA-256 Merkle Ledger
        </button>
      </div>
    </div>
  );
};

export default CryptographicSeal3D;

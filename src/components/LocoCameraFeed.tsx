// src/components/LocoCameraFeed.tsx
'use client';

import React from 'react';
import { Card } from './Common/Card';

interface LocoCameraFeedProps {
  onTriggerBraking: () => void;
  brakeState: 'CLEAR' | 'EMERGENCY_SOLENOID_ACTUATED';
}

export const LocoCameraFeed: React.FC<LocoCameraFeedProps> = ({ onTriggerBraking, brakeState }) => {
  return (
    <Card title="Loco-Cab Forward Vision Camera Feed (Cab #204 - Vande Bharat Express)" className="mb-6">
      <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 min-h-[380px] flex items-center justify-center">
        {/* Video Player */}
        <video
          src="https://assets.mixkit.co/videos/preview/mixkit-train-passing-through-a-green-landscape-42211-large.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-[380px] object-cover opacity-90"
        />

        {/* Bounding Box Overlay for Boulder */}
        <div
          className="absolute border-2 border-red-500 bg-red-500/20 rounded p-1 flex flex-col justify-between shadow-lg"
          style={{ top: '35%', left: '42%', width: '160px', height: '110px' }}
        >
          <div className="bg-red-600 text-white text-[10px] font-mono font-bold px-1 py-0.5 rounded w-max">
            BOULDER 98.2% (340m)
          </div>
          <div className="text-[9px] font-mono text-red-200 bg-black/60 px-1 rounded">
            Track 1A Obstacle
          </div>
        </div>

        {/* HUD Telemetry Overlay */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-xs border border-white/20 rounded-lg p-3 text-white font-mono text-xs space-y-1">
          <div className="text-emerald-400 font-bold">CAM: LOCO-CAB-FRONT-VANDB-204</div>
          <div>SPEED: 110 KM/H | MASS: 1400T</div>
          <div>OBSTACLE DISTANCE: 340M</div>
          <div className={brakeState === 'EMERGENCY_SOLENOID_ACTUATED' ? 'text-red-400 font-bold' : 'text-emerald-300'}>
            BRAKE STATE: {brakeState}
          </div>
        </div>

        {/* Action Button */}
        <div className="absolute bottom-4 right-4">
          <button
            onClick={onTriggerBraking}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-lg border border-red-400 transition-all"
            style={{ borderRadius: '4px' }}
          >
            🚨 [APPLY BRAKING FORMULA]
          </button>
        </div>
      </div>
    </Card>
  );
};

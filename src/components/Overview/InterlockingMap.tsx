// src/components/Overview/InterlockingMap.tsx
import React from 'react';
import { Card } from '../Common/Card';
import { MOCK_INTERLOCKING_STATE } from '@/lib/mockData';

export const InterlockingMap: React.FC = () => {
  return (
    <Card title="Railway Track Interlocking Diagram (Section 14B — CSMT Division)" className="mb-6">
      <div className="bg-[#F0F6FC] border border-[#D0DFEE] rounded-xl p-6 min-h-[220px] flex flex-col justify-center">
        {/* Track Line Canvas Visualizer */}
        <div className="relative space-y-6">
          {/* Line 1: Up Main */}
          <div className="flex items-center space-x-4">
            <span className="w-24 text-xs font-mono font-bold text-[#0F172A]">Up Main 1A</span>
            <div className="flex-1 h-3 bg-slate-300 rounded relative flex items-center px-2">
              <div className="w-1/3 h-full bg-[#2B7FFF] rounded flex items-center justify-center text-[9px] text-white font-mono font-bold">
                12345 (Vande Bharat)
              </div>
              <div className="ml-auto w-4 h-4 rounded-full bg-red-500 animate-pulse border-2 border-white shadow-xs" title="Signal S-12 (STOP)" />
            </div>
            <span className="text-xs font-mono text-slate-600">S-12 [STOP]</span>
          </div>

          {/* Line 2: Down Main */}
          <div className="flex items-center space-x-4">
            <span className="w-24 text-xs font-mono font-bold text-[#0F172A]">Down Line 2A</span>
            <div className="flex-1 h-3 bg-slate-300 rounded relative flex items-center px-2">
              <div className="w-1/4 ml-24 h-full bg-indigo-600 rounded flex items-center justify-center text-[9px] text-white font-mono font-bold">
                22691 (Rajdhani)
              </div>
              <div className="ml-auto w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" title="Signal S-14 (CLEAR)" />
            </div>
            <span className="text-xs font-mono text-slate-600">S-14 [CLEAR]</span>
          </div>

          {/* Line 3: Platform 18 Loop */}
          <div className="flex items-center space-x-4">
            <span className="w-24 text-xs font-mono font-bold text-[#0F172A]">Platform 18</span>
            <div className="flex-1 h-3 bg-amber-100 border border-amber-300 rounded relative flex items-center px-2">
              <span className="text-[10px] font-mono text-amber-800 font-bold">5-MIN HOLD ACTIVE (Platform 17 Crowd Surge Bottleneck)</span>
              <div className="ml-auto w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-xs" title="Signal S-16 (HOLD)" />
            </div>
            <span className="text-xs font-mono text-amber-700 font-bold">S-16 [HOLD]</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

'use client';

import React, { useState } from 'react';

export function ShadowBlockComparison() {
  const [mode, setMode] = useState<'SHADOW' | 'LEGACY'>('SHADOW');

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#1c1d22]">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#ae9357] mb-2">
            Operational Paradigm Shift
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-medium text-[#e2e3e9] tracking-tight">
            Fragmented Traffic Disruption vs. AI Shadow Block
          </h2>
        </div>

        {/* Mode Toggle Switch */}
        <div className="flex items-center p-1 rounded-[8px] bg-[#121317] border border-[#1c1d22] self-start md:self-auto">
          <button
            onClick={() => setMode('LEGACY')}
            className={`px-4 py-2 rounded-[6px] text-xs font-mono font-medium transition-all cursor-pointer ${
              mode === 'LEGACY'
                ? 'bg-[#1c1d22] text-rose-400 border border-rose-500/30 shadow-sm'
                : 'text-[#9194a1] hover:text-[#e2e3e9]'
            }`}
          >
            Legacy Maintenance
          </button>
          <button
            onClick={() => setMode('SHADOW')}
            className={`px-4 py-2 rounded-[6px] text-xs font-mono font-medium transition-all cursor-pointer ${
              mode === 'SHADOW'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'text-[#9194a1] hover:text-[#e2e3e9]'
            }`}
          >
            RailSuraksha AI Shadow Block
          </button>
        </div>
      </div>

      {/* Interactive Visualization Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10 items-stretch">
        {/* Left Side: Timeline Comparison Visualizer */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-[16px] bg-[#040406] border border-[#1c1d22] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-[#9194a1] mb-6">
              <span>00:00 (Midnight)</span>
              <span>03:00 (Traffic Dip)</span>
              <span>06:00 (Morning Peak)</span>
            </div>

            {mode === 'LEGACY' ? (
              /* Legacy Disconnected Timeline */
              <div className="space-y-4">
                <div className="p-3.5 rounded-[8px] bg-rose-950/20 border border-rose-500/30">
                  <div className="flex justify-between text-xs font-mono text-rose-400 mb-1.5">
                    <span>1. Track Gang Block (01:00 - 02:45)</span>
                    <span className="text-rose-300">105 min • 3 Trains Held</span>
                  </div>
                  <div className="w-full bg-[#121317] h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[40%] ml-[15%]" />
                  </div>
                </div>

                <div className="p-3.5 rounded-[8px] bg-rose-950/20 border border-rose-500/30">
                  <div className="flex justify-between text-xs font-mono text-rose-400 mb-1.5">
                    <span>2. OHE Power Block (03:15 - 04:45)</span>
                    <span className="text-rose-300">90 min • 4 Trains Held</span>
                  </div>
                  <div className="w-full bg-[#121317] h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[35%] ml-[50%]" />
                  </div>
                </div>

                <div className="p-3.5 rounded-[8px] bg-rose-950/20 border border-rose-500/30">
                  <div className="flex justify-between text-xs font-mono text-rose-400 mb-1.5">
                    <span>3. S&T Signal Block (05:00 - 06:15)</span>
                    <span className="text-rose-300">75 min • 5 Morning EMUs Cancelled</span>
                  </div>
                  <div className="w-full bg-[#121317] h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[30%] ml-[75%]" />
                  </div>
                </div>
              </div>
            ) : (
              /* RailSuraksha Unified Shadow Block Timeline */
              <div className="space-y-4">
                <div className="p-5 rounded-[12px] bg-amber-950/20 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                  <div className="flex items-center justify-between text-xs font-mono text-amber-300 mb-2">
                    <span className="font-semibold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                      UNIFIED SHADOW BLOCK (02:15 - 04:30)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                      135 MIN SYNCHRONIZED
                    </span>
                  </div>
                  <p className="text-xs text-[#c7c9d1] mb-3">
                    Civil Track Gang, OHE Catenary, and S&T Point Machine teams work simultaneously under a single
                    cryptographically verified corridor lockout.
                  </p>
                  <div className="w-full bg-[#121317] h-3 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full w-[50%] ml-[35%]" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
                  <div className="p-2 rounded bg-[#121317] border border-[#1c1d22] text-[#9194a1]">
                    Track: <span className="text-emerald-400">Welded</span>
                  </div>
                  <div className="p-2 rounded bg-[#121317] border border-[#1c1d22] text-[#9194a1]">
                    OHE: <span className="text-amber-400">Tensioned</span>
                  </div>
                  <div className="p-2 rounded bg-[#121317] border border-[#1c1d22] text-[#9194a1]">
                    S&T: <span className="text-sky-400">Calibrated</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-[#1c1d22] flex items-center justify-between text-xs font-mono text-[#9194a1]">
            <span>Corridor Section: Kurla-Thane (KM 15-33)</span>
            <span className={mode === 'SHADOW' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {mode === 'SHADOW' ? '✓ Zero Passenger Delays' : '✕ 12 Passenger Train Delays'}
            </span>
          </div>
        </div>

        {/* Right Side: KPI Performance Contrast Box */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-4">
          <div className="p-6 rounded-[16px] bg-[#040406] border border-[#1c1d22] flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-[#9194a1] uppercase">Total Line Block Time</div>
              <div className="text-2xl font-bold font-mono text-[#e2e3e9] mt-1">
                {mode === 'SHADOW' ? '2.25 Hours' : '6.50 Hours'}
              </div>
              <div className="text-xs text-[#9194a1] mt-0.5">
                {mode === 'SHADOW' ? '65% reduction in track downtime' : 'Fragmented multi-department slots'}
              </div>
            </div>
            <div className={`text-3xl font-mono font-bold ${mode === 'SHADOW' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {mode === 'SHADOW' ? '-65%' : '+180%'}
            </div>
          </div>

          <div className="p-6 rounded-[16px] bg-[#040406] border border-[#1c1d22] flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-[#9194a1] uppercase">Train Cancellations</div>
              <div className="text-2xl font-bold font-mono text-[#e2e3e9] mt-1">
                {mode === 'SHADOW' ? '0 Cancellations' : '12 Trains Cancelled'}
              </div>
              <div className="text-xs text-[#9194a1] mt-0.5">
                {mode === 'SHADOW' ? '100% On-Time Passenger Transit' : 'Severe morning peak backlog'}
              </div>
            </div>
            <div className={`text-3xl font-mono font-bold ${mode === 'SHADOW' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {mode === 'SHADOW' ? '0' : '12'}
            </div>
          </div>

          <div className="p-6 rounded-[16px] bg-[#040406] border border-[#1c1d22] flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-[#9194a1] uppercase">Safety Verification</div>
              <div className="text-2xl font-bold font-mono text-[#e2e3e9] mt-1">
                {mode === 'SHADOW' ? 'Kavach SIL-4 Locked' : 'Manual Paper Slips'}
              </div>
              <div className="text-xs text-[#9194a1] mt-0.5">
                {mode === 'SHADOW' ? 'Cryptographic SHA-256 Authority' : 'Prone to human miscommunication'}
              </div>
            </div>
            <div className="text-3xl font-mono font-bold text-sky-400">
              {mode === 'SHADOW' ? 'SIL-4' : 'SIL-0'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default ShadowBlockComparison;

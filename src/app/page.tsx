// src/app/page.tsx
'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { LandingNavbar } from '@/components/Landing/LandingNavbar';
import { LandingFooter } from '@/components/Landing/LandingFooter';
import { ShadowBlockComparison } from '@/components/Landing/ShadowBlockComparison';
import { MultiDeptSynergyMatrix } from '@/components/Landing/MultiDeptSynergyMatrix';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Dynamically import 3D Hero to prevent SSR WebGL hydration issues
const ShadowBlockHero3D = dynamic(() => import('@/components/Landing/ShadowBlockHero3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] lg:h-[620px] bg-[#08080a] rounded-[24px] border border-[#1c1d22] flex flex-col items-center justify-center text-cyan-400 font-mono text-xs gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      <span>Initializing WebGL 3D Corridor Digital Twin...</span>
    </div>
  ),
});

export default function RootLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-badge', {
        y: 15,
        opacity: 0,
        duration: 0.6,
      })
        .from(
          '.hero-title',
          {
            y: 25,
            opacity: 0,
            duration: 0.8,
          },
          '-=0.3'
        )
        .from(
          '.hero-subtext',
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.4'
        )
        .from(
          '.hero-cta',
          {
            y: 15,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.3'
        )
        .from(
          '.hero-3d-box',
          {
            scale: 0.96,
            opacity: 0,
            duration: 1.0,
            ease: 'expo.out',
          },
          '-=0.5'
        );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-[#08080a] text-[#e2e3e9] selection:bg-blue-500/30">
      {/* Sleek Top Navigation */}
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-10">
          {/* Eyebrow */}
          <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-[#121317] border border-[#1c1d22] text-[11px] font-mono text-amber-400 mb-5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>SIH-26027 • Autonomous Corridor Maintenance Intelligence</span>
          </div>

          {/* Headline (Max 2 lines, display font) */}
          <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-[#e2e3e9] leading-[1.1]">
            Autonomous Shadow Block Engine for Indian Railways
          </h1>

          {/* Subtext (<= 20 words for anti-slop punchiness) */}
          <p className="hero-subtext text-base sm:text-lg text-[#9194a1] mt-4 max-w-xl mx-auto leading-relaxed">
            Eliminate track maintenance congestion by bundling multi-department works into zero-delay corridor shadow windows.
          </p>

          {/* CTAs */}
          <div className="hero-cta flex flex-wrap items-center justify-center gap-4 mt-7">
            <Link
              href="/admin"
              className="px-6 py-3 rounded-[6px] bg-[#2B7FFF] hover:bg-[#2563EB] text-white text-xs font-mono font-semibold transition-all shadow-[0_0_20px_rgba(43,127,255,0.4)] active:scale-[0.98]"
            >
              Enter Command Cockpit (/admin) →
            </Link>
            <Link
              href="/planner"
              className="px-6 py-3 rounded-[6px] bg-[#121317] hover:bg-[#1c1d22] text-[#e2e3e9] text-xs font-mono font-semibold border border-[#1c1d22] hover:border-[#2e3038] transition-all"
            >
              Open Corridor String Chart
            </Link>
          </div>
        </div>

        {/* 3D WebGL Hero Digital Twin Container */}
        <div id="digital-twin" className="hero-3d-box mt-4">
          <ShadowBlockHero3D />
        </div>
      </section>

      {/* Interactive Shadow Block Comparison Simulator */}
      <div id="shadow-block">
        <ShadowBlockComparison />
      </div>

      {/* Multi-Department Gang Synergy Matrix */}
      <div id="synergy-matrix">
        <MultiDeptSynergyMatrix />
      </div>

      {/* System Architecture & SIL-4 Guardrails Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-[20px] bg-gradient-to-b from-[#121317] to-[#040406] border border-[#1c1d22] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#ae9357] mb-2">
              Mission-Critical Operational Security
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-medium text-[#e2e3e9]">
              Cryptographically Sealed & Kavach Interlocked
            </h3>
            <p className="text-sm text-[#9194a1] mt-2">
              Every maintenance window requires multi-signature biometric consensus between the Station Master, Section Controller,
              and Field Gang Leads before track circuits transition to protective lockout.
            </p>
          </div>

          <Link
            href="/auditor"
            className="px-6 py-3 rounded-[6px] bg-[#1c1d22] hover:bg-[#2e3038] text-[#e2e3e9] border border-[#2e3038] text-xs font-mono font-semibold whitespace-nowrap transition-all"
          >
            View Cryptographic Audit Ledger →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}

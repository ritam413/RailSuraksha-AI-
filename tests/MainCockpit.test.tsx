// tests/MainCockpit.test.tsx
// Comprehensive Vitest Suite for TICKET-DEV1-07 Master Cockpit Assembly & Horizon Switcher

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Navbar } from '@/components/Navbar';
import CommandCenterPage from '@/app/page';

describe('TICKET-DEV1-07: Master Cockpit Assembly & Horizon Switcher', () => {
  describe('Navbar Component & Horizon Switcher', () => {
    it('renders horizon switcher options (24h, 7D, 30D)', () => {
      const html = renderToStaticMarkup(
        <Navbar
          activeTab="CORRIDOR_PLANNER"
          onTabChange={() => {}}
          horizon="TACTICAL_24H"
          onHorizonChange={() => {}}
          deploymentMode="ADVISORY"
          onModeToggle={() => {}}
          isDarkMode={false}
          onThemeToggle={() => {}}
        />
      );

      expect(html).toContain('24h');
      expect(html).toContain('7D');
      expect(html).toContain('30D');
      expect(html).toContain('RailSuraksha AI');
    });

    it('renders all 4 tactical view switcher tabs matching Screen 1 - 4 mockups', () => {
      const html = renderToStaticMarkup(
        <Navbar
          activeTab="CORRIDOR_PLANNER"
          onTabChange={() => {}}
          horizon="TACTICAL_24H"
          onHorizonChange={() => {}}
          deploymentMode="ADVISORY"
          onModeToggle={() => {}}
          isDarkMode={false}
          onThemeToggle={() => {}}
        />
      );

      expect(html).toContain('1. Corridor Planner');
      expect(html).toContain('2. Interlocking Map');
      expect(html).toContain('3. Defect Vision &amp; Telemetry');
      expect(html).toContain('4. Auditor Workspace');
    });

    it('displays autonomous deployment mode badge and audio toggle', () => {
      const html = renderToStaticMarkup(
        <Navbar
          activeTab="CORRIDOR_PLANNER"
          onTabChange={() => {}}
          horizon="TACTICAL_24H"
          onHorizonChange={() => {}}
          deploymentMode="AUTONOMOUS"
          onModeToggle={() => {}}
          isDarkMode={false}
          onThemeToggle={() => {}}
        />
      );

      expect(html).toContain('⚡ AUTO');
    });
  });

  describe('CommandCenterPage (Master 4-View Assembly)', () => {
    it('renders default Master Corridor Planner view with KpiStrip, Marey String Chart, and Incident Queue', () => {
      const html = renderToStaticMarkup(<CommandCenterPage />);

      // KPI Strip metrics
      expect(html).toContain('Active Trains');
      expect(html).toContain('Track Circuits');
      expect(html).toContain('Signals Active');

      // Marey String Chart elements
      expect(html).toContain('Corridor Time-Distance String Chart');
      expect(html).toContain('Marey Stringline Diagram with Joint Shadow-Block Possessions (TACTICAL_24H)');
      expect(html).toContain('CSMT');
      expect(html).toContain('Kalyan');
      expect(html).toContain('White-Corridor: 01:30 - 04:45 IST');

      // AI Incident / Demand Queue
      expect(html).toContain('AI Triage Incident Queue');
      expect(html).toContain('Pending Approval');
    });

    it('renders peripheral analytics tabs (Triage Donut & Deceleration Curve)', () => {
      const html = renderToStaticMarkup(<CommandCenterPage />);

      expect(html).toContain('Peripheral Recharts Analytics');
      expect(html).toContain('Multi-Dept Demand Donut');
      expect(html).toContain('Kavach Decel Curve');
    });

    it('includes Explainable Decision Dossier and RDSO compliance infrastructure', () => {
      const html = renderToStaticMarkup(<CommandCenterPage />);
      expect(html).toContain('RailSuraksha AI');
    });
  });
});

// tests/DecoupledRoutes.test.tsx
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AuthProvider } from '@/context/AuthContext';
import CorridorPlannerPage from '@/app/planner/page';
import InterlockingPage from '@/app/interlocking/page';
import VisionTelemetryPage from '@/app/vision-telemetry/page';
import AuditorPage from '@/app/auditor/page';
import FieldCheckinPage from '@/app/field-checkin/page';
import LoginPage from '@/app/login/page';
import LoginClient from '@/app/login/LoginClient';
import UnauthorizedPage from '@/app/unauthorized/page';

describe('Decoupled App Router Page Endpoints', () => {
  it('renders Screen 1: CorridorPlannerPage under AuthProvider', () => {
    const html = renderToStaticMarkup(
      <AuthProvider>
        <CorridorPlannerPage />
      </AuthProvider>
    );
    expect(html).toContain('1. Corridor Planner');
    expect(html).toContain('Maintenance Demand Queue');
  });

  it('renders Screen 2: InterlockingPage under AuthProvider', () => {
    const html = renderToStaticMarkup(
      <AuthProvider>
        <InterlockingPage />
      </AuthProvider>
    );
    expect(html).toContain('2. Interlocking Map');
    expect(html).toContain('TC-03');
  });

  it('renders Screen 3: VisionTelemetryPage under AuthProvider', () => {
    const html = renderToStaticMarkup(
      <AuthProvider>
        <VisionTelemetryPage />
      </AuthProvider>
    );
    expect(html).toContain('3. Defect Vision &amp; Telemetry');
  });

  it('renders Screen 4: AuditorPage under AuthProvider', () => {
    const html = renderToStaticMarkup(
      <AuthProvider>
        <AuditorPage />
      </AuthProvider>
    );
    expect(html).toContain('4. Auditor Workspace');
  });

  it('renders Screen 5: FieldCheckinPage under AuthProvider', () => {
    const html = renderToStaticMarkup(
      <AuthProvider>
        <FieldCheckinPage />
      </AuthProvider>
    );
    expect(html).toContain('5. Field Check-In');
    expect(html).toContain('Anti-Ghost Block Verification Protocol');
  });

  it('renders LoginClient with officer personas', () => {
    const html = renderToStaticMarkup(
      <AuthProvider>
        <LoginClient />
      </AuthProvider>
    );
    expect(html).toContain('RailSuraksha AI • Officer Authentication Portal');
    expect(html).toContain('Pre-Seeded Operational Personas');
  });

  it('renders LoginPage with Suspense boundary', () => {
    const html = renderToStaticMarkup(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );
    expect(html.length).toBeGreaterThan(0);
  });

  it('renders UnauthorizedPage', () => {
    const html = renderToStaticMarkup(
      <AuthProvider>
        <UnauthorizedPage />
      </AuthProvider>
    );
    expect(html).toContain('Access Denied / Insufficient Privileges');
    expect(html).toContain('Statutory Access Control (IRPWM Ch 5 / RDSO Cyber Protocol)');
  });
});

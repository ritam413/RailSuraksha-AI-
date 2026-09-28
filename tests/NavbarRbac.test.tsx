// tests/NavbarRbac.test.tsx
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';

describe('Navbar RBAC Dynamic Tab Filtering & Role Switcher', () => {
  it('renders dynamic tactical view links matching all 5 operational screens in ADMIN mode', () => {
    const html = renderToStaticMarkup(
      <AuthProvider>
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
      </AuthProvider>
    );

    expect(html).toContain('1. Corridor Planner');
    expect(html).toContain('2. Interlocking Map');
    expect(html).toContain('3. Defect Vision &amp; Telemetry');
    expect(html).toContain('4. Auditor Workspace');
    expect(html).toContain('5. Field Check-In');
    expect(html).toContain('href="/planner"');
    expect(html).toContain('href="/interlocking"');
    expect(html).toContain('href="/vision-telemetry"');
    expect(html).toContain('href="/auditor"');
    expect(html).toContain('href="/field-checkin"');
  });

  it('renders role switcher persona dropdown trigger', () => {
    const html = renderToStaticMarkup(
      <AuthProvider>
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
      </AuthProvider>
    );

    expect(html).toContain('Active Officer Persona');
    expect(html).toContain('DRM-HQ');
  });
});

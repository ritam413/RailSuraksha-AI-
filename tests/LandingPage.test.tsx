// tests/LandingPage.test.tsx
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ShadowBlockComparison } from '../src/components/Landing/ShadowBlockComparison';
import { MultiDeptSynergyMatrix } from '../src/components/Landing/MultiDeptSynergyMatrix';
import { LandingNavbar } from '../src/components/Landing/LandingNavbar';
import { LandingFooter } from '../src/components/Landing/LandingFooter';

describe('Landing Page Components', () => {
  it('renders LandingNavbar with brand title, status, and launch CTA', () => {
    const html = renderToStaticMarkup(<LandingNavbar />);
    expect(html).toContain('RailSuraksha AI');
    expect(html).toContain('SIH-26027');
    expect(html).toContain('Kavach SIL-4 Active');
    expect(html).toContain('Launch Command Cockpit');
  });

  it('renders ShadowBlockComparison with comparison metrics and timeline', () => {
    const html = renderToStaticMarkup(<ShadowBlockComparison />);
    expect(html).toContain('Fragmented Traffic Disruption vs. AI Shadow Block');
    expect(html).toContain('Legacy Maintenance');
    expect(html).toContain('RailSuraksha AI Shadow Block');
    expect(html).toContain('UNIFIED SHADOW BLOCK');
    expect(html).toContain('135 MIN SYNCHRONIZED');
  });

  it('renders MultiDeptSynergyMatrix with all 4 department nodes', () => {
    const html = renderToStaticMarkup(<MultiDeptSynergyMatrix />);
    expect(html).toContain('Four Specialized Gangs. One Unified Shadow Block.');
    expect(html).toContain('Traction Distribution');
    expect(html).toContain('Civil Engineering');
    expect(html).toContain('Signal &amp; Telecom');
    expect(html).toContain('Kavach SIL-4 Onboard System');
    expect(html).toContain('POWER ISOLATION');
  });

  it('renders LandingFooter with compliance note and navigation', () => {
    const html = renderToStaticMarkup(<LandingFooter />);
    expect(html).toContain('RailSuraksha AI');
    expect(html).toContain('Command Center');
    expect(html).toContain('RDSO / CENELEC EN 50128 SIL-4 Architecture');
  });
});

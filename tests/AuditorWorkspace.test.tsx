// tests/AuditorWorkspace.test.tsx
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AuditorWorkspace } from '@/components/Auditor/AuditorWorkspace';

describe('AuditorWorkspace Component (Screen 4)', () => {
  it('renders regulatory terminal header with CRS & RDSO compliance badges', () => {
    const html = renderToStaticMarkup(<AuditorWorkspace />);
    expect(html).toContain('Auditor Workspace &amp; Regulatory Terminal (Screen 4)');
    expect(html).toContain('CRS &amp; RDSO COMPLIANT');
    expect(html).toContain('RFC 8785 IMMUTABLE LEDGER');
  });

  it('renders immutable decision ledger with multi-department records and search input', () => {
    const html = renderToStaticMarkup(<AuditorWorkspace />);
    expect(html).toContain('Immutable Decision Ledger');
    expect(html).toContain('Search Block ID, station, officer, or section...');
    expect(html).toContain('#JB-2026-0926-01');
    expect(html).toContain('Dadar TC-03 Joint Track + OHE Shadow Block');
    expect(html).toContain('Saved 85 mins (38.4%)');
  });

  it('renders SHA-256 Cryptographic Audit Seal with verified tamper-free badge', () => {
    const html = renderToStaticMarkup(<AuditorWorkspace />);
    expect(html).toContain('SHA-256 Cryptographic Audit Seal');
    expect(html).toContain('VERIFIED TAMPER-FREE');
    expect(html).toContain('[VERIFY SHA-256 HASH]');
    expect(html).toContain('📋 COPY TOKEN');
    expect(html).toContain('[EXPORT FORM 14B (JSON)]');
  });

  it('renders 4-step explainable reasoning pipeline and penetration testing panel', () => {
    const html = renderToStaticMarkup(<AuditorWorkspace />);
    expect(html).toContain('4-Step Reasoning Pipeline');
    expect(html).toContain('Multi-Source Defect Ingestion');
    expect(html).toContain('Traffic Conflict &amp; White-Corridor Search');
    expect(html).toContain('Joint Shadow-Block Co-Location Bundling');
    expect(html).toContain('Safety Dissemination &amp; Interlocking Sanction');
    expect(html).toContain('Auditor Penetration &amp; Tamper Test');
    expect(html).toContain('Simulate Unauthorized Payload Tamper');
  });
});

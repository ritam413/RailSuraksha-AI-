// tests/BlockRequisitionModal.test.tsx
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BlockRequisitionModal } from '../src/components/Requisition/BlockRequisitionModal';
import { MaintenanceDemand } from '../src/types/apiContracts';

describe('Direct Block Requisition Portal (TDMS, SMMS, TMS)', () => {
  it('renders correctly when open with default TDMS department presets', () => {
    const handleSubmit = vi.fn();
    const handleClose = vi.fn();

    const html = renderToStaticMarkup(
      <BlockRequisitionModal
        isOpen={true}
        onClose={handleClose}
        onSubmitDemand={handleSubmit}
        initialDepartment="TDMS_ELECTRICAL"
      />
    );

    expect(html).toContain('Direct Block Requisition Portal');
    expect(html).toContain('Auto-BDMS v3.1');
    expect(html).toContain('TDMS');
    expect(html).toContain('SMMS');
    expect(html).toContain('TMS');
    expect(html).toContain('25kV AC Power Block?');
    expect(html).toContain('AI Feasibility &amp; Corridor Optimization Preview');
    expect(html).toContain('Submit Block Requisition');
  });

  it('renders SMMS Signal department statutory notice and S&T presets', () => {
    const html = renderToStaticMarkup(
      <BlockRequisitionModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmitDemand={vi.fn()}
        initialDepartment="SMMS_SIGNAL"
      />
    );

    expect(html).toContain('Form S&amp;T/T-351');
    expect(html).toContain('TC-03');
    expect(html).toContain('UP SLOW');
  });

  it('renders TMS Civil department statutory notice and P-Way presets', () => {
    const html = renderToStaticMarkup(
      <BlockRequisitionModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmitDemand={vi.fn()}
        initialDepartment="TMS_CIVIL"
      />
    );

    expect(html).toContain('IRPWM 2020');
    expect(html).toContain('Track Tamping');
    expect(html).toContain('value="14.8"');
  });

  it('renders chainage input with step and number attributes for raw input handling', () => {
    const html = renderToStaticMarkup(
      <BlockRequisitionModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmitDemand={vi.fn()}
        initialDepartment="TDMS_ELECTRICAL"
      />
    );

    expect(html).toContain('KM Linear Chainage');
    expect(html).toContain('step="0.05"');
    expect(html).toContain('value="14.8"');
  });
});

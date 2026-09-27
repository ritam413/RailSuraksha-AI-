import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CorridorTwin3D } from '@/components/Three/CorridorTwin3D';
import { MOCK_JOINT_BLOCKS, MOCK_TRAIN_SCHEDULES } from '@/lib/mockData';

describe('TICKET-01: 3D Quadrupled Corridor Twin Component', () => {
  it('renders the 3D corridor container with test ID and HUD banner', () => {
    const html = renderToStaticMarkup(
      <CorridorTwin3D
        activeBlocks={MOCK_JOINT_BLOCKS}
        trainPaths={MOCK_TRAIN_SCHEDULES}
      />
    );

    expect(html).toContain('data-testid="3d-corridor-twin"');
    expect(html).toContain('3D QUADRUPLED CORRIDOR TWIN');
    expect(html).toContain('CSMT → KYN');
  });

  it('renders active train capsule telemetry badges', () => {
    const html = renderToStaticMarkup(
      <CorridorTwin3D
        activeBlocks={MOCK_JOINT_BLOCKS}
        trainPaths={MOCK_TRAIN_SCHEDULES}
      />
    );

    expect(html).toContain('ACTIVE TRAIN CAPSULES');
    expect(html).toContain('12051 Jan Shatabdi');
    expect(html).toContain('12137 Punjab Mail');
  });

  it('renders nocturnal shadow block indicator and CP-SAT solver latency badge', () => {
    const html = renderToStaticMarkup(
      <CorridorTwin3D
        activeBlocks={MOCK_JOINT_BLOCKS}
        trainPaths={MOCK_TRAIN_SCHEDULES}
        selectedBlockId="JB-2026-0926-01"
      />
    );

    expect(html).toContain('NOCTURNAL SHADOW BLOCK');
    expect(html).toContain('Google OR-Tools CP-SAT');
    expect(html).toContain('View Decision Dossier');
  });

  it('renders interaction guidance HUD for 3D orbit and zoom controls', () => {
    const html = renderToStaticMarkup(
      <CorridorTwin3D
        activeBlocks={MOCK_JOINT_BLOCKS}
        trainPaths={MOCK_TRAIN_SCHEDULES}
      />
    );

    expect(html).toContain('Orbit: Drag');
    expect(html).toContain('Zoom: Scroll');
  });
});

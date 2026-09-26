import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CorridorStringChart, STATIONS } from '@/components/Planner/CorridorStringChart';
import { MOCK_JOINT_BLOCKS, MOCK_TRAIN_SCHEDULES } from '@/lib/mockData';

describe('TICKET-DEV1-03: Dual-Layer SVG Corridor Time-Distance String Chart', () => {
  it('renders all 5 reference corridor stations (CSMT to Kalyan)', () => {
    const html = renderToStaticMarkup(
      <CorridorStringChart
        activeBlocks={MOCK_JOINT_BLOCKS}
        trainPaths={MOCK_TRAIN_SCHEDULES}
        onSelectBlock={() => {}}
      />
    );

    STATIONS.forEach((stn) => {
      expect(html).toContain(stn.name);
    });
  });

  it('renders all active joint shadow maintenance blocks with downtime savings text', () => {
    const html = renderToStaticMarkup(
      <CorridorStringChart
        activeBlocks={MOCK_JOINT_BLOCKS}
        trainPaths={MOCK_TRAIN_SCHEDULES}
        selectedBlockId="JB-2026-0926-01"
        onSelectBlock={() => {}}
      />
    );

    expect(html).toContain('⚡ SHADOW BLOCK');
    expect(html).toContain('85m Saved');
  });

  it('renders train trajectories with train numbers and SVG polylines', () => {
    const html = renderToStaticMarkup(
      <CorridorStringChart
        activeBlocks={MOCK_JOINT_BLOCKS}
        trainPaths={MOCK_TRAIN_SCHEDULES}
        onSelectBlock={() => {}}
      />
    );

    MOCK_TRAIN_SCHEDULES.forEach((train) => {
      expect(html).toContain(train.trainNumber);
    });
    expect(html).toContain('<polyline');
  });

  it('highlights the selected block with increased stroke and opacity', () => {
    const html = renderToStaticMarkup(
      <CorridorStringChart
        activeBlocks={MOCK_JOINT_BLOCKS}
        trainPaths={MOCK_TRAIN_SCHEDULES}
        selectedBlockId="JB-2026-0926-01"
        onSelectBlock={() => {}}
      />
    );

    // Checks selected block rect styling
    expect(html).toContain('stroke-width="2.5"');
    expect(html).toContain('fill-opacity="0.28"');
  });

  it('renders the white corridor maintenance banner', () => {
    const html = renderToStaticMarkup(
      <CorridorStringChart
        activeBlocks={MOCK_JOINT_BLOCKS}
        trainPaths={MOCK_TRAIN_SCHEDULES}
        onSelectBlock={() => {}}
      />
    );

    expect(html).toContain('White-Corridor: 01:30 - 04:45 IST');
  });
});

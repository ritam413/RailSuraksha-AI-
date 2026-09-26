# 📋 DEV2 KPI Strip Production Audit & Optimization Guide

**Target Ticket:** [`docs/ticket/TICKET-DEV2-01-kpi-strip-metrics.md`](file:///c:/Users/RyzenShine/Railsuraksha/RailSuraksha-AI-/docs/ticket/TICKET-DEV2-01-kpi-strip-metrics.md)  
**Implementation Plan Reference:** [`docs/ticket/IMPLEMENTATION-DEV2-01-kpi-strip-metrics.md`](file:///c:/Users/RyzenShine/Railsuraksha/RailSuraksha-AI-/docs/ticket/IMPLEMENTATION-DEV2-01-kpi-strip-metrics.md)  
**Interactive Mockup:** [`docs/dev2mockup/kpi_strip_mockup.html`](file:///c:/Users/RyzenShine/Railsuraksha/RailSuraksha-AI-/docs/dev2mockup/kpi_strip_mockup.html)

---

## 🎯 1. Overview & Purpose

This document summarizes the Forward Deployed Engineering (FDE) audit and design fixes for **Developer 2 (UI Layouts & Operational Metrics)** on the **6-Metric IRIS AI Block Planning KPI Strip**.

---

## 🚨 2. Production Bottlenecks & Failure Modes

| # | Bottleneck / Production Risk | Failure Mode in Live Operations | Proposed Architectural Fix |
|---|---|---|---|
| **1** | **Static Badges vs. Dynamic Thresholds** | The plan hardcodes badges (e.g. `"TARGET > 95%"`). If `assetAvailabilityIndexPct` drops to `91.2%` (below the 95% IRPWM threshold), the badge still shows `"TARGET > 95%"` in blue instead of flashing an amber/red breach alert (`"CRITICAL: 3.8% DEFICIT"`). | Implement a **Threshold-Driven Badge Evaluator** (`getDynamicBadgeState()`) that dynamically derives badge text, color, and pulse state from live values. |
| **2** | **Floating Point & Layout Wrap on Narrow Breakpoints** | Unsanitized floats (e.g. `38.419201%`) or 6 cards squeezed into `lg:grid-cols-6` on typical railway controller 1366×768 split-screens will truncate or wrap labels across multiple lines. | Standardize all numeric values with `.toFixed(1)`, apply strict `truncate`, and upgrade the grid to `grid-cols-2 md:grid-cols-3 xl:grid-cols-6` with min-width constraints. |
| **3** | **Headway Time Rollover & Negative Duration** | When an active maintenance block is currently executing, `whiteCorridorHeadwayMinutes` can be `0` or negative. The existing plan returns `"0h 00m"` without contextual indication that a block is currently active. | Enhance `formatHeadwaySafe()` to return `"00m (In Block)"` or `"3h 15m"` with countdown awareness. |
| **4** | **Unidirectional Isolation (No Master Cockpit Cross-Filtering)** | In `TICKET-DEV1-05` (Master Cockpit), clicking a KPI card (e.g. *"Pending Demands"*) must filter the triage queue below to pending civil/electrical tickets. The planned component lacked selection state and event dispatching. | Add optional `selectedMetricId?: string` and `onSelectMetric?: (id: string) => void` props to `KpiStrip` for deep bidirectional filtering. |
| **5** | **Zero Visual Trend Context vs. Legacy Baseline** | As seen in modern operational systems (and the Ovalent design reference), operators need immediate delta visibility (e.g. `+6% vs last week`, `↑ 1.4h vs unbundled`). Raw numbers alone do not demonstrate CP-SAT optimization ROI. | Add secondary comparison metrics (`trendDelta`, `trendDirection`, `comparisonLabel`) to each card. |

---

## 🛠️ 3. Recommended TypeScript Helper Functions

```typescript
import { CorridorKpiMetrics } from '@/types/apiContracts';

// Pure, safe headway formatter
export function formatHeadwaySafe(minutes: number | undefined): string {
  if (minutes === undefined || isNaN(minutes) || minutes <= 0) {
    return '0h 00m';
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
}

// Pure, zero-padded count formatter
export function formatCountSafe(count: number | undefined, suffix?: string): string {
  const safeCount = Math.max(0, count || 0);
  const padded = safeCount < 10 ? `0${safeCount}` : `${safeCount}`;
  return suffix ? `${padded} ${suffix}` : padded;
}

// Format percentages with 1 decimal precision
export function formatPercentageSafe(val: number | undefined): string {
  if (val === undefined || isNaN(val)) return '0.0%';
  return `${val.toFixed(1)}%`;
}
```

---

## 🎨 4. Design Discipline Rules (Mintlify Compliance)

1. **Card Container**: `#FFFFFF` background, `1px solid #D0DFEE` border, `rounded-[16px]`.
2. **Inner Badges & Tags**: Strictly `rounded-[4px]`, zero pill buttons (`rounded-full` forbidden on badges).
3. **Typography**:
   - Title: `text-xs font-semibold text-slate-500`
   - Numeric Values: `text-2xl font-bold font-mono text-slate-800 tracking-tight`
   - Unit: `text-xs font-semibold text-slate-500`
   - Trend Delta: `text-[11px] font-semibold`

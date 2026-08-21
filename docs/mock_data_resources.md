# RailSuraksha AI — Mock Data & Video Stream Resources Guide

> **Location:** `docs/mock_data_resources.md`  
> **Purpose:** Hackathon mock datasets, video stream URLs, live ticker generators, and open-source dataset resources.  
> **Last Updated:** 2026-08-21  

---

## 🚀 1. Ready-to-Use Local Mock Dataset (`src/lib/mockData.ts`)

We have generated a zero-dependency, fully-typed TypeScript mock dataset in `src/lib/mockData.ts`. Any component or API route can import it immediately:

```typescript
import {
  MOCK_INTERLOCKING_STATE,
  MOCK_INCIDENTS,
  MOCK_EBD_CALCULATION,
  MOCK_PLATFORM_HOLD_STATE,
  MOCK_DECISION_LOG,
  DEMO_VIDEO_STREAMS
} from '@/lib/mockData';
```

---

## 📹 2. Demo Video Stream URLs (Royalty-Free MP4 Feeds)

| Stream Target | Purpose / Visual Content | CDN Direct MP4 URL |
| :--- | :--- | :--- |
| **Loco-Cab Forward View** | Front-facing camera moving along railway tracks (for YOLOv11 bounding boxes) | `https://assets.mixkit.co/videos/preview/mixkit-train-passing-through-a-green-landscape-42211-large.mp4` |
| **Platform Gateway CCTV** | Station entrance crowded staircase (Pillar #1 entrance camera for crowd density $\rho$) | `https://assets.mixkit.co/videos/preview/mixkit-crowd-of-people-walking-in-a-train-station-41553-large.mp4` |
| **OHE Pantograph Camera** | Overhead catenary wire & high-speed pantograph view | `https://assets.mixkit.co/videos/preview/mixkit-electric-train-moving-fast-on-railroad-tracks-43542-large.mp4` |

---

## ⚡ 3. Live Ticker / Mock WebSocket Generator Pattern

If you want live real-time ticking metrics (speeds, countdown timers, changing signal colors) during your hackathon demo without setting up a real WebSocket server, Developer 2 can use this lightweight client hook pattern:

```typescript
// Example: Live ticking hook for demo telemetry
import { useState, useEffect } from 'react';
import { MOCK_INTERLOCKING_STATE } from '@/lib/mockData';

export function useLiveInterlocking() {
  const [data, setData] = useState(MOCK_INTERLOCKING_STATE);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        timestamp: new Date().toLocaleTimeString() + ' IST',
        // Simulate subtle speed variations
        circuits: prev.circuits.map((c) => ({
          ...c,
          isOccupied: c.circuitId === 'BLK-101' ? true : c.isOccupied
        }))
      }));
    }, 1000); // 1-second tick

    return () => clearInterval(interval);
  }, []);

  return data;
}
```

---

## 🌐 4. Open-Source External Datasets & Machine Learning Resources

If you wish to train or demonstrate real YOLOv11 models, here are high-trust open-source dataset repositories:

1. **Roboflow Universe — Railway Track & Obstacle Detection:**
   - *URL:* `https://universe.roboflow.com/search?q=railway+track+obstacle`
   - *Content:* 5,000+ annotated images of rail fractures, boulders, cattle, and foreign track objects in YOLOv8/v11 format.

2. **Kaggle — Indian Railways Operations & Station Datasets:**
   - *URL:* `https://www.kaggle.com/datasets?search=indian+railways`
   - *Content:* Indian Railways train schedule, station code maps, track interlocking section metadata.

3. **OpenStreetMap OpenRailwayMap API:**
   - *URL:* `https://www.openrailwaymap.org/`
   - *Content:* Live vector GIS track lines, signal positions, and turnout switch coordinates.

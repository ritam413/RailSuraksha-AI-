# RailSuraksha AI — Full Conversation History, Workflow & Project Specification

> **Project Name:** RailSuraksha AI (रेल-सुरक्षा)
> **Location:** `d:\Games\Hckthons\RailSuraksha_AI`
> **Target Framework:** Next.js 16, React 19, Tailwind CSS v4, HTML5 Canvas / SVG, ONNX Runtime.

---

## 1. EXECUTIVE SUMMARY & CHAT HISTORY SUMMARY

Over the course of this architectural and design session, we established the complete system blueprint, user specifications, multi-agent workflow, design tokens, and frontend implementation prompts for **RailSuraksha AI** — a national-grade railway safety & incident intelligence platform.

### Core Problems Solved:
1. **Adjacent-Platform Overcrowding & Stampede Avoidance:** Prevents simultaneous arrivals on adjacent platforms (e.g., Platforms 17 & 18) sharing a foot-over-bridge or staircase by enforcing a **5-Minute Deterministic Hold Floor** dynamically extended by an ML crowd-density model.
2. **Continuous Visual Track Inspection:** Complements manual/vehicular USFD passes by using locomotive forward cameras to detect surface-level fractures, missing fishplates, boulders, and cattle.
3. **Deterministic Emergency Braking:** Connects vision obstruction detection to an RDSO-certified physics stopping distance formula ($D_{\text{stop}}$) to trigger Kavach-compatible automatic brake solenoid commands.

---

## 2. OFFICIAL MULTI-AGENT WORKFLOW

The project follows an official multi-agent execution pipeline:

```mermaid
graph TD
    Cameras["📹 Edge Cameras<br/>(Loco Cam / Station CCTV / OHE Cam)"] --> Anomaly{"⚠️ Anomaly Detected?"}
    Anomaly -->|Yes| Triage["🤖 Triage Agent<br/>(Classifies & Scores Severity)"]
    
    Triage -->|Critical| Kavach["🛡️ Kavach Braking Agent<br/>(RDSO Physics EBD Calc)"]
    Triage -->|Moderate| Dispatch["`Section Dispatch Agent`<br/>(Reroutes & 5-Min Hold)"]
    Triage -->|Low| Audit["📋 Risk Audit Agent<br/>(Logs & Crew Duty Check)"]

    Kavach --> Command["💻 Command Center Dashboard<br/>(Mission Control & Track GIS)"]
    Dispatch --> Command
    Audit --> Command

    Command --> Mode{"⚙️ Deployment Mode"}
    Mode -->|Advisory Mode (Phase 1)| Review["👤 Dispatcher Reviews & Approves"]
    Mode -->|Autonomous Mode (Post-RDSO Cert)| Auto["⚡ Action Auto-Executed"]

    Review --> Log["📑 Explainable Decision Log Generated"]
    Auto --> Log
    Log --> Inspector["👷 Auditor / Maintenance Engineer"]
    Inspector --> Close["✅ Incident Closed & Compliance Report Filed"]
```

### Specialized Agents & Roles:
- **Triage Agent:** Classifies anomalies into `CRITICAL`, `MODERATE`, or `LOW` severity tiers with confidence scores.
- **Kavach Braking Agent (Critical):** Evaluates RDSO stopping distance ($D_{\text{stop}}$) vs obstacle distance ($D_{\text{obstacle}}$) and dispatches auto-brake commands.
- **Section Dispatch Agent (Moderate):** Reroutes trains across track blocks and locks adjacent platform signals for 5 minutes + ML extension.
- **Risk Audit Agent (Low):** Logs low-priority operational events and verifies driver/crew duty hours.
- **Station Master / Dispatcher (Human Role):** Operates under **Advisory Mode (Phase 1)** to review and manually approve/reject AI actions.
- **Auditor / Maintenance Engineer (Human Role):** Reviews transparent explainable decision logs and closes compliance reports.

---

## 3. DESIGN SYSTEM & LIGHT-BLUE THEME TOKENS

The UI uses a **Pristine Light-Blue Command Center Theme** built on Mintlify layout discipline:

| Token Name | Hex Code | Purpose / Visual Application |
| :--- | :--- | :--- |
| **`light-blue-canvas`** | `#F0F6FC` | **Surface 0:** Atmospheric Light Ice-Blue background canvas behind all panels |
| **`card-white`** | `#FFFFFF` | **Surface 1:** Pure white card & panel background layer sitting above canvas |
| **`surface-elevated`**| `#E6F0FA` | **Surface 2:** Soft light blue elevated inputs, active table headers, & tab fills |
| **`signal-blue`** | `#2B7FFF` | **Primary Theme Accent:** Active navigation tabs, live timeline indicator, primary CTAs |
| **`twilight-blue`** | `#426188` | **Atmospheric Accent:** Section headers, map rail lines, monospaced metadata borders |
| **`ink-slate`** | `#0F172A` | **Primary Typography:** High-contrast dark slate text for maximum legibility |
| **`border-cool`** | `#D0DFEE` | **Border Hairline:** Subtle cool-blue 1px border on all white panels |
| **`status-green`** | `#059669` | Safe operational state & green signal aspects |
| **`status-amber`** | `#D97706` | Warning state & 5-min grace period holds |
| **`status-red`** | `#DC2626` | Critical incidents & emergency automatic brake actuation |

### Component Geometry & Typography (Mintlify Standards):
- **Geometry:** `4px` radius for buttons/inputs/tags, `16px` radius for cards, `24px` radius for main containers. Zero pill buttons!
- **Typography:** Universal `Inter` font family paired with `JetBrains Mono` for tabular monospaced numbers (Train numbers `12345`, Signal IDs `S-12`, timestamps `08:45:12 IST`, speeds `108 km/h`, and distances `410m`).

---

## 4. THREE CORE OPERATIONAL VIEWS

1. **VIEW 1 — OVERVIEW (Signaling & Interlocking Map):**
   - Single detailed Railway Track Interlocking Diagram (track circuits `BLK-101`, signals `S-12`/`S-14` with Red/Yellow/Green aspects, point switches `P-4A`).
   - Top 6 KPI strip (`#FFFFFF` cards), AI Triage Agent incident queue table with Dispatcher review buttons (`[APPROVE ACTION]`, `[REJECT]`).
2. **VIEW 2 — LOCO-CAB VIEW (Kavach Braking Agent):**
   - Front-facing locomotive camera feed looking down the tracks with YOLOv11 bounding boxes.
   - Interactive 4-Agent Pipeline Canvas Animation triggered by clicking `[APPLY BRAKING FORMULA]` spawning 4 AI subagents sequentially (Vision $\rightarrow$ Telemetry $\rightarrow$ Kavach Physics Engine $D_{\text{stop}}=410\text{m} \rightarrow$ Auto-Brake Actuator).
3. **VIEW 3 — PLATFORM GATEWAY VIEW (Section Dispatch Agent):**
   - Platform Gateway CCTV feed (Camera mounted on Pillar #1 at platform entrance) with YOLOv11 crowd counting & Optical Flow velocity.
   - 5-Minute Deterministic Hold + Dynamic ML Clearance Extension countdown timer (`04:12` remaining) with Station Master manual override controls.

---

## 5. MASTER PROMPT FOR GEMINI 3.1 FLASH CREATE MODE / ANTIGRAVITY

```text
Build a high-fidelity Next.js 16 web application UI for "RailSuraksha AI" based on the official multi-agent safety workflow.

DESIGN SYSTEM & LIGHT-BLUE THEME:
- Canvas Base Surface 0: #F0F6FC (light ice-blue background canvas)
- Panel/Card Surface 1: #FFFFFF (pure white card background with 1px border #D0DFEE)
- Surface 2 Elevated Tabs/Inputs: #E6F0FA (soft light blue tab fills & inputs)
- Primary Accent: #2B7FFF (signal-blue) for active nav tabs, primary CTAs, telemetry highlights, active rings
- Atmospheric Accent: #426188 (twilight-blue) for section headers and railway track lines
- Text Primary: #0F172A (ink-slate) for high-contrast readable titles and body text
- Component Geometry: Mintlify spatial discipline — 4px radius for buttons/inputs/tags, 16px radius for cards, 24px for containers (ZERO pill buttons)
- Typography: Inter universal font family with JetBrains Mono for monospaced train numbers, signal IDs (S-12), timestamps, speeds, and distances.

WORKFLOW & CORE OPERATIONAL VIEWS:
1. GLOBAL NAVBAR & DEPLOYMENT MODE SWITCHER:
   - Persistent top bar with 3 view links + Deployment Mode Switcher dropdown: "Advisory Mode (Phase 1)" [Requires Dispatcher Approval] vs "Autonomous Mode (Post-RDSO Cert)" [Auto-Executed].

2. VIEW 1 — OVERVIEW (Signaling Map & Triage Agent):
   - Top 6 KPI strip (#FFFFFF cards).
   - Single, detailed Railway Track Interlocking Diagram (track circuits BLK-101, signals S-12/S-14 with Red/Yellow/Green aspects, point switches).
   - AI Triage Agent Incident Queue panel showing severity scores (CRITICAL / MODERATE / LOW) and Dispatcher approval buttons.

3. VIEW 2 — LOCO-CAB VIEW (Kavach Braking Agent):
   - Front-facing locomotive camera feed with YOLOv11 bounding boxes for track hazards (boulders, surface cracks).
   - Interactive 4-Agent Pipeline Canvas Animation triggered by clicking [APPLY BRAKING FORMULA] spawning 4 subagents sequentially (Vision -> Telemetry -> Kavach Physics Engine D_stop=410m -> Auto-Brake Actuator).

4. VIEW 3 — PLATFORM GATEWAY VIEW (Section Dispatch Agent):
   - Platform Gateway CCTV feed (Camera on Pillar #1 at platform entrance) with YOLOv11 crowd count & Optical Flow velocity.
   - 5-Minute Deterministic Hold + Dynamic ML Clearance Extension countdown timer (04:12 remaining) with Station Master manual override controls.

5. AUDITOR WORKSPACE — EXPLAINABLE DECISION LOG & REPORTING:
   - Incident summary modal/drawer displaying the step-by-step explainable AI decision log (Triage -> Kavach Braking -> Dispatcher Review -> Execution Handoff -> Outcome) with [CLOSE INCIDENT & FILE REPORT] button.

EXCLUSIONS: Do NOT build any coach interior seat plans or individual passenger tracking. Keep design crisp, operational, and focused on multi-agent railway safety.
```

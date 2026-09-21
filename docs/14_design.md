# RailSuraksha AI — Design System & Visual Style Guide (DESIGN.md)

**System Name:** RailSuraksha AI (Auto-BDMS): Automatic Block Planning & Corridor Optimization  
**Design Theme:** Light-Blue Mintlify Discipline  
**Document Version:** 3.0.0 (Unified Grounded Specification)  
**Governing Aesthetics:** Clean, authoritative, atmospheric light-blue canvas, crisp borders, precision data typography, zero AI-slop, strictly 4px button/input radius, strictly zero pill buttons.

---

## 🎨 1. Color Palette & Surface Tokens

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              MINTLIFY LIGHT-BLUE DESIGN SYSTEM                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SURFACE LEVELS:                                                                        │
│ • Canvas Base (Surface 0):       #F0F6FC  (Soft ice-blue canvas)                       │
│ • Card Surface (Surface 1):      #FFFFFF  (Pure white with #D0DFEE border)             │
│ • Elevated Panel (Surface 2):    #E6F0FA  (Subtle cool tinted background)              │
│ • Inset / Input Fill:            #F8FAFC  (Crisp subtle input fill)                    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ BRAND ACCENTS:                                                                         │
│ • Signal Blue (Primary Brand):   #2B7FFF  (Vibrant, authoritative action accent)       │
│ • Twilight Blue (Secondary):     #426188  (Atmospheric header & chart element accent)  │
│ • Sky Blue (Hover / Focus Ring): #60A5FA  (Interactive focus state)                    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TYPOGRAPHY & TEXT TOKENS:                                                              │
│ • Ink Slate (Text Primary):      #0F172A  (Deep slate black for maximum readability)   │
│ • Muted Slate (Text Secondary):  #475569  (Labels, subtitles, secondary metadata)     │
│ • Faint Slate (Text Tertiary):   #94A3B8  (Grid lines, borders, placeholder text)      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ OPERATIONAL STATUS COLORS:                                                             │
│ • P1 Critical / Hazard / Stop:   #EF4444  (Background: #FEE2E2, Border: #FCA5A5)       │
│ • P2 Scheduled / Caution:        #F59E0B  (Background: #FEF3C7, Border: #FCD34D)       │
│ • P3 Routine / Operational / Clr:#10B981  (Background: #DCFCE7, Border: #86EFAC)       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📐 2. Geometry & Spatial Layout Rules

* **Button / Input Border Radius:** Strictly **`4px`** (crisp, professional engineering aesthetic).
* **Card / Panel Border Radius:** **`16px`** with `1px solid #D0DFEE`.
* **Container / Modal Border Radius:** **`24px`** with soft drop-shadow (`box-shadow: 0 10px 25px -5px rgba(43, 127, 255, 0.08)`).
* **Strict Prohibition:** **STRICTLY ZERO PILL BUTTONS** (`rounded-full` is prohibited for buttons and interactive controls). Only compact numeric indicator dots and micro status pills are rounded.

---

## 🔤 3. Typography & Numerical Data Rules

* **Primary UI Font Family:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif` (clean, accessible, high-legibility at small sizes).
* **Tabular / Telemetry Font Family:** `JetBrains Mono`, `ui-monospace`, `SFMono-Regular`, `monospace`.
  * **Mandatory Usage:** All railway linear chainages (`KM 108/4`), Track Circuit IDs (`TC-03`), Signal IDs (`S-12`), speed values (`30 km/h`), timestamps (`01:30:00 IST`), and SHA-256 cryptographic hashes must use the monospaced font with tabular figure alignment (`font-variant-numeric: tabular-nums`).

---

## 📊 4. Time-Distance String Chart Aesthetics

* **Canvas Background:** `#FFFFFF` with `#F0F6FC` subtle horizontal grid banding representing station zones.
* **Station Axis (Y-Axis):** Dark `#0F172A` text labels on the left with kilometer offsets in `JetBrains Mono`.
* **Timeline Axis (X-Axis):** 24-hour horizontal scale with hourly tick marks and vertical guidelines (`#E2E8F0`).
* **Train Trajectories:**
  * Rajdhani / Vande Bharat (Premium): Solid Signal Blue line (`#2B7FFF`, `stroke-width: 2.5px`).
  * Mail / Express (Standard): Purple line (`#8B5CF6`, `stroke-width: 2.0px`).
  * Goods / Freight Rakes: Dashed Slate line (`#64748B`, `stroke-dasharray: 4 2`).
* **Bundled Shadow Block Zone:**
  * Shaded rectangular area with `#2B7FFF` fill at `12% opacity`.
  * Border: `1.5px solid #2B7FFF`.
  * Overlay: Diagonal cross-hatch pattern displaying savings badge (`⚡ 38.4% Downtime Saved`).

---

## 🔊 5. Acoustic & Micro-Animation Tokens

* **Audio Warning Synthesizer:** Pure Web Audio API generating authentic RDSO cab chimes:
  * *1200 Hz Caution Tone:* 300ms duration sinusoidal beep for active TSR approach.
  * *800 Hz Emergency Tone:* Pulsing dual-tone for critical obstacle or P1 rail fracture alert.
* **Micro-Animations:**
  * Smooth 200ms ease-out transitions for card hovers (`transform: translateY(-2px)`).
  * 1.5s infinite subtle pulse glow for active Kavach TSR indicators and clamped signal heads.

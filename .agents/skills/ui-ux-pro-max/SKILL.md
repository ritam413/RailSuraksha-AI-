---
name: ui-ux-pro-max
description: "Maximum-craft UI/UX component generation and styling director. Generates production-grade components, anti-slop guidelines, color harmonies, and responsive micro-interactions."
repository: "https://github.com/shadcn/ui"
---

# UI-UX-Pro-Max: High-Craft Design & Component Generation

## Official Ecosystem References
- **Repository:** [`shadcn/ui`](https://github.com/shadcn/ui) & [`radix-ui/primitives`](https://github.com/radix-ui/primitives)
- **Design Tokens:** [Light-Blue Mintlify Design System](file:///c:/Users/LENOVO/Downloads/railwaysurakshai/DESIGN.md)

## Mental Model
`ui-ux-pro-max` elevates standard web UI beyond template-grade minimum viable products into enterprise-grade, visually stunning software interfaces. It enforces strict typography hierarchy, intentional spacing tokens, semantic color palettes, and accessible component architectures.

```
┌────────────────────────────────────────────────────────┐
│                   UI-UX-Pro-Max Engine                 │
├────────────────────────────────────────────────────────┤
│ 1. Token Audit: Zero generic primary colors            │
│ 2. Spatial Rhythm: 4px base grid (4px, 8px, 16px, 24px)│
│ 3. Micro-Interactions: 60fps hover, active, focus states│
│ 4. Accessible Contrast: WCAG AA/AAA compliance         │
│ 5. Strict Zero-Pill Geometry (4px button / 16px card)  │
└────────────────────────────────────────────────────────┘
```

## Directives & Anti-Slop Rules

1. **Color & Hierarchy:**
   - Base Surface 0: `#F0F6FC`
   - Card Surface 1: `#FFFFFF` with `#D0DFEE` border
   - Primary Accent: `#2B7FFF` (Signal Blue)
   - Atmospheric Accent: `#426188` (Twilight Slate)
   - Zero harsh pure `#000000` text; use curated Ink Slate `#0F172A`.

2. **Component Geometry:**
   - **Buttons & Inputs:** `rounded-[4px]` (STRICTLY NO PILLS).
   - **Cards & Data Tables:** `rounded-[16px]` with subtle border.
   - **Dialogs & Drawers:** `rounded-[24px]` with backdrop blur (`backdrop-blur-md`).

3. **Micro-Interactions & States:**
   - Hover states should slightly scale or illuminate border: `transition-all duration-150 hover:border-blue-300 active:scale-[0.99]`.
   - Disabled states must use `cursor-not-allowed opacity-50` with explanatory tooltips.

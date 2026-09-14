# RailSuraksha AI — Test Suite & Verification Guide

> **Location:** `docs/test.md`  
> **Test Framework:** Vitest (v3.2)  
> **Status:** 32/32 tests passing

---

## 🧪 Test Suites

1. `tests/railsuraksha.test.ts`:
   - Unit tests for RDSO stopping distance calculations, triage agent classification, and platform hold countdown timer logic.
2. `tests/feature3_interlocking_compliance.test.ts`:
   - Verification of track circuit occupancy, signal aspect states (`S-12`, `S-14`), and switch positions (`SW-04`).
3. `tests/backend_api_engine.test.ts`:
   - Tests for FastAPI backend endpoints, mock data fallbacks, and payload validation.
4. `tests/advanced_features.test.ts`:
   - Tests for weather friction coefficients, audio alert synthesizer, and explainable decision dossier SHA-256 generation.

---

## 🚀 Running Tests
```bash
npm test
```

# CLAUDE.md — Patient Metrics

## Project Overview

Patient Metrics is a single-page Progressive Web App (PWA) for converting imperial patient measurements (weight, height) to metric units, calculating BMI, and applying weight factors. Built for clinical convenience — not as a validated medical device.

## Architecture

- **Single-file app**: All HTML, CSS, and JS live in `index.html` (no build system, no framework)
- **Service worker**: `sw.js` handles offline caching (network-first for HTML, cache-first for static assets)
- **Deployment**: Vercel (`vercel.json` configures SPA rewrites and cache headers)
- **PWA manifest**: `manifest.json` with icons (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`)

## Versioning

Format: **W.x.y.z**

| Segment | Meaning                        |
|---------|--------------------------------|
| W       | Major public releases          |
| x       | Major features or updates      |
| y       | Minor sub-features or updates  |
| z       | Bug fixes                      |

Version must be updated in **three** places before any push:
1. `index.html` — header brand span (e.g., `v1.4.4.0`)
2. `sw.js` — `CACHE` constant (e.g., `patient-metrics-v1.4.4.0`)
3. `CHANGELOG.md` — new entry at top

## Critical Rules

### Medical Data Integrity
- **Only use verified medical sources** for any constants, formulas, thresholds, or clinical data.
- All sources must be recorded in `REFERENCES.md` with full citations.
- **It is better to report failure or inability to perform a task than to make assumptions** about medical values, thresholds, or formulas.
- If a medical source cannot be verified, do not implement the feature. Flag it to the user.

### Current Conversion Constants (verified)
- **lb to kg**: `0.45359237` — exact by international definition (International Yard and Pound Agreement, 1959)
- **in to cm**: `2.54` — exact by international definition (International Yard and Pound Agreement, 1959)
- **BMI**: `weight(kg) / height(m)^2` — WHO standard formula

### Current BMI Categories (WHO)
- Underweight: < 18.5
- Normal: 18.5 – 24.9
- Overweight: 25.0 – 29.9
- Obese Class I: 30.0 – 34.9
- Obese Class II: 35.0 – 39.9
- Obese Class III: >= 40.0

## File Map

| File                 | Purpose                                |
|----------------------|----------------------------------------|
| `index.html`         | Entire app (HTML + CSS + JS inline)    |
| `ref-data.js`        | Clinical reference data & computation  |
| `sw.js`              | Service worker for offline/caching     |
| `manifest.json`      | PWA manifest                           |
| `vercel.json`        | Vercel deployment config               |
| `CLAUDE.md`          | This file — development guidelines     |
| `CHANGELOG.md`       | Version history                        |
| `REFERENCES.md`      | Verified medical/scientific references |
| `*.png`              | App icons                              |

## Development Notes

- No build step — edit `index.html` directly.
- Test in browser after changes; service worker caching can mask stale code during development.
- The app uses a custom drum/wheel picker component (built from scratch, not a library).
- State persistence is opt-in via localStorage ("Remember values" toggle in Settings).
- Device counter uses the Abacus API (abacus.jasoncameron.dev).

## Changelog

Maintained in `CHANGELOG.md`. Every change gets an entry before pushing.

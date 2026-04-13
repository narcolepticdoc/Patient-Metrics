# Changelog — Patient Metrics

All notable changes to this project are documented here.

Versioning follows **W.x.y.z** format:
- **W** — Major public releases
- **x** — Major features or updates
- **y** — Minor sub-features or updates
- **z** — Bug fixes

---

## [1.5.0.0] - 2026-04-13

### Added
- **Clinical Reference Module** — full-screen overlay accessible via REFERENCE button at the bottom of the main screen.
  - Multi-page swipeable interface with horizontal touch/mouse drag navigation.
  - Page navigator dropdown (tap header title to see all pages and jump directly).
  - Dot indicators showing current page position.
  - Tappable list items with detail popups showing calculation formula, clinical notes, and source references.
  - "Patient Summary" page displaying computed demographics (age, weight, height, BMI) with verified source citations.
  - Placeholder "Clinical References" page (framework ready for data population from verified sources).
- `getDemographics()` helper function centralizing computed patient values for module consumption.
- `renderRefItem()` shared utility for building tappable reference list items with detail popup integration.

---

## [1.4.5.0] - 2026-04-13

### Added
- `CLAUDE.md` — Development guidelines, architecture notes, and conventions for AI-assisted development.
- `REFERENCES.md` — Verified medical and scientific source citations for all data used in the app.
- `CHANGELOG.md` — This file; version history tracking.
- Adopted W.x.y.z versioning scheme.

### Changed
- Synchronized version string across `index.html` header and `sw.js` cache key.

---

## [1.4.4] - Prior history

### Summary of pre-changelog features
- Imperial to metric conversion (weight: lb to kg, height: ft/in to cm/m).
- BMI calculation and classification (WHO categories).
- Age estimation from birth year.
- Weight factor adjustment slider (0.6x – 1.4x).
- Three input modes: scroll wheel (drum picker), popup select, text entry.
- Service worker for offline PWA capability.
- Optional data persistence via localStorage.
- Configurable drum inertia for wheel input mode.
- Unique device counter via Abacus API.

# Changelog — Patient Metrics

All notable changes to this project are documented here.

Versioning follows **W.x.y.z** format:
- **W** — Major public releases
- **x** — Major features or updates
- **y** — Minor sub-features or updates
- **z** — Bug fixes

---

## [1.6.0.1] - 2026-04-14

### Changed
- OCC compendium medications now precalculate weight-based doses from patient demographics.
- Computed values display as "XX mg (based on YY kg)"; detail popup shows original card formula.
- New calc types: `occ_ws` (single), `occ_wr` (range), `occ_wc` (capped), `occ_max` (toxic dose plain/epi).
- Converted ~30 OCC medication items from fixed text to dynamic computation.
- Local anesthetic toxic doses now show max dose for current patient weight.
- Intralipid LAST bolus computed from weight.
- Gentamicin and vancomycin prophylaxis doses computed from weight.

---

## [1.6.0.0] - 2026-04-13

### Added
- **OpenCriticalCare Pocket Anesthesia Reference Card v4.212** as validated primary source.
- 9 new compendium pages mirroring the OCC card content:
  - OCC: Quick Reference (NPO guidelines, EBV by age, ABL, 4/2/1, drug concentration calcs)
  - OCC: Emergencies (high spinal, hyperkalemia treatment, anaphylaxis protocol)
  - OCC: Medications A-E (adenosine through etomidate, 14 drugs)
  - OCC: Medications F-N (fentanyl through nitroprusside, 22 drugs)
  - OCC: Medications O-V (ondansetron through vecuronium, 15 drugs)
  - OCC: Neuraxial (contraindications, spinal agents, epidural settings)
  - OCC: OB Emergencies (C-section GA, pre-eclampsia/MgSO4, PPH uterotonics)
  - OCC: Antibiotics (9 surgical prophylaxis agents with peds/adult doses and redose intervals)
  - OCC: Local & Inhalational (6 local anesthetic toxic doses, 4 inhalational MAC by age, LAST treatment)

### Changed
- EBV updated from 75 to **70 ml/kg** for adults (per OCC card).
- Furosemide (hyperkalemia) updated from 20-40 to **40-80 mg IV** (per OCC card).
- Promoted to validated (confirmed by OCC card): atropine, glycopyrrolate, Ca chloride, kayexalate, furosemide, adrenaline, hydrocortisone, dantrolene initial.

---

## [1.5.3.3] - 2026-04-13

### Fixed
- Reference values always right-justified via `margin-left: auto` wrapper, even when wrapping to second line.

---

## [1.5.3.2] - 2026-04-13

### Fixed
- Reference list items now wrap value to second line instead of clipping off-screen.
- Normalized font sizes: label and value both 13px (was 14/15px mismatch).
- Long procedural text (MH actions, intralipid) no longer overflows horizontally.

---

## [1.5.3.1] - 2026-04-13

### Fixed
- Sex toggle moved into Age card header to save vertical space.
- Tightened header, card header, card body, and main padding to reduce overall vertical footprint.

---

## [1.5.3.0] - 2026-04-13

### Added
- Sex (M/F) toggle in the Age card for sex-specific derived weight formulas.
- Sex persisted with other settings when "Remember values" is enabled.

### Changed
- IBW (Devine): now uses 45.5 base for female, 50 for male.
- LBW (James): now uses female coefficients (1.07, 148) vs male (1.1, 128).
- Cockcroft-Gault CrCl: applies 0.85 multiplier for female patients.
- Patient Summary shows sex-specific formula text for IBW and LBW.
- All IBW/LBW-dependent drug doses (NMBs, induction agents, tidal volume) update when sex is toggled.

---

## [1.5.2.0] - 2026-04-13

### Added
- 5 new clinical sections from deliverable v1.2: Vital Signs, Airway (ETT, LMA, tidal volume), Induction Agents (propofol, ketamine, thiopental, etomidate, midazolam), Neuromuscular Blockers (vecuronium, rocuronium, pancuronium, cisatracurium, atracurium, succinylcholine), Antagonists (neostigmine, sugammadex, naloxone, flumazenil).
- IBW (Devine formula) and LBW (James formula) derived weight calculations.
- IBW/LBW-specific dosing: NMBs use IBW, induction agents use LBW, succinylcholine uses TBW.
- IBW and LBW displayed on Patient Summary page under "Derived Weights" section.
- 14 new web reference sources for the added sections.

---

## [1.5.1.0] - 2026-04-13

### Added
- `ref-data.js` — Clinical reference data and computation engine, separated from `index.html` for auditability.
  - 10 clinical sections: Anticholinergics, Local Anesthetics, Analgesics, Inotropes & Vasopressors, Antiarrhythmics, Hyperkalemia, Severe Hypokalemia, Malignant Hyperthermia, Anesthetic Crisis, Resuscitation (Blood & Fluids), CPB / Derived Physiology.
  - Dynamic dose/rate computation from patient demographics.
  - Web reference lookup table for source citations.
  - Verification status system: validated, partially_verified, screen_confirmed, issue, unresolved.
- Status indicator dots on reference list items (color-coded by verification level).
- Status badge in detail popup showing verification level for each item.
- Nitroprusside arithmetic corrected (original screen showed 2.1 ml/h; formula gives 4.2 ml/h for 70 kg — flagged as "Known Issue").
- Unresolved items (Delta Hct, Target Hct) shown as placeholders.

### Changed
- Reference module pages now generated dynamically from `REF_SECTIONS` data in `ref-data.js`.
- Service worker caches `ref-data.js` as a static asset.

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

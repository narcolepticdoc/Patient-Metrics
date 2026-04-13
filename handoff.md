# Anesthesia App Extraction Handoff — v1.2

## Package contents
- `deliverable.json` — full structured extraction, 14 sections, 75 items.
- `references.json` — lookup table mapping all `file:*` and `web:*` source IDs.
- `handoff.md` — this file; implementation notes, QA issues, weight-type table.

## What changed in v1.2
v1.1 was missing the first four sections visible in IMG_2108–IMG_2111:
- **Airway** (cuffed ET tube, LMA, tidal volume)
- **Induction agents** (propofol, ketamine, thiopental, etomidate, midazolam)
- **Neuromuscular blockers** (vecuronium, rocuronium, pancuronium, cisatracurium, atracurium, succinylcholine)
- **Antagonists** (neostigmine, sugammadex, naloxone, flumazenil)

These are now at the top of `sections[]` in the correct order.

## Weight type reference
This app uses at least four distinct weight bases. They are **not interchangeable**.

| Weight type | Abbreviation | Formula (this patient) | Resolved value |
|---|---|---|---|
| Total body weight | TBW | input | 70 kg |
| Ideal body weight (Devine) | IBW | 50 + 2.3 × (height_in − 60) | 65.9 kg |
| Lean body weight (James, male) | LBW | 1.1 × TBW − 128 × (TBW/height_cm)² | 55.3 kg |
| Body surface area (Mosteller) | BSA | sqrt((height_cm × TBW) / 3600) | 1.82 m² |

### Which sections use which weight
| Section | Weight used |
|---|---|
| Tidal volume, all NMBs except succinylcholine | IBW |
| All induction agents | LBW (James) |
| Succinylcholine, neostigmine, sugammadex, naloxone, flumazenil | TBW |
| Anticholinergics, analgesics, vasopressors, electrolytes, crisis drugs | TBW |
| BSA, cardiac output, creatinine clearance | BSA (Mosteller) |
| CPB heparin, EBV, ABL | TBW |

## Status policy
- `validated` — screen arithmetic and external sources align closely.
- `partially_verified` — readable from screen; exact external match is incomplete.
- `screen_confirmed` — visible on screen; not externally validated in this batch.
- `issue` — visible but internally inconsistent or likely wrong.
- `unresolved` — interactive/cropped field without enough visible logic.

## Highest-priority corrections
1. **Nitroprusside arithmetic mismatch** (`vaso.nitroprusside200`)  
   Screen: 0.2 mcg/kg/min at 200 mcg/ml → 2.1 ml/h.  
   Expected: 70 × 0.2 × 60 / 200 = 4.2 ml/h. Off by factor of 2.  
   Source: `file:171`, `web:184`.

2. **Cardioversion and defibrillation fixed joule display** (`crisis.cardioversion`, `crisis.defibrillation`)  
   Text rule is weight-based and standard. Displayed fixed joule values do not match 70 kg.  
   Treat text algorithm as primary; fixed display as QA target.  
   Source: `file:284`, `web:286`, `web:298`.

3. **Cockcroft-Gault display is BSA-normalized** (`derived.crcl`)  
   Base formula returns ml/min. App then multiplies by 1.73/BSA.  
   The label "Cockcroft Gault" is directionally correct but the output unit is non-standard for CG.  
   Source: `file:331`, `file:316`, `web:332`.

## Unresolved fields
- `vitals.section` — Vital signs content was above scroll position in all screenshots.
- `cpb.delta_hct` — shows "Tap to calculate"; no formula exposed.
- `cpb.target_hct` — shows "Tap to calculate"; no formula exposed.
- `airway.lma` — cuff volume (40 ml) is manufacturer-specified, not formula-derived.

## Implementation guidance
- Preserve `algorithm_type` per item. Sections mix concentration-to-rate, weight-based, procedural, and interactive types.
- Store IBW, LBW, TBW, and BSA as derived patient-level fields, not per-drug inputs.
- For items with both a text rule and a fixed display (cardioversion, defibrillation), store both in separate fields.
- For unresolved interactive fields, keep placeholder entries rather than guessing formulas.
- Vital signs section is entirely unresolved.

## Entries that need internal confirmation before promotion to `validated`
Intralipid bolus amount, vasopressin target dose, hydrocortisone 2-3 mg/kg IV,
some analgesic route/indication context, mannitol 20%, HS 7.5%, PRBC effect note,
platelet expected increment note, digoxin implementation, MH maintenance interval.

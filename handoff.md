# Anesthesia App Extraction Handoff

## Package contents
- `deliverable.json`: consolidated structured extraction.
- `references.json`: lookup table for `file:*` and `web:*` source IDs used in the deliverable.
- `handoff.md`: implementation and QA notes.

## Scope
This package consolidates the visible screenshot set that was processed in the thread and preserves screen behavior even when external validation was only partial.

## Status policy
- `validated`: screen logic and external support align closely.
- `partially_verified`: screen logic is readable, but the exact external match is incomplete, broader, or indication-dependent.
- `screen_confirmed`: visible on screen but not externally validated in this batch.
- `issue`: visible but internally inconsistent or likely wrong.
- `unresolved`: interactive or cropped field without enough visible logic.

## Highest-priority issues
1. **Nitroprusside arithmetic mismatch**  
   - Screen: `0.2 mcg/kg/min`, concentration `200 mcg/ml`, rate `2.1 ml/h`.  
   - For the visible 70 kg patient, expected rate is `4.2 ml/h`.  
   - Source IDs: `file:171`, `web:184`.

2. **Electrical therapy fixed joules vs weight rules**  
   - Cardioversion and defibrillation rows show standard weight-based text rules, but the fixed joule values shown on screen do not exactly match the visible 70 kg patient.  
   - Treat the text algorithm as primary and the fixed joule display as a QA target.  
   - Source IDs: `file:284`, `web:286`, `web:298`.

3. **Cockcroft-Gault display is BSA-normalized**  
   - The app labels the method as Cockcroft-Gault but displays the result in `ml/min/1.73 m2`, implying a post-formula normalization step using BSA.  
   - Source IDs: `file:331`, `file:316`, `web:332`.

## Unresolved fields
- `cpb.delta_hct`: screen says `Tap to calculate`; no formula exposed.  
- `cpb.target_hct`: screen says `Tap to calculate`; no formula exposed.  
- Source IDs: `file:316`.

## Entries that should stay app-specific unless internally confirmed
- Intralipid bolus amount on the LAST row.
- Vasopressin target of `0.1 IU/min`.
- Hydrocortisone `2-3 mg/kg IV` row.
- Some analgesic rows where exact route/indication context was not exposed.
- Mannitol 20%, HS 7.5%, PRBC effect note, and platelet expected increment note.

## Implementation guidance
- Preserve `algorithm_type`; do not flatten all rows into a single dose model.
- Keep screen behavior separate from validation status.
- Where both a weight rule and a fixed display value appear, store both if they conflict.
- For checklist rows like malignant hyperthermia actions, model them as procedural entries rather than numeric doses.
- For unresolved rows, keep placeholders instead of guessing formulas.

## Notes by section
### Local anesthetics
- Lidocaine and bupivacaine arithmetic is clear from the screen.
- Intralipid rescue infusion math is strong; bolus amount is the weaker part.

### Vasopressors / antiarrhythmics
- Concentration-to-rate rows are generally straightforward and reusable.
- Nitroprusside is the only clear concentration-rate mismatch found.

### Electrolytes and MH
- Hyperkalemia mixes weight-based calcium rows, fixed-dose temporizing therapies, and action items.
- Malignant hyperthermia mixes crisis actions, weight-based dantrolene, complication management, and contraindication rules.

### Fluids / blood / CPB
- Maintenance fluids use the 4/2/1 rule.
- Allowable blood loss uses the simple `EBV * (Hi - Hf) / Hi` form.
- Creatinine clearance uses Cockcroft-Gault followed by BSA normalization.

## Suggested QA checklist
- Recompute every concentration-to-rate entry against the visible patient values.
- Compare every fixed displayed value against the formula-generated value for 70 kg.
- Review unresolved interactive fields in-app.
- Confirm whether the app intends adult, pediatric, or mixed-context defaults on the partially verified rows.

# References — Patient Metrics

All medical and scientific data used in this application must be traceable to verified sources. This file serves as the authoritative reference list.

---

## Unit Conversion Constants

### Pounds to Kilograms: 1 lb = 0.45359237 kg (exact)

- **Source**: International Yard and Pound Agreement (1959), adopted by the United States, United Kingdom, Canada, Australia, New Zealand, and South Africa.
- **Authority**: National Bureau of Standards (now NIST). Federal Register, July 1, 1959.
- **NIST Reference**: NIST Special Publication 811, "Guide for the Use of the International System of Units (SI)," 2008 Edition. Section 4, Table 7.
  - URL: https://www.nist.gov/pml/special-publication-811
- **Note**: This is an exact conversion factor by definition, not a rounded approximation.

### Inches to Centimetres: 1 in = 2.54 cm (exact)

- **Source**: International Yard and Pound Agreement (1959). Defines 1 yard = 0.9144 metres exactly, therefore 1 inch = 25.4 mm = 2.54 cm exactly.
- **Authority**: National Bureau of Standards (now NIST). Federal Register, July 1, 1959.
- **NIST Reference**: NIST Special Publication 811, 2008 Edition. Section 4, Table 6.
  - URL: https://www.nist.gov/pml/special-publication-811
- **Note**: This is an exact conversion factor by definition.

---

## BMI (Body Mass Index)

### Formula: BMI = weight (kg) / [height (m)]^2

- **Source**: World Health Organization (WHO). "Body mass index — BMI."
  - URL: https://www.who.int/data/gho/data/themes/topics/topic-details/GHO/body-mass-index
- **Original work**: Quetelet, Adolphe. "A Treatise on Man and the Development of His Faculties," 1842. (Historical origin of the formula; WHO is the modern authority.)
- **Note**: BMI is a screening tool, not a diagnostic measure. It does not account for muscle mass, bone density, age, sex, or ethnicity.

### BMI Classification Thresholds (Adults)

| Category       | BMI Range         |
|----------------|-------------------|
| Underweight    | < 18.5            |
| Normal weight  | 18.5 – 24.9       |
| Overweight     | 25.0 – 29.9       |
| Obese Class I  | 30.0 – 34.9       |
| Obese Class II | 35.0 – 39.9       |
| Obese Class III| >= 40.0           |

- **Source**: World Health Organization. "Obesity: preventing and managing the global epidemic." WHO Technical Report Series, No. 894. Geneva, 2000.
  - URL: https://www.who.int/nutrition/publications/obesity/WHO_TRS_894/en/
- **CDC concordance**: Centers for Disease Control and Prevention. "About Adult BMI."
  - URL: https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html
- **Note**: These thresholds are for adults (age 20+). Pediatric BMI uses age- and sex-specific percentiles (not implemented in this app). Some populations may have different risk thresholds (e.g., WHO has suggested lower cut-points for Asian populations).

---

## Guidelines for Adding New References

1. **Primary sources only**: Use official bodies (WHO, CDC, NIST, FDA, EMA) or peer-reviewed publications.
2. **Include full citation**: Author/organization, title, year, and URL where available.
3. **Note limitations**: Document what the source does and does not cover.
4. **No assumptions**: If a verified source cannot be found for a value, do not use that value. Flag it for review instead.

---

## Clinical Reference Data Sources

The following sources were used to verify the clinical data in `ref-data.js`. Each item in the deliverable was assigned a verification status (see `handoff.md` for definitions). Source IDs map to entries in `references.json`.

### Local Anesthetics / LAST
- **NCBI Table — Anesthetic agents and maximum recommended doses**: NBK574554, Table 1.
- **ASRA — Local Anesthetic Systemic Toxicity (LAST)**: ASRA Pain Medicine guidelines, 2021.

### Analgesics
- **Fentanyl — StatPearls**: NBK459275. NCBI Bookshelf.
- **UNC Pediatric Analgesics/Sedatives Dosing Guidelines**: UNC Dept. of Pediatrics.
- **Ketorolac — StatPearls**: NBK545172. NCBI Bookshelf.
- **Pain Management in Children: NSAID Use — PMC**: PMC8275553.
- **Guidelines for treatment of acute pain in children — PMC**: PMC10156497.

### Vasopressors & Inotropes
- **Stanford CV Anesthesia — Dosing and Dilution of Perioperative Vasoactives**: cvanes.stanford.edu.
- **Vasopressors — WikEM**: wikem.org.
- **Milrinone — StatPearls**: NBK532943. NCBI Bookshelf.
- **Sodium Nitroprusside — StatPearls**: NBK557487. NCBI Bookshelf.
- **IV labetalol vs nitroprusside**: PubMed 2686494.

### Antiarrhythmics / ACLS
- **Advanced Cardiac Life Support (ACLS) — StatPearls**: NBK613285. NCBI Bookshelf.
- **AHA — Pediatric Tachycardia With a Pulse Algorithm**: AHA CPR Guidelines.

### Electrolyte Emergencies
- **ACEP — Management Algorithm for Adults with Hyperkalemia (K > 5.5 mEq/L)**: ACEP clinical policy.
- **Kayexalate — PDR Drug Summary**: pdr.net.
- **Acute management of hyperkalemia**: Gloucestershire Hospitals NHS, March 2023.
- **Potassium Replacement**: VUMC Trauma and SCC Protocols.

### Malignant Hyperthermia
- **How Much Dantrolene Should Be Kept On Hand? — MHAUS**: mhaus.org FAQ.
- **Managing A Crisis — MHAUS**: mhaus.org healthcare professionals.
- **Calcium Channel Blockers & MH — MHAUS**: MHAUS knowledge base.
- **Malignant Hyperthermia — StatPearls**: NBK430828. NCBI Bookshelf.

### Crisis Medications
- **Epinephrine — StatPearls**: NBK482160. NCBI Bookshelf.
- **Understanding push dose pressors — EMS1**: ems1.com.
- **Adenosine Dose — Pediatric EM Morsels**: pedemmorsels.com.
- **Sodium Bicarbonate — StatPearls**: NBK559139. NCBI Bookshelf.
- **D50W/Dextrose dosing — Medscape**: reference.medscape.com.
- **Perioperative Hyperglycemia Management — PMC**: PMC5309204.

### Fluids, Blood Products, & Transfusion
- **Maintenance Fluid Calculator (4-2-1 Rule) — BackTable**: backtable.com.
- **Gastric Ultrasound — StatPearls**: NBK580524. NCBI Bookshelf.
- **Defibrillation — StatPearls**: NBK499899. NCBI Bookshelf.
- **Consensus Transfusion Guidelines — PMC**: PMC11624464.
- **Red Cross — Compendium of Transfusion Practice Guidelines**: redcross.org.
- **Wadsworth — Guidelines for Transfusion of Pediatric Patients**: wadsworth.org.
- **Pediatric Fibrinogen Overview — PMC**: PMC8097134.

### Derived Physiology / CPB
- **Body Surface Area Calculator (Mosteller) — Pearson**: pearson.com.
- **UI Health Care — Perfusion Calculator**: healthcare.uiowa.edu.
- **Iowa Protocols — Maximum Allowable Blood Loss**: iowaprotocols.medicine.uiowa.edu.
- **Cockcroft-Gault Formula — National Kidney Foundation**: kidney.org.

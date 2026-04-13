// ═══════════════════════════════════════════════════
// ref-data.js — Clinical Reference Data & Computation
// Patient Metrics PWA
// ═══════════════════════════════════════════════════
// All medical data must be traceable to REFERENCES.md.
// Status levels: validated, partially_verified,
//   screen_confirmed, issue, unresolved

const STATUS_LABELS = {
  validated: 'Validated',
  partially_verified: 'Partially Verified',
  screen_confirmed: 'Screen Confirmed',
  issue: 'Known Issue',
  unresolved: 'Unresolved'
};

const WEB_REFS = {
  'web:24':  'Body Surface Area Calculator — Pearson (Mosteller, Du Bois)',
  'web:125': 'NCBI Table — Anesthetic agents and maximum doses (NBK574554)',
  'web:133': 'ASRA — Local Anesthetic Systemic Toxicity (LAST)',
  'web:134': 'Fentanyl — StatPearls (NBK459275)',
  'web:144': 'UNC Pediatric Analgesics/Sedatives Dosing Guidelines',
  'web:146': 'Ketorolac — StatPearls (NBK545172)',
  'web:147': 'Pain Management in Children: NSAID Use — PMC',
  'web:157': 'Guidelines for treatment of acute pain in children — PMC',
  'web:161': 'Stanford CV Anesthesia — Dosing and Dilution of Perioperative Vasoactives',
  'web:164': 'Vasopressors — WikEM',
  'web:170': 'Milrinone — StatPearls (NBK532943)',
  'web:173': 'IV labetalol vs nitroprusside — PubMed 2686494',
  'web:180': 'Advanced Cardiac Life Support (ACLS) — StatPearls (NBK613285)',
  'web:184': 'Sodium Nitroprusside — StatPearls (NBK557487)',
  'web:188': 'ACEP — Management Algorithm for Adults with Hyperkalemia',
  'web:194': 'Kayexalate — PDR Drug Summary',
  'web:208': 'Acute management of hyperkalemia — Glos Hospitals NHS',
  'web:216': 'How Much Dantrolene Should Be Kept On Hand? — MHAUS',
  'web:218': 'Managing A Crisis — MHAUS',
  'web:224': 'Potassium Replacement — VUMC Protocols',
  'web:232': 'Calcium Channel Blockers & MH — MHAUS',
  'web:245': 'Malignant Hyperthermia — StatPearls (NBK430828)',
  'web:247': 'Adenosine Dose — Pediatric EM Morsels',
  'web:254': 'Epinephrine — StatPearls (NBK482160)',
  'web:260': 'Understanding push dose pressors — EMS1',
  'web:262': 'Sodium Bicarbonate — StatPearls (NBK559139)',
  'web:271': 'D50W/Dextrose dosing — Medscape',
  'web:278': 'Perioperative Hyperglycemia Management — PMC',
  'web:286': 'AHA — Pediatric Tachycardia With a Pulse Algorithm',
  'web:290': 'Maintenance Fluid Calculator (4-2-1 Rule) — BackTable',
  'web:291': 'Gastric Ultrasound — StatPearls (NBK580524)',
  'web:298': 'Defibrillation — StatPearls (NBK499899)',
  'web:301': 'Consensus Transfusion Guidelines — PMC',
  'web:303': 'Red Cross — Compendium of Transfusion Practice Guidelines',
  'web:304': 'Wadsworth — Guidelines for Transfusion of Pediatric Patients',
  'web:315': 'Pediatric Fibrinogen Overview — PMC',
  'web:319': 'UI Health Care — Perfusion Calculator',
  'web:322': 'Iowa Protocols — Maximum Allowable Blood Loss',
  'web:332': 'Cockcroft-Gault Formula — National Kidney Foundation',
  'web:nmb1': 'Neuromuscular Blocking Drugs — StatPearls (NBK539829)',
  'web:nmb2': 'Succinylcholine — StatPearls (NBK499984)',
  'web:sug1': 'Sugammadex — StatPearls (NBK470351)',
  'web:neo1': 'Neostigmine — StatPearls (NBK537017)',
  'web:nal1': 'Naloxone — StatPearls (NBK470193)',
  'web:flu1': 'Flumazenil — StatPearls (NBK499790)',
  'web:ibw1': 'Ideal Body Weight — StatPearls (NBK535456)',
  'web:lbw1': 'Lean Body Weight Estimation (James) — Anaesthesia journal',
  'web:tv1':  'Lung Protective Ventilation — NEJM (ARDSNet)',
  'web:lma1': 'Laryngeal Mask Airway — StatPearls (NBK539739)',
  'web:ind1': 'Propofol — StatPearls (NBK430884)',
  'web:ind2': 'Ketamine — StatPearls (NBK470357)',
  'web:ind3': 'Etomidate — StatPearls (NBK482379)',
  'web:ind4': 'Midazolam — StatPearls (NBK537321)'
};

// ── Weight type helpers ──
// IBW: Devine formula — 50 + 2.3 × (height_in - 60) [male]
// Source: StatPearls NBK535456
function calcIBW(heightCm) {
  var heightIn = heightCm / 2.54;
  return 50 + 2.3 * (heightIn - 60);
}
// LBW: James formula (male) — 1.1 × TBW - 128 × (TBW/height_cm)²
// Source: Anaesthesia journal, doi:10.1111/j.1365-2044.2009.06063.x
function calcLBW(kg, heightCm) {
  return 1.1 * kg - 128 * Math.pow(kg / heightCm, 2);
}

// ── Rounding helper ──
function refRound(v, decimals) {
  if (decimals === undefined) decimals = v >= 100 ? 0 : v >= 10 ? 1 : 1;
  return +v.toFixed(decimals);
}

// ── 4/2/1 maintenance fluid rate ──
function maintenanceRate(kg) {
  if (kg <= 10) return kg * 4;
  if (kg <= 20) return 40 + (kg - 10) * 2;
  return 60 + (kg - 20) * 1;
}

// ── Computation engine ──
// Takes an item definition + demographics, returns { value, formula }
function computeRef(item, d) {
  var kg = d.kg, age = d.age, cm = d.cm, m = d.m;
  if (kg === null) return { value: '\u2014', formula: 'Enter patient weight' };

  var p = item.params;
  switch (item.calc) {
    case 'ws': { // weight single
      var v = refRound(kg * p.f);
      return { value: v + ' ' + p.u, formula: kg + ' kg \u00d7 ' + p.f + ' ' + p.ru };
    }
    case 'wr': { // weight range
      var lo = refRound(kg * p.lo), hi = refRound(kg * p.hi);
      return { value: lo + '-' + hi + ' ' + p.u,
        formula: kg + ' kg \u00d7 (' + p.lo + ' to ' + p.hi + ') ' + p.ru };
    }
    case 'wc': { // weight capped
      var raw = kg * p.f, v = refRound(Math.min(raw, p.cap));
      var note = raw > p.cap ? ' (capped at ' + p.cap + ')' : '';
      return { value: v + ' ' + p.u + note,
        formula: 'min(' + kg + ' kg \u00d7 ' + p.f + ', ' + p.cap + ') ' + p.ru };
    }
    case 'cr': { // concentration to rate
      var rate = refRound(kg * p.dose * 60 / p.conc, 1);
      return { value: rate + ' ml/h',
        formula: kg + ' kg \u00d7 ' + p.dose + ' ' + p.du + ' \u00d7 60 \u00f7 ' + p.conc + ' ' + p.cu };
    }
    case 'cr_fixed': { // concentration to rate, not weight-based
      var rate = refRound(p.dose * 60 / p.conc, 1);
      return { value: rate + ' ml/h',
        formula: p.dose + ' ' + p.du + ' \u00d7 60 \u00f7 ' + p.conc + ' ' + p.cu };
    }
    case 'fd': // fixed dose
      return { value: p.v, formula: p.f || 'Fixed dose' };
    case 'pa': // procedural action
      return { value: p.v, formula: null };
    case 'maint': { // 4/2/1 maintenance
      var rate = refRound(maintenanceRate(kg), 0);
      return { value: rate + ' ml/h',
        formula: '4/2/1 rule: 4 ml/kg/h first 10 kg + 2 ml/kg/h next 10 kg + 1 ml/kg/h remainder' };
    }
    case 'fasting': {
      var rate = maintenanceRate(kg);
      var vol = refRound(rate * p.hours, 0);
      return { value: vol + ' ml',
        formula: refRound(rate, 0) + ' ml/h \u00d7 ' + p.hours + ' h' };
    }
    case 'ebv': {
      var v = refRound(kg * p.f, 0);
      return { value: v + ' ml', formula: kg + ' kg \u00d7 ' + p.f + ' ml/kg' };
    }
    case 'abl': {
      var ebv = kg * 75;
      var abl = refRound(ebv * (p.hi - p.hf) / p.hi, 0);
      return { value: abl + ' ml',
        formula: refRound(ebv, 0) + ' ml EBV \u00d7 (' + p.hi + ' - ' + p.hf + ') / ' + p.hi };
    }
    case 'bsa': {
      if (cm === null) return { value: '\u2014', formula: 'Enter height' };
      var bsa = Math.sqrt(cm * kg / 3600);
      return { value: refRound(bsa, 2) + ' m\u00b2',
        formula: '\u221a(' + cm + ' cm \u00d7 ' + kg + ' kg / 3600) [Mosteller]' };
    }
    case 'co': {
      if (cm === null) return { value: '\u2014', formula: 'Enter height' };
      var bsa = Math.sqrt(cm * kg / 3600);
      var co = refRound(p.ci * bsa, 2);
      return { value: co + ' L/min',
        formula: 'CI ' + p.ci + ' \u00d7 BSA ' + refRound(bsa, 2) + ' m\u00b2' };
    }
    case 'crcl': {
      if (age === null || cm === null) return { value: '\u2014', formula: 'Enter age and height' };
      var bsa = Math.sqrt(cm * kg / 3600);
      var raw = ((140 - age) * kg) / (72 * p.cr);
      var norm = refRound(raw * 1.73 / bsa, 1);
      return { value: norm + ' ml/min/1.73m\u00b2',
        formula: '((140-' + age + ') \u00d7 ' + kg + ') / (72 \u00d7 ' + p.cr + ') \u00d7 1.73 / BSA ' + refRound(bsa, 2) + ' [CG + BSA norm, male]' };
    }
    case 'bolus_inf': {
      var bml = refRound(kg * p.bf);
      var lo = refRound(kg * p.ilo * 60), hi = refRound(kg * p.ihi * 60);
      return { value: bml + ' ml bolus; ' + lo + '-' + hi + ' ml/h infusion',
        formula: 'Bolus: ' + kg + ' kg \u00d7 ' + p.bf + ' ml/kg; Infusion: ' + kg + ' kg \u00d7 (' + p.ilo + '-' + p.ihi + ') ml/kg/min \u00d7 60' };
    }
    case 'esc': { // escalation (cardioversion/defib)
      var lo = refRound(kg * p.lo, 0), hi = refRound(kg * p.hi, 0);
      return { value: lo + '-' + hi + ' J',
        formula: kg + ' kg \u00d7 ' + p.lo + ' to ' + p.hi + ' J/kg ' + p.mode };
    }
    case 'dext': { // dextrose equivalents
      var d50 = refRound(kg * 0.5, 0), d10 = refRound(kg * 2.5, 0);
      return { value: d50 + ' ml D50W / ' + d10 + ' ml D10W',
        formula: 'D50W: ' + kg + ' kg \u00d7 0.5 ml/kg; D10W: ' + kg + ' kg \u00d7 2.5 ml/kg' };
    }
    case 'sono': {
      return { value: 'Requires US input', formula: 'Vol = 27 + 14.6 \u00d7 RLD_CSA - 1.28 \u00d7 age' };
    }
    case 'ws_ibw': { // weight single using IBW
      if (d.cm === null) return { value: '\u2014', formula: 'Enter height for IBW' };
      var ibw = calcIBW(d.cm);
      var v = refRound(ibw * p.f);
      return { value: v + ' ' + p.u,
        formula: 'IBW ' + refRound(ibw, 1) + ' kg \u00d7 ' + p.f + ' ' + p.ru + ' [Devine]' };
    }
    case 'wr_ibw': { // weight range using IBW
      if (d.cm === null) return { value: '\u2014', formula: 'Enter height for IBW' };
      var ibw = calcIBW(d.cm);
      var lo = refRound(ibw * p.lo), hi = refRound(ibw * p.hi);
      return { value: lo + '-' + hi + ' ' + p.u,
        formula: 'IBW ' + refRound(ibw, 1) + ' kg \u00d7 (' + p.lo + ' to ' + p.hi + ') ' + p.ru + ' [Devine]' };
    }
    case 'wr_lbw': { // weight range using LBW
      if (d.cm === null) return { value: '\u2014', formula: 'Enter height for LBW' };
      var lbw = calcLBW(kg, d.cm);
      var lo = refRound(lbw * p.lo), hi = refRound(lbw * p.hi);
      return { value: lo + '-' + hi + ' ' + p.u,
        formula: 'LBW ' + refRound(lbw, 1) + ' kg \u00d7 (' + p.lo + ' to ' + p.hi + ') ' + p.ru + ' [James]' };
    }
    case 'ett': { // ETT tube size from height
      if (d.cm === null) return { value: '\u2014', formula: 'Enter height' };
      var size = refRound(d.cm / 10 - 9, 1);
      return { value: size + ' mm; insertion ' + p.ins,
        formula: d.cm + ' cm / 10 - 9 = ' + size + ' mm' };
    }
    case 'lma': { // LMA size lookup
      var size, cuff;
      if (kg < 5) { size = 1; cuff = 4; }
      else if (kg < 10) { size = 1.5; cuff = 7; }
      else if (kg < 20) { size = 2; cuff = 10; }
      else if (kg < 30) { size = 2.5; cuff = 14; }
      else if (kg < 50) { size = 3; cuff = 20; }
      else if (kg < 70) { size = 4; cuff = 30; }
      else { size = 5; cuff = 40; }
      return { value: 'Size ' + size + '; cuff ' + cuff + ' ml',
        formula: 'Weight-based lookup: ' + kg + ' kg \u2192 size ' + size };
    }
    case 'titration': { // titration with cap
      var lo = refRound(kg * p.lo / 1000, 2), hi = refRound(kg * p.hi / 1000, 1);
      return { value: lo + '-' + hi + ' mg per bolus; max ' + p.cap + ' mg',
        formula: kg + ' kg \u00d7 (' + p.lo + '-' + p.hi + ') mcg/kg = ' + refRound(kg * p.lo) + '-' + refRound(kg * p.hi) + ' mcg' };
    }
    default:
      return { value: '\u2014', formula: null };
  }
}

// ═══════════════════════════════════════════════════
// SECTION DATA
// Each item: { label, calc, params, status, src[], notes? }
// ═══════════════════════════════════════════════════
const REF_SECTIONS = [
  {
    title: 'Vital Signs',
    items: [
      { label: 'Vital signs', calc: 'pa', params: { v: 'Content not visible in screenshots' },
        status: 'unresolved', src: [], notes: 'Section header visible but all row content was above the scroll position.' }
    ]
  },
  {
    title: 'Airway',
    items: [
      { label: 'Cuffed ET tube', calc: 'ett', params: { ins: '20-22 cm' },
        status: 'partially_verified', src: [],
        notes: 'Height-based formula. Insertion distance may be a fixed male default.' },
      { label: 'LMA size', calc: 'lma', params: {},
        status: 'partially_verified', src: ['web:lma1'],
        notes: 'Weight-range lookup. Cuff volume is manufacturer-specified per size.' },
      { label: 'Tidal volume', calc: 'wr_ibw', params: { lo: 6, hi: 8, u: 'ml', ru: 'ml/kg IBW' },
        status: 'validated', src: ['web:tv1'],
        notes: 'Lung-protective ventilation targets 6 ml/kg IBW; range 6-8 matches ARDSNet guidance.' }
    ]
  },
  {
    title: 'Induction Agents',
    items: [
      { label: 'Propofol', calc: 'wr_lbw', params: { lo: 2, hi: 3, u: 'mg', ru: 'mg/kg LBW' },
        status: 'validated', src: ['web:ind1'], notes: 'Uses James lean body weight.' },
      { label: 'Ketamine', calc: 'wr_lbw', params: { lo: 1, hi: 2, u: 'mg', ru: 'mg/kg LBW' },
        status: 'validated', src: ['web:ind2'], notes: null },
      { label: 'Thiopental', calc: 'wr_lbw', params: { lo: 5, hi: 7, u: 'mg', ru: 'mg/kg LBW' },
        status: 'validated', src: [], notes: null },
      { label: 'Etomidate', calc: 'wr_lbw', params: { lo: 0.2, hi: 0.3, u: 'mg', ru: 'mg/kg LBW' },
        status: 'validated', src: ['web:ind3'], notes: null },
      { label: 'Midazolam', calc: 'wr_lbw', params: { lo: 0.15, hi: 0.35, u: 'mg', ru: 'mg/kg LBW' },
        status: 'validated', src: ['web:ind4'],
        notes: 'Wide range: higher end for sedation/induction, lower for premedication.' }
    ]
  },
  {
    title: 'Neuromuscular Blockers',
    items: [
      { label: 'Vecuronium', calc: 'ws_ibw', params: { f: 0.1, u: 'mg', ru: 'mg/kg IBW (2 ED95)' },
        status: 'validated', src: ['web:nmb1'], notes: null },
      { label: 'Rocuronium', calc: 'ws_ibw', params: { f: 0.6, u: 'mg', ru: 'mg/kg IBW (2 ED95)' },
        status: 'validated', src: ['web:nmb1'], notes: null },
      { label: 'Pancuronium', calc: 'ws_ibw', params: { f: 0.14, u: 'mg', ru: 'mg/kg IBW (2 ED95)' },
        status: 'validated', src: ['web:nmb1'], notes: null },
      { label: 'Cisatracurium', calc: 'ws_ibw', params: { f: 0.1, u: 'mg', ru: 'mg/kg IBW (2 ED95)' },
        status: 'validated', src: ['web:nmb1'], notes: null },
      { label: 'Atracurium', calc: 'ws_ibw', params: { f: 0.46, u: 'mg', ru: 'mg/kg IBW (2 ED95)' },
        status: 'validated', src: ['web:nmb1'], notes: null },
      { label: 'Succinylcholine', calc: 'ws', params: { f: 1, u: 'mg', ru: 'mg/kg TBW (2 ED95)' },
        status: 'validated', src: ['web:nmb2'],
        notes: 'Uses total body weight (TBW), not IBW. Only NMB in this section dosed on TBW.' }
    ]
  },
  {
    title: 'Antagonists',
    items: [
      { label: 'Neostigmine', calc: 'wr', params: { lo: 0.04, hi: 0.07, u: 'mg', ru: 'mg/kg TBW' },
        status: 'validated', src: ['web:neo1'], notes: 'Neuromuscular reversal. Uses TBW.' },
      { label: 'Sugammadex', calc: 'ws', params: { f: 2, u: 'mg', ru: 'mg/kg TBW; TOF 1-3' },
        status: 'validated', src: ['web:sug1'],
        notes: 'TOF 1-3 indication. Standard 4 mg/kg dose for deep block not shown on this screen.' },
      { label: 'Naloxone', calc: 'titration', params: { lo: 10, hi: 100, cap: 10 },
        status: 'validated', src: ['web:nal1'],
        notes: 'Typical titration band 0.1-2.0 mg; weight formula anchors per-bolus dosing.' },
      { label: 'Flumazenil', calc: 'fd', params: { v: '0.2 mg initial; titrate 0.7 mg/bolus; max 1 mg', f: 'Initial 0.2 mg then 10 mcg/kg per titration' },
        status: 'validated', src: ['web:flu1'],
        notes: '0.2 mg is standard initial reversal dose regardless of weight.' }
    ]
  },
  {
    title: 'Anticholinergics',
    items: [
      { label: 'Atropine', calc: 'ws', params: { f: 0.02, u: 'mg', ru: 'mg/kg' },
        status: 'screen_confirmed', src: [], notes: null },
      { label: 'Glycopyrrolate', calc: 'ws', params: { f: 10, u: 'mcg', ru: 'mcg/kg' },
        status: 'screen_confirmed', src: [], notes: null }
    ]
  },
  {
    title: 'Local Anesthetics',
    items: [
      { label: 'Lidocaine', calc: 'wr', params: { lo: 1.5, hi: 6, u: 'mg', ru: 'mg/kg' },
        status: 'partially_verified', src: ['web:125'], notes: null },
      { label: 'Bupivacaine', calc: 'wr', params: { lo: 1.5, hi: 3, u: 'mg', ru: 'mg/kg' },
        status: 'partially_verified', src: ['web:125'], notes: null },
      { label: 'Intralipid 20%', calc: 'bolus_inf', params: { bf: 2, ilo: 0.25, ihi: 0.5, u: 'ml' },
        status: 'partially_verified', src: ['web:133'],
        notes: 'Infusion logic matches LAST guidance; bolus appears closer to 2 ml/kg than 1.5 ml/kg.' }
    ]
  },
  {
    title: 'Analgesics',
    items: [
      { label: 'Fentanyl', calc: 'ws', params: { f: 1, u: 'mcg', ru: 'mcg/kg' },
        status: 'validated', src: ['web:134'], notes: null },
      { label: 'Hydromorphone', calc: 'ws', params: { f: 0.01, u: 'mg', ru: 'mg/kg' },
        status: 'validated', src: ['web:144'], notes: null },
      { label: 'Morphine', calc: 'ws', params: { f: 0.1, u: 'mg', ru: 'mg/kg' },
        status: 'partially_verified', src: [], notes: null },
      { label: 'Oxycodone', calc: 'ws', params: { f: 0.1, u: 'mg', ru: 'mg/kg' },
        status: 'partially_verified', src: ['web:147'], notes: null },
      { label: 'Meperidine', calc: 'ws', params: { f: 0.5, u: 'mg', ru: 'mg/kg' },
        status: 'partially_verified', src: [], notes: null },
      { label: 'Ketorolac', calc: 'ws', params: { f: 0.5, u: 'mg', ru: 'mg/kg' },
        status: 'partially_verified', src: ['web:146'], notes: null },
      { label: 'Diclofenac', calc: 'ws', params: { f: 1, u: 'mg', ru: 'mg/kg' },
        status: 'partially_verified', src: ['web:147'], notes: null },
      { label: 'Ibuprofen', calc: 'ws', params: { f: 5, u: 'mg', ru: 'mg/kg' },
        status: 'validated', src: ['web:144'], notes: null },
      { label: 'Paracetamol', calc: 'ws', params: { f: 15, u: 'mg', ru: 'mg/kg' },
        status: 'validated', src: ['web:157'], notes: null },
      { label: 'Dipyrone', calc: 'ws', params: { f: 20, u: 'mg', ru: 'mg/kg' },
        status: 'partially_verified', src: [], notes: null },
      { label: 'Tramadol', calc: 'ws', params: { f: 1, u: 'mg', ru: 'mg/kg' },
        status: 'partially_verified', src: [], notes: null }
    ]
  },
  {
    title: 'Inotropes & Vasopressors',
    items: [
      { label: 'Norepinephrine 16 mcg/ml', calc: 'cr', params: { dose: 0.05, conc: 16, du: 'mcg/kg/min', cu: 'mcg/ml' },
        status: 'validated', src: ['web:161'], notes: null },
      { label: 'Vasopressin 1 IU/ml', calc: 'cr_fixed', params: { dose: 0.1, conc: 1, du: 'IU/min', cu: 'IU/ml' },
        status: 'partially_verified', src: ['web:164'],
        notes: 'Rate math is exact; target dose is higher than many common shock references.' },
      { label: 'Dobutamine 2 mg/ml', calc: 'cr', params: { dose: 2, conc: 2000, du: 'mcg/kg/min', cu: 'mcg/ml' },
        status: 'validated', src: ['web:161'], notes: null },
      { label: 'Milrinone 200 mcg/ml', calc: 'cr', params: { dose: 0.375, conc: 200, du: 'mcg/kg/min', cu: 'mcg/ml' },
        status: 'validated', src: ['web:161', 'web:170'], notes: null },
      { label: 'Nitroprusside 200 mcg/ml', calc: 'cr', params: { dose: 0.2, conc: 200, du: 'mcg/kg/min', cu: 'mcg/ml' },
        status: 'issue', src: ['web:184'],
        notes: 'KNOWN ISSUE: Screen showed 2.1 ml/h for 70 kg but formula yields 4.2 ml/h. This display uses the corrected formula.' },
      { label: 'Labetalol', calc: 'fd', params: { v: '10-20 mg IV; double to 80 mg; max 300 mg', f: 'Stepwise bolus escalation' },
        status: 'validated', src: ['web:173'], notes: null }
    ]
  },
  {
    title: 'Antiarrhythmics',
    items: [
      { label: 'Amiodarone \u2014 VF arrest', calc: 'wc', params: { f: 5, cap: 300, u: 'mg', ru: 'mg/kg IV, max 300 mg' },
        status: 'validated', src: ['web:180'], notes: null },
      { label: 'Amiodarone \u2014 AF rate ctrl', calc: 'fd', params: { v: '150 mg over 10-30 min', f: 'Fixed dose infusion' },
        status: 'partially_verified', src: [], notes: null },
      { label: 'Metoprolol \u2014 AF rate ctrl', calc: 'fd', params: { v: '2.5-5 mg q5min; max 15 mg', f: 'Repeat bolus to effect' },
        status: 'validated', src: ['web:180'], notes: null },
      { label: 'Digoxin 50 mcg/ml', calc: 'fd', params: { v: '30 ml/h for 10 min (250 mcg)', f: 'Concentration \u00d7 rate \u00d7 duration' },
        status: 'partially_verified', src: [], notes: null }
    ]
  },
  {
    title: 'Hyperkalemia',
    items: [
      { label: 'Ca chloride 10%', calc: 'wr', params: { lo: 0.05, hi: 0.1, u: 'ml', ru: 'ml/kg' },
        status: 'partially_verified', src: ['web:188'], notes: null },
      { label: 'Ca gluconate 10%', calc: 'wr', params: { lo: 0.15, hi: 0.3, u: 'ml', ru: 'ml/kg' },
        status: 'partially_verified', src: ['web:188'], notes: null },
      { label: 'Salbutamol', calc: 'fd', params: { v: '10-20 mg / 4 ml inhaled', f: 'Fixed dose nebulized' },
        status: 'validated', src: ['web:208'], notes: null },
      { label: 'Furosemide', calc: 'fd', params: { v: '20-40 mg IV', f: 'Fixed range' },
        status: 'partially_verified', src: ['web:188'], notes: null },
      { label: 'Hyperventilation', calc: 'pa', params: { v: 'Action item' },
        status: 'partially_verified', src: [], notes: null },
      { label: 'Dextrose + Insulin', calc: 'fd', params: { v: 'D10W 500 ml or D50W 50 ml + 10 U insulin over 30-60 min', f: 'Fixed combination regimen' },
        status: 'validated', src: ['web:188', 'web:208'], notes: null },
      { label: 'Kayexalate', calc: 'wc', params: { f: 1, cap: 40, u: 'g q4h', ru: 'g/kg, max 40 g' },
        status: 'partially_verified', src: ['web:194'], notes: null }
    ]
  },
  {
    title: 'Severe Hypokalemia',
    items: [
      { label: 'KCl 200 mEq/L', calc: 'fd', params: { v: '50-100 ml/h = 10-20 mEq/h; central access', f: 'Concentration \u00d7 rate' },
        status: 'validated', src: ['web:224'], notes: null },
      { label: 'KCl 100 mEq/L', calc: 'fd', params: { v: '100 ml/h = 10 mEq/h; central access', f: 'Concentration \u00d7 rate' },
        status: 'validated', src: ['web:224'], notes: null }
    ]
  },
  {
    title: 'Malignant Hyperthermia',
    items: [
      { label: 'Stop triggering agent', calc: 'pa', params: { v: 'Halogenated agents, Succinylcholine' },
        status: 'validated', src: ['web:218'], notes: null },
      { label: 'Call for help', calc: 'pa', params: { v: 'FiO\u2082 100%, high flow >10 L/min; double minute ventilation; switch to TIVA' },
        status: 'validated', src: ['web:218'], notes: null },
      { label: 'Dantrolene \u2014 initial', calc: 'wr', params: { lo: 2, hi: 3, u: 'mg', ru: 'mg/kg IV bolus' },
        status: 'partially_verified', src: ['web:216', 'web:218'],
        notes: 'Compatible with standard 2.5 mg/kg initial dosing band.' },
      { label: 'Active cooling', calc: 'pa', params: { v: 'Ice packs, cold forced air, gastric lavage, etc.' },
        status: 'validated', src: ['web:218'], notes: null },
      { label: 'Associated conditions', calc: 'pa',
        params: { v: 'Hyperkalemia: CaCl\u2082, NaHCO\u2083, glucose-insulin | Acidosis: NaHCO\u2083 | Arrhythmias: Esmolol, Lidocaine' },
        status: 'partially_verified', src: ['web:218'], notes: null },
      { label: 'Contraindicated drugs', calc: 'pa', params: { v: 'Calcium blockers (Verapamil, Nifedipine)' },
        status: 'partially_verified', src: ['web:232'],
        notes: 'App wording appears broader and more conservative than the strongest external support.' },
      { label: 'Dantrolene \u2014 repeat bolus', calc: 'ws', params: { f: 2.5, u: 'mg', ru: 'mg/kg IV' },
        status: 'validated', src: ['web:245'], notes: null },
      { label: 'Dantrolene \u2014 ICU maintenance', calc: 'ws', params: { f: 1, u: 'mg q4-8h', ru: 'mg/kg; max 10 mg/kg total' },
        status: 'partially_verified', src: ['web:245'],
        notes: 'Standard guidance more commonly states q4-6h.' }
    ]
  },
  {
    title: 'Anesthetic Crisis',
    items: [
      { label: 'Adrenaline', calc: 'fd',
        params: { v: '10 mcg bradycardia; 50 mcg refractory hypotension; 1 mg arrest', f: 'Scenario-based fixed dose' },
        status: 'partially_verified', src: ['web:254', 'web:260'],
        notes: '1 mg arrest dose is standard ACLS; smaller boluses are push-dose guidance.' },
      { label: 'Adenosine', calc: 'fd',
        params: { v: '6 mg / 12 mg (100-200 mcg/kg, max 6/12 mg)', f: 'Capped weight-based escalation' },
        status: 'validated', src: ['web:247'], notes: null },
      { label: 'Bicarbonate', calc: 'wr', params: { lo: 1, hi: 2, u: 'mEq', ru: 'mEq/kg IV' },
        status: 'validated', src: ['web:218', 'web:262'], notes: null },
      { label: 'Hydrocortisone', calc: 'wr', params: { lo: 2, hi: 3, u: 'mg', ru: 'mg/kg IV (Anaphylaxis)' },
        status: 'partially_verified', src: [], notes: null },
      { label: 'Dextrose', calc: 'dext', params: {},
        status: 'partially_verified', src: ['web:271'], notes: null },
      { label: 'Insulin', calc: 'fd',
        params: { v: '2-4 IU (Glucose 141-180 mg/dL)', f: 'Glucose band lookup' },
        status: 'partially_verified', src: ['web:278'], notes: null },
      { label: 'Cardioversion', calc: 'esc', params: { lo: 0.5, hi: 2, mode: 'SYNC' },
        status: 'partially_verified', src: ['web:286'],
        notes: 'Text rule is standard; original screen fixed joules did not match 70 kg patient.' },
      { label: 'Defibrillation', calc: 'esc', params: { lo: 2, hi: 4, mode: 'ASYNC' },
        status: 'partially_verified', src: ['web:298'],
        notes: 'Text rule is standard; original screen fixed joules appeared simplified.' },
      { label: 'Sono gastric volume', calc: 'sono', params: {},
        status: 'partially_verified', src: ['web:291'],
        notes: 'Requires ultrasound CSA input. Formula: Vol = 27 + 14.6 \u00d7 RLD_CSA - 1.28 \u00d7 age' }
    ]
  },
  {
    title: 'Resuscitation: Blood & Fluids',
    items: [
      { label: 'IV maintenance (4/2/1)', calc: 'maint', params: {},
        status: 'validated', src: ['web:290'], notes: null },
      { label: '6 h fasting deficit', calc: 'fasting', params: { hours: 6 },
        status: 'validated', src: ['web:290'], notes: null },
      { label: 'Mannitol 20%', calc: 'wr', params: { lo: 1.25, hi: 2.5, u: 'ml', ru: 'ml/kg (0.25-0.5 g/kg)' },
        status: 'partially_verified', src: [], notes: null },
      { label: 'HS 7.5%', calc: 'ws', params: { f: 2, u: 'ml', ru: 'ml/kg IV' },
        status: 'partially_verified', src: [], notes: null },
      { label: 'PRBC', calc: 'ws', params: { f: 4, u: 'ml', ru: 'ml/kg; expect Hb +1 g/dL' },
        status: 'partially_verified', src: ['web:303'], notes: null },
      { label: 'Plateletpheresis', calc: 'wr', params: { lo: 5, hi: 10, u: 'ml', ru: 'ml/kg; expect +50-100k' },
        status: 'partially_verified', src: ['web:304'], notes: null },
      { label: 'FFP', calc: 'wr', params: { lo: 10, hi: 15, u: 'ml', ru: 'ml/kg' },
        status: 'validated', src: ['web:304'], notes: null },
      { label: 'Cryoprecipitate', calc: 'fd',
        params: { v: '1-2 units/10 kg; expect Fib +60-100 mg/dL', f: 'Weight-based units' },
        status: 'validated', src: ['web:301', 'web:315'], notes: null },
      { label: 'Estimated blood volume', calc: 'ebv', params: { f: 75 },
        status: 'validated', src: ['web:322'], notes: null },
      { label: 'Allowable blood loss', calc: 'abl', params: { hi: 40, hf: 30 },
        status: 'validated', src: ['web:322'],
        notes: 'Using default initial Hct 40% and final Hct 30%. ABL = EBV \u00d7 (Hi-Hf)/Hi.' }
    ]
  },
  {
    title: 'CPB / Derived Physiology',
    items: [
      { label: 'Heparin dose', calc: 'wr', params: { lo: 300, hi: 400, u: 'U', ru: 'U/kg' },
        status: 'validated', src: ['web:319'], notes: null },
      { label: 'Delta Hct', calc: 'pa', params: { v: 'Interactive \u2014 not available' },
        status: 'unresolved', src: [], notes: 'Original app used interactive input; formula not exposed.' },
      { label: 'Target Hct', calc: 'pa', params: { v: 'Interactive \u2014 not available' },
        status: 'unresolved', src: [], notes: 'Original app used interactive input; formula not exposed.' },
      { label: 'BSA (Mosteller)', calc: 'bsa', params: {},
        status: 'validated', src: ['web:24'], notes: null },
      { label: 'Cardiac output (CI 2.5)', calc: 'co', params: { ci: 2.5 },
        status: 'validated', src: [], notes: null },
      { label: 'Creatinine clearance', calc: 'crcl', params: { cr: 0.6 },
        status: 'validated', src: ['web:332'],
        notes: 'Cockcroft-Gault + BSA normalization. Uses default Cr 0.6, male. App labels as CG but displays BSA-normalized units.' }
    ]
  }
];

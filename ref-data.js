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
  'occ:card': 'OpenCriticalCare Pocket Anesthesia Reference Card v4.212 — UCSF et al.',
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
// IBW: Devine formula
//   Male:   50   + 2.3 × (height_in - 60)
//   Female: 45.5 + 2.3 × (height_in - 60)
// Source: StatPearls NBK535456
function calcIBW(heightCm, sex) {
  var heightIn = heightCm / 2.54;
  var base = (sex === 'F') ? 45.5 : 50;
  return base + 2.3 * (heightIn - 60);
}
// LBW: James formula
//   Male:   1.1  × TBW - 128 × (TBW/height_cm)²
//   Female: 1.07 × TBW - 148 × (TBW/height_cm)²
// Source: Anaesthesia journal, doi:10.1111/j.1365-2044.2009.06063.x
function calcLBW(kg, heightCm, sex) {
  if (sex === 'F') return 1.07 * kg - 148 * Math.pow(kg / heightCm, 2);
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
      return { value: v + ' ' + p.u, wt: refRound(kg, 1) + ' kg',
        formula: kg + ' kg \u00d7 ' + p.f + ' ' + p.ru };
    }
    case 'wr': { // weight range
      var lo = refRound(kg * p.lo), hi = refRound(kg * p.hi);
      return { value: lo + '-' + hi + ' ' + p.u, wt: refRound(kg, 1) + ' kg',
        formula: kg + ' kg \u00d7 (' + p.lo + ' to ' + p.hi + ') ' + p.ru };
    }
    case 'wc': { // weight capped
      var raw = kg * p.f, v = refRound(Math.min(raw, p.cap));
      var note = raw > p.cap ? ' (capped at ' + p.cap + ')' : '';
      return { value: v + ' ' + p.u + note, wt: refRound(kg, 1) + ' kg',
        formula: 'min(' + kg + ' kg \u00d7 ' + p.f + ', ' + p.cap + ') ' + p.ru };
    }
    case 'cr': { // concentration to rate
      var rate = refRound(kg * p.dose * 60 / p.conc, 1);
      return { value: rate + ' ml/h', wt: refRound(kg, 1) + ' kg',
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
      return { value: rate + ' ml/h', wt: refRound(kg, 1) + ' kg',
        formula: '4/2/1 rule: 4 ml/kg/h first 10 kg + 2 ml/kg/h next 10 kg + 1 ml/kg/h remainder' };
    }
    case 'fasting': {
      var rate = maintenanceRate(kg);
      var vol = refRound(rate * p.hours, 0);
      return { value: vol + ' ml', wt: refRound(kg, 1) + ' kg',
        formula: refRound(rate, 0) + ' ml/h \u00d7 ' + p.hours + ' h' };
    }
    case 'ebv': {
      var v = refRound(kg * p.f, 0);
      return { value: v + ' ml', wt: refRound(kg, 1) + ' kg',
        formula: kg + ' kg \u00d7 ' + p.f + ' ml/kg' };
    }
    case 'abl': {
      var ebv = kg * 70;
      var abl = refRound(ebv * (p.hi - p.hf) / p.hi, 0);
      return { value: abl + ' ml', wt: refRound(kg, 1) + ' kg',
        formula: refRound(ebv, 0) + ' ml EBV \u00d7 (' + p.hi + ' - ' + p.hf + ') / ' + p.hi };
    }
    case 'bsa': {
      if (cm === null) return { value: '\u2014', formula: 'Enter height' };
      var bsa = Math.sqrt(cm * kg / 3600);
      return { value: refRound(bsa, 2) + ' m\u00b2', wt: refRound(kg, 1) + ' kg',
        formula: '\u221a(' + cm + ' cm \u00d7 ' + kg + ' kg / 3600) [Mosteller]' };
    }
    case 'co': {
      if (cm === null) return { value: '\u2014', formula: 'Enter height' };
      var bsa = Math.sqrt(cm * kg / 3600);
      var co = refRound(p.ci * bsa, 2);
      return { value: co + ' L/min', wt: refRound(kg, 1) + ' kg',
        formula: 'CI ' + p.ci + ' \u00d7 BSA ' + refRound(bsa, 2) + ' m\u00b2' };
    }
    case 'crcl': {
      if (age === null || cm === null) return { value: '\u2014', formula: 'Enter age and height' };
      var bsa = Math.sqrt(cm * kg / 3600);
      var raw = ((140 - age) * kg) / (72 * p.cr);
      if (d.sex === 'F') raw *= 0.85;
      var norm = refRound(raw * 1.73 / bsa, 1);
      var sexNote = d.sex === 'F' ? ' \u00d7 0.85' : '';
      return { value: norm + ' ml/min/1.73m\u00b2', wt: refRound(kg, 1) + ' kg',
        formula: '((140-' + age + ') \u00d7 ' + kg + ') / (72 \u00d7 ' + p.cr + ')' + sexNote + ' \u00d7 1.73 / BSA ' + refRound(bsa, 2) + ' [CG + BSA norm, ' + (d.sex || 'M') + ']' };
    }
    case 'bolus_inf': {
      var bml = refRound(kg * p.bf);
      var lo = refRound(kg * p.ilo * 60), hi = refRound(kg * p.ihi * 60);
      return { value: bml + ' ml bolus; ' + lo + '-' + hi + ' ml/h infusion', wt: refRound(kg, 1) + ' kg',
        formula: 'Bolus: ' + kg + ' kg \u00d7 ' + p.bf + ' ml/kg; Infusion: ' + kg + ' kg \u00d7 (' + p.ilo + '-' + p.ihi + ') ml/kg/min \u00d7 60' };
    }
    case 'esc': { // escalation (cardioversion/defib)
      var lo = refRound(kg * p.lo, 0), hi = refRound(kg * p.hi, 0);
      return { value: lo + '-' + hi + ' J', wt: refRound(kg, 1) + ' kg',
        formula: kg + ' kg \u00d7 ' + p.lo + ' to ' + p.hi + ' J/kg ' + p.mode };
    }
    case 'dext': { // dextrose equivalents
      var d50 = refRound(kg * 0.5, 0), d10 = refRound(kg * 2.5, 0);
      return { value: d50 + ' ml D50W / ' + d10 + ' ml D10W', wt: refRound(kg, 1) + ' kg',
        formula: 'D50W: ' + kg + ' kg \u00d7 0.5 ml/kg; D10W: ' + kg + ' kg \u00d7 2.5 ml/kg' };
    }
    case 'sono': {
      return { value: 'Requires US input', formula: 'Vol = 27 + 14.6 \u00d7 RLD_CSA - 1.28 \u00d7 age' };
    }
    case 'occ_ws': { // OCC weight single
      var v = refRound(kg * p.f);
      return { value: v + ' ' + p.u, wt: refRound(kg, 1) + ' kg', formula: p.card };
    }
    case 'occ_wr': { // OCC weight range
      var lo = refRound(kg * p.lo), hi = refRound(kg * p.hi);
      return { value: lo + '-' + hi + ' ' + p.u, wt: refRound(kg, 1) + ' kg', formula: p.card };
    }
    case 'occ_wc': { // OCC weight capped
      var raw = kg * p.f, v = refRound(Math.min(raw, p.cap));
      var note = raw > p.cap ? ' (capped)' : '';
      return { value: v + note + ' ' + p.u, wt: refRound(kg, 1) + ' kg', formula: p.card };
    }
    case 'occ_max': { // OCC weight-based toxic max dose — multiple lines
      var plain = refRound(kg * p.f);
      var lines = 'Plain: ' + plain + ' ' + p.u + ' (' + p.f + ' ' + p.u + '/kg)';
      if (p.f2) lines += '\nWith epi: ' + refRound(kg * p.f2) + ' ' + p.u + ' (' + p.f2 + ' ' + p.u + '/kg)';
      return { value: lines, wt: refRound(kg, 1) + ' kg', formula: p.card };
    }
    case 'ws_ibw': { // weight single using IBW
      if (d.cm === null) return { value: '\u2014', formula: 'Enter height for IBW' };
      var ibw = calcIBW(d.cm, d.sex);
      var v = refRound(ibw * p.f);
      return { value: v + ' ' + p.u, wt: 'IBW ' + refRound(ibw, 1) + ' kg',
        formula: 'IBW ' + refRound(ibw, 1) + ' kg \u00d7 ' + p.f + ' ' + p.ru + ' [Devine, ' + (d.sex || 'M') + ']' };
    }
    case 'wr_ibw': { // weight range using IBW
      if (d.cm === null) return { value: '\u2014', formula: 'Enter height for IBW' };
      var ibw = calcIBW(d.cm, d.sex);
      var lo = refRound(ibw * p.lo), hi = refRound(ibw * p.hi);
      return { value: lo + '-' + hi + ' ' + p.u, wt: 'IBW ' + refRound(ibw, 1) + ' kg',
        formula: 'IBW ' + refRound(ibw, 1) + ' kg \u00d7 (' + p.lo + ' to ' + p.hi + ') ' + p.ru + ' [Devine, ' + (d.sex || 'M') + ']' };
    }
    case 'wr_lbw': { // weight range using LBW
      if (d.cm === null) return { value: '\u2014', formula: 'Enter height for LBW' };
      var lbw = calcLBW(kg, d.cm, d.sex);
      var lo = refRound(lbw * p.lo), hi = refRound(lbw * p.hi);
      return { value: lo + '-' + hi + ' ' + p.u, wt: 'LBW ' + refRound(lbw, 1) + ' kg',
        formula: 'LBW ' + refRound(lbw, 1) + ' kg \u00d7 (' + p.lo + ' to ' + p.hi + ') ' + p.ru + ' [James, ' + (d.sex || 'M') + ']' };
    }
    case 'ett': { // ETT tube size from height
      if (d.cm === null) return { value: '\u2014', formula: 'Enter height' };
      var size = refRound(d.cm / 10 - 9, 1);
      return { value: size + ' mm; insertion ' + p.ins, wt: d.cm + ' cm',
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
      return { value: 'Size ' + size + '; cuff ' + cuff + ' ml', wt: refRound(kg, 1) + ' kg',
        formula: 'Weight-based lookup: ' + kg + ' kg \u2192 size ' + size };
    }
    case 'titration': { // titration with cap
      var lo = refRound(kg * p.lo / 1000, 2), hi = refRound(kg * p.hi / 1000, 1);
      return { value: lo + '-' + hi + ' mg per bolus; max ' + p.cap + ' mg', wt: refRound(kg, 1) + ' kg',
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
        status: 'validated', src: ['occ:card'], notes: 'Card: 0.02 mg/kg; adult arrest 1mg q3-5min.' },
      { label: 'Glycopyrrolate', calc: 'ws', params: { f: 10, u: 'mcg', ru: 'mcg/kg' },
        status: 'validated', src: ['occ:card'], notes: 'Card: 0.2mg adult, 4-10 mcg/kg peds.' }
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
        status: 'validated', src: ['web:188', 'occ:card'], notes: 'Card: 0.5-1g CaCl IV.' },
      { label: 'Ca gluconate 10%', calc: 'wr', params: { lo: 0.15, hi: 0.3, u: 'ml', ru: 'ml/kg' },
        status: 'partially_verified', src: ['web:188'], notes: null },
      { label: 'Salbutamol', calc: 'fd', params: { v: '10-20 mg / 4 ml inhaled', f: 'Fixed dose nebulized' },
        status: 'validated', src: ['web:208'], notes: null },
      { label: 'Furosemide', calc: 'fd', params: { v: '40-80 mg IV', f: 'Fixed range' },
        status: 'validated', src: ['web:188', 'occ:card'], notes: null },
      { label: 'Hyperventilation', calc: 'pa', params: { v: 'Action item' },
        status: 'partially_verified', src: [], notes: null },
      { label: 'Dextrose + Insulin', calc: 'fd', params: { v: 'D10W 500 ml or D50W 50 ml + 10 U insulin over 30-60 min', f: 'Fixed combination regimen' },
        status: 'validated', src: ['web:188', 'web:208'], notes: null },
      { label: 'Kayexalate', calc: 'wc', params: { f: 1, cap: 40, u: 'g q4h', ru: 'g/kg, max 40 g' },
        status: 'validated', src: ['web:194', 'occ:card'], notes: 'Card: 15-50g PO.' }
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
        status: 'validated', src: ['web:216', 'web:218', 'occ:card'],
        notes: 'Card confirms 2.5 mg/kg. Range 2-3 covers standard dosing band.' },
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
        status: 'validated', src: ['web:254', 'web:260', 'occ:card'],
        notes: 'Card: 0.5-1mg arrest, 10-50mcg IV increments if hypotensive.' },
      { label: 'Adenosine', calc: 'fd',
        params: { v: '6 mg / 12 mg (100-200 mcg/kg, max 6/12 mg)', f: 'Capped weight-based escalation' },
        status: 'validated', src: ['web:247'], notes: null },
      { label: 'Bicarbonate', calc: 'wr', params: { lo: 1, hi: 2, u: 'mEq', ru: 'mEq/kg IV' },
        status: 'validated', src: ['web:218', 'web:262'], notes: null },
      { label: 'Hydrocortisone', calc: 'wr', params: { lo: 2, hi: 3, u: 'mg', ru: 'mg/kg IV (Anaphylaxis)' },
        status: 'validated', src: ['occ:card'], notes: 'Card: 100mg IV for anaphylaxis.' },
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
      { label: 'Estimated blood volume', calc: 'ebv', params: { f: 70 },
        status: 'validated', src: ['web:322', 'occ:card'],
        notes: 'Adult 70 ml/kg. Term neonates 84 ml/kg, infants 0-1yr 80 ml/kg.' },
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

// ═══════════════════════════════════════════════════
// OCC COMPENDIUM — OpenCriticalCare Pocket Card v4.212
// All items: status 'validated', src ['occ:card']
// ═══════════════════════════════════════════════════
var OCC = 'validated', OCS = ['occ:card'];

var OCC_SECTIONS = [
  {
    title: 'OCC: Quick Reference',
    items: [
      { label: 'NPO \u2014 Clear fluids', calc: 'fd', params: { v: '\u2265 2 hours', f: 'ASA fasting guideline' }, status: OCC, src: OCS, notes: null },
      { label: 'NPO \u2014 Breast milk', calc: 'fd', params: { v: '\u2265 4 hours', f: 'ASA fasting guideline' }, status: OCC, src: OCS, notes: null },
      { label: 'NPO \u2014 Light meal', calc: 'fd', params: { v: '\u2265 6 hours', f: 'ASA fasting guideline' }, status: OCC, src: OCS, notes: null },
      { label: 'NPO \u2014 Full meal', calc: 'fd', params: { v: '\u2265 8 hours', f: 'ASA fasting guideline' }, status: OCC, src: OCS, notes: null },
      { label: 'EBV \u2014 Term neonate', calc: 'fd', params: { v: '84 ml/kg', f: 'Age-based estimate' }, status: OCC, src: OCS, notes: null },
      { label: 'EBV \u2014 Infant 0-1yr', calc: 'fd', params: { v: '80 ml/kg', f: 'Age-based estimate' }, status: OCC, src: OCS, notes: null },
      { label: 'EBV \u2014 Adult', calc: 'ebv', params: { f: 70 }, status: OCC, src: OCS, notes: null },
      { label: 'ABL formula', calc: 'fd', params: { v: 'EBV \u00d7 (init Hgb \u2212 final Hgb) / init Hgb', f: 'Reference formula' }, status: OCC, src: OCS, notes: null },
      { label: 'Maintenance fluids', calc: 'maint', params: {}, status: OCC, src: OCS, notes: '4/2/1 rule: 4 ml/kg/h first 10 kg, 2 ml/kg/h next 10 kg, 1 ml/kg/h remainder.' },
      { label: 'Drug calc \u2014 Percentage', calc: 'fd', params: { v: '1% = 10 mg/ml', f: 'Percentage solution = g per 100 ml' }, status: OCC, src: OCS, notes: 'Example: 2% lidocaine = 20 mg/ml.' },
      { label: 'Drug calc \u2014 Ratio', calc: 'fd', params: { v: '1:1000 = 1 mg/ml', f: 'Ratio solution = g per volume in ml' }, status: OCC, src: OCS, notes: '1:10,000 = 0.1 mg/ml; 1:100,000 = 0.01 mg/ml (10 mcg/ml).' }
    ]
  },
  {
    title: 'OCC: Emergencies',
    items: [
      { label: 'High/Total Spinal \u2014 Signs', calc: 'pa', params: { v: 'Numbness, paresthesia, weakness of UEs; rapid unexpected rise of block; apnea, bradycardia, hypotension; LOC' }, status: OCC, src: OCS, notes: null },
      { label: 'High Spinal \u2014 Treatment', calc: 'pa', params: { v: 'Call for help; support ventilation/intubate; epinephrine 5-10 mcg boluses; IV fluids; if arrest \u2192 ACLS' }, status: OCC, src: OCS, notes: null },
      { label: 'Hyperkalemia \u2014 Calcium', calc: 'fd', params: { v: '0.5-1 g CaCl IV', f: 'Membrane stabilizer' }, status: OCC, src: OCS, notes: 'Or Ca gluconate equivalent.' },
      { label: 'Hyperkalemia \u2014 Bicarb', calc: 'fd', params: { v: '25-50 mEq IV', f: 'K+ shift' }, status: OCC, src: OCS, notes: null },
      { label: 'Hyperkalemia \u2014 Insulin/D50', calc: 'fd', params: { v: '5-10 U regular insulin + 25-50g D50 IV', f: 'K+ shift' }, status: OCC, src: OCS, notes: null },
      { label: 'Hyperkalemia \u2014 Albuterol', calc: 'fd', params: { v: 'Puffs or nebulizer', f: 'K+ shift' }, status: OCC, src: OCS, notes: null },
      { label: 'Hyperkalemia \u2014 Kayexalate', calc: 'fd', params: { v: '15-50 g PO', f: 'K+ elimination' }, status: OCC, src: OCS, notes: null },
      { label: 'Hyperkalemia \u2014 Furosemide', calc: 'fd', params: { v: '40-80 mg IV', f: 'K+ elimination' }, status: OCC, src: OCS, notes: null },
      { label: 'Anaphylaxis \u2014 Epinephrine', calc: 'fd', params: { v: 'Arrest: 0.5-1 mg IV; Hypotension: 10-50 mcg IV increments; No IV: 300 mcg IM', f: 'First-line treatment' }, status: OCC, src: OCS, notes: 'Begin infusion if needed.' },
      { label: 'Anaphylaxis \u2014 Fluids', calc: 'fd', params: { v: 'Open IV fluids, albuterol for bronchospasm', f: 'Volume resuscitation' }, status: OCC, src: OCS, notes: null },
      { label: 'Anaphylaxis \u2014 Adjuncts', calc: 'fd', params: { v: 'Diphenhydramine 25-50 mg IV; Ranitidine 50 mg IV; Hydrocortisone 100 mg IV', f: 'Second-line agents' }, status: OCC, src: OCS, notes: 'Or methylprednisolone 125 mg IV.' }
    ]
  },
  {
    title: 'OCC: Medications A-E',
    items: [
      { label: 'Adenosine', calc: 'fd', params: { v: 'Adult: 6 mg IV push, then 12 mg; Peds: 0.1 mg/kg', f: 'Rapid IV push with flush. Max peds 6 mg first, 12 mg repeat.' }, status: OCC, src: OCS, notes: null },
      { label: 'Albuterol', calc: 'fd', params: { v: '2.5 mg nebulized q20min; MDI 4-8 puffs q20min', f: 'Bronchospasm. Racemic 2.25% soln 0.25-0.5 ml via neb.' }, status: OCC, src: OCS, notes: null },
      { label: 'Amiodarone', calc: 'occ_wc', params: { f: 5, cap: 300, u: 'mg IV (arrest)', card: 'Arrest: 5 mg/kg IV (max 300 mg). Rhythm: 150-300 mg IV over 30 min, then infusion 1 mg/min \u00d7 6h. Peds: repeat \u00d7 2.' }, status: OCC, src: OCS, notes: null },
      { label: 'Atracurium', calc: 'occ_wr', params: { lo: 0.4, hi: 0.5, u: 'mg IV', card: '0.4-0.5 mg/kg IV. Infusion 5-20 mcg/kg/min.' }, status: OCC, src: OCS, notes: null },
      { label: 'Atropine', calc: 'occ_ws', params: { f: 0.02, u: 'mg', card: 'Peds: 0.02 mg/kg (min 0.1 mg, max 0.5 mg). Adult arrest: 1 mg q3-5 min. Pretreatment: 0.01-0.02 mg/kg.' }, status: OCC, src: OCS, notes: null },
      { label: 'Carboprost (Hemabate)', calc: 'fd', params: { v: '250 mcg IM q15 min; max 2 mg (8 doses)', f: 'Uterotonic for PPH. Contraindicated in asthma.' }, status: OCC, src: OCS, notes: null },
      { label: 'Cisatracurium', calc: 'occ_wr', params: { lo: 0.1, hi: 0.15, u: 'mg IV', card: '0.1-0.15 mg/kg IV. Infusion 0.5-10 mcg/kg/min.' }, status: OCC, src: OCS, notes: null },
      { label: 'Dexamethasone', calc: 'occ_wc', params: { f: 0.15, cap: 10, u: 'mg IV', card: 'Adult: 4-10 mg IV. Peds: 0.15 mg/kg (max 10 mg). Antiemetic / anti-inflammatory.' }, status: OCC, src: OCS, notes: null },
      { label: 'Dexmedetomidine', calc: 'occ_wr', params: { lo: 0.5, hi: 1, u: 'mcg IV load', card: 'Load: 0.5-1 mcg/kg over 10 min. Infusion: 0.2-1.5 mcg/kg/hr.' }, status: OCC, src: OCS, notes: null },
      { label: 'Diphenhydramine', calc: 'fd', params: { v: 'Adult: 25-50 mg IV/IM; Peds: 1-1.25 mg/kg', f: 'H1 blocker / antiemetic.' }, status: OCC, src: OCS, notes: null },
      { label: 'Ephedrine', calc: 'fd', params: { v: 'Adult: 5-10 mg IV; Peds: 0.1 mg/kg', f: 'Vasopressor.' }, status: OCC, src: OCS, notes: null },
      { label: 'Epinephrine', calc: 'fd', params: { v: 'Arrest: 1 mg q3-5 min; Hypotension: 5-20 mcg IV; Bronchospasm: 0.3-0.5 mg IM', f: 'Peds arrest: 10 mcg/kg (0.01 mg/kg). Infusion 0.05-0.5 mcg/kg/min.' }, status: OCC, src: OCS, notes: null },
      { label: 'Esmolol', calc: 'occ_wr', params: { lo: 0.5, hi: 1, u: 'mg IV load', card: 'Load: 0.5-1 mg/kg IV. Infusion: 50-300 mcg/kg/min.' }, status: OCC, src: OCS, notes: null },
      { label: 'Etomidate', calc: 'occ_wr', params: { lo: 0.2, hi: 0.3, u: 'mg IV', card: '0.2-0.3 mg/kg IV. Peds: same range.' }, status: OCC, src: OCS, notes: null }
    ]
  },
  {
    title: 'OCC: Medications F-N',
    items: [
      { label: 'Fentanyl', calc: 'occ_wr', params: { lo: 0.5, hi: 2, u: 'mcg IV', card: 'Analgesia: 0.5-2 mcg/kg IV. Infusion: 0.5-20 mcg/kg/hr. Peds: 0.5-1 mcg/kg IV.' }, status: OCC, src: OCS, notes: null },
      { label: 'Flumazenil', calc: 'fd', params: { v: '0.2 mg IV q1 min; max 1 mg', f: 'Benzodiazepine reversal. Peds: 0.01 mg/kg (max 0.2 mg) q1 min.' }, status: OCC, src: OCS, notes: null },
      { label: 'Glycopyrrolate', calc: 'fd', params: { v: 'Adult: 0.2 mg IV; Peds: 4-10 mcg/kg', f: 'Anticholinergic. Give with neostigmine for NMB reversal.' }, status: OCC, src: OCS, notes: null },
      { label: 'Hydralazine', calc: 'fd', params: { v: '5-10 mg IV q10-20 min', f: 'Vasodilator for hypertension.' }, status: OCC, src: OCS, notes: null },
      { label: 'Hydrocortisone', calc: 'fd', params: { v: '100 mg IV; Peds: 1-2 mg/kg', f: 'Steroid / anaphylaxis.' }, status: OCC, src: OCS, notes: null },
      { label: 'Insulin Regular', calc: 'fd', params: { v: '5-10 U IV with D50 25-50 g', f: 'Hyperkalemia / hyperglycemia.' }, status: OCC, src: OCS, notes: null },
      { label: 'Ketamine (IV)', calc: 'occ_wr', params: { lo: 1, hi: 2, u: 'mg IV induction', card: 'Induction: 1-2 mg/kg IV. IM: 4-6 mg/kg. Analgesia: 0.2-0.8 mg/kg IV. Infusion: 2-15 mcg/kg/min.' }, status: OCC, src: OCS, notes: null },
      { label: 'Ketorolac', calc: 'occ_wc', params: { f: 0.5, cap: 30, u: 'mg IV/IM', card: 'Adult: 15-30 mg IV/IM. Peds: 0.5 mg/kg (max 15 mg). Avoid in asthma, renal disease.' }, status: OCC, src: OCS, notes: null },
      { label: 'Labetalol', calc: 'fd', params: { v: '5-10 mg IV, double q5-10 min; max 300 mg', f: 'Alpha/beta blocker. Infusion 0.5-2 mg/min.' }, status: OCC, src: OCS, notes: null },
      { label: 'Lidocaine', calc: 'occ_wr', params: { lo: 1, hi: 1.5, u: 'mg IV bolus', card: '1-1.5 mg/kg IV bolus. Infusion: 1-4 mg/min. Max toxic dose 4.5 mg/kg (7 with epi).' }, status: OCC, src: OCS, notes: null },
      { label: 'Magnesium', calc: 'fd', params: { v: 'Eclampsia: 4-6 g IV load, 1-2 g/hr; Torsades: 1-2 g IV', f: 'Bronchospasm: 2 g IV over 20 min.' }, status: OCC, src: OCS, notes: null },
      { label: 'Metaraminol', calc: 'fd', params: { v: '0.5-2 mg IV bolus; Infusion: 0.5-5 mg/hr', f: 'Vasopressor.' }, status: OCC, src: OCS, notes: null },
      { label: 'Methylergonovine', calc: 'fd', params: { v: '0.2 mg IM (avoid IV)', f: 'Uterotonic for PPH. Contraindicated in HTN, preeclampsia.' }, status: OCC, src: OCS, notes: null },
      { label: 'Methylprednisolone', calc: 'fd', params: { v: '125 mg IV', f: 'Steroid / anaphylaxis.' }, status: OCC, src: OCS, notes: null },
      { label: 'Metoclopramide', calc: 'fd', params: { v: '10-20 mg IV; Peds: 0.1-0.15 mg/kg', f: 'Prokinetic / antiemetic.' }, status: OCC, src: OCS, notes: null },
      { label: 'Midazolam', calc: 'occ_wr', params: { lo: 0.05, hi: 0.1, u: 'mg (peds)', card: 'Adult: 0.5-2 mg IV titrate. Peds: 0.05-0.1 mg/kg.' }, status: OCC, src: OCS, notes: null },
      { label: 'Milrinone', calc: 'occ_ws', params: { f: 50, u: 'mcg IV load', card: 'Load: 50 mcg/kg over 10 min. Infusion: 0.375-0.75 mcg/kg/min.' }, status: OCC, src: OCS, notes: null },
      { label: 'Misoprostol', calc: 'fd', params: { v: '600-1000 mcg PR/SL', f: 'Uterotonic for PPH.' }, status: OCC, src: OCS, notes: null },
      { label: 'Naloxone', calc: 'fd', params: { v: 'Reversal: 0.04-0.4 mg IV titrate; max 10 mg', f: 'Opioid antagonist. Peds: 1-10 mcg/kg. Infusion 0.25-6.25 mcg/kg/hr.' }, status: OCC, src: OCS, notes: null },
      { label: 'Neostigmine', calc: 'occ_wr', params: { lo: 0.04, hi: 0.07, u: 'mg IV', card: '0.04-0.07 mg/kg IV (max 5 mg). Give with glycopyrrolate.' }, status: OCC, src: OCS, notes: null },
      { label: 'Nitroglycerin', calc: 'fd', params: { v: 'Bolus: 50-100 mcg IV; Infusion: 0.5-20 mcg/kg/min', f: 'Vasodilator. Uterine relaxation: 50-250 mcg IV.' }, status: OCC, src: OCS, notes: null },
      { label: 'Nitroprusside', calc: 'fd', params: { v: 'Infusion: 0.5-2 mcg/kg/min (max 10)', f: 'Vasodilator. Cyanide toxicity risk with prolonged use.' }, status: OCC, src: OCS, notes: null }
    ]
  },
  {
    title: 'OCC: Medications O-V',
    items: [
      { label: 'Ondansetron', calc: 'occ_wc', params: { f: 0.1, cap: 4, u: 'mg IV', card: 'Adult: 4 mg IV. Peds: 0.1 mg/kg (max 4 mg). Antiemetic.' }, status: OCC, src: OCS, notes: null },
      { label: 'Oxytocin', calc: 'fd', params: { v: '3 U IV bolus; Infusion 1-2 U/hr (max 40 U)', f: 'Uterotonic. Rule of 3s: 3 U load, repeat \u00d7 3.' }, status: OCC, src: OCS, notes: null },
      { label: 'Pancuronium', calc: 'occ_wr', params: { lo: 0.08, hi: 0.12, u: 'mg IV', card: '0.08-0.12 mg/kg IV. NMB (long acting).' }, status: OCC, src: OCS, notes: null },
      { label: 'Phenylephrine', calc: 'fd', params: { v: 'Bolus: 50-200 mcg IV; Infusion: 0.5-5 mcg/kg/min', f: 'Alpha-1 vasopressor. Peds: 1-10 mcg/kg bolus.' }, status: OCC, src: OCS, notes: null },
      { label: 'Prochlorperazine', calc: 'fd', params: { v: '5-10 mg IV/IM', f: 'Antiemetic. Avoid in children < 2 yr or < 10 kg.' }, status: OCC, src: OCS, notes: null },
      { label: 'Promethazine', calc: 'fd', params: { v: '6.25-12.5 mg IV/IM', f: 'Antiemetic / sedative.' }, status: OCC, src: OCS, notes: null },
      { label: 'Propofol', calc: 'occ_wr', params: { lo: 1.5, hi: 2.5, u: 'mg IV induction', card: 'Induction: 1.5-2.5 mg/kg IV. Infusion: 25-200 mcg/kg/min. Peds: 2-4 mg/kg IV.' }, status: OCC, src: OCS, notes: null },
      { label: 'Ranitidine', calc: 'fd', params: { v: '50 mg IV', f: 'H2 blocker.' }, status: OCC, src: OCS, notes: null },
      { label: 'Rocuronium', calc: 'occ_wr', params: { lo: 0.6, hi: 1.2, u: 'mg IV', card: 'Intubation: 0.6-1.2 mg/kg IV. RSI: 1.2 mg/kg. Infusion: 5-15 mcg/kg/min.' }, status: OCC, src: OCS, notes: null },
      { label: 'Scopolamine', calc: 'fd', params: { v: '1.5 mg transdermal patch q72h', f: 'Antiemetic. Apply behind ear.' }, status: OCC, src: OCS, notes: null },
      { label: 'Sodium Citrate', calc: 'fd', params: { v: '30 ml PO', f: 'Non-particulate antacid. Give 15-30 min before induction.' }, status: OCC, src: OCS, notes: null },
      { label: 'Succinylcholine', calc: 'occ_wr', params: { lo: 1, hi: 1.5, u: 'mg IV', card: '1-1.5 mg/kg IV; 4 mg/kg IM. Peds: may need 2 mg/kg. Onset 30-60 sec, duration 5-10 min.' }, status: OCC, src: OCS, notes: null },
      { label: 'Sugammadex (TOF 1-2)', calc: 'occ_ws', params: { f: 2, u: 'mg IV', card: 'Moderate block (TOF 1-2): 2 mg/kg. Deep block: 4 mg/kg. Immediate: 16 mg/kg. Use IBW in obese.' }, status: OCC, src: OCS, notes: null },
      { label: 'Vasopressin', calc: 'fd', params: { v: 'Shock: 0.03-0.04 U/min infusion; ACLS: 40 U IV \u00d7 1', f: 'Non-adrenergic vasopressor.' }, status: OCC, src: OCS, notes: null },
      { label: 'Vecuronium', calc: 'occ_wr', params: { lo: 0.08, hi: 0.12, u: 'mg IV', card: '0.08-0.12 mg/kg IV. Infusion: 0.8-1.8 mcg/kg/min. Onset 2-3 min, duration 25-40 min.' }, status: OCC, src: OCS, notes: null }
    ]
  },
  {
    title: 'OCC: Neuraxial',
    items: [
      { label: 'Contraindications', calc: 'pa', params: { v: 'Coagulopathy (INR>1.5, plt<80k); Infection at site; Sepsis/hypovolemia; Elevated ICP; Patient refusal; Indeterminate neurologic disease' }, status: OCC, src: OCS, notes: 'Relative: back surgery at level, stenosis, anticoagulants per ASRA.' },
      { label: 'Hypotension in spinal', calc: 'pa', params: { v: 'Bolus 500-1000 ml IV at placement; Phenylephrine 50-100 mcg or ephedrine 5-10 mg; Consider vasopressor infusion' }, status: OCC, src: OCS, notes: null },
      { label: 'Bupivacaine 0.75% hyperbaric', calc: 'fd', params: { v: '7.5-15 mg; onset 5 min; duration 90-150 min', f: 'Spinal anesthetic' }, status: OCC, src: OCS, notes: 'Most common spinal agent.' },
      { label: 'Lidocaine 5%', calc: 'fd', params: { v: '50-100 mg; onset 1-3 min; duration 45-75 min', f: 'Spinal anesthetic' }, status: OCC, src: OCS, notes: 'Transient neurologic symptoms risk.' },
      { label: 'Chloroprocaine 3%', calc: 'fd', params: { v: '30-45 mg; onset 2-4 min; duration 30-55 min', f: 'Spinal anesthetic' }, status: OCC, src: OCS, notes: 'Short-acting, good for ambulatory.' },
      { label: 'Epidural bolus/lockout/rate/hr limit', calc: 'fd', params: { v: '0.1% bupiv: 5 ml / 10 min / 8 ml/hr / 32 ml', f: 'Typical epidural PCEA settings' }, status: OCC, src: OCS, notes: null }
    ]
  },
  {
    title: 'OCC: OB Emergencies',
    items: [
      { label: 'Emergent C/S GA \u2014 Induction', calc: 'pa', params: { v: 'Preoxygenate 4 breaths; RSI: Propofol 2-3 mg/kg or Etomidate 0.2 mg/kg or Ketamine 1-2 mg/kg; Succinylcholine 1 mg/kg; Cricoid pressure' }, status: OCC, src: OCS, notes: 'Consider rocuronium 1.2 mg/kg if sux contraindicated.' },
      { label: 'Emergent C/S GA \u2014 Maintenance', calc: 'pa', params: { v: 'Volatile at 0.5-0.7 MAC until delivery; then increase MAC + add opioid; Oxytocin after delivery' }, status: OCC, src: OCS, notes: null },
      { label: 'Pre-eclampsia \u2014 MgSO4 load', calc: 'fd', params: { v: '4-6 g IV over 15-30 min', f: 'Seizure prophylaxis' }, status: OCC, src: OCS, notes: 'Monitor deep tendon reflexes, respiratory rate, urine output.' },
      { label: 'Pre-eclampsia \u2014 MgSO4 maint', calc: 'fd', params: { v: '1-2 g/hr IV infusion', f: 'Maintain therapeutic level' }, status: OCC, src: OCS, notes: 'Therapeutic: 4-7 mEq/L. Toxicity: loss DTR > resp depression > cardiac arrest.' },
      { label: 'Eclampsia \u2014 Treatment', calc: 'pa', params: { v: 'MgSO4 4-6 g IV; if seizing on Mg give additional 2 g; Secure airway; Left uterine displacement; Prepare for delivery' }, status: OCC, src: OCS, notes: null },
      { label: 'Severe HTN in pre-eclampsia', calc: 'fd', params: { v: 'Labetalol 10-20 mg IV, double q10 min (max 300 mg); or Hydralazine 5-10 mg IV q20 min', f: 'SBP>160 or DBP>110' }, status: OCC, src: OCS, notes: null },
      { label: 'PPH \u2014 Oxytocin', calc: 'fd', params: { v: '3 U IV bolus; Infusion 1-2 U/hr', f: 'First-line uterotonic' }, status: OCC, src: OCS, notes: null },
      { label: 'PPH \u2014 Methylergonovine', calc: 'fd', params: { v: '0.2 mg IM (avoid IV)', f: 'Second-line uterotonic' }, status: OCC, src: OCS, notes: 'Contraindicated in HTN, preeclampsia.' },
      { label: 'PPH \u2014 Carboprost', calc: 'fd', params: { v: '250 mcg IM q15 min; max 2 mg', f: 'Third-line uterotonic' }, status: OCC, src: OCS, notes: 'Contraindicated in asthma.' },
      { label: 'PPH \u2014 Misoprostol', calc: 'fd', params: { v: '600-1000 mcg PR/SL', f: 'Prostaglandin uterotonic' }, status: OCC, src: OCS, notes: null },
      { label: 'PPH \u2014 Tranexamic acid', calc: 'fd', params: { v: '1 g IV over 10 min; repeat \u00d7 1 after 30 min', f: 'Antifibrinolytic' }, status: OCC, src: OCS, notes: 'Give within 3 hours of onset.' }
    ]
  },
  {
    title: 'OCC: Antibiotics',
    items: [
      { label: 'Cefazolin', calc: 'fd', params: { v: 'Adult: 2 g IV (3 g if >120 kg); Peds: 30 mg/kg; Redose q4h', f: 'Surgical prophylaxis' }, status: OCC, src: OCS, notes: 'Most common surgical prophylaxis.' },
      { label: 'Ampicillin-Sulbactam', calc: 'fd', params: { v: 'Adult: 3 g IV; Peds: 50 mg/kg; Redose q4h', f: 'Surgical prophylaxis' }, status: OCC, src: OCS, notes: null },
      { label: 'Cefoxitin', calc: 'fd', params: { v: 'Adult: 2 g IV; Peds: 40 mg/kg; Redose q2h', f: 'Surgical prophylaxis' }, status: OCC, src: OCS, notes: null },
      { label: 'Cefuroxime', calc: 'fd', params: { v: 'Adult: 1.5 g IV; Peds: 50 mg/kg; Redose q4h', f: 'Surgical prophylaxis' }, status: OCC, src: OCS, notes: null },
      { label: 'Clindamycin', calc: 'fd', params: { v: 'Adult: 900 mg IV; Peds: 10 mg/kg; Redose q6h', f: 'PCN allergy alternative' }, status: OCC, src: OCS, notes: null },
      { label: 'Ertapenem', calc: 'fd', params: { v: 'Adult: 1 g IV; No redose needed', f: 'Surgical prophylaxis' }, status: OCC, src: OCS, notes: null },
      { label: 'Gentamicin', calc: 'occ_ws', params: { f: 5, u: 'mg IV', card: 'Adult: 5 mg/kg IV. Peds: 2.5 mg/kg. No redose. Surgical prophylaxis.' }, status: OCC, src: OCS, notes: null },
      { label: 'Metronidazole', calc: 'fd', params: { v: 'Adult: 500 mg IV; Peds: 15 mg/kg; No redose', f: 'Anaerobic coverage' }, status: OCC, src: OCS, notes: null },
      { label: 'Vancomycin', calc: 'occ_ws', params: { f: 15, u: 'mg IV over 1-2 hr', card: 'Adult/Peds: 15 mg/kg IV. Redose q6-12h. MRSA coverage / PCN allergy. Infuse over 1 hr to avoid red man syndrome.' }, status: OCC, src: OCS, notes: null }
    ]
  },
  {
    title: 'OCC: Local & Inhalational',
    items: [
      { label: 'Lidocaine \u2014 max dose', calc: 'occ_max', params: { f: 4.5, f2: 7, u: 'mg', card: 'Plain: 4.5 mg/kg. With epi: 7 mg/kg. Onset: fast. Duration: 1-1.5 hr (plain), 2-3 hr (epi).' }, status: OCC, src: OCS, notes: null },
      { label: 'Bupivacaine \u2014 max dose', calc: 'occ_max', params: { f: 2.5, f2: 3, u: 'mg', card: 'Plain: 2.5 mg/kg. With epi: 3 mg/kg. Onset: moderate. Duration: 2-3 hr (plain), 4-12 hr (epi).' }, status: OCC, src: OCS, notes: null },
      { label: 'Ropivacaine \u2014 max dose', calc: 'occ_ws', params: { f: 3, u: 'mg max', card: '3 mg/kg max. Onset: moderate. Duration: 2-3 hr. Less cardiotoxic than bupivacaine.' }, status: OCC, src: OCS, notes: null },
      { label: 'Chloroprocaine \u2014 max dose', calc: 'occ_ws', params: { f: 11, u: 'mg max', card: '11 mg/kg max. Ester. Onset: fast. Duration: 0.5-1 hr. Rapid hydrolysis by plasma esterases.' }, status: OCC, src: OCS, notes: null },
      { label: 'Mepivacaine \u2014 max dose', calc: 'occ_max', params: { f: 4.5, f2: 7, u: 'mg', card: 'Plain: 4.5 mg/kg. With epi: 7 mg/kg. Onset: fast. Duration: 1.5-3 hr.' }, status: OCC, src: OCS, notes: null },
      { label: 'Tetracaine \u2014 max dose', calc: 'occ_ws', params: { f: 1.5, u: 'mg max', card: '1.5 mg/kg max. Ester. Onset: slow. Duration: 2.5-3 hr (spinal).' }, status: OCC, src: OCS, notes: null },
      { label: 'MAC \u2014 Sevoflurane', calc: 'fd', params: { v: 'Neonate 3.3%; Infant 3.0%; Child 2.5%; Adult 2.1%; >60yr 1.7%', f: 'Inhalational MAC by age' }, status: OCC, src: OCS, notes: null },
      { label: 'MAC \u2014 Desflurane', calc: 'fd', params: { v: 'Neonate 9.2%; Infant 9.4%; Child 8.7%; Adult 6.0%; >60yr 5.2%', f: 'Inhalational MAC by age' }, status: OCC, src: OCS, notes: null },
      { label: 'MAC \u2014 Isoflurane', calc: 'fd', params: { v: 'Neonate 1.6%; Infant 1.9%; Child 1.6%; Adult 1.2%; >60yr 1.05%', f: 'Inhalational MAC by age' }, status: OCC, src: OCS, notes: null },
      { label: 'MAC \u2014 Nitrous Oxide', calc: 'fd', params: { v: '105% (all ages)', f: 'Inhalational MAC' }, status: OCC, src: OCS, notes: 'Cannot achieve 1 MAC alone at 1 atm.' },
      { label: 'LAST \u2014 Intralipid bolus', calc: 'occ_ws', params: { f: 1.5, u: 'ml IV bolus (20%)', card: 'Stop injection. ABCs. Intralipid 20% bolus 1.5 ml/kg, then 0.25 ml/kg/min infusion. Max ~10 ml/kg over 30 min. Avoid vasopressin, CCBs, local anesthetics. See ASRA checklist.' }, status: OCC, src: OCS, notes: null }
    ]
  }
];

// Append OCC compendium to main REF_SECTIONS
REF_SECTIONS.push.apply(REF_SECTIONS, OCC_SECTIONS);

/** One story per field. The workflow simulation is built from these. */
export type Score = { area: string; level: 'green' | 'amber' | 'red'; note: string }

export type Scenario = {
  id: string
  label: string
  tagline: string
  requester: string
  team: string
  reviewer: string
  message: string
  task: string
  room: string
  docs: string[]
  /** Fact counts per document, same order as docs. */
  facts: number[]
  plan: string
  areasCount: number
  checksOk: [string, string]
  checkFail: string
  failStream: string
  question: string
  answer: string
  newDoc: string
  newDocFacts: number
  recheck: string
  recheckStream: string
  scores: Score[]
  riskStream: string
  findings: string[]
  /** The requester asks for one more check mid-run; the coordinator adds an agent for it. */
  extraRequest: string
  extraAgent: { name: string; role: string; working: string; done: string }
  extraCheck: string
  extraStream: string
  extraFinding: string
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'investment',
    label: 'Investment',
    tagline: 'Due diligence on a company',
    requester: 'Maria, investment team',
    team: 'investment team',
    reviewer: 'Anna',
    message: 'Hi! Can you start due diligence on Halden Systems? I am putting everything in the data room now.',
    task: 'Due diligence on Halden Systems Ltd',
    room: 'Data room · Halden Systems Ltd',
    docs: ['Annual accounts 2025.pdf', 'Customer contracts (12).pdf', 'Liability insurance.pdf', 'Tax certificate.pdf', 'Employee list.xlsx', 'ISO 9001 certificate.pdf'],
    facts: [14, 18, 5, 3, 9, 4],
    plan: 'finance, legal, insurance, people',
    areasCount: 4,
    checksOk: ['Revenue in accounts matches contract totals', 'Company number identical across all documents'],
    checkFail: 'Liability insurance expired 31 Mar 2026',
    failStream: 'Two checks passed. One issue: the liability insurance certificate expired on 31 March 2026.',
    question: 'The liability insurance certificate in the data room expired on 31 March 2026. Do you have a current certificate?',
    answer: 'Yes. Uploading Liability insurance 2026-27.pdf now.',
    newDoc: 'Liability insurance 2026-27.pdf',
    newDocFacts: 5,
    recheck: 'Liability insurance valid until 31 Mar 2027',
    recheckStream: 'New certificate is valid until 31 March 2027. All checks pass.',
    scores: [
      { area: 'Finance', level: 'green', note: 'Stable revenue, low debt' },
      { area: 'Legal', level: 'amber', note: '2 contracts end on change of ownership' },
      { area: 'Insurance', level: 'green', note: 'Valid cover, adequate limits' },
      { area: 'People', level: 'green', note: 'Key staff on long notice periods' },
    ],
    extraRequest: 'Can you also check whether the company or its owners are on any sanctions list?',
    extraAgent: { name: 'Sanctions', role: 'Checks public lists', working: 'Checking EU, UN and OFAC lists', done: 'No matches' },
    extraCheck: 'No sanctions matches for the company or its two owners',
    extraStream: 'Sanctions check done. No matches for the company or its owners on EU, UN or OFAC lists.',
    extraFinding: 'No sanctions matches for the company or its owners (EU, UN, OFAC lists, checked today)',
    riskStream: 'Legal needs a look: two customer contracts can be ended if the company changes owner.',
    findings: ['2 of 12 customer contracts end on change of ownership (pages 14, 31)', 'Liability insurance renewed, valid to 31 Mar 2027 (new certificate)', 'Revenue 2025 matches signed contract values within 1% (accounts p. 6)'],
  },
  {
    id: 'purchasing',
    label: 'Purchasing',
    tagline: 'Onboarding a new supplier',
    requester: 'Jonas, purchasing',
    team: 'purchasing team',
    reviewer: 'Jonas',
    message: 'Hi! New supplier, Nordvik Metall. Can you run the onboarding check? I am dropping their documents in the supplier folder.',
    task: 'Supplier onboarding: Nordvik Metall AB',
    room: 'Supplier folder · Nordvik Metall AB',
    docs: ['Company registration.pdf', 'ISO 9001 certificate.pdf', 'Liability insurance.pdf', 'Financial statements 2025.pdf', 'Code of conduct, signed.pdf', 'Price list 2026.xlsx'],
    facts: [4, 4, 5, 12, 2, 24],
    plan: 'quality, finance, compliance, pricing',
    areasCount: 4,
    checksOk: ['Registration number matches on all documents', 'Prices in the list match the quote, 12 of 12 items'],
    checkFail: 'ISO 9001 certificate expired 30 Jun 2026',
    failStream: 'Two checks passed. One issue: the ISO 9001 certificate expired on 30 June 2026.',
    question: 'The ISO 9001 certificate in the folder expired on 30 June 2026. Has the supplier been re-certified?',
    answer: 'Yes, they sent the new one last week. Uploading ISO 9001 2026-2029.pdf.',
    newDoc: 'ISO 9001 2026-2029.pdf',
    newDocFacts: 4,
    recheck: 'ISO 9001 valid until 30 Jun 2029',
    recheckStream: 'New certificate is valid until 30 June 2029. All checks pass.',
    scores: [
      { area: 'Quality', level: 'green', note: 'Certified, no open audit findings' },
      { area: 'Finance', level: 'amber', note: 'Thin margins, one late payment in 2025' },
      { area: 'Compliance', level: 'green', note: 'Code of conduct signed' },
      { area: 'Pricing', level: 'green', note: 'Within 3% of current supplier' },
    ],
    extraRequest: 'Can you also check their delivery record with us from the old supplier system?',
    extraAgent: { name: 'Delivery record', role: 'Reads your ERP', working: 'Reading 3 years of deliveries', done: '94% on time' },
    extraCheck: 'On-time delivery 94% over 3 years, 212 orders',
    extraStream: 'Delivery record checked in your ERP. 94% on time over 212 orders in three years.',
    extraFinding: 'On-time delivery 94% over 212 orders since 2023 (your ERP)',
    riskStream: 'Finance needs a look: thin margins and one late payment last year.',
    findings: ['Financial statements show a 2% margin and one late payment (p. 4)', 'ISO 9001 re-certified, valid to 30 Jun 2029 (new certificate)', 'Price list matches the quote line by line, 12 items (price list, sheet 1)'],
  },
  {
    id: 'insurance',
    label: 'Insurance',
    tagline: 'Preparing a claim',
    requester: 'Sara, claims',
    team: 'claims team',
    reviewer: 'Sara',
    message: 'A new claim came in this morning. Can you prepare it for me? Everything is in the claim folder.',
    task: 'Claim 2291: water damage, Storgatan 12',
    room: 'Claim folder · 2291',
    docs: ['Claim form.pdf', 'Policy HM-44-2210.pdf', 'Plumber report.pdf', 'Repair estimate.pdf', 'Photos (6).zip', 'Tenant statement.pdf'],
    facts: [8, 6, 5, 7, 6, 4],
    plan: 'cover, cause, cost, timeline',
    areasCount: 4,
    checksOk: ['Policy was active when the claim was reported', 'Estimate matches the plumber report'],
    checkFail: 'Incident date missing from the claim form',
    failStream: 'Two checks passed. One issue: the claim form does not say when the damage happened.',
    question: 'The claim form has no incident date. When did the damage happen?',
    answer: 'The tenant says 14 March. Uploading their dated email.',
    newDoc: 'Tenant email, 14 Mar.pdf',
    newDocFacts: 2,
    recheck: 'Incident date 14 Mar 2026, policy active',
    recheckStream: 'Incident date confirmed as 14 March 2026. The policy was active. All checks pass.',
    scores: [
      { area: 'Cover', level: 'green', note: 'Water damage is covered' },
      { area: 'Cause', level: 'green', note: 'Burst pipe, per plumber report' },
      { area: 'Cost', level: 'amber', note: 'Estimate 12% above typical' },
      { area: 'Timeline', level: 'green', note: 'Reported within 30 days' },
    ],
    extraRequest: 'Can you also check for earlier claims on this address?',
    extraAgent: { name: 'Claim history', role: 'Reads your claims system', working: 'Searching 10 years of claims', done: '1 earlier claim' },
    extraCheck: 'One earlier claim on the address, 2022, roof damage, unrelated',
    extraStream: 'Claim history checked. One earlier claim on the address in 2022, roof damage, unrelated to this one.',
    extraFinding: 'One earlier claim on the address, 2022, roof damage, unrelated (your claims system)',
    riskStream: 'Cost needs a look: the estimate is 12% above what this repair usually costs.',
    findings: ['Repair estimate 48 000 SEK, 12% above typical for this repair (estimate p. 1)', 'Incident date confirmed 14 Mar 2026 (tenant email)', 'Policy HM-44-2210 active and covers water damage (policy p. 3)'],
  },
  {
    id: 'construction',
    label: 'Construction',
    tagline: 'Reviewing a tender',
    requester: 'Erik, projects',
    team: 'project team',
    reviewer: 'Erik',
    message: 'We got the tender pack for the Solna school extension. Can you go through it? Files are in the tender folder.',
    task: 'Tender review: Solna school extension',
    room: 'Tender folder · Solna school',
    docs: ['Invitation to tender.pdf', 'Bill of quantities.xlsx', 'Drawings A-01 to A-14.pdf', 'Technical specification.pdf', 'Contract terms.pdf', 'Site conditions report.pdf'],
    facts: [6, 31, 14, 12, 9, 5],
    plan: 'scope, quantities, terms, site',
    areasCount: 4,
    checksOk: ['Concrete and steel quantities match the drawings', 'Deadline and penalties consistent across documents'],
    checkFail: 'Site access date not stated anywhere',
    failStream: 'Two checks passed. One issue: none of the documents say when the site will be available.',
    question: 'None of the documents state when the site will be available. Do you know the access date?',
    answer: 'The client said 1 March 2027. Uploading their email.',
    newDoc: 'Client email, site access.pdf',
    newDocFacts: 2,
    recheck: 'Site access 1 Mar 2027 fits the schedule',
    recheckStream: 'Site access confirmed as 1 March 2027. It fits the schedule. All checks pass.',
    scores: [
      { area: 'Scope', level: 'green', note: 'Clear, drawings match the spec' },
      { area: 'Quantities', level: 'green', note: 'Within 2% of our own take-off' },
      { area: 'Terms', level: 'amber', note: 'Delay penalty with no upper limit' },
      { area: 'Site', level: 'green', note: 'Good ground, access confirmed' },
    ],
    extraRequest: 'Can you also check the client’s payment history with us?',
    extraAgent: { name: 'Payment history', role: 'Reads your accounting', working: 'Reading invoices since 2021', done: '11 of 12 on time' },
    extraCheck: 'Client paid 11 of 12 invoices on time since 2021',
    extraStream: 'Payment history checked in your accounting system. 11 of 12 invoices paid on time since 2021.',
    extraFinding: 'Client paid 11 of 12 invoices on time since 2021 (your accounting system)',
    riskStream: 'Terms need a look: a weekly delay penalty with no upper limit.',
    findings: ['Delay penalty 0.5% per week with no cap (contract terms p. 9)', 'Site access confirmed 1 Mar 2027 (client email)', 'Bill of quantities within 2% of our own take-off (BoQ, sheet 2)'],
  },
]

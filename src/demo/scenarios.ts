export type Field = { label: string; value: string; quote?: string }

export type Scenario = {
  id: string
  customer: string
  /** Shown in the picker. */
  tagline: string
  file: string
  /** Lines of the document. Lines with a quote are highlighted as the agent reads. */
  lines: string[]
  fields: Field[]
  /** Index into fields of the one that is missing from the document. */
  missing: number
  question: string
  answer: string
  /** Where the data ends up. */
  destination: string
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'legal',
    customer: 'Law firm',
    tagline: 'Contracts in, key terms out',
    file: 'Master Services Agreement.pdf',
    lines: [
      'This Master Services Agreement is entered into between Nordic Retail AB and Halden Systems Ltd.',
      'The initial term is 24 months from the effective date.',
      'This agreement is governed by the laws of Sweden.',
      'Either party may terminate with 90 days written notice.',
      'Fees are invoiced monthly and payable within 30 days.',
    ],
    fields: [
      { label: 'Parties', value: 'Nordic Retail AB, Halden Systems Ltd', quote: 'Nordic Retail AB and Halden Systems Ltd' },
      { label: 'Term', value: '24 months', quote: '24 months' },
      { label: 'Governing law', value: 'Sweden', quote: 'laws of Sweden' },
      { label: 'Termination notice', value: '90 days', quote: '90 days written notice' },
      { label: 'Liability cap', value: '12 months of fees' },
    ],
    missing: 4,
    question: 'The agreement does not state a liability cap. What should it be?',
    answer: '12 months of fees',
    destination: 'Contract register',
  },
  {
    id: 'insurance',
    customer: 'Insurance',
    tagline: 'Claims in, case files out',
    file: 'Claim_2291.pdf',
    lines: [
      'Claim submitted under policy number HM-44-2210.',
      'Water damage was discovered in the kitchen at Storgatan 12, Uppsala.',
      'A plumber has estimated the repair at 48 000 SEK.',
      'Six photos of the damage are attached.',
      'The claimant can be reached on weekdays after 16:00.',
    ],
    fields: [
      { label: 'Policy number', value: 'HM-44-2210', quote: 'HM-44-2210' },
      { label: 'Damage type', value: 'Water damage', quote: 'Water damage' },
      { label: 'Address', value: 'Storgatan 12, Uppsala', quote: 'Storgatan 12, Uppsala' },
      { label: 'Estimated cost', value: '48 000 SEK', quote: '48 000 SEK' },
      { label: 'Incident date', value: '14 March 2026' },
    ],
    missing: 4,
    question: 'The claim does not say when the damage happened. What was the date?',
    answer: '14 March 2026',
    destination: 'Claims system',
  },
  {
    id: 'orders',
    customer: 'Manufacturing',
    tagline: 'Orders in, production plan out',
    file: 'PO-4471.pdf',
    lines: [
      'Purchase order from Bergström Verkstad AB.',
      'Item: aluminium bracket, part no. AB-220, quantity 1 200 pcs.',
      'Surface treatment: anodised, natural.',
      'Payment terms: 30 days net.',
      'Please confirm receipt of this order.',
    ],
    fields: [
      { label: 'Customer', value: 'Bergström Verkstad AB', quote: 'Bergström Verkstad AB' },
      { label: 'Part', value: 'AB-220 aluminium bracket', quote: 'aluminium bracket, part no. AB-220' },
      { label: 'Quantity', value: '1 200 pcs', quote: '1 200 pcs' },
      { label: 'Payment terms', value: '30 days net', quote: '30 days net' },
      { label: 'Delivery date', value: '30 October 2026' },
    ],
    missing: 4,
    question: 'The order has no delivery date. When do you need it?',
    answer: '30 October 2026',
    destination: 'Production planning',
  },
  {
    id: 'space',
    customer: 'Space',
    tagline: 'Mission briefs in, launch requests out',
    file: 'Mission brief.pdf',
    lines: [
      'Cakra-2 is a 16U Earth-observation CubeSat with a wet mass of 20 kg.',
      'Target orbit: sun-synchronous, 500 to 550 km altitude.',
      'Launch is planned for the last quarter of 2027.',
      'The spacecraft will be integrated at our facility in Bandung.',
      'Please advise on available rideshare opportunities.',
    ],
    fields: [
      { label: 'Satellite', value: 'Cakra-2, 16U, 20 kg', quote: '16U Earth-observation CubeSat with a wet mass of 20 kg' },
      { label: 'Orbit', value: 'SSO, 500 to 550 km', quote: 'sun-synchronous, 500 to 550 km' },
      { label: 'Launch window', value: 'Q4 2027', quote: 'last quarter of 2027' },
      { label: 'Integration site', value: 'Bandung', quote: 'Bandung' },
      { label: 'Deployer', value: 'EXOpod Nova 16U' },
    ],
    missing: 4,
    question: 'The brief does not name a deployer. Which one will Cakra-2 use?',
    answer: 'EXOpod Nova 16U',
    destination: 'Launch matching',
  },
]

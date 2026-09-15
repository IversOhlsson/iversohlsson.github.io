/** One story per field. Each drives the five scenes of the simulation. */
export type Scenario = {
  id: string
  label: string
  tagline: string
  company: string
  /** The person who gets the notification. */
  person: string
  /** Scene 1: the email that arrives. */
  email: { from: string; subject: string; preview: string; attachment: string }
  older: { from: string; subject: string }[]
  /** Scene 2: the record the AI fills in inside the system. */
  record: { title: string; system: string; fields: { label: string; value: string }[]; missing: string }
  /** Scene 3: the notification and the one-tap decision. */
  phone: { title: string; body: string; primary: string; secondary: string; result: string }
  /** Scene 4: where it lands afterwards. */
  board: { system: string; columns: string[]; into: number; card: string; cardSub: string; cards: { col: number; title: string; sub: string }[]; toast: string }
  /** Scene 5: the log. */
  log: { who: string; what: string }[]
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'purchasing',
    person: 'Anna',
    label: 'Manufacturing',
    tagline: 'An order comes in by email',
    company: 'Nordic Parts AB',
    email: { from: 'inkop@bergstromverkstad.se', subject: 'Purchase order PO-4471', preview: 'Hi, please find our order attached. Confirm receipt when you can.', attachment: 'PO-4471.pdf' },
    older: [{ from: 'Norrland Energi', subject: 'Re: Mounting rail R-40 delivery' }, { from: 'Hansa Marine', subject: 'Invoice 2026-0912 paid' }],
    record: {
      title: 'Order PO-4471', system: 'Orders',
      fields: [{ label: 'Customer', value: 'Bergström Verkstad AB' }, { label: 'Part', value: 'AB-220 aluminium bracket' }, { label: 'Quantity', value: '1 200 pcs' }, { label: 'Payment terms', value: '30 days net' }],
      missing: 'Delivery date',
    },
    phone: { title: 'Order from Bergström needs a delivery date', body: 'Based on the usual lead time, 30 Oct 2026 works. Use it, or ask the customer?', primary: 'Use 30 Oct', secondary: 'Ask customer', result: 'Delivery date set: 30 Oct 2026' },
    board: {
      system: 'Production plan', columns: ['This week', 'Next week', 'Later'], into: 2, card: 'PO-4471 · Bergström', cardSub: '1 200 × AB-220 · due 30 Oct',
      cards: [{ col: 0, title: 'PO-4468 · Lindqvist', sub: '800 × S-110' }, { col: 0, title: 'PO-4470 · Hansa', sub: '150 × H-7' }, { col: 1, title: 'PO-4469 · Norrland', sub: '2 400 × R-40' }],
      toast: 'Order confirmation sent to Bergström Verkstad',
    },
    log: [{ who: 'Email', what: 'PO-4471.pdf received from Bergström Verkstad' }, { who: 'AI', what: 'Read the order. 4 of 5 fields filled. Delivery date missing.' }, { who: 'AI', what: 'Suggested 30 Oct 2026 from the usual lead time' }, { who: 'Anna', what: 'Chose 30 Oct 2026 from her phone' }, { who: 'System', what: 'Order created, added to the plan, confirmation sent' }],
  },
  {
    id: 'investment',
    person: 'Maria',
    label: 'Investment',
    tagline: 'A data room is shared',
    company: 'Ather Capital',
    email: { from: 'cfo@haldensystems.com', subject: 'Data room access: Halden Systems', preview: 'You now have access to the data room. Six documents, as agreed.', attachment: 'Data room (6 files)' },
    older: [{ from: 'Maria Lind', subject: 'Re: Q4 pipeline review' }, { from: 'Board', subject: 'Minutes 12 September' }],
    record: {
      title: 'Halden Systems Ltd', system: 'Deals',
      fields: [{ label: 'Revenue 2025', value: '42.1 MSEK' }, { label: 'Customer contracts', value: '12, all active' }, { label: 'Governing law', value: 'Sweden' }, { label: 'Key staff', value: '4, long notice periods' }],
      missing: 'Liability insurance',
    },
    phone: { title: 'Halden Systems: insurance certificate expired', body: 'The certificate in the data room expired 31 March. Request a current one from Halden?', primary: 'Send request', secondary: 'Skip', result: 'Request sent to Halden Systems' },
    board: {
      system: 'Deal pipeline', columns: ['Screening', 'Due diligence', 'Decision'], into: 1, card: 'Halden Systems', cardSub: '5 of 6 areas checked · waiting on insurance',
      cards: [{ col: 0, title: 'Kestrel Robotics', sub: 'Intro call booked' }, { col: 0, title: 'Fjord Analytics', sub: 'Deck received' }, { col: 2, title: 'Umeå Optics', sub: 'Term sheet out' }],
      toast: 'Request for a current certificate sent to Halden Systems',
    },
    log: [{ who: 'Email', what: 'Data room access received from Halden Systems' }, { who: 'AI', what: 'Read 6 documents. 53 facts, each linked to its page.' }, { who: 'AI', what: 'Found the liability insurance certificate expired 31 Mar 2026' }, { who: 'Maria', what: 'Sent a request for a current certificate from her phone' }, { who: 'System', what: 'Deal moved to due diligence, waiting on Halden' }],
  },
  {
    id: 'insurance',
    person: 'Sara',
    label: 'Insurance',
    tagline: 'A claim is reported',
    company: 'Norra Försäkring',
    email: { from: 'claims-form@norraforsakring.se', subject: 'New claim: water damage, Storgatan 12', preview: 'Submitted via the web form. Photos and a plumber report attached.', attachment: 'Claim 2291 (4 files)' },
    older: [{ from: 'Sara Berg', subject: 'Re: Claim 2280 decision' }, { from: 'Repair partner', subject: 'Invoice, claim 2274' }],
    record: {
      title: 'Claim 2291', system: 'Claims',
      fields: [{ label: 'Policy', value: 'HM-44-2210, active' }, { label: 'Damage', value: 'Water, burst pipe' }, { label: 'Estimate', value: '48 000 SEK' }, { label: 'Photos', value: '6 attached' }],
      missing: 'Incident date',
    },
    phone: { title: 'Claim 2291 is missing the incident date', body: 'The form has no date. Ask the tenant by text message?', primary: 'Ask tenant', secondary: 'Call instead', result: 'Text message sent to the tenant' },
    board: {
      system: 'Claims', columns: ['New', 'Assessing', 'Decided'], into: 1, card: 'Claim 2291 · Storgatan 12', cardSub: 'Water damage · waiting on tenant',
      cards: [{ col: 0, title: 'Claim 2292 · Vasagatan 3', sub: 'Theft' }, { col: 1, title: 'Claim 2288 · Kungsgatan 9', sub: 'Fire, minor' }, { col: 2, title: 'Claim 2280 · Odengatan 14', sub: 'Approved' }],
      toast: 'Text message sent to the tenant asking for the incident date',
    },
    log: [{ who: 'Web form', what: 'Claim 2291 submitted with 4 files' }, { who: 'AI', what: 'Read the claim. Policy active, estimate matches the plumber report.' }, { who: 'AI', what: 'Incident date missing from the form' }, { who: 'Sara', what: 'Asked the tenant by text from her phone' }, { who: 'System', what: 'Claim moved to assessing, waiting on tenant' }],
  },
  {
    id: 'construction',
    person: 'Erik',
    label: 'Construction',
    tagline: 'A tender pack arrives',
    company: 'Solna Bygg',
    email: { from: 'upphandling@solna.se', subject: 'Tender: Solna school extension', preview: 'Please find the tender documents attached. Deadline 14 November.', attachment: 'Tender pack (6 files)' },
    older: [{ from: 'Erik Dahl', subject: 'Re: Concrete supplier prices' }, { from: 'Site office', subject: 'Weekly report, Bromma' }],
    record: {
      title: 'Tender: Solna school extension', system: 'Tenders',
      fields: [{ label: 'Deadline', value: '14 Nov 2026' }, { label: 'Scope', value: 'Extension, 1 400 m²' }, { label: 'Quantities', value: 'Match drawings within 2%' }, { label: 'Penalty', value: '0.5% per week, no cap' }],
      missing: 'Site access date',
    },
    phone: { title: 'Solna tender: site access date missing', body: 'None of the documents say when the site is available. Ask the client?', primary: 'Ask client', secondary: 'Assume 1 Mar', result: 'Question sent to the client' },
    board: {
      system: 'Tenders', columns: ['Reviewing', 'Pricing', 'Submitted'], into: 1, card: 'Solna school extension', cardSub: 'Due 14 Nov · waiting on client',
      cards: [{ col: 0, title: 'Bromma depot', sub: 'Due 28 Nov' }, { col: 1, title: 'Täby offices', sub: 'Due 21 Oct' }, { col: 2, title: 'Sundbyberg hall', sub: 'Submitted 2 Sep' }],
      toast: 'Question about site access sent to the client',
    },
    log: [{ who: 'Email', what: 'Tender pack received from Solna municipality' }, { who: 'AI', what: 'Read 6 documents. Quantities match the drawings within 2%.' }, { who: 'AI', what: 'Site access date not stated anywhere' }, { who: 'Erik', what: 'Asked the client from his phone' }, { who: 'System', what: 'Tender moved to pricing, waiting on client' }],
  },
]

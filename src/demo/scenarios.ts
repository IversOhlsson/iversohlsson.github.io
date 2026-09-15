/** Four different flows. Each is a list of scenes; the player renders scene by scene. */

export type Where = 'internal' | 'external' | 'phone'

type Base = { title: string; caption: string; ms: number; where: Where; system: string }

export type Scene = Base & (
  | { kind: 'email'; from: string; subject: string; preview: string; attachment: string; older: { from: string; subject: string }[] }
  | { kind: 'portal'; url: string; heading: string; lines: string[]; files?: string[]; action: string; done: string }
  | { kind: 'record'; recordTitle: string; fields: { label: string; value: string }[]; missing: string; askWho: string; doc: string }
  | { kind: 'readmany'; docs: { name: string; facts: number }[]; issue: string }
  | { kind: 'phone'; notifTitle: string; body: string; primary: string; secondary: string; result: string }
  | { kind: 'chat'; contact: string; outgoing: string; reply: string; afterReply: string }
  | { kind: 'board'; columns: string[]; into: number; card: string; cardSub: string; cards: { col: number; title: string; sub: string }[]; toast: string }
  | { kind: 'report'; reportTitle: string; areas: { area: string; level: 'green' | 'amber'; note: string }[]; findings: string[]; reviewer: string }
  | { kind: 'devices'; phase: 'offline' | 'synced'; devices: { name: string; where: string; ok: boolean; note: string }[]; toast?: string }
  | { kind: 'log'; entries: { who: string; what: string }[] }
  | { kind: 'pipeline'; stages: { name: string; sub: string }[]; checksStage: number; checks: string[]; newCheck: string }
  | { kind: 'lookups'; calls: { service: string; query: string; result: string; ms: string }[] }
  | { kind: 'checks'; checks: { name: string; type: 'rule' | 'custom' | 'lookup'; result: string; ok: boolean }[] }
  | { kind: 'automation'; triggers: { when: string; then: string }[]; stats: { label: string; value: string }[]; recent: { when: string; what: string; ok: boolean }[] }
  | { kind: 'verify'; reviewer: string; items: { label: string; value: string; source: string; lines: string[]; hit: string }[] }
)

export type Scenario = { id: string; label: string; tagline: string; company: string; scenes: Scene[] }

export const SCENARIOS: Scenario[] = [
  {
    id: 'manufacturing', label: 'Manufacturing', tagline: 'Order by email, straight into the plan', company: 'Nordic Parts AB',
    scenes: [
      { kind: 'email', where: 'internal', system: 'Inbox', title: 'An order arrives by email', caption: 'The way it always has. Nobody has to learn a new tool.', ms: 6500,
        from: 'inkop@bergstromverkstad.se', subject: 'Purchase order PO-4471', preview: 'Hi, please find our order attached. Confirm receipt when you can.', attachment: 'PO-4471.pdf',
        older: [{ from: 'Norrland Energi', subject: 'Re: Mounting rail R-40 delivery' }, { from: 'Hansa Marine', subject: 'Invoice 2026-0912 paid' }] },
      { kind: 'record', where: 'internal', system: 'Orders', title: 'AI fills in the order inside your system', caption: 'The fields you care about, where they belong. Nothing copied by hand.', ms: 9000,
        recordTitle: 'Order PO-4471', doc: 'PO-4471.pdf', fields: [{ label: 'Customer', value: 'Bergström Verkstad AB' }, { label: 'Part', value: 'AB-220 aluminium bracket' }, { label: 'Quantity', value: '1 200 pcs' }, { label: 'Payment terms', value: '30 days net' }], missing: 'Delivery date', askWho: 'Anna' },
      { kind: 'phone', where: 'phone', system: 'Your phone', title: 'Anna gets a notification. One tap decides.', caption: 'The AI suggests a date from the usual lead time. A person decides.', ms: 10000,
        notifTitle: 'Order from Bergström needs a delivery date', body: 'Based on the usual lead time, 30 Oct 2026 works. Use it, or ask the customer?', primary: 'Use 30 Oct', secondary: 'Ask customer', result: 'Delivery date set: 30 Oct 2026' },
      { kind: 'board', where: 'internal', system: 'Production plan', title: 'The order lands in the plan', caption: 'The people on the floor see it where they already look.', ms: 7000,
        columns: ['This week', 'Next week', 'Later'], into: 2, card: 'PO-4471 · Bergström', cardSub: '1 200 × AB-220 · due 30 Oct',
        cards: [{ col: 0, title: 'PO-4468 · Lindqvist', sub: '800 × S-110' }, { col: 0, title: 'PO-4470 · Hansa', sub: '150 × H-7' }, { col: 1, title: 'PO-4469 · Norrland', sub: '2 400 × R-40' }], toast: 'Confirmation sent to Bergström Verkstad' },
      { kind: 'portal', where: 'external', system: 'Customer portal', title: 'The customer sees it on their side', caption: 'No email ping-pong. They open their page and the answer is there.', ms: 7000,
        url: 'portal.nordicparts.se/orders', heading: 'Order PO-4471', lines: ['Received 08:12 · Read automatically', 'Confirmed by Nordic Parts', 'Delivery 30 Oct 2026'], action: 'Download confirmation', done: 'Confirmed' },
      { kind: 'log', where: 'internal', system: 'Activity', title: 'Everything is on the record', caption: 'What arrived, what the AI read, who decided.', ms: 7000,
        entries: [{ who: 'Email', what: 'PO-4471.pdf received from Bergström Verkstad' }, { who: 'AI', what: 'Read the order. 4 of 5 fields filled. Delivery date missing.' }, { who: 'AI', what: 'Suggested 30 Oct 2026 from the usual lead time' }, { who: 'Anna', what: 'Chose 30 Oct 2026 from her phone' }, { who: 'System', what: 'Order planned, confirmation published to the customer portal' }] },
    ],
  },
  {
    id: 'investment', label: 'Investment', tagline: 'PDFs, outside lookups and your own checks', company: 'Ather Capital',
    scenes: [
      { kind: 'portal', where: 'external', system: 'Data room · Halden Systems', title: 'The other side uploads their documents', caption: 'The company you are looking at drags its files into a shared data room. That is all they do.', ms: 6500,
        url: 'dataroom.athercapital.se/halden', heading: 'Halden Systems Ltd · Data room', lines: ['Shared with Ather Capital'], files: ['Annual accounts 2025.pdf', 'Customer contracts (12).pdf', 'Liability insurance.pdf', 'Tax certificate.pdf', 'Employee list.xlsx', 'ISO 9001 certificate.pdf'], action: 'Upload', done: '6 documents shared' },
      { kind: 'pipeline', where: 'internal', system: 'Due diligence pipeline', title: 'A pipeline designed around how you work', caption: 'Connected agents and checks, in the order you decide. Maria adds a check in plain language. It runs from now on.', ms: 13000,
        stages: [{ name: 'Data room', sub: 'Documents in' }, { name: 'Readers', sub: 'One per document' }, { name: 'Lookups', sub: 'Registry, credit, sanctions' }, { name: 'Checks', sub: 'Rules you decide' }, { name: 'Report', sub: 'Cited, approved by you' }],
        checksStage: 3, checks: ['Revenue in accounts matches contract totals', 'Company number identical across documents', 'Insurance certificate valid today'],
        newCheck: 'Flag any customer contract that can be ended if the company changes owner' },
      { kind: 'automation', where: 'internal', system: 'Due diligence pipeline · Settings', title: 'It runs on its own', caption: 'Starts when something arrives, re-checks on a schedule, and only calls a person when a check flags something.', ms: 9000,
        triggers: [{ when: 'A new file lands in the data room', then: 'The pipeline starts' }, { when: 'Every Monday 07:00', then: 'Certificates and sanctions are re-checked' }, { when: 'A check flags something', then: 'Maria gets one question on her phone' }],
        stats: [{ label: 'Runs, last 30 days', value: '14' }, { label: 'Finished without a person', value: '11' }, { label: 'Asked a question', value: '3' }],
        recent: [{ when: 'Mon 07:00', what: 'Weekly re-check · 4 companies · all clear', ok: true }, { when: 'Fri 15:12', what: 'Kestrel Robotics · new file · report updated', ok: true }, { when: 'Thu 09:40', what: 'Fjord Analytics · certificate expired · asked Maria', ok: false }] },
      { kind: 'readmany', where: 'internal', system: 'Readers', title: 'One AI reader per document', caption: 'Six documents read at once. Every fact keeps a link to the page it came from.', ms: 7500,
        docs: [{ name: 'Annual accounts 2025.pdf', facts: 14 }, { name: 'Customer contracts (12).pdf', facts: 18 }, { name: 'Liability insurance.pdf', facts: 5 }, { name: 'Tax certificate.pdf', facts: 3 }, { name: 'Employee list.xlsx', facts: 9 }, { name: 'ISO 9001 certificate.pdf', facts: 4 }],
        issue: 'Liability insurance certificate expired 31 Mar 2026' },
      { kind: 'lookups', where: 'external', system: 'Outside sources · API', title: 'It asks outside sources too', caption: 'Company registry, credit rating, sanctions lists, court records. Called automatically, answers kept with the file.', ms: 8500,
        calls: [{ service: 'Bolagsverket', query: 'Company 556743-2210', result: 'Registered 2014 · 3 board members · no changes this year', ms: '0.4 s' }, { service: 'UC credit rating', query: 'Halden Systems Ltd', result: 'Rating 4 of 5 · no payment remarks', ms: '0.6 s' }, { service: 'EU and OFAC sanctions', query: 'Company and 2 owners', result: 'No matches', ms: '0.3 s' }, { service: 'Court records', query: 'Last 5 years', result: 'No cases', ms: '0.8 s' }] },
      { kind: 'checks', where: 'internal', system: 'Checks', title: 'Your checks run, including the new one', caption: 'Rules in code decide what passes. Maria’s check is what catches the contract clause.', ms: 9000,
        checks: [{ name: 'Revenue in accounts matches contract totals', type: 'rule', result: 'Within 1%', ok: true }, { name: 'Company number identical across documents', type: 'rule', result: '6 of 6 documents', ok: true }, { name: 'Insurance certificate valid today', type: 'rule', result: 'Expired 31 Mar 2026', ok: false }, { name: 'No sanctions or court matches', type: 'lookup', result: 'Clear', ok: true }, { name: 'Contracts that end on change of owner', type: 'custom', result: '2 of 12 · pages 14, 31', ok: false }] },
      { kind: 'verify', where: 'internal', system: 'Review', reviewer: 'Maria', title: 'A person verifies, with the source highlighted', caption: 'Every value shows the exact passage it came from. Confirm or correct in one click.', ms: 13000,
        items: [
          { label: 'Revenue 2025', value: '42.1 MSEK', source: 'Annual accounts 2025.pdf · page 6', lines: ['Income statement for the financial year 2025', 'Net revenue for the year amounted to 42.1 MSEK, compared with 38.4 MSEK the year before.', 'Operating profit was 5.2 MSEK.', 'The company has no long-term debt.'], hit: 'Net revenue for the year amounted to 42.1 MSEK' },
          { label: 'Change of owner clause', value: 'Contract 7 · Nordic Retail AB', source: 'Customer contracts (12).pdf · page 14', lines: ['11. Termination', '11.1 Either party may terminate with 90 days written notice.', '11.2 The customer may terminate this agreement with immediate effect if the supplier undergoes a change of control.', '12. Governing law'], hit: 'terminate this agreement with immediate effect if the supplier undergoes a change of control' },
          { label: 'Board members', value: '3 · unchanged this year', source: 'Bolagsverket · lookup 09:41', lines: ['Company 556743-2210 · Halden Systems Ltd', 'Board: Erik Halden (chair), Lena Sund, Tomas Berg', 'Registered 2014 · Last change 2024-03-11'], hit: 'Board: Erik Halden (chair), Lena Sund, Tomas Berg' },
        ] },
      { kind: 'phone', where: 'phone', system: 'Your phone', title: 'Maria gets asked, not guessed for', caption: 'The expired certificate becomes one question to a person.', ms: 8000,
        notifTitle: 'Halden Systems: insurance certificate expired', body: 'The certificate in the data room expired 31 March. Request a current one from Halden?', primary: 'Send request', secondary: 'Skip', result: 'Request sent to Halden Systems' },
      { kind: 'portal', where: 'external', system: 'Data room · Halden Systems', title: 'Halden uploads, the pipeline continues', caption: 'The request lands in their data room. They upload, the checks run again on their own.', ms: 6500,
        url: 'dataroom.athercapital.se/halden', heading: 'Halden Systems Ltd · Data room', lines: ['Request from Ather Capital: a current liability insurance certificate'], files: ['Liability insurance 2026-27.pdf'], action: 'Upload', done: 'Uploaded · checks passed' },
      { kind: 'report', where: 'internal', system: 'Deals', title: 'A report you can trust', caption: 'Risk by area, every finding cites its page or its source. Maria approves before it goes to the team.', ms: 9000,
        reportTitle: 'Due diligence · Halden Systems Ltd', reviewer: 'Maria',
        areas: [{ area: 'Finance', level: 'green', note: 'Stable revenue, credit 4 of 5' }, { area: 'Legal', level: 'amber', note: '2 contracts end on change of owner' }, { area: 'Insurance', level: 'green', note: 'Valid to 31 Mar 2027' }, { area: 'Compliance', level: 'green', note: 'No sanctions, no court cases' }],
        findings: ['2 of 12 customer contracts end on change of ownership (pages 14, 31 · your check)', 'Liability insurance renewed, valid to 31 Mar 2027 (new certificate)', 'No sanctions or court matches for the company or owners (EU, OFAC, courts · lookups)', 'Revenue 2025 matches signed contract values within 1% (accounts p. 6)'] },
    ],
  },
  {
    id: 'insurance', label: 'Insurance', tagline: 'A claim from the web form to a decision', company: 'Norra Försäkring',
    scenes: [
      { kind: 'portal', where: 'external', system: 'Public website', title: 'A customer reports a claim on your website', caption: 'A normal web form. Photos and a plumber report attached.', ms: 8000,
        url: 'norraforsakring.se/claim', heading: 'Report a claim', lines: ['Water damage · Storgatan 12, Uppsala', 'Policy HM-44-2210'], files: ['Plumber report.pdf', 'Repair estimate.pdf', 'Photos (6)'], action: 'Send claim', done: 'Claim 2291 received' },
      { kind: 'record', where: 'internal', system: 'Claims', title: 'AI prepares the claim file', caption: 'Policy checked, estimate compared with the report. One thing is missing.', ms: 9000,
        recordTitle: 'Claim 2291', doc: 'Claim 2291 · 4 files', fields: [{ label: 'Policy', value: 'HM-44-2210, active' }, { label: 'Damage', value: 'Water, burst pipe' }, { label: 'Estimate', value: '48 000 SEK, matches report' }, { label: 'Photos', value: '6 attached' }], missing: 'Incident date', askWho: 'Sara' },
      { kind: 'phone', where: 'phone', system: 'Your phone', title: 'Sara decides how to ask', caption: 'The system does not guess a date. It asks the adjuster how to get it.', ms: 9000,
        notifTitle: 'Claim 2291 is missing the incident date', body: 'The form has no date. Ask the tenant by text message?', primary: 'Ask tenant', secondary: 'Call instead', result: 'Text message sent to the tenant' },
      { kind: 'chat', where: 'external', system: 'Tenant’s phone', title: 'The tenant answers from their phone', caption: 'A plain text message. The reply goes straight into the claim.', ms: 9000,
        contact: 'Norra Försäkring', outgoing: 'Hi! About your water damage claim at Storgatan 12: which date did the damage happen? Reply with the date.', reply: '14 March', afterReply: 'Thanks. Your claim is being assessed. We will be in touch within 5 days.' },
      { kind: 'board', where: 'internal', system: 'Claims', title: 'The claim moves on', caption: 'Complete file, moved to assessing. Nobody chased anyone.', ms: 7000,
        columns: ['New', 'Assessing', 'Decided'], into: 1, card: 'Claim 2291 · Storgatan 12', cardSub: 'Water damage · 14 Mar · complete',
        cards: [{ col: 0, title: 'Claim 2292 · Vasagatan 3', sub: 'Theft' }, { col: 1, title: 'Claim 2288 · Kungsgatan 9', sub: 'Fire, minor' }, { col: 2, title: 'Claim 2280 · Odengatan 14', sub: 'Approved' }], toast: 'Customer notified: claim is being assessed' },
    ],
  },
  {
    id: 'logistics', label: 'Logistics', tagline: 'Devices in the field and the office', company: 'Mälar Frakt',
    scenes: [
      { kind: 'devices', where: 'internal', system: 'Fleet', phase: 'offline', title: 'A truck loses its connection', caption: 'It keeps recording. Readings are stored on the device until it is back.', ms: 8000,
        devices: [{ name: 'Truck 12', where: 'E4 north of Uppsala', ok: false, note: 'Offline 18 min · 42 readings stored on board' }, { name: 'Truck 7', where: 'Västerås terminal', ok: true, note: 'On schedule' }, { name: 'Cold trailer 3', where: 'With Truck 12', ok: true, note: '4.1 °C · logging locally' }, { name: 'Warehouse gate', where: 'Enköping', ok: true, note: '2 arrivals this hour' }] },
      { kind: 'phone', where: 'phone', system: 'Your phone', title: 'The fleet manager is told, not alarmed', caption: 'The AI checks the delivery plan first. Nothing is late yet, so the message says so.', ms: 9000,
        notifTitle: 'Truck 12 offline for 18 minutes', body: 'Cold chain still logging on board. Deliveries still on schedule. Notify the customer now or wait 15 minutes?', primary: 'Wait 15 min', secondary: 'Notify customer', result: 'Watching. You will be told if it changes.' },
      { kind: 'devices', where: 'internal', system: 'Fleet', phase: 'synced', title: 'Back online. Everything catches up.', caption: 'The stored readings sync on their own. The cold chain record has no gap.', ms: 7500,
        devices: [{ name: 'Truck 12', where: 'E4 north of Uppsala', ok: true, note: 'Online · 42 readings synced · ETA 14:20' }, { name: 'Truck 7', where: 'Västerås terminal', ok: true, note: 'On schedule' }, { name: 'Cold trailer 3', where: 'With Truck 12', ok: true, note: '4.0 °C · no gap in the log' }, { name: 'Warehouse gate', where: 'Enköping', ok: true, note: '2 arrivals this hour' }],
        toast: 'Cold chain log complete. Customer ETA updated.' },
      { kind: 'portal', where: 'external', system: 'Customer tracking page', title: 'The customer sees the updated ETA', caption: 'Their tracking page updates on its own. No call to the office.', ms: 7000,
        url: 'track.malarfrakt.se/8812', heading: 'Shipment 8812', lines: ['Truck 12 · Cold chain OK', 'Arriving 14:20 today'], action: 'Get a text when it arrives', done: 'On its way' },
      { kind: 'log', where: 'internal', system: 'Activity', title: 'Everything is on the record', caption: 'Including the 18 minutes offline, with every reading in place.', ms: 7000,
        entries: [{ who: 'Truck 12', what: 'Lost connection 13:02. Recording locally.' }, { who: 'AI', what: 'Checked the plan: no delivery at risk. Told Johan, suggested waiting.' }, { who: 'Johan', what: 'Chose to wait 15 minutes' }, { who: 'Truck 12', what: 'Back online 13:20. 42 readings synced.' }, { who: 'System', what: 'ETA updated on the customer tracking page' }] },
    ],
  },
]

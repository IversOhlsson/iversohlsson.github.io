/** All copy for the site lives here so it can be edited without touching layout. */

export const SITE = {
  name: 'Philip Ivers Ohlsson',
  mark: 'PIO/26',
  location: 'Uppsala, Sweden',
  email: 'philip.iversohlsson@gmail.com',
  linkedin: 'https://www.linkedin.com/in/philip-ivers-ohlsson-9874a313b/',
  github: 'https://github.com/IversOhlsson',
  status: 'TAKING GREENFIELD WORK · Q4 2026',
  statusShort: 'AVAILABLE Q4 2026',
}

export const NAV = [
  { href: '#offer', label: 'What I do' },
  { href: '#platform', label: 'Case study' },
  { href: '#approach', label: 'Approach' },
  { href: '#work', label: 'Work' },
  { href: '#contact', label: 'Contact' },
]

export const HERO = {
  crumb: 'greenfield',
  title: 'Greenfield systems, <em>built and hosted.</em>',
  lead:
    'I take a product from an empty repository to a production stack that runs: architecture, services, LLM agents, frontend, infrastructure, CI/CD. Then I host it and keep it running. One engineer, accountable for the whole system.',
  facts: ['Solo, end to end', 'Your cloud or mine', 'Docs written as I go'],
  primary: { href: '#contact', label: 'Start a conversation' },
  secondary: { href: '#platform', label: 'See a system I run' },
}

export type Pillar = { n: string; label: string; title: string; points: string[] }

export const OFFER: Pillar[] = [
  {
    n: '01',
    label: 'BUILD',
    title: 'Architecture and code',
    points: [
      'Bounded services behind one typed contract (protobuf, Connect-RPC), in Go and Python where each fits.',
      'LLM and agent workflows where decisions come from code and the model only reads, extracts and phrases.',
      'Web frontends for operators and technical users, plus the internal tooling nobody budgets for.',
    ],
  },
  {
    n: '02',
    label: 'SHIP',
    title: 'Pipeline and production',
    points: [
      'Cloud provisioned with Terraform (GCP, Azure, Oracle) or your own hardware behind a private overlay.',
      'CI that rebuilds only what changed, tags images by commit, and scans secrets, code and containers before merge.',
      'A hosted dev environment from week one, so progress is something you click through, not a slide.',
    ],
  },
  {
    n: '03',
    label: 'RUN',
    title: 'Hosting and operations',
    points: [
      'I host the stack and keep it up: deploys, rollbacks, schema changes, model providers, certificates.',
      'Costs stay visible. Every model call is priced in its trace; spot instances and free tiers where they fit.',
      'Hand-over when you want it in-house: ADRs, walkthroughs, and a repo written to clone and run without me.',
    ],
  },
]

export const PLATFORM = {
  kicker: 'CASE STUDY / AETHER SPACE',
  title: 'A launch marketplace where the first thing a customer does is <em>upload a PDF.</em>',
  lead: [
    'Satellite companies and launch providers never talk directly. Each side hands the platform a document it already has, a launch-description brief or a launch service agreement, and from then on the marketplace works from structured data: needs, term sheets, matching, agreements.',
    'Built and hosted from an empty repo. Two Go services, two Python services, a React SPA, one proto contract, Terraform on GCP, and a CI/CD pipeline with security gates on the production branch.',
  ],
  stats: [
    { value: '4', label: 'application services' },
    { value: '1', label: 'proto contract, generated code committed' },
    { value: '2', label: 'hosted stacks: dev on push, prod on merge' },
    { value: '11', label: 'CI workflows incl. security gates' },
  ],
}

export type StepKind = 'code' | 'model' | 'human' | 'store'

export type Step = {
  kind: StepKind
  name: string
  what: string
  /** Optional side note, e.g. a fallback or a cap. */
  note?: string
}

export const PIPELINE: { prepare: Step[]; graph: Step[] } = {
  prepare: [
    { kind: 'store', name: 'upload', what: 'PDF lands in MinIO; core mints an intake id and calls the agents service.' },
    { kind: 'code', name: 'read_text_layer', what: 'Embedded text with positions, page by page.', note: 'OCR runs only for a page with no text layer.' },
    { kind: 'code', name: 'split_regions', what: 'Layout analysis labels each region text, table or figure, keeping page and bbox.' },
    { kind: 'code', name: 'tables_to_markdown', what: 'Rebuilt from the parser cell grid. Numbers, units and dates parsed by regex.' },
    { kind: 'model', name: 'figure_to_text', what: 'Vision on the crop returns a caption or a data block, so downstream stays text-only.', note: 'Only when a figure exists.' },
    { kind: 'code', name: 'chunk_and_tag', what: 'One chunk per paragraph, table or figure. A keyword map onto the need schema fills covers[].' },
    { kind: 'store', name: 'embed_and_store', what: 'One vector per chunk. Rows keyed by intake and page in Postgres with pgvector. No PDF bytes in graph state.' },
  ],
  graph: [
    { kind: 'model', name: 'segment_needs', what: 'How many distinct launches does this document describe? One judgment call, on the reasoning model.' },
    { kind: 'code', name: 'ensure_needs', what: 'Stable ids, a cap of twelve, and a fallback need if the model returned none. Trust nothing.' },
    { kind: 'model', name: 'extract_need × N', what: 'Fan-out, one call per need, reading only the chunks tagged for its fields. Strict JSON schema; unknown stays empty, never guessed.' },
    { kind: 'code', name: 'validate_need', what: 'Inclination 0 to 180, altitude 150 to 2000 km, min ≤ max, real ISO dates.', note: 'Errors fed back, up to 3 attempts.' },
    { kind: 'code', name: 'normalize_features', what: 'Orbit types, mass totals, form factors, one overall window: the flat shape the marketplace matches on.' },
    { kind: 'code', name: 'gap_check', what: 'Missing fields become questions. Pure code, no model.' },
    { kind: 'model', name: 'phrase_questions', what: 'Canned gap questions rewritten to read naturally. Code merges by field so a bad answer can never drop a question.' },
    { kind: 'human', name: 'await_answers', what: 'The graph interrupts. The RPC returns AWAITING_INPUT, the checkpoint persists in Postgres, and a later call resumes from this exact spot.', note: 'Max 2 rounds.' },
    { kind: 'code', name: 'apply_answers', what: 'Each answer becomes a chunk with its source recorded, and the loop returns to gap_check.' },
    { kind: 'store', name: 'finalize', what: 'Needs, features and the full priced trace persist in core. A gap delays matching; it never blocks it.' },
  ],
}

export const PRINCIPLES = [
  {
    title: 'Decisions come from code.',
    body: 'Pricing rules, validation and gap checks are pure functions. The model reads, extracts and phrases. Nothing else.',
  },
  {
    title: 'Deterministic in CI.',
    body: 'A replay provider makes the whole start → interrupt → resume → ready path byte-identical with no model in the loop. Every fixture runs on every push.',
  },
  {
    title: 'Durable interrupts.',
    body: 'The graph pauses on a human and resumes from a Postgres checkpoint. Core stays the business source of truth; a lost thread is just re-run.',
  },
  {
    title: 'Every run is a priced trace.',
    body: 'Each step records input, output, model, tokens and thinking budget, rendered as HTML reports you can read without the code.',
  },
]

export const OPS = [
  { k: 'Provisioning', v: 'Terraform: VM, Artifact Registry, IP-allowlisted firewall. Deploys go over an IAP tunnel; port 22 is never public.' },
  { k: 'Builds', v: 'An image is rebuilt only when the git tree hash of its inputs changed. Tagged by content hash and commit; rollback is redeploying an older sha.' },
  { k: 'Security gates', v: 'gitleaks, semgrep, trivy, govulncheck, pip-audit and npm audit block the merge to the production branch.' },
  { k: 'Two stacks', v: 'A push to develop lands on the dev host in minutes with hot reload. Production runs immutable images from the same compose shape.' },
  { k: 'Model providers', v: 'Swapped by one env var: Gemini on Vertex AI with the VM service account (no key files), Ollama locally, replay in CI.' },
  { k: 'Data', v: 'One Postgres, one schema per bounded context, cross-schema foreign keys banned. Idempotent init SQL replayed on every deploy.' },
]

export const PLATFORM_TAGS = [
  'Go', 'Python', 'TypeScript / React', 'protobuf / Connect-RPC', 'Envoy', 'Keycloak', 'LangGraph',
  'Gemini / Vertex AI', 'Ollama', 'pgvector', 'Postgres', 'MinIO', 'Docker Compose', 'Terraform', 'GCP',
  'GitHub Actions', 'gitleaks', 'semgrep', 'trivy',
]

export const APPROACH = [
  {
    n: '01',
    title: 'Scope',
    body: 'A week or two. We agree on what the system is and is not, I write the first decision records, and you get a running skeleton with the real contract in it.',
  },
  {
    n: '02',
    title: 'Build',
    body: 'Weekly increments on a hosted dev environment you can click through. Walkthroughs, a glossary and ADRs written alongside the code, not after it.',
  },
  {
    n: '03',
    title: 'Ship',
    body: 'Production provisioned with Terraform, CI/CD with security gates, immutable images tagged by commit, and a rollback path that has actually been used.',
  },
  {
    n: '04',
    title: 'Run',
    body: 'I host it and keep it running for as long as you want. Or hand it over: the repo is written to be cloned and run by someone who is not me.',
  },
]

export type Work = {
  label: string
  title: string
  year: string
  body: string
  tags: string[]
  link?: { href: string; label: string }
}

export const WORK: Work[] = [
  {
    label: 'CLAUDE.MOBILE',
    title: 'Claude Mobile Manager',
    year: '2026',
    body: 'Self-hosted manager for Claude Code agents, driven from a phone over a Nebula overlay that terminates on a free-tier cloud VM. Voice in via local Whisper, live previews proxied per session. Product, frontend, backend and edge infra, shipped solo.',
    tags: ['Node', 'TypeScript', 'Nebula', 'Terraform', 'PWA', 'Claude Agent SDK'],
    link: { href: 'https://github.com/IversOhlsson/claude-mobile-manager', label: 'Source' },
  },
  {
    label: 'GOODS',
    title: 'Goods inventory',
    year: '2019',
    body: 'Inventory reception for small businesses with QR-scanned intake. React front, Django back, MySQL, containerised and hosted on Azure so customers got a deployable system rather than a prototype.',
    tags: ['React', 'Django', 'Docker', 'Azure'],
  },
  {
    label: 'RANKSVERIGE',
    title: 'RankSverige analytics',
    year: '2020',
    body: 'Company and CEO-tenure analytics for investors, normalised against industry baselines with a DuPont decomposition. Designed, built and pitched as a one-person product.',
    tags: ['Python', 'JavaScript', 'Financial analytics'],
  },
]

export const BACKGROUND = {
  title: 'Before this',
  body: [
    'Full-stack engineer and systems architect across life sciences, IoT and mission-critical systems: edge devices, signal processing, real-time analytics, validation pipelines in regulated environments, and data and ML work from research notebooks to production.',
    'Much of that work sat between engineers and the people who needed the system to work. Turning requirements into something real, and trade-offs into plain terms, is most of the job.',
  ],
  tags: ['gRPC', 'WebRTC', 'Pub/Sub', 'Kubernetes', 'Azure', 'Cloudflare', 'Qt', 'C++', 'PyTorch', 'Snowflake', 'DBT', 'Datadog', 'ArgoCD'],
}

export const CONTACT = {
  title: 'Have a system that <em>doesn’t exist yet?</em>',
  body: 'Send a few lines about what it should do and who it is for. I reply with questions, not a quote, and we take it from there.',
}

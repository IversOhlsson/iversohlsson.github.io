export type AreaId = '01' | '02' | '03' | '04'

export type Area = {
  id: AreaId
  badge: string
  shortLabel: string
  /** Uppercase mono label for the left list. */
  monoLabel: string
  /** Terminal path crumb, e.g. "machine.learning". */
  crumb: string
  /** Inline HTML allowed: <em> for italics, <strong> for emphasis. */
  title: string
  brief: string
  /** Focus statements — "what I'm good at / what the focus has been". */
  capabilities: string[]
  /** Stack / technologies. */
  tags: string[]
}

export const AREAS: Record<AreaId, Area> = {
  '01': {
    id: '01',
    badge: '01',
    shortLabel: 'Machine Learning',
    monoLabel: 'ML & DATA',
    crumb: 'machine.learning',
    title: 'Machine Learning <em>& Data Science</em>',
    brief: 'ML as a service across research and production — from graph neural networks on molecules to signal-processing on the edge. The rapid-iteration path R&D needs, and the production paths inference actually runs on.',
    capabilities: [
      'ML across the R&D-to-production lifecycle — same engineering on both sides of the handoff.',
      'Molecular property prediction with graph neural networks for life-science R&D.',
      'Signal-processing ML — direction finding, sensor analysis, edge deployment.',
      'GenAI applications and LLM-driven workflows for business contexts.',
      'Open-source tooling for ML data workflows.',
    ],
    tags: ['PyTorch', 'GNNs', 'LLMs / GenAI', 'Signal processing', 'ETL', 'Python'],
  },
  '02': {
    id: '02',
    badge: '02',
    shortLabel: 'Architecture',
    monoLabel: 'ARCHITECTURE',
    crumb: 'architecture',
    title: 'Architecture <em>& Distributed Systems</em>',
    brief: 'Architecture discussions and solution design before code. Cloud with infrastructure as code, internal servers, and distributed systems — event-driven, real-time, IoT-enabled. End to end.',
    capabilities: [
      'Architecture discussions and solution design before development starts.',
      'Cloud architecture with infrastructure as code.',
      'Internal server design and distributed system patterns.',
      'Real-time edge components and ETL pipelines for analytics, integration, and ML.',
      'Event-driven systems — gRPC, WebRTC, Pub/Sub, Akka Streams.',
    ],
    tags: ['gRPC', 'WebRTC', 'ETL', 'Pub/Sub', 'Edge', 'Real-time', 'Docker'],
  },
  '03': {
    id: '03',
    badge: '03',
    shortLabel: 'Full-stack',
    monoLabel: 'FULL-STACK',
    crumb: 'fullstack',
    title: 'Full-stack <em>& Product</em>',
    brief: 'Work across the entire stack — backend, frontend, deployment. Architecture first, then development based on it. UX and stakeholder needs informing every layer of the build.',
    capabilities: [
      'Architecture first — design the system, then build to the design.',
      'Backend, frontend, and deployment across IoT and product platforms.',
      'UX-led decisions grounded in stakeholder workflows.',
      'Internal tooling for operational teams and validation workflows.',
      'GenAI applications and implementation-training programs.',
    ],
    tags: ['Python', 'C++', 'TypeScript / React', 'SQL', 'Docker', 'Azure', 'GCP', 'Qt'],
  },
  '04': {
    id: '04',
    badge: '04',
    shortLabel: 'Security & Signal',
    monoLabel: 'SEC & SIGNAL',
    crumb: 'security.signal',
    title: 'Security <em>& Signal</em>',
    brief: 'Secure environments across many fields — bio-pharma, SaaS, regulated industries, offline grids. Where systems have to be right the first time, run reliably, and meet regulatory bars.',
    capabilities: [
      'Secure environments across bio-pharma, SaaS, and regulated industries.',
      'Offline-grid operations and edge deployment under unreliable network conditions.',
      'Validation pipelines aligned with regulatory and quality standards.',
      'Signal processing for direction finding, sensor analysis, and field monitoring.',
      'Mission-critical systems where reliability is the requirement.',
    ],
    tags: ['Signal processing', 'Edge', 'IoT', 'Real-time', 'Validation / QA', 'Python', 'C++'],
  },
}

export const AREA_ORDER: AreaId[] = ['01', '02', '03', '04']

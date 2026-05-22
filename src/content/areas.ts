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
    shortLabel: 'Data & ML',
    monoLabel: 'DATA & ML',
    crumb: 'data.science',
    title: 'Data <em>& Machine Learning</em>',
    brief: 'Data across research and production — pipelines, visualization, analytics, and exploratory machine learning. The production-grade data work alongside the rapid R&D iteration ML needs.',
    capabilities: [
      'Data engineering — research datasets, feature preparation, and analytics feeds.',
      'Data visualization — turning analytics and model output into something operators and scientists can act on.',
      'Exploratory ML for R&D — graph neural networks, signal-processing models, and GenAI workflows.',
      'Tooling and notebooks that make R&D work reproducible and reviewable.',
    ],
    tags: ['Pandas', 'PyTorch', 'GNNs', 'LLMs / GenAI', 'Snowflake', 'DBT', 'Python', 'ETL', 'Data viz'],
  },
  '02': {
    id: '02',
    badge: '02',
    shortLabel: 'Architecture',
    monoLabel: 'ARCHITECTURE',
    crumb: 'architecture',
    title: 'Architecture <em>& Distributed Systems</em>',
    brief: 'Event-driven, real-time, distributed systems — cloud, edge, and the path between. End-to-end designs that survive contact with hardware, networks, and the field.',
    capabilities: [
      'Event-driven systems — gRPC, WebRTC, Pub/Sub, Akka Streams.',
      'Real-time edge components and ETL pipelines feeding analytics, integration, and ML.',
      'Cloud architecture with infrastructure as code.',
      'Distributed systems designed end-to-end, from device to dashboard.',
    ],
    tags: ['gRPC', 'WebRTC', 'Pub/Sub', 'Docker', 'Kubernetes', 'Terraform', 'Azure', 'GCP', 'Cloudflare', 'Go'],
  },
  '03': {
    id: '03',
    badge: '03',
    shortLabel: 'Full-stack',
    monoLabel: 'FULL-STACK',
    crumb: 'fullstack',
    title: 'Full-stack <em>& Product</em>',
    brief: 'Shipping product-grade software — backend, frontend, deployment. Desktop and web, IoT product platforms, and internal tools built for operators and R&D users who aren’t developers.',
    capabilities: [
      'Backend, frontend, and deployment across IoT and product platforms.',
      'Desktop (Qt) and web (React) interfaces for technical end-users.',
      'Internal tooling for operations teams and R&D workflows.',
      'GenAI applications and implementation-training programs.',
    ],
    tags: ['TypeScript / React', 'Next.js', 'Qt', 'Python', 'SQL', 'C++'],
  },
  '04': {
    id: '04',
    badge: '04',
    shortLabel: 'Reliability',
    monoLabel: 'RELIABILITY',
    crumb: 'reliability',
    title: 'Reliability <em>& Mission-Critical</em>',
    brief: 'Systems that have to be right the first time — regulated industries, offline-grid operations, validation pipelines, and field instruments. Where “mostly works” isn’t a finished state.',
    capabilities: [
      'Validation pipelines aligned with regulatory and quality standards.',
      'Offline-grid operation and edge deployment under unreliable network conditions.',
      'Signal processing for direction finding, sensor analysis, and field monitoring.',
      'Mission-critical systems across bio-pharma, advanced manufacturing, and regulated industries.',
    ],
    tags: ['Signal processing', 'Edge', 'IoT', 'Validation / QA', 'Datadog', 'ArgoCD', 'GitHub Actions', 'C++', 'Python'],
  },
}

export const AREA_ORDER: AreaId[] = ['01', '02', '03', '04']

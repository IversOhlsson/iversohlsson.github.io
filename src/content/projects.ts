export type Project = {
  id: string
  /** Uppercase mono label for the list row. */
  monoLabel: string
  /** Display title for the expanded view. */
  title: string
  /** Year string shown on the row. */
  year: string
  /** One-line kicker shown on the collapsed row. */
  kicker: string
  /** Paragraphs for the expanded description (HTML allowed: <em>, <strong>). */
  body: string[]
  /** Stack tags shown as #tags. */
  tags: string[]
  /** Optional thumbnail/hero image path under /. */
  image?: string
  /** Optional external link (repo / live / paper). */
  link?: { href: string; label: string }
}

export const PROJECTS: Project[] = [
  {
    id: 'claude-mobile',
    monoLabel: 'CLAUDE.MOBILE',
    title: 'Claude Mobile Manager <em>— phone-driven agents over a P2P tunnel</em>',
    year: '2026',
    kicker: 'Self-hosted manager for Claude Code agents — voice-first, multi-session, P2P over Nebula. Built solo, app to infra.',
    body: [
      'A self-hosted product that runs next to a <strong>Claude Code</strong> install and exposes a mobile web UI for spawning and talking to agents. Each session has its own working directory and runs as either a raw PTY or a structured SDK agent with tool-approval prompts.',
      'The phone reaches the home box through a <strong>Nebula</strong> overlay terminating on an Oracle Cloud free-tier VM — both ends dial out to the lighthouse, so nothing has to be open on the home router and CGNAT is no problem. The edge (VM, firewall, DNS, TLS) is provisioned with Terraform.',
      'Push-to-talk voice is transcribed locally with <strong>faster-whisper</strong>; the frontend is an installable PWA with a live per-instance web preview proxied from a container-side <em>vite dev</em>. Shipped end-to-end alone — product, frontend, backend, ops.',
    ],
    tags: ['Node', 'TypeScript', 'Docker', 'Nebula', 'Terraform', 'WebSockets', 'PWA', 'faster-whisper', 'Claude Agent SDK'],
    link: { href: 'https://github.com/IversOhlsson/claude-mobile-manager', label: 'github.com/IversOhlsson/claude-mobile-manager' },
  },
  {
    id: 'sj',
    monoLabel: 'SJ.BOOKING',
    title: 'SJ / Trafikverket <em>— booking automation</em>',
    year: '2021',
    kicker: 'Scratched my own itch — headless booking flow against SJ and Trafikverket scheduling APIs.',
    body: [
      'A small automation that drives the SJ / Trafikverket booking flow end-to-end — auth, slot search, confirmation — without manually clicking through the web UI.',
      'Built as a personal tool to stop wasting evenings refreshing a booking page; a useful exercise in modelling a stateful web flow as a clean script, and a reminder that the best tools usually start as something you wanted for yourself.',
    ],
    tags: ['Python', 'Web automation', 'API integration'],
  },
  {
    id: 'ranksv',
    monoLabel: 'RANKSVERIGE',
    title: 'RankSverige <em>— CEO & company analytics</em>',
    year: '2020',
    kicker: 'Founder-side bet on a data product — dynamic analysis of Swedish companies and CEO tenure, normalized against industry baselines.',
    body: [
      'A product attempt aimed at investors and analysts: dynamic analysis of company metrics over time, factoring in CEO tenure and normalized against historical data and industry standards.',
      'Uses the <strong>DuPont model</strong> to decompose performance into operational components — efficiency, profitability, leverage — and span industry branches like IT & Telecom, Banking & Finance, and Construction. Designed, built, and pitched end-to-end as a one-person effort.',
    ],
    tags: ['Python', 'JavaScript', 'HTML / CSS', 'DuPont model', 'Financial analytics'],
  },
  {
    id: 'goods',
    monoLabel: 'GOODS',
    title: 'Goods <em>— inventory management</em>',
    year: '2019',
    kicker: 'Productized for small businesses — inventory reception with QR scanning, React front-end, Django back-end, deployed on Azure.',
    body: [
      'A streamlined inventory and goods-reception product aimed at small businesses. React on the front-end, Django on the back-end, MySQL for storage — containerized with Docker and hosted on Azure, so customers got a real deployable system, not a prototype.',
      'Users register products via QR scanner which auto-populates product information, with account management and editing on top. Built solo from spec through deploy as an exercise in shipping something usable rather than a demo.',
    ],
    tags: ['React', 'Django', 'MySQL', 'Docker', 'Azure', 'QR scanning'],
  },
  {
    id: 'dml',
    monoLabel: 'DEEP.COLORING',
    title: 'Deep Learning Image Coloring <em>— U-Net vs VGG-16 extended</em>',
    year: '2019',
    kicker: 'Colorizing grayscale images with U-Net and an extended VGG-16, with a custom perceptual loss.',
    body: [
      'Image colorization on the <strong>Imagenette</strong> subset, comparing a custom U-Net against an extended VGG-16 with transfer learning.',
      'Includes a custom <strong>perceptual loss</strong> function to improve the coherence of generated colored images, evaluated against MSE on both quantitative metrics and visual inspection. Built in PyTorch.',
      'Result: perceptual loss yields more nuanced colorization than MSE; batch size and color accuracy were the main observed challenges, especially for U-Net.',
    ],
    tags: ['Python', 'PyTorch', 'U-Net', 'VGG-16', 'Transfer learning', 'Perceptual loss'],
  },
]

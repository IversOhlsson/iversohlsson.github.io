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
    id: 'ranksv',
    monoLabel: 'RANKSVERIGE',
    title: 'RankSverige <em>— CEO & company analytics</em>',
    year: '2023',
    kicker: 'Dynamic analysis of Swedish companies and CEO tenure, normalized against industry baselines.',
    body: [
      'A dynamic analysis of company metrics over time, factoring in CEO tenure and normalized against historical data and industry standards.',
      'Uses the <strong>DuPont model</strong> to decompose performance into operational components — efficiency, profitability, leverage — and span industry branches like IT & Telecom, Banking & Finance, and Construction.',
    ],
    tags: ['Python', 'JavaScript', 'HTML / CSS', 'DuPont model', 'Financial analytics'],
    image: '/images/backup/project/ranksverige.png',
  },
  {
    id: 'goods',
    monoLabel: 'GOODS',
    title: 'Goods <em>— inventory management</em>',
    year: '2022',
    kicker: 'Inventory reception system with QR scanning, React front-end and a Django back-end.',
    body: [
      'A streamlined inventory and goods-reception system for businesses. React on the front-end, Django on the back-end, MySQL for storage.',
      'The whole stack is containerized with Docker and hosted on Azure. Users register products via QR scanner which auto-populates product information, with account management and editing on top.',
    ],
    tags: ['React', 'Django', 'MySQL', 'Docker', 'Azure', 'QR scanning'],
    image: '/images/backup/project/goods.png',
  },
  {
    id: 'sj',
    monoLabel: 'SJ.BOOKING',
    title: 'SJ / Trafikverket <em>— booking automation</em>',
    year: '2022',
    kicker: 'Headless booking flow against SJ and Trafikverket scheduling APIs.',
    body: [
      'A small automation that drives the SJ / Trafikverket booking flow end-to-end — auth, slot search, confirmation — without manually clicking through the web UI.',
      'Built as a personal tool for repeated bookings; useful exercise in modelling a stateful web flow as a clean script.',
    ],
    tags: ['Python', 'Web automation', 'API integration'],
    image: '/images/backup/project/sj_trafikverket.png',
  },
  {
    id: 'dml',
    monoLabel: 'DEEP.COLORING',
    title: 'Deep Learning Image Coloring <em>— U-Net vs VGG-16 extended</em>',
    year: '2023',
    kicker: 'Colorizing grayscale images with U-Net and an extended VGG-16, with a custom perceptual loss.',
    body: [
      'Image colorization on the <strong>Imagenette</strong> subset, comparing a custom U-Net against an extended VGG-16 with transfer learning.',
      'Includes a custom <strong>perceptual loss</strong> function to improve the coherence of generated colored images, evaluated against MSE on both quantitative metrics and visual inspection. Built in PyTorch.',
      'Result: perceptual loss yields more nuanced colorization than MSE; batch size and color accuracy were the main observed challenges, especially for U-Net.',
    ],
    tags: ['Python', 'PyTorch', 'U-Net', 'VGG-16', 'Transfer learning', 'Perceptual loss'],
    image: '/images/backup/project/dml_color.png',
  },
]

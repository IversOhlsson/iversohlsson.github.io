export type SectionItem = {
  id: string
  title: string
  copy: string
  boardLabel: string
  position: [number, number, number]
}

export const sectionContent: SectionItem[] = [
  {
    id: 'intro',
    title: 'Intro: Philip Ivers Ohlsson',
    copy: 'I build data and AI products with interactive 3D experiences for storytelling and user engagement.',
    boardLabel: 'INTRO',
    position: [-6, 0.8, -4],
  },
  {
    id: 'projects',
    title: 'Projects: Product + AI',
    copy: 'Selected projects include AI workflows, data engineering, and real-time visual prototypes with React and Three.js.',
    boardLabel: 'PROJECTS',
    position: [0, 0.8, -8],
  },
  {
    id: 'contact',
    title: 'Contact: Let\'s Build',
    copy: 'Open for collaborations around AI products, interactive demos, and modern full-stack experiences.',
    boardLabel: 'CONTACT',
    position: [6, 0.8, -4],
  },
]

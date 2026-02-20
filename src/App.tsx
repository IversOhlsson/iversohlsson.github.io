import { useMemo, useState } from 'react'
import './App.css'
import WorldScene from './components/WorldScene'
import { sectionContent } from './content/sections'

function App() {
  const [activeSectionId, setActiveSectionId] = useState(sectionContent[0].id)

  const activeSection = useMemo(
    () => sectionContent.find((section) => section.id === activeSectionId) ?? sectionContent[0],
    [activeSectionId],
  )

  return (
    <div className="appRoot">
      <WorldScene sections={sectionContent} onActiveSectionChange={setActiveSectionId} />

      <div className="hudOverlay">
        <p className="kicker">3D Portfolio World</p>
        <h1>{activeSection.title}</h1>
        <p className="copy">{activeSection.copy}</p>
        <p className="hint">Move with WASD or Arrow keys. Walk near a board to switch section.</p>
      </div>

      <aside className="boardLegend" aria-label="Section boards">
        <h2>Boards</h2>
        <ul>
          {sectionContent.map((section) => (
            <li key={section.id} className={section.id === activeSection.id ? 'active' : ''}>
              {section.title}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}

export default App

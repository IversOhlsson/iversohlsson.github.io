import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import WorldScene from './components/WorldScene'
import { sectionContent } from './content/sections'

function App() {
  const [activeSectionId, setActiveSectionId] = useState(sectionContent[0].id)
  const [interactionSectionId, setInteractionSectionId] = useState(sectionContent[0].id)
  const [canInteract, setCanInteract] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formMessage, setFormMessage] = useState('')

  const activeSection = useMemo(
    () => sectionContent.find((section) => section.id === activeSectionId) ?? sectionContent[0],
    [activeSectionId],
  )

  const interactionSection = useMemo(
    () => sectionContent.find((section) => section.id === interactionSectionId) ?? activeSection,
    [activeSection, interactionSectionId],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false)
        return
      }

      if (event.key === 'Enter' && canInteract && !isModalOpen && !event.repeat) {
        event.preventDefault()
        setIsModalOpen(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [canInteract, isModalOpen])

  const onSubmitContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const subject = encodeURIComponent('Portfolio Contact')
    const body = encodeURIComponent(`Name: ${formName}\nEmail: ${formEmail}\n\n${formMessage}`)
    window.location.href = `mailto:philip.ivers.ohlsson@gmail.com?subject=${subject}&body=${body}`
  }

  const onInteractionChange = useCallback((sectionId: string, isNear: boolean) => {
    setInteractionSectionId(sectionId)
    setCanInteract(isNear)
  }, [])

  return (
    <div className="appRoot">
      <WorldScene
        sections={sectionContent}
        onActiveSectionChange={setActiveSectionId}
        onInteractionChange={onInteractionChange}
      />

      <div className="hudOverlay">
        <p className="kicker">3D Portfolio World</p>
        <h1>{activeSection.title}</h1>
        <p className="copy">{activeSection.copy}</p>
        <p className="hint">WASD/Arrows move, Shift sprints, Q/E rotates camera. Enter interacts, Esc closes windows.</p>
      </div>

      <div className={`interactionPrompt ${canInteract ? 'show' : ''}`}>
        Press Enter to interact with {interactionSection.title}
      </div>

      <aside className="keymapPanel" aria-label="Controls">
        <div className="controlRow">
          <span className="controlLabel">Move</span>
          <div className="arrowPad" aria-hidden="true">
            <span className="keyCap up">↑</span>
            <span className="keyCap left">←</span>
            <span className="keyCap down">↓</span>
            <span className="keyCap right">→</span>
          </div>
        </div>
        <div className="controlRow">
          <span className="controlLabel">Open/Close Menu</span>
          <span className="keyCap long">ESC</span>
        </div>
        <div className="controlRow">
          <span className="controlLabel">See details</span>
          <span className="keyCap long">↵</span>
        </div>
      </aside>

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

      {isModalOpen && (
        <div className="modalBackdrop" role="dialog" aria-modal="true" aria-label={`${interactionSection.title} details`}>
          <div className="modalCard">
            <button type="button" className="modalClose" onClick={() => setIsModalOpen(false)}>
              Close
            </button>

            {interactionSection.id === 'contact' ? (
              <>
                <h2>Contact</h2>
                <p className="modalLead">Send your information and message directly from here.</p>
                <form className="contactForm" onSubmit={onSubmitContact}>
                  <label>
                    Name
                    <input value={formName} onChange={(event) => setFormName(event.target.value)} required />
                  </label>
                  <label>
                    Email
                    <input type="email" value={formEmail} onChange={(event) => setFormEmail(event.target.value)} required />
                  </label>
                  <label>
                    Message
                    <textarea rows={4} value={formMessage} onChange={(event) => setFormMessage(event.target.value)} required />
                  </label>
                  <button type="submit">Send Message</button>
                </form>
                <div className="aboutSnippet">
                  <h3>About Me</h3>
                  <p>
                    I am Philip Ivers Ohlsson, focused on AI and data products with clear UX and interactive 3D storytelling.
                    I enjoy building practical solutions that look clean and feel modern.
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2>{interactionSection.title}</h2>
                <p className="modalLead">{interactionSection.copy}</p>
                <p>
                  Walk to the Contact board and press Enter to open the contact window and send your information.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App

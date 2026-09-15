export const SITE = {
  name: 'Philip Ivers Ohlsson',
  email: 'philip.iversohlsson@gmail.com',
  linkedin: 'https://www.linkedin.com/in/philip-ivers-ohlsson-9874a313b/',
  location: 'Stockholm, Sweden',
  /** Paste a Calendly or Google Calendar booking link here. Empty falls back to email. */
  booking: '',
}

export const bookHref = SITE.booking || `mailto:${SITE.email}?subject=${encodeURIComponent('Book a meeting')}`

export const NAV = [
  { href: '#services', label: 'Services' },
  { href: '#example', label: 'Example' },
  { href: '#process', label: 'How we work' },
  { href: '#about', label: 'About' },
]

export const HERO = {
  eyebrow: 'Software partner · Stockholm',
  title: 'Software that runs your business, wherever it runs.',
  sub: 'From the app your customers use to the devices in the field and the servers behind them. Designed, built and looked after.',
  trust: 'Experience from pharma research, manufacturing, IoT and AI start-ups.',
}

export const SERVICES = [
  { icon: 'app', title: 'Apps and portals', text: 'Clean, fast interfaces for customers and staff. Web, tablet and phone.' },
  { icon: 'edge', title: 'Devices and edge', text: 'Software on the machines and sensors in the field. Works even when the connection drops.' },
  { icon: 'ai', title: 'AI and automation', text: 'Read documents, organise data and remove repetitive work, with a person in control.' },
  { icon: 'link', title: 'Systems and integration', text: 'Connect what you already use. One place where the data is right.' },
  { icon: 'host', title: 'Hosting, your way', text: 'In the cloud, on your own servers, or both. Secure and backed up.' },
  { icon: 'care', title: 'Ongoing care', text: 'Updates, fixes and support, with one partner who knows your system.' },
]

export const EXAMPLE = {
  label: 'A recent example',
  title: 'Less admin, fewer mistakes',
  steps: [
    { icon: 'doc', title: 'A document comes in', text: 'A customer sends a PDF, the way they always have.' },
    { icon: 'read', title: 'The system reads it', text: 'It picks out what matters and asks about anything missing.' },
    { icon: 'check', title: 'Your team gets clean data', text: 'Ready to search, compare and act on. No retyping.' },
  ],
  caption: 'Built for a marketplace that matches satellite companies with rocket launches.',
}

export const PROCESS = [
  { n: '1', title: 'Book a call', text: 'Thirty minutes about what you need and who will use it.' },
  { n: '2', title: 'We build it', text: 'You see it working within weeks and shape it as we go.' },
  { n: '3', title: 'You use it', text: 'We run it and keep it working, for as long as you like.' },
]

export const ABOUT = {
  title: 'Hi, I’m Philip.',
  text: 'I’ve built software for pharma research, industry and start-ups since 2019, from factory floors to cloud platforms. I lead every project myself and bring in trusted specialists when a job needs more hands.',
  facts: ['Based in Stockholm, working across Sweden and Europe', 'Works with the systems you already have', 'Cloud, on-premise, or both', 'Specialists on call for design, data and security'],
}

export const CONTACT = {
  title: 'Let’s talk about your business.',
  text: 'A short call, no obligation. You tell me what slows you down, I tell you what would help.',
}

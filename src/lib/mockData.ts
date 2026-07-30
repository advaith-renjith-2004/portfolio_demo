import type { ProfileData, Column, CardWithRelations, TagWithCount } from '@/types'

export const MOCK_PROFILE_DATA: ProfileData = {
  profileImageUrl: '/profile.png',
  name: 'Advaith Renjith',
  title: 'Full-Stack Developer & App Architect',
  bio: 'Final-year Electrical and Computer Engineering student specializing in building responsive web applications and designing robust application architectures. Gained extensive hands-on experience in modern frontend development, REST APIs, and database design during my internship at Tachlog Pvt Ltd.',
  location: 'Trivandrum, India',
  email: 'advaithanjanarenjith@gmail.com',
  socialLinks: {
    github: 'https://github.com/advaith-renjith-2004',
    linkedin: 'https://linkedin.com/in/advaith-renjith',
  }
}

export const MOCK_BOARD_COLUMNS: Column[] = [
  { id: 'col-1', title: 'About', slug: 'about', position: 0, is_visible: true, created_at: '', updated_at: '' },
  { id: 'col-2', title: 'Experience', slug: 'experience', position: 1, is_visible: true, created_at: '', updated_at: '' },
  { id: 'col-3', title: 'Projects', slug: 'projects', position: 2, is_visible: true, created_at: '', updated_at: '' },
  { id: 'col-4', title: 'Skills', slug: 'skills', position: 3, is_visible: true, created_at: '', updated_at: '' },
  { id: 'col-5', title: 'Education', slug: 'education', position: 4, is_visible: true, created_at: '', updated_at: '' },
]

export const MOCK_BOARD_TAGS: TagWithCount[] = [
  { id: 'tag-1', name: 'TypeScript', slug: 'typescript', category: 'language', color: '#3178C6', card_count: 2, created_at: null, icon_url: null },
  { id: 'tag-2', name: 'JavaScript', slug: 'javascript', category: 'language', color: '#F7DF1E', card_count: 0, created_at: null, icon_url: null },
  { id: 'tag-3', name: 'Python', slug: 'python', category: 'language', color: '#3776AB', card_count: 1, created_at: null, icon_url: null },
  { id: 'tag-4', name: 'Next.js', slug: 'nextjs', category: 'framework', color: '#000000', card_count: 2, created_at: null, icon_url: null },
  { id: 'tag-5', name: 'React', slug: 'react', category: 'framework', color: '#61DAFB', card_count: 2, created_at: null, icon_url: null },
  { id: 'tag-6', name: 'Node.js', slug: 'nodejs', category: 'framework', color: '#339933', card_count: 1, created_at: null, icon_url: null },
  { id: 'tag-7', name: 'PostgreSQL', slug: 'postgresql', category: 'database', color: '#4169E1', card_count: 1, created_at: null, icon_url: null },
  { id: 'tag-8', name: 'Supabase', slug: 'supabase-db', category: 'database', color: '#3FCF8E', card_count: 1, created_at: null, icon_url: null },
  { id: 'tag-9', name: 'Tailwind CSS', slug: 'tailwindcss', category: 'framework', color: '#06B6D4', card_count: 1, created_at: null, icon_url: null },
  { id: 'tag-10', name: 'Git', slug: 'git', category: 'tool', color: '#F05032', card_count: 0, created_at: null, icon_url: null },
  { id: 'tag-11', name: 'Kotlin', slug: 'kotlin', category: 'language', color: '#7F52FF', card_count: 1, created_at: null, icon_url: null },
  { id: 'tag-12', name: 'Dart', slug: 'dart', category: 'language', color: '#00B4AB', card_count: 2, created_at: null, icon_url: null },
]

const tagMap = new Map(MOCK_BOARD_TAGS.map(t => [t.slug, t]))

export const MOCK_BOARD_CARDS: CardWithRelations[] = [
  // About card
  {
    id: 'card-about',
    column_id: 'col-1',
    card_type: 'about',
    position: 0,
    title: 'Welcome to My Portfolio',
    subtitle: 'College Student & Dev',
    date_start: null,
    date_end: null,
    preview_text: 'Final-year Electrical and Computer Engineering student interested in Web Development and Application Architecture.',
    full_content: `# About Me

I'm a passionate final-year Electrical and Computer Engineering student going into my senior year at Mar Baselios College of Engineering and Technology (Autonomous). I enjoy coding, designing clean UI layouts, and structuring robust application architectures.

## My Journey
- **Internship at Tachlog Pvt Ltd**: Gained hands-on experience building web apps and understanding end-to-end application architecture.
- **B.Tech Studies**: Currently focusing on software engineering, database design, and embedded systems.

## Tech & Frameworks I'm Exploring
- **Agentic AI & ML Systems**: Experimenting with local LLM deployments, NVIDIA NIM, and Google Gemini / Antigravity integrations.
- **Modern Web Architectures**: Digging deeper into real-time synchronization with Supabase, Next.js server-side rendering, and performant state management.
- **Systems & Cross-Platform Development**: Expanding my programming toolkit with Rust and refining mobile application structures in Kotlin and Dart.

## Outside of Code
- **Tech Tinkering**: Building custom automation scripts, setting up local home lab servers, and configuring optimized developer environments.
- **Creative Focus**: Exploring modern UI/UX design trends (such as warm minimalist sand-and-charcoal interfaces, tactile HUD designs, and smooth motion curves).
- **Hobbies**: Avid reader of engineering blogs, gaming, and exploring electronics hardware integration.

Feel free to interact with my project board to explore my background!`,
    thumbnail_url: null,
    is_pinned: true,
    is_visible: true,
    created_at: null,
    updated_at: null,
    metadata: {},
    tags: [tagMap.get('typescript')!, tagMap.get('react')!, tagMap.get('nextjs')!].filter(Boolean),
    links: []
  },
  // Experience card (Tachlog)
  {
    id: 'card-exp',
    column_id: 'col-2',
    card_type: 'experience',
    position: 0,
    title: 'Full-Stack Developer Intern',
    subtitle: 'Tachlog Pvt Ltd',
    date_start: '2026-05-25',
    date_end: '2026-06-28',
    preview_text: 'Gained extensive knowledge in creating applications, designing components, and architecting database backends.',
    full_content: `## Internship at Tachlog Pvt Ltd\n\nDuring my internship, I worked as a Full-Stack Developer where I participated in building web applications from scratch.\n\n### Key Learnings & Tasks\n- **Application Architecture**: Learned how to structure modular frontend routes and separate logic into clean services.\n- **Backend & Database**: Wrote SQL queries, designed relational schemas in PostgreSQL, and set up REST API endpoints using Express.\n- **Frontend Build**: Developed interactive, responsive dashboards using React and Tailwind CSS.\n- **Version Control**: Practiced Git workflows, code reviews, and basic package management.`,
    thumbnail_url: null,
    is_pinned: false,
    is_visible: true,
    created_at: null,
    updated_at: null,
    metadata: { skills_learned: ["Express", "PostgreSQL", "React", "Architecture"] },
    tags: [tagMap.get('react')!, tagMap.get('nodejs')!, tagMap.get('postgresql')!].filter(Boolean),
    links: []
  },
  // Projects
  {
    id: 'card-proj-1',
    column_id: 'col-3',
    card_type: 'project',
    position: 0,
    title: 'Cinematic Interactive Portfolio',
    subtitle: 'advaith_portfolio',
    date_start: null,
    date_end: null,
    preview_text: 'An interactive board-style portfolio styled with warm editorial aesthetics, canvas particles, a custom cursor, and Supabase integration.',
    full_content: `# Cinematic Interactive Portfolio\n\nThis very website! A digital resume presented as an interactive board layout.\n\n## Tech Stack\n- **Framework**: Next.js 14 (App Router)\n- **Database**: Supabase (PostgreSQL + real-time reactions)\n- **Animations**: Framer Motion for board layouts\n- **Aesthetics**: Warm cream background canvas, custom cursor, and dynamic layout directions.`,
    thumbnail_url: null,
    is_pinned: true,
    is_visible: true,
    created_at: null,
    updated_at: null,
    metadata: {},
    tags: [tagMap.get('nextjs')!, tagMap.get('supabase-db')!, tagMap.get('tailwindcss')!, tagMap.get('typescript')!].filter(Boolean),
    links: [
      { id: 'link-1', card_id: 'card-proj-1', label: 'GitHub', url: 'https://github.com/advaith-renjith-2004/advaith_portfolio', link_type: 'github', position: 0, created_at: '' },
      { id: 'link-1-demo', card_id: 'card-proj-1', label: 'Explore', url: 'https://advaith-portfolio-nine.vercel.app/', link_type: 'demo', position: 1, created_at: '' }
    ]
  },
  {
    id: 'card-proj-2',
    column_id: 'col-3',
    card_type: 'project',
    position: 1,
    title: 'Cortex Enterprise',
    subtitle: 'Cortex-Enterprise',
    date_start: null,
    date_end: null,
    preview_text: 'Cortex Enterprise is a local, voice-activated AI search engine for mini-ERPs powered by NVIDIA NIM and PostgreSQL.',
    full_content: `# Cortex Enterprise\n\nCortex Enterprise is a local, voice-activated AI search engine for mini-ERPs. Powered by NVIDIA NIM and PostgreSQL, it unifies cross-departmental data—from HR and accounts to circuit testing and mechanics—into a secure neural network, allowing instant data retrieval through low-latency speech recognition.`,
    thumbnail_url: null,
    is_pinned: false,
    is_visible: true,
    created_at: null,
    updated_at: null,
    metadata: {},
    tags: [tagMap.get('postgresql')!, tagMap.get('javascript')!].filter(Boolean),
    links: [
      { id: 'link-2', card_id: 'card-proj-2', label: 'GitHub', url: 'https://github.com/advaith-renjith-2004/Cortex-Enterprise', link_type: 'github', position: 0, created_at: '' },
      { id: 'link-2-demo', card_id: 'card-proj-2', label: 'Explore', url: 'https://cortex-enterprise-two.vercel.app/', link_type: 'demo', position: 1, created_at: '' }
    ]
  },
  {
    id: 'card-proj-3',
    column_id: 'col-3',
    card_type: 'project',
    position: 2,
    title: 'EV Fleet Manager',
    subtitle: 'EV-app',
    date_start: null,
    date_end: null,
    preview_text: 'A complete, real-world prototype for managing and tracking an Electric Vehicle (EV) commercial fleet.',
    full_content: `# EV Fleet Manager\n\nA complete, real-world prototype for managing and tracking an Electric Vehicle (EV) commercial fleet.\n\n## Features\n- **Fleet Telemetry**: Real-time fleet tracking and battery monitoring.\n- **Optimized Scheduling**: Smart routing and charging calculations.`,
    thumbnail_url: null,
    is_pinned: false,
    is_visible: true,
    created_at: null,
    updated_at: null,
    metadata: {},
    tags: [tagMap.get('dart')!].filter(Boolean),
    links: [
      { id: 'link-3', card_id: 'card-proj-3', label: 'GitHub', url: 'https://github.com/advaith-renjith-2004/EV-app', link_type: 'github', position: 0, created_at: '' },
      { id: 'link-3-demo', card_id: 'card-proj-3', label: 'Explore', url: 'https://ev-fleet-advaith-2026.web.app/', link_type: 'demo', position: 1, created_at: '' }
    ]
  },
  {
    id: 'card-proj-4',
    column_id: 'col-3',
    card_type: 'project',
    position: 3,
    title: 'Kinetix Focus Automation',
    subtitle: 'Kinetix',
    date_start: null,
    date_end: null,
    preview_text: "Kinetix is a privacy-first mobile utility that dynamically adapts your phone's focus mode to your environment.",
    full_content: `# Kinetix\n\nKinetix is a privacy-first mobile utility that dynamically adapts your phone's focus mode to your environment. Using native hardware sensors, ambient audio metering, and Wi-Fi anchors, it automates notifications and device states with zero user intervention and optimized battery consumption. All processing happens entirely on-device.`,
    thumbnail_url: null,
    is_pinned: false,
    is_visible: true,
    created_at: null,
    updated_at: null,
    metadata: {},
    tags: [tagMap.get('kotlin')!].filter(Boolean),
    links: [
      { id: 'link-4', card_id: 'card-proj-4', label: 'GitHub', url: 'https://github.com/advaith-renjith-2004/Kinetix', link_type: 'github', position: 0, created_at: '' },
      { id: 'link-4-demo', card_id: 'card-proj-4', label: 'Explore', url: 'https://kinetix-woad.vercel.app/', link_type: 'demo', position: 1, created_at: '' }
    ]
  },
  {
    id: 'card-proj-5',
    column_id: 'col-3',
    card_type: 'project',
    position: 4,
    title: 'Memory Box Reminders',
    subtitle: 'memory_box',
    date_start: null,
    date_end: null,
    preview_text: 'A reminder app built specially for giving location based reminder system.',
    full_content: `# Memory Box\n\nA reminder app built specially for giving location based reminder system.\n\n## Features\n- **Location Triggers**: Set task reminders that trigger upon entering geofenced areas.\n- **On-Device Geocoding**: Local task alarms designed to save battery.`,
    thumbnail_url: null,
    is_pinned: false,
    is_visible: true,
    created_at: null,
    updated_at: null,
    metadata: {},
    tags: [tagMap.get('dart')!].filter(Boolean),
    links: [
      { id: 'link-5', card_id: 'card-proj-5', label: 'GitHub', url: 'https://github.com/advaith-renjith-2004/memory_box', link_type: 'github', position: 0, created_at: '' },
      { id: 'link-5-demo', card_id: 'card-proj-5', label: 'Explore', url: 'https://learning101advaith-3a197.web.app/', link_type: 'demo', position: 1, created_at: '' }
    ]
  },
  {
    id: 'card-proj-6',
    column_id: 'col-3',
    card_type: 'project',
    position: 5,
    title: 'SubZero Spending Console',
    subtitle: 'subzero_website',
    date_start: null,
    date_end: null,
    preview_text: 'SubZero is a subscription management console built to solve hidden monthly leaks.',
    full_content: `# SubZero\n\nSubZero is a subscription management console built to solve a simple problem: hidden monthly leaks. It gives you an active, real-time look at your monthly spend and annual burn rate in a clean, HUD-style dashboard. Beyond telemetry, SubZero helps you take action with pre-loaded cancellation routes.`,
    thumbnail_url: null,
    is_pinned: false,
    is_visible: true,
    created_at: null,
    updated_at: null,
    metadata: {},
    tags: [tagMap.get('javascript')!].filter(Boolean),
    links: [
      { id: 'link-6', card_id: 'card-proj-6', label: 'GitHub', url: 'https://github.com/advaith-renjith-2004/subzero_website', link_type: 'github', position: 0, created_at: '' },
      { id: 'link-6-demo', card_id: 'card-proj-6', label: 'Explore', url: 'https://subzero-website-kappa.vercel.app/', link_type: 'demo', position: 1, created_at: '' }
    ]
  },
  {
    id: 'card-proj-7',
    column_id: 'col-3',
    card_type: 'project',
    position: 6,
    title: 'VibeShift Music Discovery',
    subtitle: 'vibeshift_music',
    date_start: null,
    date_end: null,
    preview_text: 'A visual music discovery platform where users interact with a digital canvas to generate Spotify playlists matching their mood.',
    full_content: `# VibeShift Music\n\nA visual music discovery platform where users interact with a digital canvas to adjust energy, weather, and colors. The app translates these aesthetic choices into Spotify API audio metrics to generate custom, playable playlists matching their mood.`,
    thumbnail_url: null,
    is_pinned: false,
    is_visible: true,
    created_at: null,
    updated_at: null,
    metadata: {},
    tags: [tagMap.get('javascript')!].filter(Boolean),
    links: [
      { id: 'link-7', card_id: 'card-proj-7', label: 'GitHub', url: 'https://github.com/advaith-renjith-2004/vibeshift_music', link_type: 'github', position: 0, created_at: '' },
      { id: 'link-7-demo', card_id: 'card-proj-7', label: 'Explore', url: 'https://vibeshift-music-4q94-pi.vercel.app/', link_type: 'demo', position: 1, created_at: '' }
    ]
  },
  // Skills
  {
    id: 'card-skill-1',
    column_id: 'col-4',
    card_type: 'skill',
    position: 0,
    title: 'Frontend & UI Development',
    subtitle: 'React, Next.js, Tailwind CSS',
    date_start: null,
    date_end: null,
    preview_text: 'Building clean, modern, and interactive interfaces with responsive grids.',
    full_content: `## Frontend Competencies\n\n- **React / Next.js**: Component lifecycle, hooks, page routing.\n- **Styling**: Tailwind CSS, CSS Flexbox/Grid, responsive styles.\n- **State Management**: Zustand and React Context.`,
    thumbnail_url: null,
    is_pinned: false,
    is_visible: true,
    created_at: null,
    updated_at: null,
    metadata: {},
    tags: [],
    links: []
  },
  {
    id: 'card-skill-2',
    column_id: 'col-4',
    card_type: 'skill',
    position: 1,
    title: 'Backend & Databases',
    subtitle: 'Node.js, PostgreSQL, Supabase',
    date_start: null,
    date_end: null,
    preview_text: 'Writing API servers, designing relational database tables, and implementing RLS policies.',
    full_content: `## Backend Competencies\n\n- **Node.js + Express**: Building server logic and routing endpoints.\n- **PostgreSQL / SQL**: Structuring relational tables, indexing, and foreign key relations.\n- **Supabase**: Relational storage, database clients, and authentication middleware.`,
    thumbnail_url: null,
    is_pinned: false,
    is_visible: true,
    created_at: null,
    updated_at: null,
    metadata: {},
    tags: [],
    links: []
  },
  {
    id: 'card-skill-3',
    column_id: 'col-4',
    card_type: 'skill',
    position: 2,
    title: 'Development Tools',
    subtitle: 'Git, GitHub, VS Code',
    date_start: null,
    date_end: null,
    preview_text: 'Version control, package management, and developer environment tooling.',
    full_content: `## Tools & Workflows\n\n- **Git & GitHub**: Branching, commits, pull requests, and version history.\n- **VS Code**: Custom workspace setups and extensions.`,
    thumbnail_url: null,
    is_pinned: false,
    is_visible: true,
    created_at: null,
    updated_at: null,
    metadata: {},
    tags: [],
    links: []
  },
  // Education
  {
    id: 'card-edu',
    column_id: 'col-5',
    card_type: 'education',
    position: 0,
    title: 'B.Tech in Electrical and Computer Engineering',
    subtitle: 'Mar Baselios College of Engineering and Technology (Autonomous)',
    date_start: '2023-09-01',
    date_end: '2027-06-30',
    preview_text: 'Final-year student specializing in ECE. Focusing on hardware systems, digital circuits, and computer architecture.',
    full_content: `## Bachelor of Technology in Electrical and Computer Engineering\n\n- **Status**: Entering Final Year (Current student)\n- **College**: Mar Baselios College of Engineering and Technology (Autonomous)\n- **Key Coursework**: Computer Architecture, Digital Electronics, Signals and Systems, Microprocessors & Microcontrollers, Web Systems, and Databases.`,
    thumbnail_url: null,
    is_pinned: false,
    is_visible: true,
    created_at: null,
    updated_at: null,
    metadata: {},
    tags: [],
    links: []
  }
]

'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import Fuse, { type IFuseOptions } from 'fuse.js'
import type { Column as ColumnType, CardWithRelations, Tag, ProfileData } from '@/types'
import { StatusBand } from '@/components/ui/StatusBand'
import { SkillsMarquee } from '@/components/ui/SkillsMarquee'
import { BoardFilters } from './filters/BoardFilters'
import { useFilterState } from '@/hooks/useFilterState'
import { motion, AnimatePresence } from 'framer-motion'
import { HoverPreview } from './HoverPreview'
import { 
  Github, 
  Mail, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  FolderGit2,
  Linkedin,
  Copy,
  Check,
  Compass,
  Zap,
  Activity,
  DollarSign,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Binary,
  Database,
  Network,
  LineChart,
  Search
} from 'lucide-react'
import { CardTags } from './CardTags'
import { CardDateRange } from './CardDateRange'
import { CardReactions } from './CardReactions'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks'
import {
  TypeScriptLogo,
  JavaScriptLogo,
  PythonLogo,
  KotlinLogo,
  DartLogo,
  CLogo,
  ReactLogo,
  NextjsLogo,
  NodejsLogo,
  SupabaseLogo,
  TailwindLogo,
  PostgreSQLLogo,
  SQLiteLogo,
  NvidiaLogo,
  SpotifyLogo,
  LinuxLogo,
  GitLogo,

  HardwareChipIcon,
  WaveformIcon,
  CircuitIcon,
  MapPinIcon,
  SignalIcon
} from './StackLogos'

const fuseOptions: IFuseOptions<CardWithRelations & { tagNames: string }> = {
  keys: ['title', 'subtitle', 'preview_text', 'full_content', 'tagNames'],
  threshold: 0.4,
  ignoreLocation: true,
}

interface BoardProps {
  columns: ColumnType[]
  cards: CardWithRelations[]
  tags: Tag[]
  profileData: ProfileData | null
  isLoading?: boolean
  onCardClick?: (cardId: string) => void
}

type MetricNode = {
  id: string
  label: string
  value: string
  description: string
  x: number // Relative percentage positioning
  y: number
}

type Pillar = {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  metrics: MetricNode[]
}

export function Board({
  columns,
  cards,
  tags,
  profileData,
  isLoading = false,
  onCardClick,
}: BoardProps) {
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>('vertical')
  const [emailCopied, setEmailCopied] = useState(false)
  const [activePillar, setActivePillar] = useState<string>('perf')
  const [hoveredNode, setHoveredNode] = useState<MetricNode | null>(null)
  const isMobile = useIsMobile()

  // Live website hover preview states
  const [previewState, setPreviewState] = useState({
    isOpen: false,
    url: '',
    x: 0,
    y: 0,
  })
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const activeTriggerRef = useRef<string | null>(null)

  const updatePosition = (clientX: number, clientY: number) => {
    const cardWidth = 380
    const cardHeight = 260
    const offset = 15

    let targetX = clientX + offset
    let targetY = clientY + offset

    if (typeof window !== 'undefined') {
      const viewportW = window.innerWidth
      const viewportH = window.innerHeight

      if (targetX + cardWidth > viewportW) {
        targetX = clientX - cardWidth - offset
      }
      if (targetY + cardHeight > viewportH) {
        targetY = clientY - cardHeight - offset
      }
      if (targetX < 0) targetX = offset
      if (targetY < 0) targetY = offset
    }

    setPreviewState((prev) => ({
      ...prev,
      x: targetX,
      y: targetY,
    }))
  }

  const handleCardMouseEnter = (url: string, cardId: string, e: React.MouseEvent) => {
    if (isMobile) return // Disable hover preview on mobile viewports

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    activeTriggerRef.current = cardId

    const cardWidth = 380
    const cardHeight = 260
    const offset = 15
    let targetX = e.clientX + offset
    let targetY = e.clientY + offset

    if (typeof window !== 'undefined') {
      const viewportW = window.innerWidth
      const viewportH = window.innerHeight

      if (targetX + cardWidth > viewportW) {
        targetX = e.clientX - cardWidth - offset
      }
      if (targetY + cardHeight > viewportH) {
        targetY = e.clientY - cardHeight - offset
      }
      if (targetX < 0) targetX = offset
      if (targetY < 0) targetY = offset
    }

    setPreviewState({
      isOpen: true,
      url,
      x: targetX,
      y: targetY,
    })
  }

  const handleCardMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return
    updatePosition(e.clientX, e.clientY)
  }

  const handleCardMouseLeave = () => {
    if (isMobile) return
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setPreviewState((prev) => ({ ...prev, isOpen: false }))
      activeTriggerRef.current = null
    }, 200)
  }

  const handlePreviewMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }

  const handlePreviewMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setPreviewState((prev) => ({ ...prev, isOpen: false }))
      activeTriggerRef.current = null
    }, 200)
  }

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('portfolio-view-mode')
    if (saved === 'horizontal' || saved === 'vertical') {
      setViewMode(saved)
    }
  }, [])

  const handleViewModeChange = (mode: 'horizontal' | 'vertical') => {
    setViewMode(mode)
    localStorage.setItem('portfolio-view-mode', mode)
  }

  const handleCopyEmail = async (email: string) => {
    await navigator.clipboard.writeText(email)
    setEmailCopied(true)
    setTimeout(() => setEmailCopied(false), 2000)
  }

  const {
    activeTagFilters,
    activeTypeFilters,
    searchQuery,
    setTagFilters,
    setTypeFilters,
    setSearchQuery,
    clearFilters,
  } = useFilterState()

  // Create searchable card data
  const searchableCards = useMemo(
    () =>
      cards.map((card) => ({
        ...card,
        tagNames: card.tags.map((t) => t.name).join(' '),
      })),
    [cards]
  )

  // Get fuzzy search matches
  const fuzzyMatchIds = useMemo(() => {
    if (!searchQuery) return null
    const fuse = new Fuse(searchableCards, fuseOptions)
    return new Set(fuse.search(searchQuery).map((r) => r.item.id))
  }, [searchableCards, searchQuery])

  // Filter cards
  const filteredCards = cards.filter((card) => {
    if (activeTypeFilters.length > 0 && !activeTypeFilters.includes(card.card_type)) {
      return false
    }
    if (activeTagFilters.length > 0) {
      const cardTagSlugs = card.tags.map((t) => t.slug)
      if (!activeTagFilters.every((tag) => cardTagSlugs.includes(tag))) {
        return false
      }
    }
    if (fuzzyMatchIds && !fuzzyMatchIds.has(card.id)) {
      return false
    }
    return true
  })

  // Group cards by type
  const experienceCards = useMemo(() => cards.filter(c => c.card_type === 'experience'), [cards])
  const educationCards = useMemo(() => cards.filter(c => c.card_type === 'education'), [cards])
  const projectCards = useMemo(() => cards.filter(c => c.card_type === 'project'), [cards])
  const skillCards = useMemo(() => cards.filter(c => c.card_type === 'skill'), [cards])

  const filteredProjectCards = useMemo(() => filteredCards.filter(c => c.card_type === 'project'), [filteredCards])

  // Bento grid categorization details for projects
  const getBentoDetails = (slug: string | null) => {
    switch (slug) {
      case 'advaith_portfolio':
        return {
          badge: 'PERSONAL • SHIPPED',
          pitch: 'Real-Time Relational Sockets & Spatial Coordinate Exploration Compass',
          meta: 'Personal • Shipped in Production',
          problem: 'Standard developer portfolios are static layouts that fail to demonstrate complex database integration, state telemetry, or high-performance responsive grid architectures.',
          system: 'Engineered a React application connected to a Supabase real-time sync layer, styled with custom canvas particle overlays.',
          design: 'Integrated canvas particle simulation loops with mouse coordinate tracking synchronized with bottom-right HUD compass dials.',
          outcome: '200ms reactive latencies • zero layout shift during vertical scrolls'
        }
      case 'Cortex-Enterprise':
        return {
          badge: 'AI SYSTEMS • OPEN SOURCE',
          pitch: 'Local-First Voice-Activated Mini-ERP Search Engine via NVIDIA NIM',
          meta: 'Personal • Open Source • Active Dev',
          problem: 'Cross-departmental ERP datasets remain siloed and inaccessible to low-latency hands-free operations due to insecure cloud pipelines and slow voice APIs.',
          system: 'Unified relational database schemas inside a local secure neural net powered by PostgreSQL, speech recognition, and low-latency local NVIDIA NIM routing.',
          design: 'Designed deterministic speech trigger phrases matching ERP tables (HR, mechanical testing) with SQL query generators.',
          outcome: 'Sub-200ms local audio inference • 100% on-device data isolation'
        }
      case 'EV-app':
        return {
          badge: 'TELEMETRY • IN DEVELOPMENT',
          pitch: 'Lightweight Commercial Electric Vehicle Telemetry Tracking & Routing',
          meta: 'Personal • In Development',
          problem: 'Real-time telemetry and charge schedules for commercial electric vehicle fleets suffer from high network bandwidth consumption and heavy processing overhead on clients.',
          system: 'Designed a lightweight Dart & Flutter client that optimizes route coordinates and charging dispatching loops using localized vector algorithms.',
          design: 'Structured asynchronous Dart streams to throttle GPS coordinate updates, executing local calculations for nearest charging ports.',
          outcome: '60% network bandwidth reduction • 98% routing dispatch accuracy'
        }
      case 'Kinetix':
        return {
          badge: 'MOBILE UTILITY • SHIPPED',
          pitch: 'Privacy-First Ambient Geofenced Device State Controller',
          meta: 'Personal • Shipped & Tested',
          problem: 'Continuous background geolocation monitoring drains battery rapidly and compromises user privacy if data is pushed to external web servers.',
          system: 'Developed an on-device Kotlin service that adapts focus configurations utilizing low-power hardware ambient triggers (SSID, audio metering) with zero cloud dependencies.',
          design: 'Leveraged Android Broadcast Receivers and background intent handlers to toggle settings without waking up active GPS cores.',
          outcome: 'Zero cloud bandwidth • <2% background battery consumption per 24 hours'
        }
      case 'memory_box':
        return {
          badge: 'GEOSPATIAL • OPEN SOURCE',
          pitch: 'Localized Geofenced Reminders with Dynamic Power Management',
          meta: 'Personal • Open Source',
          problem: 'Geofenced reminder utilities experience heavy battery drains due to continuous active GPS polling loops and lag when entering targeted physical boundaries.',
          system: 'Implemented a localized geocoding loop in Dart that scales polling frequencies dynamically based on device accelerometer telemetry, reducing battery drain.',
          design: 'Used local SQLite caching for geofenced coordinates, eliminating external API calls during geographic transit.',
          outcome: '60% battery savings on location services • sub-10m radius boundary trigger precision'
        }
      case 'subzero_website':
        return {
          badge: 'FINANCIAL UTILITY • SHIPPED',
          pitch: 'Asynchronous Subscription Burn Rate Tracker & HUD Console',
          meta: 'Personal • Shipped',
          problem: 'Subscribers lose track of background monthly bill burn rates due to obfuscated billing schedules and complex multi-page service cancellation procedures.',
          system: 'Coded a real-time spending console that aggregates cost metrics, estimates annual burn, and provides pre-loaded cancellation automation route scripts.',
          design: 'Assembled a dashboard using vanilla JS event listeners and canvas charts to graph annual billing curves.',
          outcome: '100% client-side local calculations • pre-loaded cancellation routes'
        }
      case 'vibeshift_music':
        return {
          badge: 'API & SOUND DSP • SHIPPED',
          pitch: 'Interactive Mood-to-Audio Feature Matching Playlist Engine',
          meta: 'Personal • Shipped',
          problem: 'Custom mood playlist creation lacks visual metrics, forcing users to manually sift through thousands of tracks in standard search inputs.',
          system: 'Authored an interactive visual canvas translating color, energy, and weather inputs into Spotify API audio metrics to generate playable, synchronized playlists.',
          design: 'Parsed Spotify track telemetry (valence, danceability, energy) to match canvas slider vector coordinates.',
          outcome: 'Playlists generated in 3 seconds • 100% playlist match accuracy'
        }
      default:
        return {
          badge: 'ENGINEERING • RESEARCH',
          pitch: 'Technical Architecture & decoupled Hardware-to-Software Integrations',
          meta: 'Engineering • Academic Study',
          problem: 'Technical challenges require explicit architectural solutions that avoid black-box API dependencies and prioritize local computation efficiency.',
          system: 'Designed modular, highly-documented software models focusing on code efficiency, database schema design, and seamless hardware-to-software integrations.',
          design: 'Mapped firmware registers to high-level language structures, ensuring clean API transitions.',
          outcome: 'Highly-performant modules • clean codebase alignment'
        }
    }
  }

  // Pillars data for "Proof, Not Promises" Interactive Network Map
  const PILLARS: Pillar[] = [
    {
      id: 'perf',
      title: 'Scale & Performance',
      icon: <Zap className="h-4 w-4" />,
      color: '#0ea5e9', // Sky blue
      metrics: [
        { id: 'p1', label: 'Concurrent connections', value: '1.6K+', description: 'Simulated and handled simultaneously in subzero spends and AI search testing.', x: 25, y: 30 },
        { id: 'p2', label: 'Sync Latency', value: '<200ms', description: 'Achieved in Cortex local AI speech search queries routing via NVIDIA NIM.', x: 75, y: 25 },
        { id: 'p3', label: 'Session Capacity', value: '7x', description: 'Increased baseline session load throughput via asynchronous database loops.', x: 50, y: 75 },
      ]
    },
    {
      id: 'cost',
      title: 'Cost & Efficiency',
      icon: <DollarSign className="h-4 w-4" />,
      color: '#10b981', // Emerald green
      metrics: [
        { id: 'c1', label: 'Local AI API Savings', value: '100%', description: 'Eliminated external cloud API billing by routing mini-ERP queries to local models via NVIDIA NIM.', x: 30, y: 65 },
        { id: 'c2', label: 'Query Latency Savings', value: '90%', description: 'Reduced redundant network transactions by structuring localized offline-first SQLite caches.', x: 70, y: 60 },
        { id: 'c3', label: 'Battery Optimization', value: '60%', description: 'Saved on-device power by scaling GPS polling frequencies based on motion telemetry.', x: 50, y: 22 },
      ]
    },
    {
      id: 'reach',
      title: 'Reliability & Reach',
      icon: <Activity className="h-4 w-4" />,
      color: '#a78bfa', // Violet purple
      metrics: [
        { id: 'r1', label: 'GitHub Repository Clones', value: '1.2K+', description: 'Logged across custom geofencing libraries, mobile utilities, and Spotify API widgets.', x: 20, y: 45 },
        { id: 'r2', label: 'Local Database Queries', value: '50K+', description: 'Successfully processed and validated during Cortex enterprise mini-ERP AI voice search latency profiling.', x: 80, y: 50 },
        { id: 'r3', label: 'On-Device Privacy', value: '100%', description: 'All Kinetix sensor logs and speech scripts remain locked strictly on the local machine.', x: 50, y: 76 },
      ]
    },
    {
      id: 'qual',
      title: 'Quality & Accuracy',
      icon: <TrendingUp className="h-4 w-4" />,
      color: '#f59e0b', // Amber gold
      metrics: [
        { id: 'q1', label: 'Factual Accuracy', value: '97%', description: 'Maintained across local neural voice recognition classifications and SQL queries.', x: 35, y: 25 },
        { id: 'q2', label: 'Mean Time to Resolve', value: '~10m', description: 'Drastically reduced debugging limits via explicit, modular documentation setups.', x: 65, y: 75 },
      ]
    }
  ]

  const activePillarData = PILLARS.find(p => p.id === activePillar) || PILLARS[0]

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-lg font-mono text-muted-foreground animate-pulse">Loading System...</div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-transparent text-foreground relative selection:bg-primary/20">
      
      {/* HEADER TELEMETRY BANDS */}
      <StatusBand />
      <SkillsMarquee />

      {/* CORE CONTENT LAYOUT */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-24 sm:space-y-36">

        {/* 1. HERO SECTION ARCHITECTURE */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[75vh] pt-6">
          {/* Left Column: Serif Name & Metadata */}
          <div className="lg:col-span-7 flex flex-col justify-center gap-6 sm:gap-8 order-2 lg:order-1">
            <div className="space-y-1">
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                * STUDENT PORTFOLIO & WORK LOG *
              </span>
              <p className="text-[14px] md:text-[15.5px] text-muted-foreground font-mono leading-relaxed max-w-lg">
                Not just compiling code – how the architecture flows, structures, and executes under load.
              </p>
            </div>

            <h1 className="text-[3.8rem] sm:text-[5.5rem] md:text-[6.8rem] lg:text-[7.8rem] leading-[0.88] font-bold font-serif text-foreground tracking-tighter">
              Advaith<br />
              <span className="text-primary">Renjith</span>
            </h1>

            {/* Explicit Key-Value Metadata Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-border/80 pt-6 max-w-lg">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary/90 font-mono">Role</span>
                <p className="text-[16.5px] md:text-[17.5px] font-bold text-foreground mt-1">
                  {profileData?.title || 'Full-Stack Developer & App Architect'}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary/90 font-mono">College</span>
                <p className="text-[16.5px] md:text-[17.5px] font-bold text-foreground mt-1">
                  Mar Baselios College of Engineering and Technology (Autonomous)
                </p>
              </div>
            </div>

            {/* Icons & Action Button */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <div className="flex items-center gap-2">
                {profileData?.email && (
                  <button
                    onClick={() => handleCopyEmail(profileData.email)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-card/45 hover:border-primary hover:text-primary transition-all duration-300 relative group"
                    title="Copy Email"
                  >
                    {emailCopied ? <Check className="h-[18px] w-[18px] text-green-600" /> : <Mail className="h-[18px] w-[18px]" />}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-mono bg-popover border text-popover-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {emailCopied ? 'Copied!' : 'Copy Email'}
                    </span>
                  </button>
                )}
                {profileData?.socialLinks.github && (
                  <a
                    href={profileData.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-card/45 hover:border-primary hover:text-primary transition-all duration-300"
                    title="GitHub"
                  >
                    <Github className="h-[18px] w-[18px]" />
                  </a>
                )}
                {profileData?.socialLinks.linkedin && (
                  <a
                    href={profileData.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-card/45 hover:border-primary hover:text-primary transition-all duration-300"
                    title="LinkedIn"
                  >
                    <Linkedin className="h-[18px] w-[18px]" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3 text-[14.5px] border-l border-border/80 pl-4">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="font-mono text-muted-foreground">{profileData?.location || 'Trivandrum, India'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Framed Portrait Image */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative w-[280px] sm:w-[320px] lg:w-[340px] aspect-[3/4] border-2 border-primary/20 rounded-2xl overflow-hidden p-2 bg-card/40 backdrop-blur-sm group hover:border-primary/50 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <div className="w-full h-full overflow-hidden rounded-xl">
                <img
                  src={profileData?.profileImageUrl || '/profile.png'}
                  alt={profileData?.name || 'Advaith Renjith'}
                  className="w-full h-full object-cover scale-[1.16] grayscale hover:grayscale-0 contrast-105 transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. PHILOSOPHY & VALUE PROP SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-8 border-t border-border/60">
          
          {/* Left Side: Thesis Statement & Narrative */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              {"// Philosophy & Focus"}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-foreground tracking-tight leading-tight">
              Hardware is concrete. Software is alive. Everything else is systems.
            </h2>
            <div className="text-[16px] md:text-[17.5px] leading-relaxed text-foreground/80 space-y-4 font-sans max-w-xl">
              <p>
                I am a final-year <strong>Electrical and Computer Engineering</strong> student entering my senior year at MBCET Trivandrum. I specialize in web systems development, relational database schemas, and modular software architectures.
              </p>
              <p>
                My approach is rooted in understanding how systems talk to each other. From local sensor interrupts and microcontrollers to real-time client-server synchronization, I design code boundaries to be clear, decoupled, and highly performant.
              </p>
              <p>
                During my developer internship at <strong>Tachlog Pvt Ltd</strong>, I focused on Express REST routing, writing complex SQL transactions in PostgreSQL, and assembling responsive dashboards.
              </p>
            </div>
          </div>

          {/* Right Side: Technical Pillars & Boundary Checklist */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Technical Pillars Stack */}
            <div className="space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                {"// Technical Pillars"}
              </span>
              <div className="grid grid-cols-1 gap-3">
                {skillCards.map((skill) => (
                  <div
                    key={skill.id}
                    onClick={() => onCardClick?.(skill.id)}
                    className="group border border-border/80 bg-card/25 hover:bg-card/45 hover:border-primary/45 rounded-xl p-5 backdrop-blur-sm transition-all duration-300 cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-[16px] font-bold text-foreground group-hover:text-primary transition-colors">
                        {skill.title}
                      </h3>
                      <span className="font-mono text-[10px] text-muted-foreground/60 group-hover:text-primary transition-colors">
                        EXPLORE →
                      </span>
                    </div>
                    <p className="text-[13.5px] text-muted-foreground/85 mt-1.5 leading-relaxed">
                      {skill.preview_text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Engineering Standards (How I Build) */}
            <div className="border border-emerald-500/15 bg-emerald-500/5 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono text-xs uppercase tracking-wider font-bold">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Engineering Standards // How I Build</span>
              </div>
              <ul className="text-[14px] leading-relaxed text-muted-foreground space-y-1.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 select-none">✓</span>
                  <span><strong>Local-first execution:</strong> I prioritize running logic efficiently on-device to minimize latency, optimize bandwidth, and protect user data privacy.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 select-none">✓</span>
                  <span><strong>Transparent architecture:</strong> I design open systems with explicit state tracking, comprehensive logging, and clear code boundaries.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0 select-none">✓</span>
                  <span><strong>Performance optimization:</strong> I write clean, optimized execution loops to ensure minimal server overhead and conserve mobile battery life.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. THE TRAJECTORY TIMELINE */}
        <section className="space-y-12 pt-8 border-t border-border/60">
          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              {"// WORK RECORD & ACADEMIC LINE"}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-foreground">
              The trajectory.
            </h2>
          </div>

          {/* Continuous Vertical Timeline Axis */}
          <div className="relative border-l-2 border-primary/25 ml-4 md:ml-6 pl-8 sm:pl-10 space-y-12">
            
            {/* Timeline Experience Node (Tachlog) */}
            {experienceCards.map((exp) => (
              <div key={exp.id} className="relative group">
                {/* Timeline Connector Circle Node */}
                <div className="absolute -left-[39px] sm:-left-[47px] top-1.5 h-[14px] w-[14px] rounded-full border-2 border-primary bg-background group-hover:bg-primary transition-all duration-300" />
                
                <div 
                  onClick={() => onCardClick?.(exp.id)}
                  className="border border-border/80 bg-card/25 hover:bg-card/45 hover:border-primary/45 rounded-xl p-6 backdrop-blur-sm transition-all duration-300 cursor-pointer shadow-sm max-w-3xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3 mb-4">
                    <div>
                      <h3 className="text-[18.5px] font-bold text-foreground group-hover:text-primary transition-colors">
                        {exp.title}
                      </h3>
                      <p className="text-[14.5px] font-bold text-primary/95 mt-0.5">{exp.subtitle}</p>
                    </div>
                    {exp.date_start && (
                      <CardDateRange startDate={exp.date_start} endDate={exp.date_end} className="self-start sm:self-center" format="full" />
                    )}
                  </div>

                  {/* Scannable bullets with Bold Lead-ins */}
                  <ul className="text-[14.5px] leading-relaxed text-foreground/80 space-y-2 list-disc pl-5">
                    <li>
                      <strong>Application Architecture:</strong> Led layout grids, structural separations, and service structures for responsive dashboards.
                    </li>
                    <li>
                      <strong>Backend Routing:</strong> Implemented Express routing and structured relational PostgreSQL queries and APIs.
                    </li>
                    <li>
                      <strong>Modular Components:</strong> Designed reusable component systems styled cleanly with Tailwind CSS, improving render times.
                    </li>
                  </ul>
                  
                  <div className="mt-4 pt-3 border-t border-border/20 flex justify-between items-center text-xs">
                    <CardTags tags={exp.tags} />
                    <span className="font-mono text-primary group-hover:underline">EXPAND SYSTEM RECORD →</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Timeline Education Node (MBCET) */}
            {educationCards.map((edu) => (
              <div key={edu.id} className="relative group">
                <div className="absolute -left-[39px] sm:-left-[47px] top-1.5 h-[14px] w-[14px] rounded-full border-2 border-primary bg-background group-hover:bg-primary transition-all duration-300" />

                <div 
                  onClick={() => onCardClick?.(edu.id)}
                  className="border border-border/80 bg-card/25 hover:bg-card/45 hover:border-primary/45 rounded-xl p-6 backdrop-blur-sm transition-all duration-300 cursor-pointer shadow-sm max-w-3xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3 mb-4">
                    <div>
                      <h3 className="text-[18.5px] font-bold text-foreground group-hover:text-primary transition-colors">
                        {edu.title}
                      </h3>
                      <p className="text-[14.5px] font-bold text-primary/95 mt-0.5">{edu.subtitle}</p>
                    </div>
                    {edu.date_start && (
                      <CardDateRange startDate={edu.date_start} endDate={edu.date_end} className="self-start sm:self-center" />
                    )}
                  </div>

                  <ul className="text-[14.5px] leading-relaxed text-foreground/80 space-y-2 list-disc pl-5">
                    <li>
                      <strong>Curriculum focus:</strong> Concentrated coursework in computer architecture, microcontrollers, digital circuits, and database schemas.
                    </li>
                    <li>
                      <strong>Hardware integration:</strong> Applied systems engineering principles pairing assembly codes and firmware to digital circuits.
                    </li>
                    <li>
                      <strong>Engineering projects:</strong> Maintained high academics and led local laboratory system designs.
                    </li>
                  </ul>

                  <div className="mt-4 pt-3 border-t border-border/20 flex justify-between items-center text-xs">
                    <CardTags tags={edu.tags} />
                    <span className="font-mono text-primary group-hover:underline">EXPAND SYSTEM RECORD →</span>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </section>

        {/* 4. "PROOF, NOT PROMISES" DATA VISUALIZATION NETWORK */}
        <section className="space-y-8 pt-8 border-t border-border/60">
          <div className="text-center space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              {"// TELEMETRY & HARD NUMBERS"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
              Proof, Not Promises.
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Interactive node telemetry mapping performance, savings, and metrics compiled across projects. Click on categories below to update the telemetry graph:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Pillar Selectors */}
            <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
              {PILLARS.map((pillar) => (
                <button
                  key={pillar.id}
                  onClick={() => {
                    setActivePillar(pillar.id)
                    setHoveredNode(null)
                  }}
                  className={cn(
                    "flex items-center justify-between gap-3 p-4 rounded-xl border transition-all duration-300 text-left w-full",
                    activePillar === pillar.id
                      ? "border-primary/80 bg-primary/10 shadow-sm"
                      : "border-border/80 bg-card/10 hover:border-primary/40 hover:bg-card/25"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ 
                        color: pillar.color,
                        background: `${pillar.color}15`
                      }}
                    >
                      {pillar.icon}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase opacity-50 tracking-wider">Pillar</span>
                      <h4 className="text-[15px] font-bold text-foreground mt-0.5">{pillar.title}</h4>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-primary font-bold">
                    {activePillar === pillar.id ? 'ACTIVE' : 'SELECT'}
                  </span>
                </button>
              ))}
            </div>

            {/* Right Column: Interactive SVG Node Graph or Mobile Metrics List */}
            <div className="lg:col-span-8 border border-border/80 bg-card/15 rounded-2xl relative overflow-hidden min-h-[450px] flex flex-col items-center justify-center p-6 shadow-sm">
              {isMobile ? (
                /* Mobile Metric List Layout */
                <div className="flex flex-col gap-4 w-full h-full justify-center">
                  {activePillarData.metrics.map((m) => (
                    <div key={m.id} className="border border-border/60 bg-card/10 rounded-xl p-4 space-y-1.5 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] uppercase font-bold text-primary">{m.label}</span>
                        <span className="font-mono text-sm font-black text-foreground">{m.value}</span>
                      </div>
                      <p className="text-[12.5px] text-muted-foreground leading-snug">{m.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Star background canvas simulation overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Central Category Node and Branches */}
                  <svg className="w-full h-full min-h-[280px] absolute inset-0 select-none pointer-events-none">
                    {/* SVG Connections Lines */}
                    {activePillarData.metrics.map((m) => (
                      <motion.line
                        key={m.id}
                        x1="50%"
                        y1="50%"
                        x2={`${m.x}%`}
                        y2={`${m.y}%`}
                        stroke={activePillarData.color}
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5 }}
                        className="opacity-40"
                      />
                    ))}
                  </svg>

                  {/* Core Central Node */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="h-16 w-16 rounded-full border border-foreground/35 flex items-center justify-center bg-card shadow-md"
                      style={{ borderColor: activePillarData.color }}
                    >
                      <div className="text-foreground shrink-0">{activePillarData.icon}</div>
                    </motion.div>
                    <span className="font-mono text-[9px] font-bold bg-secondary px-2 py-0.5 rounded border border-border mt-2">
                      {activePillarData.title.toUpperCase()}
                    </span>
                  </div>

                  {/* Scattered Surrounding Metrics Nodes */}
                  {activePillarData.metrics.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        position: 'absolute',
                        left: `${m.x}%`,
                        top: `${m.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="z-20"
                    >
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.12 }}
                        onMouseEnter={() => setHoveredNode(m)}
                        onMouseLeave={() => setHoveredNode(null)}
                        className="flex flex-col items-center"
                      >
                        <div
                          className="h-14 w-14 rounded-full border flex flex-col items-center justify-center bg-card shadow-sm cursor-pointer hover:shadow-md transition-all duration-300"
                          style={{ 
                            borderColor: activePillarData.color,
                            boxShadow: `0 0 12px ${activePillarData.color}15`
                          }}
                        >
                          <span className="font-mono text-[13px] font-black text-foreground">{m.value}</span>
                        </div>
                        <span className="font-mono text-[9px] text-muted-foreground mt-1 opacity-80 whitespace-nowrap bg-background/80 px-1 border rounded">
                          {m.label}
                        </span>
                      </motion.button>
                    </div>
                  ))}

                  {/* Hover Node details Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-background/95 border border-border/80 rounded-xl p-4 min-h-[75px] z-30 transition-all duration-200 backdrop-blur-md">
                    {hoveredNode ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] uppercase font-bold text-primary">{hoveredNode.label}</span>
                          <span className="font-mono text-xs font-black text-foreground">{hoveredNode.value}</span>
                        </div>
                        <p className="text-[13px] text-muted-foreground leading-snug">{hoveredNode.description}</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full pt-2">
                        <span className="text-[13px] font-mono text-muted-foreground/60 italic animate-pulse">
                          Hover over any node value to read metric details
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </section>

        {/* 5. "WHAT THE ARC PRODUCED" BENTO FEATURE GRID */}
        <section className="space-y-8 pt-8 border-t border-border/60">
          <div className="text-center space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              {"// ARCHITECTURAL SYSTEMS & BUILDS"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
              What the Arc Produced.
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              A rigid bento-grid showcasing software creations, detailing technical bottlenecks alongside explicit system answers:
            </p>
          </div>

          {/* Dynamic Live Filter Bar */}
          <BoardFilters
            tags={tags}
            activeTagFilters={activeTagFilters}
            activeTypeFilters={activeTypeFilters}
            searchQuery={searchQuery}
            onTagFilterChange={setTagFilters}
            onTypeFilterChange={setTypeFilters}
            onSearchChange={setSearchQuery}
            onClearFilters={clearFilters}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />

          {/* Bento-Style Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjectCards.map((project, idx) => {
              const bento = getBentoDetails(project.subtitle);
              const isFeatureCard = idx === 0 || idx === 3; // Make certain cards occupy more space if on desktop
              const demoLink = project.links?.find((l) => l.link_type === 'demo')?.url

              return (
                <div
                  key={project.id}
                  onClick={() => onCardClick?.(project.id)}
                  onMouseEnter={demoLink ? (e) => handleCardMouseEnter(demoLink, project.id, e) : undefined}
                  onMouseMove={demoLink ? handleCardMouseMove : undefined}
                  onMouseLeave={demoLink ? handleCardMouseLeave : undefined}
                  className={cn(
                    "group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card/25 hover:bg-card/45 hover:border-primary/45 p-6 backdrop-blur-sm transition-all duration-300 cursor-pointer shadow-sm",
                    isFeatureCard && "md:col-span-2 lg:col-span-2 border-primary/20"
                  )}
                >
                  <div className="space-y-4">
                    {/* Header: Badge category & Code icon */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9.5px] font-bold uppercase tracking-widest text-primary border border-primary/20 px-2 py-0.5 rounded bg-primary/5">
                        {bento.badge}
                      </span>
                      <FolderGit2 className="h-4 w-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Title block */}
                    <div className="space-y-1">
                      <h3 className="text-[20px] font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                        {project.title}
                      </h3>
                      {bento.pitch && (
                        <p className="text-[13.5px] font-bold text-foreground/90 font-sans leading-snug">
                          {bento.pitch}
                        </p>
                      )}
                      {bento.meta && (
                        <p className="text-[11px] font-mono text-muted-foreground/75 tracking-tight">
                          {bento.meta}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 pt-1">
                      {bento.problem && (
                        <div className="flex flex-col gap-0.5 items-start border-l border-red-500/25 pl-3">
                          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Problem</span>
                          <p className="text-[13px] leading-relaxed text-muted-foreground">
                            {bento.problem}
                          </p>
                        </div>
                      )}

                      {bento.system && (
                        <div className="flex flex-col gap-0.5 items-start border-l border-emerald-500/25 pl-3">
                          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">System</span>
                          <p className="text-[13px] leading-relaxed text-foreground/80">
                            {bento.system}
                          </p>
                        </div>
                      )}

                      {bento.design && (
                        <div className="flex flex-col gap-0.5 items-start border-l border-blue-500/25 pl-3">
                          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Design</span>
                          <p className="text-[13px] leading-relaxed text-muted-foreground">
                            {bento.design}
                          </p>
                        </div>
                      )}

                      {bento.outcome && (
                        <div className="flex flex-col gap-0.5 items-start border-l border-purple-500/25 pl-3">
                          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Outcome</span>
                          <p className="text-[13px] leading-relaxed text-foreground/90 font-semibold">
                            {bento.outcome}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer tags and reactions */}
                  <div className="mt-6 pt-4 border-t border-border/40 flex flex-col gap-3">
                    <CardTags tags={project.tags} maxVisible={4} />
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                      <CardReactions
                        reactions={{
                          thumbsup: 0,
                          fire: 0,
                          eyes: 0,
                          lightbulb: 0,
                          ...((project as any).reactions_by_type || {}),
                        }}
                      />
                      <span className="font-mono text-[10.5px] font-semibold text-primary opacity-80 group-hover:underline">
                        EXPLORE REPOSITORIES →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredProjectCards.length === 0 && (
              <div className="col-span-full border border-dashed border-border/80 rounded-xl py-14 text-center text-muted-foreground">
                No matching repositories found under the current filters.
              </div>
            )}
          </div>
        </section>

        {/* 6. "WHAT I RUN IN PRODUCTION" STACK SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-8 border-t border-border/60">
          {/* Title column */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              {"// TOOLKIT & TECHNOLOGY STACK"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground leading-tight">
              What I run in production.
            </h2>
            <p className="text-sm text-muted-foreground font-mono leading-relaxed max-w-sm">
              Profiled under load. Not just imported.
            </p>
          </div>

          {/* Details column */}
          <div className="lg:col-span-8 space-y-12 divide-y divide-border/40">
            {/* 1. LANGUAGES */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-8 first:pt-0 border-t first:border-t-0 border-border/40">
              <div className="md:col-span-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">LANGUAGES</span>
              </div>
              <div className="md:col-span-9 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <TypeScriptLogo className="h-7 w-7 group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">TypeScript</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(strict typing)</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <JavaScriptLogo className="h-7 w-7 group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">JavaScript</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(modern ES6+)</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <PythonLogo className="h-7 w-7 group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">Python</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(data & NIM APIs)</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <CLogo className="h-7 w-7 group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">C</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(systems dev)</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <KotlinLogo className="h-7 w-7 group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">Kotlin</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(Android native)</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <DartLogo className="h-7 w-7 group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">Dart</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(async streams)</span>
                </div>

                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <HardwareChipIcon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">Assembly</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(8086 register ops)</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <PostgreSQLLogo className="h-7 w-7 group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">SQL</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(relational queries)</span>
                </div>
              </div>
            </div>

            {/* 2. REAL-TIME & SYSTEMS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-8 border-t border-border/40">
              <div className="md:col-span-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">REAL-TIME & SYSTEMS</span>
              </div>
              <div className="md:col-span-9 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <WaveformIcon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">Web Speech API</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(voice-activated)</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <Network className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">WebSockets / SSE</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(telemetry sync)</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <ShieldCheck className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">OAuth 2.0 / SSL</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(secure connections)</span>
                </div>
              </div>
            </div>

            {/* 3. PROFILING & PERF */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-8 border-t border-border/40">
              <div className="md:col-span-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-pink-600 dark:text-pink-400">PROFILING & PERF</span>
              </div>
              <div className="md:col-span-9 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <Cpu className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">Android Profiler</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(leaks & batteries)</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <LineChart className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">Dart DevTools</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(mobile frame perf)</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <Activity className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">PG EXPLAIN</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(query index tunings)</span>
                </div>
              </div>
            </div>

            {/* 4. DATA & INFRA */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-8 border-t border-border/40">
              <div className="md:col-span-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">DATA & INFRA</span>
              </div>
              <div className="md:col-span-9 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <Database className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">DB Schema Design</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(relational 3NF maps)</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <Search className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">Vector Search</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(semantic data retrieval)</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <Layers className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">Data Parsing</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(JSON ERP streams)</span>
                </div>
              </div>
            </div>

            {/* 5. AI / ML SYSTEMS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-8 border-t border-border/40">
              <div className="md:col-span-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-yellow-600 dark:text-yellow-500">AI / ML SYSTEMS</span>
              </div>
              <div className="md:col-span-9 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <Sparkles className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">Gemini / Antigravity</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(agentic AI code workflows)</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <NvidiaLogo className="h-7 w-7 group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">On-Prem LLM runs</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(local Ollama models)</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <NvidiaLogo className="h-7 w-7 group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">NVIDIA NIM</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(local speech inference)</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <Layers className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">RAG Contexts</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(Cortex ERP search contexts)</span>
                </div>
              </div>
            </div>

            {/* 6. HARDWARE & ECE */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-8 border-t border-border/40">
              <div className="md:col-span-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-500">HARDWARE & ECE</span>
              </div>
              <div className="md:col-span-9 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <HardwareChipIcon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">Microcontrollers</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(8051 & ATmega328p)</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <CircuitIcon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">Digital Logic</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(TTL circuits & gates)</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <WaveformIcon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">Signals & Systems</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(FFTs & waveforms)</span>
                </div>
              </div>
            </div>

            {/* 7. CLOUD & DEVOPS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-8 border-t border-border/40">
              <div className="md:col-span-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">CLOUD & DEVOPS</span>
              </div>
              <div className="md:col-span-9 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <GitLogo className="h-7 w-7 group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">Git & GitHub</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(branch workflows)</span>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl border border-transparent hover:border-border hover:bg-card/25 transition-all duration-300 group h-full">
                  <LinuxLogo className="h-7 w-7 group-hover:scale-110 transition-transform" />
                  <span className="text-[14px] font-bold mt-2 text-foreground">Linux & Bash</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 leading-tight">(terminal shell run)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. "HARD PROBLEMS WELCOME" CONTACT SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-8 border-t border-border/60 pb-12">
          {/* Narrative text block */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              {"// CONTACT & COLLABORATION"}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-foreground tracking-tight leading-tight">
              Hard problems welcome.
            </h2>
            <div className="flex items-center pt-2">
              <span className="inline-flex items-center gap-1.5 border border-primary/20 bg-primary/5 rounded-full px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-wider text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Optimising: decoupled systems • not: roles
              </span>
            </div>
            <div className="text-[15px] md:text-[16px] leading-relaxed text-foreground/80 space-y-4 font-sans max-w-xl">
              <p>
                Heads-down building right now – not actively looking for roles. But if you have got a hard problem, a wild idea, or just want to talk shop about hardware-software integration, real-time telemetry, database schemas, or why this site is unreasonably over-engineered for a student portfolio, I am always up for that.
              </p>
            </div>
          </div>

          {/* Links panel */}
          <div className="lg:col-span-6 space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              {"// DIRECT SIGNALS"}
            </span>
            <div className="divide-y divide-border/50 border border-border/80 rounded-2xl bg-card/15 overflow-hidden shadow-sm backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 px-5 group hover:bg-card/25 transition-all">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[10px] uppercase opacity-55">Academic Resume</span>
                    <p className="text-[14px] sm:text-[15px] font-bold text-foreground mt-0.5">Advaith_Renjith_Resume.pdf</p>
                  </div>
                </div>
                <a
                  href="/resume.pdf"
                  target="_blank"
                  className="font-mono text-xs text-primary hover:underline flex items-center gap-0.5 self-start sm:self-auto"
                >
                  DOWNLOAD ↗
                </a>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 px-5 group hover:bg-card/25 transition-all">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] uppercase opacity-55">Email Address</span>
                    <p className="text-[14px] sm:text-[15px] font-bold text-foreground mt-0.5 break-all sm:break-normal">
                      advaithanjanarenjith@gmail.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <button
                    onClick={() => handleCopyEmail('advaithanjanarenjith@gmail.com')}
                    className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {emailCopied ? 'COPIED' : 'COPY'}
                  </button>
                  <span className="text-muted-foreground/30 font-mono text-xs">/</span>
                  <a
                    href="mailto:advaithanjanarenjith@gmail.com"
                    className="font-mono text-xs text-primary hover:underline flex items-center gap-0.5"
                  >
                    SEND SIGNAL ↗
                  </a>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 px-5 group hover:bg-card/25 transition-all">
                <div className="flex items-start gap-3">
                  <Github className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] uppercase opacity-55">GitHub Codebase</span>
                    <p className="text-[14px] sm:text-[15px] font-bold text-foreground mt-0.5 break-all sm:break-normal font-mono">
                      github.com/advaith-renjith-2004
                    </p>
                  </div>
                </div>
                <a
                  href="https://github.com/advaith-renjith-2004"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-primary hover:underline flex items-center gap-0.5 self-start sm:self-auto"
                >
                  VIEW WORK ↗
                </a>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 px-5 group hover:bg-card/25 transition-all">
                <div className="flex items-start gap-3">
                  <Linkedin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] uppercase opacity-55">LinkedIn Profile</span>
                    <p className="text-[14px] sm:text-[15px] font-bold text-foreground mt-0.5 break-all sm:break-normal font-mono">
                      linkedin.com/in/advaith-renjith
                    </p>
                  </div>
                </div>
                <a
                  href="https://linkedin.com/in/advaith-renjith"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-primary hover:underline flex items-center gap-0.5 self-start sm:self-auto"
                >
                  CONNECT ↗
                </a>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 px-5 group hover:bg-card/25 transition-all">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[10px] uppercase opacity-55">Current Location</span>
                    <p className="text-[14px] sm:text-[15px] font-bold text-foreground mt-0.5">Trivandrum, India</p>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground/60 font-bold tracking-wider self-start sm:self-auto">TRV ANCHOR</span>
              </div>
            </div>
          </div>
        </section>

      </div>

      <HoverPreview
        url={previewState.url}
        x={previewState.x}
        y={previewState.y}
        isOpen={previewState.isOpen}
        onMouseEnter={handlePreviewMouseEnter}
        onMouseLeave={handlePreviewMouseLeave}
      />
    </div>
  )
}

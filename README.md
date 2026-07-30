# Advaith Renjith — Interactive Spatial Resume & Portfolio

A cinematic, interactive Kanban-style board resume and developer portfolio. Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**, featuring a premium glassmorphic HUD design, custom interactive node telemetry, and real-time state synchronization.

Live Local Preview: [http://localhost:3005](http://localhost:3005)

---

## Key Features

* **Interactive Kanban Board Resume**: Filter and explore career milestones, projects, technical skills, and educational details in a structured grid layout.
* **Spatial HUD Design**: Glassmorphic interfaces (`backdrop-blur`), subtle text glows, and premium animations built on top of a warm sand/dark chocolate design system.
* **Immersive Background**: Floating node-connections and animated stars powered by Three.js/React Three Fiber.
* **Dual Time Clock Widget**: Anchors to the TRV (Trivandrum, IST) timezone (matching MBCET studies) and dynamically geolocates the viewer to display their local timezone relative to the nearest airport.
* **Responsive Telemetry Graph**: Interactive SVG node connections mapping engineering standards and performance ratios on desktop, falling back to a clean list stack on mobile viewports.
* **Ambient Audio System**: Immersive audio integration for a atmospheric resume review session.
* **Real-time Database Sync**: Powered by Supabase postgres triggers and subscriptions, with a robust local mock-data fallback for offline or standalone execution.

---

## Tech Stack

* **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Vanilla CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
* **Animations & 3D Canvas**: [Framer Motion](https://www.framer.com/motion/), [Three.js](https://threejs.org/) via `@react-three/fiber`
* **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL schema with realtime listeners)
* **State Management**: [Zustand](https://github.com/pmndrs/zustand)
* **Icons**: [Lucide React](https://lucide.dev/)

---

## Getting Started

### Prerequisites

* Node.js (v18.x or later)
* npm (v9.x or later)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/advaith-renjith-2004/portfolio_demo.git
   cd portfolio_demo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables (Optional):
   Create a `.env.local` file in the root directory (refer to `.env.local.example`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *Note: If these variables are not provided, the application will automatically fall back to the built-in local mock data (`src/lib/mockData.ts`) so it runs flawlessly.*

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3005](http://localhost:3005) in your browser to see the live site.

---

## Database Setup

The database schema is fully defined in `supabase_setup.sql` in the root of the project. If you wish to connect your own Supabase instance:
1. Create a new Supabase project.
2. Go to the SQL Editor in Supabase.
3. Paste the contents of `supabase_setup.sql` and run it to initialize all tables, storage buckets, policies, and seed mock data.
4. Grab your project API keys and add them to `.env.local`.

---

## Engineering Standards & Performance

This project is built under strict modern engineering guidelines:
* **Local-first fallback**: Instant page loading with zero loading spin delays.
* **Responsive Layouts**: Breakpoint-optimized grids for mobile, tablet, and ultra-wide screens.
* **Component Modularity**: Isolated React components for filters, modals, cards, and canvas animations.

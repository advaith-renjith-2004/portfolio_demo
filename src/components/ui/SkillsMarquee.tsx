'use client'

import React from 'react'

const SKILLS = [
  'React',
  'Next.js 14',
  'TypeScript',
  'Node.js',
  'PostgreSQL',
  'Supabase',
  'Tailwind CSS',
  'REST APIs',
  'Git & GitHub',
  'App Architecture',
  'Zustand',
  'Python',
]

export function SkillsMarquee() {
  // We duplicate the list to ensure there is no gap when looping
  const duplicatedSkills = [...SKILLS, ...SKILLS]

  return (
    <div className="w-full border-y border-border bg-card/30 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1340px] items-center gap-4 px-4 md:px-6">
        <span className="hidden shrink-0 font-mono text-[10px] tracking-[0.25em] uppercase text-primary/60 md:inline-flex">
          → Disciplines
        </span>
        <span className="hidden h-3 w-px bg-border md:inline" />
        
        <div className="marquee-track flex-1" style={{ '--mq-speed': '30s', '--mq-gap': '24px' } as React.CSSProperties}>
          <div className="mq-rail">
            <div className="mq-group">
              {duplicatedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-6 font-mono text-[10.5px] tracking-[0.2em] uppercase text-foreground/80"
                >
                  <span>{skill}</span>
                  <span className="text-primary/30 font-bold">·</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

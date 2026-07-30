'use client'

import React from 'react'

export function StatusBand() {
  return (
    <section className="relative w-full border-b border-border bg-card/25 px-4 py-4 md:px-6 md:py-4">
      <div className="mx-auto grid w-full max-w-[1340px] grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[auto_repeat(4,minmax(0,1fr))] md:items-start md:gap-8">
        
        {/* Date Indicator */}
        <div className="flex items-center gap-2.5 font-mono text-[9.5px] tracking-[0.25em] uppercase text-muted-foreground md:min-h-[15px]">
          <span aria-hidden="true" className="relative inline-flex h-1.5 w-1.5 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/40"></span>
            <span className="relative h-1 w-1 rounded-full bg-primary"></span>
          </span>
          <span>Status · Jun &apos;26</span>
          <span className="hidden h-px w-8 bg-border md:block"></span>
        </div>

        {/* Building status */}
        <div className="grid grid-rows-[auto_auto] gap-0.5">
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-primary/50">Current Role</span>
          <span className="font-serif text-[13.5px] font-semibold italic leading-tight text-foreground md:text-sm">
            CS Final-Year Student
          </span>
          <span className="text-[11px] leading-snug text-muted-foreground">MBCET Trivandrum</span>
        </div>

        {/* Reading status */}
        <div className="grid grid-rows-[auto_auto] gap-0.5">
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-primary/50">Internship</span>
          <span className="font-serif text-[13.5px] font-semibold italic leading-tight text-foreground md:text-sm">
            Tachlog Pvt Ltd
          </span>
          <span className="text-[11px] leading-snug text-muted-foreground">Full-Stack Dev Intern</span>
        </div>

        {/* Listening status */}
        <div className="grid grid-rows-[auto_auto] gap-0.5">
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-primary/50">Reading</span>
          <span className="font-serif text-[13.5px] font-semibold italic leading-tight text-foreground md:text-sm">
            A Philosophy of Software Design
          </span>
          <span className="text-[11px] leading-snug text-muted-foreground">John Ousterhout</span>
        </div>

        {/* Last Shipped */}
        <div className="grid grid-rows-[auto_auto] gap-0.5">
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-primary/50">Last Shipped</span>
          <span className="font-serif text-[13.5px] font-semibold italic leading-tight text-foreground md:text-sm">
            Cortex Enterprise
          </span>
          <span className="text-[11px] leading-snug text-muted-foreground">
            Cross-departmental ERP with integrated natural language search
          </span>
        </div>

      </div>
    </section>
  )
}

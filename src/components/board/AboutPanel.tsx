'use client'

import { useState } from 'react'
import { Github, Mail, MapPin, FileText, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ResumeViewer } from '@/components/ui/ResumeViewer'
import { getResumeUrl } from '@/lib/supabase/storage'
import { useIsMobile } from '@/hooks'

interface AboutPanelProps {
  profileImageUrl: string
  name: string
  title: string
  bio: string
  location: string
  email: string
  socialLinks: {
    github?: string
    linkedin?: string
    resume?: string
  }
}

export function AboutPanel({
  profileImageUrl,
  name,
  title,
  bio,
  location,
  email,
  socialLinks,
}: AboutPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isResumeOpen, setIsResumeOpen] = useState(false)
  const [isEmailHovered, setIsEmailHovered] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)
  const isMobile = useIsMobile()

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(email)
    setEmailCopied(true)
    setTimeout(() => setEmailCopied(false), 2000)
  }

  return (
    <aside
      className={cn(
        'flex flex-col rounded-xl border border-border/60 bg-card/45 dark:border-white/5 dark:bg-zinc-950/40 shadow-sm backdrop-blur-md transition-all duration-300',
        'relative w-full md:sticky md:top-[88px] md:w-[280px] lg:w-[320px]',
        'md:h-fit'
      )}
    >
      {/* Mobile Header / Toggle */}
      <div
        className="flex cursor-pointer items-center justify-between p-4 md:hidden"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden">
            <img src={profileImageUrl} alt={name} className="h-full w-full object-cover scale-[1.16]" />
          </div>
          <div>
            <h2 className="text-sm font-bold">{name}</h2>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Content */}
      <div className={cn('flex flex-col gap-6 p-6 pt-0 md:pt-6', !isExpanded && 'hidden md:flex')}>
        {/* Profile Header (Desktop) */}
        <div className="hidden flex-col items-center gap-4 text-center md:flex">
          <div className="relative h-[120px] w-[120px] rounded-full overflow-hidden border-4 border-background shadow-sm">
            <img
              src={profileImageUrl}
              alt={name}
              className="h-full w-full object-cover scale-[1.16]"
            />
          </div>
          <div>
            <h1 className="text-[2.25rem] font-bold leading-tight font-serif tracking-tight">{name}</h1>
            <p className="mt-1.5 text-[17px] font-semibold text-primary/95">{title}</p>
          </div>
        </div>

        <div className="h-px w-full bg-border" />

        {/* Bio */}
        <p className="text-[16px] leading-relaxed text-foreground/90 font-sans">{bio}</p>

        <div className="h-px w-full bg-border" />

        {/* Details */}
        <div className="flex flex-col gap-3 text-[15.5px]">
          <div className="flex items-center gap-3 text-foreground/85">
            <MapPin className="h-[18px] w-[18px] shrink-0 text-primary" />
            <span>{location}</span>
          </div>
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-3 text-foreground/85 transition-colors hover:text-primary"
          >
            <Mail className="h-[18px] w-[18px] shrink-0 text-primary" />
            <span className="truncate">{email}</span>
          </a>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {socialLinks.github && (
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" asChild>
              <a
                href={socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {/* Email Button with Hover/Tap Tooltip */}
          <div
            className="relative"
            onMouseEnter={() => !isMobile && setIsEmailHovered(true)}
            onMouseLeave={() => !isMobile && setIsEmailHovered(false)}
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={(e) => {
                if (isMobile) {
                  e.preventDefault()
                  setIsEmailHovered(!isEmailHovered)
                }
              }}
              asChild={!isMobile}
            >
              {isMobile ? (
                <>
                  <Mail className="h-4 w-4" />
                  Email
                </>
              ) : (
                <a href={`mailto:${email}`}>
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              )}
            </Button>
            {/* Email Tooltip on Hover (desktop) or Tap (mobile) */}
            <div
              className={cn(
                'absolute bottom-full left-0 right-0 z-10 mb-2 overflow-hidden rounded-lg border bg-popover p-3 shadow-lg transition-all duration-200',
                isEmailHovered
                  ? 'visible translate-y-0 opacity-100'
                  : 'invisible translate-y-1 opacity-0'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">{email}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-touch h-7 w-7 shrink-0"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleCopyEmail()
                  }}
                >
                  {emailCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {/* Mobile: Tap email to send or tap outside to close */}
              {isMobile && (
                <a
                  href={`mailto:${email}`}
                  className="mt-2 block w-full rounded-md bg-primary px-3 py-2 text-center text-sm text-primary-foreground"
                >
                  Send Email
                </a>
              )}
            </div>
          </div>

          {/* Resume Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => setIsResumeOpen(true)}
          >
            <FileText className="h-4 w-4" />
            Resume
          </Button>
          <ResumeViewer
            isOpen={isResumeOpen}
            onClose={() => setIsResumeOpen(false)}
            resumeUrl={getResumeUrl()}
          />
        </div>
      </div>
    </aside>
  )
}

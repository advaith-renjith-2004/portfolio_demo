'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Download, ExternalLink, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface ResumeViewerProps {
  isOpen: boolean
  onClose: () => void
  resumeUrl: string
  fileName?: string
}

export function ResumeViewer({
  isOpen,
  onClose,
  resumeUrl,
  fileName = 'resume.pdf',
}: ResumeViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setHasError(false)
    }
  }, [isOpen])

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Download handler
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = resumeUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isOpen) return null
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
    >
      {/* Backdrop */}
      <div
        className="animate-in fade-in absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative flex h-[85vh] w-full max-w-4xl flex-col rounded-xl border bg-card shadow-2xl',
          'animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-300'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 id="resume-modal-title" className="text-lg font-semibold">
            Resume
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(resumeUrl, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Open in New Tab</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="relative flex-1 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {hasError ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
              <p className="text-muted-foreground">Unable to display PDF in browser.</p>
              <Button onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          ) : (
            <iframe
              src={resumeUrl}
              className="h-full w-full"
              title="Resume PDF"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false)
                setHasError(true)
              }}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

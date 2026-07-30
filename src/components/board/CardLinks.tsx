import { Github, Globe, FileText, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Link, LinkType } from '@/types'

interface CardLinksProps {
  links: Link[]
}

const LINK_ICONS: Record<LinkType, React.ReactNode> = {
  github: <Github className="h-4 w-4" />,
  demo: <Globe className="h-4 w-4" />,
  article: <FileText className="h-4 w-4" />,
  external: <ExternalLink className="h-4 w-4" />,
}

export function CardLinks({ links }: CardLinksProps) {
  if (!links || links.length === 0) return null

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link) => (
        <Button
          key={link.id}
          variant="outline"
          size="sm"
          className="h-9 gap-2 text-muted-foreground hover:text-foreground"
          asChild
        >
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            {link.link_type ? LINK_ICONS[link.link_type] : <ExternalLink className="h-4 w-4" />}
            <span>{link.label}</span>
          </a>
        </Button>
      ))}
    </div>
  )
}

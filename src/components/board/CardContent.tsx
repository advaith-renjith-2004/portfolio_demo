import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { cn } from '@/lib/utils'

interface CardContentProps {
  content: string
  className?: string
}

export function CardContent({ content, className }: CardContentProps) {
  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => <h1 className="mb-4 mt-6 text-3xl font-extrabold font-serif text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-3 mt-5 text-2xl font-bold font-serif text-foreground">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-2 mt-4 text-xl font-bold font-serif text-foreground">{children}</h3>,
          p: ({ children }) => (
            <p className="mb-4 text-[16px] md:text-[17px] leading-relaxed text-foreground/90">{children}</p>
          ),
          ul: ({ children }) => <ul className="mb-4 list-disc space-y-1.5 pl-6 text-[16px] md:text-[17px] text-foreground/90">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 list-decimal space-y-1.5 pl-6 text-[16px] md:text-[17px] text-foreground/90">{children}</ol>,
          li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match
            return isInline ? (
              <code
                className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code
                className={cn(
                  'block overflow-x-auto rounded-lg bg-muted/50 p-4 font-mono text-sm',
                  className
                )}
                {...props}
              >
                {children}
              </code>
            )
          },
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-primary/50 pl-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50 text-xs uppercase">{children}</thead>
          ),
          th: ({ children }) => <th className="px-4 py-3 font-medium">{children}</th>,
          td: ({ children }) => <td className="border-t px-4 py-3">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

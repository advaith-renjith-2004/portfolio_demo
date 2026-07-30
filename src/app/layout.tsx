import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { ToastProvider } from '@/components/ui/Toast'
import { Cursor } from '@/components/ui/Cursor'
import { AIBackground } from '@/components/ui/AIBackground'
import { ClockWidget } from '@/components/ui/ClockWidget'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant-garamond',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Advaith Renjith - Portfolio',
  description: 'Cinematic interactive board resume and developer portfolio of Advaith Renjith',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  var theme = savedTheme === 'system' || !savedTheme ? 'light' : savedTheme;
                  document.documentElement.classList.add(theme);
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${cormorantGaramond.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <AIBackground />
        <Cursor />
        <ClockWidget />
        <ToastProvider>
          <div className="relative z-10 flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}

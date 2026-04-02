import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { AppShell } from '@/components/layout/AppShell'
import './globals.css'

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: '2scloud — Edge Gateway',
  description: 'Edge Gateway admin dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mono.variable}>
      <body className="scanlines antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'
import NavBar from "@/components/ui/navbar";

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: '2scloud — Edge Gateway',
  description: 'API Gateway observability dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mono.variable}>
      <body className="scanlines antialiased">
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}

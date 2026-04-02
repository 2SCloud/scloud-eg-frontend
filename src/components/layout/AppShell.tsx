'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 min-h-screen overflow-auto ml-[220px]">
        {children}
      </main>
    </div>
  )
}

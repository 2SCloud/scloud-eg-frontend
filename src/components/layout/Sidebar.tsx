'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ScrollText,
  Cpu,
  Shield,
  Gauge,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/auth'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const TOP_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Overview',  icon: LayoutDashboard },
  { href: '/logs',      label: 'Logs',      icon: ScrollText },
]

const CONFIG_NAV: NavItem[] = [
  { href: '/config/modules',    label: 'Modules',     icon: Cpu },
  { href: '/config/waf',        label: 'WAF Rules',   icon: Shield },
  { href: '/config/rate-limit', label: 'Rate Limit',  icon: Gauge },
]

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-sm px-3 py-2 font-mono text-[11px] uppercase tracking-widest',
        'transition-all duration-150',
        active
          ? 'border-l-2 border-sky-400 bg-sky-500/10 text-sky-300 pl-[10px]'
          : 'border-l-2 border-transparent text-sky-900/50 hover:border-sky-900/40 hover:bg-sky-950/30 hover:text-sky-700',
      )}
      style={active ? { textShadow: '0 0 10px rgba(56,189,248,0.4)' } : undefined}
    >
      <Icon
        size={14}
        className={active ? 'text-sky-400' : 'text-sky-900/40'}
        strokeWidth={active ? 2 : 1.5}
      />
      {item.label}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col border-r border-[#0f2040]"
      style={{ background: '#040b14' }}
    >
      {/* Top neon line */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(to right, transparent, #38bdf8 50%, transparent)',
          boxShadow: '0 0 8px rgba(56,189,248,0.5)',
        }}
      />

      {/* Logo */}
      <div className="px-5 pt-7 pb-6">
        <div className="flex items-center gap-2.5 mb-1">
          {/* Pulsing dot */}
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: '#38bdf8' }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ backgroundColor: '#38bdf8', boxShadow: '0 0 8px rgba(56,189,248,0.9)' }}
            />
          </span>
          <span
            className="font-mono text-sm font-bold uppercase tracking-[0.25em] text-sky-300"
            style={{ textShadow: '0 0 14px rgba(56,189,248,0.5)' }}
          >
            2SCLOUD
          </span>
        </div>
        <p className="font-mono text-[10px] text-sky-900/40 uppercase tracking-[0.2em] ml-[18px]">
          edge-gateway
        </p>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-[#0f2040] mb-3" />

      {/* Top nav */}
      <nav className="flex flex-col gap-0.5 px-3">
        {TOP_NAV.map(item => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname === item.href || pathname.startsWith(item.href + '/')}
          />
        ))}
      </nav>

      {/* Config separator */}
      <div className="mx-4 mt-5 mb-2 flex items-center gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-sky-900/30">
          Config
        </span>
        <div className="flex-1 h-px bg-[#0f2040]" />
      </div>

      {/* Config nav */}
      <nav className="flex flex-col gap-0.5 px-3">
        {CONFIG_NAV.map(item => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname === item.href || pathname.startsWith(item.href + '/')}
          />
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom */}
      <div className="px-4 pb-5">
        <div className="h-px bg-[#0f2040] mb-4" />
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] text-sky-900/25 uppercase tracking-widest">
            v0.1
          </p>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-sky-900/30 hover:text-pink-400 transition-colors duration-150"
            title="Logout"
          >
            <LogOut size={11} strokeWidth={1.5} />
            logout
          </button>
        </div>
      </div>
    </aside>
  )
}

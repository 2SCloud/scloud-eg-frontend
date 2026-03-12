'use client'

import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  delta?: number
  accent?: boolean
  index?: number
}

export function StatCard({ label, value, delta, accent, index = 0 }: StatCardProps) {
  const isError = label.toLowerCase().includes('error')
  // For error: going down is good (green), going up is bad (red)
  // For others: going up is good (green), going down is yellow
  const deltaGood = isError ? (delta ?? 0) < 0 : (delta ?? 0) > 0
  const deltaBad  = isError ? (delta ?? 0) > 0 : (delta ?? 0) < 0

  return (
    <div
      className={cn(
        'fade-up relative overflow-hidden rounded border bg-[#070d19] p-5 transition-all duration-300',
        accent
          ? 'border-sky-500/40 neon-card'
          : 'border-[#0f2040] hover:border-sky-900/60',
      )}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Corner accent */}
      {accent && (
        <span className="pointer-events-none absolute right-0 top-0 h-16 w-16 overflow-hidden">
          <span
            className="absolute right-0 top-0 h-px w-12 origin-right"
            style={{ background: 'linear-gradient(to left, #38bdf8, transparent)', boxShadow: '0 0 6px rgba(56,189,248,0.6)' }}
          />
          <span
            className="absolute right-0 top-0 h-12 w-px"
            style={{ background: 'linear-gradient(to bottom, #38bdf8, transparent)', boxShadow: '0 0 6px rgba(56,189,248,0.6)' }}
          />
        </span>
      )}

      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-900/80">
          {label}
        </p>
        <p
          className={cn(
            'mt-2 font-mono text-3xl font-bold tracking-tight',
            accent ? 'text-sky-300 neon-sky' : 'text-slate-100',
          )}
        >
          {value}
        </p>
        {delta !== undefined && (
          <p className={cn(
            'mt-1.5 font-mono text-[11px]',
            deltaGood ? 'text-sky-400' : deltaBad ? 'text-red-400' : 'text-slate-500',
          )}>
            {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}%
            <span className="ml-1 text-slate-600">vs prev</span>
          </p>
        )}
      </div>
    </div>
  )
}

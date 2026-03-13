'use client'

import { cn } from '@/lib/utils'
import type { TimeRange } from '@/lib/api'

const RANGES: { value: TimeRange; label: string }[] = [
  { value: '1h',  label: '1H' },
  { value: '6h',  label: '6H' },
  { value: '24h', label: '24H' },
  { value: '7d',  label: '7D' },
  { value: '30d', label: '30D' },
]

interface TimeRangeSelectorProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-0.5 rounded border border-[#0f2040] bg-[#070d19] p-1">
      {RANGES.map(r => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={cn(
            'rounded-sm px-3 py-1 font-mono text-[11px] tracking-widest transition-all duration-150',
            value === r.value
              ? 'bg-sky-500/15 text-sky-300'
              : 'text-sky-900/60 hover:text-sky-700',
          )}
          style={value === r.value ? {
            boxShadow: '0 0 8px rgba(56,189,248,0.2), inset 0 0 8px rgba(56,189,248,0.05)'
          } : undefined}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}

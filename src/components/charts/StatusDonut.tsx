'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { StatusCodeDistribution } from '@/types/api'

interface StatusDonutProps {
  data: StatusCodeDistribution[]
}

// Sky-blue neon palette for status codes
const COLORS: Record<string, { fill: string; glow: string; label: string }> = {
  '2xx': { fill: '#38bdf8', glow: 'rgba(56,189,248,0.5)',  label: 'sky' },
  '3xx': { fill: '#818cf8', glow: 'rgba(129,140,248,0.5)', label: 'indigo' },
  '4xx': { fill: '#f472b6', glow: 'rgba(244,114,182,0.5)', label: 'pink' },
  '5xx': { fill: '#fb7185', glow: 'rgba(251,113,133,0.5)', label: 'rose' },
}

const TOOLTIP = {
  backgroundColor: '#070d19',
  border: '1px solid #0f2040',
  borderRadius: '3px',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: '11px',
  color: '#94a3b8',
}

export function StatusDonut({ data }: StatusDonutProps) {
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <ResponsiveContainer width={150} height={150}>
          <PieChart>
            <defs>
              {data.map(d => {
                const c = COLORS[d.code]
                return (
                  <filter key={d.code} id={`glow-${d.code}`}>
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                )
              })}
            </defs>
            <Pie
              data={data} cx="50%" cy="50%"
              innerRadius={46} outerRadius={62}
              dataKey="count" strokeWidth={0} paddingAngle={3}
            >
              {data.map(d => (
                <Cell
                  key={d.code}
                  fill={COLORS[d.code]?.fill ?? '#334155'}
                  fillOpacity={0.9}
                  filter={`url(#glow-${d.code})`}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP}
              formatter={(v, _, props) => [
                `${Number(v ?? 0).toLocaleString()} · ${props.payload.percentage}%`,
                `HTTP ${props.payload.code}`,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[10px] text-sky-900/70 uppercase tracking-widest">total</span>
          <span className="font-mono text-base font-bold text-sky-300" style={{ textShadow: '0 0 8px rgba(56,189,248,0.5)' }}>
            {(total / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {data.map(d => {
          const c = COLORS[d.code]
          return (
            <div key={d.code} className="flex items-center gap-2.5">
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: c?.fill, boxShadow: `0 0 6px ${c?.glow}` }}
              />
              <span className="font-mono text-xs text-slate-400">HTTP {d.code}</span>
              <span className="font-mono text-xs ml-auto pl-4" style={{ color: c?.fill }}>
                {d.percentage}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

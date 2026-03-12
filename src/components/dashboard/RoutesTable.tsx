'use client'

import { cn } from '@/lib/utils'
import type { RouteMetrics } from '@/types/api'

interface RoutesTableProps {
  data: RouteMetrics[]
}

const METHOD_STYLE: Record<string, string> = {
  GET:    'text-sky-300 bg-sky-500/10 border border-sky-500/20',
  POST:   'text-indigo-300 bg-indigo-500/10 border border-indigo-500/20',
  PUT:    'text-violet-300 bg-violet-500/10 border border-violet-500/20',
  PATCH:  'text-cyan-300 bg-cyan-500/10 border border-cyan-500/20',
  DELETE: 'text-pink-300 bg-pink-500/10 border border-pink-500/20',
}

function LatencyBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100)
  const color = pct > 70 ? '#f472b6' : pct > 40 ? '#818cf8' : '#38bdf8'
  const glow  = pct > 70 ? 'rgba(244,114,182,0.6)' : pct > 40 ? 'rgba(129,140,248,0.6)' : 'rgba(56,189,248,0.6)'

  return (
    <div className="flex items-center gap-2.5">
      <div className="h-[3px] w-24 overflow-hidden rounded-full bg-[#0c1526]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 6px ${glow}` }}
        />
      </div>
      <span className="font-mono text-[11px] text-slate-500">{value}ms</span>
    </div>
  )
}

export function RoutesTable({ data }: RoutesTableProps) {
  const maxLatency = Math.max(...data.map(d => d.p99Latency))
  const sorted = [...data].sort((a, b) => b.requestCount - a.requestCount)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#0f2040]">
            {['Method', 'Route', 'Requests', 'Avg', 'P99', 'Error %'].map(h => (
              <th
                key={h}
                className="pb-3 pr-6 font-mono text-[10px] uppercase tracking-[0.15em] text-sky-900/60"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={i}
              className="group border-b border-[#070d19] transition-colors duration-150 hover:bg-sky-950/20"
            >
              <td className="py-3 pr-6">
                <span className={cn('rounded-sm px-2 py-0.5 font-mono text-[10px] font-semibold', METHOD_STYLE[row.method])}>
                  {row.method}
                </span>
              </td>
              <td className="py-3 pr-6">
                <span className="font-mono text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">
                  {row.route}
                </span>
              </td>
              <td className="py-3 pr-6">
                <span className="font-mono text-[11px] text-slate-500">
                  {row.requestCount.toLocaleString()}
                </span>
              </td>
              <td className="py-3 pr-6">
                <span className="font-mono text-[11px] text-slate-500">{row.avgLatency}ms</span>
              </td>
              <td className="py-3 pr-6">
                <LatencyBar value={row.p99Latency} max={maxLatency} />
              </td>
              <td className="py-3">
                <span
                  className="font-mono text-[11px]"
                  style={{
                    color: row.errorRate > 3 ? '#f472b6' : row.errorRate > 1 ? '#818cf8' : '#38bdf8',
                    textShadow: row.errorRate > 3
                      ? '0 0 8px rgba(244,114,182,0.5)'
                      : row.errorRate > 1
                      ? '0 0 8px rgba(129,140,248,0.5)'
                      : '0 0 8px rgba(56,189,248,0.4)',
                  }}
                >
                  {row.errorRate}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

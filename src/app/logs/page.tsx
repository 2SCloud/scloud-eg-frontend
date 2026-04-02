'use client'

import { useState, useEffect, useCallback } from 'react'
import { getLogs } from '@/lib/api'
import type { RequestLog } from '@/types/api'
import { cn } from '@/lib/utils'

// ─── Method badge ─────────────────────────────────────────────────────────────

const METHOD_STYLE: Record<string, string> = {
  GET:     'text-sky-300 bg-sky-500/10 border border-sky-500/20',
  POST:    'text-indigo-300 bg-indigo-500/10 border border-indigo-500/20',
  PUT:     'text-violet-300 bg-violet-500/10 border border-violet-500/20',
  PATCH:   'text-cyan-300 bg-cyan-500/10 border border-cyan-500/20',
  DELETE:  'text-pink-300 bg-pink-500/10 border border-pink-500/20',
  HEAD:    'text-slate-400 bg-slate-500/10 border border-slate-500/20',
  OPTIONS: 'text-slate-400 bg-slate-500/10 border border-slate-500/20',
}

function MethodBadge({ method }: { method: RequestLog['method'] }) {
  return (
    <span className={cn('rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold', METHOD_STYLE[method] ?? METHOD_STYLE.HEAD)}>
      {method}
    </span>
  )
}

// ─── Decision badge ───────────────────────────────────────────────────────────

function DecisionBadge({ decision }: { decision: RequestLog['decision'] }) {
  return (
    <span
      className={cn(
        'rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest',
        decision === 'block'
          ? 'text-pink-300 bg-pink-500/10 border border-pink-500/20'
          : 'text-sky-300 bg-sky-500/10 border border-sky-500/20',
      )}
      style={decision === 'block' ? { textShadow: '0 0 8px rgba(244,114,182,0.4)' } : undefined}
    >
      {decision}
    </span>
  )
}

// ─── Status code color ────────────────────────────────────────────────────────

function statusColor(code: number): string {
  if (code < 300) return '#38bdf8'
  if (code < 400) return '#818cf8'
  if (code < 500) return '#f472b6'
  return '#fb7185'
}

// ─── Latency bar ─────────────────────────────────────────────────────────────

function LatencyBar({ ms }: { ms: number }) {
  const color = ms < 50 ? '#4ade80' : ms < 200 ? '#facc15' : '#f87171'
  const glow  = ms < 50 ? 'rgba(74,222,128,0.5)' : ms < 200 ? 'rgba(250,204,21,0.5)' : 'rgba(248,113,113,0.5)'
  const width = Math.min((ms / 1000) * 100, 100)

  return (
    <div className="flex items-center gap-2">
      <div className="h-[3px] w-16 overflow-hidden rounded-full bg-[#0c1526] flex-shrink-0">
        <div
          className="h-full rounded-full"
          style={{ width: `${width}%`, backgroundColor: color, boxShadow: `0 0 4px ${glow}` }}
        />
      </div>
      <span className="font-mono text-[11px]" style={{ color }}>{ms}ms</span>
    </div>
  )
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type Filter = 'all' | 'block' | 'allow'

function FilterTabs({
  active,
  counts,
  onChange,
}: {
  active: Filter
  counts: { all: number; block: number; allow: number }
  onChange: (f: Filter) => void
}) {
  const tabs: { key: Filter; label: string }[] = [
    { key: 'all',   label: 'All' },
    { key: 'block', label: 'Blocked' },
    { key: 'allow', label: 'Allowed' },
  ]

  return (
    <div className="flex overflow-hidden rounded border border-[#0f2040]">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-all duration-150',
            active === tab.key
              ? 'bg-sky-500/10 text-sky-300'
              : 'text-sky-900/40 hover:text-sky-700 bg-transparent',
          )}
          style={active === tab.key ? { boxShadow: 'inset 0 0 8px rgba(56,189,248,0.06)' } : undefined}
        >
          {tab.label}
          <span className={cn(
            'rounded-sm px-1 py-px font-mono text-[9px]',
            active === tab.key ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-sky-900/40',
          )}>
            {counts[tab.key]}
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LogsPage() {
  const [allLogs, setAllLogs] = useState<RequestLog[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getLogs('all', 50)
      setAllLogs(data)
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 10s
  useEffect(() => {
    const id = setInterval(load, 10_000)
    return () => clearInterval(id)
  }, [load])

  const displayed = filter === 'all'
    ? allLogs
    : allLogs.filter(l => l.decision === filter)

  const counts = {
    all:   allLogs.length,
    block: allLogs.filter(l => l.decision === 'block').length,
    allow: allLogs.filter(l => l.decision === 'allow').length,
  }

  function formatTime(iso: string) {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-[#030712] grid-bg p-8">

      {/* Header */}
      <div className="fade-up mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-mono text-lg font-bold text-sky-300 neon-sky uppercase tracking-widest">
            Request Logs
          </h1>
          <p className="font-mono text-[11px] text-sky-900/60 mt-1">
            {lastUpdated
              ? `last updated ${lastUpdated.toLocaleTimeString()} · auto-refresh 10s`
              : 'loading…'
            }
          </p>
        </div>

        <div className="flex items-center gap-3">
          <FilterTabs active={filter} counts={counts} onChange={setFilter} />
          <button
            onClick={load}
            disabled={loading}
            className={cn(
              'rounded border border-[#0f2040] bg-[#070d19] px-3 py-1.5',
              'font-mono text-[11px] text-sky-900/60 transition-all duration-200',
              'hover:border-sky-800/40 hover:text-sky-400 disabled:opacity-30',
            )}
          >
            {loading ? '⟳ syncing' : '⟳ refresh'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="fade-up rounded border border-[#0f2040] bg-[#070d19] overflow-hidden" style={{ animationDelay: '0.1s' }}>

        {/* Table header */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-[#0f2040] bg-[#040b14]">
                {['Time', 'IP', 'Method', 'Path', 'Decision', 'Reason', 'Status', 'Latency'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-sky-900/50 font-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && displayed.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <span className="font-mono text-[11px] text-sky-900/40 animate-pulse">Loading logs…</span>
                  </td>
                </tr>
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <span className="font-mono text-[11px] text-sky-900/40">No logs for this filter.</span>
                  </td>
                </tr>
              ) : (
                displayed.map(log => (
                  <tr
                    key={log.id}
                    className="border-b border-[#070d19] transition-colors duration-100 hover:bg-sky-950/10"
                  >
                    {/* Time */}
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-[11px] text-slate-600">
                        {formatTime(log.timestamp)}
                      </span>
                    </td>

                    {/* IP */}
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-[11px] text-slate-500">
                        {log.ip}
                      </span>
                    </td>

                    {/* Method */}
                    <td className="px-4 py-2.5">
                      <MethodBadge method={log.method} />
                    </td>

                    {/* Path */}
                    <td className="px-4 py-2.5 max-w-[220px]">
                      <span className="font-mono text-[11px] text-slate-400 block truncate" title={log.path}>
                        {log.path}
                      </span>
                    </td>

                    {/* Decision */}
                    <td className="px-4 py-2.5">
                      <DecisionBadge decision={log.decision} />
                    </td>

                    {/* Reason */}
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-[10px] text-slate-700">
                        {log.reason}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-2.5">
                      <span
                        className="font-mono text-[11px] font-semibold"
                        style={{
                          color: statusColor(log.status_code),
                          textShadow: `0 0 8px ${statusColor(log.status_code)}55`,
                        }}
                      >
                        {log.status_code}
                      </span>
                    </td>

                    {/* Latency */}
                    <td className="px-4 py-2.5">
                      <LatencyBar ms={log.latency_ms} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {displayed.length > 0 && (
          <div className="border-t border-[#0f2040] px-4 py-2">
            <p className="font-mono text-[10px] text-sky-900/30">
              showing {displayed.length} of {counts.all} entries
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { StatCard } from '@/components/dashboard/StatCard'
import { TimeRangeSelector } from '@/components/dashboard/TimeRangeSelector'
import { RequestsChart } from '@/components/charts/RequestsChart'
import { ErrorChart } from '@/components/charts/ErrorChart'
import { StatusDonut } from '@/components/charts/StatusDonut'
import { RoutesTable } from '@/components/dashboard/RoutesTable'
import { getDashboardData } from '@/lib/api'
import type { DashboardData, TimeRange } from '@/lib/api'
import { cn } from '@/lib/utils'

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  return `${d}d ${h}h`
}

type LatencyView = 'rps' | 'latency'

function Panel({
  title,
  children,
  className,
  delay = 0,
}: {
  title?: string
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <div
      className={cn(
        'fade-up rounded border border-[#0f2040] bg-[#070d19] p-5',
        'transition-colors duration-300 hover:border-sky-900/50',
        className,
      )}
      style={{
        animationDelay: `${delay}s`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.04)',
      }}
    >
      {title && (
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-sky-900/70">
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="h-full w-full animate-pulse rounded bg-[#0c1526]" />
  )
}

export function DashboardClient() {
  const [range, setRange] = useState<TimeRange>('24h')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<LatencyView>('rps')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await getDashboardData(range)
      setData(d)
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const id = setInterval(() => { load() }, 30_000)
    return () => clearInterval(id)
  }, [load])

  return (
    <div className="min-h-screen bg-[#030712] grid-bg p-8">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="fade-up mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-mono text-lg font-bold text-sky-300 neon-sky uppercase tracking-widest">
            Overview
          </h1>
          <p className="font-mono text-[11px] text-sky-900/60 mt-1">
            {lastUpdated
              ? `↻ ${lastUpdated.toLocaleTimeString()} · auto-refresh 30s`
              : 'initializing…'
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
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
          <TimeRangeSelector value={range} onChange={setRange} />
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={data ? data.stats.totalRequests.toLocaleString() : '—'}
          delta={data?.stats.totalRequestsDelta}
          accent index={0}
        />
        <StatCard
          label="Avg Latency"
          value={data ? `${data.stats.avgLatency}ms` : '—'}
          delta={data?.stats.avgLatencyDelta}
          index={1}
        />
        <StatCard
          label="Error Rate"
          value={data ? `${data.stats.errorRate}%` : '—'}
          delta={data?.stats.errorRateDelta}
          index={2}
        />
        <StatCard
          label="Uptime"
          value={data ? formatUptime(data.stats.uptime) : '—'}
          index={3}
        />
      </div>

      {/* ── Charts row ──────────────────────────────────────── */}
      <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-3">

        {/* Requests / Latency (2 cols) */}
        <Panel className="lg:col-span-2" delay={0.2}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-900/70">
              {view === 'rps' ? 'Requests / sec' : 'Latency percentiles'}
            </h2>
            <div className="flex overflow-hidden rounded border border-[#0f2040]">
              {(['rps', 'latency'] as LatencyView[]).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    'px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-all duration-150',
                    view === v ? 'bg-sky-500/10 text-sky-300' : 'text-sky-900/40 hover:text-sky-700 bg-transparent',
                  )}
                  style={view === v ? { boxShadow: 'inset 0 0 8px rgba(56,189,248,0.06)' } : undefined}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          {data
            ? <RequestsChart data={data.requestMetrics} view={view} />
            : <div className="h-[230px]"><Skeleton /></div>
          }
        </Panel>

        {/* Status donut */}
        <Panel title="Status distribution" delay={0.25}>
          <div className="flex items-center justify-center h-[230px]">
            {data
              ? <StatusDonut data={data.statusDistribution} />
              : <Skeleton />
            }
          </div>
        </Panel>
      </div>

      {/* ── Error rate ──────────────────────────────────────── */}
      <Panel title="Error rate %" className="mb-5" delay={0.3}>
        {data
          ? <ErrorChart data={data.errorMetrics} />
          : <div className="h-[230px]"><Skeleton /></div>
        }
      </Panel>

      {/* ── Routes table ────────────────────────────────────── */}
      <Panel title="Top routes" delay={0.35}>
        {data
          ? <RoutesTable data={data.topRoutes} />
          : <div className="h-[300px]"><Skeleton /></div>
        }
      </Panel>

      {/* Footer */}
      <p className="mt-6 text-center font-mono text-[10px] text-sky-900/30 fade-up" style={{ animationDelay: '0.4s' }}>
        2scloud edge-gateway · observability v0.1 · mock data
      </p>
    </div>
  )
}

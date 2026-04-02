'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { RequestMetrics } from '@/lib/api'
import { format } from 'date-fns'

interface RequestsChartProps {
  data: RequestMetrics[]
  view: 'rps' | 'latency'
}

const TOOLTIP = {
  backgroundColor: '#070d19',
  border: '1px solid #0f2040',
  borderRadius: '3px',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: '11px',
  color: '#94a3b8',
  boxShadow: '0 0 12px rgba(56,189,248,0.08)',
}

export function RequestsChart({ data, view }: RequestsChartProps) {
  const sampled = data.length > 60
    ? data.filter((_, i) => i % Math.ceil(data.length / 60) === 0)
    : data

  const chartData = sampled.map(d => ({
    ...d,
    time: format(new Date(d.timestamp), 'HH:mm'),
  }))

  const axisProps = {
    tick: { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fill: '#1e3a5f' },
    tickLine: false,
    axisLine: false,
  }

  if (view === 'rps') {
    return (
      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="rpsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#38bdf8" stopOpacity={0.3} />
              <stop offset="60%"  stopColor="#38bdf8" stopOpacity={0.06} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#0a1929" vertical={false} />
          <XAxis dataKey="time" {...axisProps} interval="preserveStartEnd" />
          <YAxis {...axisProps} />
          <Tooltip contentStyle={TOOLTIP} labelStyle={{ color: '#475569' }} />
          <Area
            type="monotone" dataKey="requestsPerSec" name="req/s"
            stroke="#38bdf8" strokeWidth={1.5}
            fill="url(#rpsGrad)" dot={false}
            filter="url(#glow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={230}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="p50g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#38bdf8" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="p95g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#818cf8" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="p99g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f472b6" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#f472b6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="#0a1929" vertical={false} />
        <XAxis dataKey="time" {...axisProps} interval="preserveStartEnd" />
        <YAxis {...axisProps} unit="ms" />
        <Tooltip contentStyle={TOOLTIP} labelStyle={{ color: '#475569' }} formatter={(v) => [`${Number(v ?? 0)}ms`]} />
        <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#334155' }} />
        <Area type="monotone" dataKey="latencyP50" name="p50" stroke="#38bdf8" strokeWidth={1.5} fill="url(#p50g)" dot={false} />
        <Area type="monotone" dataKey="latencyP95" name="p95" stroke="#818cf8" strokeWidth={1.5} fill="url(#p95g)" dot={false} />
        <Area type="monotone" dataKey="latencyP99" name="p99" stroke="#f472b6" strokeWidth={1.5} fill="url(#p99g)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

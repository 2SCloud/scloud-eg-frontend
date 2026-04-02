'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { ErrorMetrics } from '@/lib/api'
import { format } from 'date-fns'

interface ErrorChartProps {
  data: ErrorMetrics[]
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

function barColor(rate: number) {
  if (rate > 5)  return '#f472b6'
  if (rate > 2)  return '#818cf8'
  return '#38bdf8'
}

export function ErrorChart({ data }: ErrorChartProps) {
  const sampled = data.length > 60
    ? data.filter((_, i) => i % Math.ceil(data.length / 60) === 0)
    : data

  const chartData = sampled.map(d => ({
    time: format(new Date(d.timestamp), 'HH:mm'),
    errorRate: d.errorRate,
  }))

  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={5}>
        <defs>
          <filter id="barGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="#0a1929" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#1e3a5f' }}
          tickLine={false} axisLine={false} interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#1e3a5f' }}
          tickLine={false} axisLine={false} unit="%" domain={[0, 'auto']}
        />
        <Tooltip
          contentStyle={TOOLTIP}
          labelStyle={{ color: '#475569' }}
          formatter={(v) => [`${Number(v ?? 0)}%`, 'error rate']}
        />
        <Bar dataKey="errorRate" radius={[2, 2, 0, 0]} filter="url(#barGlow)">
          {chartData.map((entry, i) => (
            <Cell key={i} fill={barColor(entry.errorRate)} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

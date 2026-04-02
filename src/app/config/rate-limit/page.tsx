'use client'

import { useState, useEffect, useCallback } from 'react'
import { getRateLimitConfig, saveRateLimitConfig } from '@/lib/api'
import type { RateLimitConfig } from '@/types/api'
import { cn } from '@/lib/utils'

// ─── Inline editable number field ─────────────────────────────────────────────

function EditableField({
  label,
  value,
  unit,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  unit: string
  min: number
  max: number
  onChange: (v: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [raw, setRaw] = useState(String(value))

  useEffect(() => { setRaw(String(value)) }, [value])

  function commit() {
    const n = parseInt(raw, 10)
    if (!isNaN(n) && n >= min && n <= max) {
      onChange(n)
    } else {
      setRaw(String(value)) // revert invalid
    }
    setEditing(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') { setRaw(String(value)); setEditing(false) }
  }

  return (
    <div className="rounded border border-[#0f2040] bg-[#040b14] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-900/50 mb-2">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        {editing ? (
          <input
            autoFocus
            type="number"
            min={min}
            max={max}
            value={raw}
            onChange={e => setRaw(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKey}
            className="w-28 rounded border border-sky-800/60 bg-[#030712] px-3 py-1.5 font-mono text-2xl font-bold text-sky-300 focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="font-mono text-2xl font-bold text-slate-100 hover:text-sky-300 transition-colors duration-150 cursor-text"
            title="Click to edit"
          >
            {value}
          </button>
        )}
        <span className="font-mono text-sm text-sky-900/50">{unit}</span>
        {!editing && (
          <span className="font-mono text-[10px] text-sky-900/25 ml-1">(click to edit)</span>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RateLimitPage() {
  const [config, setConfig] = useState<RateLimitConfig | null>(null)
  const [savedConfig, setSavedConfig] = useState<RateLimitConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getRateLimitConfig()
      setConfig(data)
      setSavedConfig(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const hasChanges =
    config !== null &&
    savedConfig !== null &&
    (config.max_requests !== savedConfig.max_requests ||
      config.window_seconds !== savedConfig.window_seconds)

  async function handleSave() {
    if (!config) return
    setSaving(true)
    setSaveMsg(null)
    try {
      await saveRateLimitConfig(config)
      setSavedConfig(config)
      setSaveMsg('Saved!')
      setTimeout(() => setSaveMsg(null), 2500)
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    if (savedConfig) setConfig(savedConfig)
  }

  return (
    <div className="min-h-screen bg-[#030712] grid-bg p-8">

      {/* Header */}
      <div className="fade-up mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-mono text-lg font-bold text-sky-300 neon-sky uppercase tracking-widest">
            Rate Limiting
          </h1>
          <p className="font-mono text-[11px] text-sky-900/60 mt-1">
            per-IP request throttling
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveMsg && (
            <span className="font-mono text-[11px] text-sky-400 animate-pulse">
              {saveMsg}
            </span>
          )}
          {hasChanges && (
            <button
              onClick={handleReset}
              className="rounded border border-[#0f2040] px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-sky-900/40 hover:text-sky-700 transition-all duration-150"
            >
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={cn(
              'rounded border px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-all duration-150',
              hasChanges && !saving
                ? 'border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20'
                : 'border-[#0f2040] bg-transparent text-sky-900/25 cursor-not-allowed',
            )}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {loading || !config ? (
        <div className="rounded border border-[#0f2040] bg-[#070d19] p-5 animate-pulse h-40" />
      ) : (
        <div className="max-w-xl space-y-4">

          {/* Config panel */}
          <div className="fade-up rounded border border-[#0f2040] bg-[#070d19] p-5" style={{ animationDelay: '0.1s' }}>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-900/60 mb-4">
              Current Configuration
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <EditableField
                label="Max Requests"
                value={config.max_requests}
                unit="req"
                min={1}
                max={100000}
                onChange={v => setConfig(c => c ? { ...c, max_requests: v } : c)}
              />
              <EditableField
                label="Window"
                value={config.window_seconds}
                unit="sec"
                min={1}
                max={86400}
                onChange={v => setConfig(c => c ? { ...c, window_seconds: v } : c)}
              />
            </div>

            {/* Summary */}
            <div
              className="rounded border border-sky-900/20 bg-sky-950/10 px-4 py-3"
              style={{ boxShadow: 'inset 0 0 12px rgba(56,189,248,0.03)' }}
            >
              <p className="font-mono text-sm text-sky-300">
                <span className="neon-sky font-bold">{config.max_requests} req</span>
                <span className="text-sky-900/60"> / </span>
                <span className="font-bold text-indigo-300">{config.window_seconds}s</span>
                <span className="text-sky-900/60"> per IP</span>
              </p>
              <p className="font-mono text-[10px] text-sky-900/40 mt-1.5">
                Effective rate: ~{(config.max_requests / config.window_seconds).toFixed(1)} req/s per IP address
              </p>
            </div>
          </div>

          {/* Explanation */}
          <div className="fade-up rounded border border-[#0f2040] bg-[#070d19] p-5" style={{ animationDelay: '0.2s' }}>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-900/60 mb-3">
              How it works
            </h2>
            <ul className="space-y-2">
              {[
                `Each unique IP address is allowed up to ${config.max_requests} requests within any ${config.window_seconds}-second sliding window.`,
                'Requests exceeding the limit receive a 429 Too Many Requests response.',
                'Counters are stored in-memory and reset when the gateway restarts.',
                'Changes take effect immediately without restarting the gateway.',
              ].map((line, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono text-[10px] text-sky-900/30 mt-0.5 flex-shrink-0">—</span>
                  <p className="font-mono text-[11px] text-slate-500 leading-relaxed">{line}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

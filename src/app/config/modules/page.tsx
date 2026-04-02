'use client'

import { useState, useEffect, useCallback } from 'react'
import { getModules, updateModule } from '@/lib/api'
import type { GatewayModule } from '@/types/api'
import { cn } from '@/lib/utils'

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none',
        enabled ? 'border-sky-500/60 bg-sky-500/20' : 'border-[#0f2040] bg-[#030712]',
        disabled && 'cursor-not-allowed opacity-40',
      )}
      style={enabled && !disabled ? { boxShadow: '0 0 8px rgba(56,189,248,0.3)' } : undefined}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-3.5 w-3.5 translate-y-[-1px] rounded-full transition-transform duration-200',
          enabled ? 'translate-x-4 bg-sky-400' : 'translate-x-0.5 bg-sky-900/40',
        )}
        style={enabled && !disabled ? { boxShadow: '0 0 6px rgba(56,189,248,0.6)' } : undefined}
      />
    </button>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: GatewayModule['status'] }) {
  const styles: Record<GatewayModule['status'], string> = {
    healthy:  'text-sky-300 bg-sky-500/10 border-sky-500/20',
    error:    'text-pink-300 bg-pink-500/10 border-pink-500/20',
    disabled: 'text-slate-500 bg-slate-800/20 border-slate-700/20',
    loading:  'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
  }
  const dots: Record<GatewayModule['status'], string> = {
    healthy:  'bg-sky-400',
    error:    'bg-pink-400',
    disabled: 'bg-slate-600',
    loading:  'bg-indigo-400 animate-pulse',
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest', styles[status])}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dots[status])} />
      {status}
    </span>
  )
}

// ─── Module card ──────────────────────────────────────────────────────────────

function ModuleCard({
  module,
  onToggle,
}: {
  module: GatewayModule
  onToggle: (id: string, enabled: boolean) => void
}) {
  const isDisabled = !module.enabled

  return (
    <div
      className={cn(
        'fade-up relative overflow-hidden rounded border bg-[#070d19] p-5 transition-all duration-300',
        isDisabled ? 'border-[#0f2040] opacity-70' : 'border-[#0f2040] hover:border-sky-900/60',
      )}
      style={{
        boxShadow: isDisabled
          ? 'none'
          : '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.04)',
      }}
    >
      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(56,189,248,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.05) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Disabled overlay */}
      {isDisabled && (
        <div className="absolute inset-0 flex items-end justify-end p-3 pointer-events-none">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-700">
            module not active
          </span>
        </div>
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className={cn(
              'font-mono text-lg font-bold uppercase tracking-wider',
              isDisabled ? 'text-slate-600' : 'text-slate-100',
            )}>
              {module.name}
            </h3>
            <p className="font-mono text-[10px] text-sky-900/50 mt-0.5 truncate max-w-[160px]">
              {module.route}
            </p>
          </div>
          <Toggle
            enabled={module.enabled}
            onChange={v => onToggle(module.id, v)}
          />
        </div>

        {/* Status */}
        <div className="mb-4">
          <StatusBadge status={module.status} />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded border border-[#0f2040] bg-[#040b14] px-3 py-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-sky-900/40 mb-1">
              Timeout
            </p>
            <p className={cn('font-mono text-sm font-semibold', isDisabled ? 'text-slate-600' : 'text-slate-300')}>
              {module.timeout_ms}ms
            </p>
          </div>
          <div className="rounded border border-[#0f2040] bg-[#040b14] px-3 py-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-sky-900/40 mb-1">
              Config
            </p>
            <p className={cn('font-mono text-sm font-semibold', isDisabled ? 'text-slate-600' : 'text-slate-300')}>
              {module.config_mode}
            </p>
          </div>
        </div>

        {/* Version */}
        {module.version && (
          <p className="mt-3 font-mono text-[10px] text-sky-900/30">
            v{module.version}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ModulesPage() {
  const [modules, setModules] = useState<GatewayModule[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getModules()
      setModules(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleToggle(id: string, enabled: boolean) {
    // Optimistic update
    setModules(ms => ms.map(m =>
      m.id === id
        ? { ...m, enabled, status: enabled ? 'loading' : 'disabled' }
        : m
    ))

    try {
      await updateModule(id, { enabled })
      // Simulate status resolution
      setTimeout(() => {
        setModules(ms => ms.map(m =>
          m.id === id
            ? { ...m, status: enabled ? 'healthy' : 'disabled' }
            : m
        ))
      }, 800)
    } catch {
      // Revert on error
      setModules(ms => ms.map(m =>
        m.id === id ? { ...m, enabled: !enabled, status: !enabled ? 'healthy' : 'disabled' } : m
      ))
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] grid-bg p-8">

      {/* Header */}
      <div className="fade-up mb-8">
        <h1 className="font-mono text-lg font-bold text-sky-300 neon-sky uppercase tracking-widest">
          Modules
        </h1>
        <p className="font-mono text-[11px] text-sky-900/60 mt-1">
          WASM security modules
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="h-52 rounded border border-[#0f2040] bg-[#070d19] animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod, i) => (
            <div key={mod.id} style={{ animationDelay: `${i * 0.08}s` }}>
              <ModuleCard module={mod} onToggle={handleToggle} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

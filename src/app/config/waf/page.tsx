'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { getWafRules, saveWafRules } from '@/lib/api'
import type { WafRule } from '@/types/api'
import { cn } from '@/lib/utils'

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none',
        enabled ? 'border-sky-500/60 bg-sky-500/20' : 'border-[#0f2040] bg-[#030712]',
      )}
      style={enabled ? { boxShadow: '0 0 8px rgba(56,189,248,0.3)' } : undefined}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-3.5 w-3.5 translate-y-[-1px] rounded-full transition-transform duration-200',
          enabled ? 'translate-x-4 bg-sky-400' : 'translate-x-0.5 bg-sky-900/40',
        )}
        style={enabled ? { boxShadow: '0 0 6px rgba(56,189,248,0.6)' } : undefined}
      />
    </button>
  )
}

// ─── Type + Action labels ─────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: WafRule['type']; label: string }[] = [
  { value: 'path_contains', label: 'Path Contains' },
  { value: 'path_prefix',   label: 'Path Prefix' },
  { value: 'regex',         label: 'Regex' },
]

const ACTION_OPTIONS: { value: WafRule['action']; label: string }[] = [
  { value: 'block', label: 'Block' },
  { value: 'allow', label: 'Allow' },
]

// ─── Row component ────────────────────────────────────────────────────────────

function RuleRow({
  rule,
  onToggle,
  onUpdate,
  onDelete,
}: {
  rule: WafRule
  onToggle: (id: string, enabled: boolean) => void
  onUpdate: (id: string, patch: Partial<WafRule>) => void
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState<WafRule>(rule)

  // Sync draft when rule changes from outside
  useEffect(() => { setDraft(rule) }, [rule])

  const isDirty =
    draft.description !== rule.description ||
    draft.type !== rule.type ||
    draft.action !== rule.action ||
    draft.values.join('\n') !== rule.values.join('\n')

  function commitEdit() {
    onUpdate(rule.id, {
      description: draft.description,
      type: draft.type,
      action: draft.action,
      values: draft.values,
    })
    setExpanded(false)
  }

  function cancelEdit() {
    setDraft(rule)
    setExpanded(false)
  }

  return (
    <div className="border-b border-[#0f2040] last:border-b-0">
      {/* Main row */}
      <div
        className="flex items-center gap-4 px-4 py-3 hover:bg-sky-950/10 transition-colors cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Toggle — stop propagation so click doesn't expand */}
        <div onClick={e => { e.stopPropagation(); onToggle(rule.id, !rule.enabled) }}>
          <Toggle enabled={rule.enabled} onChange={v => onToggle(rule.id, v)} />
        </div>

        {/* ID */}
        <span className="font-mono text-[11px] text-sky-400/70 w-36 flex-shrink-0 truncate">
          {rule.id}
        </span>

        {/* Type badge */}
        <span className="font-mono text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded px-2 py-0.5 w-32 flex-shrink-0 text-center">
          {rule.type}
        </span>

        {/* Description */}
        <span className="font-mono text-[11px] text-slate-400 flex-1 truncate">
          {rule.description}
        </span>

        {/* Values preview */}
        <span className="font-mono text-[10px] text-slate-600 w-40 flex-shrink-0 truncate hidden md:block">
          {rule.values.slice(0, 2).join(', ')}{rule.values.length > 2 ? ` +${rule.values.length - 2}` : ''}
        </span>

        {/* Action badge */}
        <span
          className={cn(
            'font-mono text-[10px] rounded px-2 py-0.5 w-14 flex-shrink-0 text-center',
            rule.action === 'block'
              ? 'text-pink-300 bg-pink-500/10 border border-pink-500/20'
              : 'text-sky-300 bg-sky-500/10 border border-sky-500/20',
          )}
        >
          {rule.action}
        </span>

        {/* Delete */}
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onDelete(rule.id) }}
          className="text-slate-700 hover:text-pink-400 transition-colors flex-shrink-0"
          title="Delete rule"
        >
          <Trash2 size={13} />
        </button>

        {/* Expand chevron */}
        <span className="text-sky-900/40 flex-shrink-0">
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 bg-[#040b14] border-t border-[#0f2040]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {/* Description */}
            <div className="md:col-span-2">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-sky-900/60 mb-1">
                Description
              </label>
              <input
                type="text"
                value={draft.description}
                onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                className="w-full rounded border border-[#0f2040] bg-[#030712] px-3 py-2 font-mono text-sm text-slate-300 focus:border-sky-800/60 focus:outline-none"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-sky-900/60 mb-1">
                Type
              </label>
              <select
                value={draft.type}
                onChange={e => setDraft(d => ({ ...d, type: e.target.value as WafRule['type'] }))}
                className="w-full rounded border border-[#0f2040] bg-[#030712] px-3 py-2 font-mono text-sm text-slate-300 focus:border-sky-800/60 focus:outline-none"
              >
                {TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Action */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-sky-900/60 mb-1">
                Action
              </label>
              <select
                value={draft.action}
                onChange={e => setDraft(d => ({ ...d, action: e.target.value as WafRule['action'] }))}
                className="w-full rounded border border-[#0f2040] bg-[#030712] px-3 py-2 font-mono text-sm text-slate-300 focus:border-sky-800/60 focus:outline-none"
              >
                {ACTION_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Values */}
            <div className="md:col-span-2">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-sky-900/60 mb-1">
                Values (one per line)
              </label>
              <textarea
                rows={4}
                value={draft.values.join('\n')}
                onChange={e => setDraft(d => ({
                  ...d,
                  values: e.target.value.split('\n').filter(v => v.trim() !== ''),
                }))}
                className="w-full rounded border border-[#0f2040] bg-[#030712] px-3 py-2 font-mono text-sm text-slate-300 focus:border-sky-800/60 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={commitEdit}
              disabled={!isDirty}
              className={cn(
                'rounded border px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-all duration-150',
                isDirty
                  ? 'border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20'
                  : 'border-[#0f2040] bg-transparent text-sky-900/30 cursor-not-allowed',
              )}
            >
              Apply
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded border border-[#0f2040] bg-transparent px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-sky-900/40 hover:text-sky-700 transition-all duration-150"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WafPage() {
  const [rules, setRules] = useState<WafRule[]>([])
  const [savedRules, setSavedRules] = useState<WafRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const hasChanges = JSON.stringify(rules) !== JSON.stringify(savedRules)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getWafRules()
      setRules(data)
      setSavedRules(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function handleToggle(id: string, enabled: boolean) {
    setRules(rs => rs.map(r => r.id === id ? { ...r, enabled } : r))
  }

  function handleUpdate(id: string, patch: Partial<WafRule>) {
    setRules(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r))
  }

  function handleDelete(id: string) {
    setRules(rs => rs.filter(r => r.id !== id))
  }

  function handleAdd() {
    const newRule: WafRule = {
      id: `rule-${Date.now()}`,
      description: 'New rule',
      enabled: true,
      type: 'path_contains',
      values: [],
      action: 'block',
    }
    setRules(rs => [...rs, newRule])
  }

  async function handleSave() {
    setSaving(true)
    try {
      await saveWafRules(rules)
      setSavedRules(rules)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] grid-bg p-8">

      {/* Header */}
      <div className="fade-up mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-mono text-lg font-bold text-sky-300 neon-sky uppercase tracking-widest">
            WAF Rules
          </h1>
          <p className="font-mono text-[11px] text-sky-900/60 mt-1">
            hot-reloaded every 60s
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded border border-yellow-500/40 bg-yellow-500/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-yellow-300 hover:bg-yellow-500/20 transition-all duration-150 disabled:opacity-50"
            >
              {saving ? 'Saving…' : '● Save Changes'}
            </button>
          )}
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 rounded border border-sky-500/40 bg-sky-500/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-sky-300 hover:bg-sky-500/20 transition-all duration-150"
          >
            <Plus size={12} />
            Add Rule
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="fade-up rounded border border-[#0f2040] bg-[#070d19] overflow-hidden" style={{ animationDelay: '0.1s' }}>

        {/* Table header */}
        <div className="flex items-center gap-4 px-4 py-2 border-b border-[#0f2040] bg-[#040b14]">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-900/50 w-9 flex-shrink-0">On</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-900/50 w-36 flex-shrink-0">ID</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-900/50 w-32 flex-shrink-0">Type</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-900/50 flex-1">Description</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-900/50 w-40 flex-shrink-0 hidden md:block">Values</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sky-900/50 w-14 flex-shrink-0">Action</span>
          <span className="w-4 flex-shrink-0" />
          <span className="w-4 flex-shrink-0" />
        </div>

        {loading ? (
          <div className="px-4 py-12 text-center">
            <span className="font-mono text-[11px] text-sky-900/40 animate-pulse">Loading rules…</span>
          </div>
        ) : rules.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="font-mono text-[11px] text-sky-900/40">No WAF rules configured.</p>
            <p className="font-mono text-[10px] text-sky-900/25 mt-1">Click "Add Rule" to get started.</p>
          </div>
        ) : (
          rules.map(rule => (
            <RuleRow
              key={rule.id}
              rule={rule}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}

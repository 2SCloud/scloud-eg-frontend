'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { login, isAuthenticated } from '@/lib/auth'
import { cn } from '@/lib/utils'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard')
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      const from = searchParams.get('from') ?? '/dashboard'
      router.replace(from)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#030712] grid-bg scanlines"
    >
      {/* Neon glow backdrop */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(56,189,248,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-sm px-6">

        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ backgroundColor: '#38bdf8' }}
              />
              <span
                className="relative inline-flex h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: '#38bdf8', boxShadow: '0 0 10px rgba(56,189,248,0.9)' }}
              />
            </span>
            <span
              className="font-mono text-base font-bold uppercase tracking-[0.3em] text-sky-300"
              style={{ textShadow: '0 0 20px rgba(56,189,248,0.5)' }}
            >
              2SCLOUD
            </span>
          </div>
          <p className="font-mono text-[11px] text-sky-900/50 uppercase tracking-[0.25em]">
            edge-gateway / admin
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded border border-[#0f2040] bg-[#070d19] p-7"
          style={{ boxShadow: '0 0 40px rgba(56,189,248,0.04), 0 4px 24px rgba(0,0,0,0.6)' }}
        >
          {/* Top neon line */}
          <div
            className="absolute top-0 left-0 right-0 h-px rounded-t"
            style={{
              background: 'linear-gradient(to right, transparent, #38bdf8 50%, transparent)',
              boxShadow: '0 0 6px rgba(56,189,248,0.4)',
            }}
          />

          <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-sky-900/60 mb-6 text-center">
            authenticate
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-sky-900/50 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
                className={cn(
                  'w-full rounded border bg-[#030712] px-3 py-2.5 font-mono text-sm text-slate-300',
                  'border-[#0f2040] focus:border-sky-800/60 focus:outline-none',
                  'transition-colors duration-150',
                )}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-sky-900/50 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className={cn(
                  'w-full rounded border bg-[#030712] px-3 py-2.5 font-mono text-sm text-slate-300',
                  'border-[#0f2040] focus:border-sky-800/60 focus:outline-none',
                  'transition-colors duration-150',
                )}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded border border-pink-500/20 bg-pink-500/10 px-3 py-2">
                <p className="font-mono text-[11px] text-pink-300">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'mt-1 w-full rounded border py-2.5 font-mono text-[11px] uppercase tracking-widest transition-all duration-150',
                loading
                  ? 'border-sky-900/30 bg-sky-900/10 text-sky-900/40 cursor-not-allowed'
                  : 'border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20',
              )}
              style={!loading ? { boxShadow: '0 0 12px rgba(56,189,248,0.06)' } : undefined}
            >
              {loading ? (
                <span className="animate-pulse">authenticating…</span>
              ) : (
                'access gateway'
              )}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center font-mono text-[10px] text-sky-900/25 uppercase tracking-widest">
          admin access only
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

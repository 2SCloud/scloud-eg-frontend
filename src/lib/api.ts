// ─── Existing types ───────────────────────────────────────────────────────────

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d'

export interface RequestMetrics {
  timestamp: string
  requestsPerSec: number
  latencyP50: number
  latencyP95: number
  latencyP99: number
}

export interface ErrorMetrics {
  timestamp: string
  errorRate: number
  status2xx: number
  status3xx: number
  status4xx: number
  status5xx: number
}

export interface RouteMetrics {
  route: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  requestCount: number
  avgLatency: number
  errorRate: number
  p99Latency: number
}

export interface GatewayStats {
  totalRequests: number
  totalRequestsDelta: number
  avgLatency: number
  avgLatencyDelta: number
  errorRate: number
  errorRateDelta: number
  activeRoutes: number
  uptime: number
}

export interface StatusCodeDistribution {
  code: string
  count: number
  percentage: number
}

export interface DashboardData {
  stats: GatewayStats
  requestMetrics: RequestMetrics[]
  errorMetrics: ErrorMetrics[]
  topRoutes: RouteMetrics[]
  statusDistribution: StatusCodeDistribution[]
}

// ─── New types ────────────────────────────────────────────────────────────────

export interface WafRule {
  id: string
  description: string
  enabled: boolean
  type: 'path_contains' | 'path_prefix' | 'regex'
  values: string[]
  action: 'block' | 'allow'
}

export interface GatewayModule {
  id: string
  name: string
  enabled: boolean
  status: 'healthy' | 'error' | 'disabled' | 'loading'
  route: string
  timeout_ms: number
  config_mode: 'init' | 'inline'
  version?: string
}

export interface RateLimitConfig {
  max_requests: number
  window_seconds: number
}

export interface RequestLog {
  id: string
  timestamp: string
  ip: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
  path: string
  decision: 'allow' | 'block'
  reason: string
  status_code: number
  latency_ms: number
}

// ─── Authenticated fetch helper ───────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('admin_token')
}

async function apiFetch(path: string, opts: RequestInit = {}): Promise<Response> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL is not set')

  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers as Record<string, string> ?? {}),
  }

  const res = await fetch(`${apiUrl}${path}`, {
    ...opts,
    headers,
    cache: 'no-store',
  })

  if (res.status === 401) {
    localStorage.removeItem('admin_token')
    document.cookie = 'admin_token=; path=/; max-age=0'
    window.location.href = '/login'
    throw new Error('Session expired')
  }

  return res
}

async function useMockFallback<T>(
  apiFn: () => Promise<T>,
  mockFn: () => Promise<T>,
): Promise<T> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (apiUrl) {
    return apiFn()
  }
  return mockFn()
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function getDashboardData(range: TimeRange): Promise<DashboardData> {
  return useMockFallback(
    async () => {
      const res = await apiFetch(`/api/metrics?range=${range}`)
      if (!res.ok) throw new Error(`Gateway API error: ${res.status}`)
      return res.json()
    },
    async () => {
      const { generateDashboardData } = await import('@/lib/mockData')
      return generateDashboardData(range)
    },
  )
}

export async function getWafRules(): Promise<WafRule[]> {
  return useMockFallback(
    async () => {
      const res = await apiFetch('/api/waf/rules')
      if (!res.ok) throw new Error(`Gateway API error: ${res.status}`)
      return res.json()
    },
    async () => {
      const { generateWafRules } = await import('@/lib/mockData')
      return generateWafRules()
    },
  )
}

export async function saveWafRules(rules: WafRule[]): Promise<void> {
  return useMockFallback(
    async () => {
      const res = await apiFetch('/api/waf/rules', {
        method: 'PUT',
        body: JSON.stringify(rules),
      })
      if (!res.ok) throw new Error(`Gateway API error: ${res.status}`)
    },
    async () => { /* no-op mock */ },
  )
}

export async function getModules(): Promise<GatewayModule[]> {
  return useMockFallback(
    async () => {
      const res = await apiFetch('/api/modules')
      if (!res.ok) throw new Error(`Gateway API error: ${res.status}`)
      return res.json()
    },
    async () => {
      const { generateModules } = await import('@/lib/mockData')
      return generateModules()
    },
  )
}

export async function updateModule(id: string, patch: Partial<GatewayModule>): Promise<void> {
  return useMockFallback(
    async () => {
      const res = await apiFetch(`/api/modules/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error(`Gateway API error: ${res.status}`)
    },
    async () => { /* no-op mock */ },
  )
}

export async function getRateLimitConfig(): Promise<RateLimitConfig> {
  return useMockFallback(
    async () => {
      const res = await apiFetch('/api/rate-limit')
      if (!res.ok) throw new Error(`Gateway API error: ${res.status}`)
      return res.json()
    },
    async () => {
      const { generateRateLimitConfig } = await import('@/lib/mockData')
      return generateRateLimitConfig()
    },
  )
}

export async function saveRateLimitConfig(cfg: RateLimitConfig): Promise<void> {
  return useMockFallback(
    async () => {
      const res = await apiFetch('/api/rate-limit', {
        method: 'PUT',
        body: JSON.stringify(cfg),
      })
      if (!res.ok) throw new Error(`Gateway API error: ${res.status}`)
    },
    async () => { /* no-op mock */ },
  )
}

export async function getLogs(
  filter: 'all' | 'block' | 'allow',
  limit: number,
): Promise<RequestLog[]> {
  return useMockFallback(
    async () => {
      const res = await apiFetch(`/api/logs?filter=${filter}&limit=${limit}`)
      if (!res.ok) throw new Error(`Gateway API error: ${res.status}`)
      return res.json()
    },
    async () => {
      const { generateLogs } = await import('@/lib/mockData')
      return generateLogs(filter, limit)
    },
  )
}

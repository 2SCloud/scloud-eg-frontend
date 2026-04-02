import type {
  DashboardData, RequestMetrics, ErrorMetrics,
  RouteMetrics, StatusCodeDistribution, GatewayStats, TimeRange,
  WafRule, GatewayModule, RateLimitConfig, RequestLog,
} from '@/lib/api'

function rand(min: number, max: number) { return Math.random() * (max - min) + min }
function randInt(min: number, max: number) { return Math.floor(rand(min, max)) }
function noise(base: number, pct = 0.15) { return base * (1 + (Math.random() - 0.5) * 2 * pct) }

const RANGE_CONFIG: Record<TimeRange, { points: number; intervalMs: number }> = {
  '1h':  { points: 60, intervalMs: 60_000 },
  '6h':  { points: 72, intervalMs: 300_000 },
  '24h': { points: 96, intervalMs: 900_000 },
  '7d':  { points: 84, intervalMs: 7_200_000 },
  '30d': { points: 90, intervalMs: 28_800_000 },
}

function timestamps(range: TimeRange) {
  const { points, intervalMs } = RANGE_CONFIG[range]
  const now = Date.now()
  return Array.from({ length: points }, (_, i) =>
    new Date(now - (points - 1 - i) * intervalMs)
  )
}

export function generateRequestMetrics(range: TimeRange): RequestMetrics[] {
  const ts = timestamps(range)
  let base = 120
  return ts.map((t, i) => {
    const spike = i > 20 && i < 30 ? 2.5 : 1
    const rps = noise(base * spike)
    base = base * 0.98 + rps * 0.02
    const lat = 45 + (rps / base) * 20
    return {
      timestamp: t.toISOString(),
      requestsPerSec: Math.round(rps),
      latencyP50: Math.round(noise(lat)),
      latencyP95: Math.round(noise(lat * 2.1)),
      latencyP99: Math.round(noise(lat * 3.8)),
    }
  })
}

export function generateErrorMetrics(range: TimeRange): ErrorMetrics[] {
  return timestamps(range).map((t, i) => {
    const spike = i > 40 && i < 50 ? 3 : 1
    const s2xx = randInt(200, 500) * spike
    const s3xx = randInt(5, 20)
    const s4xx = randInt(10, 40) * spike
    const s5xx = randInt(2, 15) * spike
    const total = s2xx + s3xx + s4xx + s5xx
    return {
      timestamp: t.toISOString(),
      errorRate: +((s4xx + s5xx) / total * 100).toFixed(2),
      status2xx: s2xx, status3xx: s3xx, status4xx: s4xx, status5xx: s5xx,
    }
  })
}

const BASE_ROUTES: RouteMetrics[] = [
  { route: '/api/v1/auth/login',       method: 'POST',   requestCount: 45820, avgLatency: 112, errorRate: 2.1, p99Latency: 380 },
  { route: '/api/v1/users/:id',        method: 'GET',    requestCount: 38410, avgLatency: 34,  errorRate: 0.4, p99Latency: 120 },
  { route: '/api/v1/products',         method: 'GET',    requestCount: 31240, avgLatency: 67,  errorRate: 0.8, p99Latency: 210 },
  { route: '/api/v1/orders',           method: 'POST',   requestCount: 22180, avgLatency: 245, errorRate: 3.2, p99Latency: 820 },
  { route: '/api/v1/payments/process', method: 'POST',   requestCount: 18920, avgLatency: 534, errorRate: 1.9, p99Latency: 1240 },
  { route: '/api/v1/webhooks/stripe',  method: 'POST',   requestCount: 14350, avgLatency: 89,  errorRate: 0.2, p99Latency: 290 },
  { route: '/api/v1/search',           method: 'GET',    requestCount: 12870, avgLatency: 178, errorRate: 1.1, p99Latency: 560 },
  { route: '/api/v1/notifications',    method: 'GET',    requestCount: 9430,  avgLatency: 45,  errorRate: 0.3, p99Latency: 145 },
  { route: '/api/v1/files/upload',     method: 'PUT',    requestCount: 6210,  avgLatency: 890, errorRate: 4.7, p99Latency: 2100 },
  { route: '/api/v1/analytics/export', method: 'GET',    requestCount: 3140,  avgLatency: 1240,errorRate: 2.8, p99Latency: 3800 },
]

export function generateTopRoutes(): RouteMetrics[] {
  return BASE_ROUTES.map(r => ({
    ...r,
    requestCount: randInt(r.requestCount * 0.9, r.requestCount * 1.1),
    avgLatency: Math.round(noise(r.avgLatency, 0.1)),
    errorRate: +noise(r.errorRate, 0.2).toFixed(1),
  }))
}

export function generateStatusDistribution(): StatusCodeDistribution[] {
  const raw = [
    { code: '2xx', count: randInt(85000, 95000) },
    { code: '3xx', count: randInt(2000, 4000) },
    { code: '4xx', count: randInt(3000, 6000) },
    { code: '5xx', count: randInt(500, 1500) },
  ]
  const total = raw.reduce((s, r) => s + r.count, 0)
  return raw.map(r => ({ ...r, percentage: +(r.count / total * 100).toFixed(1) }))
}

export function generateGatewayStats(): GatewayStats {
  return {
    totalRequests: randInt(195000, 215000),
    totalRequestsDelta: +rand(-5, 18).toFixed(1),
    avgLatency: randInt(62, 88),
    avgLatencyDelta: +rand(-12, 8).toFixed(1),
    errorRate: +rand(1.2, 3.8).toFixed(2),
    errorRateDelta: +rand(-0.8, 1.2).toFixed(2),
    activeRoutes: randInt(28, 36),
    uptime: randInt(86400 * 30, 86400 * 180),
  }
}

export function generateDashboardData(range: TimeRange = '24h'): DashboardData {
  return {
    stats: generateGatewayStats(),
    requestMetrics: generateRequestMetrics(range),
    errorMetrics: generateErrorMetrics(range),
    topRoutes: generateTopRoutes(),
    statusDistribution: generateStatusDistribution(),
  }
}

// ─── WAF rules ────────────────────────────────────────────────────────────────

export function generateWafRules(): WafRule[] {
  return [
    {
      id: 'path-traversal',
      description: 'Block path traversal attempts',
      enabled: true,
      type: 'path_contains',
      values: ['../', '..\\', '%2e%2e%2f', '%2e%2e/'],
      action: 'block',
    },
    {
      id: 'admin-path',
      description: 'Block access to admin endpoints',
      enabled: true,
      type: 'path_prefix',
      values: ['/admin', '/_admin', '/wp-admin', '/phpmyadmin'],
      action: 'block',
    },
    {
      id: 'xss-basic',
      description: 'Block basic XSS patterns in path',
      enabled: true,
      type: 'regex',
      values: ['<script', 'javascript:', 'onerror=', 'onload='],
      action: 'block',
    },
    {
      id: 'sql-injection-basic',
      description: 'Block common SQL injection patterns',
      enabled: false,
      type: 'path_contains',
      values: ["' OR '", 'UNION SELECT', 'DROP TABLE', '--'],
      action: 'block',
    },
  ]
}

// ─── Modules ──────────────────────────────────────────────────────────────────

export function generateModules(): GatewayModule[] {
  return [
    {
      id: 'waf',
      name: 'WAF',
      enabled: true,
      status: 'healthy',
      route: '/wasm/waf.wasm',
      timeout_ms: 50,
      config_mode: 'init',
      version: '1.2.0',
    },
    {
      id: 'ratelimit',
      name: 'Rate Limiter',
      enabled: true,
      status: 'healthy',
      route: '/wasm/ratelimit.wasm',
      timeout_ms: 10,
      config_mode: 'inline',
      version: '1.0.3',
    },
    {
      id: 'firewall',
      name: 'Firewall',
      enabled: false,
      status: 'disabled',
      route: '/wasm/firewall.wasm',
      timeout_ms: 25,
      config_mode: 'init',
      version: '0.9.1',
    },
  ]
}

// ─── Rate limit ───────────────────────────────────────────────────────────────

export function generateRateLimitConfig(): RateLimitConfig {
  return {
    max_requests: 100,
    window_seconds: 30,
  }
}

// ─── Logs ─────────────────────────────────────────────────────────────────────

const BLOCKED_PATHS = [
  { path: '/../etc/passwd', reason: 'path-traversal' },
  { path: '/../../windows/system32', reason: 'path-traversal' },
  { path: '/admin/dashboard', reason: 'admin-path' },
  { path: '/wp-admin/login', reason: 'admin-path' },
  { path: '/_admin/config', reason: 'admin-path' },
  { path: '/api/v1/users?id=1 UNION SELECT', reason: 'sql-injection-basic' },
  { path: '/search?q=<script>alert(1)</script>', reason: 'xss-basic' },
  { path: '/api/data?filter=1%27+OR+%271%27=%271', reason: 'sql-injection-basic' },
]

const ALLOWED_PATHS = [
  { path: '/api/v1/auth/login', reason: 'allowed' },
  { path: '/api/v1/users/42', reason: 'allowed' },
  { path: '/api/v1/products', reason: 'allowed' },
  { path: '/api/v1/orders', reason: 'allowed' },
  { path: '/api/v1/payments/process', reason: 'allowed' },
  { path: '/api/v1/search?q=laptop', reason: 'allowed' },
  { path: '/api/v1/notifications', reason: 'allowed' },
  { path: '/api/v1/files/upload', reason: 'allowed' },
  { path: '/api/v1/webhooks/stripe', reason: 'allowed' },
  { path: '/health', reason: 'allowed' },
]

const IPS = [
  '203.0.113.42', '198.51.100.7', '192.0.2.155', '10.0.0.23',
  '172.16.0.88', '185.220.101.45', '91.108.4.12', '45.33.32.156',
  '104.244.42.129', '162.158.78.90',
]

const METHODS: RequestLog['method'][] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

function randomIp() { return IPS[randInt(0, IPS.length)] }
function randomMethod(): RequestLog['method'] { return METHODS[randInt(0, METHODS.length)] }

function generateLog(index: number, offsetMs: number): RequestLog {
  const isBlock = Math.random() < 0.3
  const entry = isBlock
    ? BLOCKED_PATHS[randInt(0, BLOCKED_PATHS.length)]
    : ALLOWED_PATHS[randInt(0, ALLOWED_PATHS.length)]

  const statusCode = isBlock
    ? 403
    : [200, 200, 200, 201, 204, 301, 400, 404, 500][randInt(0, 9)]

  const latency = isBlock
    ? randInt(2, 15)
    : randInt(10, 850)

  return {
    id: `log-${Date.now()}-${index}`,
    timestamp: new Date(Date.now() - offsetMs).toISOString(),
    ip: randomIp(),
    method: randomMethod(),
    path: entry.path,
    decision: isBlock ? 'block' : 'allow',
    reason: entry.reason,
    status_code: statusCode,
    latency_ms: latency,
  }
}

export function generateLogs(
  filter: 'all' | 'block' | 'allow',
  limit: number,
): RequestLog[] {
  // Generate ~50 base logs spread over last 10 minutes
  const total = 50
  const logs: RequestLog[] = Array.from({ length: total }, (_, i) =>
    generateLog(i, randInt(0, 600_000))
  )

  // Sort newest first
  const sorted = logs.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const filtered = filter === 'all'
    ? sorted
    : sorted.filter(l => l.decision === filter)

  return filtered.slice(0, limit)
}

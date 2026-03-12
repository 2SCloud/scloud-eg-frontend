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

// Re-export all types from lib/api so both @/types/api and @/lib/api resolve correctly
export type {
  TimeRange,
  RequestMetrics,
  ErrorMetrics,
  RouteMetrics,
  GatewayStats,
  StatusCodeDistribution,
  DashboardData,
  WafRule,
  GatewayModule,
  RateLimitConfig,
  RequestLog,
} from '@/lib/api'

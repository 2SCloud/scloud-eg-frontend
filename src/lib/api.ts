import type { DashboardData, TimeRange } from '@/types/api'
import { generateDashboardData } from './mockData'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { next: { revalidate: 30 } })
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  return res.json()
}

export async function getDashboardData(range: TimeRange = '24h'): Promise<DashboardData> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 250))
    return generateDashboardData(range)
  }
  return apiFetch<DashboardData>('/metrics/dashboard', { range })
}
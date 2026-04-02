const TOKEN_KEY = 'admin_token'
const COOKIE_NAME = 'admin_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string, ttlHours = 12): void {
  localStorage.setItem(TOKEN_KEY, token)
  const maxAge = ttlHours * 3600
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${maxAge}; SameSite=Strict`
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export async function login(username: string, password: string): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL is not set')

  const res = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Login failed' }))
    throw new Error(err.error ?? 'Login failed')
  }

  const data = await res.json()
  setToken(data.token, data.ttl_hours ?? 12)
}

export function logout(): void {
  clearToken()
  window.location.href = '/login'
}

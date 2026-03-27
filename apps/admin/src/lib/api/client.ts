import { supabase } from "@/lib/supabase/client"

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || ""

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  let token = data.session?.access_token

  if (!token) {
    const { data: refreshed } = await supabase.auth.refreshSession()
    token = refreshed.session?.access_token
  }

  if (!token) throw new Error("Not authenticated")
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

async function request<T>(
  fn: string,
  method: string,
  params?: Record<string, string>,
  body?: unknown,
): Promise<T> {
  const headers = await getAuthHeaders()
  const url = new URL(`${FUNCTIONS_URL}/${fn}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || "Request failed")
  }

  return res.json()
}

export const api = {
  get: <T>(fn: string, params?: Record<string, string>) =>
    request<T>(fn, "GET", params),
  post: <T>(fn: string, body: unknown) =>
    request<T>(fn, "POST", undefined, body),
  put: <T>(fn: string, body: unknown) =>
    request<T>(fn, "PUT", undefined, body),
  delete: <T>(fn: string, body: unknown) =>
    request<T>(fn, "DELETE", undefined, body),
}

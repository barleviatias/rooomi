import { supabase } from '../supabase'

const THROTTLE_MS = 5000
const MAX_QUEUE = 20

let lastSent = 0
const queue: Array<Record<string, unknown>> = []
let flushTimer: ReturnType<typeof setTimeout> | null = null

function getUserId(): string | undefined {
  try {
    const stored = localStorage.getItem('roomi-auth')
    if (!stored) return undefined
    const parsed = JSON.parse(stored)
    return parsed?.state?.user?.id
  } catch {
    return undefined
  }
}

function scheduleFlush() {
  if (flushTimer) return
  const wait = Math.max(0, THROTTLE_MS - (Date.now() - lastSent))
  flushTimer = setTimeout(flush, wait)
}

async function flush() {
  flushTimer = null
  if (queue.length === 0) return
  lastSent = Date.now()

  const batch = queue.splice(0, MAX_QUEUE)
  try {
    await supabase.from('error_logs').insert(batch)
  } catch {
    // If reporting itself fails, don't cascade
  }
}

export function reportError(error: unknown, extra?: { componentStack?: string; context?: string }) {
  const err = error instanceof Error ? error : new Error(String(error))

  if (import.meta.env.DEV) {
    console.error('[error-reporting]', err, extra)
    return
  }

  const entry: Record<string, unknown> = {
    message: err.message,
    stack: err.stack?.slice(0, 4000),
    component_stack: extra?.componentStack?.slice(0, 4000),
    url: window.location.href,
    user_agent: navigator.userAgent,
    user_id: getUserId() || null,
    metadata: extra?.context ? { context: extra.context } : {},
  }

  queue.push(entry)
  if (queue.length > MAX_QUEUE) queue.shift()
  scheduleFlush()
}

export function setupGlobalErrorHandlers() {
  window.addEventListener('error', (event) => {
    reportError(event.error ?? event.message, { context: 'window.onerror' })
  })

  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, { context: 'unhandledrejection' })
  })
}

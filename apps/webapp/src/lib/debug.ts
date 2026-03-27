const DEBUG = import.meta.env.DEV

const styles = {
  service: 'color: #10b981; font-weight: bold',
  hook: 'color: #6366f1; font-weight: bold',
  error: 'color: #ef4444; font-weight: bold',
  data: 'color: #8b5cf6',
  info: 'color: #3b82f6',
}

export function logService(service: string, method: string, data?: unknown, error?: unknown) {
  if (!DEBUG) return
  if (error) {
    console.log(`%c[${service}] %c${method} FAILED`, styles.service, styles.error, error)
  } else {
    const summary = Array.isArray(data) ? `(${data.length} rows)` : data ? '(1 row)' : '(empty)'
    console.log(`%c[${service}] %c${method} %c${summary}`, styles.service, styles.info, styles.data, data)
  }
}

export function logHook(hook: string, event: string, data?: unknown) {
  if (!DEBUG) return
  console.log(`%c[${hook}] %c${event}`, styles.hook, styles.info, data ?? '')
}

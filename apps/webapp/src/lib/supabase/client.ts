import { createRoomiClient } from '@roomi/supabase'

type AppEnv = 'staging' | 'production'

const appEnv = (import.meta.env.VITE_APP_ENV || 'staging') as AppEnv

const envConfig: Record<AppEnv, { url: string; key: string }> = {
  staging: {
    url: import.meta.env.VITE_STAGING_SUPABASE_URL,
    key: import.meta.env.VITE_STAGING_SUPABASE_ANON_KEY,
  },
  production: {
    url: import.meta.env.VITE_PRODUCTION_SUPABASE_URL,
    key: import.meta.env.VITE_PRODUCTION_SUPABASE_ANON_KEY,
  },
}

const { url, key } = envConfig[appEnv]

export const supabase = createRoomiClient(url, key)
export const currentEnv = appEnv

if (import.meta.env.DEV) {
  const supabaseUrl = new URL(url)
  console.log(
    `%c[Roomi] %cSupabase connected → %c${appEnv} %c(${supabaseUrl.hostname})`,
    'color: #f43f5e; font-weight: bold',
    'color: inherit',
    'color: #10b981; font-weight: bold',
    'color: #6b7280'
  )
}

export type SupabaseClient = typeof supabase

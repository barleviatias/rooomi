import { createRoomiClient } from '@roomi/supabase'

const env = import.meta.env.VITE_APP_ENV === "production" ? "PRODUCTION" : "STAGING"

const supabaseUrl = import.meta.env[`VITE_${env}_SUPABASE_URL`]
const supabaseAnonKey = import.meta.env[`VITE_${env}_SUPABASE_ANON_KEY`]

export const supabase = createRoomiClient(supabaseUrl, supabaseAnonKey)
export const currentEnv = env.toLowerCase()

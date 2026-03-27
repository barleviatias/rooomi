/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: string
  readonly VITE_STAGING_SUPABASE_URL: string
  readonly VITE_STAGING_SUPABASE_ANON_KEY: string
  readonly VITE_PRODUCTION_SUPABASE_URL: string
  readonly VITE_PRODUCTION_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_FUNCTIONS_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

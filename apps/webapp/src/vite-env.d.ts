/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: 'staging' | 'production'
  readonly VITE_STAGING_SUPABASE_URL: string
  readonly VITE_STAGING_SUPABASE_ANON_KEY: string
  readonly VITE_PRODUCTION_SUPABASE_URL: string
  readonly VITE_PRODUCTION_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth-store'
import { logService } from '@/lib/debug'

const STALE_THRESHOLD_MS = 2 * 60 * 1000

export function useSessionRecovery() {
  const queryClient = useQueryClient()
  const hiddenAtRef = useRef<number | null>(null)
  const recoveringRef = useRef(false)

  useEffect(() => {
    async function recoverSession() {
      if (recoveringRef.current) return
      if (!useAuthStore.getState().isAuthenticated) return

      recoveringRef.current = true
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error || !data.session) {
          logService('session-recovery', 'session missing, attempting refresh')
          const { error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError) {
            logService('session-recovery', 'refresh failed', undefined, refreshError)
            return
          }
        }

        queryClient.invalidateQueries()
        logService('session-recovery', 'session recovered, queries invalidated')
      } catch (err) {
        logService('session-recovery', 'recoverSession', undefined, err)
      } finally {
        recoveringRef.current = false
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        hiddenAtRef.current = Date.now()
        return
      }

      const hiddenAt = hiddenAtRef.current
      hiddenAtRef.current = null

      if (hiddenAt && Date.now() - hiddenAt > STALE_THRESHOLD_MS) {
        recoverSession()
      }
    }

    function handleOnline() {
      if (!document.hidden) {
        recoverSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
    }
  }, [queryClient])
}

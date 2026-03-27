import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/store/auth-store"
import { Router } from "@/app/Router"
import { TooltipProvider } from "@/components/ui/tooltip"

export function App() {
  const [authReady, setAuthReady] = useState(false)
  const { logout } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        logout()
      }
      setAuthReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        logout()
      }
    })

    return () => subscription.unsubscribe()
  }, [logout])

  if (!authReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Router />
    </TooltipProvider>
  )
}

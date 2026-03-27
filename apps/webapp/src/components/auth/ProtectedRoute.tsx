import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/lib/store'
import { useUIStore } from '@/lib/store/ui-store'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const openLoginModal = useUIStore((s) => s.openLoginModal)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openLoginModal()
    }
  }, [isLoading, isAuthenticated, openLoginModal])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

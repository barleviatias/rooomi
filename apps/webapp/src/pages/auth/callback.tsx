import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/lib/store/auth-store'

export function AuthCallback() {
  const navigate = useNavigate()
  const isLoading = useAuthStore((s) => s.isLoading)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const clearPendingLike = useAuthStore((s) => s.clearPendingLike)

  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated) {
      const pendingPropertyId = clearPendingLike()
      if (pendingPropertyId) {
        navigate(`/?like=${pendingPropertyId}`)
      } else {
        navigate('/')
      }
    } else {
      navigate('/login')
    }
  }, [isLoading, isAuthenticated, navigate, clearPendingLike])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

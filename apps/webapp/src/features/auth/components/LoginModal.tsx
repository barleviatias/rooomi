import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input } from '@roomi/ui'
import { useAuthStore, useUIStore, useFeedStore } from '@/lib/store'
import { useProperty } from '@/hooks/useProperties'

type AuthMode = 'choose' | 'email-signin' | 'email-signup'

export function LoginModal() {
  const { t } = useTranslation()
  const { isLoginModalOpen, loginModalPropertyId, closeLoginModal } = useUIStore()
  const { loginWithGoogle, loginWithApple, loginWithEmail, signUpWithEmail, setPendingLike, isLoading } = useAuthStore()
  const { addLikedProperty } = useFeedStore()

  const [authMode, setAuthMode] = useState<AuthMode>('choose')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: property } = useProperty(loginModalPropertyId || '')

  const handleGoogleLogin = async () => {
    try {
      setError(null)
      if (loginModalPropertyId) {
        setPendingLike(loginModalPropertyId)
      }
      await loginWithGoogle()
    } catch {
      setError(t('auth.errors.googleFailed'))
    }
  }

  const handleAppleLogin = async () => {
    try {
      setError(null)
      if (loginModalPropertyId) {
        setPendingLike(loginModalPropertyId)
      }
      await loginWithApple()
    } catch {
      setError(t('auth.errors.appleFailed'))
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (loginModalPropertyId) {
        setPendingLike(loginModalPropertyId)
      }

      if (authMode === 'email-signup') {
        await signUpWithEmail(email, password, fullName)
      } else {
        await loginWithEmail(email, password)
      }

      if (loginModalPropertyId) {
        addLikedProperty(loginModalPropertyId)
      }

      closeLoginModal()
      resetForm()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
    }
  }

  const resetForm = () => {
    setAuthMode('choose')
    setEmail('')
    setPassword('')
    setFullName('')
    setError(null)
  }

  const handleClose = () => {
    closeLoginModal()
    resetForm()
  }

  if (!isLoginModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-background rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md mx-auto p-6 animate-in slide-in-from-bottom duration-300">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-3xl">💜</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              {authMode === 'choose' && t('auth.likeThisPlace')}
              {authMode === 'email-signin' && t('auth.signIn')}
              {authMode === 'email-signup' && t('auth.createAccount')}
            </h2>
            <p className="text-muted-foreground">
              {property?.host
                ? t('auth.signUpToConnect', { name: property.host.display_name || property.host.full_name })
                : t('auth.signUpToConnect', { name: 'the host' })}
            </p>
          </div>

          {property && authMode === 'choose' && (
            <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
              {property.photos?.[0] && (
                <img
                  src={property.photos[0].photo_url}
                  alt={property.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="text-start flex-1 min-w-0">
                <p className="font-medium truncate">{property.title}</p>
                <p className="text-sm text-muted-foreground">
                  {property.address_neighborhood}, {property.address_city}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {authMode === 'choose' && (
            <div className="space-y-3">
              <Button
                className="w-full h-12 gap-2"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {t('auth.continueWithGoogle')}
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 gap-2"
                onClick={handleAppleLogin}
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                {t('auth.continueWithApple')}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('common.or')}
                  </span>
                </div>
              </div>

              <Button
                variant="secondary"
                className="w-full h-12"
                onClick={() => setAuthMode('email-signup')}
                disabled={isLoading}
              >
                {t('auth.continueWithEmail')}
              </Button>
            </div>
          )}

          {(authMode === 'email-signin' || authMode === 'email-signup') && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {authMode === 'email-signup' && (
                <Input
                  type="text"
                  placeholder={t('auth.fullName')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-12"
                />
              )}
              <Input
                type="email"
                placeholder={t('auth.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
              <Input
                type="password"
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12"
              />
              <Button
                type="submit"
                className="w-full h-12"
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : (authMode === 'email-signup' ? t('auth.createAccount') : t('auth.signIn'))}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setAuthMode('choose')}
              >
                {t('common.back')}
              </Button>
            </form>
          )}

          {authMode === 'choose' && (
            <p className="text-sm text-muted-foreground">
              {t('auth.alreadyHaveAccount')}{' '}
              <button
                onClick={() => setAuthMode('email-signin')}
                className="text-primary font-medium hover:underline"
              >
                {t('auth.signIn')}
              </button>
            </p>
          )}

          {authMode === 'email-signin' && (
            <p className="text-sm text-muted-foreground">
              {t('auth.noAccount')}{' '}
              <button
                onClick={() => setAuthMode('email-signup')}
                className="text-primary font-medium hover:underline"
              >
                {t('auth.createAccount')}
              </button>
            </p>
          )}

          {authMode === 'email-signup' && (
            <p className="text-sm text-muted-foreground">
              {t('auth.alreadyHaveAccount')}{' '}
              <button
                onClick={() => setAuthMode('email-signin')}
                className="text-primary font-medium hover:underline"
              >
                {t('auth.signIn')}
              </button>
            </p>
          )}
        </div>

        <button
          onClick={handleClose}
          className="absolute top-4 end-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <span className="sr-only">Close</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

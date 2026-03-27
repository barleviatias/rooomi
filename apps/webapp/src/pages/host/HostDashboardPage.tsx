import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout'
import { Button, Card, Badge } from '@roomi/ui'
import { useAuthStore } from '@/lib/store'
import { useHostProperties } from '@/hooks/useProperties'

export function HostDashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  const { data: userProperties, isLoading } = useHostProperties()
  const properties = userProperties || []

  const totalViews = properties.reduce((sum: number, p: { view_count: number }) => sum + p.view_count, 0)
  const totalLikes = properties.reduce((sum: number, p: { like_count: number }) => sum + p.like_count, 0)
  const activeListings = properties.filter((p: { status: string }) => p.status === 'active').length

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen pb-20">
        <Header title={t('host.dashboard')} showAuth={false} />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] px-4 text-center">
          <p className="text-muted-foreground mb-4">{t('profile.loginToView')}</p>
          <Button onClick={() => navigate('/profile')}>
            {t('common.login')}
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <Header title={t('host.dashboard')} />
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <Header title={t('host.dashboard')} />

      <div className="p-4 space-y-6">
        <Card className="p-4">
          <h3 className="font-medium mb-4">{t('host.overview') || 'Overview'}</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{totalViews}</p>
              <p className="text-xs text-muted-foreground">{t('host.totalViews')}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">{totalLikes}</p>
              <p className="text-xs text-muted-foreground">{t('host.totalLikes')}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{activeListings}</p>
              <p className="text-xs text-muted-foreground">{t('host.activeListings')}</p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t('host.myListings')}</h3>
            <Button size="sm" onClick={() => navigate('/properties/new')}>
              + {t('host.createListing')}
            </Button>
          </div>

          {properties.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-muted-foreground mb-4">
                {t('host.noListings') || "You don't have any listings yet"}
              </p>
              <Button onClick={() => navigate('/properties/new')}>
                {t('host.createListing')}
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {properties.map((property: { id: string; title: string; address_neighborhood?: string; address_city: string; price_monthly: number; status: string; view_count: number; like_count: number; photos?: { photo_url: string }[] }) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="flex">
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={property.photos?.[0]?.photo_url || 'https://via.placeholder.com/150'}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div>
                        <h4 className="font-medium line-clamp-1">{property.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {property.address_neighborhood}, {property.address_city}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {'\u20AA'}{property.price_monthly.toLocaleString()}
                          </span>
                          <Badge
                            variant={property.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {property.status === 'active'
                              ? t('host.active') || 'Active'
                              : property.status}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/properties/${property.id}/edit`)}
                          >
                            {t('host.editListing')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-3 py-2 bg-muted/50 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {property.view_count} {t('host.views') || 'views'}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      {property.like_count} {t('host.likes') || 'likes'}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

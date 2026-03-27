import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AppShell } from '@/components/layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

import { FeedPage } from '@/pages/feed/FeedPage'

const MatchesPage = lazy(() => import('@/pages/matches/MatchesPage').then(m => ({ default: m.MatchesPage })))
const MessagesPage = lazy(() => import('@/pages/messages/MessagesPage').then(m => ({ default: m.MessagesPage })))
const ChatPage = lazy(() => import('@/pages/messages/ChatPage').then(m => ({ default: m.ChatPage })))
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage').then(m => ({ default: m.ProfilePage })))
const HostDashboardPage = lazy(() => import('@/pages/host/HostDashboardPage').then(m => ({ default: m.HostDashboardPage })))
const EditPropertyPage = lazy(() => import('@/pages/properties/EditPropertyPage').then(m => ({ default: m.EditPropertyPage })))
const CreateListingPage = lazy(() => import('@/pages/properties/CreateListingPage').then(m => ({ default: m.CreateListingPage })))
const AuthCallback = lazy(() => import('@/pages/auth/callback').then(m => ({ default: m.AuthCallback })))

const PageLoader = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
)

function PropertyRedirect() {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={`/?p=${id}`} replace />
}

export function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/property/:id" element={<PropertyRedirect />} />

        {/* Public app routes (with bottom nav) */}
        <Route element={<AppShell />}>
          <Route index element={<FeedPage />} />

          {/* Protected routes within AppShell */}
          <Route element={<ProtectedRoute />}>
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/host" element={<HostDashboardPage />} />
          </Route>
        </Route>

        {/* Protected full screen pages (no bottom nav) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/messages/:id" element={<ChatPage />} />
          <Route path="/properties/:id/edit" element={<EditPropertyPage />} />
          <Route path="/properties/new" element={<CreateListingPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

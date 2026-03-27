import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import { useAuthStore } from "@/lib/store/auth-store"
import { AdminShell } from "@/components/layout/AdminShell"
import { LoginPage } from "@/pages/LoginPage"

const DashboardPage = lazy(() => import("@/pages/DashboardPage").then(m => ({ default: m.DashboardPage })))
const UsersPage = lazy(() => import("@/pages/UsersPage").then(m => ({ default: m.UsersPage })))
const UserDetailPage = lazy(() => import("@/pages/UserDetailPage").then(m => ({ default: m.UserDetailPage })))
const PropertiesPage = lazy(() => import("@/pages/PropertiesPage").then(m => ({ default: m.PropertiesPage })))
const PropertyDetailPage = lazy(() => import("@/pages/PropertyDetailPage").then(m => ({ default: m.PropertyDetailPage })))
const MatchesPage = lazy(() => import("@/pages/MatchesPage").then(m => ({ default: m.MatchesPage })))
const ReportsPage = lazy(() => import("@/pages/ReportsPage").then(m => ({ default: m.ReportsPage })))
const VerificationPage = lazy(() => import("@/pages/VerificationPage").then(m => ({ default: m.VerificationPage })))
const AuditLogPage = lazy(() => import("@/pages/AuditLogPage").then(m => ({ default: m.AuditLogPage })))

const pageFallback = (
  <div className="flex h-64 items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
)

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <AdminGuard>
              <AdminShell />
            </AdminGuard>
          }
        >
          <Route index element={<Suspense fallback={pageFallback}><DashboardPage /></Suspense>} />
          <Route path="users" element={<Suspense fallback={pageFallback}><UsersPage /></Suspense>} />
          <Route path="users/:id" element={<Suspense fallback={pageFallback}><UserDetailPage /></Suspense>} />
          <Route path="properties" element={<Suspense fallback={pageFallback}><PropertiesPage /></Suspense>} />
          <Route path="properties/:id" element={<Suspense fallback={pageFallback}><PropertyDetailPage /></Suspense>} />
          <Route path="matches" element={<Suspense fallback={pageFallback}><MatchesPage /></Suspense>} />
          <Route path="reports" element={<Suspense fallback={pageFallback}><ReportsPage /></Suspense>} />
          <Route path="verification" element={<Suspense fallback={pageFallback}><VerificationPage /></Suspense>} />
          <Route path="audit-log" element={<Suspense fallback={pageFallback}><AuditLogPage /></Suspense>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

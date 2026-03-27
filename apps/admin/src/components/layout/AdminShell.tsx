import { Outlet } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { fetchReports } from "@/lib/api/reports"
import { fetchVerificationQueue } from "@/lib/api/verification"

export function AdminShell() {
  const { data: reports } = useQuery({
    queryKey: ["reports", "pending-count"],
    queryFn: () => fetchReports({ status: "pending", limit: 1 }),
    refetchInterval: 60_000,
  })

  const { data: verifications } = useQuery({
    queryKey: ["verification", "pending-count"],
    queryFn: () => fetchVerificationQueue(1, 1),
    refetchInterval: 60_000,
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        pendingReports={reports?.total || 0}
        pendingVerifications={verifications?.total || 0}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

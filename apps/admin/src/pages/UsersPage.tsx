import { UsersTable } from "@/features/users/UsersTable"

export function UsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>
      <UsersTable />
    </div>
  )
}

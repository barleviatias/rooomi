import { VerificationQueue } from "@/features/verification/VerificationQueue"

export function VerificationPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Verification</h1>
      <VerificationQueue />
    </div>
  )
}

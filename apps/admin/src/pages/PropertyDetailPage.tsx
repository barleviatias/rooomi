import { useParams, useNavigate } from "react-router"
import { PropertyDetailPanel } from "@/features/properties/PropertyDetailPanel"
import { Button } from "@roomi/ui"

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/properties")}>
          Back
        </Button>
        <h1 className="text-2xl font-bold">Property Detail</h1>
      </div>
      <PropertyDetailPanel propertyId={id} />
    </div>
  )
}

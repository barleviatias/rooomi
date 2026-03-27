import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchProperty, updateProperty, deleteProperty } from "@/lib/api/properties"
import { Badge } from "@roomi/ui"
import { Button } from "@roomi/ui"
import { Card, CardContent, CardHeader, CardTitle } from "@roomi/ui"
import { Separator } from "@roomi/ui"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

interface PropertyDetailPanelProps {
  propertyId: string
}

export function PropertyDetailPanel({ propertyId }: PropertyDetailPanelProps) {
  const queryClient = useQueryClient()

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => fetchProperty(propertyId),
  })

  const toggleFeatured = useMutation({
    mutationFn: () => updateProperty(propertyId, { is_featured: !property?.is_featured }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["property", propertyId] }),
  })

  const changeStatus = useMutation({
    mutationFn: (status: string) => updateProperty(propertyId, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["property", propertyId] }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteProperty(propertyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["property", propertyId] }),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!property) return <p className="text-muted-foreground">Property not found</p>

  return (
    <div className="space-y-6">
      {property.photos?.length ? (
        <div className="grid grid-cols-3 gap-2 rounded-lg overflow-hidden">
          {property.photos.slice(0, 6).map((photo) => (
            <img
              key={photo.id}
              src={photo.photo_url}
              alt={photo.caption || "Property photo"}
              className="h-32 w-full object-cover"
            />
          ))}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{property.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {property.address_city}{property.address_street ? `, ${property.address_street}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={property.is_featured ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFeatured.mutate()}
              >
                {property.is_featured ? "Unfeatured" : "Feature"}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate()}>
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Badge variant={property.status === "active" ? "success" : "secondary"}>{property.status}</Badge>
            {property.is_featured && <Badge>Featured</Badge>}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoRow label="Price" value={`${property.price_monthly?.toLocaleString()} /mo`} />
            <InfoRow label="Rooms" value={`${property.available_rooms} / ${property.total_rooms}`} />
            <InfoRow label="Bathrooms" value={String(property.bathrooms)} />
            <InfoRow label="Size" value={property.size_sqm ? `${property.size_sqm} sqm` : "N/A"} />
            <InfoRow label="Available From" value={format(new Date(property.available_from), "MMM d, yyyy")} />
            <InfoRow label="Views" value={String(property.view_count)} />
            <InfoRow label="Likes" value={String(property.like_count)} />
            <InfoRow label="Created" value={format(new Date(property.created_at), "MMM d, yyyy")} />
          </div>

          {property.stats && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <InfoRow label="Total Likes" value={String(property.stats.likes)} />
                <InfoRow label="Total Passes" value={String(property.stats.passes)} />
              </div>
            </>
          )}

          {property.host && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Host</p>
                <div className="flex items-center gap-3 rounded-md border p-3">
                  <div>
                    <p className="font-medium">{property.host.full_name}</p>
                    <p className="text-xs text-muted-foreground">{property.host.email}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />
          <div className="flex gap-2">
            {["active", "paused", "rented"].filter((s) => s !== property.status).map((s) => (
              <Button
                key={s}
                variant="outline"
                size="sm"
                onClick={() => changeStatus.mutate(s)}
                disabled={changeStatus.isPending}
              >
                Set {s}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

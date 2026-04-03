import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@roomi/ui'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useProperty, useUpdateProperty, useDeleteProperty } from '@/hooks/useProperties'

const CITIES = ['Tel Aviv', 'Jerusalem', 'Haifa', 'Beer Sheva', 'Netanya', 'Herzliya', 'Ramat Gan']
const NEIGHBORHOODS: Record<string, string[]> = {
  'Tel Aviv': ['Florentin', 'Neve Tzedek', 'Rothschild', 'Dizengoff', 'Old North', 'Ramat Aviv'],
  Jerusalem: ['Rehavia', 'German Colony', 'Nachlaot', 'City Center', 'Ein Kerem'],
  Haifa: ['Carmel', 'Hadar', 'Downtown', 'German Colony'],
  'Beer Sheva': ['Old City', 'Neve Noy', 'Ramot'],
  Netanya: ['City Center', 'South Beach', 'Poleg'],
  Herzliya: ['Herzliya Pituach', 'City Center'],
  'Ramat Gan': ['City Center', 'Ramat Chen', 'Montefiore'],
}

export function EditPropertyPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const isNewProperty = !id || id === 'new'

  const { data: existingProperty, isLoading } = useProperty(isNewProperty ? '' : id!)
  const updateProperty = useUpdateProperty()
  const deleteProperty = useDeleteProperty()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priceMonthly, setPriceMonthly] = useState(3500)
  const [billsIncluded, setBillsIncluded] = useState(false)
  const [depositMonths, setDepositMonths] = useState(2)
  const [city, setCity] = useState('Tel Aviv')
  const [neighborhood, setNeighborhood] = useState('')
  const [hideAddress, setHideAddress] = useState(true)
  const [totalRooms, setTotalRooms] = useState(3)
  const [bathrooms, setBathrooms] = useState(1)
  const [sizeSqm, setSizeSqm] = useState(70)
  const [floorNumber, setFloorNumber] = useState(2)
  const [totalFloors, setTotalFloors] = useState(4)
  const [availableFrom, setAvailableFrom] = useState(new Date().toISOString().split('T')[0])
  const [minLeaseMonths, setMinLeaseMonths] = useState(12)
  const [hasBalcony, setHasBalcony] = useState(false)
  const [hasElevator, setHasElevator] = useState(false)
  const [hasParking, setHasParking] = useState(false)
  const [hasSafeRoom, setHasSafeRoom] = useState(false)
  const [hasFurnished, setHasFurnished] = useState(false)
  const [hasPetsAllowed, setHasPetsAllowed] = useState(false)
  const [hasAc, setHasAc] = useState(false)
  const [roommatesCount, setRoommatesCount] = useState(0)
  const [roommatesDescription, setRoommatesDescription] = useState('')

  const prop = existingProperty as Record<string, unknown> | null | undefined

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (prop && !isNewProperty) {
      setTitle((prop.title as string) || '')
      setDescription((prop.description as string) || '')
      setPriceMonthly((prop.price_monthly as number) || 3500)
      setBillsIncluded((prop.price_bills_included as boolean) || false)
      setDepositMonths((prop.deposit_months as number) || 2)
      setCity((prop.address_city as string) || 'Tel Aviv')
      setNeighborhood((prop.address_neighborhood as string) || '')
      setHideAddress((prop.hide_exact_address as boolean) ?? true)
      setTotalRooms((prop.total_rooms as number) || 3)
      setBathrooms((prop.bathrooms as number) || 1)
      setSizeSqm((prop.size_sqm as number) || 70)
      setFloorNumber((prop.floor_number as number) || 2)
      setTotalFloors((prop.total_floors as number) || 4)
      setAvailableFrom((prop.available_from as string) || new Date().toISOString().split('T')[0])
      setMinLeaseMonths((prop.minimum_lease_months as number) || 12)
      setHasBalcony((prop.has_balcony as boolean) || false)
      setHasElevator((prop.has_elevator as boolean) || false)
      setHasParking((prop.has_parking as boolean) || false)
      setHasSafeRoom((prop.has_safe_room as boolean) || false)
      setHasFurnished((prop.has_furnished as boolean) || false)
      setHasPetsAllowed((prop.has_pets_allowed as boolean) || false)
      setHasAc((prop.has_ac as boolean) || false)
      setRoommatesCount((prop.current_roommates_count as number) || 0)
      setRoommatesDescription((prop.current_roommates_description as string) || '')
    }
  }, [prop, isNewProperty])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSave = async () => {
    if (!id || isNewProperty) {
      navigate('/host')
      return
    }

    const updates = {
      title,
      description: description || null,
      price_monthly: priceMonthly,
      price_bills_included: billsIncluded,
      deposit_months: depositMonths,
      address_city: city,
      address_neighborhood: neighborhood || null,
      hide_exact_address: hideAddress,
      total_rooms: totalRooms,
      bathrooms,
      size_sqm: sizeSqm || null,
      floor_number: floorNumber || null,
      total_floors: totalFloors || null,
      available_from: availableFrom,
      minimum_lease_months: minLeaseMonths,
      has_balcony: hasBalcony,
      has_elevator: hasElevator,
      has_parking: hasParking,
      has_safe_room: hasSafeRoom,
      has_furnished: hasFurnished,
      has_pets_allowed: hasPetsAllowed,
      has_ac: hasAc,
      current_roommates_count: roommatesCount,
      current_roommates_description: roommatesDescription || null,
    }

    try {
      await updateProperty.mutateAsync({ id, updates })
      navigate('/host')
    } catch {
      // Update failed
    }
  }

  const handleDelete = async () => {
    if (!id || isNewProperty) return

    try {
      await deleteProperty.mutateAsync(id)
      navigate('/host')
    } catch {
      // Delete failed
    }
  }

  const photos = (prop?.photos as { id: string; photo_url: string }[]) || []

  if (isLoading && !isNewProperty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <header
        className="sticky top-0 z-40 px-4 flex items-center justify-between bg-background/80 backdrop-blur-lg border-b border-border"
        style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))', paddingBottom: '0.5rem', minHeight: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <Button variant="ghost" size="sm" onClick={() => navigate('/host')}>
          {t('common.back')}
        </Button>
        <span className="font-semibold">
          {isNewProperty ? t('host.createListing') : t('host.editListing')}
        </span>
        <Button size="sm" onClick={handleSave} disabled={updateProperty.isPending}>
          {t('common.save')}
        </Button>
      </header>

      <div className="p-4 space-y-6">
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">{t('property.photos') || 'Photos'}</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden relative"
              >
                <img
                  src={photo.photo_url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <button className="w-20 h-20 flex-shrink-0 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('property.addPhotosHint') || 'Add up to 10 photos of your property'}
          </p>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">{t('property.basicInfo') || 'Basic Info'}</h3>
          <div className="space-y-2">
            <Label htmlFor="title">{t('property.title') || 'Title'}</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('property.titlePlaceholder') || 'e.g., Sunny Room in Florentin'} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t('property.description') || 'Description'}</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('property.descriptionPlaceholder') || 'Describe your place...'} rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t('property.priceMonthly') || 'Price (monthly)'}</Label>
              <Input id="price" type="number" value={priceMonthly} onChange={(e) => setPriceMonthly(Number(e.target.value))} min={0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit">{t('property.depositMonths') || 'Deposit (months)'}</Label>
              <Input id="deposit" type="number" value={depositMonths} onChange={(e) => setDepositMonths(Number(e.target.value))} min={0} max={12} />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm">{t('property.billsIncluded')}</span>
            <Switch checked={billsIncluded} onCheckedChange={setBillsIncluded} />
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">{t('property.location')}</h3>
          <div className="space-y-2">
            <Label>{t('property.city') || 'City'}</Label>
            <Select value={city} onValueChange={(v) => { setCity(v); setNeighborhood(''); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('property.neighborhood') || 'Neighborhood'}</Label>
            <Select value={neighborhood} onValueChange={setNeighborhood}>
              <SelectTrigger><SelectValue placeholder={t('property.selectNeighborhood') || 'Select neighborhood'} /></SelectTrigger>
              <SelectContent>
                {(NEIGHBORHOODS[city] || []).map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm">{t('property.hideAddress') || 'Hide exact address'}</span>
            <Switch checked={hideAddress} onCheckedChange={setHideAddress} />
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">{t('property.details') || 'Details'}</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rooms">{t('property.rooms') || 'Rooms'}</Label>
              <Input id="rooms" type="number" value={totalRooms} onChange={(e) => setTotalRooms(Number(e.target.value))} min={1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">{t('property.baths') || 'Baths'}</Label>
              <Input id="bathrooms" type="number" value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} min={1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">{t('property.size') || 'm\u00B2'}</Label>
              <Input id="size" type="number" value={sizeSqm} onChange={(e) => setSizeSqm(Number(e.target.value))} min={1} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floor">{t('property.floorNumber') || 'Floor'}</Label>
              <Input id="floor" type="number" value={floorNumber} onChange={(e) => setFloorNumber(Number(e.target.value))} min={0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalFloors">{t('property.totalFloors') || 'Total Floors'}</Label>
              <Input id="totalFloors" type="number" value={totalFloors} onChange={(e) => setTotalFloors(Number(e.target.value))} min={1} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="availableFrom">{t('property.availableFromDate')}</Label>
              <Input id="availableFrom" type="date" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minLease">{t('property.minimumLease')}</Label>
              <Input id="minLease" type="number" value={minLeaseMonths} onChange={(e) => setMinLeaseMonths(Number(e.target.value))} min={1} />
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">{t('property.amenities')}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">{t('property.balcony')}</span>
              <Switch checked={hasBalcony} onCheckedChange={setHasBalcony} />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">{t('property.elevator')}</span>
              <Switch checked={hasElevator} onCheckedChange={setHasElevator} />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">{t('property.parking')}</span>
              <Switch checked={hasParking} onCheckedChange={setHasParking} />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">{t('property.safeRoom')}</span>
              <Switch checked={hasSafeRoom} onCheckedChange={setHasSafeRoom} />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">{t('property.furnished')}</span>
              <Switch checked={hasFurnished} onCheckedChange={setHasFurnished} />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">{t('property.petsAllowed')}</span>
              <Switch checked={hasPetsAllowed} onCheckedChange={setHasPetsAllowed} />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg col-span-2">
              <span className="text-sm">{t('property.ac')}</span>
              <Switch checked={hasAc} onCheckedChange={setHasAc} />
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">{t('property.currentRoommates')}</h3>
          <div className="space-y-2">
            <Label htmlFor="roommatesCount">{t('property.roommatesNumber') || 'Number of roommates'}</Label>
            <Input id="roommatesCount" type="number" value={roommatesCount} onChange={(e) => setRoommatesCount(Number(e.target.value))} min={0} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roommatesDesc">{t('property.roommatesDescription') || 'Description'}</Label>
            <Textarea id="roommatesDesc" value={roommatesDescription} onChange={(e) => setRoommatesDescription(e.target.value)} placeholder={t('property.roommatesDescriptionPlaceholder') || 'e.g., One roommate, 28M, software developer...'} rows={2} />
          </div>
        </Card>

        <div className="space-y-3">
          <Button className="w-full" size="lg" onClick={handleSave} disabled={updateProperty.isPending}>
            {updateProperty.isPending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              t('common.save')
            )}
          </Button>

          {!isNewProperty && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" size="lg">
                  {t('host.deleteListing') || 'Delete Listing'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('host.deleteListing') || 'Delete Listing'}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('host.deleteConfirm') || 'Are you sure you want to delete this listing? This action cannot be undone.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    {t('host.deleteListing') || 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  )
}

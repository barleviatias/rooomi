import { useTranslation } from 'react-i18next'
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@roomi/ui'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { cn } from '@roomi/ui'

const CITIES = ['Tel Aviv', 'Jerusalem', 'Haifa', 'Beer Sheva', 'Netanya', 'Herzliya', 'Ramat Gan']
const NEIGHBORHOODS: Record<string, string[]> = {
  'Tel Aviv': ['Florentin', 'Neve Tzedek', 'Rothschild', 'Dizengoff', 'Old North', 'Jaffa', 'Ramat Aviv'],
  'Jerusalem': ['Rehavia', 'German Colony', 'Baka', 'Nachlaot', 'City Center'],
  'Haifa': ['Carmel', 'German Colony', 'Downtown', 'Neve Shaanan'],
}

export type ListingTypeOption = 'room' | 'apartment' | 'sublet' | ''

export interface ListingFormData {
  listingType: ListingTypeOption
  title: string
  description: string
  price: number | ''
  deposit: number | ''
  city: string
  neighborhood: string
  rooms: number | ''
  bathrooms: number | ''
  size: number | ''
  floor: number | ''
  totalFloors: number | ''
  availableFrom: string
  minLease: number
  billsIncluded: boolean
  amenities: {
    balcony: boolean
    ac: boolean
    elevator: boolean
    parking: boolean
    furnished: boolean
    petsAllowed: boolean
    safeRoom: boolean
  }
  roommatesCount: number | ''
  roommatesDescription: string
}

interface ListingDetailsStepProps {
  data: ListingFormData
  onChange: (data: ListingFormData) => void
  errors: Partial<Record<keyof ListingFormData, string>>
}

export function ListingDetailsStep({ data, onChange, errors }: ListingDetailsStepProps) {
  const { t } = useTranslation()

  const updateField = <K extends keyof ListingFormData>(
    field: K,
    value: ListingFormData[K]
  ) => {
    onChange({ ...data, [field]: value })
  }

  const updateAmenity = (amenity: keyof ListingFormData['amenities'], value: boolean) => {
    onChange({
      ...data,
      amenities: { ...data.amenities, [amenity]: value },
    })
  }

  const neighborhoods = data.city ? NEIGHBORHOODS[data.city] || [] : []

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-xl font-semibold">
          {t('createListing.step2Title') || 'Property Details'}
        </h2>
      </div>

      {/* Listing Type */}
      <div className="space-y-2">
        <Label>
          {t('listingType.label') || 'What are you listing?'} <span className="text-pink-500">*</span>
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'room', label: t('listingType.room') || 'Room', desc: t('listingType.roomDesc') || 'A room in a shared apartment', icon: '🛏️' },
            { value: 'apartment', label: t('listingType.apartment') || 'Apartment', desc: t('listingType.apartmentDesc') || 'An entire apartment', icon: '🏠' },
            { value: 'sublet', label: t('listingType.sublet') || 'Sublet', desc: t('listingType.subletDesc') || 'Temporary rental', icon: '📅' },
          ].map(({ value, label, desc, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => updateField('listingType', value as ListingTypeOption)}
              className={cn(
                'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all',
                data.listingType === value
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-500/10'
                  : 'border-muted hover:border-pink-300'
              )}
            >
              <span className="text-2xl">{icon}</span>
              <span className={cn(
                'font-medium text-sm',
                data.listingType === value ? 'text-pink-600 dark:text-pink-400' : 'text-foreground'
              )}>
                {label}
              </span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                {desc}
              </span>
            </button>
          ))}
        </div>
        {errors.listingType && (
          <p className="text-xs text-destructive">{errors.listingType}</p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          {t('property.title')} <span className="text-pink-500">*</span>
        </Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder={t('property.titlePlaceholder') || 'e.g., Sunny Room in Florentin'}
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">{t('property.description')}</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder={t('property.descriptionPlaceholder') || 'Describe your place...'}
          rows={3}
        />
      </div>

      {/* Price & Deposit */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">
            {t('property.priceMonthly')} <span className="text-pink-500">*</span>
          </Label>
          <div className="relative">
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">₪</span>
            <Input
              id="price"
              type="number"
              value={data.price}
              onChange={(e) => updateField('price', e.target.value ? Number(e.target.value) : '')}
              className={`ps-8 ${errors.price ? 'border-destructive' : ''}`}
              placeholder="4,200"
            />
          </div>
          {errors.price && (
            <p className="text-xs text-destructive">{errors.price}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="deposit">{t('property.depositMonths')}</Label>
          <Input
            id="deposit"
            type="number"
            value={data.deposit}
            onChange={(e) => updateField('deposit', e.target.value ? Number(e.target.value) : '')}
            placeholder="2"
          />
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            {t('property.city')} <span className="text-pink-500">*</span>
          </Label>
          <Select value={data.city} onValueChange={(v) => updateField('city', v)}>
            <SelectTrigger className={errors.city ? 'border-destructive' : ''}>
              <SelectValue placeholder={t('profile.selectCity')} />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && (
            <p className="text-xs text-destructive">{errors.city}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>{t('property.neighborhood')}</Label>
          <Select
            value={data.neighborhood}
            onValueChange={(v) => updateField('neighborhood', v)}
            disabled={!data.city}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('property.selectNeighborhood')} />
            </SelectTrigger>
            <SelectContent>
              {neighborhoods.map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-4 gap-3">
        <div className="space-y-2">
          <Label htmlFor="rooms">{t('property.rooms_other', { count: 0 }).replace('0 ', '')}</Label>
          <Input
            id="rooms"
            type="number"
            value={data.rooms}
            onChange={(e) => updateField('rooms', e.target.value ? Number(e.target.value) : '')}
            placeholder="3"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="baths">{t('property.baths')}</Label>
          <Input
            id="baths"
            type="number"
            value={data.bathrooms}
            onChange={(e) => updateField('bathrooms', e.target.value ? Number(e.target.value) : '')}
            placeholder="1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="size">{t('property.size')}</Label>
          <Input
            id="size"
            type="number"
            value={data.size}
            onChange={(e) => updateField('size', e.target.value ? Number(e.target.value) : '')}
            placeholder="75"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="floor">{t('property.floorNumber')}</Label>
          <Input
            id="floor"
            type="number"
            value={data.floor}
            onChange={(e) => updateField('floor', e.target.value ? Number(e.target.value) : '')}
            placeholder="3"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="availableFrom">{t('property.availableFromDate')}</Label>
          <Input
            id="availableFrom"
            type="date"
            value={data.availableFrom}
            onChange={(e) => updateField('availableFrom', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('property.minimumLease')}</Label>
          <Select
            value={String(data.minLease)}
            onValueChange={(v) => updateField('minLease', Number(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 3, 6, 12].map((months) => (
                <SelectItem key={months} value={String(months)}>
                  {t('property.months', { count: months })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bills Included */}
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <Label htmlFor="bills">{t('property.billsIncluded')}</Label>
        <Switch
          id="bills"
          checked={data.billsIncluded}
          onCheckedChange={(v) => updateField('billsIncluded', v)}
        />
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <Label>{t('property.amenities')}</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'balcony', label: t('property.balcony') },
            { key: 'ac', label: t('property.ac') },
            { key: 'elevator', label: t('property.elevator') },
            { key: 'parking', label: t('property.parking') },
            { key: 'furnished', label: t('property.furnished') },
            { key: 'petsAllowed', label: t('property.petsAllowed') },
            { key: 'safeRoom', label: t('property.safeRoom') },
          ].map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <span className="text-sm">{label}</span>
              <Switch
                checked={data.amenities[key as keyof ListingFormData['amenities']]}
                onCheckedChange={(v) =>
                  updateAmenity(key as keyof ListingFormData['amenities'], v)
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Roommates */}
      <div className="space-y-3">
        <Label>{t('property.roommatesNumber')}</Label>
        <Input
          type="number"
          value={data.roommatesCount}
          onChange={(e) => updateField('roommatesCount', e.target.value ? Number(e.target.value) : '')}
          placeholder="1"
        />
      </div>

      <div className="space-y-2">
        <Label>{t('property.roommatesDescription')}</Label>
        <Textarea
          value={data.roommatesDescription}
          onChange={(e) => updateField('roommatesDescription', e.target.value)}
          placeholder={t('property.roommatesDescriptionPlaceholder') || 'e.g., One roommate, 28M, software developer...'}
          rows={2}
        />
      </div>
    </div>
  )
}

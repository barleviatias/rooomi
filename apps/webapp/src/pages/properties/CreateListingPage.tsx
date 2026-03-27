import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@roomi/ui'
import { useCreateProperty } from '@/hooks/useProperties'
import { uploadPropertyPhotos } from '@/lib/services/properties'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { StepProgressDots } from '@/features/listings/components/StepProgressDots'
import { PhotoUploadStep, type PhotoFile } from '@/features/listings/components/PhotoUploadStep'
import { ListingDetailsStep, type ListingFormData } from '@/features/listings/components/ListingDetailsStep'
import { ListingReviewStep } from '@/features/listings/components/ListingReviewStep'
import { ListingSuccessModal } from '@/features/listings/components/ListingSuccessModal'

const TOTAL_STEPS = 3

const initialFormData: ListingFormData = {
  listingType: '',
  title: '',
  description: '',
  price: '',
  deposit: '',
  city: '',
  neighborhood: '',
  rooms: '',
  bathrooms: '',
  size: '',
  floor: '',
  totalFloors: '',
  availableFrom: '',
  minLease: 12,
  billsIncluded: false,
  amenities: {
    balcony: false,
    ac: false,
    elevator: false,
    parking: false,
    furnished: false,
    petsAllowed: false,
    safeRoom: false,
  },
  roommatesCount: '',
  roommatesDescription: '',
}

export function CreateListingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(0)
  const [photos, setPhotos] = useState<PhotoFile[]>([])
  const [formData, setFormData] = useState<ListingFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof ListingFormData, string>>>({})
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const createProperty = useCreateProperty()

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      const newErrors: Partial<Record<keyof ListingFormData, string>> = {}

      if (!formData.listingType) {
        newErrors.listingType = t('createListing.errorRequired') || 'This field is required'
      }
      if (!formData.title.trim()) {
        newErrors.title = t('createListing.errorRequired') || 'This field is required'
      }
      if (!formData.price) {
        newErrors.price = t('createListing.errorRequired') || 'This field is required'
      }
      if (!formData.city) {
        newErrors.city = t('createListing.errorRequired') || 'This field is required'
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < TOTAL_STEPS - 1) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCancel = () => {
    setShowCancelDialog(true)
  }

  const confirmCancel = () => {
    setShowCancelDialog(false)
    navigate('/host')
  }

  const handlePublish = async () => {
    if (!validateStep(1)) {
      setCurrentStep(1)
      return
    }

    setIsPublishing(true)
    try {
      const propertyData: Record<string, unknown> = {
        title: formData.title,
        description: formData.description || null,
        property_type: formData.listingType || 'room',
        price_monthly: Number(formData.price) || 0,
        price_bills_included: formData.billsIncluded,
        deposit_months: Number(formData.deposit) || 2,
        address_city: formData.city,
        address_neighborhood: formData.neighborhood || null,
        address_country: 'Israel',
        hide_exact_address: true,
        total_rooms: Number(formData.rooms) || 1,
        available_rooms: 1,
        bathrooms: Number(formData.bathrooms) || 1,
        size_sqm: Number(formData.size) || null,
        floor_number: Number(formData.floor) || null,
        total_floors: Number(formData.totalFloors) || null,
        available_from: formData.availableFrom || new Date().toISOString().split('T')[0],
        minimum_lease_months: formData.minLease || 12,
        has_balcony: formData.amenities.balcony,
        has_elevator: formData.amenities.elevator,
        has_parking: formData.amenities.parking,
        has_safe_room: formData.amenities.safeRoom,
        has_furnished: formData.amenities.furnished,
        has_pets_allowed: formData.amenities.petsAllowed,
        has_ac: formData.amenities.ac,
        current_roommates_count: Number(formData.roommatesCount) || 0,
        current_roommates_description: formData.roommatesDescription || null,
      }

      const result = await createProperty.mutateAsync(propertyData)

      if (photos.length > 0 && result?.id) {
        const files = photos.map(p => p.file)
        await uploadPropertyPhotos(result.id, files)
      }

      setShowSuccessModal(true)
    } catch {
      setIsPublishing(false)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccessModal(false)
    navigate('/host')
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 flex items-center justify-between bg-background/80 backdrop-blur-lg border-b border-border"
        style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))', paddingBottom: '0.5rem', minHeight: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          {t('common.cancel')}
        </Button>

        <StepProgressDots totalSteps={TOTAL_STEPS} currentStep={currentStep} />

        <span className="text-sm text-muted-foreground w-16 text-end">
          {currentStep + 1}/{TOTAL_STEPS}
        </span>
      </header>

      {/* Step Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentStep === 0 && (
          <PhotoUploadStep photos={photos} onPhotosChange={setPhotos} />
        )}
        {currentStep === 1 && (
          <ListingDetailsStep
            data={formData}
            onChange={setFormData}
            errors={errors}
          />
        )}
        {currentStep === 2 && (
          <ListingReviewStep
            data={formData}
            photos={photos}
            onEdit={goToStep}
          />
        )}
      </div>

      {/* Footer Navigation */}
      <div className="sticky bottom-0 px-6 py-4 bg-background border-t border-border pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-full"
              onClick={handleBack}
            >
              {t('common.back')}
            </Button>
          )}

          {currentStep < TOTAL_STEPS - 1 ? (
            <Button
              className="flex-1 h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
              onClick={handleNext}
            >
              {t('common.continue')}
            </Button>
          ) : (
            <Button
              className="flex-1 h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                t('createListing.publish') || 'Publish Listing'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-sm mx-auto rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('createListing.cancelTitle') || 'Discard listing?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('createListing.cancelDesc') || 'Your progress will be lost.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogCancel className="w-full rounded-full h-12 mt-0">
              {t('createListing.keepEditing') || 'Keep Editing'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="w-full rounded-full h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {t('createListing.discard') || 'Discard'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Modal */}
      <ListingSuccessModal
        isOpen={showSuccessModal}
        listingTitle={formData.title || t('createListing.untitled') || 'Untitled'}
        onClose={handleSuccessClose}
      />
    </div>
  )
}

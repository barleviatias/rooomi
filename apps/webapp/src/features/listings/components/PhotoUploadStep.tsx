import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@roomi/ui'
import { Badge } from '@roomi/ui'

export type PhotoFile = {
  file: File
  preview: string
}

interface PhotoUploadStepProps {
  photos: PhotoFile[]
  onPhotosChange: (photos: PhotoFile[]) => void
}

export function PhotoUploadStep({ photos, onPhotosChange }: PhotoUploadStepProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeSlotRef = useRef<number>(0)

  const handleAddPhoto = (index: number) => {
    activeSlotRef.current = index
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newPhotos = [...photos]
    let slotIndex = activeSlotRef.current

    for (let i = 0; i < files.length && slotIndex < slots; i++) {
      const file = files[i]
      const preview = URL.createObjectURL(file)
      newPhotos[slotIndex] = { file, preview }
      slotIndex++
    }

    onPhotosChange(newPhotos)
    e.target.value = ''
  }

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onPhotosChange(newPhotos)
  }

  const slots = 6

  return (
    <div className="flex-1 flex flex-col px-6 py-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {t('createListing.step1Title') || 'Add Photos'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('property.addPhotosHint') || 'Add up to 6 photos of your property'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {Array.from({ length: slots }).map((_, index) => (
          <button
            key={index}
            onClick={() => photos[index] ? handleRemovePhoto(index) : handleAddPhoto(index)}
            className={cn(
              'relative aspect-[4/3] rounded-xl border-2 border-dashed transition-all',
              'flex flex-col items-center justify-center gap-2',
              'hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/20',
              photos[index]
                ? 'border-transparent'
                : 'border-muted-foreground/30'
            )}
          >
            {photos[index] ? (
              <>
                <img
                  src={photos[index].preview}
                  alt={`Photo ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover rounded-xl"
                />
                {index === 0 && (
                  <Badge className="absolute top-2 start-2 bg-pink-500 text-white border-0">
                    {t('createListing.coverPhoto') || 'Cover'}
                  </Badge>
                )}
                <div className="absolute top-2 end-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground">
                  {t('createListing.addPhoto') || 'Add Photo'}
                </span>
                {index === 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {t('createListing.coverPhoto') || 'Cover'}
                  </Badge>
                )}
              </>
            )}
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        {t('createListing.photosTip') || 'Tip: Good photos get 3x more likes'}
      </p>
    </div>
  )
}

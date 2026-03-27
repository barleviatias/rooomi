import { cn } from '@roomi/ui'

interface StepProgressDotsProps {
  totalSteps: number
  currentStep: number
  className?: string
}

export function StepProgressDots({
  totalSteps,
  currentStep,
  className,
}: StepProgressDotsProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          {/* Dot */}
          <div
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-all duration-300',
              index === currentStep
                ? 'bg-pink-500 scale-125'
                : index < currentStep
                ? 'bg-pink-300'
                : 'bg-muted-foreground/30'
            )}
          />
          {/* Connecting line */}
          {index < totalSteps - 1 && (
            <div
              className={cn(
                'w-8 h-0.5 mx-1 transition-colors duration-300',
                index < currentStep
                  ? 'bg-pink-300'
                  : 'bg-muted-foreground/20'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

import { motion } from 'framer-motion'
import { cn } from '@roomi/ui'

interface ActionButtonsProps {
  onLike: () => void
  onPass: () => void
  className?: string
}

export function ActionButtons({
  onLike,
  onPass,
  className,
}: ActionButtonsProps) {
  return (
    <div className={cn('flex items-center gap-6', className)}>
      {/* Pass */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation()
          onPass()
        }}
        className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center border border-gray-200"
      >
        <svg
          className="w-7 h-7 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </motion.button>

      {/* Like */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation()
          onLike()
        }}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg flex items-center justify-center text-white"
      >
        <svg
          className="w-8 h-8"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </motion.button>
    </div>
  )
}

import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@roomi/ui'

const CONFETTI_PARTICLES = Array.from({ length: 12 }, () => ({
  left: 20 + Math.random() * 60,
  top: 20 + Math.random() * 60,
  y: -30 - Math.random() * 50,
  x: (Math.random() - 0.5) * 100,
}))

const CONFETTI_COLORS = ['#ec4899', '#f472b6', '#fbbf24', '#34d399', '#60a5fa']

interface ListingSuccessModalProps {
  isOpen: boolean
  listingTitle: string
  onClose: () => void
}

export function ListingSuccessModal({
  isOpen,
  listingTitle,
  onClose,
}: ListingSuccessModalProps) {
  const { t } = useTranslation()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-sm bg-background rounded-3xl p-8 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Celebration Icon */}
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
            >
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>

            {/* Confetti effect - simple dots */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {CONFETTI_PARTICLES.map((particle, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${particle.left}%`,
                    top: `${particle.top}%`,
                    backgroundColor: CONFETTI_COLORS[i % 5],
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    y: [0, particle.y],
                    x: [particle.x],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.3 + i * 0.05,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>

            {/* Title */}
            <motion.h2
              className="text-2xl font-bold mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {t('createListing.success') || 'Your listing is live!'}
            </motion.h2>

            {/* Listing name */}
            <motion.p
              className="text-muted-foreground mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              "{listingTitle}"
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={onClose}
                className="w-full h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold"
              >
                {t('createListing.goToDashboard') || 'Go to Dashboard'}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

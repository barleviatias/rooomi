import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "lucide-react"

const cards = [
  {
    price: "₪3,500/mo",
    location: "Florentin, Tel Aviv",
    rooms: "2 rooms · 60m²",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
  },
  {
    price: "₪4,800/mo",
    location: "Neve Tzedek, Tel Aviv",
    rooms: "3 rooms · 85m²",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
  },
  {
    price: "₪3,200/mo",
    location: "Old North, Tel Aviv",
    rooms: "2 rooms · 55m²",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
  },
  {
    price: "₪5,200/mo",
    location: "Rothschild, Tel Aviv",
    rooms: "3 rooms · 90m²",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop",
  },
]

function PhoneMockup() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState(1)

  useEffect(() => {
    const timer = setInterval(() => {
      setSwipeDirection((prev) => (prev === 1 ? -1 : 1))
      setCurrentIndex((prev) => (prev + 1) % cards.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const visibleCards = [0, 1, 2].map((offset) => ({
    ...cards[(currentIndex + offset) % cards.length],
    offset,
  }))

  return (
    <div className="relative w-[260px] h-[520px] mx-auto">
      <div className="absolute inset-0 rounded-[2.5rem] border-[3px] border-foreground/10 bg-card shadow-2xl overflow-hidden">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2">
          <span className="text-[10px] text-muted-foreground font-medium">9:41</span>
          <div className="w-20 h-5 bg-foreground/10 rounded-full" />
          <div className="flex gap-1">
            <div className="w-3.5 h-2 bg-muted-foreground/40 rounded-sm" />
          </div>
        </div>

        {/* App header */}
        <div className="px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-bold text-primary">Roomi</span>
          <div className="flex gap-1.5">
            <div className="w-6 h-6 rounded-full bg-muted" />
            <div className="w-6 h-6 rounded-full bg-muted" />
          </div>
        </div>

        {/* Swipe cards area */}
        <div className="relative mx-3 h-[340px]">
          {/* Back cards (static) */}
          {visibleCards
            .slice(1)
            .reverse()
            .map((card) => (
              <div
                key={`${card.location}-${card.offset}`}
                className="absolute inset-0 rounded-xl border border-border bg-card shadow-md"
                style={{
                  transform: `translateY(${card.offset * 8}px) scale(${1 - card.offset * 0.04})`,
                  opacity: 1 - card.offset * 0.25,
                  zIndex: 10 - card.offset,
                }}
              >
                <img
                  src={card.image}
                  alt=""
                  className="h-2/3 w-full rounded-t-xl object-cover"
                  loading="lazy"
                />
                <div className="p-3">
                  <div className="text-sm font-bold text-foreground">{card.price}</div>
                  <div className="text-xs text-muted-foreground">{card.location}</div>
                  <div className="text-xs text-muted-foreground">{card.rooms}</div>
                </div>
              </div>
            ))}

          {/* Front card (animated) */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, x: 0, rotate: 0 }}
              exit={{
                x: swipeDirection * 200,
                rotate: swipeDirection * 15,
                opacity: 0,
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 rounded-xl border border-border bg-card shadow-lg"
              style={{ zIndex: 20 }}
            >
              <img
                src={visibleCards[0].image}
                alt=""
                className="h-2/3 w-full rounded-t-xl object-cover"
                width={234}
                height={226}
              />
              <div className="p-3">
                <div className="text-sm font-bold text-foreground">{visibleCards[0].price}</div>
                <div className="text-xs text-muted-foreground">{visibleCards[0].location}</div>
                <div className="text-xs text-muted-foreground">{visibleCards[0].rooms}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-6 py-3">
          <div className="w-12 h-12 rounded-full border-2 border-destructive/30 flex items-center justify-center">
            <span className="text-destructive text-lg" aria-hidden="true">✕</span>
          </div>
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-md">
            <span className="text-white text-xl" aria-hidden="true">♥</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  const { t } = useTranslation()

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-20 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          {/* Text content */}
          <div className="flex-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              {t("hero.badge")}
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight text-foreground"
            >
              {t("hero.title1")}
              <br />
              <span className="text-primary">{t("hero.title2")}</span>
              <br />
              {t("hero.title3")}
            </motion.h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <a
                href="https://app.rooomi.com"
                className="bg-primary px-7 py-3.5 rounded-full text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                {t("hero.cta")}
                <ArrowRight className="w-4 h-4" />
              </a>
              <span className="text-muted-foreground text-sm">
                {t("hero.ctaSecondary")}
              </span>
            </motion.div>
          </div>

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-shrink-0"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

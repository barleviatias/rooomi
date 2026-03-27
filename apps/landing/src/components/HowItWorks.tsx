import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { Smartphone, Heart, Handshake, Send } from "lucide-react"

/* ── Mini phone screens for each step ── */

function FeedScreen() {
  const apartments = [
    { price: "₪3,500", location: "Florentin", img: "bg-gradient-to-br from-rose-200 to-orange-100" },
    { price: "₪4,200", location: "Neve Tzedek", img: "bg-gradient-to-br from-sky-200 to-blue-100" },
    { price: "₪2,900", location: "Old North", img: "bg-gradient-to-br from-emerald-200 to-teal-100" },
  ]

  return (
    <div className="flex flex-col gap-2 p-2 h-full overflow-hidden">
      {apartments.map((apt) => (
        <div key={apt.location} className="rounded-lg border border-border bg-background overflow-hidden flex-1 min-h-0">
          <div className={`h-3/5 ${apt.img}`} />
          <div className="p-2">
            <div className="text-[11px] font-bold text-foreground">{apt.price}/mo</div>
            <div className="text-[10px] text-muted-foreground">{apt.location}, Tel Aviv</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SwipeScreen() {
  return (
    <div className="relative h-full p-2 flex flex-col">
      {/* Back card */}
      <div className="absolute top-4 left-4 right-4 h-[75%] rounded-xl border border-border bg-background shadow-sm"
        style={{ transform: "scale(0.95) translateY(8px)", opacity: 0.6 }}
      >
        <div className="h-3/5 rounded-t-xl bg-gradient-to-br from-amber-200 to-yellow-100" />
      </div>

      {/* Front card */}
      <div className="relative rounded-xl border border-border bg-background shadow-md flex-1 min-h-0 overflow-hidden">
        <div className="h-3/5 bg-gradient-to-br from-rose-200 to-pink-100" />
        <div className="p-2.5">
          <div className="text-xs font-bold text-foreground">₪3,800/mo</div>
          <div className="text-[10px] text-muted-foreground">Rothschild, Tel Aviv</div>
          <div className="text-[10px] text-muted-foreground">3 rooms · 75m²</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-5 py-2.5 shrink-0">
        <div className="w-10 h-10 rounded-full border-2 border-destructive/30 flex items-center justify-center">
          <span className="text-destructive text-sm" aria-hidden="true">✕</span>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-sm">
          <span className="text-white text-base" aria-hidden="true">♥</span>
        </div>
      </div>
    </div>
  )
}

function MatchScreen() {
  return (
    <div className="flex flex-col h-full p-2">
      {/* Match banner */}
      <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-center mb-2">
        <div className="text-lg" aria-hidden="true">🎉</div>
        <div className="text-xs font-bold text-primary">It&apos;s a Match!</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">You and the apartment liked each other</div>
      </div>

      {/* Chat preview */}
      <div className="flex-1 flex flex-col justify-end gap-1.5 min-h-0 mb-2">
        <div className="self-start max-w-[75%] rounded-xl rounded-bl-sm bg-muted px-3 py-1.5">
          <div className="text-[10px] text-foreground">Hey! When can you come see the place?</div>
        </div>
        <div className="self-end max-w-[75%] rounded-xl rounded-br-sm bg-primary px-3 py-1.5">
          <div className="text-[10px] text-primary-foreground">I&apos;d love to! Is Thursday good?</div>
        </div>
        <div className="self-start max-w-[75%] rounded-xl rounded-bl-sm bg-muted px-3 py-1.5">
          <div className="text-[10px] text-foreground">Perfect, 6pm works 👍</div>
        </div>
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex-1 rounded-full bg-muted px-3 py-1.5">
          <div className="text-[10px] text-muted-foreground">Type a message…</div>
        </div>
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
          <Send className="w-3 h-3 text-primary-foreground" />
        </div>
      </div>
    </div>
  )
}

const screens = [FeedScreen, SwipeScreen, MatchScreen]

/* ── Step data ── */

const steps = [
  { key: "step1", icon: Smartphone },
  { key: "step2", icon: Heart },
  { key: "step3", icon: Handshake },
]

/* ── Main component ── */

export function HowItWorks() {
  const { t } = useTranslation()
  const [activeStep, setActiveStep] = useState(0)
  const { ref, isInView } = useScrollReveal()
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  // Scroll-driven step activation
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    stepRefs.current.forEach((el, i) => {
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveStep(i)
          }
        },
        { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const ActiveScreen = screens[activeStep]

  return (
    <section id="how-it-works" className="py-24 sm:py-32 relative" ref={ref}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-semibold mb-4">
            {t("howItWorks.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">{t("howItWorks.title")}</h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 max-w-5xl mx-auto">
          {/* Timeline steps — scrollable */}
          <div className="flex-1 w-full">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute start-5 top-0 bottom-0 w-px bg-border hidden sm:block" />

              {/* Progress indicator on the line */}
              <div
                className="absolute start-5 top-0 w-px bg-primary hidden sm:block transition-all duration-500"
                style={{ height: `${((activeStep + 1) / steps.length) * 100}%` }}
              />

              <div className="flex flex-col">
                {steps.map((step, i) => {
                  const isActive = activeStep === i
                  const isPast = i < activeStep
                  const Icon = step.icon

                  return (
                    <div
                      key={step.key}
                      ref={(el) => { stepRefs.current[i] = el }}
                      onClick={() => setActiveStep(i)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveStep(i) }}
                      className={`relative flex items-start gap-4 sm:gap-5 text-start py-12 sm:ps-0 px-4 cursor-pointer transition-opacity duration-300 ${
                        isActive ? "opacity-100" : "opacity-50 hover:opacity-75"
                      }`}
                    >
                      {/* Step circle */}
                      <div
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md scale-110"
                            : isPast
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Text content */}
                      <div className="pt-1">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}>
                          Step {i + 1}
                        </span>
                        <h3 className={`text-xl font-bold mt-1 mb-2 transition-colors ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {t(`howItWorks.${step.key}Title`)}
                        </h3>
                        <p className={`text-sm leading-relaxed max-w-sm transition-colors ${
                          isActive ? "text-muted-foreground" : "text-muted-foreground/50"
                        }`}>
                          {t(`howItWorks.${step.key}Desc`)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Phone mockup — sticky on desktop */}
          <div className="shrink-0 lg:sticky lg:top-32 lg:self-start">
            <div className="relative w-[240px] h-[480px] mx-auto">
              <div className="absolute inset-0 rounded-[2.5rem] border-[3px] border-foreground/10 bg-card shadow-2xl overflow-hidden">
                {/* Status bar */}
                <div className="flex items-center justify-between px-5 pt-3 pb-1">
                  <span className="text-[10px] text-muted-foreground font-medium">9:41</span>
                  <div className="w-16 h-4 bg-foreground/10 rounded-full" />
                  <div className="w-3 h-2 bg-muted-foreground/40 rounded-sm" />
                </div>

                {/* App header */}
                <div className="px-3 py-1.5 flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">Roomi</span>
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded-full bg-muted" />
                  </div>
                </div>

                {/* Screen content */}
                <div className="h-[380px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                    >
                      <ActiveScreen />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

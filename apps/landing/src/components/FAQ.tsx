import { useState } from "react"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { useScrollReveal } from "@/hooks/useScrollReveal"

const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6"]

export function FAQ() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { ref, isInView } = useScrollReveal()

  return (
    <section id="faq" className="py-24 sm:py-32" ref={ref}>
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">{t("faq.title")}</h2>
        </motion.div>

        <div className="space-y-3">
          {faqKeys.map((key, i) => (
            <div
              key={key}
              className="rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-start font-semibold hover:bg-muted transition-colors cursor-pointer"
              >
                <span>{t(`faq.${key}`)}</span>
                <motion.span
                  animate={{ rotate: openIndex === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-2xl text-primary shrink-0 ms-4"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-muted-foreground leading-relaxed">
                      {t(`faq.a${key.slice(1)}`)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

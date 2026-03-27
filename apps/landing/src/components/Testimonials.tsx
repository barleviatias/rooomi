import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { ArrowRight } from "lucide-react"

export function Testimonials() {
  const { t } = useTranslation()
  const { ref, isInView } = useScrollReveal()

  return (
    <section className="py-24 sm:py-32 bg-primary/5" ref={ref}>
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            {t("cta.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t("cta.subtitle")}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://app.rooomi.com"
              className="bg-primary px-8 py-4 rounded-full text-white font-semibold text-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              {t("cta.button")}
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{t("cta.note")}</p>
        </motion.div>
      </div>
    </section>
  )
}

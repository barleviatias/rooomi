import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { Building2, Landmark, Mountain, Sun } from "lucide-react"

const cities = [
  { key: "tlv", icon: <Building2 className="w-5 h-5" /> },
  { key: "jlm", icon: <Landmark className="w-5 h-5" /> },
  { key: "haifa", icon: <Mountain className="w-5 h-5" /> },
  { key: "beer", icon: <Sun className="w-5 h-5" /> },
]

export function Cities() {
  const { t } = useTranslation()
  const { ref, isInView } = useScrollReveal()

  return (
    <section id="cities" className="py-24 sm:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            {t("cities.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">{t("cities.title")}</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">{t("cities.subtitle")}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {cities.map((city) => (
            <div
              key={city.key}
              className="group rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                {city.icon}
              </div>
              <h3 className="text-base font-semibold text-foreground">{t(`cities.${city.key}`)}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t(`cities.${city.key}Desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

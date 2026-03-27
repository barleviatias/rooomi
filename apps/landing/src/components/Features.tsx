import { useTranslation } from "react-i18next"
import { motion } from "framer-motion"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { Brain, MessageCircle, Home, UserCircle, Map, ShieldOff } from "lucide-react"

const features = [
  { key: "f1", icon: <Brain className="w-6 h-6 text-primary-foreground" />, span: "md:col-span-2" },
  { key: "f2", icon: <MessageCircle className="w-6 h-6 text-primary-foreground" />, span: "" },
  { key: "f3", icon: <Home className="w-6 h-6 text-primary-foreground" />, span: "" },
  { key: "f4", icon: <UserCircle className="w-6 h-6 text-primary-foreground" />, span: "md:col-span-2" },
  { key: "f5", icon: <Map className="w-6 h-6 text-primary-foreground" />, span: "md:col-span-2" },
  { key: "f6", icon: <ShieldOff className="w-6 h-6 text-primary-foreground" />, span: "" },
]

export function Features() {
  const { t } = useTranslation()
  const { ref, isInView } = useScrollReveal()

  return (
    <section id="features" className="py-24 sm:py-32 gradient-dark relative" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary-foreground text-sm font-semibold mb-4">
            {t("features.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{t("features.title")}</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {features.map((f) => (
            <div
              key={f.key}
              className={`${f.span} group relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-colors`}
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{t(`features.${f.key}Title`)}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{t(`features.${f.key}Desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

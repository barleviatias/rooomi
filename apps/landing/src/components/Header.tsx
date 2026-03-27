import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
  const { t, i18n } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const toggleLang = () => {
    const next = i18n.language === "he" ? "en" : "he"
    i18n.changeLanguage(next)
    localStorage.setItem("roomi-lang", next)
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    setMenuOpen(false)
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed top-0 inset-x-0 z-50 transition-colors transition-shadow duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-xl shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-2">
          <div className="bg-primary h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            R
          </div>
          <span className="text-xl font-bold text-primary">Roomi</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: t("nav.howItWorks"), id: "how-it-works" },
            { label: t("nav.features"), id: "features" },
            { label: t("nav.cities"), id: "cities" },
            { label: t("nav.faq"), id: "faq" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="h-8 px-3 rounded-full text-sm font-semibold border border-primary/20 text-primary hover:bg-primary/5 transition-colors cursor-pointer"
          >
            {t("nav.language")}
          </button>
          <a
            href="https://app.rooomi.com"
            className="hidden md:flex bg-primary h-9 px-5 rounded-full items-center text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            {t("nav.cta")}
          </a>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="md:hidden h-9 w-9 flex items-center justify-center cursor-pointer"
          >
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-6 bg-foreground transition-transform transition-opacity ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 w-6 bg-foreground transition-transform transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-6 bg-foreground transition-transform transition-opacity ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t"
          >
            <div className="px-6 py-4 space-y-3">
              {[
                { label: t("nav.howItWorks"), id: "how-it-works" },
                { label: t("nav.features"), id: "features" },
                { label: t("nav.cities"), id: "cities" },
                { label: t("nav.faq"), id: "faq" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="block w-full text-start py-2 text-base font-medium text-muted-foreground hover:text-primary cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
              <a
                href="https://app.rooomi.com"
                className="block w-full bg-primary text-center py-3 rounded-full text-white font-semibold"
              >
                {t("nav.cta")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

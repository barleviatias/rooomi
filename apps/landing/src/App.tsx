import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Header } from "@/components/Header"
import { Hero } from "@/components/Hero"
import { HowItWorks } from "@/components/HowItWorks"
import { Features } from "@/components/Features"
import { Cities } from "@/components/Cities"
import { Testimonials } from "@/components/Testimonials"
import { FAQ } from "@/components/FAQ"
import { Footer } from "@/components/Footer"

export function App() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const dir = i18n.language === "he" ? "rtl" : "ltr"
    const lang = i18n.language
    document.documentElement.dir = dir
    document.documentElement.lang = lang
  }, [i18n.language])

  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Cities />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}

import { useTranslation } from "react-i18next"
import { Instagram, Twitter, Facebook } from "lucide-react"

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="gradient-dark text-white/80 pt-20 pb-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                R
              </div>
              <span className="text-xl font-bold text-white">Roomi</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-3 mt-6">
              {[
                { name: "instagram", icon: <Instagram className="w-4 h-4" /> },
                { name: "twitter", icon: <Twitter className="w-4 h-4" /> },
                { name: "facebook", icon: <Facebook className="w-4 h-4" /> },
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  aria-label={social.name}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: t("footer.product"),
              links: [
                { label: t("nav.howItWorks"), href: "#how-it-works" },
                { label: t("nav.features"), href: "#features" },
                { label: t("nav.cities"), href: "#cities" },
                { label: t("nav.faq"), href: "#faq" },
              ],
            },
            {
              title: t("footer.company"),
              links: [
                { label: t("footer.about"), href: "#" },
                { label: t("footer.blog"), href: "#" },
                { label: t("footer.careers"), href: "#" },
                { label: t("footer.contact"), href: "#" },
              ],
            },
            {
              title: t("footer.legal"),
              links: [
                { label: t("footer.terms"), href: "#" },
                { label: t("footer.privacy"), href: "#" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-white mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-white/50 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © 2026 Roomi. {t("footer.rights")}.
          </p>
          <p className="text-xs text-white/40">
            {t("footer.madeWith")}
          </p>
        </div>
      </div>
    </footer>
  )
}

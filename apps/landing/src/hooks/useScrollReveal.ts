import { useRef } from "react"
import { useInView, type UseInViewOptions } from "framer-motion"

export function useScrollReveal(margin: UseInViewOptions["margin"] = "-100px") {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin })
  return { ref, isInView }
}

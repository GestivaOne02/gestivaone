import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ScrollIndicator({ targetRef, selector }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let el = null
    
    const findElement = () => {
      if (targetRef && targetRef.current) {
        el = targetRef.current
      } else if (selector) {
        el = document.querySelector(selector)
      }
    }

    findElement()
    if (!el) {
      // If element not available yet, retry in 200ms
      const retryTimeout = setTimeout(() => {
        findElement()
        if (el) setupListeners()
      }, 200)
      return () => clearTimeout(retryTimeout)
    }

    let observer = null

    const checkScroll = () => {
      if (!el) return
      const { scrollTop, scrollHeight, clientHeight } = el
      // Only show on scrollable containers where we haven't reached the bottom
      const hasOverflow = scrollHeight > clientHeight
      const isNotAtBottom = scrollTop < (scrollHeight - clientHeight - 30)
      setShow(hasOverflow && isNotAtBottom)
    }

    const setupListeners = () => {
      checkScroll()
      el.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)

      observer = new MutationObserver(checkScroll)
      observer.observe(el, { childList: true, subtree: true, attributes: true })
    }

    const setup = () => {
      setupListeners()
    }

    setup()

    // Periodical check to sync state (e.g. after animations or images load)
    const interval = setInterval(checkScroll, 400)

    return () => {
      if (el) {
        el.removeEventListener('scroll', checkScroll)
      }
      window.removeEventListener('resize', checkScroll)
      if (observer) {
        observer.disconnect()
      }
      clearInterval(interval)
    }
  }, [targetRef, selector])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.8 }}
          className="absolute top-20 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none sm:hidden"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white shadow-lg border border-brand-500 animate-bounce">
            <ChevronDown size={18} className="stroke-[3]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

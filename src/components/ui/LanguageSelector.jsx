import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguageStore, LANGUAGES } from '@/store/useLanguageStore'
import Icon from '@/components/ui/Icon';

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { currentLang, setLanguage } = useLanguageStore()

  const selectedLangObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0]

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-700/60 hover:bg-surface-600 text-foreground text-xs font-semibold transition-all focus:outline-none border border-subtle shadow-sm"
        aria-expanded={isOpen}
      >
        <Icon name="Languages" size={15} className="text-brand-400"  />
        <span>{selectedLangObj.name}</span>
        <Icon name="ChevronDown" size={14} className={`opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}  />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-40 bg-surface-800 border border-subtle rounded-xl shadow-2xl p-1 z-50 backdrop-blur-xl text-foreground"
          >
            <div className="space-y-0.5">
              {LANGUAGES.map((lang) => {
                const isSelected = lang.code === currentLang
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-brand-600/20 text-brand-400 font-bold'
                        : 'text-muted-500 hover:bg-surface-700 hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                    {isSelected && <Icon name="Check" size={14} className="text-brand-400"  />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import clsx from 'clsx'
import SEOHead from '@/components/seo/SEOHead'
import FAQSection from '@/components/landing/FAQSection'
import GEOPromptsSection from '@/components/landing/GEOPromptsSection'
import CEOUseCasesSection from '@/components/landing/CEOUseCasesSection'
import FloatingWhatsApp from '@/components/ui/FloatingWhatsApp'
import TrustEEATSection from '@/components/landing/TrustEEATSection'
import LanguageSelector from '@/components/ui/LanguageSelector'
import { useLanguageStore } from '@/store/useLanguageStore'
import Icon from '@/components/ui/Icon';

export default function Landing() {
  const navigate = useNavigate()
  const { t } = useLanguageStore()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [showAppsMenu, setShowAppsMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [contactSent, setContactSent] = useState(false)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setIsDarkMode(isDark)
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    if (html.classList.contains('dark')) {
      html.classList.remove('dark')
      setIsDarkMode(false)
      localStorage.setItem('theme', 'light')
    } else {
      html.classList.add('dark')
      setIsDarkMode(true)
      localStorage.setItem('theme', 'dark')
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
  }

  return (
    <div className="min-h-screen bg-surface-900 text-foreground selection:bg-brand-500/30 selection:text-brand-300 transition-colors duration-200">
      <SEOHead />

      {/* ─── STICKY HEADER ─── */}
      <header className="sticky top-0 z-50 bg-surface-900/90 backdrop-blur-xl border-b border-subtle transition-colors duration-200">
        {/* Tier 1: Logo centered at the top */}
        <div className="border-b border-white/5 py-3 px-4 flex items-center justify-center relative">
          {/* Apps Menu Dropdown Trigger (Left) */}
          <div className="absolute left-4 sm:left-8 flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={() => setShowAppsMenu(!showAppsMenu)}
                onBlur={() => setTimeout(() => setShowAppsMenu(false), 200)}
                className="text-muted-400 hover:text-foreground transition-colors p-2 rounded-xl hover:bg-surface-800 flex items-center gap-1.5 text-xs font-semibold"
                aria-label="Apps Menu"
              >
                <Icon name="LayoutGrid" size={18} />
                <span className="hidden sm:inline text-xs">Ecosistema</span>
              </button>
              <AnimatePresence>
                {showAppsMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-surface-900 border border-subtle rounded-2xl shadow-xl overflow-hidden z-50 p-2"
                  >
                    <div className="px-3 py-2 text-[10px] font-bold text-muted-400 uppercase tracking-wider">
                      Más productos de Gestiva
                    </div>
                    <a
                      href="https://gestivapost.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-800 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                        <Icon name="Palette" size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">GestivaPost</span>
                        <span className="text-xs text-muted-400">Software de Diseño</span>
                      </div>
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Centered GestivaOne Logo */}
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <img src="/images/gestivaOneIcon.svg" alt="GestivaOne Logo" className="h-9 w-auto" />
            <span className="font-extrabold text-foreground text-xl tracking-tight">
              Gestiva<span className="text-brand-500">One</span>
            </span>
          </Link>

          {/* Right User & Theme shortcuts */}
          <div className="absolute right-4 sm:right-8 flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-muted-400 hover:text-foreground hover:bg-surface-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Icon name="Sun" size={18} /> : <Icon name="Moon" size={18} />}
            </button>
            <Link
              to="/auth?mode=login"
              className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white hover:bg-brand-700 transition-all overflow-hidden"
              title={t('nav.login')}
            >
              <Icon name="User" size={16} />
            </Link>
          </div>
        </div>

        {/* Tier 2: Navigation Links (Left) and Language Selector (Right) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-surface-800/60">
          <div className="flex items-center justify-between h-14">
            {/* Left: Navigation Buttons */}
            <div className="hidden lg:flex items-center gap-6">
              <a href="#caracteristicas" className="text-xs font-bold uppercase tracking-wider text-muted-400 hover:text-foreground transition-colors">{t('nav.features')}</a>
              <a href="#nosotros" className="text-xs font-bold uppercase tracking-wider text-muted-400 hover:text-foreground transition-colors">{t('nav.about')}</a>
              <a href="#precios" className="text-xs font-bold uppercase tracking-wider text-muted-400 hover:text-foreground transition-colors">{t('nav.pricing')}</a>
              <a href="#contacto" className="text-xs font-bold uppercase tracking-wider text-muted-400 hover:text-foreground transition-colors">{t('nav.contact')}</a>

              <a
                href="https://gestivaone-store.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-extrabold uppercase tracking-wider text-brand-400 hover:text-brand-300 transition-colors"
              >
                {t('nav.marketplace')}
              </a>

              <Link
                to="/auth?mode=register"
                className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all duration-300 shadow-md ml-2"
              >
                {t('nav.start')}
              </Link>
            </div>

            {/* Mobile Menu Button (Left on Mobile) */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-muted-400 hover:text-foreground hover:bg-surface-800 transition-colors flex items-center gap-2 text-xs font-bold"
                aria-label="Toggle Mobile Navigation"
              >
                {mobileMenuOpen ? <Icon name="X" size={20} /> : <Icon name="Menu" size={20} />}
                <span>Menú</span>
              </button>
            </div>

            {/* Right: Language Selector Button */}
            <div className="flex items-center gap-3">
              <LanguageSelector />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-surface-900 border-b border-subtle overflow-hidden"
            >
              <div className="px-4 pt-3 pb-6 space-y-3">
                <a
                  href="#caracteristicas"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-muted-400 hover:text-foreground hover:bg-surface-800 transition-colors"
                >
                  {t('nav.features')}
                </a>
                <a
                  href="#nosotros"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-muted-400 hover:text-foreground hover:bg-surface-800 transition-colors"
                >
                  {t('nav.about')}
                </a>
                <a
                  href="#precios"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-muted-400 hover:text-foreground hover:bg-surface-800 transition-colors"
                >
                  {t('nav.pricing')}
                </a>
                <a
                  href="#contacto"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-muted-400 hover:text-foreground hover:bg-surface-800 transition-colors"
                >
                  {t('nav.contact')}
                </a>

                <a
                  href="https://gestivaone-store.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-extrabold text-brand-400 hover:bg-surface-800 transition-colors"
                >
                  {t('nav.marketplace')}
                </a>

                <div className="pt-3 border-t border-subtle flex flex-col gap-2">
                  <Link
                    to="/auth?mode=login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-subtle text-sm font-bold text-foreground hover:bg-surface-800 transition-colors"
                  >
                    {t('nav.login')}
                  </Link>

                  <Link
                    to="/auth?mode=register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md transition-colors"
                  >
                    {t('nav.start')}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden py-8 lg:py-12 bg-[#0e0e17]">
        {/* Subtle purple glow on top */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Glass card wrapping everything */}
            <motion.div
              variants={itemVariants}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 lg:p-7"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                {/* Hero text content — left column */}
                <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
                  <motion.div
                    variants={itemVariants}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider"
                  >
                    <Icon name="ShieldCheck" size={14} />
                    {t('hero.badge')}
                  </motion.div>

                  <motion.h1
                    variants={itemVariants}
                    className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-white"
                  >
                    {t('hero.title1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">{t('hero.title2')}</span>
                  </motion.h1>

                  <motion.p
                    variants={itemVariants}
                    className="text-base sm:text-lg text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                  >
                    {t('hero.desc')}
                  </motion.p>

                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
                  >
                    <Link
                      to="/auth?mode=register"
                      className="w-full sm:w-auto text-center px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-extrabold transition-all duration-300 shadow-lg shadow-brand-500/25 active:scale-95 flex items-center justify-center gap-2"
                    >
                      {t('hero.ctaPrimary')}
                    </Link>
                    <a
                      href="#caracteristicas"
                      className="w-full sm:w-auto text-center px-6 py-4 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 text-muted-400 hover:text-white text-sm font-semibold transition-colors backdrop-blur-sm"
                    >
                      {t('hero.ctaSecondary')}
                    </a>
                  </motion.div>

                  <p className="text-[11px] text-white/50 text-center lg:text-left pt-1 font-medium">
                    {t('hero.trustMicro')}
                  </p>

                  {/* Wompi integration */}
                  <motion.div
                    variants={itemVariants}
                    className="pt-6 flex flex-col items-center lg:items-start gap-2"
                  >
                    <span className="text-muted-400 font-semibold text-xs tracking-wider uppercase">Pagos Procesados con</span>
                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-surface-800/80 border border-subtle backdrop-blur-md transition-all">
                      <svg viewBox="0 0 320 80" className="h-10 sm:h-11 w-auto block" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Wompi por Bancolombia">
                        <g transform="translate(-4, -6) scale(0.095)">
                          <path d="M824.843 191.763V366.083C824.843 376.546 819.728 386.387 811.149 392.441L643.924 510.321C643.924 510.321 643.768 510.414 643.706 510.476C635.97 516.033 631.104 524.664 630.355 534.039C630.262 534.94 630.23 535.84 630.23 536.74V805.222C630.23 814.132 622.962 821.366 614.01 821.366H601.689C595.918 821.366 590.584 818.292 587.683 813.356L416.59 521.404C416.59 521.404 416.527 521.28 416.465 521.249C412.722 515.102 403.146 517.741 403.146 525.005V805.222C403.146 814.132 395.878 821.366 386.925 821.366H374.604C368.833 821.366 363.499 818.292 360.598 813.356L182.58 509.638C178.276 502.342 176.03 494.022 176.03 485.546V191.763C176.03 182.822 183.298 175.619 192.25 175.619H204.571C210.311 175.619 215.645 178.662 218.577 183.598L389.67 475.55C393.382 481.883 403.115 479.275 403.115 471.948V191.763C403.115 182.822 410.382 175.619 419.335 175.619H431.656C437.396 175.619 442.73 178.662 445.662 183.598L616.755 475.55C620.467 481.883 630.199 479.275 630.199 471.948V318.739C630.199 303.216 637.748 288.656 650.475 279.684L793.9 178.568C796.645 176.644 799.92 175.619 803.289 175.619H808.623C817.575 175.619 824.843 182.822 824.843 191.763Z" fill="#FFFFFF"/>
                        </g>
                        <text x="82" y="48" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="42" fill="#FFFFFF" letterSpacing="-1.5">wompi</text>
                        <text x="83" y="66" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="11" fill="#FFFFFF" letterSpacing="1.5">BY BANCOLOMBIA</text>
                      </svg>
                    </div>
                  </motion.div>
                </div>

                {/* Dashboard / Video player — right column */}
                <motion.div
                  variants={itemVariants}
                  className="lg:col-span-7 relative"
                >
                  <div className="absolute -inset-2 bg-brand-500/15 rounded-3xl blur-xl pointer-events-none" />

                  <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-[#0e0e17] border border-white/10">
                    <div className="relative flex items-center gap-3 px-3 py-2 bg-[#0e0e17] border-b border-white/5">
                      <div className="flex items-center gap-2 text-white/60">
                        <button className="p-1 hover:text-white transition-colors"><Icon name="ArrowLeft" size={16} strokeWidth={2.5} /></button>
                        <button className="p-1 hover:text-white transition-colors opacity-50"><Icon name="ArrowRight" size={16} strokeWidth={2.5} /></button>
                        <button className="p-1 hover:text-white transition-colors"><Icon name="RotateCw" size={14} strokeWidth={2.5} /></button>
                        <button className="p-1 hover:text-white transition-colors ml-1"><Icon name="Home" size={16} strokeWidth={2} /></button>
                      </div>
                      <div className="flex-1 flex items-center justify-between bg-white/10 rounded-full h-8 px-3 mx-2 border border-white/5">
                        <div className="flex items-center gap-2 text-white/60">
                          <Icon name="SlidersHorizontal" size={14} strokeWidth={2} />
                          <span className="text-xs text-white font-medium tracking-wide">gestivaone.com</span>
                        </div>
                        <button className="text-white/60 hover:text-white transition-colors">
                          <Icon name="Star" size={14} strokeWidth={2} />
                        </button>
                      </div>
                    </div>

                    <div className="relative bg-[#0e0e17] w-full aspect-video overflow-hidden group cursor-pointer" onClick={() => setShowVideo(true)}>
                      {showVideo ? (
                        <iframe
                          src="https://www.youtube-nocookie.com/embed/0XhKFxjnsh8?autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1"
                          title="GestivaOne Demo"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full border-0"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <img
                            src="/images/gestivaOneFullPreview.png"
                            alt="GestivaOne Dashboard Preview"
                            className="w-full h-full object-cover object-top"
                          />
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-all group-hover:bg-black/30">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setShowVideo(true); }}
                              className="w-16 h-16 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-2xl shadow-brand-500/50 group-hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/20"
                              aria-label="Reproducir video demo"
                            >
                              <svg
                                viewBox="0 0 267.49 259.62"
                                className="w-8 h-8 fill-white text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                              >
                                <path fill="white" d="M205.88,163.76c-8.76,0-17.24-.03-25.72,0-13.89.07-27.78.23-41.67.26-11.68.03-21.43-9.19-22.13-20.8-.72-11.98,7.91-22.5,19.59-23.94,2.05-.25,4.1-.25,6.15-.25,33.74,0,67.47,0,101.21.02,13.74.01,24.13,10.28,24.15,23.97.04,29.36.03,58.71,0,88.07,0,9.44-6.01,17.45-14.79,19.97-8.54,2.44-17.87-1.06-22.76-8.64-2.41-3.73-3.3-7.88-3.15-12.32.22-6.22.33-12.44.47-18.67.02-1.02,0-2.04,0-3.57-.93,1.24-1.61,2.13-2.26,3.02-15.06,20.7-35.25,34.26-59.32,42.28-15.14,5.05-30.77,7.12-46.69,6.23-12.07-.67-21.12-10.67-20.66-22.27.48-12.37,10.44-21.97,22.77-21.7,9.35.2,18.62-.2,27.66-2.77,25.64-7.3,44.44-22.86,56.26-46.8.3-.6.52-1.24.89-2.12Z"/>
                                <path fill="white" d="M0,131.1c.51-28.99,9.51-55.09,27.25-78.02C49.13,24.78,77.72,7.39,113.11,1.69c26.48-4.26,51.9-.46,76.12,11.13,7,3.35,13.63,7.38,19.65,12.23,14.34,11.56,12.29,32.19-3.24,39.45-8.53,3.98-16.74,2.55-24.17-2.95-10.16-7.52-21.19-13.2-33.7-15.31-28.13-4.75-52.9,2.75-74.11,21.62-15.73,14-24.75,31.77-27.73,52.6-1.09,7.63-.94,15.29-.09,22.93,1.16,10.5-5.68,20.93-15.91,24.02-10.01,3.02-21.33-1.79-26.15-11.16-1.61-3.13-2.54-6.46-2.87-9.99-.46-5.04-.91-10.08-.91-15.17Z"/>
                                <path fill="white" d="M77.11,214.61c-1.21,15.51-14.09,27.24-28.65,26.22-15.53-1.09-26.83-13.91-26-28.84.89-16.06,14.21-27.46,30.07-26.03,14.8,1.34,25.24,14.39,24.58,28.64Z"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Client Logos Marquee */}
        <div className="mt-6 pt-2 pb-2 overflow-hidden relative">
          <h3 className="text-center text-xl sm:text-2xl font-extrabold text-white mb-1">
            Familia Gestiva<span className="text-brand-400">One</span>
          </h3>
          <p className="text-center text-white/50 text-sm mb-4">
            <a href="mailto:support@gestivaone.com" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              ¿Quieres ser parte?
            </a>
          </p>

          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0e0e17] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0e0e17] to-transparent z-10 pointer-events-none" />
          
          <div className="flex overflow-hidden relative w-full">
            <motion.div
              className="flex shrink-0 items-center justify-center min-w-full"
              animate={{ x: ['0%', '-100%'] }}
              transition={{ repeat: Infinity, ease: 'linear', duration: 12 }}
            >
              <a href="https://festa.gestivaone.com/" target="_blank" rel="noopener noreferrer" className="shrink-0">
                <img src="/images/Coutomers/festaLogo.png" alt="Festa Events" width="160" height="96" decoding="async" className="h-20 sm:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity" />
              </a>
            </motion.div>
            <motion.div
              className="flex shrink-0 items-center justify-center min-w-full"
              animate={{ x: ['0%', '-100%'] }}
              transition={{ repeat: Infinity, ease: 'linear', duration: 12 }}
              aria-hidden="true"
            >
              <a href="https://festa.gestivaone.com/" target="_blank" rel="noopener noreferrer" className="shrink-0">
                <img src="/images/Coutomers/festaLogo.png" alt="Festa Events" width="160" height="96" decoding="async" className="h-20 sm:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="caracteristicas" className="py-10 bg-surface-800 border-t border-b border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-8">
            <h2 className="text-brand-400 text-xs font-bold uppercase tracking-widest">{t('features.tag')}</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-foreground">{t('features.title')}</p>
            <p className="text-sm text-muted-400">{t('features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: 'ShoppingCart',
                iconBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                tagline: 'GestivaOne • Módulo Activo',
                title: t('features.invTitle'),
                desc: t('features.invDesc'),
                tags: ['Stock Real', 'Alertas Mínimas', 'Multisede'],
                metric: 'Incluido en Pro',
                submetric: 'Gestión en Nube'
              },
              {
                icon: 'Printer',
                iconBg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
                tagline: 'GestivaOne • POS Térmico',
                title: t('features.posTitle'),
                desc: t('features.posDesc'),
                tags: ['Tickets 58/80mm', 'Bluetooth & USB', 'Rápido'],
                metric: 'Multidispositivo',
                submetric: 'Impresión 3 seg'
              },
              {
                icon: 'MessageSquare',
                iconBg: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
                tagline: 'GestivaOne • Notificaciones',
                title: t('features.crmTitle'),
                desc: t('features.crmDesc'),
                tags: ['WhatsApp Business', 'Cartera', 'SMTP Directo'],
                metric: 'Recaudos Rápidos',
                submetric: 'Cobro Automático'
              },
              {
                icon: 'BarChart3',
                iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                tagline: 'GestivaOne • Analítica',
                title: t('features.analyticsTitle'),
                desc: t('features.analyticsDesc'),
                tags: ['PDF & Excel', 'Flujo de Caja', 'Utilidades'],
                metric: 'Reportes 1 Click',
                submetric: 'Cierres de Caja'
              },
              {
                icon: 'Users',
                iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                tagline: 'GestivaOne • DIAN / Normativo',
                title: t('features.dianTitle'),
                desc: t('features.dianDesc'),
                tags: ['100% Normativo', 'Cifrado SSL', 'Notas Crédito'],
                metric: 'Validado DIAN',
                submetric: 'Nivel Bancario'
              },
              {
                icon: 'TrendingUp',
                iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                tagline: 'GestivaOne • Gastronomía',
                title: t('features.restaurantTitle'),
                desc: t('features.restaurantDesc'),
                tags: ['Comandas Cocina', 'Recetas & Stock', 'Control Mesas'],
                metric: 'Módulo Gourmet',
                submetric: 'Menú Virtual'
              }
            ].map((card, idx) => {
              return (
                <div
                  key={idx}
                  className="bg-surface-900 border border-subtle p-7 rounded-[28px] space-y-5 flex flex-col justify-between relative"
                >
                  <div className="space-y-4">
                    {/* Top Row: Circular Icon (Left) + Title Beside Icon */}
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-full border flex items-center justify-center shadow-sm shrink-0 ${card.iconBg}`}>
                        <Icon name={card.icon} size={22} />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-muted-400 block tracking-tight leading-none mb-1">
                          {card.tagline}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight leading-tight">
                          {card.title}
                        </h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-400 leading-relaxed">
                      {card.desc}
                    </p>

                    {/* Tag Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {card.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2.5 py-1 rounded-lg bg-surface-750 border border-subtle text-[10px] font-bold text-muted-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Row: Divider + Centered Metric Text */}
                  <div className="pt-4 border-t border-subtle/60 text-center">
                    <span className="text-sm font-extrabold text-foreground block">
                      {card.metric}
                    </span>
                    <span className="text-[10px] font-medium text-muted-400 block">
                      {card.submetric}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── CEO USE CASES SECTION ─── */}
      <CEOUseCasesSection />

      {/* ─── ABOUT US SECTION ─── */}
      <section id="nosotros" className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text description */}
            <div className="space-y-6">
              <span className="text-brand-400 text-xs font-bold uppercase tracking-widest">{t('nav.about')}</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">
                {t('trust.title')}
              </h2>
              <p className="text-sm text-muted-400 leading-relaxed">
                En GestivaOne, creemos que la contabilidad y la gestión operativa no deberían ser un dolor de cabeza para los emprendedores. Nacimos con la visión de crear un software intuitivo, potente y accesible que permita a cualquier negocio automatizar sus ventas, cobranzas y reportes ejecutivos.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-subtle">
                <div>
                  <h4 className="text-lg font-bold text-brand-400">99.9%</h4>
                  <p className="text-xs text-muted-500 uppercase font-semibold">Tiempo en línea garantizado</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-success-400">100%</h4>
                  <p className="text-xs text-muted-500 uppercase font-semibold">Datos respaldados y seguros</p>
                </div>
              </div>
            </div>

            {/* Visual illustration / cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-surface-800 border border-subtle p-6 rounded-3xl space-y-2">
                  <h4 className="text-sm font-bold text-foreground">Innovación</h4>
                  <p className="text-xs text-muted-400">Construimos sobre las tecnologías más rápidas y seguras del mercado.</p>
                </div>
                <div className="bg-surface-800 border border-subtle p-6 rounded-3xl space-y-2">
                  <h4 className="text-sm font-bold text-foreground">Simplicidad</h4>
                  <p className="text-xs text-muted-400">Nuestra interfaz está hecha para que no necesites experiencia previa en finanzas.</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-surface-800 border border-subtle p-6 rounded-3xl space-y-2">
                  <h4 className="text-sm font-bold text-foreground">Escalabilidad</h4>
                  <p className="text-xs text-muted-400">Crece de forma ilimitada añadiendo productos, sedes y trabajadores.</p>
                </div>
                <div className="bg-surface-800 border border-subtle p-6 rounded-3xl space-y-2">
                  <h4 className="text-sm font-bold text-foreground">Seguridad</h4>
                  <p className="text-xs text-muted-400">Acceso restringido por roles con cifrado de nivel bancario.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GEO SPECS SECTION ─── */}
      <GEOPromptsSection />

      {/* ─── PRICING SECTION ─── */}
      <section id="precios" className="py-10 bg-surface-800 border-t border-b border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-8">
            <span className="text-brand-400 text-xs font-bold uppercase tracking-widest">Planes de Suscripción</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">Precios transparentes y sin sorpresas</h2>
            <p className="text-sm text-muted-400">Encuentra el plan perfecto para las necesidades de tu empresa.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Plan 1: Standard */}
            <div className="bg-surface-750 border border-subtle p-8 rounded-3xl space-y-6 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-surface-650 text-muted-400 border border-subtle inline-block">One Standard</span>
                <div className="flex items-baseline">
                  <span className="text-4xl font-black text-foreground">$0</span>
                  <span className="text-xs text-muted-400 ml-1">/ siempre</span>
                </div>
                <p className="text-xs text-muted-400">Perfecto para pequeños comercios y profesionales independientes.</p>

                <ul className="space-y-3 pt-4 border-t border-subtle text-xs text-muted-300">
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> 1 trabajador</li>
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Facturación básica</li>
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Gestión de clientes</li>
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Inventario limitado</li>
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Soporte comunitario</li>
                </ul>
              </div>

              <Link
                to="/auth?mode=register&plan=standard"
                className="w-full text-center py-3 rounded-xl bg-surface-600 hover:bg-surface-500 border border-subtle text-foreground text-xs font-bold transition-all block"
              >
                Comenzar Gratis
              </Link>
            </div>

            {/* Plan 2: Pro */}
            <div className="bg-surface-750 border-2 border-brand-500 p-8 rounded-3xl space-y-6 flex flex-col justify-between relative">
              <div className="absolute top-4 right-4 bg-brand-600 text-white font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-full tracking-widest">
                MÁS POPULAR
              </div>
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 inline-block">One Pro</span>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-brand-400">$7.000</span>
                    <span className="text-xs text-muted-500 line-through">$32.000</span>
                  </div>
                  <span className="text-[10px] text-muted-400 block font-bold">/ mes COP</span>
                  <span className="text-[9px] font-black tracking-wider uppercase bg-success-500/15 text-success-700 dark:bg-success-950 dark:text-success-400 px-2 py-0.5 rounded block w-max">
                    78% DESCUENTO PRIMER MES
                  </span>
                </div>
                <p className="text-xs text-muted-400">Para negocios en crecimiento que requieren gestión de personal y reportes avanzados.</p>

                <ul className="space-y-3 pt-4 border-t border-subtle text-xs text-muted-300">
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Hasta 10 trabajadores</li>
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Todo lo de Standard</li>
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Dashboard avanzado</li>
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Gestión de empleados</li>
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Reportes PDF/Excel</li>
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Soporte prioritario</li>
                </ul>
              </div>

              <Link
                to="/auth?mode=register&plan=pro"
                className="w-full text-center py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all block"
              >
                Obtener Plan Pro
              </Link>
            </div>

            {/* Plan 3: 360 */}
            <div className="bg-surface-750 border border-subtle p-8 rounded-3xl space-y-6 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-surface-650 text-muted-400 border border-subtle inline-block">One 360</span>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-foreground">$80.000</span>
                    <span className="text-xs text-muted-500 line-through">$120.000</span>
                  </div>
                  <span className="text-[10px] text-muted-400 block font-bold">/ mes COP</span>
                  <span className="text-[9px] font-black tracking-wider uppercase bg-success-500/15 text-success-700 dark:bg-success-950 dark:text-success-400 px-2 py-0.5 rounded block w-max">
                    33% DESCUENTO PRIMEROS 3 MESES
                  </span>
                </div>
                <p className="text-xs text-muted-400">Para empresas consolidadas que buscan automatización avanzada y multi-dispositivo.</p>

                <ul className="space-y-3 pt-4 border-t border-subtle text-xs text-muted-300">
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Hasta 30 trabajadores</li>
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Todo lo de Pro</li>
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Multi-sucursal</li>
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> API personalizada</li>
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Gerente de cuenta dedicado</li>
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> SLA 99.9%</li>
                </ul>
              </div>

              <Link
                to="/auth?mode=register&plan=empresarial"
                className="w-full text-center py-3 rounded-xl bg-surface-600 hover:bg-surface-500 border border-subtle text-foreground text-xs font-bold transition-all block"
              >
                Obtener Plan 360
              </Link>
            </div>

            {/* Plan 4: Enterprise */}
            <div className="bg-surface-750 border border-subtle p-8 rounded-3xl space-y-6 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-surface-650 text-muted-400 border border-subtle inline-block">Enterprise</span>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-foreground">A Medida</span>
                  </div>
                  <span className="text-[10px] text-muted-400 block font-bold">Plan personalizado</span>
                </div>
                <p className="text-xs text-muted-400">Soluciones de alto rendimiento para corporaciones complejas que requieren desarrollos customizados.</p>

                <ul className="space-y-3 pt-4 border-t border-subtle text-xs text-muted-300">
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Trabajadores ilimitados</li>
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Desarrollo a la medida</li>
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Migración premium</li>
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Infraestructura dedicada</li>
                  <li className="flex items-center gap-2"><Icon name="Check" size={14} className="text-brand-400"  /> Soporte 24/7</li>
                </ul>
              </div>

              <a
                href="mailto:soporte@gestivaone.com?subject=Consulta%20Plan%20Enterprise"
                className="w-full text-center py-3 rounded-xl bg-surface-600 hover:bg-surface-500 border border-subtle text-foreground text-xs font-bold transition-all block"
              >
                Contactar Ventas
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION ─── */}
      <FAQSection />

      {/* ─── CONTACT SECTION ─── */}
      <section id="contacto" className="py-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Contact Information */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-brand-400 text-xs font-bold uppercase tracking-widest">Contacto</span>
              <h2 className="text-3xl font-extrabold text-foreground">¿Tienes dudas? Escríbenos hoy mismo</h2>
              <p className="text-xs md:text-sm text-muted-400 leading-relaxed">
                Nuestro equipo de soporte está disponible de lunes a sábado para ayudarte a migrar tus datos o resolver cualquier inconveniente técnico.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20"><Icon name="Mail" size={16}  /></div>
                  <div>
                    <p className="text-[10px] text-muted-500 uppercase font-bold">Correo Electrónico</p>
                    <a href="mailto:soporte@gestivaone.com" className="text-sm font-semibold text-foreground hover:text-brand-400 transition-colors">soporte@gestivaone.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20"><Icon name="Phone" size={16}  /></div>
                  <div>
                    <p className="text-[10px] text-muted-500 uppercase font-bold">Línea de Atención</p>
                    <a href="tel:+573043059862" className="text-sm font-semibold text-foreground hover:text-brand-400 transition-colors">+57 (304) 405-9862</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20"><Icon name="MapPin" size={16}  /></div>
                  <div>
                    <p className="text-[10px] text-muted-500 uppercase font-bold">Oficina Principal</p>
                    <p className="text-sm font-semibold text-foreground">Barranquilla, Atlantico, Colombia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Simple Contact Form mockup */}
            <div className="lg:col-span-7 bg-surface-800 border border-subtle p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-foreground">Envíanos un mensaje directo</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="text-[10px] text-muted-400 font-bold uppercase tracking-wider block mb-1">Nombre Completo</label>
                  <input id="contact-name" name="name" type="text" placeholder="Ej: Randy Mendoza" className="w-full bg-surface-700 border border-subtle rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
                <div>
                  <label htmlFor="contact-email" className="text-[10px] text-muted-400 font-bold uppercase tracking-wider block mb-1">Correo electrónico</label>
                  <input id="contact-email" name="email" type="email" placeholder="correo@empresa.com" className="w-full bg-surface-700 border border-subtle rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
              </div>
              <div>
                <label htmlFor="contact-subject" className="text-[10px] text-muted-400 font-bold uppercase tracking-wider block mb-1">Asunto</label>
                <input id="contact-subject" name="subject" type="text" placeholder="Ej: Consulta sobre el Plan Empresarial" className="w-full bg-surface-700 border border-subtle rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                <label htmlFor="contact-message" className="text-[10px] text-muted-400 font-bold uppercase tracking-wider block mb-1">Tu mensaje</label>
                <textarea id="contact-message" name="message" rows={4} placeholder="Escribe tu duda o consulta aquí..." className="w-full bg-surface-700 border border-subtle rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none" />
              </div>
              {contactSent ? (
                <div className="p-4 rounded-xl bg-success-500/10 border border-success-500/20 text-success-400 text-xs font-bold text-center">
                  ✓ ¡Mensaje enviado con éxito! Nuestro equipo te responderá pronto.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setContactSent(true)}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all"
                >
                  Enviar Mensaje
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST EEAT SECTION ─── */}
      <TrustEEATSection />

      {/* ─── PRE-FOOTER BANNER (MAGNIFIC STYLE + BLURRY GRADIENT & LIQUID GLASS) ─── */}
      <section className="relative py-12 overflow-hidden border-t border-subtle">
        {/* Background blurryGradient image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70 pointer-events-none"
          style={{ backgroundImage: `url('/images/blurryGradient.svg')` }}
        />
        {/* Liquid Glass Overlay filter matching header */}
        <div className="absolute inset-0 bg-[#0e0e17]/70 backdrop-blur-md border-b border-white/10 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            {t('prefooter.title').startsWith('Sé') || t('prefooter.title').startsWith('Be') || t('prefooter.title').startsWith('Seja') ? (
              <>
                {t('prefooter.title').split(' ')[0]} <span className="text-brand-400">{t('prefooter.title').split(' ').slice(1).join(' ')}</span>
              </>
            ) : (
              t('prefooter.title')
            )}
          </h2>
          <p className="text-muted-200 text-sm sm:text-base max-w-xl mx-auto font-medium">
            {t('prefooter.desc')}
          </p>
          <div className="pt-2">
            <Link
              to="/auth?mode=register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-extrabold text-sm hover:bg-neutral-200 transition-all shadow-2xl hover:scale-105"
            >
              {t('prefooter.btn')} <Icon name="ArrowRight" size={16}  />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER (MAGNIFIC AI STYLE) ─── */}
      <footer className="bg-[#08080c] border-t border-white/10 pt-16 pb-12 text-xs text-muted-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left Brand Column */}
            <div className="lg:col-span-1 space-y-4">
              <Link to="/" className="inline-block">
                <img src="/images/gestivaOneIcon.svg" alt="GestivaOne Logo" className="h-10 w-auto hover:opacity-90 transition-opacity" />
              </Link>
              <p className="text-xs text-muted-400 leading-relaxed max-w-xs">
                La plataforma digital para dirigir tu mejor negocio. Más que un software, la inteligencia financiera para tu empresa.
              </p>

              {/* Language / Location Pill Badge */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-semibold hover:bg-white/10 transition-colors">
                  <img src="/images/colombiaFlag.png" alt="Colombia" className="h-3.5 w-auto object-contain rounded-xs" />
                  <span>{t('footer.colombia')}</span>
                </div>
              </div>
            </div>

            {/* Content Columns Grid */}
            <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-8">
              {/* Column 1: Productos */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white tracking-wide">{t('footer.colProducts')}</h4>
                <ul className="space-y-2.5">
                  <li><Link to="/facturacion-electronica" className="hover:text-white transition-colors">Facturación Electrónica</Link></li>
                  <li><Link to="/pos-inventario" className="hover:text-white transition-colors">Sistema POS & Inventarios</Link></li>
                  <li><Link to="/restaurantes" className="hover:text-white transition-colors">Restaurantes & Comandos</Link></li>
                  <li className="flex items-center gap-1.5">
                    <Link to="/minimarkets" className="hover:text-white transition-colors">Minimarkets</Link>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">Nuevo</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Link to="/crm-whatsapp" className="hover:text-white transition-colors">CRM & WhatsApp</Link>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">Nuevo</span>
                  </li>
                  <li><Link to="/pymes" className="hover:text-white transition-colors">Software PyME</Link></li>
                </ul>
              </div>

              {/* Column 2: Información útil */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white tracking-wide">{t('footer.colResources')}</h4>
                <ul className="space-y-2.5">
                  <li><Link to="/ayuda" className="hover:text-white transition-colors">Centro de Ayuda</Link></li>
                  <li><a href="#faq" className="hover:text-white transition-colors">{t('faq.tag')}</a></li>
                  <li><a href="mailto:support@gestivaone.com" className="hover:text-white transition-colors">Soporte Técnico</a></li>
                  <li><Link to="/terms" className="hover:text-white transition-colors">Términos de uso</Link></li>
                  <li><span className="hover:text-white cursor-pointer transition-colors">Política de privacidad</span></li>
                  <li><a href="#garantias" className="hover:text-white transition-colors">Cifrado SSL & Seguridad</a></li>
                </ul>
              </div>

              {/* Column 3: Empresa */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white tracking-wide">{t('footer.colLegal')}</h4>
                <ul className="space-y-2.5">
                  <li><a href="#precios" className="hover:text-white transition-colors">{t('nav.pricing')}</a></li>
                  <li><Link to="/blog" className="hover:text-white transition-colors">Blog Editorial</Link></li>
                  <li><a href="#garantias" className="hover:text-white transition-colors">{t('nav.about')}</a></li>
                  <li><a href="mailto:contact@gestivaone.com" className="hover:text-white transition-colors">{t('nav.contact')}</a></li>
                  <li><span className="hover:text-white cursor-pointer transition-colors">SLA 99.9% Uptime</span></li>
                </ul>
              </div>

              {/* Column 4: Síguenos */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white tracking-wide">{t('footer.colSocial')}</h4>
                <ul className="space-y-2.5">
                  <li>
                    <a href="https://www.instagram.com/gestivaone/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                      <Icon name="Instagram" size={14} className="text-brand-400"  />
                      <span>Instagram</span>
                    </a>
                  </li>
                  <li>
                    <a href="https://www.facebook.com/profile.php?id=61591826760203&ref=PROFILE_EDIT_xav_ig_profile_page_web#" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                      <Icon name="Facebook" size={14} className="text-brand-400"  />
                      <span>Facebook</span>
                    </a>
                  </li>
                  <li>
                    <a href="https://www.youtube.com/@tienesunagestionpendiente" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                      <Icon name="Youtube" size={14} className="text-brand-400"  />
                      <span>YouTube</span>
                    </a>
                  </li>
                  <li>
                    <span className="text-muted-500 flex items-center gap-2 cursor-not-allowed">
                      <svg className="w-3.5 h-3.5 fill-current text-muted-500" viewBox="0 0 24 24">
                        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.562-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-4.466 3.99a.33.33 0 0 0-.232.099.33.33 0 0 0 0 .463c.66.66 1.733.99 2.948.99 1.216 0 2.288-.33 2.948-.99a.33.33 0 0 0 0-.463.33.33 0 0 0-.463 0c-.516.516-1.436.786-2.485.786-1.049 0-1.97-.27-2.485-.786a.326.326 0 0 0-.231-.099z"/>
                      </svg>
                      <span>Reddit</span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-500">
            <p>Copyright &copy; {new Date().getFullYear()} GestivaOne. {t('footer.rights')}</p>
            <p className="text-white/30">Barranquilla, Colombia</p>
          </div>

        </div>
      </footer>

      {/* ─── FLOATING WHATSAPP CTA ─── */}
      <FloatingWhatsApp />



    </div>
  )
}

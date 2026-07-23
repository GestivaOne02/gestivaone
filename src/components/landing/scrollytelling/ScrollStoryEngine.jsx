import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguageStore } from '@/store/useLanguageStore'
import { getLandingModulesData } from '@/data/landingModulesData'
import StorySection from './StorySection'
import Icon from '@/components/ui/Icon'

export default function ScrollStoryEngine() {
  const { t } = useLanguageStore()
  const modules = getLandingModulesData(t)
  const [activeTab, setActiveTab] = useState('inventario')

  const handleTabClick = (id) => {
    setActiveTab(id)
    const element = document.getElementById(`module-${id}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <section id="caracteristicas" className="relative w-full bg-surface-950 py-16 sm:py-24 border-t border-b border-subtle overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Introduction Banner */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-12">
        <span className="px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-widest inline-block shadow-lg">
          {t('features.tag') || 'Módulos y Soluciones'}
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
          {t('features.title') || 'Todo lo que tu Empresa Necesita para Crecer'}
        </h2>
        <p className="text-base sm:text-lg text-muted-400 max-w-2xl mx-auto font-medium">
          {t('features.subtitle') || 'Herramientas diseñadas para agilizar la operación diaria de tu negocio.'}
        </p>

        {/* Quick Jump Interactive Category Tabs */}
        <div className="pt-4 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-2 px-2">
          {modules.map((mod) => {
            const isActive = activeTab === mod.id
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleTabClick(mod.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 shrink-0 border ${
                  isActive
                    ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-600/30 scale-105'
                    : 'bg-surface-800/80 text-muted-400 border-subtle hover:bg-surface-750 hover:text-white'
                }`}
              >
                <Icon name={mod.icon} size={14} />
                <span>{mod.title.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Parallax Scroll Showcase Cards (Alternating Layout) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {modules.map((mod, idx) => (
          <StorySection
            key={mod.id}
            moduleData={mod}
            index={idx}
            isReversed={idx % 2 === 1}
          />
        ))}
      </div>
    </section>
  )
}

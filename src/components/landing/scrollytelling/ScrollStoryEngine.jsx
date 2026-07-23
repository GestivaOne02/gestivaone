import React from 'react'
import { useLanguageStore } from '@/store/useLanguageStore'
import { getLandingModulesData } from '@/data/landingModulesData'
import StickyContainer from './StickyContainer'

export default function ScrollStoryEngine() {
  const { t } = useLanguageStore()
  const modules = getLandingModulesData(t)

  return (
    <section id="caracteristicas" className="relative w-full bg-surface-900 border-t border-b border-subtle">
      {/* Header Introduction Banner */}
      <div className="relative z-20 pt-14 pb-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-3">
        <span className="px-4 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-widest inline-block shadow-lg">
          {t('features.tag') || 'Módulos y Soluciones'}
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
          {t('features.title') || 'Todo lo que tu Empresa Necesita para Crecer'}
        </h2>
        <p className="text-sm sm:text-base text-muted-400 max-w-2xl mx-auto font-medium">
          {t('features.subtitle') || 'Herramientas diseñadas para agilizar la operación diaria de tu negocio.'}
        </p>
      </div>

      {/* Dynamic Module Scrollytelling Sections Stack */}
      <div className="relative w-full space-y-12 sm:space-y-16 pb-16">
        {modules.map((mod, idx) => (
          <div key={mod.id} id={`story-module-${idx}`} className="w-full">
            <StickyContainer
              moduleData={mod}
              isFirst={idx === 0}
              isLast={idx === modules.length - 1}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

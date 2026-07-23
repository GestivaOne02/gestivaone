import React from 'react'
import Icon from '@/components/ui/Icon'

export default function ProgressController({ modules, activeIndex, onSelectIndex }) {
  return (
    <div className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3 p-3 rounded-full bg-surface-900/80 border border-white/10 backdrop-blur-xl shadow-2xl">
      {modules.map((mod, idx) => {
        const isActive = activeIndex === idx
        return (
          <button
            key={mod.id}
            type="button"
            onClick={() => onSelectIndex(idx)}
            className="group relative flex items-center justify-center p-1.5 focus:outline-none"
            aria-label={`Ir a módulo ${mod.title}`}
          >
            {/* Indicator Dot */}
            <span
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-brand-400 scale-125 shadow-[0_0_10px_rgba(139,92,246,0.8)]'
                  : 'bg-white/20 group-hover:bg-white/50'
              }`}
            />

            {/* Hover Tooltip */}
            <span className="absolute right-8 px-3 py-1.5 rounded-xl bg-surface-800 border border-white/10 text-xs font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl">
              {mod.title}
            </span>
          </button>
        )
      })}
    </div>
  )
}

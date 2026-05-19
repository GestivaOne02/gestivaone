import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Star, Building2, Check } from 'lucide-react'
import { PLANS } from '@/store/useAuthStore'
import clsx from 'clsx'

export default function PlanSelector({ selected, onSelect }) {
  const plans = Object.values(PLANS).filter(p => p.id !== 'master')

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-xl font-black text-neutral-900 dark:text-white">Elige tu plan comercial</h2>
        <p className="text-xs text-muted-600 dark:text-muted-400">Selecciona el plan ideal para expandir tu negocio. Cambia o cancela cuando quieras.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {plans.map((plan) => {
          const isSelected = selected === plan.id
          return (
            <motion.button
              key={plan.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(plan.id)}
              className={clsx(
                'relative w-full text-left border-2 rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between min-h-[300px]',
                isSelected
                  ? 'border-brand-500 bg-brand-600/10 dark:bg-brand-600/10 shadow-glow-sm scale-[1.02]'
                  : 'border-subtle bg-surface-900/60 dark:bg-surface-800/40 hover:border-brand-500/20'
              )}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-4 bg-brand-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
                  <Star size={8} fill="currentColor" /> MÁS POPULAR
                </span>
              )}
              
              <div className="space-y-4 w-full">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'p-2.5 rounded-xl shrink-0 border transition-all duration-300', 
                    isSelected 
                      ? 'bg-brand-500/20 border-brand-500/30 text-brand-600 dark:text-brand-400' 
                      : 'bg-surface-700/50 border-subtle text-muted-400 dark:text-muted-500'
                  )}>
                    {plan.id === 'empresarial' ? <Building2 size={20} /> : <Zap size={20} />}
                  </div>
                  <div>
                    <p className="font-extrabold text-neutral-900 dark:text-white text-sm tracking-tight">{plan.name}</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      {plan.promoPrice ? (
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1">
                            <span className="text-brand-600 dark:text-brand-400 font-black text-lg">{plan.promoPriceDisplay}</span>
                            <span className="text-[10px] text-muted-500 line-through">{plan.priceDisplay}</span>
                          </div>
                          <span className="text-[9px] font-black tracking-wider uppercase bg-success-500/15 text-success-700 dark:bg-success-950 dark:text-success-400 px-1.5 py-0.5 rounded mt-0.5 w-max">
                            {plan.promoLabel}
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-900 dark:text-white font-black text-lg">{plan.priceDisplay}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-500 dark:text-muted-400 block mt-0.5 font-bold">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2 text-left border-t border-subtle/50 dark:border-subtle/30 pt-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[11px] text-neutral-800 dark:text-neutral-300 leading-tight">
                      <Check size={11} className={clsx("shrink-0 mt-0.5", isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-muted-500')} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-full mt-4 pt-3 flex justify-end">
                <div className={clsx(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300', 
                  isSelected ? 'border-brand-500 bg-brand-500' : 'border-neutral-300 dark:border-neutral-600'
                )}>
                  {isSelected && <Check size={10} className="text-white font-bold" />}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

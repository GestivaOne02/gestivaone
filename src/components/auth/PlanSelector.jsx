import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PLANS } from '@/store/useAuthStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import Icon from '@/components/ui/Icon'

const glows = {
  standard: 'border-brand-500/10 hover:border-brand-500/30',
  pro: 'border-success-500/10 hover:border-success-500/30',
  empresarial: 'border-warning-500/10 hover:border-warning-500/30',
  enterprise: 'border-brand-500/10 hover:border-brand-500/30',
}

const badgeStyles = {
  standard: 'bg-brand-500/10 border-brand-500/20 text-brand-400',
  pro: 'bg-success-500/10 border-success-500/20 text-success-400',
  empresarial: 'bg-warning-500/10 border-warning-500/20 text-warning-400',
}

const BILLING_PRICES = {
  monthly: {
    standard: { price: '$0', promo: null, period: '/siempre' },
    pro: { price: '$32.000', promo: '$7.000', promoLabel: '78% desc. primer mes', period: '/mes' },
    empresarial: { price: '$120.000', promo: '$80.000', promoLabel: '33% desc. primeros 3 meses', period: '/mes' },
    enterprise: { price: 'Personalizado', promo: null, period: '' }
  },
  yearly: {
    standard: { price: '$0', promo: null, period: '/siempre' },
    pro: { price: '$25.600', promo: null, promoLabel: 'Facturado anualmente (20% desc.)', period: '/mes' },
    empresarial: { price: '$96.000', promo: null, promoLabel: 'Facturado anualmente (20% desc.)', period: '/mes' },
    enterprise: { price: 'Personalizado', promo: null, period: '' }
  }
}

export default function PlanSelector({ selected, onSelect }) {
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [showComparison, setShowComparison] = useState(false)
  const comparisonRef = useRef(null)

  useEffect(() => {
    if (showComparison && comparisonRef.current) {
      setTimeout(() => {
        comparisonRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
    }
  }, [showComparison])

  const plans = Object.values(PLANS).filter(p => p.id !== 'master')

  const handleCustomPlanClick = () => {
    toast.success('¡Nos adaptamos a ti! Nuestro equipo se pondrá en contacto pronto para diseñar tu plan a medida.', {
      duration: 4000,
      icon: '✨'
    })
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      {/* Header and Toggle */}
      <div className="flex flex-col items-center text-center space-y-3 mb-4">
        <div>
          <h2 className="text-lg md:text-xl font-black text-neutral-900 dark:text-white uppercase tracking-wider">
            Elige tu plan comercial
          </h2>
          <p className="text-xs text-muted-500 mt-1">
            Selecciona el plan ideal para expandir tu negocio. Cambia o cancela cuando quieras.
          </p>
        </div>

        {/* Monthly / Yearly Toggle */}
        <div className="flex items-center bg-surface-700/50 p-1 rounded-full border border-subtle select-none">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={clsx(
              'px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer',
              billingCycle === 'monthly' ? 'bg-[#7B39ED] text-white shadow-md' : 'text-muted-400 hover:text-white'
            )}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={clsx(
              'relative px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer',
              billingCycle === 'yearly' ? 'bg-[#7B39ED] text-white shadow-md' : 'text-muted-400 hover:text-white'
            )}
          >
            <span>Anual</span>
            <span className="text-[8px] bg-success-500/20 text-success-400 border border-success-500/20 px-1.5 py-0.5 rounded-full font-black uppercase">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid: Responsive Carousel on Mobile, Grid on Tablet/Desktop */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-x-visible sm:pb-0 w-full">
        {plans.map((plan) => {
          const isSelected = selected === plan.id
          const activeGlow = glows[plan.id] || glows.standard
          const activeBadge = badgeStyles[plan.id] || badgeStyles.standard
          const prices = BILLING_PRICES[billingCycle][plan.id] || BILLING_PRICES.monthly[plan.id]

          return (
            <motion.button
              key={plan.id}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                if (plan.isContact) {
                  window.location.href = 'mailto:soporte@gestivaone.com?subject=Consulta%20Plan%20Enterprise';
                } else {
                  onSelect(plan.id)
                }
              }}
              className={clsx(
                'group relative w-[280px] sm:w-full shrink-0 snap-center text-left border rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between min-h-[380px] bg-surface-800 border-subtle/50 hover:border-surface-400 select-none shadow-sm overflow-hidden cursor-pointer',
                isSelected && 'ring-2 ring-[#7B39ED] border-[#7B39ED]'
              )}
            >
              <div className={clsx('absolute inset-0 pointer-events-none rounded-3xl transition-opacity opacity-40 group-hover:opacity-100', activeGlow)} />

              {plan.popular && (
                <span className="absolute top-0 right-6 bg-[#7B39ED] text-white text-[8px] font-black px-3 py-1 rounded-b-xl flex items-center gap-1 shadow-sm uppercase tracking-wider z-10">
                  <Icon name="Star" size={8} fill="currentColor" /> RECOMENDADO
                </span>
              )}

              <div className="w-full space-y-4 flex-1 flex flex-col justify-between relative z-10">
                <div className="space-y-3 w-full">
                  <div className="flex items-center justify-between">
                    <div className={clsx('w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300', activeBadge)}>
                      {plan.id === 'empresarial' ? <Icon name="Building2" size={16} /> : <Icon name="Zap" size={16} />}
                    </div>
                    <span className="text-[9px] font-bold text-muted-500 uppercase tracking-widest bg-surface-900 border border-subtle px-2 py-0.5 rounded-full">
                      {plan.id === 'empresarial' ? 'Completo' : plan.id === 'pro' ? 'Crecimiento' : 'Básico'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-neutral-900 dark:text-white text-base tracking-tight leading-none">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      {prices.promo ? (
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-neutral-900 dark:text-white font-black text-xl leading-none">
                              {prices.promo}
                            </span>
                            <span className="text-xs text-muted-500 line-through font-bold leading-none">
                              {prices.price}
                            </span>
                          </div>
                          <span className="text-[8px] font-extrabold tracking-wider uppercase bg-success-500/15 text-success-400 px-2 py-0.5 rounded-full mt-1.5 w-max border border-success-500/10">
                            {prices.promoLabel}
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-900 dark:text-white font-black text-xl leading-none">
                          {prices.price}
                        </span>
                      )}
                    </div>
                    <span className="text-[9.5px] text-muted-500 dark:text-muted-400 block mt-1 font-bold lowercase tracking-wider leading-none">
                      {prices.period}
                    </span>
                  </div>
                </div>

                <div className="w-full mt-3">
                  <div className={clsx(
                    'w-full py-2.5 px-4 rounded-full text-xs font-black text-center transition-all duration-300 select-none border',
                    isSelected 
                      ? 'bg-[#7B39ED] text-white border-[#7B39ED] shadow-md' 
                      : 'bg-surface-700/60 text-muted-300 border-subtle/40 group-hover:bg-[#7B39ED] group-hover:text-white group-hover:border-[#7B39ED]'
                  )}>
                    {isSelected ? 'Plan Seleccionado' : 'Elegir Plan'}
                  </div>
                </div>
              </div>

              <ul className="space-y-2 text-left pt-3 border-t border-subtle/50 w-full px-1 mt-3 relative z-10">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[11px] text-neutral-800 dark:text-neutral-300 leading-tight">
                    <Icon name="Check" size={11} className="stroke-[3.5] text-[#7B39ED] shrink-0 mt-0.5" />
                    <span className="font-semibold">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

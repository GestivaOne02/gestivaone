import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { useAuthStore } from '@/store/useAuthStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import Icon from '@/components/ui/Icon';

const PLANS_DATA = [
  {
    id: 'standard',
    name: 'One Standard',
    desc: 'Ideal para emprendedores individuales',
    price: 0,
    priceDisplay: '$0',
    period: '/siempre',
    color: 'border-neutral-200 dark:border-surface-700 bg-surface-800/40',
    iconColor: 'text-neutral-400',
    features: [
      '1 trabajador activo',
      'Facturación básica manual',
      'Gestión de clientes (sin segmentación)',
      'Inventario limitado',
      'Soporte comunitario'
    ]
  },
  {
    id: 'pro',
    name: 'One Pro',
    desc: 'Para negocios en crecimiento con equipo',
    price: 32000,
    priceDisplay: '$32.000',
    period: '/mes',
    color: 'border-brand-500/30 bg-surface-800/60 ring-2 ring-brand-500/20',
    iconColor: 'text-brand-400',
    popular: true,
    features: [
      'Hasta 10 trabajadores',
      'Todo lo de Standard',
      'Dashboard avanzado de métricas',
      'Módulo de Empleados',
      'Reportes PDF/Excel ejecutivos',
      'Soporte prioritario 24/7'
    ]
  },
  {
    id: 'empresarial',
    name: 'One 360',
    desc: 'Acceso total e ilimitado a todo el ecosistema',
    price: 120000,
    priceDisplay: '$120.000',
    period: '/mes',
    color: 'border-purple-500 bg-gradient-to-br from-surface-800 to-purple-950/20 shadow-glow-sm',
    iconColor: 'text-purple-400',
    features: [
      'Trabajadores ilimitados',
      'CRM y Campañas Email Drag & Drop',
      'Facturero Inteligente ilimitado',
      'Asistente DIAN integrado',
      'GestiToken (2FA de seguridad)',
      'Mi Gestión Financiera y Bolsillos',
      'Prioridad de red y SLA 99.9%'
    ]
  }
]

const ADDONS_DATA = [
  {
    id: 'crm',
    name: 'CRM de Clientes',
    desc: 'Seguimiento de compras, historiales de abonos y segmentación automática de clientes.',
    price: 5000,
    priceDisplay: '$5.000',
    icon: Users,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  },
  {
    id: 'emails',
    name: 'Campañas de Email',
    desc: 'Constructor Drag & Drop de correos, plantillas de marketing e historial integrado con Resend.',
    price: 8000,
    priceDisplay: '$8.000',
    icon: Mail,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
  },
  {
    id: 'facturero',
    name: 'Facturero Inteligente',
    desc: 'Cuentas de cobro ilimitadas, abonos parciales, alertas de mora y descarga PDF.',
    price: 12000,
    priceDisplay: '$12.000',
    icon: Receipt,
    color: 'text-success-400 bg-success-500/10 border-success-500/20'
  },
  {
    id: 'dian',
    name: 'Asistente DIAN',
    desc: 'Validación en vivo de NIT/cédulas, facturación electrónica homologada y XML oficial.',
    price: 15000,
    priceDisplay: '$15.000',
    icon: Calculator,
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
  },
  {
    id: 'seguridad',
    name: 'GestiToken (2FA)',
    desc: 'Protección de accesos de empleados mediante códigos de seguridad aleatorios de 6 dígitos.',
    price: 4000,
    priceDisplay: '$4.000',
    icon: Lock,
    color: 'text-red-400 bg-red-500/10 border-red-500/20'
  },
  {
    id: 'pockets',
    name: 'Bolsillos de Dinero',
    desc: 'Separa tus ingresos por categorías, propósitos o metas de ahorro independientes.',
    price: 5000,
    priceDisplay: '$5.000',
    icon: FolderClosed,
    color: 'text-pink-400 bg-pink-500/10 border-pink-500/20'
  },
  {
    id: 'personal-finance',
    name: 'Mi Gestión Financiera',
    desc: 'Control unificado de ingresos, gastos del hogar y balances integrados al negocio.',
    price: 6000,
    priceDisplay: '$6.000',
    icon: Wallet,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
  }
]

export default function Upgrade() {
  const user = useAuthStore((s) => s.user)
  const changePlan = useAuthStore((s) => s.changePlan)
  const updateProfile = useAuthStore((s) => s.updateProfile)

  const [checkoutItem, setCheckoutItem] = useState(null) // { type: 'plan'|'addon', item: data }
  const [processing, setProcessing] = useState(false)

  // Card form state
  const [cardNumber, setCardNumber] = useState('4000 1234 5678 9010')
  const [expiry, setExpiry] = useState('12/28')
  const [cvv, setCvv] = useState('123')
  const [holder, setHolder] = useState(user?.name || 'Administrador Demo')

  const purchasedFeatures = user?.settings?.purchased_features || []
  const currentPlan = user?.plan || 'standard'

  const hasAddon = (addonId) => {
    if (currentPlan === 'empresarial' || currentPlan === 'enterprise' || user?.role === 'master') return true
    if (Array.isArray(purchasedFeatures)) {
      return purchasedFeatures.includes(addonId)
    }
    return !!purchasedFeatures[addonId]
  }

  const handleOpenCheckout = (type, item) => {
    setCheckoutItem({ type, item })
  }

  const handleConfirmPayment = async (e) => {
    e.preventDefault()
    setProcessing(true)

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1200))

    try {
      if (checkoutItem.type === 'plan') {
        const res = await changePlan(checkoutItem.item.id)
        if (res.success) {
          toast.success(`Plan cambiado con éxito a ${checkoutItem.item.name}`)
        } else {
          toast.error(`Error al cambiar plan: ${res.error}`)
        }
      } else {
        // Buy addon
        const updatedAddons = Array.isArray(purchasedFeatures)
          ? [...purchasedFeatures, checkoutItem.item.id]
          : [checkoutItem.item.id]

        const currentSettings = user?.settings || {}
        await updateProfile({
          settings: {
            ...currentSettings,
            purchased_features: updatedAddons
          }
        })
        toast.success(`Módulo "${checkoutItem.item.name}" activado correctamente`)
      }
      setCheckoutItem(null)
    } catch (err) {
      console.error(err)
      toast.error('Ocurrió un error al procesar el pago simulado')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="page-container space-y-8 max-w-6xl">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-surface-900/90 backdrop-blur-md pb-4 pt-1 -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 border-b border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
            <Icon name="Sparkles" size={20} className="text-purple-400"  />
            Upgrade Center & Modular Addons
          </h1>
          <p className="text-xs text-muted-400 mt-0.5">
            Adquiere los planes completos o compra solo los módulos específicos que necesites
          </p>
        </div>
      </div>

      {/* Plans Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400">1. Planes de Membresía</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS_DATA.map((plan) => {
            const isCurrent = currentPlan === plan.id
            return (
              <div
                key={plan.id}
                className={clsx(
                  'rounded-2xl border-2 p-5 flex flex-col transition-all relative overflow-hidden',
                  plan.color,
                  isCurrent ? 'border-brand-500 shadow-glow-sm' : 'border-subtle hover:border-surface-400'
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-0 right-6 bg-brand-500 text-white text-[8px] font-black px-3 py-1 rounded-b-xl uppercase tracking-wider">
                    Popular
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-0 left-6 bg-purple-600 text-white text-[8px] font-black px-3 py-1 rounded-b-xl uppercase tracking-wider">
                    Plan Activo
                  </span>
                )}

                <div className="mb-4">
                  <h3 className="text-base font-extrabold text-white">{plan.name}</h3>
                  <p className="text-[11px] text-muted-400 mt-1">{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-1.5 mb-5">
                  <span className="text-2xl font-black text-white">{plan.priceDisplay}</span>
                  <span className="text-xs text-muted-400">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-muted-300">
                      <Icon name="Check" size={14} className="text-success-400 shrink-0 mt-0.5"  />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isCurrent ? 'ghost' : plan.popular ? 'primary' : 'secondary'}
                  size="sm"
                  disabled={isCurrent}
                  onClick={() => handleOpenCheckout('plan', plan)}
                  className="w-full text-xs font-semibold py-2.5"
                >
                  {isCurrent ? 'Plan Actual' : `Cambiar a ${plan.name}`}
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Addons Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400">2. Adquirir Funcionalidades por Módulos</h2>
        <p className="text-xs text-muted-400 max-w-2xl leading-relaxed">
          ¿No deseas pagar la membresía completa? Activa de forma independiente los módulos premium. Los planes superiores desbloquean automáticamente todos los módulos relacionados.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ADDONS_DATA.map((addon) => {
            const owned = hasAddon(addon.id)
            const Icon = addon.icon
            return (
              <div
                key={addon.id}
                className={clsx(
                  'rounded-2xl border p-4 bg-surface-800/40 flex flex-col justify-between transition-all duration-300',
                  owned ? 'border-brand-500/30' : 'border-subtle hover:border-surface-500'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={clsx('p-2.5 rounded-xl border shrink-0', addon.color)}>
                      <Icon size={18} />
                    </div>
                    <span className="text-sm font-black text-white">{addon.priceDisplay}<span className="text-[10px] text-muted-400 font-medium">/mes</span></span>
                  </div>
                  <h3 className="text-xs font-bold text-white">{addon.name}</h3>
                  <p className="text-[11px] text-muted-400 mt-1 leading-relaxed">{addon.desc}</p>
                </div>

                <div className="mt-4 pt-2">
                  <Button
                    variant={owned ? 'ghost' : 'secondary'}
                    size="xs"
                    disabled={owned}
                    onClick={() => handleOpenCheckout('addon', addon)}
                    className="w-full text-[10px] py-2"
                  >
                    {owned ? '✓ Activo' : 'Comprar Módulo'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutItem && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-800 border border-subtle shadow-modal rounded-3xl p-6 w-full max-w-md relative overflow-hidden"
            >
              {/* Close */}
              <button
                onClick={() => setCheckoutItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-400 hover:text-foreground hover:bg-surface-700 transition-colors"
              >
                <Icon name="X" size={16}  />
              </button>

              <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-1.5">
                <Icon name="CreditCard" size={18} className="text-brand-400"  />
                Pasarela de Pago Segura
              </h3>
              <p className="text-xs text-muted-400 mb-5">
                Confirmación de pasarela para activar: <strong className="text-brand-300 font-semibold">{checkoutItem.item.name}</strong>
              </p>

              <form onSubmit={handleConfirmPayment} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-surface-900 border border-subtle space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-400">Total a facturar:</span>
                    <span className="font-extrabold text-white text-sm">{checkoutItem.item.priceDisplay || `$${new Intl.NumberFormat('es-CO').format(checkoutItem.item.price)}`} COP</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-500">Recurrencia:</span>
                    <span className="text-muted-400">Mensual (Simulado)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Input
                    label="Número de Tarjeta"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4000 1234 5678 9010"
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Fecha de Expiración"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/AA"
                      required
                    />
                    <Input
                      label="CVV"
                      value={cvv}
                      type="password"
                      maxLength={4}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      required
                    />
                  </div>

                  <Input
                    label="Nombre en Tarjeta"
                    value={holder}
                    onChange={(e) => setHolder(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 text-[10px] text-muted-400 bg-surface-900/50 p-2.5 rounded-xl border border-subtle mt-1">
                  <Icon name="Shield" size={14} className="text-brand-400 shrink-0"  />
                  <span>Esta transacción es una simulación de desarrollo local con Supabase y no realizará ningún cobro real.</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    className="flex-1"
                    onClick={() => setCheckoutItem(null)}
                    disabled={processing}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="flex-1 bg-brand-600 hover:bg-brand-700"
                    loading={processing}
                  >
                    Pagar y Activar
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

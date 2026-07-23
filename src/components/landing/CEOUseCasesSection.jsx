import { useLanguageStore } from '@/store/useLanguageStore'
import Icon from '@/components/ui/Icon';

const useCases = [
  {
    icon: Store,
    title: 'Minimarkets & Supermercados',
    desc: 'Control de inventario rápido, escaneo de códigos de barra, cierre de caja diario e impresión de recibos en menos de 3 segundos.'
  },
  {
    icon: Utensils,
    title: 'Restaurantes & Gastronomía',
    desc: 'Gestión de comanda de cocina, comandas térmicas, catálogo de productos con imágenes y módulo de menú virtual rápido.'
  },
  {
    icon: ShoppingBag,
    title: 'Moda, Calzado & Retail',
    desc: 'Organización por categorías, notificaciones de productos con bajo stock, cuentas por cobrar y fidelización de clientes.'
  },
  {
    icon: Wrench,
    title: 'Ferreterías & Servicios',
    desc: 'Emisión de cuentas de cobro oficiales, control de egresos, abonos a crédito y recordatorios automáticos por WhatsApp.'
  }
]

const steps = [
  {
    num: '01',
    title: 'Crea tu Cuenta Gratis',
    desc: 'Regístrate en menos de 1 minuto sin necesidad de ingresar tarjeta de crédito.'
  },
  {
    num: '02',
    title: 'Carga tus Productos o Servicios',
    desc: 'Agrega tu catálogo con precios, stock e imágenes en un panel intuitivo.'
  },
  {
    num: '03',
    title: '¡Comienza a Vender y Facturar!',
    desc: 'Imprime recibos, envía comprobantes por WhatsApp y revisa tus utilidades en tiempo real.'
  }
]

export default function CEOUseCasesSection() {
  const { t } = useLanguageStore()

  return (
    <section id="casos-de-uso" className="py-10 bg-surface-800 border-t border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold uppercase tracking-wider border border-brand-500/20">
            <Icon name="Sparkles" size={14}  />
            {t('usecases.tag')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {t('usecases.title')}
          </h2>
          <p className="text-sm text-muted-400">
            {t('usecases.subtitle')}
          </p>
        </div>

        {/* Grid Use Cases */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((uc, idx) => {
            const Icon = uc.icon
            return (
              <div
                key={idx}
                className="bg-surface-900 border border-subtle p-6 rounded-3xl space-y-4 hover:border-brand-500/30 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20">
                  <Icon size={24} />
                </div>
                <h3 className="text-base font-bold text-foreground">{uc.title}</h3>
                <p className="text-xs text-muted-400 leading-relaxed">{uc.desc}</p>
              </div>
            )
          })}
        </div>

        {/* 3-Step Start Process */}
        <div className="bg-surface-900 border border-subtle rounded-3xl p-8 lg:p-12 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              Comienza en solo 3 sencillos pasos
            </h3>
            <p className="text-xs text-muted-400">
              Sin instalaciones complejas. Accede a tu panel en la nube al instante.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((st, idx) => (
              <div key={idx} className="space-y-3 relative">
                <span className="text-3xl font-black text-brand-500/30 tracking-widest block">
                  {st.num}
                </span>
                <h4 className="text-sm font-bold text-foreground">{st.title}</h4>
                <p className="text-xs text-muted-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

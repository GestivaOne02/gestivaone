import { useLanguageStore } from '@/store/useLanguageStore'
import Icon from '@/components/ui/Icon'

const useCases = [
  {
    id: 'minimarkets',
    icon: 'Store',
    title: 'Minimarkets & Supermercados',
    desc: 'Control de inventario rápido, escaneo de códigos de barra, cierre de caja diario e impresión de recibos en menos de 3 segundos.',
    bgImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1000&auto=format&fit=crop',
    accentColor: 'from-emerald-500/30 to-emerald-950/90',
    borderColor: 'border-emerald-500/30',
    link: '#pos'
  },
  {
    id: 'restaurantes',
    icon: 'Utensils',
    title: 'Restaurantes & Gastronomía',
    desc: 'Gestión de comanda de cocina, comandas térmicas, catálogo de productos con imágenes y módulo de menú virtual rápido.',
    bgImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop',
    accentColor: 'from-rose-500/30 to-rose-950/90',
    borderColor: 'border-rose-500/30',
    link: '#restaurant'
  },
  {
    id: 'moda',
    icon: 'ShoppingBag',
    title: 'Moda, Calzado & Retail',
    desc: 'Organización por categorías, notificaciones de productos con bajo stock, cuentas por cobrar y fidelización de clientes.',
    bgImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop',
    accentColor: 'from-indigo-500/30 to-indigo-950/90',
    borderColor: 'border-indigo-500/30',
    link: '#crm'
  },
  {
    id: 'ferreterias',
    icon: 'Wrench',
    title: 'Ferreterías & Servicios',
    desc: 'Emisión de cuentas de cobro oficiales, control de egresos, abonos a crédito y recordatorios automáticos por WhatsApp.',
    bgImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1000&auto=format&fit=crop',
    accentColor: 'from-amber-500/30 to-amber-950/90',
    borderColor: 'border-amber-500/30',
    link: '#dian'
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
    <section id="casos-de-uso" className="py-16 bg-surface-950 border-t border-b border-subtle overflow-hidden">
      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-12 px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold uppercase tracking-wider border border-brand-500/20 shadow-md">
          <Icon name="Sparkles" size={14} />
          {t('usecases.tag') || 'Casos de Uso'}
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
          {t('usecases.title') || 'Adaptado a la Industria de tu Negocio'}
        </h2>
        <p className="text-base text-muted-400 font-medium">
          {t('usecases.subtitle') || 'Descubre cómo GestivaOne transforma la gestión de cada sector.'}
        </p>
      </div>

      {/* Full-Bleed 100% Width 4-Column Grid with Background Images */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-y border-subtle">
        {useCases.map((uc) => (
          <div
            key={uc.id}
            className="group relative h-[380px] sm:h-[420px] lg:h-[460px] w-full overflow-hidden border-b sm:border-b-0 border-r border-subtle flex flex-col justify-between p-6 sm:p-8 transition-all duration-500 cursor-pointer"
          >
            {/* Background Image with Zoom on Hover */}
            <div
              className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700 ease-out"
              style={{ backgroundImage: `url(${uc.bgImage})` }}
            />

            {/* Gradient Overlay for Readable Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/85 to-surface-950/50 group-hover:via-surface-950/75 group-hover:to-surface-950/40 transition-all duration-500" />

            {/* Accent Color Glow Border Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${uc.accentColor} opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none`} />

            {/* Top Content: Icon & Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-surface-900/90 text-white flex items-center justify-center border border-white/20 shadow-xl backdrop-blur-md group-hover:scale-110 transition-transform">
                <Icon name={uc.icon} size={22} />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
                GestivaOne
              </span>
            </div>

            {/* Bottom Content: Title, Description & Action */}
            <div className="relative z-10 space-y-3">
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight group-hover:text-brand-300 transition-colors">
                {uc.title}
              </h3>
              <p className="text-xs text-muted-300 leading-relaxed font-normal opacity-90 line-clamp-3">
                {uc.desc}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-brand-400 group-hover:text-brand-300 group-hover:translate-x-1 transition-all">
                <span>Ver Solución de Industria</span>
                <Icon name="ArrowRight" size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3-Step Start Process */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-surface-900/80 border border-subtle rounded-3xl p-8 lg:p-12 space-y-8 shadow-2xl backdrop-blur-xl">
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
                <span className="text-3xl font-black text-brand-500/40 tracking-widest block">
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

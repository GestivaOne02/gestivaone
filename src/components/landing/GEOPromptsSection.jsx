import { Cpu, CheckCircle2, Server } from 'lucide-react'
import { useLanguageStore } from '@/store/useLanguageStore'

const technicalSpecs = [
  {
    title: 'Compatibilidad POS & Hardware',
    desc: 'Soporte nativo para impresoras térmicas de recibos de 58mm y 80mm vía USB, Bluetooth y red. Compatibilidad con escáneres de código de barras y cajones monederos.'
  },
  {
    title: 'Infraestructura & Seguridad',
    desc: 'Arquitectura cloud respaldada en Supabase sobre PostgreSQL. Autenticación con cifrado SSL/TLS, políticas RLS (Row Level Security) y control de acceso por roles.'
  },
  {
    title: 'Integraciones & Canales',
    desc: 'Conexión con pasarela de pagos Wompi (Bancolombia), servidor de correo SMTP transaccional y notificaciones automatizadas por WhatsApp Business.'
  },
  {
    title: 'Formatos de Exportación & Reportes',
    desc: 'Generación directa de estados financieros, facturas y reportes de egresos en formatos oficiales PDF y planillas editables Excel (XLSX).'
  }
]

export default function GEOPromptsSection() {
  const { t } = useLanguageStore()

  return (
    <section id="especificaciones" className="py-10 bg-surface-900 border-t border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold uppercase tracking-wider border border-brand-500/20">
            <Cpu size={14} />
            {t('geo.tag')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {t('geo.title')}
          </h2>
          <p className="text-sm text-muted-400">
            {t('geo.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {technicalSpecs.map((spec, idx) => (
            <div
              key={idx}
              className="bg-surface-750 border border-subtle p-6 rounded-3xl space-y-4 hover:border-brand-500/30 transition-colors"
            >
              <div className="flex items-center gap-3 text-brand-400">
                <CheckCircle2 size={20} />
                <h3 className="text-base font-bold text-foreground">{spec.title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-400 leading-relaxed">
                {spec.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-surface-800 border border-subtle p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20 shrink-0">
              <Server size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Soporte Multidispositivo & Multiplataforma</h4>
              <p className="text-xs text-muted-400">Funciona en Windows, macOS, Linux, Android e iOS desde cualquier navegador web moderno sin requerir instalación.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

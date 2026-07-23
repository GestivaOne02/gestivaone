import { Link } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
import Icon from '@/components/ui/Icon';

export default function LandingCRM() {
  return (
    <div className="min-h-screen bg-[#0e0e17] text-foreground selection:bg-brand-500/30 selection:text-brand-300">
      <SEOHead
        title="CRM de Clientes y Notificaciones por WhatsApp — GestivaOne"
        description="Gestiona la cartera de tus clientes, envía recordatorios de cobro por WhatsApp y mantiene un historial completo."
        canonical="https://www.gestivaone.com/crm-whatsapp"
        keywords="CRM clientes Colombia, notificaciones WhatsApp Business, cobranzas automáticas, gestión de deudas"
      />

      <nav className="sticky top-0 z-50 bg-[#0e0e17]/95 backdrop-blur-md border-b border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/images/gestivaOneIcon.svg" alt="GestivaOne Logo" className="h-8 w-auto" />
            <span className="font-bold text-foreground text-lg">
              Gestiva<span className="text-brand-400">One</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/auth?mode=login" className="text-xs font-bold text-muted-400 hover:text-white transition-colors">
              Iniciar Sesión
            </Link>
            <Link to="/auth?mode=register" className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all">
              Empieza Gratis
            </Link>
          </div>
        </div>
      </nav>

      <header className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold uppercase tracking-wider border border-brand-500/20">
          <Icon name="MessageSquare" size={14}  />
          CRM y Notificaciones por WhatsApp
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white max-w-4xl mx-auto tracking-tight leading-tight">
          Gestión de Clientes y Cobranza Automatizada por <span className="text-brand-400">WhatsApp</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-400 max-w-2xl mx-auto leading-relaxed">
          Mantén actualizado el historial de compras de tus clientes, registra abonos y envía notificaciones de cobro directamente a sus teléfonos.
        </p>
        <div className="flex justify-center pt-4">
          <Link
            to="/auth?mode=register"
            className="px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-extrabold transition-all flex items-center gap-2"
          >
            Probar CRM Gratis <Icon name="ArrowRight" size={16}  />
          </Link>
        </div>
      </header>

      <section className="py-16 bg-surface-800 border-t border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface-750 border border-subtle p-6 rounded-3xl space-y-3">
            <Icon name="MessageSquare" size={24} className="text-brand-400"  />
            <h3 className="text-base font-bold text-foreground">Recordatorios por WhatsApp</h3>
            <p className="text-xs text-muted-400 leading-relaxed">Notifica a tus compradores con un solo clic el estado de sus deudas o facturas.</p>
          </div>
          <div className="bg-surface-750 border border-subtle p-6 rounded-3xl space-y-3">
            <Icon name="Users2" size={24} className="text-brand-400"  />
            <h3 className="text-base font-bold text-foreground">Historial Único de Compras</h3>
            <p className="text-xs text-muted-400 leading-relaxed">Consulta las facturas pasadas, preferencias y frecuencia de compra de cada cliente.</p>
          </div>
          <div className="bg-surface-750 border border-subtle p-6 rounded-3xl space-y-3">
            <Icon name="ShieldCheck" size={24} className="text-brand-400"  />
            <h3 className="text-base font-bold text-foreground">Abonos y Cuentas por Cobrar</h3>
            <p className="text-xs text-muted-400 leading-relaxed">Registra créditos otorgados, abonos parciales y saldos pendientes en tiempo real.</p>
          </div>
        </div>
      </section>

      <footer className="bg-surface-950 border-t border-subtle py-8 text-center text-xs text-muted-500">
        <p>&copy; {new Date().getFullYear()} GestivaOne. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

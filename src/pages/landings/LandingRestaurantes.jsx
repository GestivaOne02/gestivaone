import { Link } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
import Icon from '@/components/ui/Icon';

export default function LandingRestaurantes() {
  return (
    <div className="min-h-screen bg-[#0e0e17] text-foreground selection:bg-brand-500/30 selection:text-brand-300">
      <SEOHead
        title="Software para Restaurantes, Comandas y Gastro-bares — GestivaOne"
        description="Gestión integral de restaurantes: menú digital, comandas de cocina, tickets de venta e impresoras térmicas."
        canonical="https://www.gestivaone.com/restaurantes"
        keywords="software restaurantes Colombia, comandas de cocina, menú digital, POS gastrobar"
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
          <Icon name="Utensils" size={14}  />
          Especializado en Gastronomía
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white max-w-4xl mx-auto tracking-tight leading-tight">
          Software para Restaurantes, Gastro-bares y <span className="text-brand-400">Comidas Rápidas</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-400 max-w-2xl mx-auto leading-relaxed">
          Optimiza la toma de pedidos, emite comandas de cocina térmicas y mantén tu inventario de insumos controlado sin complicaciones.
        </p>
        <div className="flex justify-center pt-4">
          <Link
            to="/auth?mode=register"
            className="px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-extrabold transition-all flex items-center gap-2"
          >
            Comenzar Gratis para Restaurantes <Icon name="ArrowRight" size={16}  />
          </Link>
        </div>
      </header>

      <section className="py-16 bg-surface-800 border-t border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface-750 border border-subtle p-6 rounded-3xl space-y-3">
            <Icon name="Menu" size={24} className="text-brand-400"  />
            <h3 className="text-base font-bold text-foreground">Menú y Carta Digital</h3>
            <p className="text-xs text-muted-400 leading-relaxed">Crea productos con fotos, modificadores y precios dinámicos por categoría.</p>
          </div>
          <div className="bg-surface-750 border border-subtle p-6 rounded-3xl space-y-3">
            <Icon name="Printer" size={24} className="text-brand-400"  />
            <h3 className="text-base font-bold text-foreground">Comandas de Cocina</h3>
            <p className="text-xs text-muted-400 leading-relaxed">Envío directo de pedidos a impresoras térmicas en barra o cocina.</p>
          </div>
          <div className="bg-surface-750 border border-subtle p-6 rounded-3xl space-y-3">
            <Icon name="Utensils" size={24} className="text-brand-400"  />
            <h3 className="text-base font-bold text-foreground">Cierre de Caja Gastronómico</h3>
            <p className="text-xs text-muted-400 leading-relaxed">Arqueo de ventas por turno, propinas y medios de pago integrados.</p>
          </div>
        </div>
      </section>

      <footer className="bg-surface-950 border-t border-subtle py-8 text-center text-xs text-muted-500">
        <p>&copy; {new Date().getFullYear()} GestivaOne. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

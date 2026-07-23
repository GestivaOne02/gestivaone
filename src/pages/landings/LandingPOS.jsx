import { Link } from 'react-router-dom'
import { ShoppingCart, Printer, Barcode, ArrowRight, Zap, CheckCircle2 } from 'lucide-react'
import SEOHead from '@/components/seo/SEOHead'

export default function LandingPOS() {
  return (
    <div className="min-h-screen bg-[#0e0e17] text-foreground selection:bg-brand-500/30 selection:text-brand-300">
      <SEOHead
        title="Software POS y Control de Inventario en Tiempo Real — GestivaOne"
        description="Punto de venta POS veloz, lectura de código de barras, alertas de stock crítico e impresoras térmicas para tu negocio."
        canonical="https://www.gestivaone.com/pos-inventario"
        keywords="software POS Colombia, sistema punto de venta, inventarios tiempo real, impresoras térmicas POS"
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
          <ShoppingCart size={14} />
          Punto de Venta e Inventario Móvil
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white max-w-4xl mx-auto tracking-tight leading-tight">
          Software POS Ultrarrápido y Control de <span className="text-brand-400">Inventario</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-400 max-w-2xl mx-auto leading-relaxed">
          Escanea códigos de barra, registra ventas en segundos y mantén tu inventario actualizado automáticamente sin importar dónde estés.
        </p>
        <div className="flex justify-center pt-4">
          <Link
            to="/auth?mode=register"
            className="px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-extrabold transition-all flex items-center gap-2"
          >
            Prueba el Sistema POS Gratis <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <section className="py-16 bg-surface-800 border-t border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface-750 border border-subtle p-6 rounded-3xl space-y-3">
            <Barcode size={24} className="text-brand-400" />
            <h3 className="text-base font-bold text-foreground">Escáner de Código de Barras</h3>
            <p className="text-xs text-muted-400 leading-relaxed">Compatible con lectores físicos USB/Bluetooth y cámara de dispositivos móviles.</p>
          </div>
          <div className="bg-surface-750 border border-subtle p-6 rounded-3xl space-y-3">
            <Zap size={24} className="text-brand-400" />
            <h3 className="text-base font-bold text-foreground">Alertas de Stock Crítico</h3>
            <p className="text-xs text-muted-400 leading-relaxed">Recibe avisos automáticos cuando los productos estén próximos a agotarse.</p>
          </div>
          <div className="bg-surface-750 border border-subtle p-6 rounded-3xl space-y-3">
            <Printer size={24} className="text-brand-400" />
            <h3 className="text-base font-bold text-foreground">Ticket y Cierre de Caja</h3>
            <p className="text-xs text-muted-400 leading-relaxed">Resumen automático de caja diaria con reporte de ingresos, egresos y medios de pago.</p>
          </div>
        </div>
      </section>

      <footer className="bg-surface-950 border-t border-subtle py-8 text-center text-xs text-muted-500">
        <p>&copy; {new Date().getFullYear()} GestivaOne. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

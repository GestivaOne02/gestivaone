import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
import Icon from '@/components/ui/Icon';

export default function LandingFacturacion() {
  return (
    <div className="min-h-screen bg-[#0e0e17] text-foreground selection:bg-brand-500/30 selection:text-brand-300">
      <SEOHead
        title="Facturación Electrónica y Recibos POS en Colombia — GestivaOne"
        description="Emisión rápida de facturas comerciales, soporte DIAN, cuentas de cobro e impresión de recibos térmicos para negocios en Colombia."
        canonical="https://www.gestivaone.com/facturacion-electronica"
        keywords="facturación electrónica DIAN, software de facturas Colombia, recibos térmicos POS, cuentas de cobro"
      />

      {/* Top Navbar */}
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

      {/* Hero Section */}
      <header className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold uppercase tracking-wider border border-brand-500/20">
          <Icon name="FileText" size={14}  />
          Facturación Inteligente para Colombia
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white max-w-4xl mx-auto tracking-tight leading-tight">
          Facturación Electrónica DIAN y Recibos Comerciales en <span className="text-brand-400">Segundos</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-400 max-w-2xl mx-auto leading-relaxed">
          Genera comprobantes digitales, cuentas de cobro oficiales y tickets de venta compatibles con impresoras térmicas desde cualquier dispositivo.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/auth?mode=register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-extrabold transition-all flex items-center justify-center gap-2"
          >
            Crear Cuenta de Facturación Gratis <Icon name="ArrowRight" size={16}  />
          </Link>
        </div>
      </header>

      {/* Features Detail */}
      <section className="py-16 bg-surface-800 border-t border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-750 border border-subtle p-6 rounded-3xl space-y-3">
              <Icon name="Printer" size={24} className="text-brand-400"  />
              <h3 className="text-base font-bold text-foreground">Impresión POS Térmica</h3>
              <p className="text-xs text-muted-400 leading-relaxed">Imprime recibos de 58mm y 80mm al instante con tu logo corporativo y datos legales.</p>
            </div>
            <div className="bg-surface-750 border border-subtle p-6 rounded-3xl space-y-3">
              <Icon name="Mail" size={24} className="text-brand-400"  />
              <h3 className="text-base font-bold text-foreground">Envío por Email & WhatsApp</h3>
              <p className="text-xs text-muted-400 leading-relaxed">Envía comprobantes de compra directamente al correo o WhatsApp de tus clientes.</p>
            </div>
            <div className="bg-surface-750 border border-subtle p-6 rounded-3xl space-y-3">
              <Icon name="ShieldCheck" size={24} className="text-brand-400"  />
              <h3 className="text-base font-bold text-foreground">Formatos PDF Oficiales</h3>
              <p className="text-xs text-muted-400 leading-relaxed">Descarga cuentas de cobro y facturas en formato PDF estándar listo para contabilidad.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-950 border-t border-subtle py-8 text-center text-xs text-muted-500">
        <p>&copy; {new Date().getFullYear()} GestivaOne. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

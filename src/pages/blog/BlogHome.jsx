import { Link } from 'react-router-dom'
import { FileText, Calendar, User, ArrowRight, Sparkles, BookOpen } from 'lucide-react'
import SEOHead from '@/components/seo/SEOHead'

const plannedArticles = [
  {
    category: 'Facturación & DIAN',
    title: 'Guía Completa de Facturación Electrónica en Colombia para PyMEs',
    summary: 'Todo lo que necesitas saber sobre la normativa actual, emisión de comprobantes digitales y requisitos para pequeños comerciantes.',
    date: 'Proximamente',
    readTime: '5 min'
  },
  {
    category: 'Hardware & POS',
    title: 'Cómo elegir la mejor Impresora Térmica (58mm vs 80mm) para tu Negocio',
    summary: 'Comparativa de impresoras térmicas USB y Bluetooth. Ventajas de velocidad, costo de papel e integración con software POS.',
    date: 'Proximamente',
    readTime: '4 min'
  },
  {
    category: 'Cobranzas & CRM',
    title: 'Cómo Automatizar Recordatorios de Pago por WhatsApp Business',
    summary: 'Estrategias probadas para recuperar cartera vencida y acelerar el recaudo de cuentas por cobrar usando mensajes directos.',
    date: 'Proximamente',
    readTime: '6 min'
  }
]

export default function BlogHome() {
  return (
    <div className="min-h-screen bg-[#0e0e17] text-foreground selection:bg-brand-500/30 selection:text-brand-300">
      <SEOHead
        title="Blog y Recursos de Gestión Comercial — GestivaOne"
        description="Artículos, guías y tutoriales sobre facturación electrónica, control de inventarios, punto de venta y finanzas para negocios en Colombia."
        canonical="https://www.gestivaone.com/blog"
        keywords="blog gestión comercial Colombia, tutoriales facturación electrónica, guías POS pymes"
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

      {/* Header */}
      <header className="py-16 bg-surface-900 border-b border-subtle text-center space-y-4">
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold uppercase tracking-wider border border-brand-500/20">
            <BookOpen size={14} />
            Blog & Recursos Educativos
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Conocimiento para Hacer Crecer tu <span className="text-brand-400">Empresa</span></h1>
          <p className="text-sm text-muted-400">
            Guías prácticas, tutoriales de hardware POS y estrategias de finanzas comerciales redactadas por expertos.
          </p>
        </div>
      </header>

      {/* Blog Cards */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plannedArticles.map((art, idx) => (
            <div key={idx} className="bg-surface-750 border border-subtle p-6 rounded-3xl space-y-4 flex flex-col justify-between hover:border-brand-500/40 transition-all duration-300">
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20 inline-block">
                  {art.category}
                </span>
                <h2 className="text-base font-bold text-foreground leading-snug">{art.title}</h2>
                <p className="text-xs text-muted-400 leading-relaxed">{art.summary}</p>
              </div>

              <div className="pt-4 border-t border-subtle flex items-center justify-between text-[11px] text-muted-500 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>{art.date}</span>
                </div>
                <span>{art.readTime} lectura</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-surface-950 border-t border-subtle py-8 text-center text-xs text-muted-500">
        <p>&copy; {new Date().getFullYear()} GestivaOne. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

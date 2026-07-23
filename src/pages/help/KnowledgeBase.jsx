import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
import Icon from '@/components/ui/Icon';

const categories = [
  {
    icon: BookOpen,
    title: 'Primeros Pasos',
    desc: 'Guía de inicio rápido, configuración de cuenta e invitaciones de equipo.',
    articles: [
      'Cómo crear tu empresa y configurar datos básicos',
      'Invitar trabajadores y asignar roles',
      'Configuración de moneda y país'
    ]
  },
  {
    icon: Printer,
    title: 'Impresoras Térmicas POS',
    desc: 'Conexión y calibración de impresoras térmicas USB, Bluetooth y de red.',
    articles: [
      'Configurar impresora térmica de 58mm y 80mm',
      'Personalizar logo y pie de página en recibos',
      'Solución a problemas de impresión'
    ]
  },
  {
    icon: ShoppingCart,
    title: 'Inventario & Catálogo',
    desc: 'Gestión de productos, categorías, precios y lectura de código de barras.',
    articles: [
      'Cómo cargar productos masivos e imágenes',
      'Configurar alertas de stock crítico',
      'Uso del escáner de código de barras'
    ]
  },
  {
    icon: FileText,
    title: 'Facturación & Finanzas',
    desc: 'Emisión de recibos, cuentas de cobro y exportación de reportes.',
    articles: [
      'Generar cuenta de cobro en PDF',
      'Exportar reportes de egresos y ventas a Excel',
      'Facturación comercial e integración DIAN'
    ]
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp & Notificaciones',
    desc: 'Notificaciones automáticas por correo SMTP y recordatorios por WhatsApp.',
    articles: [
      'Enviar comprobantes por WhatsApp Business',
      'Configuración de notificaciones por correo',
      'Gestión de cuentas por cobrar a clientes'
    ]
  }
]

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCategories = categories.filter(cat =>
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.articles.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-[#0e0e17] text-foreground selection:bg-brand-500/30 selection:text-brand-300">
      <SEOHead
        title="Centro de Ayuda y Base de Conocimientos — GestivaOne"
        description="Encuentra tutoriales, guías de configuración de impresoras térmicas, inventarios, facturación y soporte técnico de GestivaOne."
        canonical="https://www.gestivaone.com/ayuda"
        keywords="centro de ayuda GestivaOne, tutoriales POS, configurar impresora térmica, soporte técnico GestivaOne"
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

      {/* Header Search */}
      <header className="py-16 bg-surface-900 border-b border-subtle text-center space-y-6">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold uppercase tracking-wider border border-brand-500/20">
            <Icon name="HelpCircle" size={14}  />
            Centro de Ayuda
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">¿En qué podemos ayudarte hoy?</h1>
          <div className="relative max-w-xl mx-auto">
            <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-400" size={18}  />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Busca por tema: impresoras, inventario, facturación..."
              className="w-full bg-surface-800 border border-subtle rounded-2xl pl-11 pr-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      </header>

      {/* Categories Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((cat, idx) => {
            const Icon = cat.icon
            return (
              <div key={idx} className="bg-surface-750 border border-subtle p-6 rounded-3xl space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20">
                    <Icon size={22} />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">{cat.title}</h2>
                  <p className="text-xs text-muted-400">{cat.desc}</p>
                  <ul className="space-y-2 pt-2 border-t border-subtle/50">
                    {cat.articles.map((art, aIdx) => (
                      <li key={aIdx} className="text-xs text-muted-300 hover:text-brand-400 transition-colors flex items-center gap-2 cursor-pointer">
                        <Icon name="ChevronRight" size={14} className="text-brand-400 shrink-0"  />
                        <span>{art}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      <footer className="bg-surface-950 border-t border-subtle py-8 text-center text-xs text-muted-500">
        <p>&copy; {new Date().getFullYear()} GestivaOne. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

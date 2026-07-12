import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Zap, Layers, TrendingUp, Printer, MessageSquare, Mail, Phone, MapPin, Check,
  ChevronRight, ArrowRight, ShieldCheck, ShoppingCart, BarChart3, Users2, Moon, Sun,
  LayoutGrid, Gem, User
} from 'lucide-react'
import { useState, useEffect } from 'react'
import clsx from 'clsx'

export default function Landing() {
  const navigate = useNavigate()
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    // Check current theme
    const isDark = document.documentElement.classList.contains('dark')
    setIsDarkMode(isDark)
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    if (html.classList.contains('dark')) {
      html.classList.remove('dark')
      setIsDarkMode(false)
      localStorage.setItem('theme', 'light')
    } else {
      html.classList.add('dark')
      setIsDarkMode(true)
      localStorage.setItem('theme', 'dark')
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
  }

  return (
    <div className="min-h-screen bg-surface-900 text-foreground selection:bg-brand-500/30 selection:text-brand-300">

      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-50 bg-surface-900/80 backdrop-blur-md border-b border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left: App Launcher & Logo */}
            <div className="flex items-center gap-3">
              <button className="text-muted-400 hover:text-foreground transition-colors p-2 -ml-2 rounded-xl hover:bg-surface-800">
                <LayoutGrid size={20} />
              </button>
              <div className="flex items-center gap-2">
                <img src="/images/gestivaOneIcon.svg" alt="GestivaOne Logo" className="h-8 w-auto" />
                <span className="font-bold text-foreground text-lg hidden sm:block">
                  Gestiva<span className="text-brand-500">One</span>
                </span>
              </div>
            </div>

            {/* Center: Navigation links */}
            <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              <a href="#caracteristicas" className="text-sm font-semibold text-muted-400 hover:text-foreground transition-colors">Características</a>
              <a href="#nosotros" className="text-sm font-semibold text-muted-400 hover:text-foreground transition-colors">Nosotros</a>
              <a href="#precios" className="text-sm font-semibold text-muted-400 hover:text-foreground transition-colors">Precios</a>
              <a href="#contacto" className="text-sm font-semibold text-muted-400 hover:text-foreground transition-colors">Contacto</a>

              {/* Market link */}
              <a
                href="https://gestivaone-store.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-400 hover:text-brand-300 transition-colors"
              >
                <ShoppingCart size={14} />
                Market
              </a>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/auth?mode=register"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-brand-500/30 text-brand-400 hover:bg-brand-500/10 text-xs font-bold transition-all duration-300"
              >
                <span className="hidden md:inline">Empieza Tu Gestión</span>
                <span className="md:hidden">Empezar</span>
              </Link>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-muted-400 hover:text-foreground hover:bg-surface-800 transition-colors"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <Link
                to="/auth?mode=login"
                className="w-8 h-8 rounded-full bg-surface-700 border border-subtle flex items-center justify-center text-muted-400 hover:text-foreground hover:border-brand-500/50 transition-all overflow-hidden"
                title="Ingresar"
              >
                <User size={16} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <header className="relative overflow-hidden pb-0 pt-16 lg:pt-24">
        {/* ── Background: app preview image ── */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/gestivaOnePreview.png')" }}
        />
        {/* Dark overlay so text stays readable */}
        <div className="absolute inset-0 bg-surface-900/80 backdrop-blur-[2px]" />

        {/* Subtle purple glow on top */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end"
          >
            {/* Hero text content — left column */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left pb-12 lg:pb-20">
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider"
              >
                <ShieldCheck size={14} />
                Gestión Inteligente y Automatizada
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-foreground"
              >
                Toma el Control de tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">Negocio</span> en Tiempo Real
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg text-muted-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                La plataforma moderna que necesitas para automatizar inventarios, facturación, cuentas de cobro, reportes financieros y más, diseñada para optimizar cada proceso en tu empresa.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <Link
                  to="/auth?mode=register"
                  className="w-full sm:w-auto text-center px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-extrabold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Empieza Tu Gestión Gratis
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="#caracteristicas"
                  className="w-full sm:w-auto text-center px-6 py-4 rounded-xl bg-surface-800/60 border border-subtle hover:bg-surface-700 hover:text-white text-muted-400 text-sm font-semibold transition-colors backdrop-blur-sm"
                >
                  Ver Características
                </a>
              </motion.div>
            </div>

            {/* Dashboard mockup — right column, floats in front of the background */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-7 relative flex items-end justify-center lg:justify-end"
            >
              {/* Glow behind card */}
              <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-brand-500/25 rounded-full blur-[80px] pointer-events-none" />

              {/* App card — overflows into next section */}
              <div className="relative w-full max-w-[620px] lg:max-w-none -mb-12 lg:-mb-20">
                <div className="rounded-t-2xl overflow-hidden border-t border-l border-r border-white/10 ring-1 ring-brand-500/20 backdrop-blur-sm">
                  {/* Browser chrome bar */}
                  <div className="flex items-center gap-1.5 px-4 py-2.5 bg-surface-900/90 border-b border-white/5">
                    <span className="w-2.5 h-2.5 rounded-full bg-danger-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-warning-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-success-500/70" />
                    <span className="ml-4 flex-1 bg-surface-700 rounded-md h-4 text-[9px] text-muted-400 flex items-center px-2 font-mono">app.gestivaone.com</span>
                  </div>
                  {/* Dashboard mockup content */}
                  <div className="bg-surface-800/95 p-4 space-y-3">
                    {/* Widgets row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-surface-700/60 border border-subtle rounded-xl p-3 space-y-1">
                        <span className="text-[9px] text-muted-400 font-bold uppercase">Ventas Hoy</span>
                        <p className="text-sm font-bold text-foreground">$1,245,000</p>
                        <span className="text-[8px] text-success-400 font-bold">+12.5% vs ayer</span>
                      </div>
                      <div className="bg-surface-700/60 border border-subtle rounded-xl p-3 space-y-1">
                        <span className="text-[9px] text-muted-400 font-bold uppercase">Deudas</span>
                        <p className="text-sm font-bold text-danger-400">$340,000</p>
                        <span className="text-[8px] text-muted-400">4 pendientes</span>
                      </div>
                      <div className="bg-surface-700/60 border border-subtle rounded-xl p-3 space-y-1">
                        <span className="text-[9px] text-muted-400 font-bold uppercase">Stock</span>
                        <p className="text-sm font-bold text-warning-400">2 Bajos</p>
                        <span className="text-[8px] text-warning-400 font-bold">Revisar</span>
                      </div>
                    </div>
                    {/* Activity list */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-muted-400 font-bold uppercase tracking-wider">Últimas Actividades</span>
                      <div className="flex items-center justify-between p-2.5 bg-surface-750/80 border border-subtle rounded-xl text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-success-500/10 text-success-400 flex items-center justify-center font-bold">$</div>
                          <div>
                            <p className="font-bold text-foreground">Venta Realizada</p>
                            <span className="text-[9px] text-muted-400">Cliente Express • Hace 3 min</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-success-400">+$215,390</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-surface-750/80 border border-subtle rounded-xl text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-danger-500/10 text-danger-400 flex items-center justify-center font-bold">-</div>
                          <div>
                            <p className="font-bold text-foreground">Egreso Registrado</p>
                            <span className="text-[9px] text-muted-400">Alquiler/Servicios • Hace 1h</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-danger-400">-$150,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* ─── FEATURES SECTION ─── */}
      <section id="caracteristicas" className="pt-32 pb-20 bg-surface-800 border-t border-b border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <h2 className="text-brand-400 text-xs font-bold uppercase tracking-widest">Todo en una sola herramienta</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-foreground">Características principales diseñadas para tu crecimiento</p>
            <p className="text-sm text-muted-400">Automatiza la gestión operativa y contable para concentrarte en expandir tu negocio.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-surface-750 border border-subtle p-6 rounded-3xl hover:border-brand-500/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20 group-hover:scale-110 transition-transform mb-6">
                <ShoppingCart size={20} />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Control de Inventario</h3>
              <p className="text-xs text-muted-400 leading-relaxed">
                Supervisa tu stock con notificaciones de stock crítico y agotados en tiempo real. Gestiona categorías de productos, precios de venta e IVA.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface-750 border border-subtle p-6 rounded-3xl hover:border-brand-500/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20 group-hover:scale-110 transition-transform mb-6">
                <Printer size={20} />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Impresión de Recibos</h3>
              <p className="text-xs text-muted-400 leading-relaxed">
                Configura tu impresora térmica con plantillas estilizadas. Imprime recibos automáticamente al completar una venta o genera test de impresión.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface-750 border border-subtle p-6 rounded-3xl hover:border-brand-500/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20 group-hover:scale-110 transition-transform mb-6">
                <MessageSquare size={20} />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Notificaciones por Canal</h3>
              <p className="text-xs text-muted-400 leading-relaxed">
                Envía facturas automáticas por correo (SMTP) o notificaciones de cobro a través de WhatsApp Business para asegurar recaudos rápidos.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-surface-750 border border-subtle p-6 rounded-3xl hover:border-brand-500/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20 group-hover:scale-110 transition-transform mb-6">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Reportes Ejecutivos Profundos</h3>
              <p className="text-xs text-muted-400 leading-relaxed">
                Exporta reportes oficiales de facturación, egresos y abonos de dinero a PDF o Excel con un solo clic. Análisis de utilidades integrado.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-surface-750 border border-subtle p-6 rounded-3xl hover:border-brand-500/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20 group-hover:scale-110 transition-transform mb-6">
                <Users2 size={20} />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Trabajo Multi-Usuario</h3>
              <p className="text-xs text-muted-400 leading-relaxed">
                Añade trabajadores (despachadores, contables) mediante invitaciones encriptadas y restringe accesos según roles definidos.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-surface-750 border border-subtle p-6 rounded-3xl hover:border-brand-500/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20 group-hover:scale-110 transition-transform mb-6">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Multi-Moneda & Tasas</h3>
              <p className="text-xs text-muted-400 leading-relaxed">
                Configura tu moneda local y sincroniza tasas cambiarias en tiempo real para cotizaciones y cierres financieros de alta precisión.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ABOUT US SECTION ─── */}
      <section id="nosotros" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text description */}
            <div className="space-y-6">
              <span className="text-brand-400 text-xs font-bold uppercase tracking-widest">Nuestra Misión</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">
                Impulsando la transformación digital de las empresas
              </h2>
              <p className="text-sm text-muted-400 leading-relaxed">
                En GestivaOne, creemos que la contabilidad y la gestión operativa no deberían ser un dolor de cabeza para los emprendedores. Nacimos con la visión de crear un software intuitivo, potente y accesible que permita a cualquier negocio automatizar sus ventas, cobranzas y reportes ejecutivos.
              </p>
              <p className="text-sm text-muted-400 leading-relaxed">
                Nos dedicamos a construir herramientas estables en la nube que utilicen bases de datos rápidas, alertas preventivas y canales de comunicación modernos para que tengas una visualización integral del estado financiero de tu negocio estés donde estés.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-subtle">
                <div>
                  <h4 className="text-lg font-bold text-brand-400">99.9%</h4>
                  <p className="text-xs text-muted-500 uppercase font-semibold">Tiempo en línea garantizado</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-success-400">100%</h4>
                  <p className="text-xs text-muted-500 uppercase font-semibold">Datos respaldados y seguros</p>
                </div>
              </div>
            </div>

            {/* Visual illustration / cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-surface-800 border border-subtle p-6 rounded-3xl space-y-2">
                  <h4 className="text-sm font-bold text-foreground">Innovación</h4>
                  <p className="text-xs text-muted-400">Construimos sobre las tecnologías más rápidas y seguras del mercado.</p>
                </div>
                <div className="bg-surface-800 border border-subtle p-6 rounded-3xl space-y-2">
                  <h4 className="text-sm font-bold text-foreground">Simplicidad</h4>
                  <p className="text-xs text-muted-400">Nuestra interfaz está hecha para que no necesites experiencia previa en finanzas.</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-surface-800 border border-subtle p-6 rounded-3xl space-y-2">
                  <h4 className="text-sm font-bold text-foreground">Escalabilidad</h4>
                  <p className="text-xs text-muted-400">Crece de forma ilimitada añadiendo productos, sedes y trabajadores.</p>
                </div>
                <div className="bg-surface-800 border border-subtle p-6 rounded-3xl space-y-2">
                  <h4 className="text-sm font-bold text-foreground">Seguridad</h4>
                  <p className="text-xs text-muted-400">Acceso restringido por roles con cifrado de nivel bancario.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING SECTION ─── */}
      <section id="precios" className="py-20 bg-surface-800 border-t border-b border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <span className="text-brand-400 text-xs font-bold uppercase tracking-widest">Planes de Suscripción</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">Precios transparentes y sin sorpresas</h2>
            <p className="text-sm text-muted-400">Encuentra el plan perfecto para las necesidades de tu empresa.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Plan 1: Standard */}
            <div className="bg-surface-750 border border-subtle p-8 rounded-3xl space-y-6 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-surface-650 text-muted-400 border border-subtle inline-block">One Standard</span>
                <div className="flex items-baseline">
                  <span className="text-4xl font-black text-foreground">$0</span>
                  <span className="text-xs text-muted-400 ml-1">/ siempre</span>
                </div>
                <p className="text-xs text-muted-400">Perfecto para pequeños comercios y profesionales independientes.</p>

                <ul className="space-y-3 pt-4 border-t border-subtle text-xs text-muted-300">
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> 1 trabajador</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Facturación básica</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Gestión de clientes</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Inventario limitado</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Soporte comunitario</li>
                </ul>
              </div>

              <Link
                to="/auth?mode=register&plan=standard"
                className="w-full text-center py-3 rounded-xl bg-surface-600 hover:bg-surface-500 border border-subtle text-foreground text-xs font-bold transition-all block"
              >
                Comenzar Gratis
              </Link>
            </div>

            {/* Plan 2: Pro */}
            <div className="bg-surface-750 border-2 border-brand-500 p-8 rounded-3xl space-y-6 flex flex-col justify-between relative">
              <div className="absolute top-4 right-4 bg-brand-600 text-white font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-full tracking-widest">
                MÁS POPULAR
              </div>
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 inline-block">One Pro</span>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-brand-400">$7.000</span>
                    <span className="text-xs text-muted-500 line-through">$32.000</span>
                  </div>
                  <span className="text-[10px] text-muted-400 block font-bold">/ mes COP</span>
                  <span className="text-[9px] font-black tracking-wider uppercase bg-success-500/15 text-success-700 dark:bg-success-950 dark:text-success-400 px-2 py-0.5 rounded block w-max">
                    78% DESCUENTO PRIMER MES
                  </span>
                </div>
                <p className="text-xs text-muted-400">Para negocios en crecimiento que requieren gestión de personal y reportes avanzados.</p>

                <ul className="space-y-3 pt-4 border-t border-subtle text-xs text-muted-300">
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Hasta 10 trabajadores</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Todo lo de Standard</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Dashboard avanzado</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Gestión de empleados</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Reportes PDF/Excel</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Soporte prioritario</li>
                </ul>
              </div>

              <Link
                to="/auth?mode=register&plan=pro"
                className="w-full text-center py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all block"
              >
                Obtener Plan Pro
              </Link>
            </div>

            {/* Plan 3: 360 */}
            <div className="bg-surface-750 border border-subtle p-8 rounded-3xl space-y-6 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-surface-650 text-muted-400 border border-subtle inline-block">One 360</span>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-foreground">$80.000</span>
                    <span className="text-xs text-muted-500 line-through">$120.000</span>
                  </div>
                  <span className="text-[10px] text-muted-400 block font-bold">/ mes COP</span>
                  <span className="text-[9px] font-black tracking-wider uppercase bg-success-500/15 text-success-700 dark:bg-success-950 dark:text-success-400 px-2 py-0.5 rounded block w-max">
                    33% DESCUENTO PRIMEROS 3 MESES
                  </span>
                </div>
                <p className="text-xs text-muted-400">Para empresas consolidadas que buscan automatización avanzada y multi-dispositivo.</p>

                <ul className="space-y-3 pt-4 border-t border-subtle text-xs text-muted-300">
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Hasta 30 trabajadores</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Todo lo de Pro</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Multi-sucursal</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> API personalizada</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Gerente de cuenta dedicado</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> SLA 99.9%</li>
                </ul>
              </div>

              <Link
                to="/auth?mode=register&plan=empresarial"
                className="w-full text-center py-3 rounded-xl bg-surface-600 hover:bg-surface-500 border border-subtle text-foreground text-xs font-bold transition-all block"
              >
                Obtener Plan 360
              </Link>
            </div>

            {/* Plan 4: Enterprise */}
            <div className="bg-surface-750 border border-subtle p-8 rounded-3xl space-y-6 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-surface-650 text-muted-400 border border-subtle inline-block">Enterprise</span>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-foreground">A Medida</span>
                  </div>
                  <span className="text-[10px] text-muted-400 block font-bold">Plan personalizado</span>
                </div>
                <p className="text-xs text-muted-400">Soluciones de alto rendimiento para corporaciones complejas que requieren desarrollos customizados.</p>

                <ul className="space-y-3 pt-4 border-t border-subtle text-xs text-muted-300">
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Trabajadores ilimitados</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Desarrollo a la medida</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Migración premium</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Infraestructura dedicada</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-brand-400" /> Soporte 24/7</li>
                </ul>
              </div>

              <a
                href="mailto:soporte@gestivaone.com?subject=Consulta%20Plan%20Enterprise"
                className="w-full text-center py-3 rounded-xl bg-surface-600 hover:bg-surface-500 border border-subtle text-foreground text-xs font-bold transition-all block"
              >
                Contactar Ventas
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTACT SECTION ─── */}
      <section id="contacto" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Contact Information */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-brand-400 text-xs font-bold uppercase tracking-widest">Contacto</span>
              <h2 className="text-3xl font-extrabold text-foreground">¿Tienes dudas? Escríbenos hoy mismo</h2>
              <p className="text-xs md:text-sm text-muted-400 leading-relaxed">
                Nuestro equipo de soporte está disponible de lunes a sábado para ayudarte a migrar tus datos o resolver cualquier inconveniente técnico.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20"><Mail size={16} /></div>
                  <div>
                    <p className="text-[10px] text-muted-500 uppercase font-bold">Correo Electrónico</p>
                    <a href="mailto:soporte@gestivaone.com" className="text-sm font-semibold text-foreground hover:text-brand-400 transition-colors">soporte@gestivaone.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20"><Phone size={16} /></div>
                  <div>
                    <p className="text-[10px] text-muted-500 uppercase font-bold">Línea de Atención</p>
                    <a href="tel:+573043059862" className="text-sm font-semibold text-foreground hover:text-brand-400 transition-colors">+57 (304) 405-9862</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20"><MapPin size={16} /></div>
                  <div>
                    <p className="text-[10px] text-muted-500 uppercase font-bold">Oficina Principal</p>
                    <p className="text-sm font-semibold text-foreground">Barranquilla, Atlantico, Colombia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Simple Contact Form mockup */}
            <div className="lg:col-span-7 bg-surface-800 border border-subtle p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-foreground">Envíanos un mensaje directo</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="text-[10px] text-muted-400 font-bold uppercase tracking-wider block mb-1">Nombre Completo</label>
                  <input id="contact-name" name="name" type="text" placeholder="Ej: Randy Mendoza" className="w-full bg-surface-700 border border-subtle rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
                <div>
                  <label htmlFor="contact-email" className="text-[10px] text-muted-400 font-bold uppercase tracking-wider block mb-1">Correo electrónico</label>
                  <input id="contact-email" name="email" type="email" placeholder="correo@empresa.com" className="w-full bg-surface-700 border border-subtle rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
              </div>
              <div>
                <label htmlFor="contact-subject" className="text-[10px] text-muted-400 font-bold uppercase tracking-wider block mb-1">Asunto</label>
                <input id="contact-subject" name="subject" type="text" placeholder="Ej: Consulta sobre el Plan Empresarial" className="w-full bg-surface-700 border border-subtle rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                <label htmlFor="contact-message" className="text-[10px] text-muted-400 font-bold uppercase tracking-wider block mb-1">Tu mensaje</label>
                <textarea id="contact-message" name="message" rows={4} placeholder="Escribe tu duda o consulta aquí..." className="w-full bg-surface-700 border border-subtle rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none" />
              </div>
              <button
                type="button"
                onClick={() => alert('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.')}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all"
              >
                Enviar Mensaje
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-surface-950 border-t border-subtle py-12 text-center text-xs text-muted-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-center gap-2">
            <Zap size={16} className="text-brand-400" />
            <span className="font-extrabold uppercase text-foreground tracking-wider">GESTIVAONE</span>
          </div>
          <p className="max-w-md mx-auto leading-relaxed">
            Plataforma digital avanzada para el control integral de negocios, inventarios y finanzas corporativas.
          </p>
          <div className="flex items-center justify-center gap-6">
            <Link to="/terms" className="hover:text-foreground transition-colors font-medium">Términos y Condiciones</Link>
            <span className="text-white/10">|</span>
            <span className="font-medium">Política de Privacidad</span>
            <span className="text-white/10">|</span>
            <span className="font-medium">Soporte Técnico</span>
          </div>
          <p className="pt-6 border-t border-white/5">
            &copy; {new Date().getFullYear()} GestivaOne. Todos los derechos reservados.
          </p>
        </div>
      </footer>



    </div>
  )
}

import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'

const AppLayout = lazy(() => import('@/components/layout/AppLayout'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Menu = lazy(() => import('@/pages/Menu'))
const Products = lazy(() => import('@/pages/Products'))
const Settings = lazy(() => import('@/pages/Settings'))
const Account = lazy(() => import('@/pages/Account'))
const Employees = lazy(() => import('@/pages/Employees'))
const Auth = lazy(() => import('@/pages/Auth'))
import Landing from '@/pages/Landing'
const Notifications = lazy(() => import('@/pages/Notifications'))
import Terms from '@/pages/Terms'
const Facturero = lazy(() => import('@/pages/Facturero'))
const DianAssistant = lazy(() => import('@/pages/DianAssistant'))
const Pockets = lazy(() => import('@/pages/Pockets'))
const PersonalFinance = lazy(() => import('@/pages/PersonalFinance'))
const Finances = lazy(() => import('@/pages/Finances'))
const GestiToken = lazy(() => import('@/pages/GestiToken'))
const CRM = lazy(() => import('@/pages/CRM'))
const Emails = lazy(() => import('@/pages/Emails'))
const Upgrade = lazy(() => import('@/pages/Upgrade'))
const Store = lazy(() => import('@/pages/Store'))
const LandingFacturacion = lazy(() => import('@/pages/landings/LandingFacturacion'))
const LandingPOS = lazy(() => import('@/pages/landings/LandingPOS'))
const LandingRestaurantes = lazy(() => import('@/pages/landings/LandingRestaurantes'))
const LandingMinimarkets = lazy(() => import('@/pages/landings/LandingMinimarkets'))
const LandingPymes = lazy(() => import('@/pages/landings/LandingPymes'))
const LandingCRM = lazy(() => import('@/pages/landings/LandingCRM'))
const KnowledgeBase = lazy(() => import('@/pages/help/KnowledgeBase'))
const BlogHome = lazy(() => import('@/pages/blog/BlogHome'))
import { useUIStore, applyTheme } from '@/store/useUIStore'
import { useCurrencyStore } from '@/store/useCurrencyStore'
import { useInvoiceStore } from '@/store/useInvoiceStore'
import { useAuthStore, ROLES } from '@/store/useAuthStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import ConsentBanner from '@/components/ui/ConsentBanner'
import CountrySelectorModal from '@/components/modals/CountrySelectorModal'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

// ── Guards ────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/auth" replace />
}

function RequirePermission({ perm, children }) {
  const user = useAuthStore((s) => s.user)
  const role = user?.role || 'despachador'
  const allowed = ROLES[role]?.permissions[perm] ?? false
  return allowed ? children : <Navigate to="/" replace />
}

function RequireFeature({ feature, children }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/auth" replace />

  // Master role/plan has all features
  if (user.role === 'master' || user.plan === 'empresarial' || user.plan === 'enterprise' || user.id === 'mock-admin-id') {
    return children
  }

  // Check purchased features
  const purchasedFeatures = user.settings?.purchased_features || []
  const hasPurchased = Array.isArray(purchasedFeatures) 
    ? purchasedFeatures.includes(feature)
    : !!purchasedFeatures[feature]

  if (hasPurchased) {
    return children
  }

  // Specific plan defaults
  if (feature === 'employees' && user.plan === 'pro') {
    return children
  }

  return <Navigate to="/upgrade" replace />
}

export default function App() {
  const theme = useUIStore((s) => s.theme)
  const fetchRates = useCurrencyStore((s) => s.fetchRates)
  const isStale = useCurrencyStore((s) => s.isStale)
  const checkOverdue = useInvoiceStore((s) => s.checkOverdue)
  const initAuth = useAuthStore((s) => s.init)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)

  const location = useLocation()

  useEffect(() => {
    const CURRENT_VERSION = '2.4'
    const lastVersion = localStorage.getItem('gestiva-app-version')
    const hasVersionChanged = lastVersion !== CURRENT_VERSION

    if (hasVersionChanged) {
      const obsoleteKeys = ['gestiva-expenses-v1', 'gestiva-ui-legacy', 'gestiva-remembered-password']
      obsoleteKeys.forEach((k) => localStorage.removeItem(k))
      localStorage.setItem('gestiva-app-version', CURRENT_VERSION)
    }
  }, [])



  const pageTitles = {
    '/': 'Dashboard',
    '/menu': 'Menú',
    '/products': 'Productos',
    '/employees': 'Empleados',
    '/settings': 'Configuración',
    '/account': 'Cuenta',
    '/notifications': 'Notificaciones',
    '/terms': 'Términos',
    '/facturero': 'Facturero',
    '/dian': 'Asistente DIAN',
    '/seguridad': 'GestiToken',
    '/crm': 'CRM',
    '/emails': 'Campañas',
    '/store': 'Mi Tienda'
  }

  useEffect(() => {
    if (location.pathname === '/auth') {
      document.documentElement.classList.remove('dark')
    } else {
      applyTheme(theme)
      if (theme === 'system') {
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = () => applyTheme('system')
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
      }
    }
  }, [theme, location.pathname])

  useEffect(() => {
    const pageTitle = (location.pathname === '/' && !isAuthenticated)
      ? 'Inicio'
      : (pageTitles[location.pathname] || 'GestivaOne')
    const originalTitle = `GO | ${pageTitle}`
    const attentionTitle = '¡Tienes una gestión pendiente!'

    document.title = originalTitle

    const handleVisibility = () => {
      document.title = document.hidden ? attentionTitle : originalTitle
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [location.pathname, isAuthenticated])

  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && location.pathname === '/auth') {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, location.pathname, navigate])

  useEffect(() => { initAuth() }, [])
  useEffect(() => { if (isStale()) fetchRates() }, [])
  useEffect(() => { checkOverdue() }, [])

  useEffect(() => {
    if (!isAuthenticated || !user) return

    const notifications = useSettingsStore.getState().notifications
    if (notifications?.weeklyReport) {
      const lastSentStr = user.settings?.lastWeeklyReportSent
      const now = new Date()
      let shouldSend = false

      if (!lastSentStr) {
        shouldSend = true
      } else {
        const lastSent = new Date(lastSentStr)
        const diffMs = now.getTime() - lastSent.getTime()
        const diffDays = diffMs / (1000 * 60 * 60 * 24)
        if (diffDays >= 7) {
          shouldSend = true
        }
      }

      if (shouldSend) {
        useInvoiceStore.getState().sendWeeklyReport().then((res) => {
          if (res.success) {
            // Report sent successfully
          } else if (!res.error?.includes('desactivado')) {
            console.warn('Error al enviar reporte semanal automático:', res.error)
          }
        }).catch(err => console.warn('Error invoking sendWeeklyReport:', err))
      }
    }
  }, [isAuthenticated, user?.id])

  useEffect(() => {
    // Egress fix: Polling and focus listeners removed to achieve 0 egress in idle.
    // Auth state is maintained solely by Supabase JWT and onAuthStateChange events.
  }, [isAuthenticated, user?.id])

  if (!initialized) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#120a2b] via-[#1b0d3d] to-[#0b051b] text-white">
        <div className="relative flex flex-col items-center">
          {/* Glowing Aura Effect */}
          <div className="absolute w-[200px] h-[200px] bg-brand-500/10 rounded-full blur-[60px] animate-pulse" />

          {/* Animated Logo Container */}
          <div className="relative z-10 flex items-center justify-center w-24 h-24 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)] animate-bounce [animation-duration:3s]">
            <svg
              className="w-12 h-12 text-brand-400 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          {/* Glowing text logo */}
          <h1 className="mt-8 text-2xl font-black tracking-widest text-white uppercase select-none">
            GESTIVA <span className="text-brand-400">ONE</span>
          </h1>

          {/* Subtitle / Phrase with pulse animation */}
          <p className="mt-4 px-6 text-center text-sm font-semibold tracking-wider text-brand-300/80 animate-pulse [animation-duration:2.5s] max-w-[320px]">
            Estamos trabajando para darte una mejor experiencia
          </p>

          {/* Minimalist Spinner */}
          <div className="mt-12 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2.5 h-2.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            <span className="w-2.5 h-2.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
          </div>
        </div>
      </div>
    )
  }


  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-[#0e0e17] flex items-center justify-center"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>}>
        <Routes>
          {/* Landing/Home Route (Conditional layout wrapper) */}
          <Route
            path="/"
            element={isAuthenticated ? <AppLayout /> : <Landing />}
          >
            <Route index element={<Dashboard />} />
          </Route>

          {/* Public Route */}
          <Route
            path="/auth"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Auth />}
          />
          <Route path="/terms" element={<Terms />} />
          <Route path="/facturacion-electronica" element={<LandingFacturacion />} />
          <Route path="/pos-inventario" element={<LandingPOS />} />
          <Route path="/restaurantes" element={<LandingRestaurantes />} />
          <Route path="/minimarkets" element={<LandingMinimarkets />} />
          <Route path="/pymes" element={<LandingPymes />} />
          <Route path="/crm-whatsapp" element={<LandingCRM />} />
          <Route path="/ayuda" element={<KnowledgeBase />} />
          <Route path="/blog" element={<BlogHome />} />

          {/* Protected Routes */}
          <Route
            element={isAuthenticated ? <AppLayout /> : <Navigate to="/auth" replace />}
          >
            <Route path="/menu" element={<RequirePermission perm="menu"><Menu /></RequirePermission>} />
            <Route path="/products" element={<RequirePermission perm="products"><Products /></RequirePermission>} />
            <Route path="/store" element={<RequirePermission perm="products"><Store /></RequirePermission>} />
            <Route path="/employees" element={<RequirePermission perm="employees"><RequireFeature feature="employees"><Employees /></RequireFeature></RequirePermission>} />
            <Route path="/settings" element={<RequirePermission perm="settings"><Settings /></RequirePermission>} />
            <Route path="/account" element={<Account />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/finances" element={<RequirePermission perm="dashboard"><RequireFeature feature="pockets"><Finances /></RequireFeature></RequirePermission>} />
            <Route path="/pockets" element={<Navigate to="/finances" replace />} />
            <Route path="/personal-finance" element={<Navigate to="/finances" replace />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/facturero" element={<RequirePermission perm="dashboard"><RequireFeature feature="facturero"><Facturero /></RequireFeature></RequirePermission>} />
            <Route path="/dian" element={<RequirePermission perm="dashboard"><RequireFeature feature="dian"><DianAssistant /></RequireFeature></RequirePermission>} />
            <Route path="/seguridad" element={<RequirePermission perm="dashboard"><RequireFeature feature="seguridad"><GestiToken /></RequireFeature></RequirePermission>} />
            <Route path="/crm" element={<RequirePermission perm="dashboard"><RequireFeature feature="crm"><CRM /></RequireFeature></RequirePermission>} />
            <Route path="/emails" element={<RequirePermission perm="dashboard"><RequireFeature feature="emails"><Emails /></RequireFeature></RequirePermission>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>

      <ConsentBanner />
      <CountrySelectorModal />
      {import.meta.env.PROD && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </>
  )
}

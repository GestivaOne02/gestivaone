import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import { useUIStore, applyTheme } from '@/store/useUIStore'
import { useCurrencyStore } from '@/store/useCurrencyStore'
import { useInvoiceStore } from '@/store/useInvoiceStore'
import { useAuthStore, ROLES } from '@/store/useAuthStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import ConsentBanner from '@/components/ui/ConsentBanner'
import CountrySelectorModal from '@/components/modals/CountrySelectorModal'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

// ── Lazy-loaded Page Components for Code-Splitting & Speed ──
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Menu = lazy(() => import('@/pages/Menu'))
const Products = lazy(() => import('@/pages/Products'))
const Settings = lazy(() => import('@/pages/Settings'))
const Account = lazy(() => import('@/pages/Account'))
const Employees = lazy(() => import('@/pages/Employees'))
const Auth = lazy(() => import('@/pages/Auth'))
const Landing = lazy(() => import('@/pages/Landing'))
const Notifications = lazy(() => import('@/pages/Notifications'))
const Terms = lazy(() => import('@/pages/Terms'))
const Facturero = lazy(() => import('@/pages/Facturero'))
const DianAssistant = lazy(() => import('@/pages/DianAssistant'))
const Finances = lazy(() => import('@/pages/Finances'))
const GestiToken = lazy(() => import('@/pages/GestiToken'))
const CRM = lazy(() => import('@/pages/CRM'))
const Emails = lazy(() => import('@/pages/Emails'))
const Upgrade = lazy(() => import('@/pages/Upgrade'))
const Store = lazy(() => import('@/pages/Store'))

// ── Loading Fallback Component ────────────────────────────────
function PageFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-8">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-400">Cargando módulo...</p>
    </div>
  )
}

// ── Guards ────────────────────────────────────────────────────
function RequirePermission({ perm, children }) {
  const user = useAuthStore((s) => s.user)
  const role = user?.role || 'despachador'
  const allowed = ROLES[role]?.permissions[perm] ?? false
  return allowed ? children : <Navigate to="/" replace />
}

function RequireFeature({ feature, children }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/auth" replace />

  if (user.role === 'master' || user.plan === 'empresarial' || user.plan === 'enterprise' || user.id === 'mock-admin-id') {
    return children
  }

  const purchasedFeatures = user.settings?.purchased_features || []
  const hasPurchased = Array.isArray(purchasedFeatures) 
    ? purchasedFeatures.includes(feature)
    : !!purchasedFeatures[feature]

  if (hasPurchased) {
    return children
  }

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
  const navigate = useNavigate()

  // Clean version management without wiping auth tokens
  useEffect(() => {
    const CURRENT_VERSION = '2.4'
    const lastVersion = localStorage.getItem('gestiva-app-version')

    if (lastVersion !== CURRENT_VERSION) {
      // Legacy obsolete cache keys cleanup without removing active auth tokens
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

  useEffect(() => {
    if (isAuthenticated && location.pathname === '/auth') {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, location.pathname, navigate])

  useEffect(() => { initAuth() }, [initAuth])
  useEffect(() => { if (isStale()) fetchRates() }, [isStale, fetchRates])
  useEffect(() => { checkOverdue() }, [checkOverdue])

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
        useInvoiceStore.getState().sendWeeklyReport().catch(() => {})
      }
    }
  }, [isAuthenticated, user?.id])

  if (!initialized) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#120a2b] via-[#1b0d3d] to-[#0b051b] text-white">
        <div className="relative flex flex-col items-center">
          <div className="absolute w-[200px] h-[200px] bg-brand-500/10 rounded-full blur-[60px] animate-pulse" />
          <div className="relative z-10 flex items-center justify-center w-24 h-24 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)] animate-bounce [animation-duration:3s]">
            <svg
              className="w-12 h-12 text-brand-400 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="mt-8 text-2xl font-black tracking-widest text-white uppercase select-none">
            GESTIVA <span className="text-brand-400">ONE</span>
          </h1>
          <p className="mt-4 px-6 text-center text-sm font-semibold tracking-wider text-brand-300/80 animate-pulse [animation-duration:2.5s] max-w-[320px]">
            Cargando ecosistema seguro...
          </p>
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
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <AppLayout /> : <Landing />}
          >
            <Route index element={<Dashboard />} />
          </Route>

          <Route
            path="/auth"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Auth />}
          />
          <Route path="/terms" element={<Terms />} />

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

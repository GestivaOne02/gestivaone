import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Receipt, Package, Store,
  Settings, ChevronLeft, X, Users, Lock, Bell, Printer, Calculator, Wallet, FolderClosed, Contact, Mail,
  User, CreditCard, LogOut, HelpCircle, MessageSquare, Zap, ChevronDown
} from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore, ROLES } from '@/store/useAuthStore'
import { useNotificationStore } from '@/store/useNotificationStore'
import { useInvoiceStore } from '@/store/useInvoiceStore'
import { useClientStore } from '@/store/useClientStore'
import { useProductStore } from '@/store/useProductStore'
import { supabase } from '@/lib/supabase'
import { useEffect, useState, useRef, useMemo, startTransition } from 'react'
import clsx from 'clsx'

const AVATAR_SIZE = 40

export default function Sidebar({ isMobile }) {
  const collapsed      = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar  = useUIStore((s) => s.toggleSidebar)
  const mobileOpen     = useUIStore((s) => s.mobileSidebarOpen)
  const closeMobile    = useUIStore((s) => s.closeMobileSidebar)
  const user           = useAuthStore((s) => s.user)
  const location       = useLocation()

  const unreadCount        = useNotificationStore((s) => s.getUnreadCount())
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications)

  const invoices = useInvoiceStore(s => s.invoices || [])
  const clients = useClientStore(s => s.clients || [])
  const products = useProductStore(s => s.products || [])

  const storageData = useMemo(() => {
    const invoiceMB = invoices.length * 0.15
    const clientMB = clients.length * 0.05
    const productMB = products.length * 0.05
    const otherMB = 12.5 

    const totalUsedMB = invoiceMB + clientMB + productMB + otherMB
    
    let maxStorageMB = 1024 
    if (user?.plan === 'empresarial') maxStorageMB = 10240 
    else if (user?.plan === 'PRO') maxStorageMB = 5120 

    const usedFormatted = totalUsedMB >= 1024 ? `${(totalUsedMB / 1024).toFixed(2)} GB` : `${totalUsedMB.toFixed(1)} MB`
    const maxFormatted = maxStorageMB >= 1024 ? `${maxStorageMB / 1024} GB` : `${maxStorageMB} MB`

    return {
      used: usedFormatted,
      max: maxFormatted,
      pctInvoice: (invoiceMB / maxStorageMB) * 100,
      pctClient: (clientMB / maxStorageMB) * 100,
      pctProduct: (productMB / maxStorageMB) * 100,
      pctOther: (otherMB / maxStorageMB) * 100
    }
  }, [invoices.length, clients.length, products.length, user?.plan])

  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [hasScrollBelow, setHasScrollBelow]   = useState(false)
  const profileRef = useRef(null)
  const navRef     = useRef(null)
  const logout     = useAuthStore((s) => s.logout)

  /* ── Click outside profile menu ──────────────────────────── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /* ── Detect scroll overflow in nav ───────────────────────── */
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const check = () => setHasScrollBelow(nav.scrollTop + nav.clientHeight < nav.scrollHeight - 8)
    check()
    nav.addEventListener('scroll', check)
    const ro = new ResizeObserver(check)
    ro.observe(nav)
    return () => { nav.removeEventListener('scroll', check); ro.disconnect() }
  }, [collapsed])

  /* ── Realtime notifications ───────────────────────────────── */
  useEffect(() => {
    if (!user?.companyId) return
    fetchNotifications()
    const channel = supabase.channel('realtime:notifications')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'notifications',
        filter: `company_id=eq.${user.companyId}`
      }, () => fetchNotifications(true))
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [user?.companyId])

  const handleLogout = async () => {
    setShowProfileMenu(false)
    await logout()
  }

  /* ── Role & permissions ───────────────────────────────────── */
  const role        = user?.role || 'despachador'
  const permissions = ROLES[role]?.permissions || {}

  /* ── Feature gate ────────────────────────────────────────── */
  const purchasedFeatures = user?.settings?.purchased_features || []
  const hasFeature = (key) => {
    if (user?.plan === 'empresarial' || user?.plan === 'enterprise' || user?.role === 'master' || user?.plan === 'master' || user?.id === 'mock-admin-id') return true
    return Array.isArray(purchasedFeatures) ? purchasedFeatures.includes(key) : !!purchasedFeatures[key]
  }

  /* ── Nav groups ──────────────────────────────────────────── */
  const visibleGroups = useMemo(() => {
    const groups = [
      {
        title: 'Productos y Catálogo',
        items: [
          { to: '/menu',     icon: Receipt,        label: 'Menú',     perm: 'menu',      feature: 'menu' },
          { to: '/products', icon: Package,         label: 'Productos',perm: 'products',  feature: 'products' },
          { to: '/store',    icon: Store,           label: 'Mi Tienda',perm: 'products',  feature: 'store' },
        ]
      },
      {
        title: 'Gestión y Finanzas',
        items: [
          { to: '/',                icon: LayoutDashboard, label: 'Dashboard', perm: 'dashboard', feature: 'dashboard' },
          { to: '/finances',        icon: FolderClosed,    label: 'Bolsillos', perm: 'dashboard', feature: 'pockets' },
          { to: '/employees',       icon: Users,           label: 'Empleados', perm: 'employees', feature: 'employees' },
        ]
      },
      {
        title: 'Herramientas',
        items: [
          { to: '/facturero', icon: Printer,    label: 'Facturero',     perm: 'dashboard', feature: 'facturero' },
          { to: '/seguridad', icon: Lock,       label: 'GestiToken',    perm: 'dashboard', feature: 'seguridad' },
        ]
      }
    ]
    return groups.map(g => ({
      ...g,
      items: g.items.filter(item => {
        if (['menu', 'products', 'dashboard', 'store'].includes(item.feature)) return true
        if (item.feature === 'employees' && user?.plan === 'pro') return true
        return hasFeature(item.feature)
      })
    })).filter(g => g.items.length > 0)
  }, [user, purchasedFeatures])

  /* ── Flat list of all nav items (for icon-rail mode) ─────── */
  const allNavItems = useMemo(() => visibleGroups.flatMap(g => g.items), [visibleGroups])

  const navigate = useNavigate()

  /* ── Avatar renderer ─────────────────────────────────────── */
  const renderAvatar = (size = AVATAR_SIZE) => {
    const initial   = user?.name?.charAt(0).toUpperCase() || 'G'
    const baseClass = 'rounded-full border border-surface-600 shrink-0 shadow-sm'
    const style     = { width: size, height: size, objectFit: 'cover' }

    if (user?.avatarUrl?.startsWith('color:')) {
      const color = user.avatarUrl.replace('color:', '')
      return <div style={{ ...style, backgroundColor: color }} className={`${baseClass} flex items-center justify-center text-sm font-bold text-white`}>{initial}</div>
    }
    if (user?.avatarUrl)   return <img src={user.avatarUrl}   alt="" style={style} className={baseClass} />
    if (user?.companyLogo) return <img src={user.companyLogo} alt="" style={style} className={baseClass} />
    return (
      <div style={style} className={`${baseClass} bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-sm font-bold text-white`}>
        {initial}
      </div>
    )
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  MOBILE DRAWER                                              */
  /* ─────────────────────────────────────────────────────────── */
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          className={clsx(
            'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
            mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={closeMobile}
        />

        {/* Drawer */}
        <aside className={clsx(
          'sidebar-premium-dark fixed left-0 top-0 bottom-0 z-50 w-64 bg-surface-800 flex flex-col shadow-modal transition-transform duration-300 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 h-20 shrink-0">
            <div className="flex flex-col leading-tight overflow-hidden whitespace-nowrap">
              <span className="text-[16px] font-black text-white uppercase tracking-wide truncate max-w-[180px]" title={user?.companyName || 'Mi Empresa'}>
                {user?.companyName || 'Mi Empresa'}
              </span>
              <span className="text-[10.5px] text-brand-400 font-bold tracking-widest uppercase mt-0.5">GestivaOne</span>
            </div>
            <button onClick={closeMobile} className="p-1.5 rounded-lg text-muted-400 hover:text-white hover:bg-surface-600 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Scroll nav */}
          <div className="relative flex-1 min-h-0">
            <nav ref={navRef} className="h-full py-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
              {visibleGroups.map((group) => (
                <div key={group.title} className="flex flex-col gap-1 mb-3">
                  <div className="uppercase text-[9px] font-black text-muted-500 tracking-wider px-5 mb-1 mt-2 first:mt-0 select-none whitespace-nowrap truncate">
                    {group.title}
                  </div>
                  {group.items.map(({ to, icon: Icon, label, perm }) => {
                    const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
                    const allowed  = permissions[perm] ?? true
                    return (
                      <NavLink
                        key={to}
                        to={allowed ? to : '#'}
                        onClick={allowed ? closeMobile : (e) => e.preventDefault()}
                        className={clsx(
                          'relative flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors duration-150 select-none',
                          !allowed && 'opacity-50 cursor-not-allowed',
                          isActive && allowed ? 'text-brand-300' : allowed ? 'text-muted-400 hover:text-white hover:bg-surface-600' : 'text-muted-400'
                        )}
                      >
                        {isActive && allowed && <div className="absolute inset-0 bg-brand-600/20 border-l-4 border-l-brand-500" />}
                        <div className="relative shrink-0 w-[18px] h-[18px] flex items-center justify-center z-10">
                          <Icon size={18} />
                        </div>
                        <span className="relative z-10 flex-1">{label}</span>
                        {!allowed && <Lock size={12} className="text-muted-400 relative z-10" />}
                      </NavLink>
                    )
                  })}
                </div>
              ))}

              {user?.plan !== 'empresarial' && user?.plan !== 'enterprise' && (
                <div className="px-3 py-2 shrink-0 mt-auto">
                  <NavLink to="/upgrade" onClick={closeMobile} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs tracking-wide shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all duration-200">
                    <Zap size={14} className="fill-current text-purple-200" />
                    <span>+ Adquirir más funciones</span>
                  </NavLink>
                </div>
              )}
            </nav>

            {/* Scroll indicator */}
            {hasScrollBelow && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 flex flex-col items-end justify-end pb-2 pr-6 bg-gradient-to-t from-surface-800 to-transparent">
                <div className="flex items-center gap-1 text-muted-500 text-[10px] font-semibold animate-bounce">
                  <ChevronDown size={12} />
                  <span>Más abajo</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom section — lighter bg to distinguish */}
          <div className="shrink-0 bg-surface-700 pt-3">
            {/* Notifications */}
            <NavLink
              to={permissions['dashboard'] ? '/notifications' : '#'}
              onClick={permissions['dashboard'] ? closeMobile : (e) => e.preventDefault()}
              className={clsx(
                'relative flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors duration-150 select-none',
                !permissions['dashboard'] && 'opacity-50 cursor-not-allowed',
                location.pathname.startsWith('/notifications') && permissions['dashboard']
                  ? 'text-brand-300' : permissions['dashboard'] ? 'text-muted-400 hover:text-white hover:bg-surface-600/60' : 'text-muted-400'
              )}
            >
              {location.pathname.startsWith('/notifications') && permissions['dashboard'] && (
                <div className="absolute inset-0 bg-brand-600/20 border-l-4 border-l-brand-500" />
              )}
              <div className="relative shrink-0 w-[18px] h-[18px] flex items-center justify-center z-10">
                <Bell size={18} />
                {unreadCount > 0 && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-500 rounded-full" />}
              </div>
              <span className="relative z-10 flex-1">Notificaciones</span>
              {!permissions['dashboard'] && <Lock size={12} className="text-muted-400 relative z-10" />}
            </NavLink>

            {/* User profile */}
            <div ref={profileRef} className="relative p-3">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-full flex items-center gap-3 text-left focus:outline-none hover:bg-surface-600/60 px-2 py-2 rounded-xl transition-colors"
              >
                {renderAvatar()}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-tight">{user?.name || 'Invitado'}</p>
                  <p className="text-[10px] text-brand-400 font-medium uppercase tracking-widest mt-0.5">{ROLES[user?.role]?.label || 'Usuario'}</p>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute z-50 bg-surface-800 border border-subtle shadow-2xl rounded-2xl p-1.5 flex flex-col gap-0.5 text-neutral-200 min-w-[210px] bottom-2 left-full ml-3">
                  <NavLink to="/account" onClick={() => { setShowProfileMenu(false); closeMobile() }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted-400 hover:text-white hover:bg-surface-700 transition-colors"><User size={15} className="text-muted-400" /><span>Profile</span></NavLink>
                  <NavLink to="/settings" onClick={() => { setShowProfileMenu(false); closeMobile() }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted-400 hover:text-white hover:bg-surface-700 transition-colors"><Settings size={15} className="text-muted-400" /><span>Settings</span></NavLink>
                  <div className="h-px bg-surface-700 my-1.5 mx-1" />
                  <a href="mailto:soporte@gestivaone.com?subject=Soporte%20GestivaOne" onClick={() => { setShowProfileMenu(false); closeMobile() }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted-400 hover:text-white hover:bg-surface-700 transition-colors"><HelpCircle size={15} className="text-muted-400" /><span>Help center</span></a>
                  <button onClick={() => { handleLogout(); closeMobile() }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-danger-400 hover:bg-danger-950/20 transition-colors text-left"><LogOut size={15} className="text-danger-500" /><span>Sign out</span></button>
                </div>
              )}
            </div>
          </div>
        </aside>
      </>
    )
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  DESKTOP SIDEBAR                                            */
  /*  collapsed = narrow "icon rail" (w-16)                     */
  /*  expanded  = full sidebar (w-60)                           */
  /* ─────────────────────────────────────────────────────────── */
  const isNotifActive = location.pathname.startsWith('/notifications')
  const notifAllowed  = permissions['dashboard'] ?? true

  return (
    <aside
      className={clsx(
        'sidebar-premium-dark relative h-screen bg-surface-800 flex flex-col shrink-0 z-30',
        'transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* ── Brand header ─────────────────────────────────────── */}
      <div className={clsx(
        'flex items-center h-20 shrink-0 px-3 overflow-hidden',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        {/* Brand initial icon — always visible */}
        <div className="shrink-0 w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
          <span className="text-sm font-black text-brand-400 uppercase leading-none">
            {(user?.companyName || 'G').charAt(0)}
          </span>
        </div>

        {/* Company name — hidden when collapsed */}
        {!collapsed && (
          <div className="flex flex-col leading-tight overflow-hidden whitespace-nowrap min-w-0">
            <span className="text-[15px] font-black text-foreground uppercase tracking-wide truncate max-w-[130px]" title={user?.companyName || 'Mi Empresa'}>
              {user?.companyName || 'Mi Empresa'}
            </span>
            <span className="text-[10px] text-brand-400 font-bold tracking-widest uppercase mt-0.5">GestivaOne</span>
          </div>
        )}
      </div>

      {/* ── Scrollable nav area ───────────────────────────────── */}
      <div className="relative flex-1 min-h-0">
        <nav ref={navRef} className="h-full py-3 flex flex-col overflow-y-auto no-scrollbar">

          {/* EXPANDED: grouped nav with labels */}
          {!collapsed && visibleGroups.map((group) => (
            <div key={group.title} className="flex flex-col">
              <div className="uppercase text-[9px] font-black text-muted-500 tracking-wider px-5 mb-1.5 mt-3.5 first:mt-0 select-none whitespace-nowrap truncate">
                {group.title}
              </div>
              {group.items.map(({ to, icon: Icon, label, perm }) => {
                const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
                const allowed  = permissions[perm] ?? true
                return (
                  <a
                    key={to}
                    href={allowed ? to : '#'}
                    title={label}
                    onClick={(e) => {
                      if (!allowed) { e.preventDefault(); return }
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
                      e.preventDefault()
                      startTransition(() => navigate(to))
                    }}
                    className={clsx(
                      'relative flex items-center px-5 py-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer select-none',
                      !allowed && 'opacity-50 cursor-not-allowed',
                      isActive && allowed ? 'text-brand-300' : allowed ? 'text-muted-400 hover:text-white hover:bg-surface-600' : 'text-muted-400'
                    )}
                  >
                    {isActive && allowed && <div className="absolute inset-0 bg-brand-600/20 border-l-4 border-l-brand-500" />}
                    <div className="relative z-10 shrink-0 w-[18px] h-[18px] flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                    <span className="relative z-10 block pl-3 whitespace-nowrap flex-1">{label}</span>
                    {!allowed && <Lock size={12} className="text-muted-400 relative z-10 ml-2" />}
                  </a>
                )
              })}
            </div>
          ))}

          {/* COLLAPSED: flat icon list, centered */}
          {collapsed && allNavItems.map(({ to, icon: Icon, label, perm }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            const allowed  = permissions[perm] ?? true
            return (
              <a
                key={to}
                href={allowed ? to : '#'}
                title={label}
                onClick={(e) => {
                  if (!allowed) { e.preventDefault(); return }
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
                  e.preventDefault()
                  startTransition(() => navigate(to))
                }}
                className={clsx(
                  'relative flex items-center justify-center py-2.5 mx-2 rounded-lg transition-colors duration-150 cursor-pointer select-none',
                  !allowed && 'opacity-50 cursor-not-allowed',
                  isActive && allowed ? 'text-brand-300 bg-brand-600/20' : allowed ? 'text-muted-400 hover:text-white hover:bg-surface-600' : 'text-muted-400'
                )}
              >
                {isActive && allowed && <div className="absolute inset-0 rounded-lg border-l-4 border-l-brand-500 bg-brand-600/10" />}
                <div className="relative z-10 w-[18px] h-[18px] flex items-center justify-center">
                  <Icon size={18} />
                </div>
              </a>
            )
          })}

          {/* Upgrade button — expanded only */}
          {!collapsed && user?.plan !== 'empresarial' && user?.plan !== 'enterprise' && (
            <div className="px-4 py-1.5 shrink-0 mt-2">
              <NavLink to="/upgrade" className="flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold w-full px-4 py-2.5 text-xs tracking-wide gap-2 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all duration-200" title="Adquirir más funciones">
                <Zap size={14} className="fill-current text-purple-200 shrink-0" />
                <span>+ Adquirir más funciones</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Scroll indicator */}
        {hasScrollBelow && !collapsed && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 flex flex-col items-end justify-end pb-1 pr-6 bg-gradient-to-t from-surface-800 to-transparent">
            <div className="flex items-center gap-1 text-[11px] font-black animate-bounce" style={{ color: 'var(--brand-500)' }}>
              <ChevronDown size={11} className="stroke-[3]" />
              <span>Más abajo</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom section — lighter bg ───────────────────────── */}
      <div className="shrink-0 bg-surface-700 pt-3">

        {/* Notifications row */}
        <a
          href={notifAllowed ? '/notifications' : '#'}
          title="Notificaciones"
          onClick={(e) => {
            if (!notifAllowed) { e.preventDefault(); return }
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
            e.preventDefault()
            startTransition(() => navigate('/notifications'))
          }}
          className={clsx(
            'relative flex items-center transition-colors duration-150 cursor-pointer select-none',
            collapsed ? 'justify-center py-3 mx-2 my-1 rounded-lg' : 'px-5 py-3',
            !notifAllowed && 'opacity-50 cursor-not-allowed',
            isNotifActive && notifAllowed
              ? 'text-brand-300 bg-brand-600/20'
              : notifAllowed ? 'text-muted-400 hover:text-white hover:bg-surface-600/60' : 'text-muted-400'
          )}
        >
          {isNotifActive && notifAllowed && !collapsed && <div className="absolute inset-0 bg-brand-600/20 border-l-4 border-l-brand-500" />}
          {isNotifActive && notifAllowed && collapsed  && <div className="absolute inset-0 rounded-lg border-l-4 border-l-brand-500 bg-brand-600/10" />}
          <div className="relative z-10 shrink-0 w-[18px] h-[18px] flex items-center justify-center">
            <Bell size={18} />
            {unreadCount > 0 && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-500 rounded-full" />}
          </div>
          {!collapsed && <span className="relative z-10 text-sm font-medium pl-3 flex-1 whitespace-nowrap">Notificaciones</span>}
        </a>

        {/* User profile */}
        <div ref={profileRef} className={clsx('relative', collapsed ? 'flex justify-center py-2' : 'px-2 py-3')}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={clsx(
              'flex items-center focus:outline-none transition-colors rounded-xl',
              collapsed
                ? 'p-1 hover:bg-surface-600/60'
                : 'w-full gap-3 px-2 py-2 hover:bg-surface-600/60 text-left'
            )}
            title={collapsed ? (user?.name || 'Perfil') : undefined}
          >
            {renderAvatar(collapsed ? 32 : AVATAR_SIZE)}
            {!collapsed && (
              <div className="flex-1 min-w-0 overflow-hidden whitespace-nowrap">
                <p className="text-xs font-bold text-white truncate leading-tight">{user?.name || 'Invitado'}</p>
                <p className="text-[10px] text-brand-400 font-medium uppercase tracking-widest mt-0.5">{ROLES[user?.role]?.label || 'Usuario'}</p>
              </div>
            )}
          </button>

          {/* Profile dropdown */}
          {showProfileMenu && (
            <div className={clsx(
              'absolute z-50 bg-surface-800 border border-subtle shadow-2xl rounded-2xl p-1.5 flex flex-col gap-0.5 text-neutral-200 min-w-[210px]',
              collapsed ? 'bottom-0 left-full ml-3' : 'bottom-2 left-full ml-3'
            )}>
              <NavLink to="/account"  onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-muted-400 hover:text-white hover:bg-surface-700 transition-colors"><User size={15} className="text-muted-400" /><span>Profile</span></NavLink>
              <NavLink to="/settings" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-muted-400 hover:text-white hover:bg-surface-700 transition-colors"><Settings size={15} className="text-muted-400" /><span>Settings</span></NavLink>
              <NavLink to="/account"  onClick={() => setShowProfileMenu(false)} className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-muted-400 hover:text-white hover:bg-surface-700 transition-colors">
                <div className="flex items-center gap-3"><CreditCard size={15} className="text-muted-400" /><span>Subscription</span></div>
                <div className="flex items-center gap-0.5 bg-brand-600/20 border border-brand-500/30 text-brand-300 font-bold px-1.5 py-0.5 rounded text-[9px] tracking-wide shrink-0">
                  <Zap size={8} className="fill-current text-brand-400" />
                  {user?.plan === 'empresarial' ? '360' : 'PRO'}
                </div>
              </NavLink>
              <div className="h-px bg-surface-700 my-1.5 mx-1" />
              <a href="mailto:soporte@gestivaone.com?subject=Soporte%20GestivaOne" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-muted-400 hover:text-white hover:bg-surface-700 transition-colors"><HelpCircle size={15} className="text-muted-400" /><span>Help center</span></a>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-danger-400 hover:bg-danger-950/20 transition-colors text-left"><LogOut size={15} className="text-danger-500" /><span>Sign out</span></button>
            </div>
          )}
        </div>

        {/* Storage usage bar */}
        {!collapsed && (
          <div className="px-3.5 py-3 mx-3 mb-2 bg-surface-950/40 rounded-xl border border-surface-600/30">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[9px] font-bold text-muted-400 uppercase tracking-widest">Almacenamiento</span>
              <span className="text-[10px] font-semibold text-brand-300/80">{storageData.used} <span className="text-muted-500 font-medium">de {storageData.max}</span></span>
            </div>
            
            <div className="w-full h-1.5 flex rounded-full overflow-hidden bg-surface-900 gap-0.5">
              <div style={{ width: `${Math.max(storageData.pctInvoice, 2)}%` }} className="bg-brand-500 hover:brightness-110 transition-all cursor-help" title="Facturas y PDFs" />
              <div style={{ width: `${Math.max(storageData.pctClient, 1.5)}%` }} className="bg-emerald-400 hover:brightness-110 transition-all cursor-help" title="Clientes" />
              <div style={{ width: `${Math.max(storageData.pctProduct, 1.5)}%` }} className="bg-amber-400 hover:brightness-110 transition-all cursor-help" title="Productos" />
              <div style={{ width: `${Math.max(storageData.pctOther, 1)}%` }} className="bg-slate-500 hover:brightness-110 transition-all cursor-help" title="Sistema" />
            </div>

            <div className="flex justify-between items-center mt-2.5 px-0.5">
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_5px_rgba(139,92,246,0.6)]"></div><span className="text-[9px] text-muted-400 font-medium">Facturas</span></div>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.6)]"></div><span className="text-[9px] text-muted-400 font-medium">Clientes</span></div>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.6)]"></div><span className="text-[9px] text-muted-400 font-medium">Productos</span></div>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <div className="p-2">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 rounded-xl text-muted-400 hover:text-white hover:bg-surface-600/60 transition-colors"
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            <ChevronLeft
              size={16}
              style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
            />
          </button>
        </div>
      </div>
    </aside>
  )
}

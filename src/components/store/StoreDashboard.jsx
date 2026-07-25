import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Icon from '@/components/ui/Icon';

const formatCOP = (v) => v == null ? '' : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

export default function StoreDashboard({ 
  metrics, 
  storeEnabled, 
  setStoreEnabled, 
  invoices, 
  setActiveTab,
  storeSlug,
  activeTab = 'dashboard'
}) {
  
  // Recent activity list
  const recentActivity = useMemo(() => {
    const invoiceEvents = invoices.slice(0, 4).map(inv => ({
      id: `inv-${inv.id}`,
      type: 'order',
      title: `Pedido ${inv.invoice_number || `#${inv.id.slice(0,4)}`}`,
      value: formatCOP(inv.total),
      time: inv.created_at,
    }));
    return invoiceEvents.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 4);
  }, [invoices]);

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const diff = Math.floor((new Date() - new Date(dateString)) / 60000);
    if (diff < 1) return 'Ahora';
    if (diff < 60) return `${diff}m`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const publicUrl = `${import.meta.env.VITE_STORE_PUBLIC_URL || 'https://gestivaone-store.vercel.app'}/${storeSlug || ''}`;

  return (
    <motion.div 
      key="dashboard-redesign-exact" 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }} 
      className="flex flex-col gap-6 relative w-full pb-24"
    >
      
      {/* ─── Main Bento Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ==========================================
            1. HERO MASTER SWITCH CARD (Left Large Bento)
            ========================================== */}
        <div 
          className={clsx(
            "lg:col-span-8 rounded-[2.5rem] p-8 border flex flex-col justify-between relative overflow-hidden transition-all duration-700 min-h-[340px]",
            storeEnabled 
              ? "bg-gradient-to-br from-purple-900/40 via-indigo-950/30 to-surface-900 border-purple-500/30 shadow-xl" 
              : "bg-gradient-to-br from-purple-50/40 via-indigo-50/20 to-surface-800/40 dark:from-purple-950/20 dark:to-surface-900 border-subtle"
          )}
        >
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Status Indicators */}
          <div className="flex items-center gap-3 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-400">
              ESTADO DEL CANAL
            </span>
            <div className={clsx(
              "px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border shadow-sm transition-all",
              storeEnabled 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                : "bg-surface-700/60 border-subtle text-muted-400"
            )}>
              <span className={clsx("w-2 h-2 rounded-full", storeEnabled ? "bg-emerald-400 animate-pulse" : "bg-muted-500")} />
              <span>{storeEnabled ? '● LIVE SYSTEM (ON)' : '● OFFLINE (OFF)'}</span>
            </div>
          </div>

          {/* Main Headline & Subtitle */}
          <div className="relative z-10 my-6 max-w-lg">
            <motion.h2 
              layout="position"
              className={clsx(
                "text-5xl sm:text-6xl font-black tracking-tighter leading-none transition-colors",
                storeEnabled 
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-brand-300" 
                  : "text-foreground dark:text-white"
              )}
            >
              {storeEnabled ? 'Online.' : 'Standby.'}
            </motion.h2>
            <p className="mt-3 text-xs sm:text-sm text-muted-400 font-medium leading-relaxed">
              {storeEnabled 
                ? 'El motor de la tienda está activo, recibiendo tráfico y procesando transacciones.' 
                : 'El catálogo está oculto. Usa el interruptor para publicar el sistema.'}
            </p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <button
              type="button"
              onClick={() => setStoreEnabled(!storeEnabled)}
              className={clsx(
                "px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2.5 shadow-lg cursor-pointer transform hover:scale-[1.02] active:scale-95",
                storeEnabled
                  ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-amber-500/20"
                  : "bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white shadow-brand-500/25"
              )}
            >
              <Icon name={storeEnabled ? "Power" : "Sparkles"} size={16} />
              <span>{storeEnabled ? 'Desactivar tienda' : 'Publicar tienda'}</span>
            </button>

            {storeSlug && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl bg-surface-800/80 hover:bg-surface-700 border border-subtle text-foreground dark:text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <span>Ver preview</span>
                <Icon name="ExternalLink" size={13} className="text-muted-400" />
              </a>
            )}
          </div>

          {/* Right 3D Illustration Vector (Exact Graphic Representation) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block opacity-90 transform translate-x-4">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <div className="w-48 h-36 rounded-3xl bg-gradient-to-br from-brand-500/20 via-purple-600/30 to-indigo-500/20 border border-purple-400/30 shadow-2xl flex flex-col justify-between p-4 backdrop-blur-md transform rotate-3">
                <div className="flex items-center justify-between border-b border-purple-400/20 pb-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400/30" />
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400/20" />
                  </div>
                  <div className="text-[10px] font-bold text-purple-300">Storefront</div>
                </div>
                <div className="flex items-center justify-center my-auto">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-inner">
                    <Icon name={storeEnabled ? "Store" : "EyeOff"} size={28} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            RIGHT SIDE STAT CARDS (Cuadro Azul: Fondo Blanco, Sin Borde, Sin Hover)
            ========================================== */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* INGRESOS HOY CARD */}
          <div className="rounded-[2.5rem] bg-white dark:bg-surface-800 border-0 p-6 flex items-center justify-between shadow-sm relative overflow-hidden">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-muted-400 font-bold uppercase tracking-widest">INGRESOS HOY</span>
              </div>
              <div className="text-3xl font-extrabold text-foreground dark:text-white tracking-tight">
                {formatCOP(metrics.salesSumToday)}
              </div>
              <div className="text-xs text-muted-400 font-medium mt-1">
                {metrics.ordersCountToday} transacciones
              </div>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0 shadow-sm">
              <Icon name="TrendingUp" size={24} />
            </div>
          </div>

          {/* CATÁLOGO CARD */}
          <div className="rounded-[2.5rem] bg-white dark:bg-surface-800 border-0 p-6 flex items-center justify-between shadow-sm relative overflow-hidden">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-muted-400 font-bold uppercase tracking-widest">CATÁLOGO</span>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-2xl font-extrabold text-foreground dark:text-white tracking-tight">{metrics.activeProducts}</div>
                  <div className="text-[10px] text-muted-400 font-bold">Activos</div>
                </div>
                <div className="w-px h-8 bg-subtle" />
                <div>
                  <div className={clsx("text-2xl font-extrabold tracking-tight", metrics.outOfStock > 0 ? "text-rose-500" : "text-foreground dark:text-white")}>
                    {metrics.outOfStock}
                  </div>
                  <div className="text-[10px] text-muted-400 font-bold">Agotados</div>
                </div>
              </div>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0 shadow-sm">
              <Icon name="Package" size={24} />
            </div>
          </div>

        </div>

        {/* ==========================================
            3. LOG DE PEDIDOS BANNER (Wide Bottom Card, Console badge removed per instructions)
            ========================================== */}
        <div className="lg:col-span-12 rounded-[2.5rem] bg-slate-900 border border-slate-800 text-white p-7 flex items-center justify-between gap-6 relative overflow-hidden shadow-xl">
          
          <div className="flex items-center gap-6">
            {/* Left Counter */}
            <div className="flex flex-col justify-center min-w-[120px]">
              <div className="flex items-center gap-2 mb-1 text-brand-400">
                <Icon name="Activity" size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">LOG DE PEDIDOS</span>
              </div>
              <div className="text-4xl font-extrabold tracking-tight text-white">{invoices.length}</div>
              <div className="text-xs text-slate-400 font-medium">Pedidos Totales</div>
            </div>
          </div>

          {/* Right 3D Tray Icon */}
          <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0 shadow-inner">
            <Icon name="Inbox" size={30} />
          </div>
        </div>

      </div>

      {/* ==========================================
          4. FLOATING BOTTOM DOCK MENU (Alineado perfectamente al centro)
          ========================================== */}
      <div className="fixed bottom-5 left-0 right-0 z-50 flex items-center justify-center px-4 pointer-events-none">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 20 }}
          className="flex items-center justify-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 rounded-full bg-white/95 dark:bg-slate-950/95 border border-subtle backdrop-blur-2xl shadow-2xl pointer-events-auto max-w-full overflow-x-auto no-scrollbar"
        >
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'LayoutGrid' },
            { id: 'orders', label: 'Pedidos', icon: 'FileText' },
            { id: 'catalog', label: 'Catálogo', icon: 'Package' },
            { id: 'appearance', label: 'Apariencia', icon: 'Palette' }
          ].map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center gap-1 px-3 sm:px-4 py-1.5 rounded-2xl relative transition-all cursor-pointer group shrink-0"
              >
                <Icon 
                  name={item.icon} 
                  size={18} 
                  className={active ? "text-brand-500 dark:text-purple-400" : "text-muted-400 group-hover:text-foreground"} 
                />
                <span className={clsx(
                  "text-[10px] font-bold leading-none",
                  active ? "text-brand-500 dark:text-purple-400" : "text-muted-400 group-hover:text-foreground"
                )}>
                  {item.label}
                </span>
                {active && (
                  <motion.div 
                    layoutId="dock-active-line"
                    className="absolute -bottom-1 w-6 h-0.5 rounded-full bg-brand-500 dark:bg-purple-400" 
                  />
                )}
              </button>
            )
          })}
        </motion.div>
      </div>

    </motion.div>
  );
}

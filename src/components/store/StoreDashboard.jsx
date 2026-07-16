import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  Store as StoreIcon, TrendingUp, Package, 
  LayoutGrid, Clock, CreditCard,
  FileText, Activity, ZapOff, Sparkles
} from 'lucide-react';

const formatCOP = (v) => v == null ? '' : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

export default function StoreDashboard({ 
  metrics, 
  storeEnabled, 
  setStoreEnabled, 
  invoices, 
  setActiveTab 
}) {
  
  // ==========================================
  // RECENT ACTIVITY LOG
  // ==========================================
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

  return (
    <motion.div 
      key="dashboard-ultra-premium" 
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }} 
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} 
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }} 
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4 relative w-full pb-20"
    >
      
      {/* Ambient Background Glow when Store is Enabled */}
      <AnimatePresence>
        {storeEnabled && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-500 rounded-full blur-[120px] pointer-events-none z-0"
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 auto-rows-[160px] relative z-10">
        
        {/* ==========================================
            MASTER SWITCH (BENTO: Large Hero)
            ========================================== */}
        <motion.div 
          layoutId="master-switch"
          onClick={() => setStoreEnabled(!storeEnabled)}
          whileHover={{ scale: 0.98 }}
          whileTap={{ scale: 0.95 }}
          className={clsx(
            "md:col-span-6 lg:col-span-8 row-span-2 rounded-[2rem] p-8 border cursor-pointer flex flex-col justify-between relative overflow-hidden transition-all duration-700",
            storeEnabled 
              ? "bg-black/40 border-brand-500/30 shadow-[0_0_40px_rgba(var(--color-brand-500),0.15)] backdrop-blur-3xl" 
              : "bg-surface-900/40 border-white/5 backdrop-blur-xl hover:bg-surface-800/40"
          )}
        >
          {/* Subtle grid pattern inside */}
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className={clsx(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-500",
              storeEnabled ? "bg-brand-500/20 text-brand-400" : "bg-white/5 text-muted-500"
            )}>
              {storeEnabled ? <Sparkles size={24} /> : <ZapOff size={24} />}
            </div>
            
            {/* Status indicator pill */}
            <div className={clsx(
              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border transition-all duration-500",
              storeEnabled 
                ? "bg-brand-500/10 border-brand-500/20 text-brand-400 shadow-[0_0_15px_rgba(var(--color-brand-500),0.2)]" 
                : "bg-white/5 border-white/10 text-muted-500"
            )}>
              <div className={clsx("w-1.5 h-1.5 rounded-full", storeEnabled && "bg-brand-400 animate-pulse")} />
              {storeEnabled ? 'Live System' : 'Offline'}
            </div>
          </div>

          <div className="relative z-10">
            <motion.h2 
              layout="position"
              className={clsx(
                "text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none transition-colors duration-500",
                storeEnabled ? "text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-brand-400" : "text-muted-600"
              )}
            >
              {storeEnabled ? 'Online.' : 'Standby.'}
            </motion.h2>
            <p className={clsx(
              "mt-4 text-sm max-w-md font-medium transition-colors duration-500",
              storeEnabled ? "text-brand-100/60" : "text-muted-500/50"
            )}>
              {storeEnabled ? 'El motor de la tienda está activo, recibiendo tráfico y procesando transacciones.' : 'El catálogo está oculto. Toca para encender el sistema.'}
            </p>
          </div>
        </motion.div>

        {/* ==========================================
            TODAY'S REVENUE (BENTO: Medium)
            ========================================== */}
        <div className="md:col-span-3 lg:col-span-4 row-span-1 rounded-[2rem] bg-surface-900/40 border border-white/5 backdrop-blur-xl p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-500 font-bold uppercase tracking-widest">Ingresos Hoy</span>
            <TrendingUp size={14} className="text-muted-600 group-hover:text-brand-400 transition-colors" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tighter">
              {formatCOP(metrics.salesSumToday)}
            </div>
            <div className="text-xs text-muted-500 font-medium mt-1">
              {metrics.ordersCountToday} transacciones
            </div>
          </div>
        </div>

        {/* ==========================================
            CATALOG STATUS (BENTO: Medium)
            ========================================== */}
        <div className="md:col-span-3 lg:col-span-4 row-span-1 rounded-[2rem] bg-surface-900/40 border border-white/5 backdrop-blur-xl p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-500 font-bold uppercase tracking-widest">Catálogo</span>
            <Package size={14} className="text-muted-600 group-hover:text-brand-400 transition-colors" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-3xl font-black text-white tracking-tighter">{metrics.activeProducts}</div>
              <div className="text-[10px] text-muted-500 font-medium">Activos</div>
            </div>
            <div>
              <div className={clsx("text-3xl font-black tracking-tighter", metrics.outOfStock > 0 ? "text-danger-400" : "text-white")}>
                {metrics.outOfStock}
              </div>
              <div className="text-[10px] text-muted-500 font-medium">Agotados</div>
            </div>
          </div>
        </div>

        {/* ==========================================
            ACTIVITY TERMINAL (BENTO: Tall)
            ========================================== */}
        <div className="md:col-span-6 lg:col-span-12 row-span-1 rounded-[2rem] bg-black/60 border border-white/5 backdrop-blur-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-6 relative overflow-hidden">
          <div className="flex flex-col justify-center min-w-[120px]">
             <div className="flex items-center gap-2 mb-1">
                <Activity size={12} className="text-brand-500" />
                <span className="text-[10px] text-brand-500/80 font-bold uppercase tracking-widest">Log</span>
             </div>
             <div className="text-2xl font-black text-white tracking-tighter">{invoices.length}</div>
             <div className="text-[10px] text-muted-500 font-medium">Pedidos Totales</div>
          </div>
          
          <div className="w-full sm:w-px h-px sm:h-full bg-white/5 shrink-0" />

          <div className="flex-1 flex gap-6 overflow-x-auto no-scrollbar scroll-smooth">
            {recentActivity.length === 0 ? (
              <div className="text-xs font-mono text-muted-600 flex items-center h-full">
                [ ] Esperando transacciones...
              </div>
            ) : (
              recentActivity.map((event) => (
                <div key={event.id} className="flex flex-col justify-center shrink-0 min-w-[140px]">
                  <div className="text-[10px] font-mono text-muted-500 mb-1">{event.time.split('T')[0]} • {getTimeAgo(event.time)}</div>
                  <div className="text-sm font-bold text-white truncate">{event.value}</div>
                  <div className="text-xs font-medium text-muted-400 truncate">{event.title}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
          THE DOCK (Floating Quick Actions)
          ========================================== */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', damping: 20 }}
          className="flex items-center gap-2 p-2 rounded-full bg-black/80 border border-white/10 backdrop-blur-2xl shadow-2xl"
        >
          <DockItem icon={<LayoutGrid size={18} />} label="Catálogo" onClick={() => setActiveTab('catalog')} />
          <DockItem icon={<FileText size={18} />} label="Pedidos" onClick={() => setActiveTab('orders')} />
          <div className="w-px h-8 bg-white/10 mx-1" />
          <DockItem icon={<CreditCard size={18} />} label="Pagos" onClick={() => setActiveTab('settings')} />
          <DockItem icon={<StoreIcon size={18} />} label="Apariencia" onClick={() => setActiveTab('appearance')} />
        </motion.div>
      </div>

    </motion.div>
  );
}

// Subcomponent for The Dock
function DockItem({ icon, label, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="group relative flex items-center justify-center w-12 h-12 rounded-full text-muted-400 hover:text-white transition-colors"
    >
      {icon}
      
      {/* Tooltip */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-white text-black text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
        {label}
      </div>
    </motion.button>
  );
}

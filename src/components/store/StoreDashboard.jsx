import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
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
  
  // Public URL
  const publicUrl = `${import.meta.env.VITE_STORE_PUBLIC_URL || 'https://gestivaone-store.vercel.app'}/${storeSlug || ''}`;

  // Compute 7-day order distribution for the Log de Pedidos chart (Image 2 Inspired Graphic)
  const last7DaysOrders = useMemo(() => {
    const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const today = new Date();
    const result = [];
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = dayLabels[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      
      const dayCount = invoices.filter(inv => {
        const invDate = inv.created_at || inv.date;
        return invDate && invDate.startsWith(dateStr);
      }).length;

      result.push({
        day: dayName,
        count: dayCount,
        isToday: i === 0
      });
    }
    
    // Find max count for height scaling (min 5 for visual proportion)
    const maxCount = Math.max(...result.map(r => r.count), 5);
    return result.map(r => ({
      ...r,
      heightPercent: Math.max(Math.round((r.count / maxCount) * 100), 14)
    }));
  }, [invoices]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="flex flex-col gap-6 w-full pb-8"
    >
      
      {/* ==========================================
          MAIN HERO BENTO GRID (Standby & Live Visuals)
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT BIG CARD: Standby Hero Card */}
        <div className="lg:col-span-8 rounded-[2.5rem] bg-gradient-to-br from-purple-900/20 via-brand-500/10 to-indigo-900/20 border border-purple-500/20 p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden shadow-xl min-h-[280px]">
          
          {/* Status Badge */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400">ESTADO DEL CANAL</span>
              <span className={clsx(
                "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border",
                storeEnabled 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                  : "bg-surface-800 text-muted-400 border-subtle"
              )}>
                <span className={clsx("w-1.5 h-1.5 rounded-full", storeEnabled ? "bg-emerald-400 animate-pulse" : "bg-muted-500")} />
                {storeEnabled ? 'ONLINE (ON)' : 'OFFLINE (OFF)'}
              </span>
            </div>
          </div>

          {/* Center Main Message */}
          <div className="my-6 z-10 max-w-lg">
            <h2 className="text-4xl sm:text-5xl font-black text-foreground dark:text-white tracking-tight mb-2">
              {storeEnabled ? 'Tienda Activa.' : 'Standby.'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-400 font-medium leading-relaxed">
              {storeEnabled 
                ? 'Tu tienda virtual está recibiendo pedidos contra entrega en tiempo real.' 
                : 'El catálogo está oculto. Usa el interruptor para publicar el sistema.'}
            </p>
          </div>

          {/* Action Button & Live Preview Link */}
          <div className="flex flex-wrap items-center gap-3 z-10">
            <button
              onClick={() => setStoreEnabled(!storeEnabled)}
              className={clsx(
                "px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-lg cursor-pointer transform active:scale-95",
                storeEnabled
                  ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25"
                  : "bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/30"
              )}
            >
              <Icon name={storeEnabled ? "EyeOff" : "Sparkles"} size={16} />
              <span>{storeEnabled ? 'Pausar tienda' : 'Publicar tienda'}</span>
            </button>

            {storeSlug && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-2xl bg-surface-800/80 hover:bg-surface-700 border border-subtle text-foreground dark:text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <span>Ver preview</span>
                <Icon name="ExternalLink" size={13} className="text-muted-400" />
              </a>
            )}
          </div>

          {/* Right 3D Vector Graphic */}
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
            RIGHT SIDE STAT CARDS (Con Gráficos Inspirados en Imagen 2)
            ========================================== */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* INGRESOS HOY CARD (Con Mini Bar Chart Equalizer Grafico) */}
          <div className="rounded-[2.5rem] bg-white dark:bg-surface-800 border-0 p-6 flex items-center justify-between shadow-sm relative overflow-hidden">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] text-muted-400 font-bold uppercase tracking-widest">INGRESOS HOY</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                  <Icon name="TrendingUp" size={10} />
                  <span>En tiempo real</span>
                </span>
              </div>
              <div className="text-3xl font-extrabold text-foreground dark:text-white tracking-tight">
                {formatCOP(metrics.salesSumToday)}
              </div>
              <div className="text-xs text-muted-400 font-medium mt-1">
                {metrics.ordersCountToday} transacciones
              </div>
            </div>

            {/* Graphic Inspired by Image 2: Mini Equalizer Bar Chart */}
            <div className="flex items-end gap-1.5 h-12 px-3 py-2 rounded-2xl bg-surface-50 dark:bg-surface-900/60 border border-subtle/50 shrink-0">
              {[40, 70, 50, 95, 65, 85].map((h, idx) => (
                <div key={idx} className="w-1.5 rounded-full bg-surface-200 dark:bg-surface-700 overflow-hidden h-full flex items-end">
                  <div 
                    className={clsx(
                      "w-full rounded-full transition-all duration-500",
                      idx === 3 || idx === 5 ? "bg-gradient-to-t from-brand-500 to-purple-400 shadow-sm" : "bg-brand-500/40"
                    )} 
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CATÁLOGO CARD (Con Gráfico de Barras de Distribución de Stock) */}
          <div className="rounded-[2.5rem] bg-white dark:bg-surface-800 border-0 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden min-h-[140px]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] text-muted-400 font-bold uppercase tracking-widest block">CATÁLOGO</span>
                <span className="text-[10px] font-semibold text-brand-500">
                  {metrics.activeProducts > 0 ? `${metrics.activeProducts} Disponibles` : 'Sin inventario'}
                </span>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <Icon name="Package" size={20} />
              </div>
            </div>

            {/* Numbers Row */}
            <div className="flex items-center gap-6 mb-3">
              <div>
                <div className="text-2xl font-extrabold text-foreground dark:text-white tracking-tight">{metrics.activeProducts}</div>
                <div className="text-[10px] text-muted-400 font-bold">Activos</div>
              </div>
              <div className="w-px h-7 bg-subtle" />
              <div>
                <div className={clsx("text-2xl font-extrabold tracking-tight", metrics.outOfStock > 0 ? "text-rose-500" : "text-foreground dark:text-white")}>
                  {metrics.outOfStock}
                </div>
                <div className="text-[10px] text-muted-400 font-bold">Agotados</div>
              </div>
            </div>

            {/* Graphic Inspired by Image 2: Dual Segment Stock Progress Bar */}
            <div className="w-full h-2 rounded-full bg-surface-100 dark:bg-surface-700 overflow-hidden flex">
              <div 
                className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-l-full transition-all duration-500" 
                style={{ 
                  width: `${metrics.activeProducts + metrics.outOfStock > 0 
                    ? Math.round((metrics.activeProducts / (metrics.activeProducts + metrics.outOfStock)) * 100) 
                    : 100}%` 
                }} 
              />
              {metrics.outOfStock > 0 && (
                <div 
                  className="h-full bg-rose-500 rounded-r-full transition-all duration-500" 
                  style={{ 
                    width: `${Math.round((metrics.outOfStock / (metrics.activeProducts + metrics.outOfStock)) * 100)}%` 
                  }} 
                />
              )}
            </div>
          </div>

        </div>

        {/* ==========================================
            3. LOG DE PEDIDOS BANNER (Con Gráfico de Barras de Actividad por Día Inspirado en Imagen 2)
            ========================================== */}
        <div className="lg:col-span-12 rounded-[2.5rem] bg-slate-950 border border-slate-800 text-white p-7 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
          
          {/* Left Info Column */}
          <div className="flex flex-col justify-center min-w-[160px]">
            <div className="flex items-center gap-2 mb-2 text-purple-400">
              <Icon name="Activity" size={16} />
              <span className="text-[10px] font-extrabold uppercase tracking-widest">LOG DE PEDIDOS</span>
            </div>
            <div className="text-5xl font-black tracking-tight text-white">{invoices.length}</div>
            <div className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sincronizado en tiempo real</span>
            </div>
          </div>

          {/* CENTER / RIGHT GRAPHIC (Gráfico de Actividad por Día en Estilo Neón Imagen 2) */}
          <div className="flex-1 max-w-xl bg-slate-900/80 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-2">
                <Icon name="BarChart3" size={16} className="text-purple-400" />
                <span className="text-xs font-bold text-slate-200">Actividad de Pedidos (Últimos 7 días)</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
                Semana Actual
              </span>
            </div>

            {/* 7-Day Bar Chart Visualization (Inspired by Image 2 Patient Leads By Day Chart) */}
            <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4 pb-1">
              {last7DaysOrders.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[9px] font-bold text-slate-400 group-hover:text-purple-300 transition-colors">
                    {d.count}
                  </span>
                  
                  {/* Outer Bar Track */}
                  <div className="w-full max-w-[28px] h-full bg-slate-950/80 rounded-xl p-1 flex items-end relative overflow-hidden border border-slate-800/50">
                    {/* Inner Colored Fill Bar */}
                    <div 
                      className={clsx(
                        "w-full rounded-lg transition-all duration-700 group-hover:brightness-125",
                        d.isToday 
                          ? "bg-gradient-to-t from-purple-600 via-brand-500 to-emerald-400 shadow-lg shadow-purple-500/30" 
                          : d.count > 0 
                            ? "bg-gradient-to-t from-purple-900 to-purple-500/80" 
                            : "bg-slate-800/60"
                      )}
                      style={{ height: `${d.heightPercent}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <span className={clsx(
                    "text-[10px] font-bold uppercase",
                    d.isToday ? "text-purple-400" : "text-slate-500"
                  )}>
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right 3D Tray Icon */}
          <div className="hidden lg:flex w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-400/20 items-center justify-center text-purple-400 shrink-0 shadow-inner">
            <Icon name="Inbox" size={36} />
          </div>
        </div>

      </div>

    </motion.div>
  );
}

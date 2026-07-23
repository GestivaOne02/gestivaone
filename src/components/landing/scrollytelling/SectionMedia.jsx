import React from 'react'
import Icon from '@/components/ui/Icon'

export default function SectionMedia({ mockupType, mockupData, accentColor, title }) {
  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] rounded-3xl overflow-hidden bg-surface-900/90 border border-white/10 shadow-2xl backdrop-blur-xl group transition-all duration-500 hover:border-white/20">
      {/* Top Browser / Window Control Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d0d15] border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-[11px] font-mono text-white/40 tracking-wider">gestivaone.com/{mockupType}</span>
        </div>
        <div className="flex items-center gap-2 text-white/40">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/80">
            ENV: PRODUCTION
          </span>
        </div>
      </div>

      {/* Dynamic Interactive Mockup Body based on mockupType */}
      <div className="p-6 sm:p-8 h-[calc(100%-49px)] flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#0e0e18] to-[#08080f]">
        
        {/* Module 1: Inventory Radar */}
        {mockupType === 'inventory' && (
          <div className="space-y-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Control de Existencias</h4>
                <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{mockupData.totalProducts} Ítems Activos</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Stock
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-white/50 font-medium">Alertas Mínimas</span>
                <p className="text-sm font-bold text-amber-400">{mockupData.activeAlerts}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-white/50 font-medium">Movimiento Hoy</span>
                <p className="text-sm font-bold text-emerald-400">{mockupData.recentMovement}</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-white/80 p-2.5 rounded-xl bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <Icon name="PackageCheck" size={16} className="text-emerald-400" />
                  <span className="font-semibold">Café Bourbon 500g</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">142 Unidades</span>
              </div>
              <div className="flex items-center justify-between text-xs text-white/80 p-2.5 rounded-xl bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <Icon name="AlertTriangle" size={16} className="text-amber-400" />
                  <span className="font-semibold">Leche Almendras 1L</span>
                </div>
                <span className="font-mono text-amber-400 font-bold">3 Unidades (Bajo)</span>
              </div>
            </div>
          </div>
        )}

        {/* Module 2: POS Terminal */}
        {mockupType === 'pos' && (
          <div className="space-y-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-indigo-400 font-bold">Punto de Venta Directo</h4>
                <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{mockupData.speed}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold flex items-center gap-1.5">
                <Icon name="Printer" size={14} /> ESC/POS Ready
              </span>
            </div>

            <div className="bg-surface-800/80 border border-white/10 rounded-2xl p-4 space-y-3 font-mono text-xs text-white/90">
              <div className="flex justify-between border-b border-white/10 pb-2 text-[11px] text-white/50">
                <span>CANT. PRODUCTO</span>
                <span>TOTAL</span>
              </div>
              <div className="flex justify-between">
                <span>1x Combo Hamburguesa Gourmet</span>
                <span className="text-indigo-300 font-bold">$32.900</span>
              </div>
              <div className="flex justify-between">
                <span>2x Bebida Gasificada 400ml</span>
                <span className="text-indigo-300 font-bold">$12.000</span>
              </div>
              <div className="border-t border-dashed border-white/20 pt-2.5 flex justify-between font-extrabold text-sm text-white">
                <span>TOTAL TICKET:</span>
                <span className="text-emerald-400">$44.900 COP</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
              <span className="font-semibold flex items-center gap-2">
                <Icon name="Wifi" size={14} /> Sincronización Automática en Nube
              </span>
              <span className="font-bold">IMPRESORA CONECTADA</span>
            </div>
          </div>
        )}

        {/* Module 3: CRM & WhatsApp */}
        {mockupType === 'crm' && (
          <div className="space-y-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-brand-400 font-bold">Automatización de Cartera</h4>
                <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{mockupData.messagesSent}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold flex items-center gap-1.5">
                <Icon name="MessageSquare" size={14} /> WhatsApp Business API
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <Icon name="CheckCheck" size={16} /> Mensaje Enviado a Cliente (+57 300 894 1120)
              </div>
              <p className="text-xs text-white/80 italic bg-black/40 p-3 rounded-xl border border-white/5 leading-relaxed">
                "Hola Juan! ⚡ Tu Factura No. #FE-8920 de $120.000 COP ya está disponible. Haz clic para consultar y pagar en línea."
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-medium text-white/70">
                Respuesta Promedio: <strong className="text-white block font-bold">4 Minutos</strong>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-medium text-white/70">
                Canal Oficial: <strong className="text-emerald-400 block font-bold">WhatsApp Business</strong>
              </div>
            </div>
          </div>
        )}

        {/* Module 4: Analytics */}
        {mockupType === 'analytics' && (
          <div className="space-y-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-purple-400 font-bold">Flujo de Caja & Utilidades</h4>
                <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{mockupData.growth}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5">
                <Icon name="TrendingUp" size={14} /> Reportes 1 Click
              </span>
            </div>

            {/* Simulated Dynamic Bar Chart */}
            <div className="h-28 flex items-end justify-between gap-3 pt-4 px-2 border-b border-white/10">
              {[40, 65, 55, 80, 95, 75, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group/bar">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-purple-600 to-purple-400 group-hover/bar:brightness-125 transition-all"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[9px] font-mono text-white/40">Día {i + 1}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs text-white/80 bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl">
              <span>Margen Operativo Bruto: <strong className="text-purple-300 font-bold">{mockupData.margin}</strong></span>
              <span className="text-[10px] text-white/50 uppercase font-semibold">Formatos: PDF, XLSX</span>
            </div>
          </div>
        )}

        {/* Module 5: DIAN Tax Compliance */}
        {mockupType === 'dian' && (
          <div className="space-y-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-amber-400 font-bold">Facturación Electrónica</h4>
                <p className="text-xl sm:text-2xl font-black text-white mt-0.5">100% Normativo DIAN</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                <Icon name="ShieldCheck" size={14} /> SSL Bank Grade
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">ESTADO VALIDACIÓN TRIBUTARIA</span>
                <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded-md font-black">APROBADO DIAN</span>
              </div>
              <div className="text-[11px] font-mono text-white/70 space-y-1 bg-black/50 p-3 rounded-xl border border-white/5">
                <p>CUFE: 8f9a72b1c4e9d0a...3a92</p>
                <p>QR TRIBUTARIO: GENERADO & VALIDADO</p>
                <p>XML ASIGNADO: FacturaElectronica_FE-9402.xml</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-amber-200">
              <span className="flex items-center gap-1.5 font-medium">
                <Icon name="Lock" size={14} className="text-amber-400" /> Transmisión Cifrada de extremo a extremo
              </span>
            </div>
          </div>
        )}

        {/* Module 6: Gourmet / Restaurant */}
        {mockupType === 'gourmet' && (
          <div className="space-y-5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-rose-400 font-bold">Módulo Gastronómico</h4>
                <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{mockupData.activeTables}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5">
                <Icon name="Utensils" size={14} /> Gourmet Ready
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { name: 'Mesa 1', status: 'Ocupada', items: '3 Comandas', color: 'bg-rose-500/20 border-rose-500/40 text-rose-300' },
                { name: 'Mesa 2', status: 'Libre', items: 'Lista', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
                { name: 'Mesa 3', status: 'Cuenta', items: 'Por Cobrar', color: 'bg-amber-500/20 border-amber-500/40 text-amber-300' }
              ].map((table, tIdx) => (
                <div key={tIdx} className={`p-3 rounded-2xl border text-center space-y-1 ${table.color}`}>
                  <span className="text-xs font-bold block">{table.name}</span>
                  <span className="text-[9px] uppercase font-bold block opacity-80">{table.status}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-white/80 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
              <span className="font-semibold flex items-center gap-2">
                <Icon name="QrCode" size={14} className="text-rose-400" /> Menú QR Digital en Mesas
              </span>
              <span className="font-bold text-rose-300">ACTIVO</span>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

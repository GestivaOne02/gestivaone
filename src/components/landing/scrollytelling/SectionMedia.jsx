import React from 'react'
import Icon from '@/components/ui/Icon'

export default function SectionMedia({ mockupType, mockupData }) {
  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/10] max-w-lg mx-auto rounded-2xl overflow-hidden bg-surface-900/90 border border-white/10 shadow-2xl backdrop-blur-xl group transition-all duration-500 hover:border-white/20">
      {/* Top Browser / Window Control Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0d0d15] border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-1.5 text-[10px] font-mono text-white/40 tracking-wider">gestivaone.com/{mockupType}</span>
        </div>
        <div className="flex items-center gap-2 text-white/40">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/80">
            PROD
          </span>
        </div>
      </div>

      {/* Dynamic Interactive Mockup Body based on mockupType */}
      <div className="p-4 sm:p-5 h-[calc(100%-41px)] flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#0e0e18] to-[#08080f]">
        
        {/* Module 1: Inventory Radar */}
        {mockupType === 'inventory' && (
          <div className="space-y-3.5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Control de Existencias</h4>
                <p className="text-lg sm:text-xl font-black text-white mt-0.5">{mockupData.totalProducts} Ítems Activos</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Stock
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                <span className="text-[9px] text-white/50 font-medium">Alertas Mínimas</span>
                <p className="text-xs font-bold text-amber-400">{mockupData.activeAlerts}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                <span className="text-[9px] text-white/50 font-medium">Movimiento Hoy</span>
                <p className="text-xs font-bold text-emerald-400">{mockupData.recentMovement}</p>
              </div>
            </div>

            <div className="space-y-2 pt-1 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-white/80 p-2 rounded-lg bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <Icon name="PackageCheck" size={14} className="text-emerald-400" />
                  <span className="font-semibold text-[11px]">Café Bourbon 500g</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold text-[11px]">142 Unidades</span>
              </div>
              <div className="flex items-center justify-between text-xs text-white/80 p-2 rounded-lg bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <Icon name="AlertTriangle" size={14} className="text-amber-400" />
                  <span className="font-semibold text-[11px]">Leche Almendras 1L</span>
                </div>
                <span className="font-mono text-amber-400 font-bold text-[11px]">3 Unidades</span>
              </div>
            </div>
          </div>
        )}

        {/* Module 2: POS Terminal */}
        {mockupType === 'pos' && (
          <div className="space-y-3.5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Punto de Venta Directo</h4>
                <p className="text-lg sm:text-xl font-black text-white mt-0.5">{mockupData.speed}</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold flex items-center gap-1">
                <Icon name="Printer" size={12} /> ESC/POS Ready
              </span>
            </div>

            <div className="bg-surface-800/80 border border-white/10 rounded-xl p-3 space-y-2 font-mono text-[11px] text-white/90">
              <div className="flex justify-between border-b border-white/10 pb-1 text-[10px] text-white/50">
                <span>CANT. PRODUCTO</span>
                <span>TOTAL</span>
              </div>
              <div className="flex justify-between">
                <span>1x Combo Hamburguesa</span>
                <span className="text-indigo-300 font-bold">$32.900</span>
              </div>
              <div className="flex justify-between">
                <span>2x Bebida Gasificada</span>
                <span className="text-indigo-300 font-bold">$12.000</span>
              </div>
              <div className="border-t border-dashed border-white/20 pt-1.5 flex justify-between font-extrabold text-xs text-white">
                <span>TOTAL TICKET:</span>
                <span className="text-emerald-400">$44.900 COP</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-lg">
              <span className="font-semibold flex items-center gap-1.5 text-[10px]">
                <Icon name="Wifi" size={12} /> Sincronización Automática
              </span>
              <span className="font-bold text-[9px] uppercase">IMPRESORA CONECTADA</span>
            </div>
          </div>
        )}

        {/* Module 3: CRM & WhatsApp */}
        {mockupType === 'crm' && (
          <div className="space-y-3.5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-brand-400 font-bold">Automatización de Cartera</h4>
                <p className="text-lg sm:text-xl font-black text-white mt-0.5">{mockupData.messagesSent}</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-[10px] font-bold flex items-center gap-1">
                <Icon name="MessageSquare" size={12} /> WhatsApp Business API
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold">
                <Icon name="CheckCheck" size={14} /> Mensaje Enviado (+57 300 894 1120)
              </div>
              <p className="text-[10px] text-white/80 italic bg-black/40 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                "Hola Juan! ⚡ Tu Factura No. #FE-8920 de $120.000 COP ya está disponible. Haz clic para consultar y pagar en línea."
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 font-medium text-white/70">
                Respuesta Promedio: <strong className="text-white block font-bold">4 Minutos</strong>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 font-medium text-white/70">
                Canal Oficial: <strong className="text-emerald-400 block font-bold">WhatsApp API</strong>
              </div>
            </div>
          </div>
        )}

        {/* Module 4: Analytics */}
        {mockupType === 'analytics' && (
          <div className="space-y-3.5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">Flujo de Caja & Utilidades</h4>
                <p className="text-lg sm:text-xl font-black text-white mt-0.5">{mockupData.growth}</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold flex items-center gap-1">
                <Icon name="TrendingUp" size={12} /> Reportes 1 Click
              </span>
            </div>

            {/* Simulated Dynamic Bar Chart */}
            <div className="h-24 flex items-end justify-between gap-2.5 pt-3 px-1 border-b border-white/10">
              {[40, 65, 55, 80, 95, 75, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-purple-600 to-purple-400 group-hover/bar:brightness-125 transition-all"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[8px] font-mono text-white/40">Día {i + 1}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-[10px] text-white/80 bg-purple-500/10 border border-purple-500/20 p-2.5 rounded-lg">
              <span>Margen Operativo: <strong className="text-purple-300 font-bold">{mockupData.margin}</strong></span>
              <span className="text-[9px] text-white/50 uppercase font-semibold">Formatos: PDF, XLSX</span>
            </div>
          </div>
        )}

        {/* Module 5: DIAN Tax Compliance */}
        {mockupType === 'dian' && (
          <div className="space-y-3.5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Facturación Electrónica</h4>
                <p className="text-lg sm:text-xl font-black text-white mt-0.5">100% Normativo DIAN</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                <Icon name="ShieldCheck" size={12} /> SSL Bank Grade
              </span>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-300">ESTADO TRIBUTARIO</span>
                <span className="text-[9px] bg-emerald-500 text-black px-1.5 py-0.5 rounded font-black">APROBADO DIAN</span>
              </div>
              <div className="text-[10px] font-mono text-white/70 space-y-0.5 bg-black/50 p-2.5 rounded-lg border border-white/5">
                <p>CUFE: 8f9a72b1c4e9d0a...3a92</p>
                <p>QR TRIBUTARIO: VALIDADO</p>
                <p>XML: FacturaElectronica_FE-9402.xml</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-amber-200">
              <span className="flex items-center gap-1 font-medium">
                <Icon name="Lock" size={12} className="text-amber-400" /> Transmisión Cifrada SSL/TLS
              </span>
            </div>
          </div>
        )}

        {/* Module 6: Gourmet / Restaurant */}
        {mockupType === 'gourmet' && (
          <div className="space-y-3.5 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-rose-400 font-bold">Módulo Gastronómico</h4>
                <p className="text-lg sm:text-xl font-black text-white mt-0.5">{mockupData.activeTables}</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-bold flex items-center gap-1">
                <Icon name="Utensils" size={12} /> Gourmet Ready
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Mesa 1', status: 'Ocupada', items: '3 Comandas', color: 'bg-rose-500/20 border-rose-500/40 text-rose-300' },
                { name: 'Mesa 2', status: 'Libre', items: 'Lista', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
                { name: 'Mesa 3', status: 'Cuenta', items: 'Por Cobrar', color: 'bg-amber-500/20 border-amber-500/40 text-amber-300' }
              ].map((table, tIdx) => (
                <div key={tIdx} className={`p-2.5 rounded-xl border text-center space-y-0.5 ${table.color}`}>
                  <span className="text-[11px] font-bold block">{table.name}</span>
                  <span className="text-[8px] uppercase font-bold block opacity-80">{table.status}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] text-white/80 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
              <span className="font-semibold flex items-center gap-1.5">
                <Icon name="QrCode" size={12} className="text-rose-400" /> Menú QR Digital en Mesas
              </span>
              <span className="font-bold text-rose-300">ACTIVO</span>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

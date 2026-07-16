import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  PlugZap, Lock, Copy, Save, CheckCircle2, AlertTriangle, Loader2,
  Globe, Search, Zap, Phone, ShoppingBag, TrendingUp, Truck, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatCOP = (v) => v == null ? '' : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

export default function StoreIntegrations({
  invoices,
  user,
  dropiToken, setDropiToken,
  dropiTokenSaved,
  dropiTestStatus,
  dropiTestMsg,
  integSaving,
  dropiBusy,
  dropiCityQuery, setDropiCityQuery,
  dropiCities,
  dropiCityLoading,
  handleSaveDropiToken,
  handleTestDropi,
  handleDropiCitySearch,
  handlePushToDropi
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-6"
    >
      {/* Integrations Header */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-2xl p-6 rounded-[2rem] flex items-start gap-4 relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
          <PlugZap size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Integraciones & Logística</h2>
          <p className="text-xs text-muted-400 mt-1 max-w-xl leading-relaxed">
            Vincula tu negocio con plataformas externas de dropshipping, logística y mensajería en un solo lugar.
          </p>
        </div>
      </div>

      {/* Dropi Integration Panel */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-2xl p-6 rounded-[2rem] flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
              <Zap size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">Dropi Colombia</span>
                {dropiTokenSaved && dropiTestStatus === 'ok' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-success-500/10 border border-success-500/20 text-success-400 flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    Conectado
                  </span>
                )}
                {dropiTestStatus === 'error' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-danger-500/10 border border-danger-500/20 text-danger-400 flex items-center gap-1">
                    <AlertTriangle size={10} />
                    Error
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-400 mt-0.5">Automatiza tus envíos mediante dropshipping.</p>
            </div>
          </div>

          <a
            href="https://dropi.co"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-400 hover:text-brand-400 flex items-center gap-1.5 transition-colors"
          >
            <Globe size={13} />
            <span>Visitar dropi.co</span>
          </a>
        </div>

        {/* Credentials Form */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Lock size={12} className="text-muted-500" />
            <span className="text-xs font-bold text-white">API Token</span>
          </div>
          <p className="text-[10px] text-muted-500 leading-relaxed -mt-1.5">
            Pega tu token de acceso generado en Dropi &gt; Configuración &gt; API.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="password"
                value={dropiToken}
                onChange={e => setDropiToken(e.target.value)}
                placeholder={dropiTokenSaved ? "✅ Token configurado de forma segura" : "Pega tu Bearer Token de Dropi…"}
                disabled={dropiTokenSaved && !dropiToken}
                className="w-full bg-black/40 border border-white/5 rounded-2xl pl-4 pr-10 py-3 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              />
              {dropiToken && (
                <button
                  onClick={() => { navigator.clipboard.writeText(dropiToken); toast.success('Copiado'); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-500 hover:text-white transition-colors"
                >
                  <Copy size={14} />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveDropiToken}
                disabled={integSaving}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-brand-400 disabled:opacity-50"
              >
                {integSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                <span>Guardar</span>
              </button>
              
              <button
                onClick={handleTestDropi}
                disabled={!dropiTokenSaved || dropiTestStatus === 'loading'}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/5 disabled:opacity-50"
              >
                {dropiTestStatus === 'loading' ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                <span>Probar Conexión</span>
              </button>
            </div>
          </div>

          {/* Alert Message */}
          {dropiTestMsg && (
            <div className={clsx(
              'mt-2 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold border',
              dropiTestStatus === 'ok'
                ? 'bg-success-500/10 border-success-500/20 text-success-400'
                : 'bg-danger-500/10 border-danger-500/20 text-danger-400'
            )}>
              {dropiTestStatus === 'ok' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              <span>{dropiTestMsg}</span>
            </div>
          )}
        </div>

        {/* City Search */}
        <div className="border-t border-white/5 pt-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Globe size={12} className="text-muted-500" />
            <span className="text-xs font-bold text-white">Cobertura por Ciudad</span>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={dropiCityQuery}
              onChange={e => setDropiCityQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDropiCitySearch()}
              placeholder="Ej: Medellín, Bogotá, Cali…"
              className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-500"
            />
            <button
              onClick={handleDropiCitySearch}
              disabled={dropiCityLoading || !dropiCityQuery.trim()}
              className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all border border-white/5 flex items-center justify-center gap-2"
            >
              {dropiCityLoading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
              <span>Buscar</span>
            </button>
          </div>

          {dropiCities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {dropiCities.slice(0, 15).map((city, i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] text-muted-300 font-bold uppercase tracking-wider">
                  {typeof city === 'string' ? city : (city.name || city.city_name || JSON.stringify(city))}
                </span>
              ))}
              {dropiCities.length > 15 && (
                <span className="px-3 py-1.5 rounded-xl bg-white/5 text-[10px] text-muted-500 font-bold">
                  +{dropiCities.length - 15} más
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pending Invoices to push */}
        {invoices.length > 0 && (
          <div className="border-t border-white/5 pt-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <ShoppingBag size={12} className="text-muted-500" />
              <span className="text-xs font-bold text-white">Despacho de Pedidos Recientes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {invoices.slice(0, 8).map(inv => (
                <div key={inv.id} className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col justify-between gap-4 hover:border-white/10 transition-colors">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{inv.customer_name || 'Cliente sin nombre'}</div>
                    <div className="text-[10px] text-muted-500 font-medium">{inv.customer_city || 'Destino no especificado'}</div>
                    <div className="text-[10px] text-brand-400 font-mono mt-1">{formatCOP(inv.total)}</div>
                  </div>
                  
                  <button
                    onClick={() => handlePushToDropi(inv)}
                    disabled={dropiBusy}
                    className="w-full py-2 bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 text-violet-400 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {dropiBusy ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                    <span>Enviar a Dropi</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Future Integrations Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: 'WhatsApp API', desc: 'Alertas automáticas de pedidos.', icon: Phone, tag: 'Próximamente' },
          { name: 'WooCommerce', desc: 'Unifica tu stock de WordPress.', icon: Globe, tag: 'Próximamente' },
          { name: 'MercadoLibre', desc: 'Sincroniza publicaciones en vivo.', icon: TrendingUp, tag: 'Próximamente' },
          { name: 'Coordinadora / TCC', desc: 'Rastreo automático de guías.', icon: Truck, tag: 'Próximamente' },
          { name: 'PSE / Tarjetas', desc: 'Pasarela de pagos en línea.', icon: ShieldCheck, tag: 'En evaluación' }
        ].map(integ => {
          const Icon = integ.icon;
          return (
            <div key={integ.name} className="bg-white/5 border border-white/5 p-5 rounded-[2rem] flex flex-col justify-between gap-4 opacity-50 hover:opacity-75 transition-opacity duration-300">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-muted-400 shrink-0">
                  <Icon size={14} />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-white/5 border border-white/10 text-muted-500 uppercase tracking-widest">
                  {integ.tag}
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-white">{integ.name}</div>
                <p className="text-[10px] text-muted-500 mt-1 leading-normal">{integ.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

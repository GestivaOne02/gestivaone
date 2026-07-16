import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Save, Check, RefreshCw } from 'lucide-react';

export default function StoreAppearance({
  storeName, setStoreName,
  logoUrl, setLogoUrl,
  bannerUrl, setBannerUrl,
  accentColor, setAccentColor,
  whatsappContact, setWhatsappContact,
  seoDescription, setSeoDescription,
  saving, handleSaveSettings
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 lg:grid-cols-5 gap-6"
    >
      {/* Form Panel */}
      <div className="lg:col-span-3 bg-white/5 border border-white/10 backdrop-blur-2xl p-6 rounded-[2rem] flex flex-col gap-6 relative overflow-hidden">
        <div>
          <h3 className="text-lg font-bold text-white">Identidad de Marca</h3>
          <p className="text-xs text-muted-400 mt-1">Configura los elementos visuales públicos de tu e-commerce.</p>
        </div>

        <div className="w-full h-px bg-white/5" />

        <div className="flex flex-col gap-5">
          {/* Store name */}
          <div>
            <label className="text-[10px] text-muted-500 font-bold uppercase tracking-wider mb-2 block">Nombre Oficial</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Ej. Mi Tienda Express"
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Logo & Banner URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-muted-500 font-bold uppercase tracking-wider mb-2 block">URL del Logo (1:1)</label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://ejemplo.com/logo.png"
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-500 font-bold uppercase tracking-wider mb-2 block">URL del Banner (Portada)</label>
              <input
                type="text"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://ejemplo.com/banner.png"
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Accent Color picker */}
          <div>
            <label className="text-[10px] text-muted-500 font-bold uppercase tracking-wider mb-3 block">Color de Acento</label>
            <div className="flex flex-wrap gap-3 items-center">
              {[
                { hex: '#4f46e5', name: 'Indigo' },
                { hex: '#10b981', name: 'Emerald' },
                { hex: '#f59e0b', name: 'Amber' },
                { hex: '#ef4444', name: 'Crimson' },
                { hex: '#8b5cf6', name: 'Violet' },
                { hex: '#ec4899', name: 'Pink' }
              ].map(color => (
                <button
                  key={color.hex}
                  onClick={() => setAccentColor(color.hex)}
                  style={{ backgroundColor: color.hex }}
                  className={clsx(
                    'w-8 h-8 rounded-full cursor-pointer transition-transform relative flex items-center justify-center hover:scale-110 active:scale-95',
                    accentColor === color.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-105' : ''
                  )}
                  title={color.name}
                >
                  {accentColor === color.hex && <Check size={14} className="text-white drop-shadow-sm" />}
                </button>
              ))}
              <div className="flex items-center gap-2 ml-2 bg-black/40 border border-white/5 px-3 py-1.5 rounded-xl">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-6 h-6 bg-transparent border-0 cursor-pointer rounded"
                />
                <span className="text-xs font-mono text-muted-400 uppercase tracking-wider">{accentColor}</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Support Number */}
          <div>
            <label className="text-[10px] text-muted-500 font-bold uppercase tracking-wider mb-2 block">WhatsApp de Contacto</label>
            <input
              type="tel"
              value={whatsappContact}
              onChange={(e) => setWhatsappContact(e.target.value)}
              placeholder="Ej. 3123456789"
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
            />
            <p className="text-[10px] text-muted-500 mt-1.5 leading-relaxed">Incluye el código de país. Para Colombia: 573123456789.</p>
          </div>

          {/* SEO Meta description */}
          <div>
            <label className="text-[10px] text-muted-500 font-bold uppercase tracking-wider mb-2 block">Descripción SEO</label>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Escribe una breve descripción de tu tienda para buscadores y redes sociales..."
              rows={3}
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-xs text-white resize-none focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="w-full sm:w-auto self-end mt-4 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-brand-400 disabled:opacity-50"
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          <span>Guardar Configuración</span>
        </button>
      </div>

      {/* Right Mockup Preview Panel */}
      <div className="lg:col-span-2 flex flex-col justify-start">
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl p-6 rounded-[2rem] flex flex-col gap-4 select-none relative overflow-hidden h-full min-h-[480px]">
          <div className="text-xs font-bold text-muted-400 uppercase tracking-widest border-b border-white/5 pb-3">Vista Previa Móvil</div>
          
          <div className="flex-1 flex items-center justify-center py-4">
            {/* Smartphone Frame Mockup */}
            <div className="rounded-[2.5rem] border-8 border-surface-700 bg-black/60 p-4 aspect-[9/16] flex flex-col gap-4 overflow-hidden shadow-2xl relative w-full max-w-[280px]">
              
              {/* Camera Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-surface-700 rounded-full z-20" />
              
              {/* Header mockup */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mt-2">
                <div className="flex items-center gap-2">
                  <div 
                    style={{ background: `linear-gradient(135deg, ${accentColor}, #7c3aed)` }} 
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-lg"
                  >
                    {(storeName || 'G').charAt(0).toUpperCase()}
                  </div>
                  <div className="text-[10px] font-black text-white truncate max-w-[100px]">
                    {storeName || 'Mi Tienda'}
                  </div>
                </div>
                <span className="text-[8px] bg-success-500/10 border border-success-500/20 text-success-400 px-2 py-0.5 rounded-full font-bold">
                  Contra Entrega
                </span>
              </div>

              {/* Small banner mockup */}
              <div 
                style={{
                  backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  background: !bannerUrl ? 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))' : undefined,
                }} 
                className="h-20 rounded-2xl flex items-center justify-center text-center p-2 relative overflow-hidden border border-white/5"
              >
                {!bannerUrl && <div className="text-[9px] text-muted-600 font-bold uppercase tracking-wider">Sin portada</div>}
                <div className="absolute inset-0 bg-black/40 pointer-events-none" />
              </div>

              {/* Fake single product card */}
              <div className="bg-white/5 rounded-2xl p-3 flex flex-col gap-2.5 border border-white/5 flex-1 justify-between">
                <div className="aspect-square bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-2xl relative overflow-hidden">
                  <span className="opacity-80">📦</span>
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px]">★</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-white">Producto Demostración</div>
                  <div style={{ color: accentColor }} className="text-xs font-black mt-1">$ 45.000</div>
                </div>
                <div 
                  style={{ background: `linear-gradient(135deg, ${accentColor}, #7c3aed)` }} 
                  className="text-white py-2 text-center text-[9px] font-black rounded-xl shadow-lg"
                >
                  Pedir Ahora
                </div>
              </div>

              <div className="text-[8px] text-muted-600 text-center mt-auto">
                Powered by GestivaOne Store
              </div>

            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

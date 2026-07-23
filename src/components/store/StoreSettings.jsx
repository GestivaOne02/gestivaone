import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Icon from '@/components/ui/Icon';

export default function StoreSettings({
  codEnabled, setCodEnabled,
  bankTransferEnabled, setBankTransferEnabled,
  bankDetails, setBankDetails,
  shippingFee, setShippingFee,
  freeShippingThreshold, setFreeShippingThreshold,
  saving, handleSaveSettings
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Payment Methods */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-2xl p-6 rounded-[2rem] flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold text-white">Métodos de Pago</h3>
          <p className="text-xs text-muted-400 mt-1">Habilita las formas de pago permitidas en tu catálogo público.</p>
        </div>

        <div className="w-full h-px bg-white/5" />

        <div className="flex flex-col gap-4">
          {/* Pago Contra Entrega */}
          <div 
            onClick={() => setCodEnabled(!codEnabled)}
            className={clsx(
              "flex items-start justify-between gap-4 p-5 rounded-2xl border cursor-pointer transition-all duration-300",
              codEnabled 
                ? "bg-brand-500/10 border-brand-500/20 text-white" 
                : "bg-black/20 border-white/5 text-muted-500 hover:bg-black/30"
            )}
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold flex items-center gap-2">
                <Icon name="CreditCard" size={14} className={codEnabled ? "text-brand-400" : "text-muted-500"}  />
                Pago Contra Entrega (Efectivo)
              </span>
              <p className={clsx(
                "text-[10px] leading-normal",
                codEnabled ? "text-brand-100/60" : "text-muted-500/60"
              )}>
                El comprador paga el valor correspondiente en efectivo directamente a la transportadora al recibir su paquete.
              </p>
            </div>
            
            <div className={clsx(
              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-colors shrink-0",
              codEnabled ? "bg-brand-500/20 border-brand-500/30 text-brand-400" : "bg-white/5 border-white/10 text-muted-500"
            )}>
              {codEnabled ? 'Activo' : 'Inactivo'}
            </div>
          </div>

          {/* Transferencia Bancaria */}
          <div className="flex flex-col gap-4 bg-black/20 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
            <div 
              onClick={() => setBankTransferEnabled(!bankTransferEnabled)}
              className="flex items-start justify-between gap-4 cursor-pointer"
            >
              <div className="flex flex-col gap-1">
                <span className={clsx(
                  "text-xs font-bold flex items-center gap-2",
                  bankTransferEnabled ? "text-white" : "text-muted-500"
                )}>
                  <Icon name="CreditCard" size={14} className={bankTransferEnabled ? "text-brand-400" : "text-muted-500"}  />
                  Transferencia Bancaria Directa
                </span>
                <p className={clsx(
                  "text-[10px] leading-normal",
                  bankTransferEnabled ? "text-brand-100/60" : "text-muted-500/60"
                )}>
                  Muestra las instrucciones y tus números de cuenta (Nequi, Bancolombia, etc.) antes de finalizar el pedido.
                </p>
              </div>
              
              <div className={clsx(
                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-colors shrink-0",
                bankTransferEnabled ? "bg-brand-500/20 border-brand-500/30 text-brand-400" : "bg-white/5 border-white/10 text-muted-500"
              )}>
                {bankTransferEnabled ? 'Activo' : 'Inactivo'}
              </div>
            </div>

            <AnimatePresence initial={false}>
              {bankTransferEnabled && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden flex flex-col gap-2 pt-2 border-t border-white/5"
                >
                  <label className="text-[10px] text-muted-500 font-bold uppercase tracking-wider mb-1 block">Datos bancarios & Instrucciones</label>
                  <textarea
                    value={bankDetails}
                    onChange={(e) => setBankDetails(e.target.value)}
                    placeholder="Ej. Transferir a Nequi 3123456789 a nombre de Juan Pérez. Enviar comprobante..."
                    rows={3}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white resize-none focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="w-full sm:w-auto self-end mt-4 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-brand-400 disabled:opacity-50"
        >
          {saving ? <Icon name="RefreshCw" size={14} className="animate-spin"  /> : <Icon name="Save" size={14}  />}
          <span>Guardar Métodos</span>
        </button>
      </div>

      {/* Shipping Rules */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-2xl p-6 rounded-[2rem] flex flex-col gap-6 justify-between">
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold text-white">Logística & Envíos</h3>
            <p className="text-xs text-muted-400 mt-1">Configura las reglas de flete y montos de envío.</p>
          </div>

          <div className="w-full h-px bg-white/5" />

          <div className="flex flex-col gap-5">
            {/* Costo del envío */}
            <div>
              <label className="text-[10px] text-muted-500 font-bold uppercase tracking-wider mb-2 block">Costo de Envío Estándar</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-500">$</span>
                <input
                  type="number"
                  value={shippingFee || ''}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-8 pr-4 py-3 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <p className="text-[10px] text-muted-500 mt-1.5 leading-normal">Usa 0 para definir envío gratis a todos los pedidos.</p>
            </div>

            {/* Envío gratis por compras minimas */}
            <div>
              <label className="text-[10px] text-muted-500 font-bold uppercase tracking-wider mb-2 block">Umbral de Envío Gratis</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-500">$</span>
                <input
                  type="number"
                  value={freeShippingThreshold || ''}
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-8 pr-4 py-3 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <p className="text-[10px] text-muted-500 mt-1.5 leading-normal">Monto mínimo de compra para flete gratuito. Usa 0 para desactivar.</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="w-full sm:w-auto self-end mt-6 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-brand-400 disabled:opacity-50"
        >
          {saving ? <Icon name="RefreshCw" size={14} className="animate-spin"  /> : <Icon name="Save" size={14}  />}
          <span>Guardar Envíos</span>
        </button>
      </div>
    </motion.div>
  );
}

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
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Options (Image 2 List Toggle Style) */}
        <div className="bg-surface-800/80 border border-subtle backdrop-blur-2xl p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] flex flex-col gap-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-foreground dark:text-white">Métodos de Pago</h3>
            <p className="text-xs text-muted-400 mt-1">Opciones activas para los compradores en el checkout.</p>
          </div>

          <div className="w-full h-px bg-subtle" />

          <div className="flex flex-col divide-y divide-subtle">
            {/* Pago Contra Entrega (iOS Toggle Row) */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1 pr-2">
                <span className="text-xs font-bold text-foreground dark:text-white flex items-center gap-2">
                  <Icon name="Banknote" size={16} className="text-brand-500" />
                  Pago Contra Entrega (Efectivo)
                </span>
                <p className="text-[11px] text-muted-400 leading-normal">
                  El cliente paga el valor en efectivo a la transportadora al recibir su paquete.
                </p>
              </div>

              {/* iOS Style Toggle Switch (Image 2) */}
              <button
                type="button"
                role="switch"
                aria-checked={codEnabled}
                onClick={() => setCodEnabled(!codEnabled)}
                className={clsx(
                  "w-12 h-7 rounded-full p-1 transition-colors cursor-pointer shrink-0 border relative",
                  codEnabled
                    ? "bg-brand-600 border-brand-500"
                    : "bg-surface-700 border-subtle"
                )}
              >
                <div className={clsx(
                  "w-4 h-4 rounded-full bg-white shadow-md transform transition-transform",
                  codEnabled ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>

            {/* Transferencia Bancaria (iOS Toggle Row) */}
            <div className="py-4 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1 pr-2">
                  <span className="text-xs font-bold text-foreground dark:text-white flex items-center gap-2">
                    <Icon name="Building2" size={16} className="text-brand-500" />
                    Transferencia Bancaria Directa
                  </span>
                  <p className="text-[11px] text-muted-400 leading-normal">
                    Muestra datos bancarios (Nequi, Bancolombia) antes de finalizar la orden.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={bankTransferEnabled}
                  onClick={() => setBankTransferEnabled(!bankTransferEnabled)}
                  className={clsx(
                    "w-12 h-7 rounded-full p-1 transition-colors cursor-pointer shrink-0 border relative",
                    bankTransferEnabled
                      ? "bg-brand-600 border-brand-500"
                      : "bg-surface-700 border-subtle"
                  )}
                >
                  <div className={clsx(
                    "w-4 h-4 rounded-full bg-white shadow-md transform transition-transform",
                    bankTransferEnabled ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {bankTransferEnabled && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden flex flex-col gap-2 pt-2 border-t border-subtle"
                  >
                    <label className="text-[10px] text-muted-400 font-bold uppercase tracking-wider mb-1 block">Datos bancarios & Instrucciones</label>
                    <textarea
                      value={bankDetails}
                      onChange={(e) => setBankDetails(e.target.value)}
                      placeholder="Ej. Transferir a Nequi 3123456789 a nombre de tu negocio. Enviar comprobante..."
                      rows={3}
                      className="w-full bg-surface-900 border border-subtle rounded-2xl px-4 py-3 text-xs text-foreground focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Shipping Rules */}
        <div className="bg-surface-800/80 border border-subtle backdrop-blur-2xl p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] flex flex-col gap-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-foreground dark:text-white">Logística & Tarifas de Envío</h3>
            <p className="text-xs text-muted-400 mt-1">Configura las reglas de flete y promociones de envío gratis.</p>
          </div>

          <div className="w-full h-px bg-subtle" />

          <div className="flex flex-col gap-5">
            {/* Costo del envío */}
            <div>
              <label className="text-[10px] text-muted-400 font-bold uppercase tracking-wider mb-2 block">Costo de Envío Estándar</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-400">$</span>
                <input
                  type="number"
                  min="0"
                  value={shippingFee || ''}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-surface-900 border border-subtle rounded-2xl pl-8 pr-4 py-3 text-xs text-foreground focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <p className="text-[10px] text-muted-400 mt-1.5 leading-normal">Usa 0 para definir envío gratis universal a todos los pedidos.</p>
            </div>

            {/* Envío gratis por compras mínimas */}
            <div>
              <label className="text-[10px] text-muted-400 font-bold uppercase tracking-wider mb-2 block">Umbral de Envío Gratis (Monto Mínimo)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-400">$</span>
                <input
                  type="number"
                  min="0"
                  value={freeShippingThreshold || ''}
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-surface-900 border border-subtle rounded-2xl pl-8 pr-4 py-3 text-xs text-foreground focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <p className="text-[10px] text-muted-400 mt-1.5 leading-normal">Monto de compra para flete gratuito automático. Usa 0 para desactivar.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Bar (Image 2 Bottom Action Bar Style) */}
      <div className="bg-surface-800 border border-subtle rounded-full p-3 px-6 flex items-center justify-between shadow-lg sticky bottom-4 z-30">
        <span className="text-xs text-muted-400 font-medium hidden sm:block">
          Configuración comercial de Pagos y Logística
        </span>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-2.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Icon name="RefreshCw" size={14} className="animate-spin" /> : <Icon name="Check" size={14} />}
            <span>Guardar Ajustes</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

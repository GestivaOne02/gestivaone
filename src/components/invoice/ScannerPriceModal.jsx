import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ScanLine, Package, DollarSign, Save } from 'lucide-react'

export default function ScannerPriceModal({ barcode, suggestedName = '', onConfirm, onCancel }) {
  const [name, setName] = useState(suggestedName)
  const [price, setPrice] = useState('')
  const [saveToCache, setSaveToCache] = useState(true)
  const [nameError, setNameError] = useState(false)
  const [priceError, setPriceError] = useState(false)

  const shortCode = barcode ? barcode.slice(-6) : ''

  const handleConfirm = () => {
    let hasError = false
    if (!name.trim()) { setNameError(true); hasError = true }
    const numPrice = parseFloat(price.replace(',', '.'))
    if (isNaN(numPrice) || numPrice < 0) { setPriceError(true); hasError = true }
    if (hasError) return
    onConfirm({ barcode, name: name.trim(), price: numPrice, saveToCache })
  }

  return (
    <AnimatePresence>
      <motion.div
        key="scanner-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          key="scanner-modal"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="bg-surface-800 border border-subtle rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-5 py-4 border-b border-subtle bg-surface-750">
            <div className="w-9 h-9 rounded-xl bg-brand-500/15 flex items-center justify-center shrink-0">
              <ScanLine size={18} className="text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">Nuevo Producto Escaneado</p>
              <p className="text-[11px] text-muted-400 font-mono">Código: ...{shortCode}</p>
            </div>
            <button onClick={onCancel} className="p-1.5 rounded-lg text-muted-400 hover:text-foreground hover:bg-surface-600 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Package size={11} />
                Nombre del Producto
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(false) }}
                onKeyDown={(e) => e.key === 'Enter' && document.getElementById('scanner-price-input')?.focus()}
                placeholder="Ej: Leche entera 1L"
                autoFocus
                className={`w-full bg-surface-700 border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-500 outline-none transition-colors ${nameError ? 'border-danger-500 focus:border-danger-400' : 'border-subtle focus:border-brand-500'}`}
              />
              {nameError && <p className="text-[11px] text-danger-400 mt-1">El nombre es requerido</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-muted-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <DollarSign size={11} />
                Precio Unitario
              </label>
              <input
                id="scanner-price-input"
                type="number"
                min="0"
                step="any"
                value={price}
                onChange={(e) => { setPrice(e.target.value); setPriceError(false) }}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                placeholder="0.00"
                className={`w-full bg-surface-700 border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-500 outline-none transition-colors ${priceError ? 'border-danger-500 focus:border-danger-400' : 'border-subtle focus:border-brand-500'}`}
              />
              {priceError && <p className="text-[11px] text-danger-400 mt-1">Ingresa un precio válido (puede ser 0)</p>}
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div onClick={() => setSaveToCache(!saveToCache)} className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${saveToCache ? 'bg-brand-600' : 'bg-surface-600'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${saveToCache ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground group-hover:text-brand-300 transition-colors">Recordar para futuras sesiones</p>
                <p className="text-[10px] text-muted-400">El código se guardará con este nombre y precio</p>
              </div>
            </label>
          </div>

          <div className="flex gap-2 px-5 pb-5">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-muted-400 border border-subtle hover:bg-surface-700 transition-colors">Cancelar</button>
            <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition-colors flex items-center justify-center gap-1.5">
              <Save size={12} />Añadir a Factura
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

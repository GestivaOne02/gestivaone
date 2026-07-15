import { useCartStore } from '@/store/useCartStore'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export default function ExpenseFormWidget() {
  const expenseDetails = useCartStore((s) => s.expenseDetails)
  const updateExpenseDetails = useCartStore((s) => s.updateExpenseDetails)
  const [expanded, setExpanded] = useState(true)

  if (!expenseDetails) return null

  return (
    <div className="px-4 py-2 border-b border-danger-500/20 bg-danger-900/5 shrink-0">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-xs font-bold text-danger-500">Detalles del Egreso</span>
        <button className="text-danger-400 hover:text-danger-300 transition-colors">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-3 space-y-3"
          >
            <div>
              <label className="text-[10px] text-muted-400 mb-1 block">Categoría *</label>
              <select
                value={expenseDetails.category}
                onChange={e => updateExpenseDetails({ category: e.target.value })}
                className="w-full bg-surface-700 border border-danger-500/20 rounded-xl px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-danger-500/50 cursor-pointer"
              >
                <option value="Inventario/Mercancía">Inventario/Mercancía</option>
                <option value="Alquiler/Servicios">Alquiler/Servicios</option>
                <option value="Marketing/Publicidad">Marketing/Publicidad</option>
                <option value="Salarios/Nómina">Salarios/Nómina</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-400 mb-1 block">Descripción / Detalle</label>
              <textarea 
                value={expenseDetails.description}
                onChange={e => updateExpenseDetails({ description: e.target.value })}
                placeholder="Ej: Compra de cajas..."
                rows={1}
                className="w-full bg-surface-700 border border-danger-500/20 rounded-xl px-2 py-1.5 text-xs text-foreground placeholder:text-muted-500 focus:outline-none focus:border-danger-500/50 resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-400 mb-1 block">Nombre del Proveedor</label>
              <input 
                type="text"
                value={expenseDetails.provider_name}
                onChange={e => updateExpenseDetails({ provider_name: e.target.value })}
                placeholder="Ej: Distribuidora XYZ"
                className="w-full bg-surface-700 border border-danger-500/20 rounded-xl px-2 py-1.5 text-xs text-foreground placeholder:text-muted-500 focus:outline-none focus:border-danger-500/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-400 mb-1 block">Tipo Doc. Proveedor</label>
                <select
                  value={expenseDetails.provider_doc_type}
                  onChange={e => updateExpenseDetails({ provider_doc_type: e.target.value })}
                  className="w-full bg-surface-700 border border-danger-500/20 rounded-xl px-2 py-1.5 text-[10px] text-foreground focus:outline-none focus:border-danger-500/50 cursor-pointer"
                >
                  <option value="31">NIT</option>
                  <option value="13">Cédula</option>
                  <option value="22">C.E.</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-400 mb-1 block">Doc. Proveedor</label>
                <input 
                  type="text"
                  value={expenseDetails.provider_doc_id}
                  onChange={e => updateExpenseDetails({ provider_doc_id: e.target.value })}
                  placeholder="Ej: 900123456"
                  className="w-full bg-surface-700 border border-danger-500/20 rounded-xl px-2 py-1.5 text-[10px] text-foreground placeholder:text-muted-500 focus:outline-none focus:border-danger-500/50"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

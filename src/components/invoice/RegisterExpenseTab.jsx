import { useState } from 'react'
import { useExpenseStore } from '@/store/useExpenseStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { printExpense } from '@/services/printService'
import { Wallet, Save } from 'lucide-react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function RegisterExpenseTab({ onClose }) {
  const [loading, setLoading] = useState(false)
  const addExpense = useExpenseStore(s => s.addExpense)
  const user = useAuthStore(s => s.user)
  const printer = useSettingsStore(s => s.printer)

  const [form, setForm] = useState({
    amount: '',
    category: 'Inventario/Mercancía',
    description: '',
    provider_name: '',
    provider_doc_type: '31',
    provider_doc_id: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      return toast.error('Ingresa un monto válido')
    }

    setLoading(true)
    try {
      const res = await addExpense({
        ...form,
        amount: Number(form.amount),
        iva_paid: 0,
        pocketId: null
      })

      if (!res || res.success === false) {
        setLoading(false)
        return toast.error(res?.error || 'Error al registrar egreso')
      }

      if (printer?.autoPrint) {
        printExpense(res.data, [], null, {
          ...printer,
          companyName: user?.companyName || 'GestivaOne',
          companyLogo: user?.companyLogo || null
        })
      }

      toast.success('Egreso registrado correctamente')
      setForm({
        amount: '',
        category: 'Inventario/Mercancía',
        description: '',
        provider_name: '',
        provider_doc_type: '31',
        provider_doc_id: ''
      })
      if (onClose) onClose()
    } catch (err) {
      console.error(err)
      toast.error('Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-surface-800">
      <div className="max-w-md mx-auto space-y-6 pb-20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-danger-500/10 flex items-center justify-center shrink-0">
            <Wallet className="text-danger-500" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Registrar Egreso</h2>
            <p className="text-xs text-muted-400">Registro rápido de gastos y compras</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-400 mb-1.5 block">Monto Total *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-400">$</span>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="w-full bg-surface-700 border border-subtle rounded-xl pl-7 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-danger-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-400 mb-1.5 block">Categoría *</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full bg-surface-700 border border-subtle rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-danger-500 cursor-pointer"
            >
              <option value="Inventario/Mercancía">Inventario/Mercancía</option>
              <option value="Alquiler/Servicios">Alquiler/Servicios</option>
              <option value="Marketing/Publicidad">Marketing/Publicidad</option>
              <option value="Salarios/Nómina">Salarios/Nómina</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-400 mb-1.5 block">Descripción / Detalle</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-surface-700 border border-subtle rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-danger-500 min-h-[80px] resize-none"
              placeholder="Ej: Pago de recibo de luz..."
            />
          </div>

          <div className="pt-4 border-t border-subtle">
            <h3 className="text-xs font-semibold text-foreground mb-3">Datos del Proveedor (Opcional)</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-400 mb-1.5 block">Nombre del Proveedor</label>
                <input
                  type="text"
                  value={form.provider_name}
                  onChange={e => setForm({ ...form, provider_name: e.target.value })}
                  className="w-full bg-surface-700 border border-subtle rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-danger-500"
                  placeholder="Ej: Distribuidora S.A.S"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-400 mb-1.5 block">Tipo de Documento</label>
                  <select
                    value={form.provider_doc_type}
                    onChange={e => setForm({ ...form, provider_doc_type: e.target.value })}
                    className="w-full bg-surface-700 border border-subtle rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-danger-500 cursor-pointer"
                  >
                    <option value="31">NIT</option>
                    <option value="13">Cédula</option>
                    <option value="22">C.E.</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-400 mb-1.5 block">N° de Documento</label>
                  <input
                    type="text"
                    value={form.provider_doc_id}
                    onChange={e => setForm({ ...form, provider_doc_id: e.target.value })}
                    className="w-full bg-surface-700 border border-subtle rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-danger-500"
                    placeholder="Ej: 900123456"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button
              type="submit"
              variant="danger"
              className="w-full py-3"
              loading={loading}
              icon={Save}
            >
              Registrar Egreso
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

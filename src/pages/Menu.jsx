import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, Users, Edit2, Trash2, Check, ShoppingBag, History, CalendarDays } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import SearchBar from '@/components/ui/SearchBar'
import { useClientStore } from '@/store/useClientStore'
import { useUIStore } from '@/store/useUIStore'
import { useInvoiceStore } from '@/store/useInvoiceStore'
import { useCurrencyStore } from '@/store/useCurrencyStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function ClientCard({ client, selected, onSelect, onEdit, onDelete, onOpenHistory, format$, lastInvoice, pendingAmount, totalBilled, status }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -1 }}
      onClick={onSelect}
      className={clsx(
        'relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all group',
        selected
          ? 'border-brand-500 bg-brand-600/10'
          : 'border-subtle bg-surface-800 hover:border-surface-300'
      )}
    >
      {/* Avatar */}
      <div className={clsx(
        'w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shrink-0',
        selected ? 'bg-brand-600/40 text-brand-200' : 'bg-surface-600 text-white'
      )}>
        {client.name[0].toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white truncate">{client.name}</p>
          {selected && <Check size={12} className="text-brand-400 shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge status={status} />
          {pendingAmount > 0 && (
            <span className="text-[11px] text-danger-400 font-medium">{format$(pendingAmount)} pendiente</span>
          )}
        </div>
      </div>

      {/* Requested Visual Indicators (Green/Red) */}
      <div className="flex items-center gap-2 mr-2">
        <button
          onClick={(e) => { e.stopPropagation(); onOpenHistory() }}
          className="h-9 px-3 rounded-lg border border-success-500/30 bg-success-500/10 hover:bg-success-500/20 text-success-400 flex items-center justify-center gap-2 transition-colors shrink-0"
          title="Ver lista de facturas"
        >
          <History size={15} className="hidden sm:block opacity-70" />
          <div className="flex flex-col items-center sm:items-start justify-center">
            <span className="text-[9px] font-bold uppercase tracking-widest leading-none mb-0.5">Total Fra.</span>
            <span className="text-[11px] font-bold leading-none">{format$(totalBilled)}</span>
          </div>
        </button>
        {lastInvoice && (
          <div className="h-9 px-3 rounded-lg border border-danger-500/30 bg-danger-500/10 text-danger-400 flex items-center justify-center gap-2 shrink-0">
            <CalendarDays size={15} className="hidden sm:block" />
            <div className="flex flex-col items-center sm:items-start justify-center">
              <span className="text-[9px] font-bold uppercase tracking-widest leading-none mb-0.5">Última fra.</span>
              <span className="text-[11px] font-bold leading-none">{format(new Date(lastInvoice.created_at), "dd/MM/yyyy")}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          className="p-1.5 rounded-lg text-muted-400 hover:text-white hover:bg-surface-600"
        >
          <Edit2 size={13} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="p-1.5 rounded-lg text-muted-400 hover:text-danger-400 hover:bg-danger-900/30"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  )
}

export default function Menu() {
  const [search, setSearch]     = useState('')
  const clients       = useClientStore((s) => s.clients)
  const selectedId    = useClientStore((s) => s.selectedClientId)
  const selectClient  = useClientStore((s) => s.selectClient)
  const deleteClient  = useClientStore((s) => s.deleteClient)
  const getFrequent   = useClientStore((s) => s.getFrequent)
  const openModal     = useUIStore((s) => s.openModal)
  const invoices      = useInvoiceStore((s) => s.invoices)
  const format$       = useCurrencyStore((s) => s.format)

  const frequent = getFrequent()

  useEffect(() => {
    useClientStore.getState().fetchClients()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return frequent.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    )
  }, [frequent, search])

  const getClientStatus = (clientId) => {
    const clientInvoices = invoices.filter((i) => i.client_id === clientId)
    if (clientInvoices.some((i) => i.payment_status === 'overdue')) return 'overdue'
    if (clientInvoices.some((i) => i.payment_status === 'pending')) return 'pending'
    if (clientInvoices.length > 0) return 'paid'
    return 'default'
  }

  const getLastInvoice = (clientId) =>
    invoices.filter((i) => i.client_id === clientId).sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0] ?? null

  const getPending = (clientId) =>
    invoices
      .filter((i) => i.client_id === clientId && i.payment_status !== 'paid')
      .reduce((s, i) => {
        let paidAmount = 0
        if (i.note) {
          try {
            if (i.note.trim().startsWith('{') && i.note.trim().endsWith('}')) {
              const parsed = JSON.parse(i.note)
              if (parsed && parsed.payments) {
                paidAmount = parsed.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
              }
            }
          } catch (e) {}
        }
        return s + (i.total - paidAmount)
      }, 0)

  const getTotalBilled = (clientId) =>
    invoices
      .filter((i) => i.client_id === clientId)
      .reduce((s, i) => s + i.total, 0)

  const handleDelete = (client) => {
    deleteClient(client.id)
    toast.success(`${client.name} eliminado`)
  }

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Menú Operativo</h1>
        <p className="text-sm text-muted-400 mt-0.5">Selecciona o añade un cliente para iniciar</p>
      </div>

      {/* Top section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="primary"
            size="lg"
            icon={<UserPlus size={18} />}
            className="w-full justify-center"
            onClick={() => openModal('addClient')}
          >
            Añadir Cliente
          </Button>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="secondary"
            size="lg"
            icon={<ShoppingBag size={18} />}
            className="w-full justify-center"
            onClick={() => {
              // Express client: clear selection and proceed
              selectClient(null)
              toast('Modo express activado — sin cliente asignado', { icon: '⚡' })
            }}
          >
            Cliente Express
          </Button>
        </motion.div>
      </div>

      {/* Frequent clients */}
      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-brand-400" />
            <span className="text-sm font-semibold text-white">Clientes Frecuentes</span>
            <span className="text-xs text-muted-400 bg-surface-600 px-2 py-0.5 rounded-full">{frequent.length}</span>
          </div>
        </div>

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar cliente por nombre, correo o teléfono..."
        />

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Users size={32} className="text-muted-400 mx-auto mb-3" />
                <p className="text-sm text-muted-400">
                  {search ? 'Sin resultados para tu búsqueda' : 'Aún no tienes clientes frecuentes'}
                </p>
              </motion.div>
            ) : (
              filtered.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  selected={selectedId === client.id}
                  onSelect={() => selectClient(client.id)}
                  onEdit={() => openModal('addClient', { client })}
                  onDelete={() => handleDelete(client)}
                  onOpenHistory={() => openModal('clientHistory', { client })}
                  format$={format$}
                  lastInvoice={getLastInvoice(client.id)}
                  pendingAmount={getPending(client.id)}
                  totalBilled={getTotalBilled(client.id)}
                  status={getClientStatus(client.id)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

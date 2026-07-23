import { useMemo, useState } from 'react'

import Modal from '@/components/ui/Modal'
import { useInvoiceStore } from '@/store/useInvoiceStore'
import { useCurrencyStore } from '@/store/useCurrencyStore'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import Icon from '@/components/ui/Icon';

// Helper for parsing note structured abonos
export function parseInvoiceNote(note) {
  if (!note) return { text: '', payments: [], paidAmount: 0 }
  try {
    if (note.trim().startsWith('{') && note.trim().endsWith('}')) {
      const parsed = JSON.parse(note)
      if (parsed && (parsed.payments || parsed.notes !== undefined)) {
        const payments = parsed.payments || []
        const paidAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
        return {
          text: parsed.notes || '',
          payments,
          paidAmount
        }
      }
    }
  } catch (e) {
    // Ignore and treat as plain text
  }
  return { text: note, payments: [], paidAmount: 0 }
}

function StatusBadge({ status }) {
  const cfg = {
    paid:    { label: 'Pagada',    color: 'bg-success-500/10 text-success-400 border-success-500/20', icon: CheckCircle },
    pending: { label: 'Pendiente', color: 'bg-warning-500/10 text-warning-400 border-warning-500/20', icon: Clock },
    overdue: { label: 'Atrasada',  color: 'bg-danger-500/10  text-danger-400  border-danger-500/20',  icon: AlertTriangle },
  }[status] || { label: 'Desconocido', color: 'bg-surface-600 text-muted-400 border-subtle', icon: FileText }

  const Icon = cfg.icon

  return (
    <div className={clsx('flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-bold uppercase tracking-wider', cfg.color)}>
      <Icon size={12} />
      {cfg.label}
    </div>
  )
}

function InvoiceItemCard({ inv, format$, client }) {
  const registerAbono = useInvoiceStore((s) => s.registerAbono)
  const [showAbonoForm, setShowAbonoForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [amount, setAmount] = useState('')
  const [ref, setRef] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { text: noteText, payments, paidAmount } = parseInvoiceNote(inv.note)
  const remaining = Math.max(0, inv.total - paidAmount)

  const handleWhatsAppShare = () => {
    const user = useAuthStore.getState().user
    const companyName = user?.companyName || 'Mi Empresa'
    const clientName = client?.name || 'Cliente'
    const clientPhone = client?.phone || ''
    
    let text = ''
    if (inv.payment_status === 'paid') {
      text = `Hola *${clientName}*, te saluda *${companyName}*. \n\nConfirmamos que tu *Factura #${inv.id.slice(0, 8)}* por un total de *${format$(inv.total)}* ha sido *PAGADA* con éxito. ¡Muchas gracias por tu confianza! 🌟`
    } else {
      text = `Hola *${clientName}*, te saluda *${companyName}*. \n\nTe compartimos el estado de cuenta de tu *Factura #${inv.id.slice(0, 8)}*:\n• Total Factura: *${format$(inv.total)}*\n• Total Abonado: *${format$(paidAmount)}*\n• *Saldo Pendiente: ${format$(remaining)}*\n\nPuedes realizar tus abonos o el pago del saldo a través de nuestros canales habituales. ¡Muchas gracias! 🙏`
    }

    // Attachments logic
    try {
      const itemsList = typeof inv.items === 'string' ? JSON.parse(inv.items) : (inv.items || [])
      const attachments = itemsList.filter(item => item.attachment_url && item.attachment_url.trim() !== '')
      if (attachments.length > 0) {
        text += `\n\n📄 *Archivos Adjuntos:*`
        attachments.forEach(att => {
          text += `\n• ${att.attachment_name || 'Documento'}: ${att.attachment_url}`
        })
      }
    } catch (e) {}
    
    const cleanPhone = clientPhone.replace(/[^0-9]/g, '')
    const formattedPhone = cleanPhone.length === 10 ? `57${cleanPhone}` : cleanPhone
    
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const handleEmailShare = async () => {
    let emailTarget = client?.email || ''
    if (!emailTarget || emailTarget.trim() === '') {
      const input = prompt('Este cliente no tiene correo registrado. Ingresa el correo de destino:', '')
      if (input === null) return
      if (!input.includes('@')) {
        toast.error('Correo no válido')
        return
      }
      emailTarget = input.trim()
    }

    const toastId = toast.loading('Enviando factura por correo...')
    
    try {
      const { sendInvoiceEmail } = await import('@/services/emailService')
      const user = useAuthStore.getState().user
      const company = {
        companyName: user?.companyName || 'GestivaOne',
        companyLogo: user?.companyLogo || null,
        companyEmail: user?.email || '',
        companyPhone: user?.phone || ''
      }
      
      const res = await sendInvoiceEmail(inv, emailTarget, company)
      if (res.success) {
        toast.success('📧 Factura enviada por correo con éxito!', { id: toastId })
      } else {
        toast.error(`Error: ${res.error || 'No se pudo enviar'}`, { id: toastId })
      }
    } catch (e) {
      console.error(e)
      toast.error('Error al iniciar el servicio de correo', { id: toastId })
    }
  }

  const handleAbonoSubmit = async (e) => {
    e.preventDefault()
    const val = Number(amount)
    if (!val || val <= 0) {
      return toast.error('Ingresa un monto válido mayor a 0')
    }
    if (val > remaining) {
      return toast.error(`El abono no puede superar el saldo pendiente de ${format$(remaining)}`)
    }

    setSubmitting(true)
    const res = await registerAbono(inv.id, val, ref.trim())
    setSubmitting(false)

    if (res.success) {
      toast.success('Abono registrado con éxito')
      setAmount('')
      setRef('')
      setShowAbonoForm(false)
    } else {
      toast.error(res.error || 'Error al registrar abono')
    }
  }

  return (
    <div className="bg-surface-800 border border-subtle rounded-xl p-4 hover:border-surface-400 transition-all duration-300">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="text-sm font-bold text-foreground mb-1">Factura #{inv.id.slice(0, 8)}</h4>
          <p className="text-xs text-muted-400">
            {format(new Date(inv.created_at), "d 'de' MMMM, yyyy - HH:mm", { locale: es })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={inv.payment_status} />
          {noteText && <span className="text-xs text-muted-400 max-w-[180px] truncate" title={noteText}>Nota: {noteText}</span>}
        </div>
      </div>

      {/* Debt details if unpaid */}
      {inv.payment_status !== 'paid' && (
        <div className="mt-2.5 p-2.5 rounded-lg bg-surface-700/20 border border-subtle flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between text-muted-400">
            <span>Total Factura:</span>
            <span className="font-semibold text-foreground">{format$(inv.total)}</span>
          </div>
          <div className="flex justify-between text-muted-400">
            <span>Abonado:</span>
            <span className="font-semibold text-success-400">{format$(paidAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-subtle pt-1.5 font-bold">
            <span className="text-muted-200">Saldo Pendiente:</span>
            <span className="text-danger-400">{format$(remaining)}</span>
          </div>
        </div>
      )}

      {/* Payments History Toggle */}
      {payments.length > 0 && (
        <div className="mt-2 text-xs">
          <button 
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="text-brand-400 hover:text-brand-300 flex items-center gap-1 font-semibold"
          >
            {showHistory ? <Icon name="ChevronUp" size={12}  /> : <Icon name="ChevronDown" size={12}  />}
            <span>Ver historial de abonos ({payments.length})</span>
          </button>
          {showHistory && (
            <div className="mt-1.5 pl-3 border-l-2 border-subtle space-y-1.5 py-1">
              {payments.map((p, idx) => (
                <div key={idx} className="flex justify-between text-xs text-muted-400">
                  <div className="flex flex-col">
                    <span className="font-semibold text-muted-300">{p.reference || 'Abono'}</span>
                    <span>{format(new Date(p.date), "dd/MM/yyyy - HH:mm")}</span>
                  </div>
                  <span className="font-bold text-success-400">+{format$(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action panel */}
      <div className="flex items-center justify-between pt-3 border-t border-subtle mt-3">
        <div className="flex items-center gap-1.5 text-muted-400">
          <Icon name="Package" size={14}  />
          <span className="text-xs">{inv.items?.length || 0} artículos</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            title={inv.payment_status === 'paid' ? "Compartir Factura por WhatsApp" : "Enviar Recordatorio por WhatsApp"}
            className="p-1.5 rounded-lg text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors flex items-center justify-center gap-1 text-xs font-bold"
          >
            <Icon name="MessageSquare" size={12}  />
            <span>{inv.payment_status === 'paid' ? 'Compartir' : 'Recordar'}</span>
          </button>
          <button
            type="button"
            onClick={handleEmailShare}
            title="Enviar factura por correo electrónico"
            className="p-1.5 rounded-lg text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 transition-colors flex items-center justify-center gap-1 text-xs font-bold"
          >
            <Icon name="Mail" size={12}  />
            <span>Correo</span>
          </button>
          {inv.payment_status !== 'paid' && (
            <button
              onClick={() => setShowAbonoForm(!showAbonoForm)}
              className="text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg border border-amber-500/20 flex items-center gap-1.5 transition-colors"
            >
              <Icon name="Coins" size={12}  />
              Abonar
            </button>
          )}
          <span className="text-sm font-bold text-foreground">{format$(inv.total)}</span>
        </div>
      </div>

      {/* Inline Abono Form */}
      {showAbonoForm && (
        <form onSubmit={handleAbonoSubmit} className="mt-4 p-3 rounded-xl bg-surface-700/60 border border-amber-500/30 space-y-2.5 animate-slide-up">
          <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
            <Icon name="Coins" size={12}  />
            <span>Registrar Abono a Factura #{inv.id.slice(0, 8)}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-400 uppercase font-bold tracking-wider block mb-1">Monto del abono</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Máx ${remaining}`}
                max={remaining}
                min={1}
                className="w-full bg-surface-800 border border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-400 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-400 uppercase font-bold tracking-wider block mb-1">Referencia (Ej: Nequi, PSE)</label>
              <input
                type="text"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="Nequi, Efectivo..."
                className="w-full bg-surface-800 border border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-400 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAbonoForm(false)}
              className="text-xs font-semibold text-muted-400 hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-surface-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="text-xs font-bold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              {submitting ? <Icon name="Loader2" size={12} className="animate-spin"  /> : <Icon name="Check" size={12}  />}
              Confirmar Abono
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function ClientHistoryModal({ open }) {
  const closeModal    = useUIStore((s) => s.closeModal)
  const client        = useUIStore((s) => s.editingClient)
  const invoices      = useInvoiceStore((s) => s.invoices)
  const format$       = useCurrencyStore((s) => s.format)

  const clientInvoices = useMemo(() => {
    if (!client) return []
    return invoices
      .filter((i) => i.client_id === client.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [invoices, client])

  if (!client) return null

  // Calculate sum using parseInvoiceNote for partial payments!
  const totalSpent = clientInvoices.reduce((s, i) => {
    if (i.payment_status === 'paid') return s + i.total
    const { paidAmount } = parseInvoiceNote(i.note)
    return s + paidAmount
  }, 0)

  const totalDebt = clientInvoices
    .filter(i => i.payment_status !== 'paid')
    .reduce((s, i) => {
      const { paidAmount } = parseInvoiceNote(i.note)
      return s + (i.total - paidAmount)
    }, 0)

  return (
    <Modal open={open} onClose={closeModal} title={`Historial: ${client.name}`} size="md">
      <div className="space-y-4">
        {/* Summary Header */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-surface-700/30 border border-subtle rounded-xl p-3">
            <p className="text-xs text-muted-400 font-bold uppercase tracking-widest mb-1">Total Pagado</p>
            <p className="text-lg font-bold text-success-400">{format$(totalSpent)}</p>
          </div>
          <div className="bg-surface-700/30 border border-subtle rounded-xl p-3">
            <p className="text-xs text-muted-400 font-bold uppercase tracking-widest mb-1">Deuda Pendiente</p>
            <p className="text-lg font-bold text-danger-400">{format$(totalDebt)}</p>
          </div>
        </div>

        {/* Invoice List */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {clientInvoices.length === 0 ? (
            <div className="text-center py-10">
              <Icon name="FileText" size={32} className="text-muted-500 mx-auto mb-3"  />
              <p className="text-sm text-muted-400">Este cliente aún no tiene facturas registradas.</p>
            </div>
          ) : (
            clientInvoices.map((inv) => (
              <InvoiceItemCard key={inv.id} inv={inv} format$={format$} client={client} />
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}

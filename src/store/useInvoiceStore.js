import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './useAuthStore'
import { useProductStore } from './useProductStore'
import { isAfter, parseISO, differenceInDays } from 'date-fns'

export const useInvoiceStore = create((set, get) => ({
  invoices: [],
  loading: false,

  invoicesFetched: false,

  fetchInvoices: async (force = false) => {
    const { invoicesFetched } = get()
    const { user } = useAuthStore.getState()
    if (!user?.companyId || (invoicesFetched && !force)) return
    
    set({ loading: true })
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', user.companyId)
      .order('created_at', { ascending: false })

    if (!error) set({ invoices: data || [], invoicesFetched: true })
    set({ loading: false })
  },

  createInvoice: async ({ client, items, subtotal, total, paymentType, scheduledDate, note }) => {
    const { user } = useAuthStore.getState()
    if (!user) return

    // Prevent blank invoices
    if (!items || items.length === 0 || total <= 0) {
      console.error("Cannot create invoice: items list is empty or total is zero.")
      return null
    }

    const now = new Date()
    const invoiceId = `INV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    const newInvoice = {
      id: invoiceId,
      company_id: user.companyId,
      client_id: client?.id ?? null,
      client_name: client?.name ?? 'Cliente Express',
      items: items.map((i) => ({ ...i })),
      subtotal,
      total,
      payment_type: paymentType,
      scheduled_date: scheduledDate ?? null,
      payment_status: paymentType === 'immediate' ? 'paid' : 'pending',
      paid_at: paymentType === 'immediate' ? now.toISOString() : null,
      note: note ?? '',
      created_at: now.toISOString(),
    }

    const { data: saved, error } = await supabase
      .from('invoices')
      .insert([newInvoice])
      .select()
      .single()

    if (!error) {
      set((s) => ({ invoices: [saved, ...s.invoices] }))

      const { products, updateProduct } = useProductStore.getState()
      items.forEach(async (item) => {
        if (!item.productId) return
        const product = products.find((p) => p.id === item.productId)
        if (product && typeof product.stock === 'number') {
          const newStock = Math.max(0, product.stock - item.qty)
          await updateProduct(item.productId, { stock: newStock })
        }
      })

      return saved
    }
  },

  markPaid: async (id) => {
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('invoices')
      .update({ payment_status: 'paid', paid_at: now })
      .eq('id', id)

    if (!error) {
      set((s) => ({
        invoices: s.invoices.map((inv) =>
          inv.id === id ? { ...inv, payment_status: 'paid', paid_at: now } : inv
        ),
      }))
    }
  },

  registerAbono: async (invoiceId, abonoAmount, reference = '') => {
    const inv = get().invoices.find(i => i.id === invoiceId)
    if (!inv) return { success: false, error: 'Factura no encontrada' }

    let noteData = { notes: '', payments: [] }
    if (inv.note) {
      try {
        if (inv.note.trim().startsWith('{') && inv.note.trim().endsWith('}')) {
          const parsed = JSON.parse(inv.note)
          if (parsed && (parsed.payments || parsed.notes !== undefined)) {
            noteData = {
              notes: parsed.notes || '',
              payments: parsed.payments || []
            }
          }
        } else {
          noteData.notes = inv.note
        }
      } catch (e) {
        noteData.notes = inv.note
      }
    }

    const newPayment = {
      amount: Number(abonoAmount),
      date: new Date().toISOString(),
      reference: reference || 'Abono registrado'
    }
    const updatedPayments = [...noteData.payments, newPayment]
    const totalPaidSoFar = updatedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

    let newStatus = inv.payment_status
    let paidAt = inv.paid_at
    if (totalPaidSoFar >= inv.total) {
      newStatus = 'paid'
      paidAt = new Date().toISOString()
    }

    const updatedNote = JSON.stringify({
      notes: noteData.notes,
      payments: updatedPayments
    })

    const { error } = await supabase
      .from('invoices')
      .update({ 
        note: updatedNote,
        payment_status: newStatus,
        paid_at: paidAt
      })
      .eq('id', invoiceId)

    if (!error) {
      set((s) => ({
        invoices: s.invoices.map((i) => 
          i.id === invoiceId 
            ? { ...i, note: updatedNote, payment_status: newStatus, paid_at: paidAt }
            : i
        )
      }))
      return { success: true }
    } else {
      return { success: false, error: error.message }
    }
  },

  deleteInvoice: async (id) => {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (!error) {
      set((s) => ({ invoices: s.invoices.filter((inv) => inv.id !== id) }))
    }
  },

  checkOverdue: () => {
    const now = new Date()
    set((s) => ({
      invoices: s.invoices.map((inv) => {
        if (inv.payment_status !== 'pending') return inv
        if (inv.payment_type === 'scheduled' && inv.scheduled_date) {
          const due = parseISO(inv.scheduled_date)
          if (isAfter(now, due)) return { ...inv, payment_status: 'overdue' }
        }
        return inv
      }),
    }))
  },

  // Selectors
  getPending: () => get().invoices.filter((i) => i.payment_status === 'pending'),
  getOverdue: () => get().invoices.filter((i) => i.payment_status === 'overdue'),
  getPaid:    () => get().invoices.filter((i) => i.payment_status === 'paid'),

  getByClient: (clientId) =>
    get().invoices.filter((i) => i.client_id === clientId),

  getOverdueDays: (inv) => {
    if (!inv.scheduled_date) return 0
    return Math.max(0, differenceInDays(new Date(), parseISO(inv.scheduled_date)))
  },

  getTotalRevenue: () =>
    get().invoices.filter((i) => i.payment_status === 'paid').reduce((s, i) => s + (i.total || 0), 0),

  getPendingRevenue: () =>
    get().invoices.filter((i) => i.payment_status !== 'paid').reduce((s, i) => s + (i.total || 0), 0),

  getMonthlyRevenue: () => {
    const months = {}
    get().invoices
      .filter((i) => i.payment_status === 'paid')
      .forEach((inv) => {
        const key = inv.created_at.slice(0, 7) // "YYYY-MM"
        months[key] = (months[key] ?? 0) + (inv.total || 0)
      })
    return months
  },
}))


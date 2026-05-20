import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './useAuthStore'
import { useProductStore } from './useProductStore'
import { useInvoiceStore } from './useInvoiceStore'
import { parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,

  fetchNotifications: async () => {
    const { user } = useAuthStore.getState()
    if (!user?.companyId) return
    
    set({ loading: true })
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('company_id', user.companyId)
      .order('created_at', { ascending: false })

    if (!error) {
      set({ notifications: data || [] })
    } else {
      console.error('❌ Error fetching notifications:', error)
    }
    set({ loading: false })
  },

  // Synchronize dynamic inventory and invoice alerts to database
  syncNotifications: async () => {
    const { user } = useAuthStore.getState()
    if (!user?.companyId) return

    // 1. Fetch current database notifications
    const { data: dbNotifs, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('company_id', user.companyId)

    if (error) {
      console.error('❌ Error fetching notifications for sync:', error)
      return
    }

    const currentDbNotifs = dbNotifs || []
    
    // 2. Generate current active alerts based on state
    const { products } = useProductStore.getState()
    const { invoices } = useInvoiceStore.getState()
    
    const activeAlerts = []

    // A. Stock alerts
    const companyProducts = products.filter(p => p.company_id === user.companyId)
    companyProducts.forEach((p) => {
      if (p.stock !== null && p.stock !== undefined) {
        if (Number(p.stock) === 0) {
          activeAlerts.push({
            type: 'danger',
            category: 'Inventario',
            title: 'Producto Agotado',
            message: `El producto "${p.name}" se encuentra sin inventario disponible.`
          })
        } else if (Number(p.stock) <= (p.minStock || 5)) {
          activeAlerts.push({
            type: 'warning',
            category: 'Inventario',
            title: 'Stock Crítico',
            message: `Quedan solo ${p.stock} unidades de "${p.name}" en stock.`
          })
        }
      }
    })

    // B. Invoice alerts
    const companyInvoices = invoices.filter(inv => inv.company_id === user.companyId)
    companyInvoices.forEach((inv) => {
      if (inv.payment_status === 'overdue') {
        const formattedTotal = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(inv.total)
        activeAlerts.push({
          type: 'danger',
          category: 'Cobros',
          title: 'Factura Vencida',
          message: `La factura #${inv.id.slice(-8).toUpperCase()} de "${inv.client_name}" por ${formattedTotal} está vencida.`
        })
      } else if (inv.payment_status === 'pending') {
        const formattedTotal = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(inv.total)
        const dueDateStr = inv.scheduled_date 
          ? format(parseISO(inv.scheduled_date), "dd 'de' MMMM", { locale: es })
          : 'próximamente'
        activeAlerts.push({
          type: 'warning',
          category: 'Cobros',
          title: 'Factura Pendiente',
          message: `La factura #${inv.id.slice(-8).toUpperCase()} de "${inv.client_name}" por ${formattedTotal} vence el ${dueDateStr}.`
        })
      } else if (inv.client_name === 'Cliente Express' && (new Date() - new Date(inv.created_at)) < 86400000 * 3) {
        const formattedTotal = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(inv.total)
        activeAlerts.push({
          type: 'success',
          category: 'Ventas',
          title: 'Factura Express Registrada',
          message: `Venta rápida realizada con éxito por ${formattedTotal} en modo express.`
        })
      }
    })

    // C. Default announcement if missing
    activeAlerts.push({
      type: 'info',
      category: 'Sistema',
      title: 'Próxima Actualización',
      message: 'Estamos preparando integraciones de facturación electrónica directa para optimizar tus obligaciones fiscales en un clic.'
    })

    // 3. Filter DB notifications that are no longer active
    // We only clean up auto-generated alerts (Inventario, Cobros, Ventas)
    const toDelete = currentDbNotifs.filter(dbN => {
      if (!['Inventario', 'Cobros', 'Ventas'].includes(dbN.category)) return false
      // Find if there is a matching alert still active
      return !activeAlerts.some(act => act.title === dbN.title && act.message === dbN.message)
    })

    if (toDelete.length > 0) {
      const idsToDelete = toDelete.map(d => d.id)
      await supabase
        .from('notifications')
        .delete()
        .in('id', idsToDelete)
    }

    // 4. Insert active alerts that are not yet in the DB
    const toInsert = activeAlerts.filter(act => {
      return !currentDbNotifs.some(dbN => dbN.title === act.title && dbN.message === act.message)
    }).map(act => ({
      company_id: user.companyId,
      user_id: user.id,
      type: act.type,
      category: act.category,
      title: act.title,
      message: act.message,
      read: false
    }))

    if (toInsert.length > 0) {
      await supabase
        .from('notifications')
        .insert(toInsert)
    }

    // 5. Final fetch to refresh state
    await get().fetchNotifications()
  },

  // Mark a single notification as read in DB
  markAsRead: async (id) => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }))

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    if (error) {
      console.error('❌ Error marking notification as read:', error)
      // Rollback
      get().fetchNotifications()
    }
  },

  // Mark multiple notifications as read in DB
  markAllAsRead: async (ids) => {
    if (!ids || ids.length === 0) return

    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map(n => ids.includes(n.id) ? { ...n, read: true } : n)
    }))

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', ids)

    if (error) {
      console.error('❌ Error marking all notifications as read:', error)
      get().fetchNotifications()
    }
  },

  // Delete a single notification from DB
  deleteNotification: async (id) => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }))

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Error deleting notification:', error)
      get().fetchNotifications()
    }
  },

  // Reset read status (mark all as unread or clear read ones)
  clearReadNotifications: async () => {
    const { user } = useAuthStore.getState()
    if (!user?.companyId) return

    // Delete read notifications from DB
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('company_id', user.companyId)
      .eq('read', true)

    if (error) {
      console.error('❌ Error clearing read notifications:', error)
    }
    await get().fetchNotifications()
  },

  getNotifications: () => {
    return get().notifications
  },

  getUnreadCount: () => {
    return get().notifications.filter(n => !n.read).length
  }
}))

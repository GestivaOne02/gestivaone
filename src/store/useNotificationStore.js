import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useProductStore } from './useProductStore'
import { useInvoiceStore } from './useInvoiceStore'
import { parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      readIds: [], // array of notification hashes/IDs that the user has marked as read

      // Mark a single notification as read
      markAsRead: (id) => {
        set((state) => {
          if (state.readIds.includes(id)) return state
          return { readIds: [...state.readIds, id] }
        })
      },

      // Mark all notifications as read
      markAllAsRead: (allIds) => {
        set((state) => {
          const newReadIds = Array.from(new Set([...state.readIds, ...allIds]))
          return { readIds: newReadIds }
        })
      },

      // Reset read status (optional debug/refresh)
      clearReadNotifications: () => {
        set({ readIds: [] })
      },

      // Dynamic selectors to generate notifications based on live app state
      getNotifications: () => {
        const { products } = useProductStore.getState()
        const { invoices } = useInvoiceStore.getState()
        const { readIds } = get()

        const list = []

        // 1. Stock Alerts
        products.forEach((p) => {
          if (p.stock !== null && p.stock !== undefined) {
            if (p.stock === 0) {
              list.push({
                id: `stock-out-${p.id}`,
                type: 'danger', // danger, warning, info, success
                title: 'Producto Agotado',
                message: `El producto "${p.name}" se encuentra sin inventario disponible.`,
                category: 'Inventario',
                date: new Date().toISOString(), // visual sorting
              })
            } else if (p.stock <= 5) {
              list.push({
                id: `stock-low-${p.id}`,
                type: 'warning',
                title: 'Stock Crítico',
                message: `Quedan solo ${p.stock} unidades de "${p.name}" en stock.`,
                category: 'Inventario',
                date: new Date().toISOString(),
              })
            }
          }
        })

        // 2. Invoice Alerts
        invoices.forEach((inv) => {
          if (inv.payment_status === 'overdue') {
            const formattedTotal = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(inv.total)
            list.push({
              id: `invoice-overdue-${inv.id}`,
              type: 'danger',
              title: 'Factura Vencida',
              message: `La factura ${inv.id} de "${inv.client_name}" por ${formattedTotal} está vencida.`,
              category: 'Cobros',
              date: inv.scheduled_date || inv.created_at,
            })
          } else if (inv.payment_status === 'pending') {
            const formattedTotal = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(inv.total)
            const dueDateStr = inv.scheduled_date 
              ? format(parseISO(inv.scheduled_date), "dd 'de' MMMM", { locale: es })
              : 'próximamente'
            list.push({
              id: `invoice-pending-${inv.id}`,
              type: 'warning',
              title: 'Factura Pendiente',
              message: `La factura ${inv.id} de "${inv.client_name}" por ${formattedTotal} vence el ${dueDateStr}.`,
              category: 'Cobros',
              date: inv.created_at,
            })
          } else if (inv.client_name === 'Cliente Express' && (new Date() - new Date(inv.created_at)) < 86400000 * 3) {
            // Express invoice recorded in last 3 days
            const formattedTotal = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(inv.total)
            list.push({
              id: `invoice-express-${inv.id}`,
              type: 'success',
              title: 'Factura Express Registrada',
              message: `Venta rápida realizada con éxito por ${formattedTotal} en modo express.`,
              category: 'Ventas',
              date: inv.created_at,
            })
          }
        })

        // 3. System announcements
        list.push({
          id: 'sys-ann-dian',
          type: 'info',
          title: 'Próxima Actualización',
          message: 'Estamos preparando integraciones de facturación electrónica directa para optimizar tus obligaciones fiscales en un clic.',
          category: 'Sistema',
          date: '2026-05-18T12:00:00.000Z',
        })

        // Add 'read' parameter to each notification
        return list.map((item) => ({
          ...item,
          read: readIds.includes(item.id),
        })).sort((a, b) => new Date(b.date) - new Date(a.date)) // newest first
      },

      // Get count of unread notifications
      getUnreadCount: () => {
        const notifications = get().getNotifications()
        return notifications.filter((n) => !n.read).length
      },
    }),
    {
      name: 'gestiva-notifications',
      partialize: (s) => ({
        readIds: s.readIds,
      }),
    }
  )
)

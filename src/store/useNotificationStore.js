import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './useAuthStore'
import { useProductStore } from './useProductStore'
import { useInvoiceStore } from './useInvoiceStore'
import { idbStorage } from '@/lib/idbStorage'
import { parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'

const STALE_TIME = 1000 * 60 * 5 // 5 minutos

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],
      loading: false,
      lastFetch: 0,

      fetchNotifications: async (force = false) => {
        const { lastFetch } = get()
        const { user } = useAuthStore.getState()
        if (!user?.companyId) return
        
        const isStale = Date.now() - lastFetch > STALE_TIME
        if (!isStale && !force) return
    
    set({ loading: true })
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('company_id', user.companyId)
      .order('created_at', { ascending: false })

    if (!error) {
      set({ notifications: data || [], lastFetch: Date.now() })
    } else {
      console.error('❌ Error fetching notifications:', error)
    }
    set({ loading: false })
  },

  // Synchronize dynamic inventory and invoice alerts to database
  // Synchronize dynamic inventory and invoice alerts to database (deprecated / no-op)
  syncNotifications: async () => {
    // Avoid dynamic synchronization lag, notifications are now persistent and event-based.
    await get().fetchNotifications()
  },

  addNotification: async ({ title, message, category, type }) => {
    const { user } = useAuthStore.getState()
    if (!user?.companyId) return null

    const newNotif = {
      company_id: user.companyId,
      user_id: user.id || null,
      type: type || 'info',
      category: category || 'Sistema',
      title,
      message,
      read: false
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([newNotif])
      .select()
      .single()

    if (!error && data) {
      set((state) => ({
        notifications: [data, ...state.notifications]
      }))
      
      // Native desktop notification trigger
      try {
        const { useSettingsStore } = await import('./useSettingsStore')
        const pushEnabled = useSettingsStore.getState().notifications?.pushEnabled
        if (pushEnabled && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body: message })
        }
      } catch (err) {
        console.error('Failed to trigger desktop notification:', err)
      }

      return data
    } else {
      console.error('❌ Error adding notification:', error)
      return null
    }
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
    }),
    {
      name: 'gestiva-notifications-storage',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ notifications: state.notifications, lastFetch: state.lastFetch }),
    }
  )
)

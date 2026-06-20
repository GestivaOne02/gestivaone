import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './useAuthStore'
import { idbStorage } from '@/lib/idbStorage'

const STALE_TIME = 1000 * 60 * 60 // 1 hora

export const useCRMStore = create(
  persist(
    (set, get) => ({
      activities: [],
      loading: false,
      lastFetch: 0,

      // ── Fetch activities from Supabase ──────────────────────
      fetchActivities: async (force = false) => {
        const { lastFetch } = get()
        const { user } = useAuthStore.getState()
        if (!user?.companyId) return

        const isStale = Date.now() - lastFetch > STALE_TIME
        if (!isStale && !force) return

        set({ loading: true })
        const { data, error } = await supabase
          .from('crm_activities')
          .select('*')
          .eq('company_id', user.companyId)
          .order('created_at', { ascending: false })
          .limit(500)

        if (!error) set({ activities: data || [], lastFetch: Date.now() })
        set({ loading: false })
      },

      // ── Log a CRM activity ─────────────────────────────────
      logActivity: async ({ clientId, type, description, metadata = {} }) => {
        const { user } = useAuthStore.getState()
        if (!user?.companyId) return null

        const localId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const activity = {
          id: localId,
          company_id: user.companyId,
          client_id: clientId,
          type, // 'sale', 'note', 'call', 'email', 'status_change'
          description,
          metadata,
          created_by: user.id,
          created_at: new Date().toISOString()
        }

        // Add to local state immediately (optimistic update)
        set((s) => ({ activities: [activity, ...s.activities] }))

        try {
          const { data: saved, error } = await supabase
            .from('crm_activities')
            .insert([{
              company_id: user.companyId,
              client_id: clientId,
              type,
              description,
              metadata,
              created_by: user.id
            }])
            .select()
            .single()

          if (!error && saved) {
            // Replace local placeholder with real DB record
            set((s) => ({
              activities: s.activities.map((a) => (a.id === localId ? saved : a))
            }))
            return saved
          }
          if (error) {
            console.warn('⚠️ Could not sync CRM activity to DB, keeping local copy:', error.message)
          }
        } catch (e) {
          console.warn('⚠️ Network or database error logging CRM activity:', e)
        }

        return activity
      },

      // ── Get activities for a specific client ───────────────
      getClientActivities: (clientId) =>
        get().activities.filter((a) => a.client_id === clientId),

      // ── CRM Metrics (computed from invoices + clients) ─────
      // These are computed on-the-fly from existing stores to avoid data duplication
      getClientMetrics: (clientId, invoices) => {
        const clientInvoices = invoices.filter((i) => i.client_id === clientId)
        const paidInvoices = clientInvoices.filter((i) => i.payment_status === 'paid')
        const totalSpent = paidInvoices.reduce((sum, i) => sum + (i.total || 0), 0)
        const avgTicket = paidInvoices.length > 0 ? totalSpent / paidInvoices.length : 0

        const sortedByDate = [...paidInvoices].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
        const lastPurchase = sortedByDate[0]?.created_at || null
        const firstPurchase = sortedByDate[sortedByDate.length - 1]?.created_at || null

        // Frequency: average days between purchases
        let avgDaysBetween = 0
        if (sortedByDate.length > 1) {
          const first = new Date(sortedByDate[sortedByDate.length - 1].created_at)
          const last = new Date(sortedByDate[0].created_at)
          avgDaysBetween = Math.round((last - first) / (1000 * 60 * 60 * 24) / (sortedByDate.length - 1))
        }

        // Segment based on recency & frequency
        const daysSinceLast = lastPurchase
          ? Math.round((Date.now() - new Date(lastPurchase)) / (1000 * 60 * 60 * 24))
          : Infinity

        let segment = 'nuevo'
        if (paidInvoices.length === 0) segment = 'nuevo'
        else if (daysSinceLast <= 30 && paidInvoices.length >= 5) segment = 'vip'
        else if (daysSinceLast <= 30) segment = 'activo'
        else if (daysSinceLast <= 90) segment = 'tibio'
        else segment = 'inactivo'

        return {
          totalSpent,
          avgTicket,
          purchaseCount: paidInvoices.length,
          totalInvoices: clientInvoices.length,
          lastPurchase,
          firstPurchase,
          avgDaysBetween,
          daysSinceLast,
          segment
        }
      },

      // ── Top clients by revenue ──────────────────────────────
      getTopClients: (clients, invoices, limit = 10) => {
        const metricsMap = clients.map((c) => ({
          ...c,
          metrics: get().getClientMetrics(c.id, invoices)
        }))
        return metricsMap
          .sort((a, b) => b.metrics.totalSpent - a.metrics.totalSpent)
          .slice(0, limit)
      },

      // ── Segment distribution ────────────────────────────────
      getSegmentDistribution: (clients, invoices) => {
        const segments = { vip: 0, activo: 0, tibio: 0, inactivo: 0, nuevo: 0 }
        clients.forEach((c) => {
          const { segment } = get().getClientMetrics(c.id, invoices)
          if (segments[segment] !== undefined) segments[segment]++
        })
        return segments
      }
    }),
    {
      name: 'gestiva-crm-storage',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ activities: state.activities, lastFetch: state.lastFetch }),
    }
  )
)

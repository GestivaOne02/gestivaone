import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { useProductStore } from '@/store/useProductStore'
import { useClientStore } from '@/store/useClientStore'
import { useInvoiceStore } from '@/store/useInvoiceStore'
import { useExpenseStore } from '@/store/useExpenseStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { usePocketStore } from '@/store/usePocketStore'
import { useHRStore } from '@/store/useHRStore'
import { usePayrollStore } from '@/store/usePayrollStore'

export let globalChannel = null;

export const broadcastSyncEvent = (table, eventType, newRecord, oldRecord) => {
  if (globalChannel) {
    globalChannel.send({
      type: 'broadcast',
      event: 'manual_sync_event',
      payload: { table, eventType, new: newRecord, old: oldRecord }
    }).catch(err => console.error('Broadcast error:', err))
  }
}

export function useRealtimeSync() {
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!user?.companyId) return

    const channel = supabase.channel(`company_realtime_${user.companyId}`)
    globalChannel = channel

    channel
      .on(
        'broadcast',
        { event: 'manual_sync_event' },
        ({ payload }) => {
          console.log('📡 Broadcast received:', payload)
          if (payload.table === 'products') useProductStore.getState().applyRealtimeUpdate(payload)
          if (payload.table === 'clients') useClientStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.new && payload.new.company_id && payload.new.company_id !== user.companyId) return;
          console.log('🟢 Realtime Payload (products):', payload)
          useProductStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        (payload) => {
          if (payload.new && payload.new.company_id && payload.new.company_id !== user.companyId) return;
          console.log('🟢 Realtime Payload (clients):', payload)
          useClientStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoices' },
        (payload) => {
          if (payload.new && payload.new.company_id && payload.new.company_id !== user.companyId) return;
          useInvoiceStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        (payload) => {
          if (payload.new && payload.new.company_id && payload.new.company_id !== user.companyId) return;
          useExpenseStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          if (payload.new && payload.new.company_id && payload.new.company_id !== user.companyId) return;
          // Profile updates could be new employees or setting changes
          if (useEmployeeStore.getState().applyRealtimeUpdate) {
             useEmployeeStore.getState().applyRealtimeUpdate(payload)
          }

          // If the profile updated is the current user, we should sync auth settings (e.g. pockets)
          if (payload.eventType === 'UPDATE' && payload.new.id === user.id) {
             const authStore = useAuthStore.getState()
             // Force a fresh session check to update `user` state inside Zustand
             authStore.syncProfile(user.id).then(() => {
                usePocketStore.getState().fetchPockets()
             })
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hr_employees' },
        (payload) => {
          if (payload.new && payload.new.company_id && payload.new.company_id !== user.companyId) return;
          useHRStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hr_recruitment_candidates' },
        (payload) => {
          if (payload.new && payload.new.company_id && payload.new.company_id !== user.companyId) return;
          useHRStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hr_vacations' },
        (payload) => {
          if (payload.new && payload.new.company_id && payload.new.company_id !== user.companyId) return;
          useHRStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payroll_runs' },
        (payload) => {
          if (payload.new && payload.new.company_id && payload.new.company_id !== user.companyId) return;
          usePayrollStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .subscribe((status, err) => {
        console.log('🔵 Realtime Sync Status:', status, err || '')
        if (status === 'SUBSCRIBED') {
           console.log('✅ Listening to Realtime changes for company:', user.companyId)
        }
        if (status === 'CHANNEL_ERROR') {
           console.error('❌ Realtime Channel Error:', err)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.companyId, user?.id])
}

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

export function useRealtimeSync() {
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!user?.companyId) return

    const channel = supabase.channel(`company_realtime_${user.companyId}`)

    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products', filter: `company_id=eq.${user.companyId}` },
        (payload) => {
          useProductStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients', filter: `company_id=eq.${user.companyId}` },
        (payload) => {
          useClientStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoices', filter: `company_id=eq.${user.companyId}` },
        (payload) => {
          useInvoiceStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `company_id=eq.${user.companyId}` },
        (payload) => {
          useExpenseStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `company_id=eq.${user.companyId}` },
        (payload) => {
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
        { event: '*', schema: 'public', table: 'hr_employees', filter: `company_id=eq.${user.companyId}` },
        (payload) => {
          useHRStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hr_recruitment_candidates', filter: `company_id=eq.${user.companyId}` },
        (payload) => {
          useHRStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hr_vacations', filter: `company_id=eq.${user.companyId}` },
        (payload) => {
          useHRStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payroll_runs', filter: `company_id=eq.${user.companyId}` },
        (payload) => {
          usePayrollStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
           // connected
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.companyId, user?.id])
}

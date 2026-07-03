import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { useProductStore } from '@/store/useProductStore'
import { useClientStore } from '@/store/useClientStore'
import { useInvoiceStore } from '@/store/useInvoiceStore'
import { useExpenseStore } from '@/store/useExpenseStore'
import { useEmployeeStore } from '@/store/useEmployeeStore'
import { usePocketStore } from '@/store/usePocketStore'

export function useRealtimeSync() {
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!user?.companyId) return

    console.log('Inicializando sincronización en tiempo real para el POS...')

    const channel = supabase.channel(`company_realtime_${user.companyId}`)

    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products', filter: `company_id=eq.${user.companyId}` },
        (payload) => {
          console.log('Realtime Update (products):', payload)
          useProductStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients', filter: `company_id=eq.${user.companyId}` },
        (payload) => {
          console.log('Realtime Update (clients):', payload)
          useClientStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoices', filter: `company_id=eq.${user.companyId}` },
        (payload) => {
          console.log('Realtime Update (invoices):', payload)
          useInvoiceStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `company_id=eq.${user.companyId}` },
        (payload) => {
          console.log('Realtime Update (expenses):', payload)
          useExpenseStore.getState().applyRealtimeUpdate(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `company_id=eq.${user.companyId}` },
        (payload) => {
          console.log('Realtime Update (profiles):', payload)
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
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
           console.log('Conectado al canal en tiempo real del POS.')
        }
      })

    return () => {
      console.log('Desconectando canal en tiempo real...')
      supabase.removeChannel(channel)
    }
  }, [user?.companyId, user?.id])
}

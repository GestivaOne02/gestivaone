import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './useAuthStore'
import { idbStorage } from '@/lib/idbStorage'
import toast from 'react-hot-toast'

// Mock Data for offline / local-first support
const MOCK_EMPLOYEES = [
  {
    id: 'emp-1',
    company_id: 'mock-company-id',
    full_name: 'Mateo Rodríguez',
    email: 'mateo@gestiva.com',
    phone: '3124567890',
    document_id: '1020405060',
    hire_date: '2025-01-15',
    salary: 2800000.00,
    position: 'Despachador Senior',
    department: 'Logística',
    status: 'active',
    arl_class: 'clase_2',
    bank_account: '9876543210',
    bank_name: 'Bancolombia'
  },
  {
    id: 'emp-2',
    company_id: 'mock-company-id',
    full_name: 'Laura Sofía Restrepo',
    email: 'laura.contable@gestiva.com',
    phone: '3157890123',
    document_id: '1035607080',
    hire_date: '2025-03-01',
    salary: 3500000.00,
    position: 'Asistente Contable',
    department: 'Finanzas',
    status: 'active',
    arl_class: 'clase_1',
    bank_account: '1234567890',
    bank_name: 'Davivienda'
  },
  {
    id: 'emp-3',
    company_id: 'mock-company-id',
    full_name: 'Carlos Mario Giraldo',
    email: 'carlos.m@gestiva.com',
    phone: '3001234567',
    document_id: '70809010',
    hire_date: '2024-06-10',
    salary: 1300000.00,
    position: 'Despachador Auxiliar',
    department: 'Logística',
    status: 'active',
    arl_class: 'clase_3',
    bank_account: '4561237890',
    bank_name: 'Nequi'
  }
]

const MOCK_CANDIDATES = [
  { id: 'cand-1', full_name: 'Juan Felipe Gómez', email: 'juan.gomez@gmail.com', phone: '3114567890', position: 'Despachador', stage: 'applied', notes: 'Buen perfil, experiencia en reparto.' },
  { id: 'cand-2', full_name: 'Diana Patricia Uribe', email: 'diana.uribe@yahoo.com', phone: '3187890123', position: 'Asistente Contable', stage: 'interview', notes: 'Entrevista programada para el lunes.' },
  { id: 'cand-3', full_name: 'Andrés Camilo Pérez', email: 'andres.p@outlook.com', phone: '3019876543', position: 'Coordinador Logística', stage: 'offer', notes: 'Oferta enviada por 3.2M. Esperando respuesta.' },
  { id: 'cand-4', full_name: 'Valeria Santos', email: 'valeria.s@gmail.com', phone: '3201234567', position: 'Despachador', stage: 'hired', notes: 'Contratada. Inicia el 1 de julio.' }
]

const MOCK_VACATIONS = [
  { id: 'vac-1', employee_id: 'emp-1', employee_name: 'Mateo Rodríguez', start_date: '2026-07-01', end_date: '2026-07-15', requested_days: 15, status: 'approved' },
  { id: 'vac-2', employee_id: 'emp-3', employee_name: 'Carlos Mario Giraldo', start_date: '2026-08-10', end_date: '2026-08-15', requested_days: 5, status: 'pending' }
]

export const useHRStore = create(
  persist(
    (set, get) => ({
      employees: [],
      candidates: [],
      vacations: [],
      loading: false,

      // Initialize lists
      fetchHRData: async () => {
        const { user } = useAuthStore.getState()
        if (!user) return

        set({ loading: true })

        // Check if DB is mock or offline
        if (import.meta.env.DEV && (user.id === 'mock-admin-id' || user.id.startsWith('master-'))) {
          // Local bypass mock loading
          set({
            employees: get().employees.length > 0 ? get().employees : MOCK_EMPLOYEES,
            candidates: get().candidates.length > 0 ? get().candidates : MOCK_CANDIDATES,
            vacations: get().vacations.length > 0 ? get().vacations : MOCK_VACATIONS,
            loading: false
          })
          return
        }

        try {
          // Fetch Employees
          const { data: dbEmp, error: errEmp } = await supabase
            .from('hr_employees')
            .select('*')
            .eq('company_id', user.companyId)

          // Fetch Candidates
          const { data: dbCand, error: errCand } = await supabase
            .from('hr_recruitment_candidates')
            .select('*')
            .eq('company_id', user.companyId)

          // Fetch Vacations
          const { data: dbVac, error: errVac } = await supabase
            .from('hr_vacations')
            .select('*, hr_employees(full_name)')
            .eq('company_id', user.companyId)

          if (!errEmp && !errCand && !errVac) {
            const mappedVacations = (dbVac || []).map(v => ({
              ...v,
              employee_name: v.hr_employees?.full_name || 'Desconocido'
            }))
            set({
              employees: dbEmp || [],
              candidates: dbCand || [],
              vacations: mappedVacations
            })
          } else {
            console.warn('Fallback to local state due to RLS/fetch error')
            // Fallback locally
            set({
              employees: get().employees.length > 0 ? get().employees : MOCK_EMPLOYEES,
              candidates: get().candidates.length > 0 ? get().candidates : MOCK_CANDIDATES,
              vacations: get().vacations.length > 0 ? get().vacations : MOCK_VACATIONS
            })
          }
        } catch (e) {
          console.error(e)
        } finally {
          set({ loading: false })
        }
      },

      // ── CRUD EMPLOYEES ────────────────────────────────────
      addEmployee: async (data) => {
        const { user } = useAuthStore.getState()
        if (!user) return

        // Plan limit check
        const { employees } = get()
        const maxLimit = user.plan === 'standard' ? 5 : (user.plan === 'basic' ? 15 : 99999)
        if (employees.length >= maxLimit) {
          toast.error(`Límite de plan: Tu suscripción actual solo permite un máximo de ${maxLimit} empleados activos. Actualiza tu plan.`)
          return false
        }

        const newEmp = {
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
          company_id: user.companyId,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone || '',
          document_id: data.document_id,
          hire_date: data.hire_date || new Date().toISOString().split('T')[0],
          salary: Number(data.salary) || 1300000.00,
          position: data.position,
          department: data.department,
          status: 'active',
          arl_class: data.arl_class || 'clase_1',
          bank_account: data.bank_account || '',
          bank_name: data.bank_name || ''
        }

        if (import.meta.env.DEV && user.id === 'mock-admin-id') {
          set(s => ({ employees: [...s.employees, newEmp] }))
          toast.success('Empleado agregado localmente (Bypass)')
          return true
        }

        try {
          const { error } = await supabase.from('hr_employees').insert([newEmp])
          if (error) throw error
          set(s => ({ employees: [...s.employees, newEmp] }))
          toast.success('Empleado registrado con éxito')
          return true
        } catch (e) {
          toast.error('Error: ' + e.message)
          return false
        }
      },

      updateEmployee: async (id, data) => {
        const { user } = useAuthStore.getState()
        if (!user) return

        if (import.meta.env.DEV && user.id === 'mock-admin-id') {
          set(s => ({
            employees: s.employees.map(e => e.id === id ? { ...e, ...data } : e)
          }))
          toast.success('Empleado actualizado localmente')
          return true
        }

        try {
          const { error } = await supabase
            .from('hr_employees')
            .update(data)
            .eq('id', id)

          if (error) throw error
          set(s => ({
            employees: s.employees.map(e => e.id === id ? { ...e, ...data } : e)
          }))
          toast.success('Perfil de empleado actualizado')
          return true
        } catch (e) {
          toast.error('Error al actualizar: ' + e.message)
          return false
        }
      },

      removeEmployee: async (id) => {
        const { user } = useAuthStore.getState()
        if (!user) return

        if (import.meta.env.DEV && user.id === 'mock-admin-id') {
          set(s => ({ employees: s.employees.filter(e => e.id !== id) }))
          toast.success('Empleado eliminado localmente')
          return true
        }

        try {
          const { error } = await supabase.from('hr_employees').delete().eq('id', id)
          if (error) throw error
          set(s => ({ employees: s.employees.filter(e => e.id !== id) }))
          toast.success('Empleado eliminado del sistema')
          return true
        } catch (e) {
          toast.error('Error al eliminar: ' + e.message)
          return false
        }
      },

      // ── CRUD RECRUITMENT CANDIDATES ────────────────────────
      addCandidate: async (data) => {
        const { user } = useAuthStore.getState()
        if (!user) return

        const newCand = {
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
          company_id: user.companyId,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone || '',
          position: data.position,
          stage: data.stage || 'applied',
          notes: data.notes || ''
        }

        if (import.meta.env.DEV && user.id === 'mock-admin-id') {
          set(s => ({ candidates: [...s.candidates, newCand] }))
          toast.success('Candidato agregado localmente')
          return true
        }

        try {
          const { error } = await supabase.from('hr_recruitment_candidates').insert([newCand])
          if (error) throw error
          set(s => ({ candidates: [...s.candidates, newCand] }))
          toast.success('Candidato registrado en selección')
          return true
        } catch (e) {
          toast.error('Error: ' + e.message)
          return false
        }
      },

      updateCandidateStage: async (id, stage) => {
        const { user } = useAuthStore.getState()
        if (!user) return

        if (import.meta.env.DEV && user.id === 'mock-admin-id') {
          set(s => ({
            candidates: s.candidates.map(c => c.id === id ? { ...c, stage } : c)
          }))
          return true
        }

        try {
          const { error } = await supabase
            .from('hr_recruitment_candidates')
            .update({ stage })
            .eq('id', id)

          if (error) throw error
          set(s => ({
            candidates: s.candidates.map(c => c.id === id ? { ...c, stage } : c)
          }))
          return true
        } catch (e) {
          toast.error('Error al actualizar etapa: ' + e.message)
          return false
        }
      },

      removeCandidate: async (id) => {
        const { user } = useAuthStore.getState()
        if (!user) return

        if (import.meta.env.DEV && user.id === 'mock-admin-id') {
          set(s => ({ candidates: s.candidates.filter(c => c.id !== id) }))
          return true
        }

        try {
          await supabase.from('hr_recruitment_candidates').delete().eq('id', id)
          set(s => ({ candidates: s.candidates.filter(c => c.id !== id) }))
          return true
        } catch (e) {
          return false
        }
      },

      // ── CRUD VACATIONS ────────────────────────────────────
      requestVacation: async (data) => {
        const { user } = useAuthStore.getState()
        const { employees } = get()
        if (!user) return

        const emp = employees.find(e => e.id === data.employee_id)
        const employeeName = emp ? emp.full_name : 'Empleado'

        const newVac = {
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
          company_id: user.companyId,
          employee_id: data.employee_id,
          start_date: data.start_date,
          end_date: data.end_date,
          requested_days: Number(data.requested_days),
          status: 'pending'
        }

        if (import.meta.env.DEV && user.id === 'mock-admin-id') {
          set(s => ({ vacations: [...s.vacations, { ...newVac, employee_name: employeeName }] }))
          toast.success('Solicitud de vacaciones radicada')
          return true
        }

        try {
          const { error } = await supabase.from('hr_vacations').insert([newVac])
          if (error) throw error
          set(s => ({ vacations: [...s.vacations, { ...newVac, employee_name: employeeName }] }))
          toast.success('Solicitud de vacaciones radicada')
          return true
        } catch (e) {
          toast.error('Error: ' + e.message)
          return false
        }
      },

      updateVacationStatus: async (id, status) => {
        const { user } = useAuthStore.getState()
        if (!user) return

        if (import.meta.env.DEV && user.id === 'mock-admin-id') {
          set(s => ({
            vacations: s.vacations.map(v => v.id === id ? { ...v, status } : v)
          }))
          toast.success(`Vacaciones ${status === 'approved' ? 'aprobadas' : 'rechazadas'}`)
          return true
        }

        try {
          const { error } = await supabase
            .from('hr_vacations')
            .update({ status })
            .eq('id', id)

          if (error) throw error
          set(s => ({
            vacations: s.vacations.map(v => v.id === id ? { ...v, status } : v)
          }))
          toast.success(`Vacaciones ${status === 'approved' ? 'aprobadas' : 'rechazadas'}`)
          return true
        } catch (e) {
          toast.error('Error al actualizar vacaciones: ' + e.message)
          return false
        }
      },

      applyRealtimeUpdate: (payload) => {
        const { eventType, new: newRecord, old: oldRecord, table } = payload

        set((s) => {
          if (table === 'hr_employees') {
            let updated = [...s.employees]
            if (eventType === 'INSERT') {
              if (!updated.some(e => e.id === newRecord.id)) {
                updated = [...updated, newRecord]
              }
            } else if (eventType === 'UPDATE') {
              updated = updated.map(e => e.id === newRecord.id ? { ...e, ...newRecord } : e)
            } else if (eventType === 'DELETE') {
              updated = updated.filter(e => e.id !== oldRecord.id)
            }
            return { employees: updated }
          }

          if (table === 'hr_recruitment_candidates') {
            let updated = [...s.candidates]
            if (eventType === 'INSERT') {
              if (!updated.some(c => c.id === newRecord.id)) {
                updated = [...updated, newRecord]
              }
            } else if (eventType === 'UPDATE') {
              updated = updated.map(c => c.id === newRecord.id ? { ...c, ...newRecord } : c)
            } else if (eventType === 'DELETE') {
              updated = updated.filter(c => c.id !== oldRecord.id)
            }
            return { candidates: updated }
          }

          if (table === 'hr_vacations') {
            let updated = [...s.vacations]
            if (eventType === 'INSERT') {
              if (!updated.some(v => v.id === newRecord.id)) {
                const emp = s.employees.find(e => e.id === newRecord.employee_id)
                const employeeName = emp ? emp.full_name : 'Empleado'
                updated = [...updated, { ...newRecord, employee_name: employeeName }]
              }
            } else if (eventType === 'UPDATE') {
              updated = updated.map(v => {
                if (v.id === newRecord.id) {
                  const emp = s.employees.find(e => e.id === newRecord.employee_id)
                  const employeeName = emp ? emp.full_name : v.employee_name
                  return { ...v, ...newRecord, employee_name: employeeName }
                }
                return v
              })
            } else if (eventType === 'DELETE') {
              updated = updated.filter(v => v.id !== oldRecord.id)
            }
            return { vacations: updated }
          }

          return {}
        })
      }
    }),
    {
      name: 'gestiva-hr-storage',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        employees: state.employees,
        candidates: state.candidates,
        vacations: state.vacations
      })
    }
  )
)

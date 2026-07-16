import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './useAuthStore'
import { idbStorage } from '@/lib/idbStorage'
import toast from 'react-hot-toast'

// Default System Concepts for Colombia (MVP)
const DEFAULT_CONCEPTS = [
  { id: 'c-health', code: 'HEALTH', name: 'Aporte Salud (Empleado)', type: 'deduction', formula: 'salary * 0.04', is_system: true, active: true },
  { id: 'c-pension', code: 'PENSION', name: 'Aporte Pensión (Empleado)', type: 'deduction', formula: 'salary * 0.04', is_system: true, active: true },
  { id: 'c-transport', code: 'TRANSPORT_AUX', name: 'Auxilio de Transporte', type: 'accrued', formula: 'salary <= 2600000 ? (162000 * (days / 30)) : 0', is_system: true, active: true },
  { id: 'c-arl', code: 'ARL_CONTRIB', name: 'Aporte ARL (Patronal)', type: 'deduction', formula: "arl_class === 'clase_1' ? (salary * 0.00522) : arl_class === 'clase_2' ? (salary * 0.01044) : arl_class === 'clase_3' ? (salary * 0.02436) : arl_class === 'clase_4' ? (salary * 0.0435) : arl_class === 'clase_5' ? (salary * 0.0696) : 0", is_system: true, active: true }
]

const MOCK_RUNS = [
  {
    id: 'run-1',
    company_id: 'mock-company-id',
    name: 'Nómina Mayo 2026',
    period_start: '2026-05-01',
    period_end: '2026-05-30',
    status: 'approved',
    total_accrued: 7762000.00,
    total_deductions: 650000.00,
    total_net: 7112000.00,
    results: [
      {
        id: 'res-1',
        employee_id: 'emp-1',
        employee_name: 'Mateo Rodríguez',
        salary_base: 2800000.00,
        total_accrued: 2800000.00, // no aux transport since > 2.6M
        total_deductions: 238616.00, // health 112k + pension 112k + arl 14.6k
        total_net: 2561384.00,
        details: [
          { name: 'Aporte Salud (Empleado)', type: 'deduction', amount: 112000 },
          { name: 'Aporte Pensión (Empleado)', type: 'deduction', amount: 112000 },
          { name: 'Aporte ARL (Patronal)', type: 'deduction', amount: 14616 }
        ]
      },
      {
        id: 'res-2',
        employee_id: 'emp-3',
        employee_name: 'Carlos Mario Giraldo',
        salary_base: 1300000.00,
        total_accrued: 1462000.00, // salary 1.3M + aux transport 162k
        total_deductions: 135668.00, // health 52k + pension 52k + arl 31.6k (clase 3)
        total_net: 1326332.00,
        details: [
          { name: 'Auxilio de Transporte', type: 'accrued', amount: 162000 },
          { name: 'Aporte Salud (Empleado)', type: 'deduction', amount: 52000 },
          { name: 'Aporte Pensión (Empleado)', type: 'deduction', amount: 52000 },
          { name: 'Aporte ARL (Patronal)', type: 'deduction', amount: 31668 }
        ]
      }
    ]
  }
]

// Safe math JS evaluator for payroll formulas
const evaluateFormula = (formula, context) => {
  try {
    let expr = formula
    // Replace keys in expression
    Object.keys(context).forEach((key) => {
      const regex = new RegExp(`\\b${key}\\b`, 'g')
      const val = typeof context[key] === 'string' ? `'${context[key]}'` : context[key]
      expr = expr.replace(regex, val)
    })
    // Safe evaluation using Function
    const fn = new Function(`return (${expr})`)
    const result = fn()
    return Number(result) || 0
  } catch (e) {
    console.error('Error evaluating formula:', formula, e)
    return 0
  }
}

export const usePayrollStore = create(
  persist(
    (set, get) => ({
      runs: [],
      concepts: [],
      loading: false,

      fetchPayrollData: async () => {
        const { user } = useAuthStore.getState()
        if (!user) return

        set({ loading: true })

        // Mock mode bypass
        if (import.meta.env.DEV && (user.id === 'mock-admin-id' || user.id.startsWith('master-'))) {
          set({
            concepts: get().concepts.length > 0 ? get().concepts : DEFAULT_CONCEPTS,
            runs: get().runs.length > 0 ? get().runs : MOCK_RUNS,
            loading: false
          })
          return
        }

        try {
          // Fetch custom payroll concepts
          const { data: dbCon, error: errCon } = await supabase
            .from('payroll_concepts')
            .select('*')
            .eq('company_id', user.companyId)

          // Fetch payroll runs
          const { data: dbRuns, error: errRuns } = await supabase
            .from('payroll_runs')
            .select('*, payroll_results(*, hr_employees(full_name))')
            .eq('company_id', user.companyId)

          let finalConcepts = DEFAULT_CONCEPTS
          if (!errCon && dbCon && dbCon.length > 0) {
            // merge or override
            const systemCodes = DEFAULT_CONCEPTS.map(c => c.code)
            const userCustom = dbCon.filter(c => !systemCodes.includes(c.code))
            finalConcepts = [...DEFAULT_CONCEPTS, ...userCustom]
          }

          let mappedRuns = []
          if (!errRuns && dbRuns) {
            mappedRuns = dbRuns.map(run => ({
              ...run,
              results: (run.payroll_results || []).map(r => ({
                id: r.id,
                employee_id: r.employee_id,
                employee_name: r.hr_employees?.full_name || 'Desconocido',
                salary_base: Number(r.salary_base),
                total_accrued: Number(r.total_accrued),
                total_deductions: Number(r.total_deductions),
                total_net: Number(r.total_net),
                details: r.details_json || []
              }))
            }))
          } else {
            mappedRuns = get().runs.length > 0 ? get().runs : MOCK_RUNS
          }

          set({
            concepts: finalConcepts,
            runs: mappedRuns
          })
        } catch (e) {
          console.error('Error fetching payroll data:', e)
        } finally {
          set({ loading: false })
        }
      },

      // Calculate payroll run
      calculatePayrollRun: async (runName, periodStart, periodEnd, employeesList) => {
        const { user } = useAuthStore.getState()
        if (!user) return null

        const { concepts } = get()
        let totalRunAccrued = 0
        let totalRunDeductions = 0
        let totalRunNet = 0

        const runId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36)

        // Process each employee
        const results = employeesList.map(emp => {
          const context = {
            salary: emp.salary || 1300000.00,
            days: 30, // standard payroll days
            arl_class: emp.arl_class || 'clase_1'
          }

          let totalEmpAccrued = context.salary // salary base is accrued
          let totalEmpDeductions = 0
          const details = []

          // Evaluate active payroll concepts
          concepts.filter(c => c.active).forEach(concept => {
            const calculatedAmount = evaluateFormula(concept.formula, context)
            if (calculatedAmount > 0) {
              if (concept.type === 'accrued') {
                totalEmpAccrued += calculatedAmount
              } else {
                totalEmpDeductions += calculatedAmount
              }
              details.push({
                code: concept.code,
                name: concept.name,
                type: concept.type,
                amount: Math.round(calculatedAmount),
                formula: concept.formula
              })
            }
          })

          const totalEmpNet = totalEmpAccrued - totalEmpDeductions

          totalRunAccrued += totalEmpAccrued
          totalRunDeductions += totalEmpDeductions
          totalRunNet += totalEmpNet

          return {
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
            employee_id: emp.id,
            employee_name: emp.full_name,
            salary_base: context.salary,
            total_accrued: Math.round(totalEmpAccrued),
            total_deductions: Math.round(totalEmpDeductions),
            total_net: Math.round(totalEmpNet),
            details
          }
        })

        const newRun = {
          id: runId,
          company_id: user.companyId,
          name: runName,
          period_start: periodStart,
          period_end: periodEnd,
          status: 'simulated',
          total_accrued: Math.round(totalRunAccrued),
          total_deductions: Math.round(totalRunDeductions),
          total_net: Math.round(totalRunNet),
          results
        }

        // Check plan subscription limits
        if (user.plan === 'standard' && get().runs.filter(r => r.status === 'approved').length >= 1) {
          toast.error('Límite de plan: El plan One Standard solo permite liquidar 1 nómina oficial mensual. Actualiza tu suscripción.')
          return null
        }

        if (import.meta.env.DEV && user.id === 'mock-admin-id') {
          set(s => ({ runs: [newRun, ...s.runs] }))
          toast.success('Simulación de nómina completada')
          return newRun
        }

        try {
          // Insert run details into database
          const { error: runErr } = await supabase.from('payroll_runs').insert([{
            id: runId,
            company_id: user.companyId,
            name: runName,
            period_start: periodStart,
            period_end: periodEnd,
            status: 'simulated',
            total_accrued: Math.round(totalRunAccrued),
            total_deductions: Math.round(totalRunDeductions),
            total_net: Math.round(totalRunNet)
          }])

          if (runErr) throw runErr

          // Insert results in bulk
          const bulkResults = results.map(r => ({
            company_id: user.companyId,
            payroll_run_id: runId,
            employee_id: r.employee_id,
            salary_base: r.salary_base,
            total_accrued: r.total_accrued,
            total_deductions: r.total_deductions,
            total_net: r.total_net,
            details_json: r.details
          }))

          const { error: resErr } = await supabase.from('payroll_results').insert(bulkResults)
          if (resErr) throw resErr

          set(s => ({ runs: [newRun, ...s.runs] }))
          toast.success('Cálculo de nómina completado y registrado')
          return newRun
        } catch (e) {
          toast.error('Error al guardar simulación: ' + e.message)
          return null
        }
      },

      approvePayrollRun: async (runId) => {
        const { user } = useAuthStore.getState()
        if (!user) return

        if (import.meta.env.DEV && user.id === 'mock-admin-id') {
          set(s => ({
            runs: s.runs.map(r => r.id === runId ? { ...r, status: 'approved' } : r)
          }))
          toast.success('Nómina aprobada y oficializada')
          return true
        }

        try {
          const { error } = await supabase
            .from('payroll_runs')
            .update({ status: 'approved' })
            .eq('id', runId)

          if (error) throw error
          set(s => ({
            runs: s.runs.map(r => r.id === runId ? { ...r, status: 'approved' } : r)
          }))
          toast.success('Nómina aprobada y oficializada')
          return true
        } catch (e) {
          toast.error('Error al aprobar: ' + e.message)
          return false
        }
      },

      removePayrollRun: async (runId) => {
        const { user } = useAuthStore.getState()
        if (!user) return

        if (import.meta.env.DEV && user.id === 'mock-admin-id') {
          set(s => ({ runs: s.runs.filter(r => r.id !== runId) }))
          toast.success('Nómina eliminada')
          return true
        }

        try {
          const { error } = await supabase.from('payroll_runs').delete().eq('id', runId)
          if (error) throw error
          set(s => ({ runs: s.runs.filter(r => r.id !== runId) }))
          toast.success('Nómina eliminada')
          return true
        } catch (e) {
          toast.error('Error al eliminar: ' + e.message)
          return false
        }
      },

      applyRealtimeUpdate: (payload) => {
        // Since payroll_runs has a relation with payroll_results, refetching is the cleanest way to sync
        get().fetchPayrollData()
      }
    }),
    {
      name: 'gestiva-payroll-storage',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        runs: state.runs,
        concepts: state.concepts
      })
    }
  )
)

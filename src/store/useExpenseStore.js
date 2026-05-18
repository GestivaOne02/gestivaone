import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useExpenseStore = create(
  persist(
    (set, get) => ({
      expenses: [
        // Mock data to pre-populate beautifully for the demo
        { id: 'exp-1', amount: 450000, category: 'Inventario/Mercancía', description: 'Compra de stock inicial', created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'exp-2', amount: 150000, category: 'Alquiler/Servicios', description: 'Pago de electricidad y local', created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'exp-3', amount: 80000, category: 'Marketing/Publicidad', description: 'Campaña de anuncios Facebook', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      ],

      addExpense: (expense) => {
        const newExpense = {
          id: `EXP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          amount: Number(expense.amount),
          category: expense.category || 'Otros',
          description: expense.description || '',
          created_at: new Date().toISOString(),
        }
        set((s) => ({ expenses: [newExpense, ...s.expenses] }))
        return { success: true }
      },

      deleteExpense: (id) => {
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }))
        return { success: true }
      },

      getMonthlyExpenses: () => {
        const months = {}
        get().expenses.forEach((e) => {
          const key = e.created_at.slice(0, 7) // "YYYY-MM"
          months[key] = (months[key] ?? 0) + (e.amount || 0)
        })
        return months
      },

      getTotalExpenses: () => {
        return get().expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
      }
    }),
    {
      name: 'gestiva-expenses'
    }
  )
)

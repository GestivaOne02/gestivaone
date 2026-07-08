import { create } from 'zustand'
import { useCurrencyStore } from './useCurrencyStore'
import { useAuthStore } from './useAuthStore'
import { getProductDiscount, useProductStore } from './useProductStore'
import { getLocalizationByCurrency } from '@/services/localizationService'
import toast from 'react-hot-toast'

export const useCartStore = create((set, get) => {
  const recalculate = (state) => {
    const items = state.items ?? get().items
    const includeTax = state.includeTax ?? get().includeTax
    const customCharges = state.customCharges ?? get().customCharges
    const globalDiscount = state.globalDiscount ?? get().globalDiscount
    
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
    const baseCurrency = useCurrencyStore.getState().baseCurrency
    const locConfig = getLocalizationByCurrency(baseCurrency)
    const taxRate = locConfig?.defaultTaxRate ?? 0.0
    const taxAmount = includeTax ? subtotal * taxRate : 0
    const customChargesSum = customCharges
      .filter(c => c.applied)
      .reduce((sum, c) => {
        const val = Number(c.value || 0)
        if (c.type === 'percent') {
          return sum + (subtotal * (val / 100))
        } else {
          return sum + val
        }
      }, 0)

    let globalDiscountAmount = 0
    if (globalDiscount && globalDiscount.value > 0) {
      if (globalDiscount.type === 'percent') {
        globalDiscountAmount = subtotal * (globalDiscount.value / 100)
      } else {
        globalDiscountAmount = Number(globalDiscount.value)
      }
    }

    const total = subtotal - globalDiscountAmount + taxAmount + customChargesSum
    
    return { subtotal, taxAmount, customChargesSum, globalDiscountAmount, total }
  }

  const setAndRecalc = (updateFnOrObj) => {
    set((state) => {
      const updates = typeof updateFnOrObj === 'function' ? updateFnOrObj(state) : updateFnOrObj
      const nextState = { ...state, ...updates }
      const totals = recalculate(nextState)
      return { ...nextState, ...totals }
    })
  }

  return {
    items: [],   // { id, productId, name, price, qty, unit, isCustom }
    note: '',
    includeTax: false,
    customCharges: [], // { id, name, type: 'percent'|'fixed', value, applied, pinned }
    globalDiscount: null, // { value: number, type: 'percent'|'fixed' }
    subtotal: 0,
    taxAmount: 0,
    customChargesSum: 0,
    globalDiscountAmount: 0,
    total: 0,

    toggleTax: () => setAndRecalc((s) => ({ includeTax: !s.includeTax })),

    addItem: (product, qty = 1) => {
      const latestProduct = useProductStore.getState().products.find((p) => p.id === product.id) || product
      const isUnlimited = latestProduct.unit === 'ILIMITADO' || latestProduct.stock >= 999990000 || latestProduct.unit === 'HORA'

      let success = true
      setAndRecalc((s) => {
        const discountInfo = getProductDiscount(latestProduct)
        const effectivePrice = discountInfo ? discountInfo.finalPrice : Number(latestProduct.price)

        const finalName = product.name || latestProduct.name
        const existing = s.items.find((i) => i.productId === latestProduct.id && i.name === finalName)
        const currentCartQty = existing ? existing.qty : 0
        const targetQty = currentCartQty + qty

        if (!isUnlimited && latestProduct.stock !== undefined && latestProduct.stock !== null) {
          if (targetQty > latestProduct.stock) {
            success = false
            toast.error(`Solo quedan ${latestProduct.stock} unidades de ${latestProduct.name}`)
            return {}
          }
        }

        if (existing) {
          return {
            items: s.items.map((i) =>
               (i.productId === latestProduct.id && i.name === finalName) ? { ...i, qty: targetQty, price: effectivePrice } : i
            ),
          }
        }
        return {
          items: [
            ...s.items,
            {
              id: `cart-${Date.now()}-${Math.random()}`,
              productId: latestProduct.id,
              name: finalName,
              price: effectivePrice,
              qty,
              unit: latestProduct.unit ?? 'UND',
              isCustom: latestProduct.isCustom ?? false,
              discountApplied: discountInfo ? { amount: discountInfo.amount, type: discountInfo.type, value: discountInfo.value } : null,
              attachment_url: latestProduct.attachment_url ?? null,
              attachment_name: latestProduct.attachment_name ?? null,
              hourly_booking: product.hourly_booking ?? null,
            },
          ],
        }
      })
      return success
    },

    addCustomItem: (name, price, description = '') => {
      setAndRecalc((s) => ({
        items: [
          ...s.items,
          {
            id: `custom-${Date.now()}`,
            productId: null,
            name: name || 'Valor libre',
            description,
            price: Number(price),
            qty: 1,
            unit: 'UND',
            isCustom: true,
          },
        ],
      }))
    },

    removeItem: (id) =>
      setAndRecalc((s) => ({ items: s.items.filter((i) => i.id !== id) })),

    updateQty: (id, qty) => {
      if (qty <= 0) { get().removeItem(id); return }
      
      const item = get().items.find((i) => i.id === id)
      if (item && item.productId) {
        const latestProduct = useProductStore.getState().products.find((p) => p.id === item.productId)
        if (latestProduct) {
          const isUnlimited = latestProduct.unit === 'ILIMITADO' || latestProduct.stock >= 999990000
          if (!isUnlimited && latestProduct.stock !== undefined && latestProduct.stock !== null) {
            if (qty > latestProduct.stock) {
              toast.error(`Solo quedan ${latestProduct.stock} unidades de ${item.name}`)
              return
            }
          }
        }
      }

      setAndRecalc((s) => ({
        items: s.items.map((i) => (i.id === id ? { ...i, qty: Number(qty) } : i)),
      }))
    },

    updatePrice: (id, price) =>
      setAndRecalc((s) => ({
        items: s.items.map((i) => (i.id === id ? { ...i, price: Number(price) } : i)),
      })),

    setNote: (note) => set({ note }),

    clearCart: () => {
      // Keep pinned custom charges when clearing cart
      const pinned = get().customCharges.filter(c => c.pinned)
      setAndRecalc({ items: [], note: '', includeTax: false, globalDiscount: null, customCharges: pinned.map(c => ({ ...c, applied: true })) })
    },

    addCustomCharge: async (charge) => {
      const newCharge = {
        id: `charge-${Date.now()}`,
        applied: true,
        pinned: false,
        ...charge
      }
      setAndRecalc((s) => ({ customCharges: [...s.customCharges, newCharge] }))
      if (charge.pinned) {
        await get().savePinnedChargesToDB()
      }
    },

    removeCustomCharge: async (id) => {
      const wasPinned = get().customCharges.find(c => c.id === id)?.pinned
      setAndRecalc((s) => ({ customCharges: s.customCharges.filter(c => c.id !== id) }))
      if (wasPinned) {
        await get().savePinnedChargesToDB()
      }
    },

    toggleCustomChargeApplied: (id) => {
      setAndRecalc((s) => ({
        customCharges: s.customCharges.map(c => c.id === id ? { ...c, applied: !c.applied } : c)
      }))
    },

    toggleCustomChargePin: async (id) => {
      let updatedCharges = []
      setAndRecalc((s) => {
        updatedCharges = s.customCharges.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c)
        return { customCharges: updatedCharges }
      })
      await get().savePinnedChargesToDB()
    },

    loadPinnedCharges: () => {
      const auth = useAuthStore.getState()
      const pinned = auth.user?.settings?.pinned_charges || []
      setAndRecalc({
        customCharges: pinned.map(c => ({ ...c, applied: true, id: c.id || `charge-${Math.random()}` }))
      })
    },

    savePinnedChargesToDB: async () => {
      const auth = useAuthStore.getState()
      if (auth.isAuthenticated && auth.user?.companyId) {
        const currentSettings = auth.user.settings || {}
        const pinned = get().customCharges.filter(c => c.pinned).map(({ id, name, type, value, pinned }) => ({ id, name, type, value, pinned }))
        const updatedSettings = {
          ...currentSettings,
          pinned_charges: pinned
        }
        await auth.updateProfile({ settings: updatedSettings })
      }
    },

    setGlobalDiscount: (discount) => {
      setAndRecalc({ globalDiscount: discount })
    },
  }
})

// Selectors (use outside with shallow)
export const selectSubtotal = (s) =>
  s.items.reduce((sum, i) => sum + i.price * i.qty, 0)

export const selectItemCount = (s) => s.items.length


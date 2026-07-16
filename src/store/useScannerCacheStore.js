import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Cache store for scanned barcode products.
 * Remembers name + price for barcodes that aren't in the main inventory.
 * Structure: { [barcode]: { name, price, unit, scannedCount, lastScanned } }
 */
export const useScannerCacheStore = create(
  persist(
    (set, get) => ({
      cache: {},

      getByBarcode: (barcode) => {
        const entry = get().cache[barcode]
        return entry ?? null
      },

      saveBarcode: (barcode, { name, price, unit = 'UND' }) => {
        set((s) => ({
          cache: {
            ...s.cache,
            [barcode]: {
              name: name.trim(),
              price: Number(price),
              unit,
              scannedCount: (s.cache[barcode]?.scannedCount ?? 0) + 1,
              lastScanned: new Date().toISOString(),
            },
          },
        }))
      },

      removeBarcode: (barcode) => {
        set((s) => {
          const next = { ...s.cache }
          delete next[barcode]
          return { cache: next }
        })
      },

      clearCache: () => set({ cache: {} }),

      getCacheList: () => {
        const cache = get().cache
        return Object.entries(cache).map(([barcode, data]) => ({
          barcode,
          ...data,
        }))
      },
    }),
    {
      name: 'gestiva-scanner-cache',
    }
  )
)

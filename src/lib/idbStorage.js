import { get, set, del } from 'idb-keyval'

export const idbStorage = {
  getItem: async (name) => {
    try {
      const value = await get(name)
      return value || null
    } catch (error) {
      console.warn('IDB getItem error:', error)
      return null
    }
  },
  setItem: async (name, value) => {
    try {
      await set(name, value)
    } catch (error) {
      console.warn('IDB setItem error:', error)
    }
  },
  removeItem: async (name) => {
    try {
      await del(name)
    } catch (error) {
      console.warn('IDB removeItem error:', error)
    }
  },
}

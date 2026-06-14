import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const CACHE_TTL = 24 * 60 * 60 * 1000 // Fallback max cache

const API_KEY = 'fxf_blLiARmGS5OCsev2R1hP'
const FXFEED_URL = 'https://api.fxfeed.io/v2/latest'

const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar',         symbol: '$',  flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro',              symbol: '€',  flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound',     symbol: '£',  flag: '🇬🇧' },
  { code: 'COP', name: 'Colombian Peso',    symbol: '$',  flag: '🇨🇴' },
  { code: 'MXN', name: 'Mexican Peso',      symbol: '$',  flag: '🇲🇽' },
  { code: 'ARS', name: 'Argentine Peso',    symbol: '$',  flag: '🇦🇷' },
  { code: 'BRL', name: 'Brazilian Real',    symbol: 'R$', flag: '🇧🇷' },
  { code: 'CLP', name: 'Chilean Peso',      symbol: '$',  flag: '🇨🇱' },
  { code: 'PEN', name: 'Peruvian Sol',      symbol: 'S/', flag: '🇵🇪' },
  { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡',  flag: '🇨🇷' },
  { code: 'DOP', name: 'Dominican Peso',    symbol: 'RD$',flag: '🇩🇴' },
  { code: 'CAD', name: 'Canadian Dollar',   symbol: 'CA$',flag: '🇨🇦' },
  { code: 'JPY', name: 'Japanese Yen',      symbol: '¥',  flag: '🇯🇵' },
  { code: 'CHF', name: 'Swiss Franc',       symbol: 'Fr', flag: '🇨🇭' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
]

export { SUPPORTED_CURRENCIES }

const FALLBACK_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  COP: 3950,
  MXN: 17.5,
  ARS: 880,
  BRL: 5.1,
  CLP: 900,
  PEN: 3.7,
  CRC: 510,
  DOP: 59,
  CAD: 1.37,
  JPY: 155,
  CHF: 0.9,
  AUD: 1.5
}

export const useCurrencyStore = create(
  persist(
    (set, get) => ({
      baseCurrency: 'USD', // This is now the "Display" currency
      sourceCurrency: 'USD', // This is the currency of the values in the DB
      rates: FALLBACK_RATES,           
      lastFetched: null,
      loading: false,
      error: null,

      setCurrency: (code) => {
        set({ baseCurrency: code })
      },

      setSourceCurrency: (code) => {
        set({ sourceCurrency: code, baseCurrency: code })
      },

      fetchRates: async (force = false) => {
        const { lastFetched, loading } = get()
        const now = Date.now()
        
        const isStale = get().isStale()
        if (!force && !isStale) return
        if (loading) return

        set({ loading: true, error: null })
        try {
          // Fetch from FXFeed API directly
          const url = `${FXFEED_URL}?api_key=${API_KEY}&base=USD`
          const res = await fetch(url)
          if (!res.ok) throw new Error(`Exchange rate fetch failed: ${res.status}`)
          
          const data = await res.json()
          if (!data || !data.rates) throw new Error('Invalid response from FXFeed')

          set({
            rates: { ...FALLBACK_RATES, ...data.rates, USD: 1 },
            lastFetched: now,
            loading: false,
          })
        } catch (err) {
          console.warn('⚠️ Currency rate fetch failed. Using highly accurate fallback rates:', err)
          set({ 
            rates: get().rates && Object.keys(get().rates).length > 0 ? get().rates : FALLBACK_RATES,
            error: err.message, 
            loading: false 
          })
        }
      },

      // Convert a Source Amount → Current baseCurrency
      convert: (amount) => {
        const { baseCurrency, sourceCurrency, rates } = get()
        if (baseCurrency === sourceCurrency || !rates[baseCurrency] || !rates[sourceCurrency]) return amount
        
        // Convert source -> USD -> base
        const amountUSD = amount / rates[sourceCurrency]
        return amountUSD * rates[baseCurrency]
      },

      // Format a Source Amount
      format: (amount) => {
        const { baseCurrency, sourceCurrency, rates } = get()
        
        const converted = (baseCurrency === sourceCurrency || !rates[baseCurrency] || !rates[sourceCurrency])
          ? amount
          : (amount / rates[sourceCurrency]) * rates[baseCurrency]

        if (baseCurrency === 'COP') {
          const rounded = Math.round(converted)
          const formattedNumber = new Intl.NumberFormat('de-DE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(rounded)
          return `$${formattedNumber}`
        }

        return new Intl.NumberFormat('es', {
          style: 'currency',
          currency: baseCurrency,
          minimumFractionDigits: baseCurrency === 'JPY' || baseCurrency === 'CLP' ? 0 : 0,
          maximumFractionDigits: baseCurrency === 'JPY' || baseCurrency === 'CLP' ? 0 : 2,
        }).format(converted)
      },

      getSymbol: () => {
        const { baseCurrency } = get()
        return SUPPORTED_CURRENCIES.find(c => c.code === baseCurrency)?.symbol ?? '$'
      },

      isStale: () => {
        const { lastFetched } = get()
        if (!lastFetched) return true

        const now = new Date()
        const fetched = new Date(lastFetched)

        // Stale if it was fetched before today's 12:00 PM, and it is currently past 12:00 PM today.
        const noonToday = new Date()
        noonToday.setHours(12, 0, 0, 0)

        if (now >= noonToday && fetched < noonToday) {
          return true
        }

        // Hard fallback if more than 24 hours have passed
        return (now.getTime() - fetched.getTime()) >= CACHE_TTL
      },
    }),
    {
      name: 'gestiva-currency-v2',
      partialize: (state) => ({
        baseCurrency: state.baseCurrency,
        rates: state.rates,
        lastFetched: state.lastFetched,
      }),
    }
  )
)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Static rates — no external API needed.
// Update these values manually if you need to refresh them.
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

const STATIC_RATES = {
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
      baseCurrency: 'USD',
      sourceCurrency: 'USD',
      rates: STATIC_RATES,
      lastFetched: null,
      loading: false,
      error: null,

      setCurrency: (code) => {
        set({ baseCurrency: code })
      },

      setSourceCurrency: (code) => {
        set({ sourceCurrency: code, baseCurrency: code })
      },

      // No-op: kept so existing callers don't break
      fetchRates: async () => {},

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

      // No-op: rates are now static, never stale
      isStale: () => false,
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

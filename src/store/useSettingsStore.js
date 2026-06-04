import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuthStore } from './useAuthStore'

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // ── Notification preferences ──────────────────────────
      notifications: {
        invoicePaid:    true,
        invoiceOverdue: true,
        lowStock:       true,
        newClient:      false,
        weeklyReport:   false,
        pushEnabled:    false,
      },
      setNotification: (key, value) => {
        set((s) => ({ notifications: { ...s.notifications, [key]: value } }))
        get().saveToDB()
      },

      // ── Resend Config ──────────────────────────────────────
      resend: {
        enabled: true,
        onInvoice: true,
        onPayment: true,
        onOverdue: true,
        onWelcome: true,
        onWeeklyReport: false,
      },
      setResend: (data) => {
        set((s) => ({ resend: { ...s.resend, ...data } }))
        get().saveToDB()
      },
      testResend: async (toEmail) => {
        try {
          const { sendTestEmail } = await import('../services/emailService')
          const auth = useAuthStore.getState()
          const company = {
            companyName: auth.user?.companyName || 'GestivaOne',
            companyLogo: auth.user?.companyLogo || null,
            companyEmail: auth.user?.email || ''
          }
          const res = await sendTestEmail(toEmail, company)
          return { ok: res.success, msg: res.success ? 'Correo de prueba enviado con éxito' : (res.error || 'Error al enviar') }
        } catch (e) {
          console.error(e)
          return { ok: false, msg: 'Error al importar servicio de correos' }
        }
      },

      // ── WhatsApp Business ──────────────────────────────────
      whatsapp: {
        phoneNumber: '',
        apiKey:      '',
        enabled:     false,
      },
      setWhatsapp: (data) => {
        set((s) => ({ whatsapp: { ...s.whatsapp, ...data } }))
        get().saveToDB()
      },

      // ── API REST backend ───────────────────────────────────
      api: {
        url:     '',
        apiKey:  '',
        enabled: false,
        lastPing: null,
        status: 'disconnected', // 'connected' | 'disconnected' | 'testing'
      },
      setApi: (data) => {
        set((s) => ({ api: { ...s.api, ...data } }))
        get().saveToDB()
      },
      testApi: async () => {
        const { api } = get()
        if (!api.url) return { ok: false, msg: 'Ingresa la URL de la API primero' }
        set((s) => ({ api: { ...s.api, status: 'testing' } }))
        try {
          const res = await fetch(`${api.url}/health`, { signal: AbortSignal.timeout(4000) })
          const ok = res.ok
          set((s) => ({ api: { ...s.api, status: ok ? 'connected' : 'disconnected', lastPing: Date.now() } }))
          get().saveToDB()
          return { ok, msg: ok ? 'Conexión exitosa' : `Error HTTP ${res.status}` }
        } catch (e) {
          set((s) => ({ api: { ...s.api, status: 'disconnected', lastPing: Date.now() } }))
          get().saveToDB()
          return { ok: false, msg: 'No se pudo conectar' }
        }
      },

      // ── Thermal Printer Config ──────────────────────────────
      printer: {
        autoPrint: false,
        template: 'classic',
        pdfTemplate: 'corporate',
        showLogo: true,
        showCompanyName: true,
        showProducts: true,
        showContact: true,
        showTax: false,
        footerText: '¡Gracias por su compra!',
        themeColor: 'indigo',
      },
      setPrinter: (data) => {
        set((s) => ({ printer: { ...s.printer, ...data } }))
        get().saveToDB()
      },

      // ── Database Sync Helpers ──────────────────────────────
      loadFromSettings: (dbSettings) => {
        if (!dbSettings) return
        set({
          notifications: dbSettings.notifications || get().notifications,
          resend:        dbSettings.resend || get().resend,
          whatsapp:      dbSettings.whatsapp || get().whatsapp,
          api:           dbSettings.api || get().api,
          printer:       dbSettings.printer || get().printer,
        })
      },

      saveToDB: async () => {
        try {
          const auth = useAuthStore.getState()
          if (auth.isAuthenticated && auth.user?.companyId) {
            const newSettings = {
              ...(auth.user.settings || {}),
              notifications: get().notifications,
              resend: get().resend,
              whatsapp: get().whatsapp,
              api: get().api,
              printer: get().printer,
            }
            await auth.updateProfile({ settings: newSettings })
          }
        } catch (err) {
          console.warn('Error saving settings to DB:', err)
        }
      }
    }),
    { name: 'gestiva-settings-v2.3' }
  )
)

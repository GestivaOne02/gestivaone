import {
  invoiceTemplate,
  overdueTemplate,
  paymentConfirmTemplate,
  welcomeTemplate,
  workerInviteTemplate,
  weeklyReportTemplate,
  resetWorkspaceTemplate,
  testEmailTemplate
} from './emailTemplates'
import { useSettingsStore } from '../store/useSettingsStore'

const RESEND_API_URL = 'https://api.resend.com/emails'
const FROM_EMAIL = 'GestivaOne <onboarding@resend.dev>'

async function callResendAPI({ to, subject, html, replyTo }) {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY
  if (!apiKey) {
    console.warn('⚠️ No Resend API key found in VITE_RESEND_API_KEY')
    return { success: false, error: 'Falta la API Key de Resend' }
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        reply_to: replyTo || undefined
      })
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      console.error('❌ Resend API Error:', errData)
      return { success: false, error: errData.message || `Error HTTP ${response.status}` }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('❌ Resend email send catch error:', error)
    return { success: false, error: error.message || 'Error de red' }
  }
}

export async function sendInvoiceEmail(invoice, clientEmail, company = {}) {
  const settings = useSettingsStore.getState().resend
  if (settings && (!settings.enabled || !settings.onInvoice)) {
    return { success: false, error: 'Envío de facturas por correo desactivado en configuración' }
  }

  if (!clientEmail || clientEmail === 'correo-cliente@express.com') {
    return { success: false, error: 'Email de cliente no válido' }
  }

  const invoiceId = (invoice.id?.slice(-8) || invoice.id || '').toUpperCase()
  const subject = `Factura #${invoiceId} de ${company.companyName || 'GestivaOne'}`
  const html = invoiceTemplate(invoice, company)

  return await callResendAPI({
    to: clientEmail,
    subject,
    html,
    replyTo: company.companyEmail
  })
}

export async function sendOverdueEmail(invoice, clientEmail, company = {}) {
  const settings = useSettingsStore.getState().resend
  if (settings && (!settings.enabled || !settings.onOverdue)) {
    return { success: false, error: 'Aviso de mora desactivado en configuración' }
  }

  if (!clientEmail || clientEmail === 'correo-cliente@express.com') {
    return { success: false, error: 'Email de cliente no válido' }
  }

  const invoiceId = (invoice.id?.slice(-8) || invoice.id || '').toUpperCase()
  const subject = `⚠️ PAGO VENCIDO: Factura #${invoiceId} de ${company.companyName || 'GestivaOne'}`
  const html = overdueTemplate(invoice, company)

  return await callResendAPI({
    to: clientEmail,
    subject,
    html,
    replyTo: company.companyEmail
  })
}

export async function sendPaymentConfirmEmail(invoice, clientEmail, company = {}) {
  const settings = useSettingsStore.getState().resend
  if (settings && (!settings.enabled || !settings.onPayment)) {
    return { success: false, error: 'Confirmación de pago desactivada en configuración' }
  }

  if (!clientEmail || clientEmail === 'correo-cliente@express.com') {
    return { success: false, error: 'Email de cliente no válido' }
  }

  const invoiceId = (invoice.id?.slice(-8) || invoice.id || '').toUpperCase()
  const subject = `✅ Pago Confirmado - Factura #${invoiceId}`
  const html = paymentConfirmTemplate(invoice, company)

  return await callResendAPI({
    to: clientEmail,
    subject,
    html,
    replyTo: company.companyEmail
  })
}

export async function sendWelcomeEmail(user, company = {}) {
  const settings = useSettingsStore.getState().resend
  // Welcome email might not check onWelcome or settings during signup if settings store is not loaded yet,
  // but let's check settings.enabled and settings.onWelcome if available.
  if (settings && (!settings.enabled || !settings.onWelcome)) {
    return { success: false, error: 'Correo de bienvenida desactivado en configuración' }
  }

  const toEmail = user.email
  if (!toEmail) return { success: false, error: 'Email de usuario vacío' }

  const subject = `¡Bienvenido a GestivaOne! 🎉`
  const html = welcomeTemplate(user, company)

  return await callResendAPI({
    to: toEmail,
    subject,
    html
  })
}

export async function sendWorkerInviteEmail(invite, company = {}) {
  const toEmail = invite.workerEmail
  if (!toEmail) return { success: false, error: 'Email de trabajador vacío' }

  const subject = `👷 Invitación para unirte a ${company.companyName || 'GestivaOne'}`
  const html = workerInviteTemplate(invite, company)

  return await callResendAPI({
    to: toEmail,
    subject,
    html,
    replyTo: company.companyEmail
  })
}

export async function sendWeeklyReportEmail(stats, toEmail, company = {}) {
  const settings = useSettingsStore.getState().resend
  if (settings && (!settings.enabled || !settings.onWeeklyReport)) {
    return { success: false, error: 'Reporte semanal desactivado en configuración' }
  }

  if (!toEmail) return { success: false, error: 'Email de destino vacío' }

  const subject = `📊 Reporte Semanal de Ventas - ${company.companyName || 'GestivaOne'}`
  const html = weeklyReportTemplate(stats, company)

  return await callResendAPI({
    to: toEmail,
    subject,
    html
  })
}

export async function sendResetWorkspaceEmail(toEmail, company = {}) {
  if (!toEmail) return { success: false, error: 'Email de destino vacío' }

  const subject = `🗑️ Espacio de trabajo limpiado - ${company.companyName || 'GestivaOne'}`
  const html = resetWorkspaceTemplate(company)

  return await callResendAPI({
    to: toEmail,
    subject,
    html
  })
}

export async function sendTestEmail(toEmail, company = {}) {
  if (!toEmail) return { success: false, error: 'Email de destino vacío' }

  const subject = `🧪 Correo de Prueba - GestivaOne`
  const html = testEmailTemplate(company)

  return await callResendAPI({
    to: toEmail,
    subject,
    html
  })
}

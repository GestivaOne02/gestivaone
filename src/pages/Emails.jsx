import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Send, AlertCircle, CheckCircle2, User, Sparkles,
  MessageSquare, Info, Star, Percent, ShoppingBag, Search,
  Eye, Check, Copy, RefreshCw, Layers
} from 'lucide-react'
import { useClientStore } from '@/store/useClientStore'
import { useInvoiceStore } from '@/store/useInvoiceStore'
import { useAuthStore } from '@/store/useAuthStore'
import { sendCustomCampaignEmail } from '@/services/emailService'
import toast from 'react-hot-toast'

// Default templates
const TEMPLATES = [
  {
    id: 'promo',
    name: 'Oferta Especial de Producto',
    subject: '¡Tenemos algo especial para ti en {{empresa}}! 🌟',
    body: `<p>Hola {{cliente}},</p>
<p>Hemos notado que te encanta el producto <strong>{{producto}}</strong>. ¡Por eso queremos consentirte!</p>
<p>Durante esta semana, te ofrecemos un <strong>15% de descuento</strong> exclusivo en tu próxima compra de {{producto}} o productos relacionados.</p>
<p>Usa el código de descuento: <strong>PROMO15</strong> o simplemente respóndenos a este correo para preparar tu orden.</p>
<p>¡Esperamos verte pronto!</p>`,
  },
  {
    id: 'fidelidad',
    name: 'Agradecimiento VIP / Fidelidad',
    subject: 'Gracias por ser un cliente tan especial para {{empresa}} 💖',
    body: `<p>Estimado/a {{cliente}},</p>
<p>Queríamos escribirte personalmente para agradecer tu confianza continua en {{empresa}}.</p>
<p>Clientes como tú hacen que nuestro trabajo valga la pena. Queremos ofrecerte envío gratuito y prioridad en tus pedidos durante todo este mes.</p>
<p>No necesitas ningún código, tu beneficio ya está activo en tu cuenta.</p>
<p>¡Un fuerte abrazo!</p>`,
  },
  {
    id: 'reactivacion',
    name: 'Campaña de Reactivación',
    subject: '¡Te extrañamos en {{empresa}}! Recibe un regalo especial 🎁',
    body: `<p>Hola {{cliente}},</p>
<p>Hace algún tiempo que no sabemos de ti y te extrañamos por aquí.</p>
<p>Queremos invitarte a conocer nuestras últimas novedades y, para darte la bienvenida de nuevo, te regalamos un obsequio especial en tu próxima compra.</p>
<p>Visítanos o escríbenos para hacer válido tu regalo.</p>
<p>¡Te esperamos!</p>`,
  }
]

export default function Emails() {
  const clients = useClientStore((s) => s.clients)
  const invoices = useInvoiceStore((s) => s.invoices)
  const user = useAuthStore((s) => s.user)

  // Tab: 'campaign' (composer/history) or 'affinities' (tendencies)
  const [activeTab, setActiveTab] = useState('campaign')

  // Campaign State
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0])
  const [subject, setSubject] = useState(TEMPLATES[0].subject)
  const [body, setBody] = useState(TEMPLATES[0].body)
  const [targetSegment, setTargetSegment] = useState('all') // 'all', 'vip', 'activo', 'tibio', 'inactivo', 'nuevo'
  const [customClientFilter, setCustomClientFilter] = useState('all') // 'all' or product-id for affinity
  const [sending, setSending] = useState(false)
  const [copiedText, setCopiedText] = useState(null)

  // --- Tendency & Product Affinity Analyzer ---
  // Calculates for each client: their most purchased product, total orders, and potential recommendation
  const clientAffinities = useMemo(() => {
    return clients.map((client) => {
      const clientInvoices = invoices.filter((inv) => inv.client_id === client.id && inv.payment_status === 'paid')
      
      // Count frequency of each product purchased
      const productCounts = {}
      let totalSpent = 0
      
      clientInvoices.forEach((inv) => {
        totalSpent += inv.total || 0
        if (inv.items && Array.isArray(inv.items)) {
          inv.items.forEach((item) => {
            const prodName = item.name || item.product_name || 'Otros'
            productCounts[prodName] = (productCounts[prodName] || 0) + (item.qty || 1)
          })
        }
      })

      // Find the product with highest purchase quantity/frequency
      let favoriteProduct = 'Ninguno'
      let maxQty = 0
      Object.entries(productCounts).forEach(([name, count]) => {
        if (count > maxQty) {
          maxQty = count
          favoriteProduct = name
        }
      })

      return {
        ...client,
        favoriteProduct,
        favoriteProductCount: maxQty,
        totalOrders: clientInvoices.length,
        totalSpent
      }
    })
  }, [clients, invoices])

  // Get a unique list of all products purchased to filter by affinity
  const allPurchasedProducts = useMemo(() => {
    const prods = new Set()
    invoices.forEach((inv) => {
      if (inv.items && Array.isArray(inv.items)) {
        inv.items.forEach((item) => {
          if (item.name || item.product_name) prods.add(item.name || item.product_name)
        })
      }
    })
    return Array.from(prods)
  }, [invoices])

  // Target clients selected based on current filters
  const targetClients = useMemo(() => {
    return clientAffinities.filter((client) => {
      // 1. Filter by Segment
      if (targetSegment !== 'all') {
        const daysSinceLast = client.last_purchase
          ? Math.round((Date.now() - new Date(client.last_purchase)) / (1000 * 60 * 60 * 24))
          : Infinity
        
        let segment = 'nuevo'
        if (client.totalOrders === 0) segment = 'nuevo'
        else if (daysSinceLast <= 30 && client.totalOrders >= 5) segment = 'vip'
        else if (daysSinceLast <= 30) segment = 'activo'
        else if (daysSinceLast <= 90) segment = 'tibio'
        else segment = 'inactivo'

        if (segment !== targetSegment) return false
      }

      // 2. Filter by Product Affinity
      if (customClientFilter !== 'all') {
        if (client.favoriteProduct !== customClientFilter) return false
      }

      return !!client.email || !!client.phone
    })
  }, [clientAffinities, targetSegment, customClientFilter])

  // Apply template selection
  const handleTemplateChange = (tmpl) => {
    setSelectedTemplate(tmpl)
    setSubject(tmpl.subject)
    setBody(tmpl.body)
  }

  // Interpolate placeholders
  const personalizeMessage = (text, clientName, favoriteProduct = 'nuestros productos') => {
    return text
      .replace(/{{cliente}}/g, clientName || 'Cliente')
      .replace(/{{empresa}}/g, user?.companyName || 'nuestra empresa')
      .replace(/{{producto}}/g, favoriteProduct)
  }

  // --- Trigger Campaigns ---
  const handleSendEmails = async () => {
    if (targetClients.length === 0) {
      toast.error('No hay clientes destinatarios válidos seleccionados')
      return
    }

    setSending(true)
    let successCount = 0
    let failCount = 0

    const companyData = {
      companyName: user?.companyName || 'GestivaOne',
      companyLogo: user?.companyLogo || null,
      companyEmail: user?.email || '',
      companyPhone: user?.phone || ''
    }

    // Process sequentially (respect rate limiting / API overhead)
    for (const client of targetClients) {
      if (!client.email || client.email === 'correo-cliente@express.com') {
        failCount++
        continue
      }

      const clientSubject = personalizeMessage(subject, client.name, client.favoriteProduct)
      const clientBody = personalizeMessage(body, client.name, client.favoriteProduct)

      const result = await sendCustomCampaignEmail({
        to: client.email,
        subject: clientSubject,
        htmlBody: clientBody,
        company: companyData
      })

      if (result.success) {
        successCount++
      } else {
        failCount++
      }
    }

    setSending(false)
    toast.success(`Campaña finalizada. Enviados: ${successCount}. Fallidos: ${failCount}.`)
  }

  // --- Copy WhatsApp Message ---
  const handleCopyWhatsApp = (client) => {
    const baseMsg = personalizeMessage(body.replace(/<[^>]*>/g, '\n'), client.name, client.favoriteProduct)
    const link = `https://api.whatsapp.com/send?phone=${client.phone.replace(/\+/g, '')}&text=${encodeURIComponent(baseMsg)}`
    
    // Open in new window
    window.open(link, '_blank')
    toast.success('Abriendo WhatsApp...')
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Mail size={20} className="text-brand-400" />
            Campañas de Correo & WhatsApp
          </h1>
          <p className="text-xs text-muted-400 mt-0.5">
            Comunícate con tus clientes basándote en sus hábitos de compra reales
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-1 mb-5 border-b border-subtle pb-2">
        <button
          onClick={() => setActiveTab('campaign')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
            activeTab === 'campaign'
              ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
              : 'text-muted-400 hover:text-foreground hover:bg-surface-700/60'
          }`}
        >
          <Send size={14} />
          Enviar Campaña
        </button>
        <button
          onClick={() => setActiveTab('affinities')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
            activeTab === 'affinities'
              ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
              : 'text-muted-400 hover:text-foreground hover:bg-surface-700/60'
          }`}
        >
          <Layers size={14} />
          Analizador de Preferencias
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'campaign' ? (
          <motion.div
            key="composer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left: Settings & Targeting */}
            <div className="lg:col-span-1 space-y-4">
              {/* Target segment */}
              <div className="bg-surface-800/60 border border-subtle rounded-2xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
                  <Layers size={14} className="text-brand-400" />
                  1. Filtrar Audiencia
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-muted-400 mb-1.5">Por Segmento CRM</label>
                    <select
                      value={targetSegment}
                      onChange={(e) => setTargetSegment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-900 border border-subtle text-xs text-foreground focus:outline-none focus:border-brand-500"
                    >
                      <option value="all">Todos los clientes</option>
                      <option value="vip">VIP (Frecuentes y recientes)</option>
                      <option value="activo">Activos</option>
                      <option value="tibio">Tibios</option>
                      <option value="inactivos">Inactivos (Requieren reactivación)</option>
                      <option value="nuevo">Nuevos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-muted-400 mb-1.5">Por Preferencia de Producto (Afinidad)</label>
                    <select
                      value={customClientFilter}
                      onChange={(e) => setCustomClientFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-900 border border-subtle text-xs text-foreground focus:outline-none focus:border-brand-500"
                    >
                      <option value="all">Cualquier producto</option>
                      {allPurchasedProducts.map((p) => (
                        <option key={p} value={p}>Preferencia por: {p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-surface-900/60 border border-subtle/50 rounded-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-400">Destinatarios filtrados:</span>
                    <span className="font-bold text-brand-400">{targetClients.length} clientes</span>
                  </div>
                </div>
              </div>

              {/* Email templates */}
              <div className="bg-surface-800/60 border border-subtle rounded-2xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
                  <Star size={14} className="text-amber-400" />
                  2. Cargar Plantilla
                </h3>
                <div className="space-y-2">
                  {TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => handleTemplateChange(tmpl)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        selectedTemplate.id === tmpl.id
                          ? 'bg-brand-600/10 border-brand-500/40 text-brand-300'
                          : 'bg-surface-900/60 border-subtle hover:bg-surface-900/90 text-muted-400 hover:text-foreground'
                      }`}
                    >
                      <p className="font-bold">{tmpl.name}</p>
                      <p className="text-[10px] text-muted-500 mt-1 truncate">{tmpl.subject}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Message Composer & Live Preview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-surface-800/60 border border-subtle rounded-2xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-brand-400" />
                  3. Personalizar Mensaje
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-muted-400 mb-1">Asunto del Correo</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-900 border border-subtle text-xs text-foreground focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-muted-400 mb-1">Contenido (HTML / Texto)</label>
                    <textarea
                      rows={8}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-900 border border-subtle text-xs text-foreground font-mono focus:outline-none focus:border-brand-500"
                    />
                    <div className="flex gap-2 flex-wrap mt-1">
                      {['{{cliente}}', '{{empresa}}', '{{producto}}'].map((ph) => (
                        <button
                          key={ph}
                          onClick={() => setBody(body + ph)}
                          className="px-2 py-1 rounded bg-surface-700/60 text-muted-400 text-[10px] font-mono hover:text-foreground hover:bg-surface-700"
                        >
                          {ph}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview Box */}
                <div className="mt-4 border border-dashed border-subtle rounded-xl p-3 bg-surface-900/40">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-500 font-bold uppercase mb-2">
                    <Eye size={12} />
                    Previsualización (Ejemplo: {targetClients[0]?.name || 'Cliente Demo'})
                  </div>
                  <div className="p-3 bg-white text-gray-800 rounded-lg text-xs leading-relaxed max-w-full overflow-hidden">
                    <p className="font-bold border-b pb-1.5 mb-2 text-[11px] text-gray-400">
                      Asunto: {personalizeMessage(subject, targetClients[0]?.name, targetClients[0]?.favoriteProduct)}
                    </p>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: personalizeMessage(body, targetClients[0]?.name, targetClients[0]?.favoriteProduct)
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 flex gap-2 justify-end">
                  <button
                    onClick={handleSendEmails}
                    disabled={sending || targetClients.length === 0}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-xs font-bold text-white transition-colors"
                  >
                    {sending ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Enviar Correo a {targetClients.length} Clientes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Preferences / Affinities Analyzer Tab */
          <motion.div
            key="affinities"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-4"
          >
            <div className="p-4 bg-surface-800/60 border border-subtle rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                <Info size={14} className="text-brand-400" />
                ¿Cómo funciona la afinidad de producto?
              </h3>
              <p className="text-xs text-muted-400 leading-relaxed">
                El sistema CRM escanea las facturas completadas y pagadas de cada cliente, agrupa los ítems adquiridos, y calcula qué producto compran con más frecuencia. 
                Úsalo para enviarles promociones directas a su email o WhatsApp en un solo clic.
              </p>
            </div>

            <div className="bg-surface-800/40 border border-subtle rounded-2xl overflow-hidden">
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1.5fr_100px] gap-3 px-4 py-2.5 border-b border-subtle bg-surface-800/60">
                {['Cliente', 'Total Gastado', 'Pedidos Pagados', 'Producto de Mayor Tendencia', 'Acción Rápida'].map((h) => (
                  <p key={h} className="text-[10px] uppercase tracking-wider text-muted-500 font-bold">{h}</p>
                ))}
              </div>

              <div className="divide-y divide-subtle/50">
                {clientAffinities.length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle size={32} className="mx-auto text-muted-600 mb-2" />
                    <p className="text-xs text-muted-500">Sin historial de ventas para analizar</p>
                  </div>
                )}
                {clientAffinities.map((client) => (
                  <div
                    key={client.id}
                    className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1.5fr_100px] gap-2 md:gap-3 px-4 py-3 items-center hover:bg-surface-700/20 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">{client.name}</p>
                      <p className="text-[10px] text-muted-500">{client.email || client.phone || '—'}</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(client.totalSpent)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-foreground font-medium">{client.totalOrders} órdenes</p>
                    </div>

                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-300 border border-brand-500/20">
                        <ShoppingBag size={10} />
                        {client.favoriteProduct} ({client.favoriteProductCount} unids)
                      </span>
                    </div>

                    <div className="flex gap-1.5 justify-end">
                      {client.phone && client.phone !== '—' && (
                        <button
                          onClick={() => handleCopyWhatsApp(client)}
                          title="Enviar Oferta por WhatsApp"
                          className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                        >
                          <MessageSquare size={13} />
                        </button>
                      )}
                      
                      {client.email && client.email !== 'correo-cliente@express.com' && (
                        <button
                          onClick={() => {
                            setCustomClientFilter(client.favoriteProduct)
                            setActiveTab('campaign')
                            toast.success(`Filtro por afinidad aplicado a ${client.favoriteProduct}`)
                          }}
                          title="Crear campaña para este producto"
                          className="p-2 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/20 transition-colors"
                        >
                          <Mail size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

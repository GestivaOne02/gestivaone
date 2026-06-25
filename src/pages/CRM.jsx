import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Search, ChevronRight, Phone, Mail, MapPin, TrendingUp,
  ShoppingCart, Calendar, Star, ArrowLeft, Clock, DollarSign,
  Activity, Tag, Filter, UserPlus, FileText, BarChart3, Eye,
  X, Sparkles, Crown, ThermometerSun, Snowflake, UserCheck,
  User, Building2, Globe
} from 'lucide-react'
import { useClientStore } from '@/store/useClientStore'
import { useInvoiceStore } from '@/store/useInvoiceStore'
import { useCRMStore } from '@/store/useCRMStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// ── Passport & Type Icons ──────────────────────────────────
const PassportIcon = ({ size = 14, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M8 3v18" />
    <circle cx="13.5" cy="11.5" r="2.5" />
    <path d="M12 9a4 4 0 0 1 3 0" />
    <path d="M11 17h5" />
  </svg>
)

const getClientIcon = (docType) => {
  const code = String(docType)
  const cls = "text-brand-700 dark:text-brand-300 font-bold"
  if (code === '13') return <User size={14} className={cls} />
  if (code === '31') return <Building2 size={14} className={cls} />
  if (code === '22') return <Globe size={14} className={cls} />
  if (code === '41') return <PassportIcon size={14} className={cls} />
  return <User size={14} className={cls} />
}

// ── Formatters ────────────────────────────────────────────
const fmtCOP = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0)

const SEGMENT_CONFIG = {
  vip:      { label: 'VIP',       color: 'text-amber-400',   bg: 'bg-amber-500/15',  border: 'border-amber-500/30', icon: Crown },
  activo:   { label: 'Activo',    color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', icon: UserCheck },
  tibio:    { label: 'Tibio',     color: 'text-orange-400',  bg: 'bg-orange-500/15',  border: 'border-orange-500/30', icon: ThermometerSun },
  inactivo: { label: 'Inactivo',  color: 'text-red-400',     bg: 'bg-red-500/15',     border: 'border-red-500/30', icon: Snowflake },
  nuevo:    { label: 'Nuevo',     color: 'text-blue-400',    bg: 'bg-blue-500/15',    border: 'border-blue-500/30', icon: Sparkles },
}

// ── Segment Badge Component ────────────────────────────────
function SegmentBadge({ segment }) {
  const cfg = SEGMENT_CONFIG[segment] || SEGMENT_CONFIG.nuevo
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  )
}

// ── Metric Card ────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  return (
    <div className="bg-surface-800/60 border border-subtle rounded-xl p-3 flex items-start gap-3">
      <div className={`w-9 h-9 rounded-lg bg-${color}-500/15 flex items-center justify-center shrink-0`}>
        <Icon size={16} className={`text-${color}-400`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-400 font-bold">{label}</p>
        <p className="text-sm font-bold text-foreground truncate">{value}</p>
        {sub && <p className="text-[10px] text-muted-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Activity Item ──────────────────────────────────────────
function ActivityItem({ activity }) {
  const typeIcons = {
    sale: ShoppingCart,
    note: FileText,
    call: Phone,
    email: Mail,
    status_change: Tag,
  }
  const Icon = typeIcons[activity.type] || Activity
  const typeLabels = {
    sale: 'Venta',
    note: 'Nota',
    call: 'Llamada',
    email: 'Email',
    status_change: 'Cambio',
  }

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-subtle/50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-surface-700/60 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-muted-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground font-medium">{activity.description}</p>
        <p className="text-[10px] text-muted-500 mt-0.5 flex items-center gap-1">
          <Clock size={9} />
          {activity.created_at ? format(new Date(activity.created_at), "dd MMM yyyy, HH:mm", { locale: es }) : '—'}
          <span className="ml-1 px-1.5 py-0.5 rounded bg-surface-700/60 text-[9px] uppercase font-bold">
            {typeLabels[activity.type] || activity.type}
          </span>
        </p>
      </div>
    </div>
  )
}

// ── Client Detail Panel ────────────────────────────────────
function ClientDetail({ client, onBack, invoices, activities }) {
  const metrics = useCRMStore.getState().getClientMetrics(client.id, invoices)
  const clientInvoices = invoices
    .filter((i) => i.client_id === client.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 15)

  const clientActivities = activities
    .filter((a) => a.client_id === client.id)
    .slice(0, 20)

  const [tab, setTab] = useState('overview')

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-surface-800/60 border border-subtle text-muted-400 hover:text-white hover:bg-surface-700 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-foreground truncate">{client.name}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <SegmentBadge segment={metrics.segment} />
            {client.type && (
              <span className="text-[10px] text-muted-500 uppercase font-medium">
                {client.type === 'frequent' ? 'Frecuente' : client.type}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        {client.phone && (
          <div className="flex items-center gap-2 text-xs text-muted-400">
            <Phone size={12} /> {client.phone}
          </div>
        )}
        {client.email && (
          <div className="flex items-center gap-2 text-xs text-muted-400">
            <Mail size={12} /> <span className="truncate">{client.email}</span>
          </div>
        )}
        {client.address && (
          <div className="flex items-center gap-2 text-xs text-muted-400">
            <MapPin size={12} /> <span className="truncate">{client.address}</span>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        <MetricCard icon={DollarSign} label="LTV (Valor Total)" value={fmtCOP(metrics.totalSpent)} color="brand" />
        <MetricCard icon={ShoppingCart} label="Compras" value={metrics.purchaseCount} sub={`${metrics.totalInvoices} facturas totales`} color="emerald" />
        <MetricCard icon={TrendingUp} label="Ticket Promedio" value={fmtCOP(metrics.avgTicket)} color="blue" />
        <MetricCard
          icon={Calendar}
          label="Última Compra"
          value={metrics.lastPurchase ? format(new Date(metrics.lastPurchase), 'dd MMM yyyy', { locale: es }) : 'Nunca'}
          sub={metrics.daysSinceLast < Infinity ? `Hace ${metrics.daysSinceLast} días` : ''}
          color="amber"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3 border-b border-subtle pb-2">
        {[
          { id: 'overview', label: 'Historial de Compras', icon: ShoppingCart },
          { id: 'activity', label: 'Actividades', icon: Activity },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === t.id
                ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                : 'text-muted-400 hover:text-foreground hover:bg-surface-700/60'
            }`}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {tab === 'overview' && (
          <div className="space-y-1">
            {clientInvoices.length === 0 && (
              <p className="text-xs text-muted-500 text-center py-8">Sin historial de compras</p>
            )}
            {clientInvoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-800/40 border border-subtle/50 hover:bg-surface-700/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-surface-700/60 flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-muted-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    #{(inv.id || '').slice(-8).toUpperCase()}
                  </p>
                  <p className="text-[10px] text-muted-500">
                    {inv.created_at ? format(new Date(inv.created_at), 'dd MMM yyyy', { locale: es }) : '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground">{fmtCOP(inv.total)}</p>
                  <p className={`text-[10px] font-bold uppercase ${
                    inv.payment_status === 'paid' ? 'text-emerald-400' :
                    inv.payment_status === 'overdue' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {inv.payment_status === 'paid' ? 'Pagada' : inv.payment_status === 'overdue' ? 'Mora' : 'Pendiente'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'activity' && (
          <div>
            {clientActivities.length === 0 && (
              <p className="text-xs text-muted-500 text-center py-8">Sin actividades registradas</p>
            )}
            {clientActivities.map((a) => (
              <ActivityItem key={a.id} activity={a} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Main CRM Page ──────────────────────────────────────────
export default function CRM() {
  const clients = useClientStore((s) => s.clients)
  const fetchClients = useClientStore((s) => s.fetchClients)
  const invoices = useInvoiceStore((s) => s.invoices)
  const fetchInvoices = useInvoiceStore((s) => s.fetchInvoices)
  const { activities, fetchActivities, getSegmentDistribution, getTopClients } = useCRMStore()

  const [search, setSearch] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('all')
  const [selectedClient, setSelectedClient] = useState(null)

  useEffect(() => {
    fetchClients()
    fetchInvoices()
    fetchActivities()
  }, [])

  // Enrich clients with metrics
  const enrichedClients = useMemo(() => {
    return clients.map((c) => ({
      ...c,
      metrics: useCRMStore.getState().getClientMetrics(c.id, invoices),
    }))
  }, [clients, invoices])

  // Filter
  const filtered = useMemo(() => {
    let list = enrichedClients
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.includes(q)
      )
    }
    if (segmentFilter !== 'all') {
      list = list.filter((c) => c.metrics.segment === segmentFilter)
    }
    return list.sort((a, b) => b.metrics.totalSpent - a.metrics.totalSpent)
  }, [enrichedClients, search, segmentFilter])

  // Dashboard metrics
  const segments = useMemo(
    () => getSegmentDistribution(clients, invoices),
    [clients, invoices]
  )
  const totalLTV = useMemo(
    () => enrichedClients.reduce((sum, c) => sum + c.metrics.totalSpent, 0),
    [enrichedClients]
  )
  const avgTicketGlobal = useMemo(() => {
    const paid = invoices.filter((i) => i.payment_status === 'paid')
    return paid.length > 0 ? paid.reduce((s, i) => s + (i.total || 0), 0) / paid.length : 0
  }, [invoices])

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users size={20} className="text-brand-400" />
            CRM — Relación con Clientes
          </h1>
          <p className="text-xs text-muted-400 mt-0.5">
            Gestión inteligente, métricas y segmentación automática
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-500">{clients.length} clientes</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedClient ? (
          <ClientDetail
            key="detail"
            client={selectedClient}
            onBack={() => setSelectedClient(null)}
            invoices={invoices}
            activities={activities}
          />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-5">
              <MetricCard icon={DollarSign} label="LTV Total" value={fmtCOP(totalLTV)} color="brand" />
              <MetricCard icon={TrendingUp} label="Ticket Promedio" value={fmtCOP(avgTicketGlobal)} color="blue" />
              <MetricCard icon={Crown} label="VIP" value={segments.vip} sub="clientes top" color="amber" />
              <MetricCard icon={UserCheck} label="Activos" value={segments.activo} color="emerald" />
              <MetricCard icon={Snowflake} label="Inactivos" value={segments.inactivo} sub="requieren atención" color="red" />
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-500" />
                <input
                  type="text"
                  placeholder="Buscar cliente por nombre, email o teléfono..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-800 border border-subtle text-xs text-foreground placeholder:text-muted-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <div className="flex gap-1 flex-wrap">
                {[
                  { id: 'all', label: 'Todos' },
                  ...Object.entries(SEGMENT_CONFIG).map(([id, cfg]) => ({ id, label: cfg.label }))
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSegmentFilter(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                      segmentFilter === s.id
                        ? 'bg-brand-600/20 text-brand-400 border-brand-500/30'
                        : 'bg-surface-800/60 text-muted-400 border-subtle hover:text-foreground hover:bg-surface-700/60'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Client Table */}
            <div className="bg-surface-800/40 border border-subtle rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] gap-3 px-4 py-2.5 border-b border-subtle bg-surface-800/60">
                {['Cliente', 'Segmento', 'Compras', 'LTV', 'Última Compra', ''].map((h) => (
                  <p key={h} className="text-[10px] uppercase tracking-wider text-muted-500 font-bold">{h}</p>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-subtle/50">
                {filtered.length === 0 && (
                  <div className="text-center py-12">
                    <Users size={32} className="mx-auto text-muted-600 mb-2" />
                    <p className="text-xs text-muted-500">No se encontraron clientes</p>
                  </div>
                )}
                {filtered.map((client, idx) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => setSelectedClient(client)}
                    className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] gap-1 md:gap-3 px-4 py-3 cursor-pointer hover:bg-surface-700/30 transition-colors group"
                  >
                    {/* Name + contact */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-brand-500/15 flex items-center justify-center shrink-0">
                        {getClientIcon(client.document_type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{client.name}</p>
                        <p className="text-[10px] text-muted-500 truncate">
                          {client.email || client.phone || '—'}
                        </p>
                      </div>
                    </div>

                    {/* Segment */}
                    <div className="flex items-center">
                      <SegmentBadge segment={client.metrics.segment} />
                    </div>

                    {/* Purchases */}
                    <div className="flex items-center">
                      <p className="text-xs text-foreground font-medium">{client.metrics.purchaseCount}</p>
                    </div>

                    {/* LTV */}
                    <div className="flex items-center">
                      <p className="text-xs text-foreground font-bold">{fmtCOP(client.metrics.totalSpent)}</p>
                    </div>

                    {/* Last Purchase */}
                    <div className="flex items-center">
                      <p className="text-[11px] text-muted-400">
                        {client.metrics.lastPurchase
                          ? format(new Date(client.metrics.lastPurchase), 'dd MMM yyyy', { locale: es })
                          : '—'}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="flex items-center justify-end">
                      <ChevronRight size={14} className="text-muted-500 group-hover:text-brand-400 transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

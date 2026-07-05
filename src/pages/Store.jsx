import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store as StoreIcon, LayoutDashboard, Palette, Package, Receipt, CreditCard,
  Truck, Search, Settings as SettingsIcon, Save, Eye, Check, ExternalLink,
  ChevronRight, Phone, Printer, Plus, AlertCircle, TrendingUp, ShoppingBag, X, Star, Calendar, RefreshCw
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useProductStore, CATEGORIES } from '@/store/useProductStore'
import { useUIStore } from '@/store/useUIStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const formatCOP = (v) => v == null ? '' : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)

export default function Store() {
  const user = useAuthStore((s) => s.user)
  const syncProfile = useAuthStore((s) => s.syncProfile)
  const openModal = useUIStore((s) => s.openModal)
  
  const [activeTab, setActiveTab] = useState('dashboard')

  // Global Store Settings States (fetched from Supabase companies row)
  const [storeName, setStoreName] = useState('')
  const [storeEnabled, setStoreEnabled] = useState(false)
  const [storeSlug, setStoreSlug] = useState('')
  const [accentColor, setAccentColor] = useState('#4f46e5')
  const [whatsappContact, setWhatsappContact] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  // Payment states
  const [codEnabled, setCodEnabled] = useState(true)
  const [bankTransferEnabled, setBankTransferEnabled] = useState(false)
  const [bankDetails, setBankDetails] = useState('')

  // Shipping states
  const [shippingFee, setShippingFee] = useState(0)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0)

  // DB Data States
  const [invoices, setInvoices] = useState([])
  const [productsList, setProductsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Product Catalog Inline Edit States
  const [editingProductId, setEditingProductId] = useState(null)
  const [editPrice, setEditPrice] = useState(0)
  const [editDiscountType, setEditDiscountType] = useState(null)
  const [editDiscountValue, setEditDiscountValue] = useState(null)

  // Load configuration & data
  useEffect(() => {
    if (!user?.companyId) return
    
    async function loadData() {
      setLoading(true)
      try {
        // 1. Fetch Company Settings
        const { data: company, error: compErr } = await supabase
          .from('companies')
          .select('*')
          .eq('id', user.companyId)
          .single()
        
        if (company) {
          setStoreName(company.name || '')
          setStoreEnabled(company.store_enabled || false)
          setStoreSlug(company.store_slug || '')
          setLogoUrl(company.logo_url || '')
          
          const settings = company.store_settings || {}
          setAccentColor(settings.accent_color || '#4f46e5')
          setWhatsappContact(settings.whatsapp_contact || '')
          setSeoDescription(settings.seo_description || '')
          setBannerUrl(settings.banner_url || '')
          
          const pm = settings.payment_methods || {}
          setCodEnabled(pm.cod !== false)
          setBankTransferEnabled(pm.bank_transfer || false)
          setBankDetails(pm.bank_details || '')
          
          const ship = settings.shipping || {}
          setShippingFee(ship.fee || 0)
          setFreeShippingThreshold(ship.free_threshold || 0)
        }

        // 2. Fetch Store Invoices
        const { data: invList } = await supabase
          .from('invoices')
          .select('*')
          .eq('company_id', user.companyId)
          .eq('source', 'store')
          .order('created_at', { ascending: false })
        
        if (invList) setInvoices(invList)

        // 3. Fetch Store Products
        const { data: prodList } = await supabase
          .from('products')
          .select('*')
          .eq('company_id', user.companyId)
          .order('created_at', { ascending: false })
        
        if (prodList) setProductsList(prodList)
      } catch (err) {
        console.error('Error cargando datos del modulo Store:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.companyId])

  // Save Settings to Supabase
  const handleSaveSettings = async () => {
    if (!storeSlug) {
      toast.error('El enlace/slug de la tienda es obligatorio.')
      return
    }
    
    // Validate slug format
    const cleanSlug = storeSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (cleanSlug !== storeSlug) {
      toast.error('El enlace solo puede contener letras minúsculas, números y guiones.')
      return
    }

    setSaving(true)
    try {
      const storeSettings = {
        accent_color: accentColor,
        whatsapp_contact: whatsappContact,
        seo_description: seoDescription,
        banner_url: bannerUrl,
        payment_methods: {
          cod: codEnabled,
          bank_transfer: bankTransferEnabled,
          bank_details: bankDetails
        },
        shipping: {
          fee: Number(shippingFee),
          free_threshold: Number(freeShippingThreshold)
        }
      }

      const { error } = await supabase
        .from('companies')
        .update({
          name: storeName,
          store_enabled: storeEnabled,
          store_slug: storeSlug,
          logo_url: logoUrl,
          store_settings: storeSettings
        })
        .eq('id', user.companyId)

      if (error) throw error

      await syncProfile(user.id)
      toast.success('Configuración de la tienda guardada correctamente.')
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar la configuración: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Toggle show in store or featured state of a product directly
  const handleProductToggle = async (productId, field, currentVal) => {
    try {
      const newVal = !currentVal
      const { error } = await supabase
        .from('products')
        .update({ [field]: newVal })
        .eq('id', productId)

      if (error) throw error

      setProductsList(prev => prev.map(p => p.id === productId ? { ...p, [field]: newVal } : p))
      toast.success('Producto actualizado en vivo.')
    } catch (err) {
      toast.error('Error al actualizar el producto: ' + err.message)
    }
  }

  // Save inline edited product store details (price & discount)
  const handleSaveProductStoreInfo = async (productId) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          price: Number(editPrice),
          discount_type: editDiscountType || null,
          discount_value: editDiscountType ? Number(editDiscountValue) : null
        })
        .eq('id', productId)

      if (error) throw error

      setProductsList(prev => prev.map(p => p.id === productId ? {
        ...p,
        price: Number(editPrice),
        discount_type: editDiscountType || null,
        discount_value: editDiscountType ? Number(editDiscountValue) : null
      } : p))

      setEditingProductId(null)
      toast.success('Precio y descuento de la tienda actualizados.')
    } catch (err) {
      toast.error('Error al guardar cambios: ' + err.message)
    }
  }

  // Update order status directly
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ payment_status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      setInvoices(prev => prev.map(inv => inv.id === orderId ? { ...inv, payment_status: newStatus } : inv))
      toast.success('Estado del pedido actualizado.')
    } catch (err) {
      toast.error('Error al actualizar el pedido: ' + err.message)
    }
  }

  // Metrics calculation
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const ordersToday = invoices.filter(inv => inv.created_at?.split('T')[0] === today)
    const salesToday = ordersToday.reduce((sum, inv) => sum + (inv.total || 0), 0)
    const totalSalesMonth = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
    
    const activeProducts = productsList.filter(p => p.show_in_store).length
    const outOfStock = productsList.filter(p => p.show_in_store && (!p.stock || p.stock <= 0) && p.unit !== 'ILIMITADO').length
    const onSale = productsList.filter(p => p.show_in_store && p.discount_value > 0).length

    return {
      ordersCountToday: ordersToday.length,
      salesSumToday: salesToday,
      totalSalesMonth,
      activeProducts,
      outOfStock,
      onSale
    }
  }, [invoices, productsList])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-400">Cargando centro de control de tu tienda...</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container flex flex-col gap-6 h-full pb-16">
      
      {/* ─── Header Row ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-subtle pb-4">
        <div>
          <div className="flex items-center gap-2">
            <StoreIcon className="w-6 h-6 text-brand-400" />
            <h1 className="text-xl font-black text-foreground uppercase tracking-tight">Canal de Ventas: Online Store</h1>
          </div>
          <p className="text-xs text-muted-400 mt-1">Configura tu e-commerce, revisa métricas en vivo y gestiona los pedidos contra entrega.</p>
        </div>
        {storeSlug && (
          <a
            href={`https://gestivaone-store.vercel.app/${storeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600/10 hover:bg-brand-600/20 border border-brand-500/30 text-brand-400 text-xs font-bold rounded-xl transition-all"
          >
            <span>Ver mi tienda pública</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* ─── Menu Navigation Tabs ─── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-subtle/50 no-scrollbar select-none">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'appearance', label: 'Apariencia & Preview', icon: Palette },
          { id: 'catalog', label: 'Catálogo Store', icon: Package },
          { id: 'orders', label: 'Pedidos Recibidos', icon: Receipt },
          { id: 'settings', label: 'Pagos & Envíos', icon: SettingsIcon }
        ].map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 shrink-0 cursor-pointer',
                active
                  ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                  : 'border-transparent text-muted-400 hover:text-foreground hover:bg-surface-800/40'
              )}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ─── Tab Content Area ─── */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          
          {/* 1. DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
              
              {/* Quick stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Ventas hoy (Store)" val={formatCOP(metrics.salesSumToday)} sub={`${metrics.ordersCountToday} pedidos hoy`} trend="+12.3%" icon={<TrendingUp size={16} />} />
                <StatCard title="Total Acumulado" val={formatCOP(metrics.totalSalesMonth)} sub={`${invoices.length} pedidos totales`} icon={<ShoppingBag size={16} />} />
                <StatCard title="Productos Públicos" val={metrics.activeProducts} sub={`${productsList.length} en catálogo`} icon={<Package size={16} />} />
                <StatCard title="Sin Stock / Ofertas" val={`${metrics.outOfStock} / ${metrics.onSale}`} sub="Agotados / Con Descuento" icon={<AlertCircle size={16} />} />
              </div>

              {/* Live Preview / Status Block */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: General Info Card */}
                <div className="lg:col-span-2 card-surface p-5 flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-2">Visibilidad de tu Tienda Virtual</h3>
                    <p className="text-xs text-muted-400 leading-relaxed">
                      Cuando la tienda virtual está activa, cualquier usuario puede acceder a tu catálogo online usando tu enlace web. Los pedidos recibidos se ingresan automáticamente en tu Facturero como cuentas por cobrar de tipo pago contra entrega.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-surface-700/50 p-4 rounded-2xl border border-subtle">
                    <div className="flex-1">
                      <div className="text-xs font-bold text-white">Estado de la Tienda</div>
                      <div className="text-[10px] text-muted-400 mt-0.5">Define si el catálogo público está online.</div>
                    </div>
                    <button
                      onClick={() => setStoreEnabled(!storeEnabled)}
                      className={clsx(
                        'px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border',
                        storeEnabled
                          ? 'bg-success-500/10 border-success-500/20 text-success-400'
                          : 'bg-danger-500/10 border-danger-500/20 text-danger-400'
                      )}
                    >
                      {storeEnabled ? '● ACTIVA / ONLINE' : '○ INACTIVA / OFFLINE'}
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="text-xs font-bold text-white">Enlace de tu tienda:</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={storeSlug}
                        onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="tu-negocio"
                        className="bg-surface-700 border border-subtle text-xs text-white rounded-xl px-3 py-2 w-full focus:outline-none focus:border-brand-500"
                      />
                      <span className="text-xs text-muted-400 font-semibold shrink-0">.vercel.app</span>
                    </div>
                    <p className="text-[10px] text-muted-500 leading-none">Solo letras minúsculas, números y guiones. Sin espacios ni tildes.</p>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="btn btn-primary self-end"
                  >
                    {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>Guardar Cambios</span>
                  </button>
                </div>

                {/* Right: Order Summary Stats */}
                <div className="card-surface p-5 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-white">Top Productos en Tienda</h3>
                  <div className="flex flex-col gap-2.5">
                    {productsList.filter(p => p.show_in_store).slice(0, 4).map((p, idx) => (
                      <div key={p.id} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded bg-surface-700 flex items-center justify-center text-[10px] text-muted-400 font-bold shrink-0">{idx+1}</span>
                          <span className="text-white truncate font-medium">{p.name}</span>
                        </div>
                        <span className="text-brand-400 font-bold shrink-0">{formatCOP(p.price)}</span>
                      </div>
                    ))}
                    {productsList.filter(p => p.show_in_store).length === 0 && (
                      <div className="text-xs text-muted-500 py-6 text-center">No hay productos en tienda pública todavía.</div>
                    )}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* 2. APPEARANCE & LIVE PREVIEW TAB */}
          {activeTab === 'appearance' && (
            <motion.div key="appearance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Left Form Panel */}
              <div className="lg:col-span-3 card-surface p-5 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white border-b border-subtle pb-2">Personalizar Identidad de Marca</h3>
                
                {/* Store name */}
                <div>
                  <label className="text-[10px] text-muted-400 font-bold uppercase tracking-wide mb-1 block">Nombre Oficial de la Tienda *</label>
                  <input
                    type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ej. Mi Tienda Express"
                    className="w-full bg-surface-700 border border-subtle rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Logo & Banner URLs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-muted-400 font-bold uppercase tracking-wide mb-1 block">URL del Logo (1:1)</label>
                    <input
                      type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://ejemplo.com/logo.png"
                      className="w-full bg-surface-700 border border-subtle rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-400 font-bold uppercase tracking-wide mb-1 block">URL del Banner Banner de Portada</label>
                    <input
                      type="text" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)}
                      placeholder="https://ejemplo.com/banner.png"
                      className="w-full bg-surface-700 border border-subtle rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Accent Color picker */}
                <div>
                  <label className="text-[10px] text-muted-400 font-bold uppercase tracking-wide mb-1.5 block">Color de Acento de la Tienda</label>
                  <div className="flex flex-wrap gap-2.5 items-center">
                    {[
                      { hex: '#4f46e5', name: 'Indigo' },
                      { hex: '#10b981', name: 'Emerald' },
                      { hex: '#f59e0b', name: 'Amber' },
                      { hex: '#ef4444', name: 'Crimson' },
                      { hex: '#8b5cf6', name: 'Violet' },
                      { hex: '#ec4899', name: 'Pink' }
                    ].map(color => (
                      <button
                        key={color.hex}
                        onClick={() => setAccentColor(color.hex)}
                        style={{ backgroundColor: color.hex }}
                        className={clsx(
                          'w-7 h-7 rounded-lg cursor-pointer border-2 transition-all relative flex items-center justify-center',
                          accentColor === color.hex ? 'border-white scale-110 shadow-glow-sm' : 'border-transparent'
                        )}
                        title={color.name}
                      >
                        {accentColor === color.hex && <Check size={12} className="text-white drop-shadow-sm" />}
                      </button>
                    ))}
                    <div className="flex items-center gap-1.5 ml-2">
                      <input
                        type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                        className="w-7 h-7 bg-transparent border-0 cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-muted-400 uppercase">{accentColor}</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Support Number */}
                <div>
                  <label className="text-[10px] text-muted-400 font-bold uppercase tracking-wide mb-1 block">Número de WhatsApp para Pedidos *</label>
                  <input
                    type="tel" value={whatsappContact} onChange={(e) => setWhatsappContact(e.target.value)}
                    placeholder="Ej. 3123456789"
                    className="w-full bg-surface-700 border border-subtle rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                  <p className="text-[10px] text-muted-500 mt-1">Con código de país. Para Colombia ej: 573123456789 o 3123456789.</p>
                </div>

                {/* SEO Meta description */}
                <div>
                  <label className="text-[10px] text-muted-400 font-bold uppercase tracking-wide mb-1 block">Descripción Corta / SEO Meta Description</label>
                  <textarea
                    value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Escribe una breve descripción de tu tienda para Google y redes sociales..."
                    rows={3}
                    className="w-full bg-surface-700 border border-subtle rounded-xl px-3 py-2 text-xs text-white resize-none focus:outline-none focus:border-brand-500"
                  />
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="btn btn-primary self-end mt-2"
                >
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Guardar Apariencia</span>
                </button>
              </div>

              {/* Right Mockup Preview Panel */}
              <div className="lg:col-span-2 flex flex-col gap-3">
                <div style={{ pointerEvents: 'none' }} className="card-surface p-4 flex flex-col gap-3 bg-neutral-900 border border-subtle select-none">
                  <div className="text-xs font-bold text-muted-400 uppercase tracking-wide border-b border-subtle pb-1.5">Vista Previa (Móvil)</div>
                  
                  {/* Smartphone Frame Mockup */}
                  <div className="rounded-2xl border-4 border-surface-600 bg-[#0a0a0f] p-3 aspect-[9/16] flex flex-col gap-3 overflow-hidden shadow-2xl relative">
                    
                    {/* Tiny header mockup */}
                    <div className="flex items-center justify-between border-b border-subtle/50 pb-2">
                      <div className="flex items-center gap-1.5">
                        <div style={{ background: `linear-gradient(135deg, ${accentColor}, #7c3aed)` }} className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white">
                          {(storeName || 'G').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '9px', fontWeight: 800, color:'#fff' }}>{storeName || 'Mi Tienda'}</div>
                      </div>
                      <span className="text-[7px] bg-success-500/10 border border-success-500/20 text-success-400 px-1.5 py-0.5 rounded-full">Paga al recibir</span>
                    </div>

                    {/* Small banner mockup */}
                    <div style={{
                      backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      background: !bannerUrl ? 'linear-gradient(135deg, var(--surface-800), var(--surface-700))' : undefined,
                    }} className="h-16 rounded-xl flex items-center justify-center text-center p-2 relative overflow-hidden border border-subtle">
                      {!bannerUrl && <div className="text-[8px] text-muted-500 font-bold">Sin banner de portada</div>}
                      <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                    </div>

                    {/* Fake single product page elements */}
                    <div style={{ background: 'var(--surface-800)' }} className="rounded-xl p-2.5 flex flex-col gap-2 border border-subtle">
                      <div className="aspect-square bg-surface-700 rounded-lg flex items-center justify-center text-2xl">
                        📦
                      </div>
                      <div>
                        <div className="text-[9px] font-extrabold text-white">Producto Demostración</div>
                        <div style={{ color: accentColor }} className="text-[11px] font-black mt-0.5">$ 45.000</div>
                      </div>
                      <div style={{ background: `linear-gradient(135deg, ${accentColor}, #7c3aed)`, fontSize: '8px' }} className="text-white py-1 text-center font-black rounded-lg">
                        Pedir Contra Entrega
                      </div>
                    </div>

                    <div className="text-[7px] text-muted-500 text-center mt-auto">
                      Powered by GestivaOne Store
                    </div>

                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* 3. STORE PRODUCT CATALOG TAB */}
          {activeTab === 'catalog' && (
            <motion.div key="catalog" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card-surface p-5 flex flex-col gap-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-subtle pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Productos en Tienda Virtual</h3>
                  <p className="text-[11px] text-muted-400 mt-0.5">Controla la visibilidad, destacados y descuentos de tu catálogo. Para agregar nuevos productos al inventario general, ve a la sección de Productos.</p>
                </div>
              </div>

              {/* Table List */}
              <div className="overflow-x-auto border border-subtle/50 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-subtle bg-surface-800/60 text-muted-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Producto</th>
                      <th className="py-3 px-3">Categoría</th>
                      <th className="py-3 px-3">Precio Tienda</th>
                      <th className="py-3 px-3 text-center">En Tienda</th>
                      <th className="py-3 px-3 text-center">Destacado</th>
                      <th className="py-3 px-3 text-center">Descuento</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsList.map(p => (
                      <tr key={p.id} className={clsx(
                        'border-b border-subtle/50 hover:bg-surface-800/40 transition-colors',
                        editingProductId === p.id && 'bg-brand-500/5'
                      )}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📦</span>
                            <div>
                              <div className="font-bold text-white">{p.name}</div>
                              <div className="text-[10px] text-muted-500 font-mono">Stock: {p.stock}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-surface-700 text-muted-400 rounded-md font-semibold text-[10px]">
                            {p.category || 'Otros'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-white">
                          {editingProductId === p.id ? (
                            <div className="relative">
                              <span className="absolute left-2.5 top-1.5 text-[10px] text-muted-400 font-bold">$</span>
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(Number(e.target.value))}
                                className="bg-surface-700 border border-subtle rounded-xl pl-5 pr-2 py-1 text-xs text-white w-28 focus:outline-none focus:border-brand-500"
                              />
                            </div>
                          ) : (
                            formatCOP(p.price)
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleProductToggle(p.id, 'show_in_store', p.show_in_store)}
                            className={clsx(
                              'px-2 py-1 rounded-lg font-bold text-[9px] cursor-pointer transition-all border',
                              p.show_in_store
                                ? 'bg-success-500/10 border-success-500/20 text-success-400'
                                : 'bg-surface-700 border-transparent text-muted-500'
                            )}
                          >
                            {p.show_in_store ? 'SÍ' : 'NO'}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleProductToggle(p.id, 'featured', p.featured)}
                            className={clsx(
                              'px-2 py-1 rounded-lg font-bold text-[9px] cursor-pointer transition-all border',
                              p.featured
                                ? 'bg-warning-500/10 border-warning-500/20 text-warning-400'
                                : 'bg-surface-700 border-transparent text-muted-500'
                            )}
                          >
                            {p.featured ? '⭐ SÍ' : 'NO'}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-brand-400">
                          {editingProductId === p.id ? (
                            <div className="flex items-center gap-1 justify-center">
                              <select
                                value={editDiscountType || ''}
                                onChange={(e) => setEditDiscountType(e.target.value || null)}
                                className="bg-surface-700 border border-subtle rounded-xl px-1.5 py-1 text-[11px] text-white focus:outline-none focus:border-brand-500"
                              >
                                <option value="">Sin Desc.</option>
                                <option value="percentage">% Desc</option>
                                <option value="fixed">$ Fijo</option>
                              </select>
                              {editDiscountType && (
                                <input
                                  type="number"
                                  value={editDiscountValue || ''}
                                  onChange={(e) => setEditDiscountValue(Number(e.target.value))}
                                  placeholder="Valor"
                                  className="bg-surface-700 border border-subtle rounded-xl px-2 py-1 text-xs text-white w-16 focus:outline-none focus:border-brand-500"
                                />
                              )}
                            </div>
                          ) : (
                            p.discount_value && p.discount_value > 0 ? (
                              <span className="px-2 py-0.5 bg-danger-500/10 border border-danger-500/20 rounded-md text-danger-400 text-[10px]">
                                -{p.discount_value}{p.discount_type === 'percentage' ? '%' : ' COP'}
                              </span>
                            ) : (
                              <span className="text-muted-500 font-medium">-</span>
                            )
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {editingProductId === p.id ? (
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => handleSaveProductStoreInfo(p.id)}
                                className="px-3 py-1.5 bg-success-600 hover:bg-success-500 text-white rounded-xl text-[10px] font-bold transition-all active:scale-95"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingProductId(null)}
                                className="px-3 py-1.5 bg-surface-700 hover:bg-surface-600 text-muted-300 rounded-xl text-[10px] font-bold transition-all active:scale-95"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingProductId(p.id)
                                setEditPrice(p.price || 0)
                                setEditDiscountType(p.discount_type || null)
                                setEditDiscountValue(p.discount_value || 0)
                              }}
                              className="px-3 py-1.5 bg-brand-600/15 hover:bg-brand-600/30 text-brand-400 rounded-xl text-[10px] font-bold transition-all border border-brand-500/20 active:scale-95"
                            >
                              Editar Tienda
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {productsList.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-500">No tienes productos en tu catálogo general.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </motion.div>
          )}

          {/* 4. ORDERS TAB */}
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card-surface p-5 flex flex-col gap-4">
              
              <div className="flex items-center justify-between border-b border-subtle pb-3">
                <h3 className="text-sm font-bold text-white">Pedidos Contra Entrega Recibidos</h3>
                <span className="badge badge-brand">{invoices.length} pedidos</span>
              </div>

              {/* Orders List */}
              <div className="flex flex-col gap-4">
                {invoices.map(inv => {
                  const details = inv.delivery_details || {}
                  const customerPhone = details.phone || inv.client_name
                  const cleanPhone = customerPhone.replace(/\D/g, '')
                  
                  const whatsappMsg = `Hola ${details.firstName || ''}! Te escribo de ${storeName}. Acabamos de recibir tu pedido con referencia *${inv.id}* por un valor total de *${formatCOP(inv.total)}*. ¿Nos confirmas tus datos de entrega en ${details.address || ''}, ${details.city || ''}?`

                  return (
                    <div key={inv.id} className="border border-subtle rounded-2xl p-4 bg-surface-700/30 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                      
                      {/* Left: Info */}
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-white bg-surface-700 border border-subtle px-2 py-0.5 rounded-lg">{inv.id}</span>
                          <span className="text-[10px] text-muted-500 font-medium">
                            {inv.created_at ? new Date(inv.created_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white">
                          Cliente: {inv.client_name} • <span className="text-muted-400 font-medium">{details.phone || 'Sin número'}</span>
                        </div>
                        <div className="text-[11px] text-muted-400 truncate">
                          Dirección: {details.address || ''}, {details.city || ''}, {details.department || ''}
                        </div>
                        <div className="text-[10px] text-brand-400 font-bold mt-1">
                          Items: {inv.items?.map(it => `${it.name} (${it.qty} uds)`).join(', ')}
                        </div>
                      </div>

                      {/* Right: Actions and Status */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 self-stretch md:self-auto justify-end">
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="text-[11px] font-black text-white">{formatCOP(inv.total)}</div>
                          
                          {/* Status changer */}
                          <select
                            value={inv.payment_status || 'pending'}
                            onChange={(e) => handleOrderStatusChange(inv.id, e.target.value)}
                            className={clsx(
                              'text-[10px] font-bold rounded-lg border px-2.5 py-1 cursor-pointer focus:outline-none uppercase',
                              inv.payment_status === 'pending' && 'bg-warning-500/10 border-warning-500/20 text-warning-400',
                              inv.payment_status === 'paid' && 'bg-success-500/10 border-success-500/20 text-success-400',
                              inv.payment_status === 'cancelled' && 'bg-danger-500/10 border-danger-500/20 text-danger-400'
                            )}
                          >
                            <option value="pending">NUEVO (PENDIENTE)</option>
                            <option value="paid">ENTREGADO / PAGADO</option>
                            <option value="cancelled">CANCELADO</option>
                          </select>
                        </div>

                        {/* WhatsApp Link button */}
                        {details.phone && (
                          <a
                            href={`https://wa.me/${cleanPhone.startsWith('57') ? cleanPhone : '57' + cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-[#25d366] hover:bg-[#25d366]/95 text-white rounded-xl shadow-sm transition-all"
                            title="Confirmar por WhatsApp"
                          >
                            <Phone size={14} />
                          </a>
                        )}

                        {/* Print Invoice button */}
                        <button
                          onClick={() => window.print()}
                          className="p-2 bg-surface-700 hover:bg-surface-600 text-muted-400 hover:text-white border border-subtle rounded-xl shadow-sm transition-all"
                          title="Imprimir ticket de entrega"
                        >
                          <Printer size={14} />
                        </button>
                      </div>

                    </div>
                  )
                })}
                {invoices.length === 0 && (
                  <div className="py-8 text-center text-muted-500 text-xs">No has recibido pedidos contra entrega en la tienda virtual todavía.</div>
                )}
              </div>

            </motion.div>
          )}

          {/* 5. SETTINGS & PAYMENT METHODS TAB */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Payment Methods */}
              <div className="card-surface p-5 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white border-b border-subtle pb-2">Métodos de Pago Autorizados</h3>
                
                {/* Contra Entrega */}
                <div className="flex items-start justify-between gap-4 bg-surface-700/40 p-4 rounded-xl border border-subtle">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CreditCard size={14} className="text-brand-400" />
                      <span>Pago Contra Entrega (Efectivo)</span>
                    </div>
                    <p className="text-[10px] text-muted-400 mt-1 leading-normal">
                      Recomendado en Colombia. El cliente paga en efectivo directamente a la transportadora cuando le entregan el paquete.
                    </p>
                  </div>
                  <button
                    onClick={() => setCodEnabled(!codEnabled)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer transition-all border shrink-0',
                      codEnabled ? 'bg-success-500/10 border-success-500/20 text-success-400' : 'bg-surface-700 border-transparent text-muted-500'
                    )}
                  >
                    {codEnabled ? 'HABILITADO' : 'INACTIVO'}
                  </button>
                </div>

                {/* Transferencia bancaria */}
                <div className="flex flex-col gap-3 bg-surface-700/40 p-4 rounded-xl border border-subtle">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CreditCard size={14} className="text-brand-400" />
                        <span>Transferencia Bancaria Directa</span>
                      </div>
                      <p className="text-[10px] text-muted-400 mt-1 leading-normal">
                        Muestra tus números de cuenta (Nequi, Bancolombia, Daviplata) para que el comprador realice el pago antes del despacho.
                      </p>
                    </div>
                    <button
                      onClick={() => setBankTransferEnabled(!bankTransferEnabled)}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer transition-all border shrink-0',
                        bankTransferEnabled ? 'bg-success-500/10 border-success-500/20 text-success-400' : 'bg-surface-700 border-transparent text-muted-500'
                      )}
                    >
                      {bankTransferEnabled ? 'HABILITADO' : 'INACTIVO'}
                    </button>
                  </div>

                  {bankTransferEnabled && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden mt-1">
                      <label className="text-[10px] text-muted-400 font-bold uppercase tracking-wide mb-1 block">Instrucciones de pago (Cuentas y bancos)</label>
                      <textarea
                        value={bankDetails} onChange={(e) => setBankDetails(e.target.value)}
                        placeholder="Ej. Transferir a Nequi 3123456789 a nombre de Juan Pérez o Cuenta de Ahorros Bancolombia..."
                        rows={2}
                        className="w-full bg-surface-700 border border-subtle rounded-xl px-3 py-2 text-xs text-white resize-none focus:outline-none focus:border-brand-500"
                      />
                    </motion.div>
                  )}
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="btn btn-primary self-end mt-2"
                >
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Guardar Métodos de Pago</span>
                </button>
              </div>

              {/* Shipping Rules */}
              <div className="card-surface p-5 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white border-b border-subtle pb-2">Reglas de Envío y Despacho</h3>
                
                {/* Costo del envío */}
                <div>
                  <label className="text-[10px] text-muted-400 font-bold uppercase tracking-wide mb-1.5 block">Costo de Envío Estándar (COP)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-muted-400">$</span>
                    <input
                      type="number" value={shippingFee || ''} onChange={(e) => setShippingFee(Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-surface-700 border border-subtle rounded-xl pl-6 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <p className="text-[10px] text-muted-500 mt-1">Si dejas este campo en 0, el envío se considerará Gratis por defecto.</p>
                </div>

                {/* Envío gratis por compras minimas */}
                <div>
                  <label className="text-[10px] text-muted-400 font-bold uppercase tracking-wide mb-1.5 block">Envío Gratis por compra mínima superior a (COP)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-muted-400">$</span>
                    <input
                      type="number" value={freeShippingThreshold || ''} onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-surface-700 border border-subtle rounded-xl pl-6 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <p className="text-[10px] text-muted-500 mt-1">Escribe 0 si no deseas ofrecer envío gratis automatizado por compra mínima.</p>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="btn btn-primary self-end mt-2"
                >
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Guardar Reglas de Envío</span>
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </motion.div>
  )
}

/* ─── Helper UI Subcomponents ─── */
function StatCard({ title, val, sub, trend, icon }) {
  return (
    <div className="card-surface p-4 flex flex-col justify-between h-28 relative overflow-hidden group">
      <div className="flex items-center justify-between text-muted-400">
        <span className="text-[10px] font-bold uppercase tracking-wider">{title}</span>
        <span className="text-muted-500 shrink-0">{icon}</span>
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-lg md:text-xl font-black text-white tracking-tight">{val}</span>
        {trend && <span className="text-[9px] font-black text-success-400">{trend}</span>}
      </div>
      <div className="text-[10px] text-muted-500 font-medium border-t border-subtle/30 pt-1.5 mt-2">
        {sub}
      </div>
    </div>
  )
}

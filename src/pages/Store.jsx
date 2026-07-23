import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { useAuthStore } from '@/store/useAuthStore'
import { useProductStore, CATEGORIES } from '@/store/useProductStore'
import { useUIStore } from '@/store/useUIStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import StoreDashboard from '@/components/store/StoreDashboard'
import StoreAppearance from '@/components/store/StoreAppearance'
import StoreCatalog from '@/components/store/StoreCatalog'
import StoreOrders from '@/components/store/StoreOrders'
import StoreSettings from '@/components/store/StoreSettings'
import StoreIntegrations from '@/components/store/StoreIntegrations'
import Icon from '@/components/ui/Icon';

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

  // ─── Integrations: Dropi ───
  const [dropiToken, setDropiToken] = useState('')
  const [dropiTokenSaved, setDropiTokenSaved] = useState('')
  const [dropiTestStatus, setDropiTestStatus] = useState(null) // null | 'ok' | 'error' | 'loading'
  const [dropiTestMsg, setDropiTestMsg] = useState('')
  const [dropiBusy, setDropiBusy] = useState(false)
  const [dropiCityQuery, setDropiCityQuery] = useState('')
  const [dropiCities, setDropiCities] = useState([])
  const [dropiCityLoading, setDropiCityLoading] = useState(false)
  const [integSaving, setIntegSaving] = useState(false)

  // Load Dropi token from store_settings on mount
  useEffect(() => {
    if (!user?.companyId) return
    async function loadIntegrations() {
      const { data: company } = await supabase
        .from('companies')
        .select('store_settings')
        .eq('id', user.companyId)
        .single()
      const token = company?.store_settings?.integrations?.dropi_token || ''
      setDropiTokenSaved(!!token)
      setDropiToken('') // Do not store token value in frontend state
    }
    loadIntegrations()
  }, [user?.companyId])

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

  // ─── Save Dropi Token ───
  const handleSaveDropiToken = async () => {
    if (!user?.companyId) return
    setIntegSaving(true)
    try {
      // Fetch current store_settings to merge
      const { data: company } = await supabase
        .from('companies')
        .select('store_settings')
        .eq('id', user.companyId)
        .single()
      const current = company?.store_settings || {}
      const updated = {
        ...current,
        integrations: {
          ...(current.integrations || {}),
          dropi_token: dropiToken.trim()
        }
      }
      const { error } = await supabase
        .from('companies')
        .update({ store_settings: updated })
        .eq('id', user.companyId)
      if (error) throw error
      setDropiTokenSaved(true)
      setDropiTestStatus(null)
      toast.success('Token de Dropi guardado correctamente.')
    } catch (err) {
      toast.error('Error al guardar el token: ' + err.message)
    } finally {
      setIntegSaving(false)
    }
  }

  // ─── Test Dropi Connection ───
  const handleTestDropi = async () => {
    if (!dropiTokenSaved) { toast.error('Primero guarda un token de Dropi.'); return }
    setDropiTestStatus('loading')
    setDropiTestMsg('')
    try {
      const { data, error } = await supabase.functions.invoke('dropi-proxy', {
        body: { action: 'test', companyId: user.companyId }
      })
      
      if (error || data?.error) throw new Error(error?.message || data?.error)
      
      setDropiTestStatus('ok')
      setDropiTestMsg('Conexión exitosa con la API de Dropi ✓')
    } catch (err) {
      setDropiTestStatus('error')
      setDropiTestMsg(err.message || 'No se pudo conectar con Dropi. Verifica tu token.')
    }
  }

  // ─── Look up cities in Dropi ───
  const handleDropiCitySearch = async () => {
    if (!dropiTokenSaved) { toast.error('Primero guarda un token de Dropi.'); return }
    if (!dropiCityQuery.trim()) return
    setDropiCityLoading(true)
    setDropiCities([])
    try {
      const { data, error } = await supabase.functions.invoke('dropi-proxy', {
        body: { 
          action: 'search_cities', 
          companyId: user.companyId,
          payload: { search: dropiCityQuery }
        }
      })
      
      if (error || data?.error) throw new Error(error?.message || data?.error)
      
      setDropiCities(data?.data || data?.cities || [])
    } catch (err) {
      toast.error('Error al consultar ciudades en Dropi: ' + err.message)
    } finally {
      setDropiCityLoading(false)
    }
  }

  // ─── Push a store order to Dropi ───
  const handlePushToDropi = async (invoice) => {
    if (!dropiTokenSaved) { toast.error('Primero configura tu token de Dropi.'); return }
    setDropiBusy(true)
    try {
      const payload = {
        customer_name: invoice.customer_name || 'Cliente',
        customer_phone: invoice.customer_phone || '',
        customer_address: invoice.customer_address || '',
        customer_city: invoice.customer_city || '',
        order_value: invoice.total || 0,
        products: (invoice.items || []).map(it => ({
          name: it.name,
          quantity: it.quantity,
          price: it.price
        }))
      }
      
      const { data, error } = await supabase.functions.invoke('dropi-proxy', {
        body: { 
          action: 'push_order', 
          companyId: user.companyId,
          payload 
        }
      })
      
      if (error || data?.error) throw new Error(error?.message || data?.error)
      
      toast.success(`Pedido enviado a Dropi correctamente ✓`)
    } catch (err) {
      toast.error('Error al enviar a Dropi: ' + err.message)
    } finally {
      setDropiBusy(false)
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-subtle pb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Icon name="Store" className="w-6 h-6 text-brand-400"  />
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
            <Icon name="ExternalLink" size={12}  />
          </a>
        )}
      </div>

      {/* ─── Menu Navigation Tabs ─── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-subtle/50 no-scrollbar select-none shrink-0">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
          { id: 'appearance', label: 'Apariencia & Preview', icon: 'Palette' },
          { id: 'catalog', label: 'Catálogo Store', icon: 'Package' },
          { id: 'orders', label: 'Pedidos Recibidos', icon: 'Receipt' },
          { id: 'settings', label: 'Pagos & Envíos', icon: 'Settings' },
          { id: 'integrations', label: 'Integraciones', icon: 'PlugZap' }
        ].map(tab => {
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
              <Icon name={tab.icon} size={14} />
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
            <StoreDashboard 
              metrics={metrics}
              storeEnabled={storeEnabled}
              setStoreEnabled={setStoreEnabled}
              invoices={invoices}
              setActiveTab={setActiveTab}
            />
          )}

          {/* 2. APPEARANCE & LIVE PREVIEW TAB */}
          {activeTab === 'appearance' && (
            <StoreAppearance
              storeName={storeName}
              setStoreName={setStoreName}
              logoUrl={logoUrl}
              setLogoUrl={setLogoUrl}
              bannerUrl={bannerUrl}
              setBannerUrl={setBannerUrl}
              accentColor={accentColor}
              setAccentColor={setAccentColor}
              whatsappContact={whatsappContact}
              setWhatsappContact={setWhatsappContact}
              seoDescription={seoDescription}
              setSeoDescription={setSeoDescription}
              saving={saving}
              handleSaveSettings={handleSaveSettings}
            />
          )}

          {/* 3. STORE PRODUCT CATALOG TAB */}
          {activeTab === 'catalog' && (
            <StoreCatalog
              productsList={productsList}
              editingProductId={editingProductId}
              setEditingProductId={setEditingProductId}
              editPrice={editPrice}
              setEditPrice={setEditPrice}
              editDiscountType={editDiscountType}
              setEditDiscountType={setEditDiscountType}
              editDiscountValue={editDiscountValue}
              setEditDiscountValue={setEditDiscountValue}
              handleProductToggle={handleProductToggle}
              handleSaveProductStoreInfo={handleSaveProductStoreInfo}
            />
          )}

          {/* 4. ORDERS TAB */}
          {activeTab === 'orders' && (
            <StoreOrders
              invoices={invoices}
              storeName={storeName}
              handleOrderStatusChange={handleOrderStatusChange}
            />
          )}

          {/* 5. SETTINGS & PAYMENT METHODS TAB */}
          {activeTab === 'settings' && (
            <StoreSettings
              codEnabled={codEnabled}
              setCodEnabled={setCodEnabled}
              bankTransferEnabled={bankTransferEnabled}
              setBankTransferEnabled={setBankTransferEnabled}
              bankDetails={bankDetails}
              setBankDetails={setBankDetails}
              shippingFee={shippingFee}
              setShippingFee={setShippingFee}
              freeShippingThreshold={freeShippingThreshold}
              setFreeShippingThreshold={setFreeShippingThreshold}
              saving={saving}
              handleSaveSettings={handleSaveSettings}
            />
          )}

          {/* 6. INTEGRACIONES TAB */}
          {activeTab === 'integrations' && (
            <StoreIntegrations
              invoices={invoices}
              user={user}
              dropiToken={dropiToken}
              setDropiToken={setDropiToken}
              dropiTokenSaved={dropiTokenSaved}
              dropiTestStatus={dropiTestStatus}
              dropiTestMsg={dropiTestMsg}
              integSaving={integSaving}
              dropiBusy={dropiBusy}
              dropiCityQuery={dropiCityQuery}
              setDropiCityQuery={setDropiCityQuery}
              dropiCities={dropiCities}
              dropiCityLoading={dropiCityLoading}
              handleSaveDropiToken={handleSaveDropiToken}
              handleTestDropi={handleTestDropi}
              handleDropiCitySearch={handleDropiCitySearch}
              handlePushToDropi={handlePushToDropi}
            />
          )}

        </AnimatePresence>
      </div>

    </motion.div>
  )
}

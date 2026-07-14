import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Trash2, Plus, Minus, ChevronRight, ChevronDown, FileText, User, X, Check, GripVertical, Building2, Globe, History, ArrowLeft, Download, ScanLine } from 'lucide-react'
import { useCartStore, selectSubtotal } from '@/store/useCartStore'
import { useClientStore } from '@/store/useClientStore'
import { useUIStore } from '@/store/useUIStore'
import { useCurrencyStore } from '@/store/useCurrencyStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useInvoiceStore } from '@/store/useInvoiceStore'
import { exportSingleInvoicePDF } from '@/services/exportService'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import InvoiceHistoryModal from '@/components/modals/InvoiceHistoryModal'
import BarcodeScanner from '@/components/invoice/BarcodeScanner'
import ScannerPriceModal from '@/components/invoice/ScannerPriceModal'
import { useScannerCacheStore } from '@/store/useScannerCacheStore'
import { useProductStore } from '@/store/useProductStore'

const TAX_RATES = {
  COP: 0.19,
  MXN: 0.16,
  USD: 0.0,
  EUR: 0.21,
  ARS: 0.21,
  CLP: 0.19,
  PEN: 0.18,
  CRC: 0.13,
  DOP: 0.18,
}
import clsx from 'clsx'

const PassportIcon = ({ size = 12, className = "" }) => (
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
  if (code === '13') return <User size={12} className={cls} />
  if (code === '31') return <Building2 size={12} className={cls} />
  if (code === '22') return <Globe size={12} className={cls} />
  if (code === '41') return <PassportIcon size={12} className={cls} />
  return <User size={12} className={cls} />
}

export default function InvoicePanel({ isMobile }) {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQty = useCartStore((s) => s.updateQty)
  const clearCart = useCartStore((s) => s.clearCart)
  const subtotal = useCartStore(selectSubtotal)
  const includeTax = useCartStore((s) => s.includeTax)
  const toggleTax = useCartStore((s) => s.toggleTax)
  const addScannedItem = useCartStore((s) => s.addScannedItem)

  const customCharges = useCartStore((s) => s.customCharges)
  const addCustomCharge = useCartStore((s) => s.addCustomCharge)
  const removeCustomCharge = useCartStore((s) => s.removeCustomCharge)
  const toggleCustomChargeApplied = useCartStore((s) => s.toggleCustomChargeApplied)
  const toggleCustomChargePin = useCartStore((s) => s.toggleCustomChargePin)
  const loadPinnedCharges = useCartStore((s) => s.loadPinnedCharges)

  const globalDiscount = useCartStore((s) => s.globalDiscount)
  const setGlobalDiscount = useCartStore((s) => s.setGlobalDiscount)
  const globalDiscountAmount = useCartStore((s) => s.globalDiscountAmount)

  const total = useCartStore((s) => s.total)
  const taxAmount = useCartStore((s) => s.taxAmount)

  // Local state for adding charges
  const [showAddCharge, setShowAddCharge] = useState(false)
  const [newChargeName, setNewChargeName] = useState('')
  const [newChargeValue, setNewChargeValue] = useState('')
  const [newChargeType, setNewChargeType] = useState('fixed')
  const [newChargePinned, setNewChargePinned] = useState(false)

  // Local state for adding global discount
  const [showGlobalDiscountForm, setShowGlobalDiscountForm] = useState(false)
  const [globalDiscountInputValue, setGlobalDiscountInputValue] = useState('')
  const [globalDiscountInputType, setGlobalDiscountInputType] = useState('percent')

  // Resizing state
  const MIN_WIDTH = 288
  const MAX_WIDTH = MIN_WIDTH + 150 // Allowing ~150px expansion
  const [panelWidth, setPanelWidth] = useState(MIN_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  
  // Scanner state
  const [scannerActive, setScannerActive] = useState(false)
  const [pendingScan, setPendingScan] = useState(null) // { barcode } waiting for price modal
  const getByBarcode = useScannerCacheStore((s) => s.getByBarcode)
  const saveBarcode = useScannerCacheStore((s) => s.saveBarcode)
  const products = useProductStore((s) => s.products)

  const handleScanCode = async (barcode) => {
    // 1. Check main inventory by barcode field or name match
    const inventoryMatch = products.find(
      (p) => p.barcode === barcode || p.sku === barcode
    )
    if (inventoryMatch) {
      addScannedItem({
        barcode,
        name: inventoryMatch.name,
        price: inventoryMatch.price,
        unit: inventoryMatch.unit ?? 'UND',
      })
      toast.success(`✓ ${inventoryMatch.name} añadido`)
      return
    }
    // 2. Check scanned products cache
    const cached = getByBarcode(barcode)
    if (cached) {
      addScannedItem({ barcode, name: cached.name, price: cached.price, unit: cached.unit })
      toast.success(`✓ ${cached.name} añadido`)
      return
    }
    
    // 3. Unknown code — try to fetch name from Open Food Facts API
    let suggestedName = ''
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      const data = await res.json()
      if (data.status === 1 && data.product) {
        suggestedName = data.product.product_name_es || data.product.product_name || data.product.brands || ''
      }
    } catch (e) {
      console.error("Error fetching product data from API:", e)
    }

    // 4. Show price modal
    setPendingScan({ barcode, suggestedName })
  }

  const handleModalConfirm = ({ barcode, name, price, saveToCache }) => {
    if (saveToCache) saveBarcode(barcode, { name, price })
    addScannedItem({ barcode, name, price })
    setPendingScan(null)
    toast.success(`✓ ${name} añadido a la factura`)
  }

  // Mobile History toggle
  const [mobileViewMode, setMobileViewMode] = useState('cart') // 'cart' | 'history'
  const invoices = useInvoiceStore((s) => s.invoices)
  const fetchInvoices = useInvoiceStore((s) => s.fetchInvoices)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (mobileViewMode === 'history') {
      fetchInvoices()
    }
  }, [mobileViewMode, fetchInvoices])

  useEffect(() => {
    loadPinnedCharges()
  }, [])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e) => {
      // Panel is on the right, so width is screen width - mouse X
      let newWidth = window.innerWidth - e.clientX
      if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH
      if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH
      setPanelWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  const startResizing = (e) => {
    setIsResizing(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    e.preventDefault()
  }

  const handleAddCharge = async () => {
    const val = Number(newChargeValue)
    if (!newChargeName.trim()) return toast.error('Ingresa un nombre')
    if (isNaN(val) || val === 0) return toast.error('Ingresa un valor válido')

    await addCustomCharge({
      name: newChargeName.trim(),
      value: val,
      type: newChargeType,
      pinned: newChargePinned
    })

    setNewChargeName('')
    setNewChargeValue('')
    setNewChargePinned(false)
    setShowAddCharge(false)
    toast.success('Cargo/Impuesto agregado')
  }

  const baseCurrency = useCurrencyStore((s) => s.baseCurrency)
  const taxRate = TAX_RATES[baseCurrency] ?? 0.0

  const selectedClient = useClientStore((s) => s.getSelected())
  const clearClientSel = useClientStore((s) => s.clearSelection)

  const panelOpen = useUIStore((s) => s.invoicePanelOpen)
  const togglePanel = useUIStore((s) => s.toggleInvoicePanel)
  const openModal = useUIStore((s) => s.openModal)

  const format = useCurrencyStore((s) => s.format)
  const canOrder = items.length > 0

  const handleApplyGlobalDiscount = () => {
    const val = Number(globalDiscountInputValue)
    if (isNaN(val) || val <= 0) {
      return toast.error('Ingresa un valor de descuento válido')
    }
    setGlobalDiscount({ value: val, type: globalDiscountInputType })
    setShowGlobalDiscountForm(false)
    setGlobalDiscountInputValue('')
    toast.success('Descuento global aplicado')
  }

  const handleRemoveGlobalDiscount = () => {
    setGlobalDiscount(null)
    toast.success('Descuento global eliminado')
  }
  const renderTotalsSection = () => {
    const activeTaxRate = taxRate || 0.19
    return (
      <div className="space-y-3">
        {/* Applied custom charges */}
        {customCharges.length > 0 && (
          <div className="space-y-2">
            {customCharges.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs text-foreground py-0.5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={c.applied}
                    onChange={() => toggleCustomChargeApplied(c.id)}
                    className="rounded border-subtle bg-surface-700 text-brand-500 w-3.5 h-3.5 focus:ring-0 cursor-pointer"
                  />
                  <span className="truncate max-w-[120px] font-semibold text-muted-300">{c.name}</span>
                  <span className="text-[10px] text-brand-400 font-bold">
                    {c.type === 'percent' ? `(${c.value}%)` : `(${format(c.value)})`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCustomChargePin(c.id)}
                    className={clsx(
                      "text-[12px] transition-colors leading-none cursor-pointer",
                      c.pinned ? "text-brand-400 hover:text-brand-300" : "text-muted-500 hover:text-muted-400"
                    )}
                    title={c.pinned ? "Desanclar de la plantilla" : "Fijar permanentemente"}
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCustomCharge(c.id)}
                    className="text-muted-500 hover:text-danger-400 transition-colors leading-none cursor-pointer"
                  >
                    ✕
                  </button>
                  <span className="text-foreground font-medium ml-1">
                    +{format(c.type === 'percent' ? (subtotal * (c.value / 100)) : c.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Applied global discount */}
        {globalDiscount && (
          <div className="flex items-center justify-between text-xs text-danger-400 py-0.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-red-500 dark:text-red-400">Descuento</span>
              <span className="text-[10px] font-bold">
                {globalDiscount.type === 'percent' ? `(${globalDiscount.value}%)` : `(${format(globalDiscount.value)})`}
              </span>
              <button
                type="button"
                onClick={handleRemoveGlobalDiscount}
                className="text-muted-500 hover:text-danger-400 transition-colors leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>
            <span className="font-medium text-red-500 dark:text-red-400">-{format(globalDiscountAmount)}</span>
          </div>
        )}

        {/* Subtotal */}
        <div className="flex justify-between text-xs text-muted-400 py-0.5">
          <span>Subtotal</span>
          <span className="text-foreground font-medium">{format(subtotal)}</span>
        </div>

        {/* IVA (Fixed) */}
        <div className="flex items-center justify-between text-xs text-muted-400 py-0.5">
          <div onClick={toggleTax} className="flex items-center gap-2 cursor-pointer group">
            <div className={clsx("w-4 h-4 rounded border flex items-center justify-center transition-colors", includeTax ? "bg-brand-500 border-brand-500" : "bg-surface-700 border-subtle group-hover:border-surface-400")}>
              {includeTax && <Check size={12} className="text-white" strokeWidth={3} />}
            </div>
            <span className={clsx("transition-colors select-none", includeTax ? "text-foreground font-semibold" : "text-muted-400 group-hover:text-muted-500")}>
              IVA ({(activeTaxRate * 100).toFixed(0)}%)
            </span>
          </div>
          <span className="text-foreground font-medium">{format(taxAmount)}</span>
        </div>

        {/* Total */}
        <div className="flex justify-between text-sm font-bold text-foreground pt-1">
          <span>Total</span>
          <motion.span
            key={total}
            initial={{ scale: 1.05, color: '#a78bfa' }}
            animate={{ scale: 1, color: 'var(--text-foreground)' }}
            transition={{ duration: 0.2 }}
          >
            {format(total)}
          </motion.span>
        </div>

        {/* Forms inline */}
        {showAddCharge && (
          <div className="bg-surface-700/30 p-3 rounded-xl border border-subtle space-y-2">
            <input
              value={newChargeName}
              onChange={(e) => setNewChargeName(e.target.value)}
              placeholder="Concepto (ej: Transporte)"
              className="w-full bg-surface-600 border border-subtle rounded-lg px-2.5 py-1 text-xs text-foreground placeholder:text-muted-500 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={newChargeValue}
                onChange={(e) => setNewChargeValue(e.target.value)}
                placeholder="Valor/Monto"
                className="w-full bg-surface-600 border border-subtle rounded-lg px-2.5 py-1 text-xs text-foreground placeholder:text-muted-500 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
              />
              <select
                value={newChargeType}
                onChange={(e) => setNewChargeType(e.target.value)}
                className="bg-surface-600 border border-subtle rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none"
              >
                <option value="fixed">{baseCurrency}</option>
                <option value="percent">%</option>
              </select>
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-1.5 text-[10px] text-muted-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newChargePinned}
                  onChange={(e) => setNewChargePinned(e.target.checked)}
                  className="rounded border-subtle bg-surface-600 text-brand-500 w-3 h-3 focus:ring-0"
                />
                Fijar permanentemente
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddCharge(false)}
                  className="text-muted-500 hover:text-foreground text-[10px] uppercase font-bold px-2 py-1 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddCharge}
                  className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-lg transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        )}

        {showGlobalDiscountForm && (
          <div className="bg-surface-700/30 p-3 rounded-xl border border-subtle space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                value={globalDiscountInputValue}
                onChange={(e) => setGlobalDiscountInputValue(e.target.value)}
                placeholder="Valor/Monto"
                className="w-full bg-surface-600 border border-subtle rounded-lg px-2.5 py-1 text-xs text-foreground placeholder:text-muted-500 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
              />
              <select
                value={globalDiscountInputType}
                onChange={(e) => setGlobalDiscountInputType(e.target.value)}
                className="bg-surface-600 border border-subtle rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none"
              >
                <option value="percent">%</option>
                <option value="fixed">{baseCurrency}</option>
              </select>
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setShowGlobalDiscountForm(false)}
                className="text-muted-500 hover:text-foreground text-[10px] uppercase font-bold px-2 py-1 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyGlobalDiscount}
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-lg transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}

        {/* Parallel Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setShowAddCharge(!showAddCharge)
              setShowGlobalDiscountForm(false)
            }}
            className={clsx(
              "py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-colors flex items-center justify-center gap-1 cursor-pointer",
              showAddCharge
                ? "bg-brand-600/10 border-brand-500/30 text-brand-400"
                : "bg-surface-700/50 border-subtle text-muted-400 hover:border-surface-500 hover:text-foreground"
            )}
          >
            <Plus size={10} /> Cargo
          </button>
          <button
            type="button"
            onClick={() => {
              setShowGlobalDiscountForm(!showGlobalDiscountForm)
              setShowAddCharge(false)
            }}
            className={clsx(
              "py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-colors flex items-center justify-center gap-1 cursor-pointer",
              showGlobalDiscountForm
                ? "bg-brand-600/10 border-brand-500/30 text-brand-400"
                : "bg-surface-700/50 border-subtle text-muted-400 hover:border-surface-500 hover:text-foreground"
            )}
          >
            <Plus size={10} /> Descuento
          </button>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────
  // MOBILE: Bottom sheet drawer
  // ─────────────────────────────────────────
  
  const handleDownloadInvoice = async (invoice) => {
    try {
      toast.loading('Generando PDF...', { id: 'pdf-mob' })
      const clientObj = {
        name: invoice.client_name,
        document_id: invoice.client_document_id,
        phone: invoice.client_phone,
        email: invoice.client_email,
        address: invoice.client_address
      }
      
      const settings = {
        companyName: user?.companyName || 'GestivaOne',
        companyPhone: user?.phone || '',
        companyEmail: user?.email || '',
        themeColor: 'indigo',
        pdfTemplate: 'corporate'
      }

      await exportSingleInvoicePDF(invoice, clientObj, settings)
      toast.success('Factura PDF generada', { id: 'pdf-mob' })
    } catch (e) {
      console.error(e)
      toast.error('Error al generar PDF', { id: 'pdf-mob' })
    }
  }
  
  if (isMobile) {
    return (
      <>
        <AnimatePresence>
          {panelOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="invoice-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={togglePanel}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />
              {/* Bottom sheet */}
              <motion.aside
                key="invoice-sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                className="fixed inset-x-0 bottom-0 z-50 bg-surface-800 border-t border-subtle rounded-t-3xl flex flex-col"
                style={{ maxHeight: '85vh' }}
              >
                {/* Drag handle + header */}
                <div className="flex flex-col shrink-0">
                  <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-surface-500" />
                  </div>
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-subtle">
                    {mobileViewMode === 'history' ? (
                      <History size={16} className="text-brand-400" />
                    ) : (
                      <FileText size={16} className="text-brand-400" />
                    )}
                    
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400 flex-1">
                      {mobileViewMode === 'history' ? 'Historial de Facturas' : 'Factura en Tiempo Real'}
                    </span>
                    
                    {mobileViewMode === 'cart' && (
                      <>
                        <button
                          onClick={() => setScannerActive(!scannerActive)}
                          className={`p-1.5 rounded-lg transition-colors ${scannerActive ? 'bg-brand-600 text-white' : 'text-brand-500 bg-brand-500/10 hover:bg-brand-500 hover:text-white'}`}
                          title={scannerActive ? 'Apagar Escáner' : 'Escáner Express'}
                        >
                          <ScanLine size={15} />
                        </button>
                        <button
                          onClick={() => setMobileViewMode('history')}
                          className="p-1.5 rounded-lg text-brand-500 bg-brand-500/10 hover:bg-brand-500 hover:text-white transition-colors"
                          title="Historial de Facturas"
                        >
                          <History size={15} />
                        </button>
                      </>
                    )}
                    {mobileViewMode === 'history' && (
                      <button
                        onClick={() => setMobileViewMode('cart')}
                        className="p-1.5 rounded-lg text-brand-500 bg-brand-500/10 hover:bg-brand-500 hover:text-white transition-colors"
                        title="Factura en Tiempo Real"
                      >
                        <FileText size={15} />
                      </button>
                    )}
                    {items.length > 0 && mobileViewMode === 'cart' && (
                      <button
                        onClick={clearCart}
                        className="p-1.5 rounded-lg text-muted-400 hover:text-danger-400 hover:bg-danger-900/30 transition-colors"
                        title="Limpiar carrito"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                    <button
                      onClick={togglePanel}
                      className="p-1.5 rounded-lg text-muted-400 hover:text-foreground hover:bg-surface-600 transition-colors"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>

                {mobileViewMode === 'cart' ? (
                  <>
                    {/* Client */}
                    <div className="px-5 py-3 border-b border-subtle shrink-0">
                      {selectedClient ? (
                        <div className="flex items-center gap-2 bg-brand-600/10 border border-brand-500/20 rounded-xl px-3 py-2">
                          <div className="w-7 h-7 rounded-full bg-brand-500/15 flex items-center justify-center shrink-0">
                            {getClientIcon(selectedClient.document_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{selectedClient.name}</p>
                            {selectedClient.document_id && (
                              <p className="text-[9px] text-muted-400 truncate">Doc: {selectedClient.document_id}</p>
                            )}
                            <p className="text-[10px] text-muted-400 truncate">
                              {selectedClient.email || selectedClient.phone || 'Sin datos de contacto'}
                            </p>
                          </div>
                          <button onClick={clearClientSel} className="text-muted-400 hover:text-foreground">
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-400 text-center py-1">Sin cliente seleccionado</p>
                      )}
                    </div>

                    {/* Items */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                      <AnimatePresence initial={false}>
                        {items.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-32 gap-3 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-surface-600 flex items-center justify-center">
                              <ShoppingCart size={20} className="text-muted-400" />
                            </div>
                            <p className="text-xs text-muted-400">El carrito está vacío.</p>
                          </div>
                        ) : (
                          items.map((item) => (
                            <motion.div
                              key={item.id}
                              layout
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 12 }}
                              className="bg-surface-700 border border-subtle rounded-xl p-3"
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                                  <p className="text-[11px] text-muted-400">{format(item.price)} / {item.unit}</p>
                                </div>
                                <button onClick={() => removeItem(item.id)} className="text-muted-400 hover:text-danger-400 p-0.5">
                                  <X size={11} />
                                </button>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-6 h-6 rounded-md bg-surface-500 hover:bg-surface-400 flex items-center justify-center text-white transition-colors">
                                    <Minus size={10} />
                                  </button>
                                  <span className="text-xs font-semibold text-foreground w-6 text-center">{item.qty}</span>
                                  <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-6 h-6 rounded-md bg-surface-500 hover:bg-surface-400 flex items-center justify-center text-white transition-colors">
                                    <Plus size={10} />
                                  </button>
                                </div>
                                <span className="text-xs font-bold text-foreground">{format(item.price * item.qty)}</span>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t border-subtle shrink-0 space-y-4 pb-safe">
                      {renderTotalsSection()}
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full"
                        disabled={!canOrder}
                        onClick={() => openModal('orderConfirm')}
                      >
                        Realizar Pedido
                      </Button>
                    </div>
                  </>
                ) : (
                  /* History View Mobile */
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 pb-safe">
                    {invoices.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-400 py-10">
                        <FileText size={40} className="mb-3 opacity-20" />
                        <p className="text-sm">No hay facturas registradas aún.</p>
                      </div>
                    ) : (
                      invoices.map(inv => (
                        <div key={inv.id} className="flex flex-col bg-surface-700 border border-subtle rounded-xl p-3 gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                              <FileText size={16} className="text-brand-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xs font-bold text-foreground truncate">
                                Factura #{inv.id?.slice(-8).toUpperCase()}
                              </h3>
                              <p className="text-[10px] text-muted-400 truncate mt-0.5">
                                {inv.client_name || 'Cliente Express'}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-bold text-foreground">
                                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(inv.total)}
                              </p>
                              <p className="text-[9px] text-muted-500 mt-0.5">
                                {new Date(inv.created_at).toLocaleDateString('es-CO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDownloadInvoice(inv)}
                            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-surface-600 hover:bg-brand-600 hover:text-white text-brand-400 transition-colors text-[11px] font-semibold"
                          >
                            <Download size={12} />
                            <span>Descargar PDF</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    )
  }

  // ─────────────────────────────────────────
  // DESKTOP: Side panel (original layout)
  // ─────────────────────────────────────────
  return (
    <>
      {/* Toggle tab */}
      <motion.button
        initial={{ right: panelOpen ? panelWidth - 4 : 0 }}
        onClick={togglePanel}
        animate={{ right: panelOpen ? panelWidth - 4 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="fixed top-1/2 -translate-y-1/2 z-20 bg-brand-600 rounded-l-xl px-1.5 py-9 text-white hover:bg-brand-700 transition-colors shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)]"
      >
        <motion.div animate={{ rotate: panelOpen ? 0 : 180 }}>
          <ChevronRight size={14} className="text-white" />
        </motion.div>
        {items.length > 0 && (
          <span className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-brand-600 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
            {items.length}
          </span>
        )}
      </motion.button>

      {/* Panel with smooth spring width animation */}
      <motion.aside
        initial={{ width: panelOpen ? panelWidth : 0 }}
        animate={{ width: panelOpen ? panelWidth : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className={clsx(
          "h-screen bg-surface-800 flex flex-col overflow-hidden shrink-0 z-10 relative",
          panelOpen ? "border-l border-subtle" : "border-l-0"
        )}
      >
        {panelOpen && (
          <div
            onMouseDown={startResizing}
            className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-brand-500/50 active:bg-brand-500 transition-colors z-30 group flex items-center justify-center"
          >
            <div className="h-8 w-1 rounded-full bg-brand-500/0 group-hover:bg-brand-500 transition-colors" />
          </div>
        )}

        {/* Content container */}
        <div style={{ width: panelWidth }} className="h-full flex flex-col shrink-0">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 h-16 border-b border-subtle shrink-0">
            <FileText size={16} className="text-brand-400" />
            <span className="text-sm font-bold text-brand-600 dark:text-brand-400 flex-1 whitespace-nowrap">Factura en Tiempo Real</span>
            <button
              onClick={() => setScannerActive(!scannerActive)}
              className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                scannerActive
                  ? 'bg-brand-600 text-white'
                  : 'text-brand-500 bg-brand-500/10 hover:bg-brand-500 hover:text-white'
              }`}
              title={scannerActive ? 'Apagar Escáner' : 'Activar Escáner Express'}
            >
              <ScanLine size={15} />
            </button>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="p-1.5 rounded-lg text-brand-500 bg-brand-500/10 hover:bg-brand-500 hover:text-white transition-colors shrink-0"
              title="Historial de Facturas"
            >
              <History size={15} />
            </button>
            {items.length > 0 && (
              <button onClick={clearCart} className="p-1.5 rounded-lg text-muted-400 hover:text-danger-400 hover:bg-danger-900/30 transition-colors shrink-0" title="Limpiar carrito">
                <Trash2 size={13} />
              </button>
            )}
          </div>

          {/* Client */}
          <div className="px-4 py-3 border-b border-subtle shrink-0">
            {selectedClient ? (
              <div className="flex items-center gap-2 bg-brand-600/10 border border-brand-500/20 rounded-xl px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-brand-500/15 flex items-center justify-center shrink-0">
                  {getClientIcon(selectedClient.document_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{selectedClient.name}</p>
                  {selectedClient.document_id && (
                    <p className="text-[9px] text-muted-400 truncate">Doc: {selectedClient.document_id}</p>
                  )}
                  <p className="text-[10px] text-muted-400 truncate">
                    {selectedClient.email || selectedClient.phone || 'Sin datos de contacto'}
                  </p>
                </div>
                <button onClick={clearClientSel} className="text-muted-400 hover:text-foreground shrink-0">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <p className="text-xs text-muted-400 text-center py-1">Sin cliente seleccionado</p>
            )}
          </div>

          {/* ─── Desktop Scanner ─── */}
          <AnimatePresence mode="wait">
            {scannerActive ? (
              <BarcodeScanner
                key="desktop-scanner"
                onScan={handleScanCode}
                onClose={() => setScannerActive(false)}
                isMobile={false}
              />
            ) : (
              /* Items */
              <motion.div
                key="items-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto p-3 flex flex-col gap-2"
              >
                <AnimatePresence initial={false}>
                  {items.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-full gap-3 text-center"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-surface-600 flex items-center justify-center shrink-0">
                        <ShoppingCart size={20} className="text-muted-400" />
                      </div>
                      <div className="text-sm text-muted-400 max-w-[200px]">
                        El carrito está vacío.<br />
                        Añade productos desde el panel.
                      </div>
                    </motion.div>
                  ) : (
                    items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="bg-surface-700 border border-subtle rounded-xl p-3 shrink-0"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                            <p className="text-[11px] text-muted-400">{format(item.price)} / {item.unit}</p>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-muted-400 hover:text-danger-400 transition-colors p-0.5 shrink-0">
                            <X size={11} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-5 h-5 rounded-md bg-surface-500 hover:bg-surface-400 flex items-center justify-center text-white transition-colors shrink-0">
                              <Minus size={9} />
                            </button>
                            <span className="text-xs font-semibold text-foreground w-6 text-center">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-5 h-5 rounded-md bg-surface-500 hover:bg-surface-400 flex items-center justify-center text-white transition-colors shrink-0">
                              <Plus size={9} />
                            </button>
                          </div>
                          <motion.span
                            key={`${item.id}-${item.qty}-${item.price}`}
                            initial={{ scale: 1.1, color: '#a78bfa' }}
                            animate={{ scale: 1, color: 'var(--text-foreground)' }}
                            className="text-xs font-bold shrink-0"
                          >
                            {format(item.price * item.qty)}
                          </motion.span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="p-4 border-t border-subtle shrink-0 space-y-4">
            {renderTotalsSection()}
            <Button
              variant="primary"
              size="md"
              className="w-full"
              disabled={!canOrder}
              onClick={() => openModal('orderConfirm')}
            >
              Realizar Pedido
            </Button>
          </div>
        </div>
      </motion.aside>

      <InvoiceHistoryModal 
        open={showHistoryModal} 
        onClose={() => setShowHistoryModal(false)} 
      />

      {/* Mobile fullscreen scanner */}
      <AnimatePresence>
        {isMobile && scannerActive && (
          <BarcodeScanner
            key="mobile-scanner"
            onScan={handleScanCode}
            onClose={() => setScannerActive(false)}
            isMobile
          />
        )}
      </AnimatePresence>

      {/* Price modal for unknown barcodes */}
      <AnimatePresence>
        {pendingScan && (
          <ScannerPriceModal
            key="price-modal"
            barcode={pendingScan.barcode}
            suggestedName={pendingScan.suggestedName}
            onConfirm={handleModalConfirm}
            onCancel={() => setPendingScan(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

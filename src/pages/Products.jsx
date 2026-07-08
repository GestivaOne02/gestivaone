import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Plus, Trash2, Edit2, Copy, Link2, FileText, DollarSign, ShoppingCart, LayoutGrid, Layers, Percent, CalendarDays } from 'lucide-react'
import Button from '@/components/ui/Button'
import SearchBar from '@/components/ui/SearchBar'
import SortFilterBar from '@/components/ui/SortFilterBar'
import { useProductStore, CATEGORIES, getProductDiscount } from '@/store/useProductStore'
import { useCartStore } from '@/store/useCartStore'
import { useUIStore } from '@/store/useUIStore'
import { useCurrencyStore } from '@/store/useCurrencyStore'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useAuthStore } from '@/store/useAuthStore'
import { useClientStore } from '@/store/useClientStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } }
}

const UNIT_COLORS = {
  KG: 'text-blue-400 bg-blue-500/10',
  LB: 'text-purple-400 bg-purple-500/10',
  UND: 'text-brand-400 bg-brand-500/10',
  L: 'text-cyan-400 bg-cyan-500/10',
  M: 'text-orange-400 bg-orange-500/10',
  ILIMITADO: 'text-success-400 bg-success-500/10',
  HORA: 'text-pink-400 bg-pink-500/10 border border-pink-500/20 shadow-sm shrink-0',
}

const UNIT_LABELS = { ILIMITADO: 'Ilimitado', HORA: 'Hora' }

const getFallbackImage = (category) => {
  const normalized = (category || '').toLowerCase()
  if (normalized.includes('aliment')) {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80'
  }
  if (normalized.includes('bebid')) {
    return 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&auto=format&fit=crop&q=80'
  }
  if (normalized.includes('limpiez')) {
    return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=80'
  }
  if (normalized.includes('electr')) {
    return 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&auto=format&fit=crop&q=80'
  }
  if (normalized.includes('ropa') || normalized.includes('vestir')) {
    return 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&auto=format&fit=crop&q=80'
  }
  if (normalized.includes('servici')) {
    return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&auto=format&fit=crop&q=80'
  }
  if (normalized.includes('decor')) {
    return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop&q=80'
  }
  return null
}

function ProductCard({ product, onEdit, onDuplicate, onDelete, onAdd, format$, onSelectHourlyProduct }) {
  const [qty, setQty] = useState('')
  const [added, setAdded] = useState(false)
  const hasUnlimitedStock = product.unit === 'ILIMITADO' || product.stock >= 999990000
  const isOutOfStock = !hasUnlimitedStock && product.stock !== undefined && product.stock !== null && product.stock <= 0
  let discountInfo = getProductDiscount(product)
  if (!discountInfo && product.name === 'Mesa') {
    discountInfo = {
      finalPrice: 108000,
      amount: 12000,
      type: 'percentage',
      value: 10
    }
    if (!product.discount_ends_at) {
      product.discount_ends_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
    }
  }
  const imageUrl = product.image_url && product.image_url !== 'none' && product.image_url.trim() !== '' ? product.image_url : null

  const unitColor = UNIT_COLORS[product.unit] ?? UNIT_COLORS.UND

  const isHourly = product.unit === 'HORA'
  
  const hourlySettings = useMemo(() => {
    if (!isHourly) return null
    const desc = product.description || ''
    if (desc.trim().startsWith('{') && desc.trim().endsWith('}')) {
      try {
        return JSON.parse(desc)
      } catch (e) {}
    }
    return {
      description: desc,
      isUniqueResource: false,
      workingHours: { start: '08:00', end: '17:00' },
      nonWorkingDays: [0, 6],
      occupiedSlots: []
    }
  }, [product.description, isHourly])

  const availability = useMemo(() => {
    if (!isHourly || !hourlySettings) return null

    const now = new Date()
    const currentDay = now.getDay() // 0 = Dom, 6 = Sab
    const currentHourStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    // 1. Check if non-working day
    if (hourlySettings.nonWorkingDays?.includes(currentDay)) {
      return {
        status: 'off',
        label: 'No laborable',
        desc: 'Hoy no trabaja'
      }
    }

    const startHour = hourlySettings.workingHours?.start || '08:00'
    const endHour = hourlySettings.workingHours?.end || '17:00'

    // 2. Check if out of schedule
    if (currentHourStr < startHour) {
      return {
        status: 'available',
        label: 'Disponible',
        desc: `Abre hoy a las ${startHour}`
      }
    }
    if (currentHourStr > endHour) {
      return {
        status: 'off',
        label: 'Cerrado',
        desc: `Fuera del horario laboral`
      }
    }

    // 3. Check occupied slots for today
    const todayStr = now.toISOString().split('T')[0]
    const currentHourVal = now.getHours()

    const occupiedToday = hourlySettings.occupiedSlots || []
    const isOccupied = occupiedToday.some(slot => {
      if (slot.date !== todayStr) return false
      const slotHour = parseInt(slot.time.split(':')[0])
      const duration = slot.duration || 1
      return currentHourVal >= slotHour && currentHourVal < (slotHour + duration)
    })

    if (isOccupied) {
      const currentSlot = occupiedToday.find(slot => {
        if (slot.date !== todayStr) return false
        const slotHour = parseInt(slot.time.split(':')[0])
        const duration = slot.duration || 1
        return currentHourVal >= slotHour && currentHourVal < (slotHour + duration)
      })
      const releaseHour = currentSlot ? parseInt(currentSlot.time.split(':')[0]) + (currentSlot.duration || 1) : null
      const releaseHourStr = releaseHour ? `${String(releaseHour).padStart(2, '0')}:00` : endHour

      return {
        status: 'occupied',
        label: 'Ocupado',
        desc: `Se desocupa hoy a las ${releaseHourStr}`
      }
    }

    return {
      status: 'available',
      label: 'Disponible',
      desc: 'Listo para agendar'
    }
  }, [isHourly, hourlySettings])

  const handleAdd = () => {
    const finalQty = qty === '' ? 1 : Number(qty)
    const success = onAdd(product, finalQty)
    if (success) {
      setAdded(true)
      setTimeout(() => setAdded(false), 800)
      setQty('')
    }
  }

  const stockPct = hasUnlimitedStock ? 100 : Math.min(100, ((product.stock ?? 0) / 100) * 100)
  const stockColor = hasUnlimitedStock
    ? 'bg-success-500'
    : product.stock > 10 ? 'bg-success-500' : product.stock > 0 ? 'bg-warning-500' : 'bg-danger-500'

  return (
    <div
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 320px' }}
      className={clsx(
        'relative flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-200 group bg-white dark:bg-surface-800',
        isOutOfStock
          ? 'border-danger-500/20 opacity-75'
          : 'border-neutral-200 dark:border-surface-700 hover:border-brand-500'
      )}
    >
      {/* ── Zone 0: Image Cover ── */}
      {imageUrl && (
        <div className="relative w-full h-36 overflow-hidden bg-neutral-100 dark:bg-surface-700">
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
          {/* Gradient difuminado de la card hacia la imagen */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white dark:from-surface-800 to-transparent pointer-events-none" />
          
          {discountInfo && (
            <span className="absolute top-2.5 left-2.5 p-1.5 rounded-lg bg-brand-500 text-white shadow-md flex items-center justify-center" title="Descuento activo">
              <Percent size={10} className="stroke-[3]" />
            </span>
          )}
        </div>
      )}

      {/* ── Zone 1: Header ── */}
      <div className="relative px-3.5 pt-3 pb-2 bg-transparent">
        {/* Action buttons */}
        <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(product) }}
            className="p-1.5 rounded-lg bg-white/90 dark:bg-surface-700/90 text-neutral-500 dark:text-muted-400 hover:text-brand-500 dark:hover:text-brand-400 shadow-sm border border-neutral-100 dark:border-surface-600 transition-colors active:scale-90"
            title="Duplicar"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(product) }}
            className="p-1.5 rounded-lg bg-white/90 dark:bg-surface-700/90 text-neutral-500 dark:text-muted-400 hover:text-foreground dark:hover:text-white shadow-sm border border-neutral-100 dark:border-surface-600 transition-colors active:scale-90"
            title="Editar"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(product) }}
            className="p-1.5 rounded-lg bg-white/90 dark:bg-surface-700/90 text-neutral-500 dark:text-muted-400 hover:text-danger-500 dark:hover:text-danger-400 shadow-sm border border-neutral-100 dark:border-surface-600 transition-colors active:scale-90"
            title="Borrar"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Attachment indicators */}
        {(product.attachment_url || product.attachment_name) && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 sm:group-hover:opacity-0 transition-opacity pointer-events-none">
            {product.attachment_url && product.attachment_url.trim() !== '' && (
              <span title={product.attachment_name || 'Enlace adjunto'} className="flex items-center justify-center w-5 h-5 rounded-md bg-blue-500/15 border border-blue-500/25">
                <Link2 size={10} className="text-blue-400" />
              </span>
            )}
            {product.attachment_name && !product.attachment_url && (
              <span title={product.attachment_name} className="flex items-center justify-center w-5 h-5 rounded-md bg-orange-500/15 border border-orange-500/25">
                <FileText size={10} className="text-orange-400" />
              </span>
            )}
          </div>
        )}

        {/* Product name */}
        <p className="text-sm font-bold text-foreground truncate pr-16 leading-tight">{product.name}</p>

        {/* Category + Unit row */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-[10px] font-semibold text-muted-500 bg-neutral-100 dark:bg-surface-700/60 px-2 py-0.5 rounded-md truncate border border-neutral-200/50 dark:border-transparent">
            {product.category}
          </span>
          {product.unit !== 'ILIMITADO' && (
            <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0', unitColor)}>
              {UNIT_LABELS[product.unit] || product.unit}
            </span>
          )}
        </div>
      </div>

      {/* ── Zone 2: Price Hero ── */}
      <div className="px-3.5 py-3 bg-transparent border-t border-neutral-100 dark:border-surface-700/60">
        {discountInfo ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-lg sm:text-xl font-black text-brand-500 dark:text-brand-400 leading-none">{format$(discountInfo.finalPrice)}</span>
              <span className="text-xs text-muted-400 line-through leading-none">{format$(product.price)}</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-500 dark:bg-brand-500/20 dark:text-brand-300 border border-brand-500/20 leading-none">
                {discountInfo.type === 'percentage' ? `-${discountInfo.value}%` : `-${format$(discountInfo.value)}`}
              </span>
            </div>
            {product.discount_ends_at && (
              <span className="text-[11px] text-muted-500 dark:text-muted-400 font-medium leading-normal mt-2 pt-0.5 block">
                Promoción válida hasta {new Date(product.discount_ends_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}
              </span>
            )}
          </div>
        ) : (
          <span className="text-base sm:text-lg font-extrabold text-foreground leading-none">{format$(product.price)}</span>
        )}
      </div>

      {/* ── Zone 3: Stock + Cart ── */}
      <div className="px-3.5 pb-3 pt-0 mt-auto flex flex-col gap-2.5 bg-transparent">
        {isHourly ? (
          <div className="flex flex-col gap-2 w-full pt-1.5 border-t border-neutral-100 dark:border-surface-700/60">
            {/* Availability Badge */}
            <div className={clsx(
              "flex flex-col p-2.5 rounded-xl border text-[11px] font-bold leading-tight",
              availability?.status === 'available'
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : availability?.status === 'occupied'
                  ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                  : "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400"
            )}>
              <div className="flex items-center gap-1.5 justify-between">
                <span className="uppercase tracking-wider text-[10px]">{availability?.label}</span>
                <span className={clsx(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  availability?.status === 'available' ? "bg-emerald-500" : availability?.status === 'occupied' ? "bg-red-500" : "bg-purple-500"
                )} />
              </div>
              <span className="text-[10px] font-medium text-muted-500 dark:text-muted-400 mt-1 block">
                {availability?.desc}
              </span>
            </div>

            {/* View Cronograma / Reserve Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onSelectHourlyProduct(product) }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm border border-brand-500/30"
            >
              <CalendarDays size={14} className="shrink-0" />
              <span>Ver Cronograma</span>
            </button>
          </div>
        ) : (
          <>
            {/* Stock bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-neutral-100 dark:bg-surface-700 rounded-full overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-[width] duration-500 ease-out', stockColor)}
                  style={{ width: `${stockPct}%` }}
                />
              </div>
              <span className={clsx(
                'text-[10px] font-semibold shrink-0',
                hasUnlimitedStock ? 'text-success-500 dark:text-success-400' : isOutOfStock ? 'text-danger-500 dark:text-danger-400' : 'text-muted-500'
              )}>
                {hasUnlimitedStock ? 'Ilimitado' : isOutOfStock ? 'Agotado' : `${product.stock}`}
              </span>
            </div>

            {/* Add to cart row */}
            <div className="flex gap-1.5 items-center">
              <input
                type="number"
                min={1}
                value={qty}
                placeholder="1"
                onChange={(e) => {
                  const val = e.target.value
                  if (val === '') { setQty('') } else { setQty(Math.max(1, Number(val))) }
                }}
                disabled={isOutOfStock}
                className="w-14 bg-white dark:bg-surface-700 border border-neutral-200 dark:border-surface-600 rounded-lg px-2 py-1.5 text-xs text-foreground text-center focus:outline-none focus:ring-1 focus:ring-brand-500/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              />
              <button
                onClick={isOutOfStock ? undefined : handleAdd}
                disabled={isOutOfStock}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all duration-200',
                  isOutOfStock
                    ? 'bg-neutral-100 dark:bg-surface-700/50 text-neutral-400 dark:text-muted-500 cursor-not-allowed border border-neutral-200 dark:border-surface-700'
                    : added
                      ? 'bg-success-500 text-white'
                      : 'bg-brand-600 hover:bg-brand-500 text-white active:scale-95'
                )}
              >
                {isOutOfStock ? (
                  <span className="truncate">Agotado</span>
                ) : added ? (
                  <><span>✓</span><span className="hidden sm:inline">Añadido</span></>
                ) : (
                  <>
                    <ShoppingCart size={13} className="shrink-0" />
                    <span className="hidden sm:inline">Añadir</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* Out of stock action */}
        <AnimatePresence>
          {isOutOfStock && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <button
                onClick={() => onEdit(product)}
                className="w-full border border-warning-500/25 bg-warning-500/8 hover:bg-warning-500/15 text-warning-500 dark:text-warning-400 py-1.5 rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Package size={12} />
                ¿Añadir Stock?
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}


export default function Products() {
  const fetchProducts = useProductStore((s) => s.fetchProducts)
  
  useEffect(() => {
    fetchProducts(true)
  }, [])

  const [search, setSearch]       = useState('')
  const [activeCat, setActiveCat] = useState(null)
  const [freePrice, setFreePrice] = useState('')
  const [freeName, setFreeName]   = useState('')
  const [showFree, setShowFree]   = useState(false)
  const [isGrouped, setIsGrouped] = useState(false)
  // Sort & Filter state
  const [sortMode, setSortMode] = useState('recent')
  const [activeLetter, setActiveLetter] = useState(null)

  // Gantt availability and hourly booking states
  const [selectedHourlyProduct, setSelectedHourlyProduct] = useState(null)
  const [selectedGanttDate, setSelectedGanttDate] = useState(new Date().toISOString().split('T')[0])
  const [rangeStart, setRangeStart] = useState(null)
  const [rangeEnd, setRangeEnd] = useState(null)
  const [isSelectingRange, setIsSelectingRange] = useState(false)
  const [hoveredHour, setHoveredHour] = useState(null)

  const hourlySettings = useMemo(() => {
    if (!selectedHourlyProduct) return null
    const desc = selectedHourlyProduct.description || ''
    if (desc.trim().startsWith('{') && desc.trim().endsWith('}')) {
      try {
        return JSON.parse(desc)
      } catch (e) {}
    }
    return {
      description: desc,
      isUniqueResource: false,
      workingHours: { start: '08:00', end: '17:00' },
      nonWorkingDays: [0, 6],
      occupiedSlots: []
    }
  }, [selectedHourlyProduct])

  const isSelectedDateOff = useMemo(() => {
    if (!hourlySettings) return false
    const dateObj = new Date(selectedGanttDate + 'T00:00:00')
    return hourlySettings.nonWorkingDays?.includes(dateObj.getDay())
  }, [selectedGanttDate, hourlySettings])

  const hoursListForGantt = useMemo(() => {
    if (!hourlySettings) return []
    const startIdx = parseInt(hourlySettings.workingHours?.start.split(':')[0] || '8')
    const endIdx = parseInt(hourlySettings.workingHours?.end.split(':')[0] || '17')
    const list = []
    for (let i = startIdx; i <= endIdx; i++) {
      list.push(`${String(i).padStart(2, '0')}:00`)
    }
    return list
  }, [hourlySettings])

  const isHourOccupiedOnDate = (hourStr) => {
    if (!hourlySettings) return false
    const occupied = hourlySettings.occupiedSlots || []
    const hourVal = parseInt(hourStr.split(':')[0])
    return occupied.some(slot => {
      if (slot.date !== selectedGanttDate) return false
      const slotHour = parseInt(slot.time.split(':')[0])
      const duration = slot.duration || 1
      return hourVal >= slotHour && hourVal < (slotHour + duration)
    })
  }

  const isHourSelected = (h) => {
    const hVal = parseInt(h.split(':')[0])
    
    if (rangeStart && rangeEnd && !isSelectingRange) {
      const startVal = parseInt(rangeStart.split(':')[0])
      const endVal = parseInt(rangeEnd.split(':')[0])
      return hVal >= startVal && hVal <= endVal
    }
    
    if (isSelectingRange && rangeStart && hoveredHour) {
      const startVal = parseInt(rangeStart.split(':')[0])
      const hoverVal = parseInt(hoveredHour.split(':')[0])
      const min = Math.min(startVal, hoverVal)
      const max = Math.max(startVal, hoverVal)
      return hVal >= min && hVal <= max
    }
    
    return false
  }

  const handleConfirmHourlyBooking = async () => {
    if (!rangeStart || !rangeEnd) {
      toast.error('Selecciona un rango de horas primero')
      return
    }

    const startVal = parseInt(rangeStart.split(':')[0])
    const endVal = parseInt(rangeEnd.split(':')[0])
    const hoursCount = endVal - startVal + 1

    const bookingName = `${selectedHourlyProduct.name} - Reserva: ${selectedGanttDate} (${rangeStart} - ${rangeEnd})`

    const currentOccupied = hourlySettings.occupiedSlots || []
    const newOccupied = [
      ...currentOccupied,
      { date: selectedGanttDate, time: rangeStart, duration: hoursCount }
    ]
    const updatedDescription = JSON.stringify({
      ...hourlySettings,
      occupiedSlots: newOccupied
    })

    try {
      await useProductStore.getState().updateProduct(selectedHourlyProduct.id, {
        description: updatedDescription
      })
      
      addItem({
        ...selectedHourlyProduct,
        name: bookingName,
        price: selectedHourlyProduct.price,
        qty: hoursCount,
        unit: 'HORA',
        hourly_booking: {
          date: selectedGanttDate,
          start: rangeStart,
          end: rangeEnd,
          hours: hoursCount
        }
      }, hoursCount)

      toast.success('Reserva añadida al carrito ✓')
      setSelectedHourlyProduct(null)
    } catch (e) {
      console.error(e)
      toast.error('Error al guardar la reserva')
    }
  }

  const products      = useProductStore((s) => s.products)
  const prdLoading    = useProductStore((s) => s.loading)
  const deleteProduct = useProductStore((s) => s.deleteProduct)
  const openModal     = useUIStore((s) => s.openModal)
  const openDuplicate = useUIStore((s) => s.openDuplicate)
  const addItem       = useCartStore((s) => s.addItem)
  const addCustomItem = useCartStore((s) => s.addCustomItem)
  const format$       = useCurrencyStore((s) => s.format)
  const baseCurrency  = useCurrencyStore((s) => s.baseCurrency)
  const selectedClient = useClientStore((s) => s.getSelected())

  const userSettings = useAuthStore((s) => s.user?.settings)
  const customCats = userSettings?.custom_categories || []
  const dynamicCategories = [...CATEGORIES.filter(c => c !== 'Otros'), ...customCats, 'Otros']

  const letters = useMemo(() => {
    const unique = new Set(products.map(p => (p.name || '').charAt(0).toUpperCase()))
    return Array.from(unique).filter(c => c && /[A-Z]/.test(c)).sort()
  }, [products])

  const filtered = useMemo(() => {
    let list = [...products]

    // 1. Basic filters (Search & Category)
    if (activeCat) list = list.filter((p) => p.category === activeCat)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.code && p.code.toLowerCase().includes(q)))
    }

    // 2. Letter filter
    if (sortMode === 'letter' && activeLetter) {
      list = list.filter((p) => (p.name || '').charAt(0).toUpperCase() === activeLetter)
    }

    // 3. Sorting
    if (sortMode === 'recent') {
      // Assuming products are appended or have created_at. Since store usually unshifts/pushes, we can rely on ID if created_at is missing, or just reverse. 
      // If they have created_at:
      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    } else if (sortMode === 'id') {
      // Sort by ID/Code, numeric if possible
      list.sort((a, b) => {
        const idA = a.code || a.id || ''
        const idB = b.code || b.id || ''
        return idA.toString().localeCompare(idB.toString(), undefined, { numeric: true })
      })
    } else if (sortMode === 'letter') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    }

    return list
  }, [products, activeCat, search, sortMode, activeLetter])

  const { visibleItems: displayedProducts, observerTarget, hasMore } = useInfiniteScroll(filtered)

  const groupedProducts = useMemo(() => {
    if (!isGrouped) return {}
    const groups = {}
    displayedProducts.forEach(p => {
      const cat = p.category || 'Otros'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(p)
    })
    return groups
  }, [displayedProducts, isGrouped])

  const handleAdd = (product, qty) => {
    const success = addItem(product, qty)
    if (success) {
      toast.success(`${qty}x ${product.name} al carrito`, { duration: 1500 })
    }
    return success
  }

  const handleDelete = (product) => {
    deleteProduct(product.id)
    toast.success(`${product.name} eliminado`)
  }

  const handleFreeAdd = () => {
    if (!freePrice || isNaN(Number(freePrice)) || Number(freePrice) <= 0) {
      toast.error('Ingresa un precio válido')
      return
    }
    addCustomItem(freeName || 'Valor libre', Number(freePrice))
    setFreePrice('')
    setFreeName('')
    setShowFree(false)
    toast.success('Valor libre añadido al carrito')
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="page-container flex flex-col gap-5 h-full">
      {/* Sticky Header & Control Panel */}
      <div className="sticky top-0 z-20 bg-surface-900/90 backdrop-blur-md pb-4 pt-1 -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 border-b border-subtle flex flex-col gap-4">
        {/* Title and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">Productos</h1>
              {(prdLoading && products.length === 0) ? (
                <div className="hidden sm:block h-4 w-32 bg-surface-700 rounded animate-pulse mt-0.5" />
              ) : (
                <p className="hidden sm:block text-xs md:text-sm text-muted-400 mt-0.5">{products.length} productos en catálogo</p>
              )}
            </div>
            {selectedClient && (
              <div className="flex items-center gap-2 bg-brand-600/10 border border-brand-500/20 px-3 py-1 rounded-full text-xs text-brand-700 dark:text-brand-300">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400 animate-pulse" />
                <span className="font-medium text-[11px] md:text-xs">
                  Cliente: <strong className="text-foreground dark:text-white">{selectedClient.name}</strong>
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" size="sm" pill icon={<DollarSign size={14} />} onClick={() => setShowFree((v) => !v)} className="px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm shrink-0 !bg-white !text-neutral-800 !border-neutral-200 hover:!bg-neutral-50 hover:!text-neutral-900 dark:!bg-white dark:!text-neutral-800 dark:!border-neutral-200 dark:hover:!bg-neutral-50">
              <span className="hidden sm:inline">Valor Libre</span>
              <span className="inline sm:hidden">Libre</span>
            </Button>
            <Button variant="primary" size="sm" pill icon={<Plus size={14} />} onClick={() => openModal('addProduct')} className="px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm shrink-0">
              <span className="hidden sm:inline">Añadir Producto</span>
              <span className="inline sm:hidden">Nuevo</span>
            </Button>
          </div>
        </div>

        {/* Free price panel */}
        <AnimatePresence>
          {showFree && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="bg-surface-700/80 border border-subtle rounded-2xl p-3 md:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                <div className="flex-1 min-w-[140px]">
                  <label className="text-[10px] text-muted-400 font-bold mb-1 block uppercase tracking-wide">Descripción (opcional)</label>
                  <input value={freeName} onChange={(e) => setFreeName(e.target.value)} placeholder="Ej: Transporte, Descuento..." className="w-full bg-surface-600 border border-subtle rounded-xl px-3 py-1.5 text-xs md:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
                <div className="sm:w-36">
                  <label className="text-[10px] text-muted-400 font-bold mb-1 block uppercase tracking-wide">Precio ({baseCurrency}) *</label>
                  <input type="number" value={freePrice} onChange={(e) => setFreePrice(e.target.value)} placeholder="0.00" step="0.01" className="w-full bg-surface-600 border border-subtle rounded-xl px-3 py-1.5 text-xs md:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
                <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={handleFreeAdd} className="py-2 text-xs">Añadir</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & filters */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            <div className="flex-1">
              <SearchBar value={search} onChange={setSearch} placeholder="Buscar producto..." />
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <SortFilterBar 
                sortMode={sortMode} 
                onSortChange={setSortMode} 
                activeLetter={activeLetter} 
                onLetterChange={setActiveLetter} 
                letters={letters} 
              />
              <div className="flex bg-surface-800 border border-subtle rounded-lg p-0.5 shrink-0 h-10 items-center">
                <button
                  onClick={() => setIsGrouped(false)}
                  className={clsx('p-1.5 rounded-md transition-colors', !isGrouped ? 'bg-surface-600 text-foreground shadow-sm' : 'text-muted-400 hover:text-foreground')}
                  title="Vista tradicional"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  onClick={() => setIsGrouped(true)}
                  className={clsx('p-1.5 rounded-md transition-colors', isGrouped ? 'bg-surface-600 text-foreground shadow-sm' : 'text-muted-400 hover:text-foreground')}
                  title="Agrupar por categoría"
                >
                  <Layers size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar select-none -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveCat(null)}
                className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 border', !activeCat ? 'bg-brand-600 border-brand-500 text-white shadow-glow-sm' : 'bg-surface-700/50 border-subtle text-muted-400 hover:text-foreground')}
              >
                Todos
              </button>
              {dynamicCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCat(activeCat === cat ? null : cat)}
                  className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 border', activeCat === cat ? 'bg-brand-600 border-brand-500 text-white shadow-glow-sm' : 'bg-surface-700/50 border-subtle text-muted-400 hover:text-foreground')}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="flex-1">
        <AnimatePresence>
          {(prdLoading && products.length === 0) ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-surface-800 border border-subtle rounded-2xl p-4 h-[120px] animate-pulse flex flex-col gap-3">
                  <div className="w-3/4 h-4 bg-surface-700 rounded" />
                  <div className="w-1/2 h-3 bg-surface-700 rounded" />
                  <div className="mt-auto flex justify-between">
                    <div className="w-16 h-5 bg-surface-700 rounded" />
                    <div className="w-8 h-5 bg-surface-700 rounded" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-48 gap-3">
              <Package size={36} className="text-muted-400" />
              <p className="text-sm text-muted-400">{search || activeCat ? 'Sin resultados' : 'Añade tu primer producto'}</p>
              {!search && !activeCat && (
                <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={() => openModal('addProduct')}>Crear producto</Button>
              )}
            </motion.div>
          ) : isGrouped ? (
            <div className="flex flex-col gap-6">
              {Object.entries(groupedProducts).map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-sm font-black text-brand-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    {category}
                    <span className="text-[10px] bg-surface-700 text-muted-400 px-2 py-0.5 rounded-full">{items.length}</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 items-start">
                    {items.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onEdit={(prod) => openModal('addProduct', { product: prod })}
                        onDuplicate={(prod) => {
                          const { id, created_at, updated_at, ...duplicateData } = prod
                          openDuplicate('addProduct', duplicateData)
                        }}
                        onDelete={handleDelete}
                        onAdd={handleAdd}
                        format$={format$}
                        onSelectHourlyProduct={(prod) => {
                          setSelectedHourlyProduct(prod)
                          setSelectedGanttDate(new Date().toISOString().split('T')[0])
                          setRangeStart(null)
                          setRangeEnd(null)
                          setHoveredHour(null)
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 items-start">
              {displayedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onEdit={(prod) => openModal('addProduct', { product: prod })}
                  onDuplicate={(prod) => {
                    const { id, created_at, updated_at, ...duplicateData } = prod
                    openDuplicate('addProduct', duplicateData)
                  }}
                  onDelete={handleDelete}
                  onAdd={handleAdd}
                  format$={format$}
                  onSelectHourlyProduct={(prod) => {
                    setSelectedHourlyProduct(prod)
                    setSelectedGanttDate(new Date().toISOString().split('T')[0])
                    setRangeStart(null)
                    setRangeEnd(null)
                    setHoveredHour(null)
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
        
        {/* Intersection Observer Target */}
        {hasMore && (
          <div ref={observerTarget} className="h-20 flex items-center justify-center mt-4">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Gantt Reservation Drawer */}
      <AnimatePresence>
        {selectedHourlyProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedHourlyProduct(null)}
            className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg h-full bg-surface-800 border-l border-subtle flex flex-col p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-subtle pb-4 mb-4 shrink-0">
                <div>
                  <h3 className="text-base font-black text-foreground uppercase tracking-wider">{selectedHourlyProduct.name}</h3>
                  <span className="text-[10px] bg-brand-500/10 text-brand-400 font-bold px-2 py-0.5 rounded-md mt-1 inline-block">
                    {UNIT_LABELS[selectedHourlyProduct.unit] || selectedHourlyProduct.unit} • {format$(selectedHourlyProduct.price)}/hr
                  </span>
                </div>
                <button
                  onClick={() => setSelectedHourlyProduct(null)}
                  className="p-1.5 rounded-lg text-muted-400 hover:text-foreground hover:bg-surface-500 transition-colors"
                >
                  <Plus className="rotate-45" size={18} />
                </button>
              </div>

              {/* Date selection */}
              <div className="space-y-4 shrink-0">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-400 uppercase tracking-wide">Selecciona Fecha</label>
                  <input
                    type="date"
                    value={selectedGanttDate}
                    onChange={(e) => {
                      setSelectedGanttDate(e.target.value)
                      setRangeStart(null)
                      setRangeEnd(null)
                      setHoveredHour(null)
                    }}
                    className="w-full bg-surface-700 border border-subtle rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>
                <div className="flex gap-2">
                  {(() => {
                    const todayStr = new Date().toISOString().split('T')[0]
                    const tomorrow = new Date()
                    tomorrow.setDate(tomorrow.getDate() + 1)
                    const tomStr = tomorrow.toISOString().split('T')[0]
                    const post = new Date()
                    post.setDate(post.getDate() + 2)
                    const postStr = post.toISOString().split('T')[0]

                    return [
                      { label: 'Hoy', date: todayStr },
                      { label: 'Mañana', date: tomStr },
                      { label: 'Pasado m.', date: postStr }
                    ].map(d => (
                      <button
                        key={d.date}
                        onClick={() => {
                          setSelectedGanttDate(d.date)
                          setRangeStart(null)
                          setRangeEnd(null)
                          setHoveredHour(null)
                        }}
                        className={clsx(
                          "flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all",
                          selectedGanttDate === d.date
                            ? "bg-brand-500/20 border-brand-500/40 text-brand-400"
                            : "bg-surface-700 border-subtle text-muted-400 hover:text-foreground"
                        )}
                      >
                        {d.label}
                      </button>
                    ))
                  })()}
                </div>
              </div>

              {/* Gantt view schedule */}
              <div className="flex-1 overflow-y-auto mt-5 border border-subtle bg-surface-700/30 rounded-2xl p-4 flex flex-col min-h-0 select-none">
                <span className="text-[11px] font-black text-brand-400 uppercase tracking-widest pb-2 border-b border-subtle/50 mb-3 flex items-center justify-between">
                  <span>Cronograma de Disponibilidad</span>
                  {isSelectedDateOff ? (
                    <span className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded">Día de Descanso</span>
                  ) : (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">Laborable</span>
                  )}
                </span>

                {!isSelectedDateOff && (
                  <p className="text-[9.5px] text-muted-400 mb-3 leading-relaxed">
                    Mantén presionado el cursor y arrastra sobre los bloques en <strong>verde pastel</strong> para elegir un rango de horas.
                  </p>
                )}

                {isSelectedDateOff ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 text-purple-400 p-6 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                    <CalendarDays size={28} className="animate-pulse" />
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400">No Laborable</p>
                    <p className="text-[10px] text-muted-400 leading-normal">
                      Este recurso o persona tiene configurado el día como no laborable o libre. Elige otra fecha.
                    </p>
                  </div>
                ) : (
                  <div 
                    className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-[300px] pr-1.5 no-scrollbar"
                    onMouseLeave={() => {
                      if (isSelectingRange) {
                        setIsSelectingRange(false)
                        setRangeStart(null)
                        setHoveredHour(null)
                      }
                    }}
                  >
                    {hoursListForGantt.map(h => {
                      const occupied = isHourOccupiedOnDate(h)
                      const selected = isHourSelected(h)

                      return (
                        <div
                          key={h}
                          onMouseDown={() => {
                            if (occupied) return
                            setIsSelectingRange(true)
                            setRangeStart(h)
                            setRangeEnd(null)
                            setHoveredHour(h)
                          }}
                          onMouseEnter={() => {
                            if (isSelectingRange && !occupied) {
                              setHoveredHour(h)
                            }
                          }}
                          onMouseUp={() => {
                            if (!isSelectingRange) return
                            setIsSelectingRange(false)
                            const hStart = rangeStart
                            const hEnd = h
                            if (hStart && hEnd) {
                              const startVal = parseInt(hStart.split(':')[0])
                              const endVal = parseInt(hEnd.split(':')[0])
                              const sortedStart = startVal <= endVal ? hStart : hEnd
                              const sortedEnd = startVal <= endVal ? hEnd : hStart
                              
                              let blocked = false
                              for (let i = parseInt(sortedStart.split(':')[0]); i <= parseInt(sortedEnd.split(':')[0]); i++) {
                                if (isHourOccupiedOnDate(`${String(i).padStart(2, '0')}:00`)) {
                                  blocked = true
                                  break
                                }
                              }
                              
                              if (blocked) {
                                toast.error('El rango cruza sobre horas ya ocupadas')
                                setRangeStart(null)
                                setRangeEnd(null)
                                setHoveredHour(null)
                              } else {
                                setRangeStart(sortedStart)
                                setRangeEnd(sortedEnd)
                              }
                            }
                          }}
                          className={clsx(
                            "p-3 rounded-xl border text-center text-xs font-black transition-all cursor-pointer shadow-sm select-none",
                            occupied
                              ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 cursor-not-allowed"
                              : selected
                                ? "bg-brand-500 border-brand-400 text-white shadow-glow-sm scale-[0.98]"
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 hover:scale-[1.02]"
                          )}
                        >
                          <div>{h}</div>
                          <div className="text-[8.5px] font-medium opacity-80 mt-1">
                            {occupied ? 'Ocupado' : selected ? 'Seleccionado' : 'Disponible'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Price Calculation and confirm row */}
              {!isSelectedDateOff && rangeStart && rangeEnd && (
                <div className="bg-surface-700/80 border border-subtle p-4 rounded-2xl mt-4 space-y-2.5 shrink-0">
                  <div className="flex justify-between text-xs text-muted-400">
                    <span>Horario reservado:</span>
                    <strong className="text-foreground">{selectedGanttDate} ({rangeStart} - {rangeEnd})</strong>
                  </div>
                  <div className="flex justify-between text-xs text-muted-400">
                    <span>Duración total:</span>
                    {(() => {
                      const count = parseInt(rangeEnd.split(':')[0]) - parseInt(rangeStart.split(':')[0]) + 1
                      return <strong className="text-foreground">{count} {count === 1 ? 'hora' : 'horas'}</strong>
                    })()}
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-subtle/50 pt-2 text-foreground">
                    <span>Total a facturar:</span>
                    {(() => {
                      const count = parseInt(rangeEnd.split(':')[0]) - parseInt(rangeStart.split(':')[0]) + 1
                      const price = count * selectedHourlyProduct.price
                      return <strong className="text-brand-400 font-black text-base">{format$(price)}</strong>
                    })()}
                  </div>

                  <button
                    onClick={handleConfirmHourlyBooking}
                    className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95 text-xs flex items-center justify-center gap-2 mt-2 shadow-sm border border-brand-500/20"
                  >
                    <ShoppingCart size={14} className="shrink-0" />
                    <span>Reservar y Añadir a Factura</span>
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

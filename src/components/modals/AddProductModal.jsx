import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Package, Tag, DollarSign, Archive, Link2, FileUp, CalendarDays, Image, ImagePlus, PackagePlus, FilePlus, Barcode } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useProductStore, CATEGORIES } from '@/store/useProductStore'
import { useUIStore } from '@/store/useUIStore'
import { useCurrencyStore } from '@/store/useCurrencyStore'
import { useAuthStore } from '@/store/useAuthStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  price: z.coerce.number().positive('Precio inválido'),
  cost: z.coerce.number().min(0, 'Costo inválido').optional().or(z.literal('')),
  unit: z.enum(['KG', 'LB', 'UND', 'L', 'M', 'HORA']),
  category: z.string().optional(),
  stock: z.coerce.number().min(0).optional(),
  barcode: z.string().optional(),
  attachment_url: z.string().optional(),
  attachment_name: z.string().optional(),
  discount_type: z.string().optional().nullable(),
  discount_value: z.coerce.number().min(0).optional().nullable(),
  discount_ends_at: z.string().optional().nullable(),
  show_image: z.boolean().optional(),
  image_url: z.string().optional(),
  show_in_store: z.boolean().optional(),
  featured: z.boolean().optional(),
  description: z.string().optional(),
})



const UNITS = ['KG', 'LB', 'UND', 'L', 'M', 'HORA']
const UNIT_LABELS = { HORA: 'H' }

export default function AddProductModal({ open }) {
  const scrollRef = useRef(null)
  const addProduct    = useProductStore((s) => s.addProduct)
  const updateProduct = useProductStore((s) => s.updateProduct)
  const closeModal    = useUIStore((s) => s.closeModal)
  const editing       = useUIStore((s) => s.editingProduct)
  const duplicating   = useUIStore((s) => s.duplicatingProduct)
  const baseCurrency  = useCurrencyStore((s) => s.baseCurrency)

  const userSettings = useAuthStore((s) => s.user?.settings)
  const customCats = userSettings?.custom_categories || []
  const dynamicCategories = [...CATEGORIES.filter(c => c !== 'Otros'), ...customCats, 'Otros']

  const [customCategoryName, setCustomCategoryName] = useState('')

  // Hourly bookings availability states
  const [isUniqueResource, setIsUniqueResource]   = useState(false)
  const [workingHoursStart, setWorkingHoursStart] = useState('08:00')
  const [workingHoursEnd, setWorkingHoursEnd]     = useState('17:00')
  const [nonWorkingDays, setNonWorkingDays]       = useState([0, 6]) // Saturdays and Sundays off by default
  const [is247, setIs247]                         = useState(false)

  // Optional sections visibility (controlled by sidebar)
  const [activeSections, setActiveSections] = useState({
    image: false,
    store: false,
    attachments: false,
    barcode: false
  })

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { unit: 'UND', stock: 0, category: 'Otros', cost: 0, barcode: '', attachment_url: '', attachment_name: '', discount_type: 'percentage', discount_value: 0, discount_ends_at: '', show_image: true, image_url: '', show_in_store: false, featured: false, description: '' },
  })

  const unit = watch('unit')
  const selectedCategory = watch('category')
  const [showImage, setShowImage] = useState(true)

  // Reactive logic between unit and category
  useEffect(() => {
    if (unit === 'HORA' && selectedCategory !== 'Servicios') {
      setValue('category', 'Servicios')
    }
  }, [unit, selectedCategory, setValue])

  useEffect(() => {
    if (selectedCategory !== 'Servicios' && unit === 'HORA') {
      setValue('unit', 'UND')
    }
  }, [selectedCategory, unit, setValue])

  // Derived state for unlimited
  const [isUnlimited, setIsUnlimited] = useState(false)
  const [hasDiscount, setHasDiscount] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleToggleBarcode = () => {
    setActiveSections(prev => ({ ...prev, barcode: !prev.barcode }))
    
    // We execute the generation outside the state setter if it's becoming active and empty
    const currentBarcode = watch('barcode')
    if (!activeSections.barcode && (!currentBarcode || currentBarcode.trim() === '')) {
      handleGenerateBarcode()
    }
  }

  const handleGenerateBarcode = () => {
    const companyName = userSettings?.business_name || userSettings?.company_name || 'U'
    const productName = watch('name') || 'P'
    const price = watch('price') || '0'
    
    const companyInitial = (companyName.trim()[0] || 'U').toUpperCase()
    const productInitials = (productName.trim().substring(0, 2) || 'XX').toUpperCase().replace(/[^A-Z0-9]/g, 'X')
    
    const priceStr = String(price).replace(/[^0-9]/g, '')
    const priceChar = priceStr.length > 0 ? priceStr[0] : '0'

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let randomStr = ''
    for (let i = 0; i < 4; i++) {
      randomStr += chars[Math.floor(Math.random() * chars.length)]
    }

    const code = `GO-${companyInitial}${productInitials}${priceChar}-${randomStr}`
    setValue('barcode', code, { shouldValidate: true })
    toast.success('Código único generado')
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${userSettings?.id || 'public'}/${fileName}`

      const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: signedData, error: signedError } = await supabase.storage
          .from('attachments')
          .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10) // Válido por 10 años (URL segura/ofuscada)

      if (signedError) throw signedError

      setValue('attachment_url', signedData.signedUrl)
      setValue('attachment_name', file.name)
      toast.success('Archivo adjuntado correctamente')
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Error al subir archivo. Verifica que el bucket "attachments" exista y sea público.')
    } finally {
      setUploading(false)
      e.target.value = '' // Reset input
    }
  }

  useEffect(() => {
    // Helper to extract JSON from description if format is hourly settings
    const parseDescriptionSettings = (desc = '') => {
      if (desc.trim().startsWith('{') && desc.trim().endsWith('}')) {
        try {
          const parsed = JSON.parse(desc)
          return {
            cleanDescription: parsed.description || '',
            isUnique: !!parsed.isUniqueResource,
            hoursStart: parsed.workingHours?.start || '08:00',
            hoursEnd: parsed.workingHours?.end || '17:00',
            offDays: parsed.nonWorkingDays || [0, 6],
            is247: !!parsed.is247
          }
        } catch (e) {}
      }
      return {
        cleanDescription: desc,
        isUnique: false,
        hoursStart: '08:00',
        hoursEnd: '17:00',
        offDays: [0, 6],
        is247: false
      }
    }

    // Duplicating: pre-fill form but treat as new product (no id)
    if (open && duplicating) {
      const isEditingUnlimited = (duplicating.unit === 'ILIMITADO' || duplicating.stock >= 999990000) && duplicating.unit !== 'HORA'
      setIsUnlimited(isEditingUnlimited)
      setHasDiscount(!!duplicating.discount_value && duplicating.discount_value > 0)
      
      const showImageVal = duplicating.image_url !== 'none'
      setShowImage(showImageVal)
      const imageUrlVal = duplicating.image_url === 'none' ? '' : (duplicating.image_url || '')

      const info = parseDescriptionSettings(duplicating.description)
      setIsUniqueResource(info.isUnique)
      setWorkingHoursStart(info.hoursStart)
      setWorkingHoursEnd(info.hoursEnd)
      setNonWorkingDays(info.offDays)
      setIs247(info.is247)

      const hasImg = duplicating.image_url && duplicating.image_url !== 'none' && duplicating.image_url.trim() !== ''
      const hasStr = duplicating.show_in_store || duplicating.featured || (info.cleanDescription && info.cleanDescription.trim() !== '')
      const hasAtt = duplicating.attachment_url || duplicating.attachment_name
      setActiveSections({
        image: !!hasImg,
        store: !!hasStr,
        attachments: !!hasAtt,
        barcode: false
      })

      reset({
        ...duplicating,
        name: `${duplicating.name} (Copia)`,
        unit: duplicating.unit === 'ILIMITADO' ? 'UND' : duplicating.unit,
        stock: isEditingUnlimited ? 0 : (duplicating.stock ?? 0),
        cost: duplicating.cost ?? 0,
        barcode: '',
        attachment_url: duplicating.attachment_url ?? '',
        attachment_name: duplicating.attachment_name ?? '',
        discount_type: duplicating.discount_type || 'percentage',
        discount_value: duplicating.discount_value || 0,
        discount_ends_at: duplicating.discount_ends_at ? duplicating.discount_ends_at.split('T')[0] : '',
        show_image: showImageVal,
        image_url: imageUrlVal,
        show_in_store: duplicating.show_in_store ?? false,
        featured: duplicating.featured ?? false,
        description: info.cleanDescription,
      })
      setCustomCategoryName('')
      return
    }

    // Editing existing product
    if (open && editing) {
      const isEditingUnlimited = (editing.unit === 'ILIMITADO' || editing.stock >= 999990000) && editing.unit !== 'HORA'
      setIsUnlimited(isEditingUnlimited)
      setHasDiscount(!!editing.discount_value && editing.discount_value > 0)
      
      const showImageVal = editing.image_url !== 'none'
      setShowImage(showImageVal)
      const imageUrlVal = editing.image_url === 'none' ? '' : (editing.image_url || '')

      const info = parseDescriptionSettings(editing.description)
      setIsUniqueResource(info.isUnique)
      setWorkingHoursStart(info.hoursStart)
      setWorkingHoursEnd(info.hoursEnd)
      setNonWorkingDays(info.offDays)
      setIs247(info.is247)

      const hasImg = editing.image_url && editing.image_url !== 'none' && editing.image_url.trim() !== ''
      const hasStr = editing.show_in_store || editing.featured || (info.cleanDescription && info.cleanDescription.trim() !== '')
      const hasAtt = editing.attachment_url || editing.attachment_name
      setActiveSections({
        image: !!hasImg,
        store: !!hasStr,
        attachments: !!hasAtt,
        barcode: !!(editing.barcode && editing.barcode.trim() !== '')
      })

      reset({
        ...editing,
        unit: editing.unit === 'ILIMITADO' ? 'UND' : editing.unit,
        stock: isEditingUnlimited ? 0 : (editing.stock ?? 0),
        cost: editing.cost ?? 0,
        barcode: editing.barcode ?? '',
        attachment_url: editing.attachment_url ?? '',
        attachment_name: editing.attachment_name ?? '',
        discount_type: editing.discount_type || 'percentage',
        discount_value: editing.discount_value || 0,
        discount_ends_at: editing.discount_ends_at ? editing.discount_ends_at.split('T')[0] : '',
        show_image: showImageVal,
        image_url: imageUrlVal,
        show_in_store: editing.show_in_store ?? false,
        featured: editing.featured ?? false,
        description: info.cleanDescription,
      })
      setCustomCategoryName('')
    }
    else if (open) {
      setIsUnlimited(false)
      setHasDiscount(false)
      setShowImage(true)
      setIsUniqueResource(false)
      setWorkingHoursStart('08:00')
      setWorkingHoursEnd('17:00')
      setNonWorkingDays([0, 6])
      setIs247(false)
      setActiveSections({
        image: false,
        store: false,
        attachments: false,
        barcode: false
      })
      reset({ unit: 'UND', stock: 0, category: 'Otros', name: '', price: '', cost: 0, barcode: '', attachment_url: '', attachment_name: '', discount_type: 'percentage', discount_value: 0, discount_ends_at: '', show_image: true, image_url: '', show_in_store: false, featured: false, description: '' })
      setCustomCategoryName('')
    }
  }, [open, editing, duplicating, reset])

  const onSubmit = async (data) => {
    let finalCategory = data.category
    if (data.category === 'Otros') {
      const trimmedCustom = customCategoryName.trim()
      if (!trimmedCustom) {
        toast.error('Especifica el nombre de la categoría')
        return
      }
      await useProductStore.getState().addCustomCategory(trimmedCustom)
      finalCategory = trimmedCustom
    }

    // Process image_url (check if image section is active in sidebar)
    let finalImageUrl = 'none'
    if (activeSections.image) {
      finalImageUrl = data.image_url?.trim() || ''
      if (!showImage) {
        finalImageUrl = 'none'
      }
    }

    let finalDescription = ''
    const isActuallyHourly = data.unit === 'HORA' && finalCategory === 'Servicios'

    if (isActuallyHourly) {
      let previousOccupied = []
      const oldDesc = editing?.description || duplicating?.description || ''
      if (oldDesc.trim().startsWith('{') && oldDesc.trim().endsWith('}')) {
        try {
          const parsed = JSON.parse(oldDesc)
          previousOccupied = parsed.occupiedSlots || []
        } catch (e) {}
      }
      finalDescription = JSON.stringify({
        description: activeSections.store ? (data.description || '') : '',
        isUniqueResource,
        workingHours: { start: is247 ? '00:00' : workingHoursStart, end: is247 ? '23:00' : workingHoursEnd },
        nonWorkingDays: is247 ? [] : nonWorkingDays,
        occupiedSlots: previousOccupied,
        is247: is247
      })
    } else {
      finalDescription = activeSections.store ? (data.description || '') : ''
    }

    const finalUnit = isActuallyHourly ? 'HORA' : (isUnlimited ? 'ILIMITADO' : data.unit)

    // Use provided barcode, or keep editing barcode, or leave empty
    const finalBarcode = (data.barcode && data.barcode.trim())
      ? data.barcode.trim()
      : (editing?.barcode || '')

    const finalData = {
      name: data.name,
      price: data.price,
      cost: data.cost === '' ? 0 : Number(data.cost),
      unit: finalUnit,
      stock: (finalUnit === 'HORA' || isUnlimited) ? 999999999 : Number(data.stock || 0),
      category: finalCategory,
      barcode: finalBarcode,
      attachment_url: activeSections.attachments ? data.attachment_url : '',
      attachment_name: activeSections.attachments ? data.attachment_name : '',
      discount_type: hasDiscount ? data.discount_type : null,
      discount_value: hasDiscount ? Number(data.discount_value || 0) : null,
      discount_ends_at: hasDiscount && data.discount_ends_at ? new Date(data.discount_ends_at + 'T23:59:59').toISOString() : null,
      image_url: finalImageUrl,
      show_in_store: activeSections.store ? (data.show_in_store || false) : false,
      featured: activeSections.store ? (data.featured || false) : false,
      description: finalDescription,
    }

    // Editing an existing product
    if (editing) {
      await updateProduct(editing.id, finalData)
      toast.success('Producto actualizado')
    } else {
      // Both 'new' and 'duplicate' flows create a new product
      await addProduct(finalData)
      toast.success(duplicating ? `${finalData.name} duplicado ✓` : `${finalData.name} añadido`)
    }
    closeModal()
  }

  const modalTitle = editing ? 'Editar Producto' : duplicating ? 'Duplicar Producto' : 'Nuevo Producto'

  const isHourly = unit === 'HORA'

  const DAYS_OF_WEEK = [
    { val: 1, label: 'L' },
    { val: 2, label: 'M' },
    { val: 3, label: 'M' },
    { val: 4, label: 'J' },
    { val: 5, label: 'V' },
    { val: 6, label: 'S' },
    { val: 0, label: 'D' }
  ]

  const HOURS_LIST = Array.from({ length: 24 }).map((_, i) => `${String(i).padStart(2, '0')}:00`)

  const toggleDay = (dayVal) => {
    if (nonWorkingDays.includes(dayVal)) {
      setNonWorkingDays(nonWorkingDays.filter(d => d !== dayVal))
    } else {
      setNonWorkingDays([...nonWorkingDays, dayVal])
    }
  }

  return (
    <Modal open={open} onClose={closeModal} title={modalTitle} size={isHourly ? 'xl' : 'lg'} customLayout={true}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-row w-full max-h-[85vh] sm:max-h-[80vh] relative overflow-hidden bg-surface-800 rounded-2xl">
        {/* Sidebar de Secciones Opcionales */}
        <div className="w-16 border-r border-neutral-200 dark:border-surface-700/80 bg-surface-900/40 flex flex-col items-center py-6 gap-5 shrink-0 select-none">
          {/* Imagen Button */}
          <button
            type="button"
            onClick={() => setActiveSections(prev => ({ ...prev, image: !prev.image }))}
            className={clsx(
              "p-3 rounded-xl border transition-all active:scale-95",
              activeSections.image
                ? "bg-brand-500/20 border-brand-500/30 text-brand-500 dark:text-brand-300"
                : "border-subtle bg-surface-700 text-muted-400 hover:text-foreground hover:bg-surface-600"
            )}
            title="Imagen de Portada"
          >
            <ImagePlus size={20} />
          </button>

          {/* Tienda Virtual Button */}
          <button
            type="button"
            onClick={() => setActiveSections(prev => ({ ...prev, store: !prev.store }))}
            className={clsx(
              "p-3 rounded-xl border transition-all active:scale-95",
              activeSections.store
                ? "bg-brand-500/20 border-brand-500/30 text-brand-500 dark:text-brand-300"
                : "border-subtle bg-surface-700 text-muted-400 hover:text-foreground hover:bg-surface-600"
            )}
            title="Tienda Virtual / Catálogo"
          >
            <PackagePlus size={20} />
          </button>

          {/* Adjuntos Button */}
          <button
            type="button"
            onClick={() => setActiveSections(prev => ({ ...prev, attachments: !prev.attachments }))}
            className={clsx(
              "p-3 rounded-xl border transition-all active:scale-95",
              activeSections.attachments
                ? "bg-brand-500/20 border-brand-500/30 text-brand-500 dark:text-brand-300"
                : "border-subtle bg-surface-700 text-muted-400 hover:text-foreground hover:bg-surface-600"
            )}
            title="Enlaces y Documentos"
          >
            <FilePlus size={20} />
          </button>

          {/* Barcode Toggle Button */}
          <button
            type="button"
            onClick={handleToggleBarcode}
            className={clsx(
              "p-3 rounded-xl border transition-all active:scale-95",
              activeSections.barcode
                ? "bg-brand-500/20 border-brand-500/30 text-brand-500 dark:text-brand-300"
                : "border-subtle bg-surface-700 text-muted-400 hover:text-foreground hover:bg-surface-600"
            )}
            title="Código de Barras"
          >
            <Barcode size={20} />
          </button>
        </div>

        {/* Contenedor del Formulario (Scrollable Body + Footer) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Scrollable body */}
          <div ref={scrollRef} className={clsx(
            "flex-1 p-5 sm:p-6 no-scrollbar overflow-y-auto max-h-[65vh] lg:max-h-[66vh]",
            isHourly && "lg:grid lg:grid-cols-12 lg:gap-6 lg:overflow-hidden"
          )}>
            {/* Columna Izquierda (Formulario del producto) */}
            <div className={clsx(isHourly ? "lg:col-span-5 space-y-5 lg:max-h-[62vh] lg:overflow-y-auto pr-4 lg:pr-6 lg:border-r border-neutral-200 dark:border-surface-700/80 lg:no-scrollbar" : "space-y-5")}>
            <Input
              label="Nombre del producto *"
              icon={<Package size={14} />}
              error={errors.name?.message}
              placeholder="Ej: Arroz blanco"
              maxLength={50}
              {...register('name')}
            />

            {activeSections.barcode && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <Input
                  label="Código de Barras"
                  icon={<Barcode size={14} />}
                  placeholder="Ej: 75010080"
                  {...register('barcode')}
                />
                <p className="mt-1.5 text-[10px] text-muted-400">Generado automáticamente. Puedes escanear uno físico o editarlo.</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={`Precio Venta (${baseCurrency}) *`}
                icon={<DollarSign size={14} />}
                error={errors.price?.message}
                placeholder="0.00"
                type="number"
                step="0.01"
                {...register('price')}
              />
              <Input
                label={`Costo Compra (${baseCurrency})`}
                icon={<DollarSign size={14} />}
                error={errors.cost?.message}
                placeholder="0.00"
                type="number"
                step="0.01"
                {...register('cost')}
              />
            </div>

            {!isHourly && (
              <div>
                <label className="text-xs font-medium text-muted-500 uppercase tracking-wide block mb-1.5">Stock disponible</label>
                <div className={clsx(
                  'flex items-stretch bg-surface-700 border rounded-xl overflow-hidden transition-all',
                  isUnlimited ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-subtle focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/50'
                )}>
                  <div className="pl-3 flex items-center text-muted-400">
                    <Archive size={14} />
                  </div>
                  <input
                    type="number"
                    placeholder="Ej: 999"
                    disabled={isUnlimited}
                    className="w-full bg-transparent px-3 py-2.5 text-sm text-foreground outline-none border-none focus:ring-0 focus:border-transparent focus:outline-none placeholder:text-muted-400 disabled:opacity-50"
                    {...register('stock')}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnlimited(!isUnlimited)
                      if (!isUnlimited) setValue('stock', 0)
                    }}
                    className={clsx(
                      'px-4 text-xs font-semibold transition-colors border-l border-brand-600',
                      isUnlimited
                        ? 'bg-brand-700 text-white'
                        : 'bg-brand-600 text-white hover:bg-brand-700'
                    )}
                  >
                    {isUnlimited ? '✓' : 'Ilimitado'}
                  </button>
                </div>
                {isUnlimited && (
                  <p className="text-[11px] text-brand-400 mt-1.5">Stock marcado como ilimitado</p>
                )}
              </div>
            )}

            {/* Discount Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-brand-500 hover:text-brand-400 cursor-pointer select-none" onClick={() => setHasDiscount(!hasDiscount)}>
                  <Tag size={14} />
                  <span className="text-xs font-bold uppercase tracking-wide">Añadir Descuento</span>
                </div>
              </div>
              
              {hasDiscount && (
                <div className="grid grid-cols-2 gap-3 mt-3 p-3 bg-brand-500/5 rounded-xl border border-brand-500/20">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-muted-400 uppercase font-medium">Tipo de descuento</span>
                    <select {...register('discount_type')} className="w-full bg-surface-700 border border-subtle rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-500/50">
                      <option value="percentage">Porcentaje (%)</option>
                      <option value="fixed">Valor Fijo ($)</option>
                    </select>
                  </div>
                  <Input
                    label="Valor"
                    type="number"
                    placeholder={watch('discount_type') === 'percentage' ? 'Ej: 15' : 'Ej: 5000'}
                    {...register('discount_value')}
                  />
                  <div className="col-span-2">
                    <Input
                      label="Válido hasta (Fecha límite)"
                      type="date"
                      {...register('discount_ends_at')}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Unit selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-500 uppercase tracking-wide">Unidad</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {UNITS.filter(u => u !== 'HORA' || selectedCategory === 'Servicios').map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setValue('unit', u)}
                    className={clsx(
                      'flex-1 py-2 text-xs font-semibold rounded-lg border transition-all',
                      unit === u
                        ? 'border-brand-500 bg-brand-600/20 text-brand-600 dark:text-brand-300'
                        : 'border-subtle bg-surface-700 text-muted-400 hover:text-foreground'
                    )}
                  >
                    {UNIT_LABELS[u] || u}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-500 uppercase tracking-wide">Categoría</label>
              <select
                {...register('category')}
                className="w-full bg-surface-700 border border-subtle rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              >
                {dynamicCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {selectedCategory === 'Otros' && (
              <Input
                label="Especificar otra categoría *"
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                placeholder="Ej: Limpieza Premium"
                required
              />
            )}

            {/* Image Settings Section */}
            {activeSections.image && (
              <div className="pt-2 border-t border-subtle">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-brand-400">
                    <Image size={14} />
                    <label className="text-xs font-medium uppercase tracking-wide cursor-pointer" onClick={() => setShowImage(!showImage)}>Mostrar Imagen de Portada</label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowImage(!showImage)}
                    className={clsx(
                      'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                      showImage ? 'bg-brand-500' : 'bg-surface-600'
                    )}
                  >
                    <span className={clsx('inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform', showImage ? 'translate-x-4' : 'translate-x-1')} />
                  </button>
                </div>
                
                {showImage && (
                  <div className="mt-3 space-y-2">
                    <Input
                      label="URL de Imagen Personalizada"
                      placeholder="Ej: https://images.unsplash.com/..."
                      error={errors.image_url?.message}
                      {...register('image_url')}
                    />
                    <p className="text-[10px] text-muted-400">Si se deja vacío, el sistema asignará una imagen ilustrativa basada en la categoría seleccionada.</p>
                    {isHourly && (
                      <p className="text-[9.5px] text-brand-400 font-bold flex items-center gap-1.5 animate-pulse mt-2.5 justify-center border border-brand-500/10 bg-brand-500/5 py-1.5 rounded-xl">
                        <span>↓</span> Desliza hacia abajo para ver más (Tienda y Adjuntos)
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tienda Virtual Section */}
            {activeSections.store && (
              <div className="pt-2 border-t border-subtle space-y-3">
                <p className="text-xs font-semibold text-brand-500 dark:text-brand-400 uppercase tracking-wide">Tienda Virtual / Catálogo</p>
                
                <div className="flex items-center justify-between p-3 rounded-xl border border-subtle bg-surface-700/30">
                  <div>
                    <p className="text-xs font-bold text-foreground">Mostrar en Tienda Virtual</p>
                    <p className="text-[10px] text-muted-400 mt-0.5">Hace que este producto sea visible públicamente en tu catálogo.</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-lg cursor-pointer"
                    style={{ width: '1.2rem', height: '1.2rem' }}
                    {...register('show_in_store')}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-subtle bg-surface-700/30">
                  <div>
                    <p className="text-xs font-bold text-foreground">Destacar en la Tienda</p>
                    <p className="text-[10px] text-muted-400 mt-0.5">Muestra un badge de "Destacado" y lo resalta en el catálogo.</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-lg cursor-pointer"
                    style={{ width: '1.2rem', height: '1.2rem' }}
                    {...register('featured')}
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-500 block mb-1.5 font-medium uppercase tracking-wide">Descripción Comercial (Pública)</label>
                  <textarea
                    rows={3}
                    placeholder="Escribe los detalles comerciales del producto, especificaciones, etc. para tus clientes..."
                    className="w-full bg-surface-700 border border-subtle rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
                    {...register('description')}
                  />
                </div>
              </div>
            )}

            {/* Attachments Section */}
            {activeSections.attachments && (
              <div className="pt-2 border-t border-subtle">
                <p className="text-xs font-semibold text-muted-300 mb-2">Archivo Adjunto (Opcional)</p>
                <div className="flex gap-2 mb-2">
                  <div className="relative w-full">
                    <input 
                      type="file" 
                      id="file-upload" 
                      className="hidden" 
                      onChange={handleFileUpload} 
                      disabled={uploading}
                    />
                    <label 
                      htmlFor="file-upload"
                      className={clsx(
                        "flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-bold rounded-xl border transition-all cursor-pointer",
                        uploading ? "opacity-50 cursor-not-allowed border-subtle bg-surface-700 text-muted-400" : "border-brand-500/30 text-brand-400 hover:bg-brand-500/10 hover:border-brand-500"
                      )}
                    >
                      {uploading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                          Subiendo archivo...
                        </>
                      ) : (
                        <>
                          <FileUp size={16} />
                          Subir Archivo
                        </>
                      )}
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Nombre del Adjunto"
                    icon={<Tag size={14} />}
                    placeholder="Ej: Registro INVIMA"
                    {...register('attachment_name')}
                  />
                  <Input
                    label="Enlace del Adjunto"
                    icon={<Link2 size={14} />}
                    placeholder="Ej: https://drive.google.com/..."
                    {...register('attachment_url')}
                  />
                </div>
              </div>
            )}
          </div>

           {/* Columna Derecha (Horarios & Gantt) */}
           {isHourly && (
             <div className="lg:col-span-7 bg-surface-800/40 border border-subtle p-5 rounded-2xl space-y-5 flex flex-col justify-start lg:max-h-[62vh] lg:overflow-y-auto lg:pr-2 lg:no-scrollbar mt-6 lg:mt-0">
              <h3 className="text-sm font-black text-brand-400 uppercase tracking-widest flex items-center gap-2">
                <CalendarDays size={16} />
                Disponibilidad Gantt
              </h3>

              {/* Disponible 24/7 Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-subtle bg-surface-700/30">
                <div>
                  <p className="text-xs font-bold text-foreground">Disponible 24/7</p>
                  <p className="text-[10px] text-muted-400 mt-0.5">El recurso estará disponible todas las horas, todos los días de la semana.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !is247
                    setIs247(nextVal)
                    if (nextVal) {
                      setWorkingHoursStart('00:00')
                      setWorkingHoursEnd('23:00')
                      setNonWorkingDays([])
                    } else {
                      setWorkingHoursStart('08:00')
                      setWorkingHoursEnd('17:00')
                      setNonWorkingDays([0, 6])
                    }
                  }}
                  className={clsx(
                    'relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0',
                    is247 ? 'bg-brand-500' : 'bg-surface-600'
                  )}
                >
                  <span className={clsx('inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform', is247 ? 'translate-x-4' : 'translate-x-1')} />
                </button>
              </div>

              {/* Unique resource check */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-subtle bg-surface-700/30">
                <div>
                  <p className="text-xs font-bold text-foreground">Recurso de Valor Único (Persona)</p>
                  <p className="text-[10px] text-muted-400 mt-0.5">Define si el recurso es único. Solo permite reservas exclusivas por franja horaria.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUniqueResource(!isUniqueResource)}
                  className={clsx(
                    'relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0',
                    isUniqueResource ? 'bg-brand-500' : 'bg-surface-600'
                  )}
                >
                  <span className={clsx('inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform', isUniqueResource ? 'translate-x-4' : 'translate-x-1')} />
                </button>
              </div>

              {/* Working hours range */}
              <div className="grid grid-cols-2 gap-3">
                <div className={clsx("flex flex-col gap-1", is247 && "opacity-50 cursor-not-allowed")}>
                  <span className="text-[10px] text-muted-400 uppercase font-semibold">Hora Inicio</span>
                  <select 
                    value={workingHoursStart} 
                    onChange={(e) => setWorkingHoursStart(e.target.value)} 
                    disabled={is247}
                    className="w-full bg-surface-700 border border-subtle rounded-xl px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-brand-500/50 outline-none disabled:opacity-80"
                  >
                    {HOURS_LIST.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div className={clsx("flex flex-col gap-1", is247 && "opacity-50 cursor-not-allowed")}>
                  <span className="text-[10px] text-muted-400 uppercase font-semibold">Hora Fin</span>
                  <select 
                    value={workingHoursEnd} 
                    onChange={(e) => setWorkingHoursEnd(e.target.value)} 
                    disabled={is247}
                    className="w-full bg-surface-700 border border-subtle rounded-xl px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-brand-500/50 outline-none disabled:opacity-80"
                  >
                    {HOURS_LIST.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              {/* Working Days Selector */}
              <div className={clsx("flex flex-col gap-2", is247 && "opacity-50 cursor-not-allowed")}>
                <span className="text-[10px] text-muted-400 uppercase font-semibold">Días Laborables</span>
                <div className="flex gap-2 flex-wrap">
                  {DAYS_OF_WEEK.map(({ val, label }) => {
                    const isWorking = !nonWorkingDays.includes(val)
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => !is247 && toggleDay(val)}
                        disabled={is247}
                        className={clsx(
                          "w-8 h-8 rounded-full text-xs font-bold transition-all border flex items-center justify-center disabled:cursor-not-allowed",
                          isWorking 
                            ? "bg-teal-500/20 border-teal-500/40 text-teal-400" 
                            : "bg-purple-500/20 border-purple-500/40 text-purple-400"
                        )}
                        title={isWorking ? "Laborable" : "No laborable (Día libre)"}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[9px] text-muted-400 mt-1">
                  Verde: laborable. Morado: día no laborable (no trabaja).
                </p>
              </div>

              {/* Preview Gantt Grid */}
              <div className="flex flex-col gap-2 flex-1 pt-2 border-t border-subtle">
                <span className="text-[10px] text-muted-400 uppercase font-semibold">Previsualización del Cronograma</span>
                <div className="bg-surface-700/50 border border-subtle rounded-xl p-3 flex-1 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs border-b border-subtle/40 pb-1.5">
                    <span className="font-bold text-foreground">Días Laborales</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-brand-400 font-bold bg-brand-500/5 px-2 py-0.5 rounded-md border border-brand-500/10 flex items-center gap-1 animate-pulse">
                        <span>↓</span> Desliza para ver horas (Scroll)
                      </span>
                      <span className="text-[10.5px] font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">Vista Gantt Diaria</span>
                    </div>
                  </div>
                  
                  {/* Gantt list representing hours */}
                  <div className="grid grid-cols-4 gap-y-2.5 gap-x-0 overflow-y-auto max-h-[280px] lg:max-h-[320px] pr-1 no-scrollbar">
                    {(() => {
                      const startIdx = parseInt(workingHoursStart.split(':')[0])
                      const endIdx = parseInt(workingHoursEnd.split(':')[0])
                      const hours = []
                      for (let i = startIdx; i <= endIdx; i++) {
                        hours.push(`${String(i).padStart(2, '0')}:00`)
                      }
                      if (hours.length === 0) return <p className="text-[11px] text-muted-400 col-span-4 text-center">Horario inválido</p>

                      return hours.map(h => {
                        const isTodayOff = nonWorkingDays.includes(new Date().getDay())
                        const hourVal = parseInt(h.split(':')[0])
                        
                        return (
                          <div
                            key={h}
                            className={clsx(
                              "p-2 text-center border text-[10px] font-bold transition-all shadow-sm",
                              isTodayOff
                                ? "bg-purple-500/10 border-purple-500/30 text-purple-400 rounded-xl"
                                : "bg-teal-500/10 border-teal-500/30 text-teal-500 rounded-xl"
                            )}
                          >
                            <div>{h}</div>
                            <div className="text-[7.5px] opacity-80 font-normal mt-0.5">
                              {isTodayOff ? 'No trabaja' : 'Libre'}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        {isHourly ? (
          <div className="shrink-0 p-4 border-t border-subtle bg-surface-800/80 grid grid-cols-12 gap-6 z-10">
            <div className="col-span-12 lg:col-span-5 flex gap-3">
              <Button type="submit" variant="primary" size="md" className="flex-1" loading={isSubmitting}>
                {editing ? 'Guardar Cambios' : 'Añadir Producto'}
              </Button>
              <Button type="button" variant="ghost" size="md" className="flex-1" onClick={closeModal}>
                Cancelar
              </Button>
            </div>
            <div className="hidden lg:block lg:col-span-7" />
          </div>
        ) : (
          <div className="shrink-0 p-4 border-t border-subtle bg-surface-800/80 flex gap-3 z-10">
            <Button type="submit" variant="primary" size="md" className="flex-1" loading={isSubmitting}>
              {editing ? 'Guardar Cambios' : 'Añadir Producto'}
            </Button>
            <Button type="button" variant="ghost" size="md" className="flex-1" onClick={closeModal}>Cancelar</Button>
          </div>
        )}
        </div> {/* Cierre del contenedor flex-col */}
      </form>
    </Modal>
  )
}

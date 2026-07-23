

import { useUIStore } from '@/store/useUIStore'
import { useCartStore } from '@/store/useCartStore'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from '@/components/ui/Icon';

export default function TopBar() {
  const openMobileSidebar  = useUIStore((s) => s.openMobileSidebar)
  const toggleInvoicePanel = useUIStore((s) => s.toggleInvoicePanel)
  const invoiceOpen        = useUIStore((s) => s.invoicePanelOpen)
  const cartCount          = useCartStore((s) => s.items.length)
  const navigate           = useNavigate()

  return (
    <header className="h-14 shrink-0 bg-surface-800 border-b border-subtle flex items-center justify-between px-4 z-30">
      {/* Left: hamburger + brand */}
      <div className="flex items-center gap-2">
        <button
          onClick={openMobileSidebar}
          className="w-11 h-11 flex items-center justify-center rounded-xl text-muted-400 hover:text-foreground hover:bg-surface-700 active:scale-95 transition-all"
          aria-label="Abrir menú"
        >
          <Icon name="Menu" size={20}  />
        </button>
        <div className="flex items-center">
          <img src="/images/gestivaOneIcon.svg" alt="GestivaOne" className="h-6 object-contain" />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Notification Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative w-11 h-11 flex items-center justify-center rounded-xl text-muted-400 hover:text-foreground hover:bg-surface-700 active:scale-95 transition-all"
          aria-label="Notificaciones"
        >
          <Icon name="Bell" size={20}  />
        </button>

        {/* Invoice toggle button */}
        <button
          onClick={toggleInvoicePanel}
          className="relative w-11 h-11 flex items-center justify-center rounded-xl text-muted-400 hover:text-foreground hover:bg-surface-700 active:scale-95 transition-all"
          aria-label="Abrir factura"
        >
          <Icon name="FileText" size={20}  />
          {cartCount > 0 && (
            <motion.span
              key={cartCount}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 w-4 h-4 bg-brand-600 rounded-full text-[9px] text-white flex items-center justify-center font-bold"
            >
              {cartCount}
            </motion.span>
          )}
        </button>
      </div>
    </header>
  )
}

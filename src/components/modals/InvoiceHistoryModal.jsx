import React, { useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { FileText, Download, X, Search } from 'lucide-react'
import { useInvoiceStore } from '@/store/useInvoiceStore'
import { useAuthStore } from '@/store/useAuthStore'
import { exportSingleInvoicePDF } from '@/services/exportService'
import toast from 'react-hot-toast'

export default function InvoiceHistoryModal({ open, onClose }) {
  const invoices = useInvoiceStore((s) => s.invoices)
  const fetchInvoices = useInvoiceStore((s) => s.fetchInvoices)
  const user = useAuthStore((s) => s.user)
  const companyName = user?.companyName || 'GestivaOne'

  useEffect(() => {
    if (open) {
      fetchInvoices()
    }
  }, [open, fetchInvoices])

  const handleDownload = async (invoice) => {
    try {
      toast.loading('Generando PDF...', { id: 'pdf' })
      const clientObj = {
        name: invoice.client_name,
        document_id: invoice.client_document_id,
        phone: invoice.client_phone,
        email: invoice.client_email,
        address: invoice.client_address
      }
      
      const settings = {
        companyName,
        companyPhone: user?.phone || '',
        companyEmail: user?.email || '',
        themeColor: 'indigo',
        pdfTemplate: 'corporate'
      }

      await exportSingleInvoicePDF(invoice, clientObj, settings)
      toast.success('Factura PDF generada', { id: 'pdf' })
    } catch (e) {
      console.error(e)
      toast.error('Error al generar PDF', { id: 'pdf' })
    }
  }

  const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0)

  return (
    <Modal open={open} onClose={onClose} title="Historial de Facturas">
      <div className="flex flex-col h-[60vh] max-h-[600px]">
        {/* Helper text */}
        <div className="p-4 border-b border-subtle bg-surface-800/50">
          <p className="text-sm text-muted-400">
            Aquí puedes ver todas tus facturas registradas. Los PDFs se generan instantáneamente al descargarlos.
          </p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-400">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>No hay facturas registradas aún.</p>
            </div>
          ) : (
            invoices.map(inv => (
              <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-surface-700 border border-subtle gap-4 hover:border-brand-500/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Factura #{inv.id?.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-xs text-muted-400 mt-0.5">
                      {inv.client_name || 'Cliente Express'}
                    </p>
                    <p className="text-[10px] text-muted-500 mt-1">
                      {new Date(inv.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t border-subtle sm:border-0 pt-3 sm:pt-0">
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-muted-500 font-semibold mb-0.5">Total</p>
                    <p className="text-sm font-bold text-foreground">{formatCurrency(inv.total)}</p>
                  </div>
                  
                  <button
                    onClick={() => handleDownload(inv)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-600 hover:bg-brand-600 hover:text-white text-brand-400 transition-colors text-xs font-semibold"
                  >
                    <Download size={14} />
                    <span>Descargar</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}

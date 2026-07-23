import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import Icon from '@/components/ui/Icon';

const formatCOP = (v) => v == null ? '' : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

export default function StoreOrders({
  invoices,
  storeName,
  handleOrderStatusChange
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending | paid | cancelled

  const filteredOrders = useMemo(() => {
    return invoices.filter(inv => {
      const details = inv.delivery_details || {};
      const matchesSearch = 
        (inv.client_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (details.phone || '').includes(searchQuery);

      if (!matchesSearch) return false;

      if (statusFilter !== 'all') {
        return (inv.payment_status || 'pending') === statusFilter;
      }
      return true;
    });
  }, [invoices, searchQuery, statusFilter]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white/5 border border-white/10 backdrop-blur-2xl p-6 rounded-[2rem] flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Pedidos Contra Entrega</h3>
          <p className="text-xs text-muted-400 mt-1">Monitorea y despacha las compras entrantes de la tienda.</p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Icon name="Search" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-500"  />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, ID o teléfono..."
            className="w-full bg-black/40 border border-white/5 rounded-full pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        {[
          { id: 'all', label: 'Todos', count: invoices.length },
          { id: 'pending', label: 'Nuevos', count: invoices.filter(i => (i.payment_status || 'pending') === 'pending').length },
          { id: 'paid', label: 'Entregados', count: invoices.filter(i => i.payment_status === 'paid').length },
          { id: 'cancelled', label: 'Cancelados', count: invoices.filter(i => i.payment_status === 'cancelled').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={clsx(
              "px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap",
              statusFilter === tab.id
                ? "bg-white text-black border-white"
                : "bg-white/5 border-white/5 text-muted-400 hover:text-white hover:bg-white/10"
            )}
          >
            {tab.label} <span className="ml-1 opacity-60 text-[10px]">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.map(inv => {
          const details = inv.delivery_details || {};
          const customerPhone = details.phone || inv.client_name;
          const cleanPhone = customerPhone.replace(/\D/g, '');
          const whatsappMsg = `Hola ${details.firstName || ''}! Te escribo de ${storeName}. Acabamos de recibir tu pedido con referencia *${inv.id}* por un valor total de *${formatCOP(inv.total)}*. ¿Nos confirmas tus datos de entrega en ${details.address || ''}, ${details.city || ''}?`;

          return (
            <div 
              key={inv.id} 
              className="bg-black/20 border border-white/5 rounded-3xl p-5 flex flex-col justify-between gap-5 hover:border-white/10 transition-all group"
            >
              <div className="flex flex-col gap-3">
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-muted-500 flex items-center gap-1">
                      #{inv.id.slice(0, 8)}...
                      <button 
                        onClick={() => copyToClipboard(inv.id)} 
                        className="text-muted-600 hover:text-white transition-colors ml-1"
                        title="Copiar ID Completo"
                      >
                        <Icon name="Clipboard" size={10}  />
                      </button>
                    </span>
                    <span className="text-[10px] text-muted-600 mt-0.5">
                      {inv.created_at ? new Date(inv.created_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                    </span>
                  </div>
                  
                  {/* Status Dropdown */}
                  <select
                    value={inv.payment_status || 'pending'}
                    onChange={(e) => handleOrderStatusChange(inv.id, e.target.value)}
                    className={clsx(
                      'text-[9px] font-black rounded-full border px-3 py-1 cursor-pointer focus:outline-none uppercase tracking-wider transition-all',
                      inv.payment_status === 'pending' && 'bg-warning-500/10 border-warning-500/20 text-warning-400',
                      inv.payment_status === 'paid' && 'bg-success-500/10 border-success-500/20 text-success-400',
                      inv.payment_status === 'cancelled' && 'bg-danger-500/10 border-danger-500/20 text-danger-400'
                    )}
                  >
                    <option value="pending" className="bg-surface-800 text-white">NUEVO</option>
                    <option value="paid" className="bg-surface-800 text-white">ENTREGADO</option>
                    <option value="cancelled" className="bg-surface-800 text-white">CANCELADO</option>
                  </select>
                </div>

                <div className="h-px bg-white/5" />

                {/* Customer Details */}
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-bold text-white">
                    {inv.client_name || 'Cliente sin nombre'}
                  </div>
                  <div className="text-xs text-muted-400">
                    {details.phone || 'Sin teléfono'}
                  </div>
                  <div className="text-xs text-muted-500 mt-1 leading-relaxed">
                    {details.address || ''}, {details.city || ''}, {details.department || ''}
                  </div>
                </div>

                {/* Items */}
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 mt-1">
                  <span className="text-[9px] text-muted-500 font-bold uppercase tracking-wider block mb-2">Productos</span>
                  <div className="flex flex-col gap-1.5">
                    {inv.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-white">
                        <span className="truncate max-w-[180px] font-medium">{it.name}</span>
                        <span className="text-muted-500 font-mono text-[10px] shrink-0">x{it.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total and Actions */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/5 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-500 font-bold uppercase tracking-wider">Total</span>
                  <span className="text-lg font-black text-white tracking-tighter mt-0.5">{formatCOP(inv.total)}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* WhatsApp Support button */}
                  {details.phone && (
                    <a
                      href={`https://wa.me/${cleanPhone.startsWith('57') ? cleanPhone : '57' + cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-[#25d366]/10 border border-[#25d366]/20 hover:bg-[#25d366]/20 text-[#25d366] rounded-xl flex items-center justify-center transition-all"
                      title="Contactar WhatsApp"
                    >
                      <Icon name="Phone" size={14}  />
                    </a>
                  )}

                  {/* Print ticket */}
                  <button
                    onClick={() => window.print()}
                    className="w-10 h-10 bg-white/5 border border-white/5 hover:bg-white/10 text-muted-400 hover:text-white rounded-xl flex items-center justify-center transition-all"
                    title="Imprimir Recibo"
                  >
                    <Icon name="Printer" size={14}  />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-500 font-medium">
            No se encontraron pedidos en esta categoría.
          </div>
        )}
      </div>
    </motion.div>
  );
}

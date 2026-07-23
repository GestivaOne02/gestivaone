import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Icon from '@/components/ui/Icon';

const formatCOP = (v) => v == null ? '' : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

export default function StoreCatalog({
  productsList,
  editingProductId,
  setEditingProductId,
  editPrice,
  setEditPrice,
  editDiscountType,
  setEditDiscountType,
  editDiscountValue,
  setEditDiscountValue,
  handleProductToggle,
  handleSaveProductStoreInfo
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // all | active | featured | outOfStock

  // Filter products
  const filteredProducts = useMemo(() => {
    return productsList.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (filterTab === 'active') return p.show_in_store;
      if (filterTab === 'featured') return p.featured;
      if (filterTab === 'outOfStock') return (!p.stock || p.stock <= 0) && p.unit !== 'ILIMITADO';
      
      return true;
    });
  }, [productsList, searchQuery, filterTab]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white/5 border border-white/10 backdrop-blur-2xl p-6 rounded-[2rem] flex flex-col gap-6"
    >
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Catálogo de la Tienda</h3>
          <p className="text-xs text-muted-400 mt-1">Controla la disponibilidad, destacados y promociones de tus productos en tiempo real.</p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Icon name="Search" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-500"  />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar producto o categoría..."
            className="w-full bg-black/40 border border-white/5 rounded-full pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        {[
          { id: 'all', label: 'Todos los productos', count: productsList.length },
          { id: 'active', label: 'Visibles en Tienda', count: productsList.filter(p => p.show_in_store).length },
          { id: 'featured', label: 'Destacados', count: productsList.filter(p => p.featured).length },
          { id: 'outOfStock', label: 'Sin Inventario', count: productsList.filter(p => (!p.stock || p.stock <= 0) && p.unit !== 'ILIMITADO').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={clsx(
              "px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap",
              filterTab === tab.id
                ? "bg-white text-black border-white"
                : "bg-white/5 border-white/5 text-muted-400 hover:text-white hover:bg-white/10"
            )}
          >
            {tab.label} <span className="ml-1 opacity-60 text-[10px]">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Modern Catalog Grid/Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-muted-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="pb-3 px-4">Producto</th>
              <th className="pb-3 px-3">Categoría</th>
              <th className="pb-3 px-3">Precio</th>
              <th className="pb-3 px-3 text-center">Visibilidad</th>
              <th className="pb-3 px-3 text-center">Destacado</th>
              <th className="pb-3 px-3 text-center">Descuento</th>
              <th className="pb-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr 
                key={p.id} 
                className={clsx(
                  'border-b border-white/5 hover:bg-white/[0.02] transition-colors',
                  editingProductId === p.id && 'bg-brand-500/5'
                )}
              >
                {/* Product Name and Stock */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-lg">
                      📦
                    </div>
                    <div>
                      <div className="font-bold text-white">{p.name}</div>
                      <div className="text-[10px] text-muted-500 mt-0.5">
                        Stock: {p.unit === 'ILIMITADO' ? 'Ilimitado' : p.stock || 0}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-4 px-3">
                  <span className="px-2.5 py-1 bg-white/5 text-muted-400 rounded-lg font-bold text-[10px] uppercase tracking-wider">
                    {p.category || 'General'}
                  </span>
                </td>

                {/* Price */}
                <td className="py-4 px-3 font-bold text-white">
                  {editingProductId === p.id ? (
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-[10px] text-muted-400 font-bold">$</span>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="bg-black/40 border border-white/5 rounded-xl pl-6 pr-3 py-2 text-xs text-white w-32 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  ) : (
                    formatCOP(p.price)
                  )}
                </td>

                {/* Visibility Toggle */}
                <td className="py-4 px-3 text-center">
                  <button
                    onClick={() => handleProductToggle(p.id, 'show_in_store', p.show_in_store)}
                    className={clsx(
                      'px-3 py-1.5 rounded-full font-bold text-[10px] transition-all border inline-flex items-center gap-1.5',
                      p.show_in_store
                        ? 'bg-brand-500/10 border-brand-500/20 text-brand-400'
                        : 'bg-white/5 border-white/5 text-muted-500 hover:text-white'
                    )}
                  >
                    <div className={clsx("w-1.5 h-1.5 rounded-full", p.show_in_store ? "bg-brand-400" : "bg-muted-600")} />
                    {p.show_in_store ? 'Visible' : 'Oculto'}
                  </button>
                </td>

                {/* Featured Toggle */}
                <td className="py-4 px-3 text-center">
                  <button
                    onClick={() => handleProductToggle(p.id, 'featured', p.featured)}
                    className={clsx(
                      'px-3 py-1.5 rounded-full font-bold text-[10px] transition-all border inline-flex items-center gap-1.5',
                      p.featured
                        ? 'bg-warning-500/10 border-warning-500/20 text-warning-400'
                        : 'bg-white/5 border-white/5 text-muted-500 hover:text-white'
                    )}
                  >
                    <Icon name="Star" size={10} className={p.featured ? "fill-warning-400 text-warning-400" : ""}  />
                    {p.featured ? 'Destacado' : 'Normal'}
                  </button>
                </td>

                {/* Discount */}
                <td className="py-4 px-3 text-center font-bold">
                  {editingProductId === p.id ? (
                    <div className="flex items-center gap-1.5 justify-center">
                      <select
                        value={editDiscountType || ''}
                        onChange={(e) => setEditDiscountType(e.target.value || null)}
                        className="bg-black/40 border border-white/5 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                      >
                        <option value="">Sin desc.</option>
                        <option value="percentage">%</option>
                        <option value="fixed">$ COP</option>
                      </select>
                      {editDiscountType && (
                        <input
                          type="number"
                          value={editDiscountValue || ''}
                          onChange={(e) => setEditDiscountValue(Number(e.target.value))}
                          placeholder="Valor"
                          className="bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white w-20 focus:outline-none"
                        />
                      )}
                    </div>
                  ) : (
                    p.discount_value && p.discount_value > 0 ? (
                      <span className="px-2.5 py-1 bg-danger-500/10 border border-danger-500/20 rounded-lg text-danger-400 text-[10px] font-bold">
                        -{p.discount_value}{p.discount_type === 'percentage' ? '%' : ' COP'}
                      </span>
                    ) : (
                      <span className="text-muted-600 font-medium">-</span>
                    )
                  )}
                </td>

                {/* Actions */}
                <td className="py-4 px-4 text-right">
                  {editingProductId === p.id ? (
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleSaveProductStoreInfo(p.id)}
                        className="p-2 bg-brand-500 hover:bg-brand-400 text-white rounded-xl transition-all"
                        title="Guardar"
                      >
                        <Icon name="Check" size={14}  />
                      </button>
                      <button
                        onClick={() => setEditingProductId(null)}
                        className="p-2 bg-white/5 hover:bg-white/10 text-muted-400 hover:text-white rounded-xl transition-all"
                        title="Cancelar"
                      >
                        <Icon name="X" size={14}  />
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
                      className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold transition-all border border-white/5 flex items-center gap-1.5 ml-auto"
                    >
                      <Icon name="Edit3" size={11}  />
                      <span>Editar</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
            
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-500 font-medium">
                  No se encontraron productos en este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

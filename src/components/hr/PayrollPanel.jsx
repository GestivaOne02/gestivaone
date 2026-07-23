import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import toast from 'react-hot-toast'
import Icon from '@/components/ui/Icon';

export default function PayrollPanel({ employees, runs, concepts, calculatePayrollRun, approvePayrollRun, removePayrollRun }) {
  const [openModal, setOpenModal] = useState(false)
  const [runName, setRunName] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [calculating, setCalculating] = useState(false)
  const [selectedRun, setSelectedRun] = useState(null)
  const [openDetailModal, setOpenDetailModal] = useState(false)

  const handleSimulate = async (e) => {
    e.preventDefault()
    if (!runName || !periodStart || !periodEnd) {
      toast.error('Completa todos los campos obligatorios')
      return
    }

    if (employees.length === 0) {
      toast.error('No hay empleados activos para liquidar la nómina.')
      return
    }

    setCalculating(true)
    const result = await calculatePayrollRun(runName, periodStart, periodEnd, employees)
    if (result) {
      setOpenModal(false)
      setRunName('')
      setPeriodStart('')
      setPeriodEnd('')
      setSelectedRun(result)
      setOpenDetailModal(true)
    }
    setCalculating(false)
  }

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="DollarSign" size={18} className="text-brand-500"  />
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Gestión de Nómina (Motor de Cálculo)</h3>
        </div>
        <Button
          onClick={() => setOpenModal(true)}
          variant="primary"
          size="sm"
          className="rounded-xl py-2"
          icon={<Icon name="Plus" size={14}  />}
        >
          Liquidar Período
        </Button>
      </div>

      {/* Concept Info Card (Dynamic Rules explanation) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {concepts.map((c) => (
          <div key={c.id} className="bg-surface-800/60 border border-subtle p-4 rounded-3xl space-y-1">
            <span className="text-[9px] font-black uppercase text-brand-400 tracking-wider">{c.code}</span>
            <h4 className="text-xs font-bold text-foreground truncate">{c.name}</h4>
            <p className="text-[10px] text-muted-400 font-mono bg-surface-900/60 px-2 py-1 rounded-xl truncate" title={c.formula}>
              {c.formula}
            </p>
          </div>
        ))}
      </div>

      {/* Payroll runs table */}
      <div className="bg-surface-800 border border-subtle rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-subtle bg-surface-900/30 text-[10px] font-black uppercase tracking-widest text-muted-400">
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Período</th>
                <th className="px-5 py-3 text-right">Devengado</th>
                <th className="px-5 py-3 text-right">Deducciones</th>
                <th className="px-5 py-3 text-right">Neto a Pagar</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle/50 text-xs text-muted-300">
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted-500 font-bold uppercase tracking-wider">
                    No se han registrado liquidaciones de nómina.
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.id} className="hover:bg-surface-900/10 transition-colors">
                    <td className="px-5 py-4 font-bold text-foreground">{run.name}</td>
                    <td className="px-5 py-4 text-muted-400 font-medium">
                      {run.period_start} al {run.period_end}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-foreground">{formatCOP(run.total_accrued)}</td>
                    <td className="px-5 py-4 text-right text-danger-400 font-semibold">-{formatCOP(run.total_deductions)}</td>
                    <td className="px-5 py-4 text-right font-black text-brand-300">{formatCOP(run.total_net)}</td>
                    <td className="px-5 py-4">
                      <Badge variant={run.status === 'approved' ? 'success' : 'warning'}>
                        {run.status === 'approved' ? 'Aprobado' : 'Simulado'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setSelectedRun(run); setOpenDetailModal(true) }}
                          title="Ver detalle"
                          className="p-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/25 border border-brand-500/20 text-brand-400 transition-all"
                        >
                          <Icon name="Eye" size={13}  />
                        </button>
                        <button
                          onClick={() => removePayrollRun(run.id)}
                          title="Eliminar"
                          className="p-1.5 rounded-lg bg-danger-500/10 hover:bg-danger-500/25 border border-danger-500/20 text-danger-400 transition-all"
                        >
                          <Icon name="Trash2" size={13}  />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Run Simulation Modal */}
      <AnimatePresence>
        {openModal && (
          <Modal
            open={openModal}
            onClose={() => setOpenModal(false)}
            title="Liquidar Nómina de Empleados"
            size="md"
          >
            <form onSubmit={handleSimulate} className="p-5 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-500 mb-1.5 block">Nombre del Período *</label>
                  <input
                    required
                    type="text"
                    value={runName}
                    onChange={(e) => setRunName(e.target.value)}
                    className="w-full bg-surface-900 border border-subtle rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                    placeholder="Ej: Nómina Junio 2026"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-500 mb-1.5 block">Fecha Inicio Período *</label>
                    <input
                      required
                      type="date"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                      className="w-full bg-surface-900 border border-subtle rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-500 mb-1.5 block">Fecha Fin Período *</label>
                    <input
                      required
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                      className="w-full bg-surface-900 border border-subtle rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setOpenModal(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={calculating}
                  className="flex-1 rounded-xl"
                >
                  {calculating ? 'Calculando...' : 'Calcular Período'}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Details breakdown modal */}
      <AnimatePresence>
        {openDetailModal && selectedRun && (
          <Modal
            open={openDetailModal}
            onClose={() => setOpenDetailModal(false)}
            title={`Detalles de Nómina: ${selectedRun.name}`}
            size="lg"
          >
            <div className="p-5 space-y-6 max-h-[600px] overflow-y-auto no-scrollbar">
              
              {/* Summary numbers */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-surface-900/60 border border-subtle rounded-2xl text-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-400">Total Devengado</p>
                  <p className="text-sm font-bold text-foreground">{formatCOP(selectedRun.total_accrued)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-400">Deducciones</p>
                  <p className="text-sm font-bold text-danger-400">-{formatCOP(selectedRun.total_deductions)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-400">Neto Consolidado</p>
                  <p className="text-sm font-black text-brand-300">{formatCOP(selectedRun.total_net)}</p>
                </div>
              </div>

              {/* Employee Breakdown List */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Liquidación por Empleado</h4>
                
                {selectedRun.results.map((res) => (
                  <div key={res.id} className="bg-surface-900/40 border border-subtle/80 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-black text-foreground">{res.employee_name}</p>
                        <p className="text-[10px] text-muted-500 font-bold uppercase mt-0.5">Salario Base: {formatCOP(res.salary_base)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-brand-300">{formatCOP(res.total_net)}</p>
                        <p className="text-[9px] text-muted-400 uppercase tracking-widest mt-0.5">Neto a pagar</p>
                      </div>
                    </div>

                    {/* Fórmulas breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                      {res.details.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-surface-800 rounded-xl border border-subtle/50">
                          <div className="space-y-0.5 min-w-0">
                            <span className="font-bold text-foreground block truncate">{item.name}</span>
                            <span className="font-mono text-muted-500 text-[8px] truncate block" title={item.formula}>{item.formula}</span>
                          </div>
                          <span className={`font-bold shrink-0 ${item.type === 'deduction' ? 'text-danger-400' : 'text-success-400'}`}>
                            {item.type === 'deduction' ? '-' : '+'}{formatCOP(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Approve / Finalize button if simulated */}
              {selectedRun.status === 'simulated' && (
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => setOpenDetailModal(false)}
                    className="flex-1 rounded-xl"
                  >
                    Cerrar Detalle
                  </Button>
                  <Button
                    onClick={async () => {
                      const success = await approvePayrollRun(selectedRun.id)
                      if (success) setOpenDetailModal(false)
                    }}
                    className="flex-1 rounded-xl flex items-center justify-center gap-2"
                    icon={<Icon name="CheckCircle" size={14}  />}
                  >
                    Aprobar y Oficializar
                  </Button>
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Plus, Check, X, Clock, HelpCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import toast from 'react-hot-toast'

export default function VacationsPanel({ employees, vacations, requestVacation, updateVacationStatus, isAdmin }) {
  const [openModal, setOpenModal] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Auto calculate requested days
  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // inclusive
    return diffDays
  }

  const requestedDays = calculateDays()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!employeeId || !startDate || !endDate) {
      toast.error('Por favor completa todos los campos')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('La fecha de inicio debe ser anterior a la fecha de fin')
      return
    }

    setSubmitting(true)
    const success = await requestVacation({
      employee_id: employeeId,
      start_date: startDate,
      end_date: endDate,
      requested_days: requestedDays
    })

    if (success) {
      setOpenModal(false)
      setEmployeeId('')
      setStartDate('')
      setEndDate('')
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-brand-500" />
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Gestión de Vacaciones</h3>
        </div>
        <Button
          onClick={() => setOpenModal(true)}
          variant="primary"
          size="sm"
          className="rounded-xl py-2"
          icon={<Plus size={14} />}
        >
          Solicitar Vacaciones
        </Button>
      </div>

      {/* Vacations Solicitudes Table */}
      <div className="bg-surface-800 border border-subtle rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-subtle bg-surface-900/30 text-[10px] font-black uppercase tracking-widest text-muted-400">
                <th className="px-5 py-3">Empleado</th>
                <th className="px-5 py-3">Fecha Inicio</th>
                <th className="px-5 py-3">Fecha Fin</th>
                <th className="px-5 py-3 text-center">Días Solicitados</th>
                <th className="px-5 py-3">Estado</th>
                {isAdmin && <th className="px-5 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle/50 text-xs text-muted-300">
              {vacations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-500 font-bold uppercase tracking-wider">
                    No se han registrado solicitudes de vacaciones.
                  </td>
                </tr>
              ) : (
                vacations.map((vac) => (
                  <tr key={vac.id} className="hover:bg-surface-900/10 transition-colors">
                    <td className="px-5 py-4 font-bold text-foreground">{vac.employee_name}</td>
                    <td className="px-5 py-4">{vac.start_date}</td>
                    <td className="px-5 py-4">{vac.end_date}</td>
                    <td className="px-5 py-4 text-center font-bold text-foreground">{vac.requested_days}</td>
                    <td className="px-5 py-4">
                      <Badge variant={vac.status === 'approved' ? 'success' : vac.status === 'rejected' ? 'danger' : 'warning'}>
                        {vac.status === 'approved' ? 'Aprobado' : vac.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                      </Badge>
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-4 text-right">
                        {vac.status === 'pending' ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => updateVacationStatus(vac.id, 'approved')}
                              title="Aprobar"
                              className="p-1.5 rounded-lg bg-success-500/10 hover:bg-success-500/25 border border-success-500/20 text-success-400 transition-all"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={() => updateVacationStatus(vac.id, 'rejected')}
                              title="Rechazar"
                              className="p-1.5 rounded-lg bg-danger-500/10 hover:bg-danger-500/25 border border-danger-500/20 text-danger-400 transition-all"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-500 font-bold uppercase select-none">Procesado</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Vacation Modal */}
      <AnimatePresence>
        {openModal && (
          <Modal
            open={openModal}
            onClose={() => setOpenModal(false)}
            title="Nueva Solicitud de Vacaciones"
            size="md"
          >
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-500 mb-1.5 block">Colaborador *</label>
                  <select
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full bg-surface-900 border border-subtle rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                  >
                    <option value="">Selecciona un empleado...</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>{e.full_name} ({e.department})</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-500 mb-1.5 block">Fecha de Inicio *</label>
                    <input
                      required
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-surface-900 border border-subtle rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-500 mb-1.5 block">Fecha de Finalización *</label>
                    <input
                      required
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-surface-900 border border-subtle rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500/30"
                    />
                  </div>
                </div>

                {startDate && endDate && (
                  <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex justify-between items-center text-xs">
                    <span className="font-bold text-brand-300">Total días calculados:</span>
                    <span className="font-black text-brand-300 text-sm">{requestedDays} días calendario</span>
                  </div>
                )}
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
                  disabled={submitting}
                  className="flex-1 rounded-xl"
                >
                  {submitting ? 'Enviando...' : 'Radicar Solicitud'}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

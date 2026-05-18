import { Check, Clock, AlertTriangle, HelpCircle } from 'lucide-react'
import clsx from 'clsx'

const variants = {
  paid:    'bg-success-950/40 text-success-400 border border-success-500/20',
  pending: 'bg-warning-950/40 text-warning-400 border border-warning-500/20',
  overdue: 'bg-transparent text-danger-500 border border-danger-500/30',
  default: 'bg-surface-700/50 text-muted-400 border border-subtle',
}

const icons = {
  paid:    Check,
  pending: Clock,
  overdue: AlertTriangle,
  default: HelpCircle,
}

const labels = {
  paid:    'Pagado',
  pending: 'Pendiente',
  overdue: 'Atrasado',
  default: 'Desconocido',
}

export default function Badge({ status = 'default', label, className }) {
  const IconComponent = icons[status] ?? icons.default

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full select-none leading-none h-5 shrink-0',
        variants[status] ?? variants.default,
        className
      )}
    >
      {IconComponent && <IconComponent size={12} className="shrink-0" />}
      <span>{label ?? labels[status] ?? status}</span>
    </span>
  )
}

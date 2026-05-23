import { Check, Clock, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const styles = {
  // Statuses
  paid:    'bg-success-500/10 text-success-400 border border-success-500/20',
  pending: 'bg-warning-500/10 text-warning-400 border border-warning-500/20',
  overdue: 'bg-danger-500/10 text-danger-400 border border-danger-500/20',
  
  // Design variants
  primary: 'bg-brand-600/15 text-brand-400 border border-brand-500/20',
  brand:   'bg-brand-600/15 text-brand-400 border border-brand-500/20',
  success: 'bg-success-500/10 text-success-400 border border-success-500/20',
  warning: 'bg-warning-500/10 text-warning-400 border border-warning-500/20',
  danger:  'bg-danger-500/10 text-danger-400 border border-danger-500/20',
  info:    'bg-brand-600/15 text-brand-400 border border-brand-500/20',
  default: 'bg-surface-700/50 text-muted-500 dark:text-muted-400 border border-subtle',
}

const icons = {
  paid:    Check,
  pending: Clock,
  overdue: AlertTriangle,
}

const labels = {
  paid:    'Pagado',
  pending: 'Pendiente',
  overdue: 'Atrasado',
  default: 'Desconocido',
}

export default function Badge({ status, variant, label, children, className }) {
  // Support both status and variant interchangeably
  const activeKey = status || variant || 'default'
  const IconComponent = icons[activeKey]

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full select-none leading-none h-5 shrink-0 transition-all duration-300',
        styles[activeKey] ?? styles.default,
        className
      )}
    >
      {IconComponent && <IconComponent size={10} className="shrink-0 stroke-[3]" />}
      <span>{children ?? label ?? labels[activeKey] ?? activeKey}</span>
    </span>
  )
}

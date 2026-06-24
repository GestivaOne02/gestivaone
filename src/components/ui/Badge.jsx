import { Check, Clock, AlertTriangle, HelpCircle } from 'lucide-react'
import clsx from 'clsx'

// Icon-only colors for status mode
const statusIcons = {
  paid:    { Icon: Check,         color: 'text-success-500' },
  pending: { Icon: Clock,         color: 'text-warning-500' },
  overdue: { Icon: AlertTriangle, color: 'text-danger-500'  },
  default: { Icon: HelpCircle,    color: 'text-muted-400'   },
}

// Pill styles for variant/label mode
const variantStyles = {
  primary: 'bg-brand-600/15 text-brand-400 border border-brand-500/20',
  brand:   'bg-brand-600/15 text-brand-400 border border-brand-500/20',
  success: 'bg-success-500/10 text-success-400 border border-success-500/20',
  warning: 'bg-warning-500/10 text-warning-400 border border-warning-500/20',
  danger:  'bg-danger-500/10 text-danger-400 border border-danger-500/20',
  info:    'bg-brand-600/15 text-brand-400 border border-brand-500/20',
  default: 'bg-surface-700/50 text-muted-500 dark:text-muted-400 border border-subtle',
}

export default function Badge({ status, variant, label, children, className }) {
  // Status mode → solo icono, sin fondo
  if (status) {
    const { Icon, color } = statusIcons[status] ?? statusIcons.default
    return (
      <span className={clsx('inline-flex items-center shrink-0', color, className)} title={status}>
        <Icon size={15} className="stroke-[2.5]" />
      </span>
    )
  }

  // Variant / label mode → pill original
  const activeKey = variant || 'default'
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full select-none leading-none h-5 shrink-0 transition-all duration-300',
        variantStyles[activeKey] ?? variantStyles.default,
        className
      )}
    >
      {children ?? label ?? activeKey}
    </span>
  )
}

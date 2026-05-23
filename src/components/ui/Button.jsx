import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

const variants = {
  primary: 'bg-brand-600 hover:bg-brand-500 text-white shadow-glow-sm hover:shadow-glow border border-brand-500/25',
  secondary: 'bg-surface-700 hover:bg-surface-600 text-foreground border border-subtle hover:border-surface-400',
  ghost: 'bg-transparent hover:bg-surface-700 text-muted-500 hover:text-foreground',
  danger: 'bg-danger-900/60 hover:bg-danger-500 text-danger-400 hover:text-white border border-danger-500/30',
  success: 'bg-success-900/60 hover:bg-success-500 text-success-400 hover:text-white border border-success-500/30',
  outline: 'bg-transparent border border-brand-600 text-brand-600 dark:text-brand-400 hover:bg-brand-600 hover:text-white',
}

const sizes = {
  xs: 'px-2.5 py-1 text-xs rounded-lg gap-1',
  sm: 'px-3 py-1.5 text-sm rounded-xl gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-5 py-3 text-base rounded-xl gap-2',
}

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  pill = false,
  className,
  loading = false,
  icon,
  iconRight,
  disabled,
  ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-300 ease-out-expo cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        pill && 'rounded-full px-5', // Pill shape overrides sizes border radius
        className
      )}
      {...props}
    >
      {loading
        ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        : icon}
      {children}
      {!loading && iconRight}
    </motion.button>
  )
})

Button.displayName = 'Button'
export default Button

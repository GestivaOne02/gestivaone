import { motion } from 'framer-motion'
import clsx from 'clsx'
import Icon from '@/components/ui/Icon'

/**
 * SortFilterBar
 * 
 * Props:
 *  - sortMode: 'recent' | 'id' | 'letter'
 *  - onSortChange: (mode) => void
 *  - activeLetter: string | null  (only used when sortMode === 'letter')
 *  - onLetterChange: (letter | null) => void
 *  - letters: string[]  — list of unique first-letters present in data
 */
export default function SortFilterBar({
  sortMode = 'recent',
  onSortChange,
  activeLetter = null,
  onLetterChange,
  letters = [],
}) {
  const MODES = [
    { key: 'recent', iconName: 'Clock',     label: 'Recientes' },
    { key: 'id',     iconName: 'Hash',      label: 'Por #' },
    { key: 'letter', iconName: 'AlignLeft', label: 'A–Z' },
  ]

  return (
    <div className="flex flex-col gap-2">
      {/* Mode pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
        {MODES.map(({ key, iconName, label }) => {
          const active = sortMode === key
          return (
            <button
              key={key}
              onClick={() => onSortChange?.(key)}
              className={clsx(
                'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 border',
                active
                  ? 'bg-brand-600 border-brand-500 text-white shadow-glow-sm'
                  : 'bg-surface-700/50 border-subtle text-muted-400 hover:text-foreground hover:border-surface-500'
              )}
            >
              <Icon name={iconName} size={12} />
              {label}
              {active && (
                <div
                  className="absolute inset-0 rounded-lg bg-brand-600"
                  style={{ zIndex: -1 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Letter strip — only shows when mode === 'letter' */}
      {sortMode === 'letter' && letters.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 px-0.5">
          <button
            onClick={() => onLetterChange?.(null)}
            className={clsx(
              'px-2 py-0.5 rounded text-[11px] font-bold transition-colors shrink-0',
              activeLetter === null
                ? 'bg-brand-500 text-white'
                : 'bg-surface-700 text-muted-400 hover:text-foreground'
            )}
          >
            Todos
          </button>
          {letters.map((lettr) => (
            <button
              key={lettr}
              onClick={() => onLetterChange?.(lettr)}
              className={clsx(
                'w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold transition-colors shrink-0',
                activeLetter === lettr
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-700 text-muted-400 hover:text-foreground'
              )}
            >
              {lettr}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

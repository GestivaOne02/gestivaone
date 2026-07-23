import React from 'react'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'

export default function SectionContent({
  icon,
  iconBg,
  badge,
  title,
  desc,
  tags,
  metric,
  submetric,
  ctaText,
  ctaLink,
  accentColor
}) {
  return (
    <div className="space-y-6 max-w-xl">
      {/* Icon + Tagline Badge */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-lg shrink-0 ${iconBg}`}>
          <Icon name={icon} size={22} />
        </div>
        <span className="text-xs font-bold text-muted-300 uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
          {badge}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.1]">
        {title}
      </h2>

      {/* Description */}
      <p className="text-base sm:text-lg text-muted-300 leading-relaxed font-normal">
        {desc}
      </p>

      {/* Tag Pills */}
      <div className="flex flex-wrap gap-2 pt-2">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-3.5 py-1.5 rounded-xl bg-surface-750/90 border border-subtle text-xs font-bold text-muted-200 shadow-sm"
          >
            ✓ {tag}
          </span>
        ))}
      </div>

      {/* Live Metric Highlight */}
      <div className="p-4 rounded-2xl bg-surface-900/80 border border-subtle flex items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div>
          <span className="text-lg sm:text-xl font-extrabold text-foreground block">
            {metric}
          </span>
          <span className="text-xs font-medium text-muted-400 block mt-0.5">
            {submetric}
          </span>
        </div>
        <a
          href={ctaLink}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/30 hover:scale-[1.03] active:scale-[0.98] shrink-0"
        >
          {ctaText} →
        </a>
      </div>
    </div>
  )
}

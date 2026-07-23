import React from 'react'
import Icon from '@/components/ui/Icon'

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
  ctaLink
}) {
  return (
    <div className="space-y-4 max-w-xl">
      {/* Icon + Tagline Badge */}
      <div className="flex items-center gap-2.5">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-md shrink-0 ${iconBg}`}>
          <Icon name={icon} size={18} />
        </div>
        <span className="text-[11px] font-bold text-muted-300 uppercase tracking-wider px-3 py-0.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
          {badge}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-tight">
        {title}
      </h2>

      {/* Description */}
      <p className="text-xs sm:text-sm text-muted-300 leading-relaxed font-normal">
        {desc}
      </p>

      {/* Tag Pills */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-3 py-1 rounded-lg bg-surface-750/90 border border-subtle text-[11px] font-bold text-muted-200 shadow-sm"
          >
            ✓ {tag}
          </span>
        ))}
      </div>

      {/* Live Metric Highlight */}
      <div className="p-3.5 rounded-xl bg-surface-900/90 border border-subtle flex items-center justify-between gap-3 shadow-lg backdrop-blur-md">
        <div>
          <span className="text-base sm:text-lg font-extrabold text-foreground block">
            {metric}
          </span>
          <span className="text-[11px] font-medium text-muted-400 block mt-0.5">
            {submetric}
          </span>
        </div>
        <a
          href={ctaLink}
          className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30 hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          {ctaText} →
        </a>
      </div>
    </div>
  )
}

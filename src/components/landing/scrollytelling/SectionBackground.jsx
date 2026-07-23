import React from 'react'

export default function SectionBackground({ accentColor, glowColor, gradientFrom, gradientTo }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Background Subtle Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${gradientFrom} ${gradientTo} opacity-30`} />

      {/* Primary Radial Glow Spot */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] sm:h-[600px] rounded-full blur-[120px] transition-all duration-700 opacity-25"
        style={{ backgroundColor: accentColor }}
      />

      {/* Secondary Glow */}
      <div
        className="absolute -top-24 right-10 w-96 h-96 rounded-full blur-[100px] opacity-15"
        style={{ backgroundColor: accentColor }}
      />

      {/* Grid Overlay Line Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

      {/* Ambient Top & Bottom Borders */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}

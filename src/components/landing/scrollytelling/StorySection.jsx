import React from 'react'
import { motion } from 'framer-motion'
import SectionBackground from './SectionBackground'
import SectionContent from './SectionContent'
import SectionMedia from './SectionMedia'

export default function StorySection({ moduleData, index, isReversed }) {
  return (
    <motion.div
      id={`module-${moduleData.id}`}
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative w-full rounded-[36px] border border-white/10 bg-surface-900/90 shadow-2xl p-6 sm:p-10 lg:p-12 backdrop-blur-2xl overflow-hidden group hover:border-white/20 transition-colors"
    >
      {/* Background Glow Signature */}
      <SectionBackground
        accentColor={moduleData.accentColor}
        glowColor={moduleData.glowColor}
        gradientFrom={moduleData.gradientFrom}
        gradientTo={moduleData.gradientTo}
      />

      {/* Card Content Grid (Alternating Left/Right) */}
      <div
        className={`relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-14 ${
          isReversed ? 'lg:flex-row-reverse' : ''
        }`}
      >
        {/* Text & Specs Column */}
        <div className="w-full lg:w-1/2">
          <SectionContent
            icon={moduleData.icon}
            iconBg={moduleData.iconBg}
            badge={moduleData.badge}
            title={moduleData.title}
            desc={moduleData.desc}
            tags={moduleData.tags}
            metric={moduleData.metric}
            submetric={moduleData.submetric}
            ctaText={moduleData.ctaText}
            ctaLink={moduleData.ctaLink}
          />
        </div>

        {/* Interactive Glassmorphism UI Mockup Column */}
        <div className="w-full lg:w-1/2">
          <SectionMedia
            mockupType={moduleData.mockupType}
            mockupData={moduleData.mockupData}
            accentColor={moduleData.accentColor}
            title={moduleData.title}
          />
        </div>
      </div>
    </motion.div>
  )
}

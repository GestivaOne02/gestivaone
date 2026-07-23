import React from 'react'
import SectionBackground from './SectionBackground'
import SectionContent from './SectionContent'
import SectionMedia from './SectionMedia'
import RevealAnimation from './RevealAnimation'

export default function StorySection({ moduleData, scrollYProgress }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-surface-900 overflow-hidden">
      {/* Background Accent & Glow Engine */}
      <SectionBackground
        accentColor={moduleData.accentColor}
        glowColor={moduleData.glowColor}
        gradientFrom={moduleData.gradientFrom}
        gradientTo={moduleData.gradientTo}
      />

      {/* Internal Content Container (Responsive Full Bleed Edge-to-Edge) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 lg:gap-16">
        
        {/* Left Column: Text & Content Reveal */}
        <div className="w-full lg:w-1/2">
          <RevealAnimation progress={scrollYProgress} range={[0, 0.25, 0.75, 1]}>
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
              accentColor={moduleData.accentColor}
            />
          </RevealAnimation>
        </div>

        {/* Right Column: Interactive UI Mockup Reveal */}
        <div className="w-full lg:w-1/2">
          <RevealAnimation progress={scrollYProgress} range={[0.1, 0.35, 0.8, 1]}>
            <SectionMedia
              mockupType={moduleData.mockupType}
              mockupData={moduleData.mockupData}
              accentColor={moduleData.accentColor}
              title={moduleData.title}
            />
          </RevealAnimation>
        </div>

      </div>
    </div>
  )
}

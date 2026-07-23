import React from 'react'
import SectionBackground from './SectionBackground'
import SectionContent from './SectionContent'
import SectionMedia from './SectionMedia'
import RevealAnimation from './RevealAnimation'

export default function StorySection({ moduleData, scrollYProgress }) {
  return (
    <div className="relative w-full max-w-6xl mx-auto rounded-[28px] border border-subtle bg-surface-900/90 shadow-2xl p-5 sm:p-7 lg:p-9 backdrop-blur-xl overflow-hidden">
      {/* Background Accent & Glow Engine */}
      <SectionBackground
        accentColor={moduleData.accentColor}
        glowColor={moduleData.glowColor}
        gradientFrom={moduleData.gradientFrom}
        gradientTo={moduleData.gradientTo}
      />

      {/* Internal Content Container */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10">
        
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

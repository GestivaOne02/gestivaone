import React, { useRef } from 'react'
import { useScroll } from 'framer-motion'
import StorySection from './StorySection'

export default function StickyContainer({ moduleData }) {
  const targetRef = useRef(null)

  // Compact scroll track height (115vh - 125vh) for natural, fluid scrollytelling
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end']
  })

  return (
    <div ref={targetRef} className="relative h-[115vh] sm:h-[125vh] w-full px-4 sm:px-6">
      {/* Sticky Compact Viewport Window */}
      <div className="sticky top-20 sm:top-24 py-3 sm:py-5 w-full flex items-center justify-center">
        <StorySection moduleData={moduleData} scrollYProgress={scrollYProgress} />
      </div>
    </div>
  )
}

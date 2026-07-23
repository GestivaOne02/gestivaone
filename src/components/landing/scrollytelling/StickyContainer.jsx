import React, { useRef } from 'react'
import { motion, useScroll } from 'framer-motion'
import StorySection from './StorySection'

export default function StickyContainer({ moduleData, isFirst, isLast }) {
  const targetRef = useRef(null)

  // Track scroll progress strictly within this section container height (200vh)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end']
  })

  return (
    <div ref={targetRef} className="relative h-[180vh] sm:h-[200vh] w-full">
      {/* Sticky Viewport Window */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <StorySection moduleData={moduleData} scrollYProgress={scrollYProgress} />
      </div>
    </div>
  )
}

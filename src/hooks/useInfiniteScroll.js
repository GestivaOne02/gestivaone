import { useState, useEffect, useRef } from 'react'

export function useInfiniteScroll(items, initialCount = 30, step = 30) {
  const [visibleCount, setVisibleCount] = useState(initialCount)
  const observerTarget = useRef(null)

  // Reset when items change (e.g. search/filter applied)
  useEffect(() => {
    setVisibleCount(initialCount)
  }, [items.length, initialCount])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + step)
        }
      },
      { threshold: 0.1 }
    )
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }
    
    return () => observer.disconnect()
  }, [step])

  return {
    visibleItems: items.slice(0, visibleCount),
    observerTarget,
    hasMore: visibleCount < items.length
  }
}

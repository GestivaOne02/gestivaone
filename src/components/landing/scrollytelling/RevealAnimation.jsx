import React from 'react'
import { motion, useTransform } from 'framer-motion'

export default function RevealAnimation({ progress, range, children, className = '' }) {
  // GPU accelerated properties strictly: opacity and transform (y & scale)
  const opacity = useTransform(progress, range, [0, 1, 1, 0])
  const y = useTransform(progress, range, [30, 0, 0, -30])
  const scale = useTransform(progress, range, [0.97, 1, 1, 0.97])

  return (
    <motion.div
      style={{ opacity, y, scale }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  )
}

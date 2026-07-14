import { useState, useEffect, useRef, useMemo } from 'react'

/**
 * Masonry Layout Custom
 * Distributes items into the shortest column based on actual measured heights.
 * Completely responsive and dynamic.
 */
export default function Masonry({ 
  items, 
  renderItem, 
  getItemId, 
  breakpoints = {
    1600: 6,
    1400: 5,
    1100: 4,
    768: 3,
    480: 2,
    0: 1
  }, 
  gap = 16 
}) {
  const containerRef = useRef(null)
  const [columnsCount, setColumnsCount] = useState(1)
  const [itemHeights, setItemHeights] = useState({})
  const observersRef = useRef(new Map())

  // 1. Determinar cantidad de columnas según el ancho del contenedor
  useEffect(() => {
    if (!containerRef.current) return

    const updateColumns = (width) => {
      // Ordenar breakpoints de mayor a menor
      const bps = Object.entries(breakpoints)
        .map(([w, c]) => [parseInt(w), c])
        .sort((a, b) => b[0] - a[0])
      
      let cols = bps[bps.length - 1][1] // Default to smallest
      for (const [bpWidth, bpCols] of bps) {
        if (width >= bpWidth) {
          cols = bpCols
          break
        }
      }
      setColumnsCount(cols)
    }

    const observer = new ResizeObserver((entries) => {
      updateColumns(entries[0].contentRect.width)
    })

    observer.observe(containerRef.current)
    // Inicial
    updateColumns(containerRef.current.getBoundingClientRect().width)

    return () => observer.disconnect()
  }, [breakpoints])

  // 2. Distribuir items en las columnas más cortas
  const columnsData = useMemo(() => {
    const cols = Array.from({ length: columnsCount }, () => [])
    const heights = Array.from({ length: columnsCount }, () => 0)

    items.forEach((item) => {
      const id = getItemId(item)
      // Altura estimada por defecto 200px para el primer render
      const h = itemHeights[id] || 200 

      // Encontrar la columna con menor altura
      let minIndex = 0
      let minHeight = heights[0]
      for (let i = 1; i < columnsCount; i++) {
        if (heights[i] < minHeight) {
          minHeight = heights[i]
          minIndex = i
        }
      }

      cols[minIndex].push(item)
      heights[minIndex] += h + gap
    })

    return cols
  }, [items, columnsCount, itemHeights, gap, getItemId])

  // 3. Manejar ResizeObserver para cada item de forma eficiente
  const setItemRef = (id, el) => {
    if (!el) {
      if (observersRef.current.has(id)) {
        observersRef.current.get(id).disconnect()
        observersRef.current.delete(id)
      }
      return
    }

    if (!observersRef.current.has(id)) {
      const observer = new ResizeObserver((entries) => {
        const height = entries[0].contentRect.height
        setItemHeights((prev) => {
          // Solo actualizar si la diferencia es significativa (> 2px) para evitar loops
          if (Math.abs((prev[id] || 0) - height) > 2) {
            return { ...prev, [id]: height }
          }
          return prev
        })
      })
      observer.observe(el)
      observersRef.current.set(id, observer)
    }
  }

  return (
    <div ref={containerRef} className="flex items-start w-full" style={{ gap: `${gap}px` }}>
      {columnsData.map((colItems, colIndex) => (
        <div 
          key={colIndex} 
          className="flex flex-col flex-1 min-w-0" 
          style={{ gap: `${gap}px` }}
        >
          {colItems.map((item) => {
            const id = getItemId(item)
            return (
              <div 
                key={id} 
                ref={(el) => setItemRef(id, el)}
                className="w-full"
              >
                {renderItem(item)}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

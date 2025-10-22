import { useEffect, useRef, useState } from "react"

interface VirtualTableProps<T> {
  data: T[]
  rowHeight: number
  visibleRows: number
  renderRow: (item: T, index: number) => React.ReactNode
  className?: string
  loadingPlaceholder?: React.ReactNode
  emptyPlaceholder?: React.ReactNode
}

export function VirtualTable<T>({
  data,
  rowHeight,
  visibleRows,
  renderRow,
  className = "",
  loadingPlaceholder,
  emptyPlaceholder,
}: VirtualTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate total height
  const totalHeight = data.length * rowHeight

  // Calculate visible range
  const startIndex = Math.floor(scrollTop / rowHeight)
  const endIndex = Math.min(startIndex + visibleRows + 2, data.length)

  // Handle scroll
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }

  // Update scroll position on data change
  useEffect(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }, [data])

  // Loading state
  if (!data && loadingPlaceholder) {
    return loadingPlaceholder
  }

  // Empty state
  if (data.length === 0 && emptyPlaceholder) {
    return emptyPlaceholder
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto relative ${className}`}
      onScroll={handleScroll}
      style={{ height: rowHeight * visibleRows }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: startIndex * rowHeight,
            width: "100%",
          }}
        >
          {data.slice(startIndex, endIndex).map((item, index) => renderRow(item, startIndex + index))}
        </div>
      </div>
    </div>
  )
}

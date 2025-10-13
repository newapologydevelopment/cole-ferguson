// components/PhotoIndicator.tsx
'use client'

import { useRef, useState, useLayoutEffect, useCallback, useEffect } from 'react'

interface Props {
  totalImages: number
  beforeCount: number
  currentCount: number
}

export const PhotoIndicator = ({ totalImages, beforeCount, currentCount }: Props) => {
  const digitsRef = useRef<HTMLDivElement | null>(null)
  const digitRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [underline, setUnderline] = useState({ left: 0, width: 0 })

  const measure = useCallback(() => {
    if (!digitsRef.current || totalImages === 0 || currentCount === 0) return
    const start = beforeCount
    const end = beforeCount + currentCount - 1
    const startEl = digitRefs.current[start]
    const endEl = digitRefs.current[end]
    if (!startEl || !endEl) return
    const wrapRect = digitsRef.current.getBoundingClientRect()
    const sRect = startEl.getBoundingClientRect()
    const eRect = endEl.getBoundingClientRect()
    setUnderline({
      left: sRect.left - wrapRect.left,
      width: eRect.right - sRect.left,
    })
  }, [beforeCount, currentCount, totalImages])

  useLayoutEffect(() => { measure() }, [measure])
  useEffect(() => {
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [measure])

  if (!totalImages) return null

  return (
    <div className="pointer-events-none fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[40]">
      <div ref={digitsRef} className="relative flex gap-[4px] text-[12px]">
        {Array.from({ length: totalImages }).map((_, i) => {
          const isActive = i >= beforeCount && i < beforeCount + currentCount
          return (
            <span
              key={i}
              ref={el => {
                digitRefs.current[i] = el
              }}
              className={`inline-block px-[1px] transition-transform duration-200 ${
                isActive ? '-translate-y-[2px]' : ''
              }`}
            >
              {i + 1}
            </span>
          )
        })}
        {currentCount > 0 && (
          <div
            className="absolute h-[1px] bg-black transition-all duration-300 ease-out"
            style={{ bottom: 0, left: underline.left, width: underline.width }}
          />
        )}
      </div>
    </div>
  )
}

'use client'
import { useMemo } from 'react'

export function GridOverlay() {
    const colsCount = 24
    const cols = useMemo(() => Array.from({ length: colsCount }), [])

    return (
        <div className="pointer-events-none fixed inset-0 z-[2147483647]">
            {/* Рамка padding 24px */}
            <div className="absolute inset-y-0 left-[24px] w-px bg-blue-500/60" />
            <div className="absolute inset-y-0 right-[24px] w-px bg-blue-500/60" />
            <div className="absolute inset-x-0 top-[24px] h-px bg-blue-500/60" />
            <div className="absolute inset-x-0 bottom-[24px] h-px bg-blue-500/60" />

            {/* Grid на 24 колонки всередині padding */}
            <div
                className="absolute top-[24px] bottom-[24px] left-[24px] right-[24px] grid"
                style={{ gridTemplateColumns: `repeat(${colsCount}, minmax(0, 1fr))` }}
            >
                {cols.map((_, i) => (
                    <div key={i} className="border-r border-gray-400/40 last:border-r-0" />
                ))}
            </div>

            {/* Червоні лінії по центру */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-red-500/60 -translate-y-1/2" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-red-500/60 -translate-x-1/2" />
        </div>
    )
}

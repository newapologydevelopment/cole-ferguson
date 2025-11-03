'use client'
import { useMemo } from 'react'

export function GridOverlay() {
    const colsCount = 24
    const cols = useMemo(() => Array.from({ length: colsCount }), [])

    return (
        <>
            {/* Mobile: always show 20px padding outline */}
            <div className="pointer-events-none fixed inset-0 z-[2147483647] md:hidden">
                <div className="absolute inset-y-0 left-[20px] w-px bg-sky-600/40" />
                <div className="absolute inset-y-0 right-[20px] w-px bg-sky-600/40" />
                <div className="absolute inset-x-0 top-[20px] h-px bg-sky-600/40" />
                <div className="absolute inset-x-0 bottom-[20px] h-px bg-sky-600/40" />
            </div>

            <div className="pointer-events-none fixed inset-0 z-[2147483647]">
                {/* mobile: 20px, desktop: 24px */}
                <div className="absolute inset-y-0 left-[20px] md:left-[24px] w-px bg-sky-600/40" />
                <div className="absolute inset-y-0 right-[20px] md:right-[24px] w-px bg-sky-600/40" />
                <div className="absolute inset-x-0 top-[20px] md:top-[24px] h-px bg-sky-600/40" />
                <div className="absolute inset-x-0 bottom-[20px] md:bottom-[24px] h-px bg-sky-600/40" />

                {/* центр */}
                <div className="absolute inset-x-0 top-1/2 h-px bg-red-500/50 -translate-y-1/2" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-red-500/50 -translate-x-1/2" />

                {/* grid + внутрішні лінії */}
                <div
                    className="
              absolute 
              top-[20px] bottom-[20px] left-[20px] right-[20px]
              md:top-[24px] md:bottom-[24px] md:left-[24px] md:right-[24px]
              grid gap-[16px] md:gap-[32px] opacity-30
            "
                    style={{ gridTemplateColumns: `repeat(${colsCount}, minmax(0, 1fr))` }}
                >
                    {cols.map((_, i) => (
                        <div key={i} className="border-x border-black/15" />
                    ))}

                    {/* внутрішні лінії контейнера */}
                    <div className="absolute inset-y-0 left-[20px] md:left-[24px] w-px bg-fuchsia-600/30" />
                    <div className="absolute inset-y-0 right-[20px] md:right-[24px] w-px bg-fuchsia-600/30" />
                </div>
            </div>
        </>
    )
}

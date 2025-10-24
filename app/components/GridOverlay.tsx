'use client'
import { useMemo, useState } from 'react'

export function GridOverlay() {
    const [mode, setMode] = useState<'off' | '8' | '24'>('off')

    const colsCount = useMemo(() => (mode === '24' ? 24 : 8), [mode])
    const cols = useMemo(() => Array.from({ length: colsCount }), [colsCount])

    const cycleMode = () => setMode(m => (m === 'off' ? '8' : m === '8' ? '24' : 'off'))
    const isOn = mode !== 'off'

    return (
        <>
            {/* Toggle button — only desktop (≥ md) */}
            <button
                type="button"
                onClick={cycleMode}
                className="hidden md:block pointer-events-auto fixed top-2 right-2 z-[10000] rounded bg-black/70 px-2 py-1 text-[10px] uppercase tracking-wide text-white hover:bg-black"
                aria-label="Toggle grid overlay"
                title="Toggle grid (click to cycle: off → 8 → 24)"
            >
                {mode === 'off' ? 'Grid: off' : mode === '8' ? 'Grid: 8' : 'Grid: 24'}
            </button>

            {isOn && (
                <div className="pointer-events-none fixed inset-0 z-[9990]">
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
            )}
        </>
    )
}

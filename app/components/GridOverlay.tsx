'use client'

export function GridOverlay() {
    const cols = Array.from({ length: 8 })
    return (
        <div className="pointer-events-none fixed inset-0 z-[9990]">
            <div className="w-[min(95vw,1377px)] h-full mx-auto grid grid-cols-8 gap-[16px] md:gap-[32px] opacity-30">
                {cols.map((_, i) => (
                    <div key={i} className="border-x border-black/15" />
                ))}
            </div>
        </div>
    )
}

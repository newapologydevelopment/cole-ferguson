'use client'

export function GridOverlay() {
    const cols = Array.from({ length: 8 })

    return (
        <div className="pointer-events-none fixed inset-0 z-[9990]">
            {/* 24px від країв вʼюпорта */}
            <div className="absolute inset-y-0 left-[24px] w-px bg-sky-600/40" />
            <div className="absolute inset-y-0 right-[24px] w-px bg-sky-600/40" />
            <div className="absolute inset-x-0 top-[24px] h-px bg-sky-600/40" />
            <div className="absolute inset-x-0 bottom-[24px] h-px bg-sky-600/40" />

            {/* ґрід + внутрішні лінії 24px від контейнера */}
            <div className="relative w-[min(95vw,1377px)] h-full mx-auto grid grid-cols-8 gap-[16px] md:gap-[32px] opacity-30">
                {cols.map((_, i) => (
                    <div key={i} className="border-x border-black/15" />
                ))}
                <div className="absolute inset-y-0 left-[24px] w-px bg-fuchsia-600/30" />
                <div className="absolute inset-y-0 right-[24px] w-px bg-fuchsia-600/30" />
            </div>
        </div>
    )
}

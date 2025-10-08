'use client'

import { useState } from 'react'

const COLLAPSED_H_PX = 46
const OPEN_H = '50vh'

export function InfoBar({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="relative min-h-screen" style={{ paddingBottom: open ? OPEN_H : `${COLLAPSED_H_PX}px` }}>
            {children}
            <div className="fixed left-0 right-0" style={{ bottom: 0 }}>
                <div
                    className="w-full px-[24px]"
                    style={{ height: open ? OPEN_H : `${COLLAPSED_H_PX}px`, transition: 'height 300ms ease' }}
                >
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        className="relative w-full h-full text-left text-[12px] text-primary-dark"
                        aria-expanded={open}
                    >
                        <div className="pt-[12px]">Information</div>
                    </button>
                </div>
            </div>
        </div>
    )
}

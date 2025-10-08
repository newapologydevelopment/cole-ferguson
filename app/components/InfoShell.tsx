// app/InfoShell.tsx
'use client'
import { useState } from 'react'

export function InfoShell({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="relative">
            {/* контент, що підстрибує вгору */}
            <div className={`transition-transform duration-500 ${open ? '-translate-y-[90vh]' : ''}`}>
                {children}
            </div>

            {/* нижня панель Information (клік по всій площі) */}
            <div
                className="fixed left-0 right-0 bottom-0 transition-[height] duration-500 cursor-pointer z-[30]"
                style={{ height: open ? '90vh' : '40px' }}
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
                role="button"
            >
                <div className="h-full overflow-auto px-[24px] text-left text-[12px] text-primary-dark">
                    <div className="pt-[-24px]">Information</div>
                    {/* тут твій контент info */}
                </div>
            </div>
        </div>
    )
}

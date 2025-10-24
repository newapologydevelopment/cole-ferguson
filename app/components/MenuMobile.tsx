'use client'
import Link from 'next/link'
import { useState } from 'react'

export const MenuMobile = () => {
    const [open, setOpen] = useState(false)
    return (
        <>
            <div
                onClick={() => setOpen(!open)}
                className='fixed right-[20px] top-[20px] text-[12px] text-primary-dark z-[20000] sm:hidden'>
                {!open ? 'Menu' : 'Close'}
            </div>
            {open && (
                <div className='fixed left-[20px] right-[20px] top-[40px] text-[12px] text-primary-dark z-[20000] sm:hidden'>
                    <div className='flex items-center gap-[33%] '>
                        <Link href="/gallery" className='py-3'>Index</Link>
                        <Link href="/archive" className='py-3'>Archive</Link>
                        {/* <div>Information</div> */}
                    </div>
                </div>
            )}
        </>
    )
}

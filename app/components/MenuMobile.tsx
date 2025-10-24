'use client'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

export const MenuMobile = () => {
    const [open, setOpen] = useState(false)
    return (
        <>
            <div
                onClick={() => setOpen(!open)}
                className='fixed right-[20px] top-[20px] text-[12px] text-primary-dark z-[10000] sm:hidden bg-white'>
                {!open ? 'Menu' : 'Close'}
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ y: '-100%', opacity: 0, zIndex: 0 }}
                        animate={{ y: 0, opacity: 1, zIndex: 9998 }}
                        exit={{ y: '-100%', opacity: 0, zIndex: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                        className='fixed left-[20px] right-[20px] top-[40px] text-[12px] text-primary-dark z-[9998] sm:hidden bg-white'
                    >
                        <div className='flex items-center gap-[33%] '>
                            <Link href="/gallery" className='py-3'>Index</Link>
                            <Link href="/archive" className='py-3'>Archive</Link>
                            {/* <div>Information</div> */}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

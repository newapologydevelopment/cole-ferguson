'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function useScrollToTop() {
    const pathname = usePathname()

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
    }, [pathname])
}
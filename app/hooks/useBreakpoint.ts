'use client'

import { useEffect, useState } from 'react'

type BreakpointState = {
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
}

export function useBreakpoint(): BreakpointState {
    const [breakpoint, setBreakpoint] = useState<BreakpointState>({
        isMobile: false,
        isTablet: false,
        isDesktop: false,
    })

    useEffect(() => {
        const check = () => {
            const w = window.innerWidth
            setBreakpoint({
                isMobile: w < 640,
                isTablet: w >= 640 && w < 1024,
                isDesktop: w >= 1024,
            })
        }

        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    return breakpoint
}

'use client'

import { useEffect, useState } from 'react'

type BreakpointState = {
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    isCompact: boolean
    isReady: boolean
}

const initialState: BreakpointState = {
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    isCompact: true,
    isReady: false,
}

export function useBreakpoint(): BreakpointState {
    const [breakpoint, setBreakpoint] = useState<BreakpointState>(initialState)

    useEffect(() => {
        const check = () => {
            const w = window.innerWidth
            setBreakpoint({
                isMobile: w < 640,
                isTablet: w >= 640 && w < 1024,
                isDesktop: w >= 1024,
                isCompact: w < 1280,
                isReady: true,
            })
        }

        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    return breakpoint
}

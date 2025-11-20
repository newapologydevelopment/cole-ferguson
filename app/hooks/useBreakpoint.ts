'use client'

import { useEffect, useState } from 'react'

type BreakpointState = {
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    isReady: boolean
}

const initialState: BreakpointState = {
    isMobile: false,
    isTablet: false,
    isDesktop: false,
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
                isReady: true,
            })
        }

        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    return breakpoint
}

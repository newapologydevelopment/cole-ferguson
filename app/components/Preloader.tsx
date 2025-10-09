'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

interface Props {
    onDone?: () => void
    durationMs?: number
    fadeOutMs?: number
    lastHoldMs?: number
    jitterProb?: number
    jitterMaxMs?: number
}

// Per-frame intrinsic sizes
const FRAME_SIZES = [
    { id: 1, width: 57, height: 72 },
    { id: 2, width: 108, height: 72 },
    { id: 3, width: 90, height: 72 },
    { id: 4, width: 90, height: 72 },
    { id: 5, width: 90, height: 72 },
    { id: 6, width: 58, height: 72 },
    { id: 7, width: 58, height: 72 },
    { id: 8, width: 58, height: 72 },
    { id: 9, width: 58, height: 72 },
    { id: 10, width: 90, height: 72 },
]

export const Preloader = ({
    onDone,
    durationMs = 3000,
    fadeOutMs = 600,
    lastHoldMs = 400,
    jitterProb = 0.3,
    jitterMaxMs = 200,
}: Props) => {
    const images = useMemo(
        () => [
            '/preloader_images/1.png',
            '/preloader_images/2.png',
            '/preloader_images/3.png',
            '/preloader_images/4.png',
            '/preloader_images/5.png',
            '/preloader_images/6.png',
            '/preloader_images/7.png',
            '/preloader_images/8.png',
            '/preloader_images/9.png',
            '/preloader_images/10.png',
        ],
        []
    )

    const [idx, setIdx] = useState(0)
    const [visible, setVisible] = useState(true)
    const [fading, setFading] = useState(false)
    const timersRef = useRef<number[]>([])

    // useEffect(() => {
    //     const total = Math.max(1, durationMs)
    //     const fadeMs = Math.min(total, Math.max(0, fadeOutMs))
    //     const holdMs = Math.min(total - fadeMs, Math.max(0, lastHoldMs))
    //     const transitions = Math.max(1, images.length - 1)
    //     const playableMs = Math.max(0, total - fadeMs - holdMs)
    //     const baseFrameMs = Math.max(1, Math.floor(playableMs / transitions))

    //     const setTimer = (fn: () => void, ms: number) => {
    //         const id = window.setTimeout(fn, ms)
    //         timersRef.current.push(id)
    //         return id
    //     }

    //     let current = 0
    //     const advance = () => {
    //         if (current < images.length - 1) {

    //             const jitter = Math.random() < jitterProb ? Math.floor(Math.random() * Math.max(0, jitterMaxMs)) : 0
    //             setTimer(() => {
    //                 current += 1
    //                 setIdx(current)
    //                 advance()
    //             }, baseFrameMs + jitter)
    //         } else {

    //             setTimer(() => {
    //                 setFading(true)
    //             }, holdMs)
    //             setTimer(() => {
    //                 setVisible(false)
    //                 onDone?.()
    //             }, holdMs + fadeMs)
    //         }
    //     }

    //     setIdx(0)
    //     advance()

    //     return () => {
    //         timersRef.current.forEach((id) => clearTimeout(id))
    //         timersRef.current = []
    //     }
    // }, [durationMs, fadeOutMs, lastHoldMs, jitterProb, jitterMaxMs, images.length, onDone])

    useEffect(() => {
        const timer = setInterval(() => {
            if (idx === images.length - 1) {
                setVisible(false)
                clearInterval(timer)
                return
            }

            setIdx(idx + 1)
        }, Math.random() * (350 - 200) + 200)
        return () => clearTimeout(timer)
    }, [idx, images.length])

    if (!visible) return null

    const frameMeta = FRAME_SIZES[idx] ?? FRAME_SIZES[0]
    const width = Math.round(frameMeta.width)
    const height = Math.round(frameMeta.height)

    return (
        <div
            className="fixed inset-0 bg-white flex items-center justify-center z-[9999]"
        // style={{ opacity: fading ? 0 : 1, transition: `opacity ${Math.min(durationMs, fadeOutMs)}ms ease-out` }}
        >
            <Image
                src={images[idx]}
                alt="preloader"
                width={width || 57}
                height={height || 72}
                priority
                className="h-auto object-contain"
            />
        </div>
    )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import type { Project as ProjectType, ProjectView } from "@/types/project"
import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { SingleViewMobile } from "./SingleViewMobile"
import { ThreeViewMobile } from "./ThreeViewMobile"
import { TwoViewMobile } from "./TwoViewMobile"

interface Props {
    project: ProjectType
    actualPhoto?: string | null
    showIndicator?: boolean
    showBottomTitle?: boolean
}

const normalizeViews = (project: ProjectType): ProjectView[] => {
    const base: ProjectView[] =
        (project.views && project.views.length > 0)
            ? project.views
            : (project.images && project.images.length > 0)
                ? [{ _type: 'singleView', images: [project.images[0]] }]
                : []

    return base.map(v => {
        const len = v.images?.length ?? 0
        if (len === 1 && v._type !== 'singleView') {
            return { _type: 'singleView', images: v.images }
        }
        return v
    })
}

export const ProjectMobile: React.FC<Props> = ({
    project,
    actualPhoto,
    showIndicator = true,
    showBottomTitle = true
}) => {
    // стабільний ключ проєкту
    const projectKey = project?._id || (project as any)?.slug || project?.title || 'project'
    const views = useMemo(() => normalizeViews(project), [project])
    const [index, setIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const transitionTimerRef = useRef<number | null>(null)
    const TRANSITION_MS = 280

    // коли змінився проєкт — скидаємо індекс
    useEffect(() => {
        setIndex(0)
    }, [projectKey])

    const current = views[index]
    const viewKey = `${projectKey}-${index}`

    // синхронізація з обраним фото
    useEffect(() => {
        if (!actualPhoto || views.length === 0) return
        const idx = views.findIndex(v => v.images?.some(img => img?.asset?._ref === actualPhoto))
        if (idx !== -1) setIndex(idx)
    }, [actualPhoto, views])

    const goPrev = useCallback(() => {
        if (views.length === 0 || isTransitioning) return
        setIsTransitioning(true)
        setIndex(i => (i - 1 + views.length) % views.length)
        if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current)
        transitionTimerRef.current = window.setTimeout(() => setIsTransitioning(false), TRANSITION_MS)
    }, [views.length, isTransitioning])

    const goNext = useCallback(() => {
        if (views.length === 0 || isTransitioning) return
        setIsTransitioning(true)
        setIndex(i => (i + 1) % views.length)
        if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current)
        transitionTimerRef.current = window.setTimeout(() => setIsTransitioning(false), TRANSITION_MS)
    }, [views.length, isTransitioning])

    // індикатор (логіка ідентична десктопу)
    const imageCounts = views.map(v => v.images?.length ?? 0)
    const totalImages = imageCounts.reduce((a, b) => a + b, 0)
    const beforeCount = imageCounts.slice(0, index).reduce((a, b) => a + b, 0)
    const currentCount = current?.images?.length ?? 0

    const digitsRef = useRef<HTMLDivElement | null>(null)
    const digitRefs = useRef<(HTMLSpanElement | null)[]>([])
    const [underline, setUnderline] = useState({ left: 0, width: 0 })

    // скидаємо refs коли змінюється кількість цифр
    useEffect(() => {
        digitRefs.current = []
    }, [totalImages])

    // єдине місце вимірювання + resize-слухач
    const measure = useCallback(() => {
        if (!digitsRef.current || totalImages === 0 || currentCount === 0) return
        const start = beforeCount
        const end = beforeCount + currentCount - 1
        const startEl = digitRefs.current[start]
        const endEl = digitRefs.current[end]
        if (!startEl || !endEl) return
        const wrapRect = digitsRef.current.getBoundingClientRect()
        const sRect = startEl.getBoundingClientRect()
        const eRect = endEl.getBoundingClientRect()
        const left = sRect.left - wrapRect.left
        const width = eRect.right - sRect.left
        // уникнути зайвих setState
        setUnderline(prev => (prev.left === left && prev.width === width ? prev : { left, width }))
    }, [beforeCount, currentCount, totalImages])

    useLayoutEffect(() => {
        if (!showIndicator) return
        measure()
    }, [measure, showIndicator, index, totalImages, beforeCount, currentCount])

    useEffect(() => {
        if (!showIndicator) return
        const onResize = () => measure()
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [measure, showIndicator])

    // свайп-жести
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)
    const onTouchStart = (e: React.TouchEvent) => {
        if (isTransitioning) return
        touchStartX.current = e.touches[0].clientX
    }
    const onTouchMove = (e: React.TouchEvent) => {
        if (isTransitioning) return
        touchEndX.current = e.touches[0].clientX
    }
    const onTouchEnd = () => {
        if (isTransitioning) return
        const dx = touchStartX.current - touchEndX.current
        const threshold = 48
        if (dx > threshold) goNext()
        else if (dx < -threshold) goPrev()
    }

    // cleanup таймера при анмаунті
    useEffect(() => {
        return () => {
            if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current)
        }
    }, [])

    const renderView = (v?: ProjectView | null) => {
        if (!v || !v.images || v.images.length === 0) return null
        if (v._type === 'twoView' && v.images.length === 2)
            return <TwoViewMobile images={v.images} disableFade />
        if (v._type === 'threeView' && v.images.length === 3)
            return <ThreeViewMobile images={v.images} />
        return <SingleViewMobile image={v.images[0]} />
    }

    return (
        <div
            className="sm:hidden relative w-screen h-[100dvh] overflow-hidden select-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ touchAction: 'pan-y', WebkitTapHighlightColor: 'transparent' }}
        >
            {/* STAGE */}
            <div className="relative w-full h-full">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={viewKey}
                        className="absolute inset-0 z-0 pointer-events-none will-change-transform"
                        initial={false} // ← щоб не було початкового мерехтіння
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.4, 0.0, 0.2, 1] }}
                    >
                        <div className="pointer-events-none">
                            {renderView(current) ?? (
                                <div className="flex items-center justify-center h-full p-[20px]">
                                    {project.title}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {showIndicator && totalImages > 0 && (
                <div className="pointer-events-none fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[40]">
                    <div ref={digitsRef} className="relative flex gap-[4px] text-[12px] pb-[2px] leading-none">
                        {Array.from({ length: totalImages }).map((_, i) => {
                            const isActive = i >= beforeCount && i < beforeCount + currentCount
                            return (
                                <span
                                    key={i}
                                    ref={el => { digitRefs.current[i] = el }}
                                    className={`inline-block px-[1px] ${isActive ? '-translate-y-[2px]' : ''}`}
                                >
                                    {i + 1}
                                </span>
                            )
                        })}
                        {currentCount > 0 && (
                            <motion.div
                                className="absolute h-[1px] bg-black"
                                style={{ bottom: 0 }}
                                initial={false}
                                animate={{ left: underline.left, width: underline.width }}
                                transition={{ type: 'spring', stiffness: 380, damping: 36, mass: 0.2 }}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* TAP ЗОНИ */}
            <button
                type="button"
                aria-label="Previous"
                onClick={(e) => { if (isTransitioning) return; e.stopPropagation(); goPrev() }}
                onTouchStart={(e) => { if (isTransitioning) return; e.stopPropagation(); e.preventDefault(); goPrev(); }}
                className={`absolute left-[6px] top-0 h-full w-[calc(50%-6px)] z-[60] ${isTransitioning ? 'pointer-events-none' : 'pointer-events-auto'} focus:outline-none`}
                style={{ background: 'transparent' }}
            />
            <button
                type="button"
                aria-label="Next"
                onClick={(e) => { if (isTransitioning) return; e.stopPropagation(); goNext() }}
                onTouchStart={(e) => { if (isTransitioning) return; e.stopPropagation(); e.preventDefault(); goNext(); }}
                className={`absolute right-0 top-0 h-full w-1/2 z-[60] ${isTransitioning ? 'pointer-events-none' : 'pointer-events-auto'} focus:outline-none`}
                style={{ background: 'transparent' }}
            />

            {/* титул */}
            {showBottomTitle && (
                <div className="fixed bottom-[25px] left-0 right-0 p-[20px] text-center z-[10]">
                    {project.title}
                </div>
            )}
        </div>
    )
}

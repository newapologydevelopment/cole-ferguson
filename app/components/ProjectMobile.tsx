'use client'

import type { Project as ProjectType, ProjectView } from "@/types/project"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { SingleViewMobile } from "./SingleViewMobile"
import { ThreeViewMobile } from "./ThreeViewMobile"
import { TwoViewMobile } from "./TwoViewMobile"

interface Props {
    project: ProjectType
    actualPhoto?: string | null
    showIndicator?: boolean
}

/** — helpers — */
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
    showIndicator = true
}) => {
    const views = useMemo(() => normalizeViews(project), [project])
    const [index, setIndex] = useState(0)

    // синхронізація з обраним фото (як у Desktop-версії)
    useEffect(() => {
        if (!actualPhoto || views.length === 0) return
        const idx = views.findIndex(v => v.images?.some(img => img?.asset?._ref === actualPhoto))
        if (idx !== -1) setIndex(idx)
    }, [actualPhoto, views])

    const goPrev = useCallback(() => {
        if (views.length === 0) return
        setIndex(i => (i - 1 + views.length) % views.length)
    }, [views.length])

    const goNext = useCallback(() => {
        if (views.length === 0) return
        setIndex(i => (i + 1) % views.length)
    }, [views.length])

    const current = views[index]

    // індикатор (загальна кількість фото / позиція блоку)
    const imageCounts = views.map(v => v.images?.length ?? 0)
    const totalImages = imageCounts.reduce((a, b) => a + b, 0)
    const beforeCount = imageCounts.slice(0, index).reduce((a, b) => a + b, 0)
    const currentCount = current?.images?.length ?? 0

    // свайп-жести
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
    }
    const onTouchEnd = () => {
        const dx = touchStartX.current - touchEndX.current
        const threshold = 48
        if (dx > threshold) goNext()
        else if (dx < -threshold) goPrev()
    }
    const onTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX
    }

    const renderView = (v?: ProjectView | null) => {
        if (!v || !v.images || v.images.length === 0) return null
        if (v._type === 'twoView' && v.images.length === 2) return <TwoViewMobile images={v.images} />
        if (v._type === 'threeView' && v.images.length === 3) return <ThreeViewMobile images={v.images} />
        return <SingleViewMobile image={v.images[0]} />
    }

    return (
        <div
            className="sm:hidden relative w-screen h-[100dvh] overflow-hidden select-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className="relative w-full">
                {renderView(current) ?? (
                    <div className="flex items-center justify-center h-full p-[20px]">{project.title}</div>
                )}
            </div>

            {/* Простий індикатор у мобільному стилі */}

            {showIndicator && totalImages > 0 && (
                <div className="pointer-events-none fixed bottom-[16px] left-1/2 -translate-x-1/2 z-40">
                    <div className="flex items-center gap-[6px] text-[12px] leading-none">
                        {/* діапазон активного блоку */}
                        <span>{beforeCount + 1}</span>
                        <span>—</span>
                        <span>{beforeCount + currentCount}</span>
                        <span className="opacity-60">/ {totalImages}</span>
                    </div>
                </div>
            )}

            {/* Клік-зони (без курсора) */}
            <button
                type="button"
                aria-label="Previous"
                onClick={goPrev}
                className="absolute left-0 top-0 h-full w-1/2 focus:outline-none"
                style={{ background: 'transparent' }}
            />
            <button
                type="button"
                aria-label="Next"
                onClick={goNext}
                className="absolute right-0 top-0 h-full w-1/2 focus:outline-none"
                style={{ background: 'transparent' }}
            />
            <div className="fixed bottom-[20px] left-0 right-0 p-[20px] text-center">{project.title}</div>
        </div>
    )
}

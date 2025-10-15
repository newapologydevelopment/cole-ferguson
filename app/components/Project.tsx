'use client'

import { urlFor } from '@/sanity/lib/image'
import type { Project as ProjectType, ProjectView } from "@/types/project"
import Image from 'next/image'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ThreeImagesView } from './ThreeImagesView'
import { TwoImagesView } from './TwoImagesView'

export const Project = ({ project }: { project: ProjectType }) => {
    const views: ProjectView[] = (project.views && project.views.length > 0)
        ? project.views
        : (project.images && project.images.length > 0)
            ? [{ _type: 'singleView', images: [project.images[0]] }]
            : []

    const [index, setIndex] = useState(0)

    const goPrev = useCallback(() => {
        if (views.length === 0) return
        setIndex((i) => (i - 1 + views.length) % views.length)
    }, [views.length])

    const goNext = useCallback(() => {
        if (views.length === 0) return
        setIndex((i) => (i + 1) % views.length)
    }, [views.length])

    const current = views[index]

    // Indicator data: total images across all views and active range
    const imageCounts = views.map(v => v.images?.length ?? 0)
    const totalImages = imageCounts.reduce((a, b) => a + b, 0)
    const beforeCount = imageCounts.slice(0, index).reduce((a, b) => a + b, 0)
    const currentCount = current?.images?.length ?? 0

    // underline measurement within digits wrapper
    const digitsRef = useRef<HTMLDivElement | null>(null)
    const digitRefs = useRef<(HTMLSpanElement | null)[]>([])
    const [underline, setUnderline] = useState({ left: 0, width: 0 })

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
        setUnderline({ left, width })
    }, [beforeCount, currentCount, totalImages])

    useLayoutEffect(() => {
        measure()
    }, [measure, index])

    useEffect(() => {
        const onResize = () => measure()
        window.addEventListener('resize', onResize)
        const t = setTimeout(measure, 0)
        return () => { window.removeEventListener('resize', onResize); clearTimeout(t) }
    }, [measure])

    return (
        <div className="relative h-screen w-screen flex items-center justify-center select-none overflow-x-hidden">
            <div className="relative grid grid-cols-24 gap-[16px] md:gap-[32px]">
                {current ? (
                    current._type === 'twoView' && current.images?.length === 2 ? (
                        /* Two images layout fills container */
                        <div className="colcol-span-24 h-full w-full">
                            <TwoImagesView images={current.images} />

                        </div>
                    ) : current._type === 'threeView' && current.images?.length === 3 ? (
                        /* Three images layout fills container */
                        <div className="col-span-24 h-full w-full">
                            <ThreeImagesView images={current.images} />
                        </div>
                    ) : (
                        /* One image: place from col 2 to 8 */
                        (() => {
                            const img = current.images?.[0]
                            const src = img ? urlFor(img).url() : undefined
                            const width = img?.width ?? 1600
                            const height = img?.height ?? 1067
                            const alt = img?.alt ?? project.title
                            return src ? (
                                <div className="col-start-5 col-span-16 flex items-center justify-center">
                                    <Image
                                        src={src}
                                        alt={alt}
                                        width={width}
                                        height={height}
                                        placeholder={img?.blurDataURL ? 'blur' : 'empty'}
                                        blurDataURL={img?.blurDataURL}
                                        className="max-w-full max-h-[642px] w-auto h-auto object-contain"
                                        priority
                                    />
                                </div>
                            ) : (
                                <div className="col-start-2 col-span-7 flex items-center justify-center">{project.title}</div>
                            )
                        })()
                    )
                ) : (
                    <div className="col-start-2 col-span-7 flex items-center justify-center">{project.title}</div>
                )}
            </div>

            {/* Indicator fixed to viewport bottom center */}
            {totalImages > 0 && (
                <div className="pointer-events-none fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[40]">
                    <div ref={digitsRef} className="relative flex gap-[4px] text-[12px]">
                        {Array.from({ length: totalImages }).map((_, i) => {
                            const isActive = i >= beforeCount && i < beforeCount + currentCount
                            return (
                                <span
                                    key={i}
                                    ref={(el) => { digitRefs.current[i] = el; }}
                                    className={`inline-block px-[1px] ${isActive ? '-translate-y-[2px]' : ''}`}
                                >
                                    {i + 1}
                                </span>
                            )
                        })}
                        {currentCount > 0 && (
                            <div
                                className="absolute h-[1px] bg-black"
                                style={{ bottom: 0, left: underline.left, width: underline.width }}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Left click area */}
            <button
                type="button"
                aria-label="Previous"
                onClick={goPrev}
                className="absolute left-0 top-0 h-full w-1/2 cursor-w-resize focus:outline-none"
                style={{ background: 'transparent' }}
            />

            {/* Right click area */}
            <button
                type="button"
                aria-label="Next"
                onClick={goNext}
                className="absolute right-0 top-0 h-full w-1/2 cursor-e-resize focus:outline-none"
                style={{ background: 'transparent' }}
            />
        </div>
    )
}

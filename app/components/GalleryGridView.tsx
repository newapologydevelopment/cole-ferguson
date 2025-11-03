"use client"

import { urlFor } from "@/sanity/lib/image"
import type { ProjectImage, Project as ProjectType } from "@/types/project"
import { cn } from "@/utils"
import Image from "next/image"
import { useEffect, useState } from "react"
import { LenisProvider } from "./LenisProvider"

export type GalleryGridItem = {
    projectId: string
    projectTitle: string
    image: ProjectImage
    label?: string
}

type Props = {
    items: GalleryGridItem[]
    projects: ProjectType[]
    selectedProject?: string | null
    onHoverProject?: (projectTitle: string | null) => void
    columns?: number
    gapX?: number
    gapY?: number
    thumbWidth?: number
    className?: string
    onClick: (project: ProjectType) => void;
    selectActualPhoto: (image: string) => void;
}

export const GalleryGridView = ({
    items,
    projects,
    selectedProject = null,
    onHoverProject,
    thumbWidth = 130,
    className,
    onClick,
    selectActualPhoto
}: Props) => {
    const seen = new Map<string, number>()
    const [isScrolling, setIsScrolling] = useState(false)

    useEffect(() => {
        let timeout: NodeJS.Timeout
        const handleScroll = () => {
            setIsScrolling(true)
            clearTimeout(timeout)
            timeout = setTimeout(() => setIsScrolling(false), 50) // після 150мс без скролу — знову активується
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])


    const handleProjectSelect = (project: GalleryGridItem) => {
        onClick?.(projects.find(p => p._id === project.projectId) as unknown as ProjectType)
        selectActualPhoto(project?.image?.asset?._ref || '')
    }
    return (
        <div className={cn("col-start-1 pt-[68px] xl:pt-0 xl:col-start-7 col-span-full h-full pb-[24px]", className)}>
            <LenisProvider />
            <div className="w-full h-full grid grid-cols-6 gap-x-[30px] xl:gap-x-[60px] gap-y-[50px] xl:gap-y-[100px] content-start items-start auto-rows-max">
                {items.map((it, i) => {
                    const ref = it.image?.asset?._ref
                    if (!ref) return null

                    const w = it.image?.width || 1
                    const h = it.image?.height || 1
                    const thumbW = thumbWidth

                    const src = urlFor({ _type: 'image', asset: { _ref: ref } })
                        .width(thumbW)
                        .auto('format')
                        .quality(70)
                        .url()

                    return (
                        <div key={`${it.projectId}-${i}`} className="flex flex-col gap-[5.22px]">
                            <div
                                className={cn("relative w-full overflow-hidden duration-300 ease-in-out", {
                                    'opacity-20': selectedProject !== it.projectTitle && selectedProject !== null,
                                    'pointer-events-none': isScrolling,
                                    'pointer-events-auto': !isScrolling,
                                })}
                                style={{ aspectRatio: `${w} / ${h}` }}
                                onMouseEnter={() => onHoverProject?.(it.projectTitle)}
                                onMouseLeave={() => onHoverProject?.(null)}
                                onClick={() => handleProjectSelect(it)}
                            >
                                <Image
                                    src={src}
                                    alt={it.image?.alt || ''}
                                    fill
                                    className="object-cover"
                                    placeholder={it.image?.blurDataURL ? 'blur' : 'empty'}
                                    blurDataURL={it.image?.blurDataURL}
                                    sizes={`${thumbW}px`}
                                    loading="lazy"
                                    decoding="async"
                                />

                            </div>
                            <p className='text-center text-[10px]'>
                                {(() => {
                                    const prev = seen.get(it.projectId) ?? -1
                                    const cur = prev + 1
                                    seen.set(it.projectId, cur)
                                    return it.label ?? (cur === 0 ? it.projectTitle : String(cur + 1))
                                })()}
                            </p>
                        </div>
                    )
                })}
            </div>

        </div>
    )
}

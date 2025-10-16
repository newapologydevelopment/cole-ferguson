import { urlFor } from "@/sanity/lib/image"
import type { ProjectImage } from "@/types/project"
import { cn } from "@/utils"
import Image from "next/image"

export type GalleryGridItem = {
    projectId: string
    projectTitle: string
    image: ProjectImage
    label?: string
}

type Props = {
    items: GalleryGridItem[]
    selectedProject?: string | null
    onHoverProject?: (projectTitle: string | null) => void
    columns?: number
    gapX?: number
    gapY?: number
    thumbWidth?: number
    className?: string
    onClick: () => void;
}

export const GalleryGridView = ({
    items,
    selectedProject = null,
    onHoverProject,
    columns = 6,
    gapX = 100,
    gapY = 60,
    thumbWidth = 130,
    className,
    onClick
}: Props) => {
    const seen = new Map<string, number>()
    return (
        <div className={cn("col-start-7 col-span-full h-full", className)}>
            <div className="w-full h-full grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, columnGap: `${gapX}px`, rowGap: `${gapY}px` }}>
                {items.map((it, i) => {
                    const ref = it.image?.asset?._ref
                    if (!ref) return null

                    const w = it.image?.width || 1
                    const h = it.image?.height || 1
                    const thumbW = thumbWidth
                    const thumbH = Math.round((thumbW * h) / w)

                    const src = urlFor({ _type: 'image', asset: { _ref: ref } })
                        .width(thumbW)
                        .auto('format')
                        .quality(70)
                        .url()

                    return (
                        <div
                            key={`${it.projectId}-${i}`}
                            className={cn("relative flex flex-col items-center gap-[5.22px] duration-300 ease-in-out", {
                                'opacity-20': selectedProject !== it.projectTitle && selectedProject !== null,
                            })}
                            onMouseEnter={() => onHoverProject?.(it.projectTitle)}
                            onMouseLeave={() => onHoverProject?.(null)}
                            onClick={onClick}
                        >
                            <Image
                                src={src}
                                alt={it.image?.alt || ''}
                                width={thumbW}
                                height={thumbH}
                                placeholder={it.image?.blurDataURL ? 'blur' : 'empty'}
                                blurDataURL={it.image?.blurDataURL}
                                sizes={`${thumbW}px`}
                                loading="lazy"
                                decoding="async"
                            />
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

"use client"

import { urlFor } from "@/sanity/lib/image"
import type { ProjectImage, Project as ProjectType } from "@/types/project"
import Image from "next/image"

export type GalleryGridItem = {
    projectId: string
    projectTitle: string
    image: ProjectImage
    label?: string
}

type Props = {
    items: GalleryGridItem[]
    projects: ProjectType[]
    onClick: (project: ProjectType) => void
    selectActualPhoto: (image: string) => void
    selectedProject?: string | null
}

export const GalleryGridViewMobile = ({
    items,
    projects,
    onClick,
    selectActualPhoto,

}: Props) => {
    const seen = new Map<string, number>()
    // const [isScrolling, setIsScrolling] = useState(false)

    // useEffect(() => {
    //     let timeout: NodeJS.Timeout
    //     const handleScroll = () => {
    //         setIsScrolling(true)
    //         clearTimeout(timeout)
    //         timeout = setTimeout(() => setIsScrolling(false), 80)
    //     }
    //     window.addEventListener("scroll", handleScroll, { passive: true })
    //     return () => window.removeEventListener("scroll", handleScroll)
    // }, [])

    const handleProjectSelect = (it: GalleryGridItem) => {
        const project = projects.find(p => p._id === it.projectId)
        if (!project) return
        onClick(project)
        selectActualPhoto(it?.image?.asset?._ref || "")
    }

    return (
        <div className="w-full grid grid-cols-8 gap-x-[20px] gap-y-[24px]">
            {items.map((it, i) => {
                const ref = it.image?.asset?._ref
                if (!ref) return null

                const w = it.image?.width || 1
                const h = it.image?.height || 1

                const src = urlFor({ _type: "image", asset: { _ref: ref } })
                    .width(800)
                    .auto("format")
                    .quality(70)
                    .url()

                return (
                    <div
                        key={`${it.projectId}-${i}`}
                        className="col-span-4 flex flex-col gap-[8px] min-w-full"
                    >
                        <button
                            type="button"
                            className="relative block w-full overflow-hidden active:opacity-80 transition-opacity duration-150"
                            style={{
                                aspectRatio: `${w} / ${h}`,
                                position: "relative",
                                width: "100%",
                            }}
                            onClick={() => handleProjectSelect(it)}
                        >
                            <Image
                                src={src}
                                alt={it.image?.alt || ""}
                                fill
                                className="object-cover"
                                placeholder={it.image?.blurDataURL ? "blur" : "empty"}
                                blurDataURL={it.image?.blurDataURL}
                                sizes="(max-width: 768px) 50vw, 0px"
                                loading="lazy"
                                decoding="async"
                            />
                        </button>

                        <p className="text-center text-[10px] leading-[1.2]">
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
    )
}

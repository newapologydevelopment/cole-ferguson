"use client"

import { sanityLoader, urlFor } from "@/sanity/lib/image"
import type { ProjectImage, Project as ProjectType } from "@/types/project"
import { GridRevealImage } from "./GridRevealImage"
import { usePreloaderDone } from "./PreloaderGate"

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
    const preloaderDone = usePreloaderDone()
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
                    .url()
                const projectImageIndex = (seen.get(it.projectId) ?? -1) + 1
                seen.set(it.projectId, projectImageIndex)
                const imageLabel =
                    it.label ??
                    (projectImageIndex === 0 ? it.projectTitle : String(projectImageIndex + 1))

                return (
                    <div
                        key={`${it.projectId}-${i}`}
                        className="col-span-4 flex flex-col gap-[8px] min-w-full"
                    >
                        <button
                            type="button"
                            aria-label={`Open ${it.projectTitle}, image ${projectImageIndex + 1}`}
                            className="relative block w-full overflow-hidden active:opacity-80 transition-opacity duration-150"
                            style={{
                                aspectRatio: `${w} / ${h}`,
                                position: "relative",
                                width: "100%",
                            }}
                            onClick={() => handleProjectSelect(it)}
                        >
                            <GridRevealImage
                                index={i}
                                immediate={i === 0}
                                loader={sanityLoader}
                                src={src}
                                alt={it.image?.alt || ""}
                                fill
                                className="object-cover"
                                placeholder={it.image?.blurDataURL ? "blur" : "empty"}
                                blurDataURL={it.image?.blurDataURL}
                                sizes="(min-width: 640px) calc((100vw - 68px) / 2), calc((100vw - 60px) / 2)"
                                priority={i === 0}
                                loading={i < 8 ? "eager" : "lazy"}
                                fetchPriority={i === 0 ? "high" : "auto"}
                                decoding="async"
                            />
                        </button>

                        <p
                            className={`text-center text-[10px] leading-[1.2] ${
                                preloaderDone ? "visible" : "invisible"
                            }`}
                        >
                            {imageLabel}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}

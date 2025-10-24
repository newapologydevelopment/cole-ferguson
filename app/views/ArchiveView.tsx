'use client'

import { ArchiveProject as ArchiveProjectType } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"
import Image from "next/image"
import { useCallback, useState } from "react"
import { ArchiveLightBox, ArchiveProject } from "../components"
import { useBreakpoint } from "../hooks"

type Props = { archiveProjects: ArchiveProjectType[] }

export const ArchiveView = ({ archiveProjects }: Props) => {
    const { isMobile } = useBreakpoint();
    const [showLightBox, setShowLightBox] = useState(false);
    const [selectedProject, setSelectedProject] = useState<number>(0);

    const total = archiveProjects.length

    const goNext = useCallback(() => {
        setSelectedProject(prev => {
            const i = typeof prev === "number" ? prev : 0
            return (i + 1) % total
        })
    }, [total])

    const goPrev = useCallback(() => {
        setSelectedProject(prev => {
            const i = typeof prev === "number" ? prev : 0
            return (i - 1 + total) % total
        })
    }, [total])

    if (!archiveProjects?.length) return null

    const handleLightBoxOpen = (projectIndex: number) => {
        setShowLightBox(true);
        setSelectedProject(projectIndex);
    }

    if (isMobile) return (
        <div className='sm:hidden grid grid-cols-8 h-[100dvh] p-[20px] pt-[80px] gap-y-[20px]'>
            <div className="col-start-1 col-span-8">
                <ul className="grid gap-y-[20px]">
                    {archiveProjects.map((project, index) => {
                        const img = project.image;
                        const alt = img?.alt || project.title
                        const src = img ? urlFor(img).width(800).url() : ""
                        const aspect = img?.width && img?.height ? `${img.width} / ${img.height}` : "4 / 3"

                        return (
                            <li key={project._id} onClick={() => handleLightBoxOpen(index)} className="cursor-pointer">
                                <div className="relative w-full overflow-hidden"
                                    style={{ aspectRatio: aspect }}>
                                    {img && (
                                        <Image
                                            src={src}
                                            alt={alt}
                                            fill
                                            sizes="(max-width:768px) 50vw, (max-width:1280px) 25vw, 20vw"
                                            placeholder={img.blurDataURL ? "blur" : "empty"}
                                            blurDataURL={img.blurDataURL}
                                            className="object-cover"
                                            loading="lazy"
                                        />
                                    )}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )

    return (
        <div className="hidden w-screen h-screen sm:grid sm:grid-cols-24 p-[24px]">
            <div className="col-start-7 col-span-18">
                <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[60px] gap-y-[65px]">
                    {archiveProjects.map((project, index) => {
                        const img = project.image;
                        const alt = img?.alt || project.title
                        const src = img ? urlFor(img).width(800).url() : ""
                        const aspect = img?.width && img?.height ? `${img.width} / ${img.height}` : "4 / 3"

                        return (
                            <li key={project._id} onClick={() => handleLightBoxOpen(index)}>
                                <div className="relative w-full overflow-hidden"
                                    style={{ aspectRatio: aspect }}>
                                    {img && (
                                        <Image
                                            src={src}
                                            alt={alt}
                                            fill
                                            sizes="(max-width:768px) 50vw, (max-width:1280px) 25vw, 20vw"
                                            placeholder={img.blurDataURL ? "blur" : "empty"}
                                            blurDataURL={img.blurDataURL}
                                            className="object-cover"
                                            loading="lazy"
                                        />
                                    )}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>

            {showLightBox && selectedProject !== null && (
                <ArchiveLightBox
                    close={() => setShowLightBox(false)}
                >
                    <ArchiveProject
                        onNext={goNext}
                        onPrev={goPrev}
                        archiveProject={archiveProjects[selectedProject] as ArchiveProjectType}
                    />
                </ArchiveLightBox>
            )}
        </div>
    )
}

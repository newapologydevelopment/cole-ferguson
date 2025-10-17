'use client'

import { ArchiveProject as ArchiveProjectType } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"
import Image from "next/image"
import { useCallback, useState } from "react"
import { ArchiveProject, LightBox } from "../components"

type Props = { archiveProjects: ArchiveProjectType[] }

export const ArchiveView = ({ archiveProjects }: Props) => {
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

    return (
        <div className="w-screen h-screen grid grid-cols-24 p-[24px]">
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
                <LightBox close={() => setShowLightBox(false)}>
                    <ArchiveProject
                        onNext={goNext}
                        onPrev={goPrev}
                        archiveProject={archiveProjects[selectedProject] as ArchiveProjectType}
                    />
                </LightBox>
            )}
        </div>
    )
}

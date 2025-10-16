'use client'

import { ArchiveProject as ArchiveProjectType } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"
import Image from "next/image"
import { useState } from "react"
import { ArchiveProject, LightBox } from "../components"

type Props = { archiveProjects: ArchiveProjectType[] }

export const ArchiveView = ({ archiveProjects }: Props) => {
    const [showLightBox, setShowLightBox] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ArchiveProjectType | null>(null);
    if (!archiveProjects?.length) return null

    const handleLightBoxOpen = (project: ArchiveProjectType) => {
        setShowLightBox(true);
        setSelectedProject(project);
    }

    return (
        <div className="w-screen h-screen grid grid-cols-24 p-[24px]">
            <div className="col-start-7 col-span-18">
                <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[60px] gap-y-[65px]">
                    {archiveProjects.map((project) => {
                        const img = project.image;
                        const alt = img?.alt || project.title
                        const src = img ? urlFor(img).width(800).url() : ""
                        const aspect = img?.width && img?.height ? `${img.width} / ${img.height}` : "4 / 3"

                        return (
                            <li key={project._id} onClick={() => handleLightBoxOpen(project)}>
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
                                {/* <h3 className="mt-2 text-sm">{p.title}</h3> */}
                            </li>
                        )
                    })}
                </ul>
            </div>

            {showLightBox && selectedProject && (
                <LightBox close={() => setShowLightBox(false)}>
                    <ArchiveProject
                        archiveProject={selectedProject}
                    />
                </LightBox>
            )}
        </div>
    )
}

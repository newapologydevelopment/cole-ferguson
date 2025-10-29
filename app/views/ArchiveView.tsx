'use client'

import { ArchiveProject as ArchiveProjectType } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"
import { cn } from "@/utils"
import Image from "next/image"
import { useCallback, useState } from "react"
import { ArchiveLightBox, ArchiveProject } from "../components"
import { useBreakpoint, useScrollToTop } from "../hooks"

type Props = { archiveProjects: ArchiveProjectType[] }

export const ArchiveView = ({ archiveProjects }: Props) => {
    const { isMobile } = useBreakpoint();
    const [showLightBox, setShowLightBox] = useState(false);
    const [selectedProject, setSelectedProject] = useState<number>(0);
    const [gridMode, setGridMode] = useState<1 | 2 | 4>(1); // 🔁 1 / 2 / 4

    const total = archiveProjects.length;
    useScrollToTop();

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

    // 🧱 утиліти для класів
    const itemSpan =
        gridMode === 1 ? 'col-span-8' :
            gridMode === 2 ? 'col-span-4' :
                'col-span-2';

    if (isMobile) return (
        <div className="relative sm:hidden">

            <div className="fixed top-[48px] left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-[21px] text-[12px] text-primary-dark sm:hidden">
                <span>Columns</span>

                <div className="flex gap-[10px]" role="tablist" aria-label="Columns">
                    {[1, 2, 4].map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => setGridMode(n as 1 | 2 | 4)}
                            className="relative inline-flex px-[2px]"
                        >
                            <span
                                className={cn(
                                    "relative inline-block leading-none pb-[5px] transition-transform",
                                    {
                                        "after:content-[''] after:absolute after:left-[-2px] after:right-[-2px] after:bottom-0 after:h-[1px] after:bg-primary-dark -translate-y-[2px]":
                                            gridMode === n,
                                    }
                                )}
                            >
                                {n}
                            </span>
                        </button>
                    ))}
                </div>
            </div>


            {/* 📸 Грід на 8 колонок; елементи мають span 8/4/2 */}
            <div className="grid grid-cols-8 gap-x-[20px] gap-y-[20px] px-[20px] pb-[20px] items-start">
                {archiveProjects.map((project, index) => {
                    const img = project.image;
                    const alt = img?.alt || project.title
                    const src = img ? urlFor(img).width(800).url() : ""
                    const aspect = img?.width && img?.height ? `${img.width} / ${img.height}` : "4 / 3"

                    return (
                        <button
                            key={project._id}
                            type="button"
                            onClick={() => handleLightBoxOpen(index)}
                            className={`cursor-pointer ${itemSpan}`}
                        >
                            <div className="relative w-full overflow-hidden" style={{ aspectRatio: aspect }}>
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
                        </button>
                    )
                })}
            </div>

            {showLightBox && selectedProject !== null && (
                <ArchiveLightBox close={() => setShowLightBox(false)}>
                    <ArchiveProject
                        onNext={goNext}
                        onPrev={goPrev}
                        archiveProject={archiveProjects[selectedProject] as ArchiveProjectType}
                    />
                </ArchiveLightBox>
            )}
        </div>
    )

    // 🖥️ Десктоп без змін
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
                                <div className="relative w-full overflow-hidden" style={{ aspectRatio: aspect }}>
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
                <ArchiveLightBox close={() => setShowLightBox(false)}>
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

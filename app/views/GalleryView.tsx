'use client'

import { urlFor } from '@/sanity/lib/image';
import { Project as ProjectType } from '@/types';
import { cn, collectAllImages } from "@/utils";
import Image from 'next/image';
import { useState } from "react";

export const projectsMock: { title: string, images: number }[] = [
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Swell", images: 9 },
    { title: "Aiden—Swim", images: 4 },
    { title: "Oscars", images: 12 },
    { title: "By/ Rosie Jane Fragrances", images: 12 },
    { title: "Aiden—Swim", images: 4 },
    { title: "Severson boards", images: 5 },
    { title: "Oscars", images: 3 },
    { title: "Shawn Mendes—Heart Of Gold", images: 4 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Swell", images: 9 },
    { title: "Severson boards", images: 5 },
    { title: "Oscars", images: 3 },
    { title: "Shawn Mendes—Heart Of Gold", images: 4 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Aiden—Swim", images: 4 },
    { title: "Swell", images: 9 },
    { title: "By/ Rosie Jane Fragrances", images: 12 },
    { title: "Severson boards", images: 5 },
    { title: "Oscars", images: 3 },
    { title: "Shawn Mendes—Heart Of Gold", images: 4 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Oscars", images: 3 },
    { title: "Shawn Mendes—Heart Of Gold", images: 4 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Aiden—Swim", images: 4 },
    { title: "Swell", images: 9 },
    { title: "By/ Rosie Jane Fragrances", images: 12 },
    { title: "Severson boards", images: 5 },
    { title: "Oscars", images: 3 },
    { title: "Shawn Mendes—Heart Of Gold", images: 4 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Aiden—Swim", images: 4 },
    { title: "Swell", images: 9 },
    { title: "By/ Rosie Jane Fragrances", images: 12 },
    { title: "Severson boards", images: 5 },
    { title: "Oscars", images: 3 },
    { title: "Shawn Mendes—Heart Of Gold", images: 4 },
    { title: "Dodgers—ESPN", images: 7 },
];



export const GalleryView = ({ projects }: { projects: ProjectType[] }) => {
    const [view, setView] = useState('grid');
    const allImages = collectAllImages(projects);

    return (
        <div className="w-full h-full grid grid-cols-24 text-[12px] text-primary-dark p-[24px]">
            <div className="fixed z-[2] top-[50%] translate-y-[-25%] flex gap-[15px] translate-y-[-50%]">
                <div className={cn("cursor-pointer", {
                    'underline underline-offset-[4px] translate-y-[-4px]': view === 'grid'
                })}
                    onClick={() => setView('grid')}>
                    Grid
                </div>
                <div
                    className={cn("cursor-pointer", {
                        'underline underline-offset-[4px] translate-y-[-4px]': view === 'list'
                    })}
                    onClick={() => setView('list')}>
                    List
                </div>
            </div>

            {view === 'list' && (
                <div className="relative col-span-4 col-start-3 self-center h-[60vh] min-h-0 flex flex-col">
                    <div className="flex items-center justify-between mb-[30px] shrink-0">
                        <p>All</p>
                        <div>{projectsMock.reduce((acc, p) => acc + p.images, 0)}</div>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
                        <div className="flex flex-col gap-[7px]">
                            {projectsMock.map((project, i) => (
                                <div key={project.title + i} className="flex items-center justify-between">
                                    <div>{project.title}</div>
                                    <div>{project.images}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 bottom-[32px]  h-[47px]
                  bg-gradient-to-t from-white to-transparent z-10" />
                    <div className="flex items-center justify-between mt-[20px] shrink-0">
                        <p>Archive</p>
                        <div>{projects.length}</div>
                    </div>
                </div>
            )}
            {view === 'grid' &&
                <div className="col-start-7  col-span-full h-full">
                    <div className="w-full h-full grid grid-cols-6 row-gap-[60px] gap-x-[100px] gap-y-[100px]">
                        {[...allImages, ...allImages].map((it, i) => {
                            const ref = it.image?.asset?._ref
                            if (!ref) return null

                            const w = it.image?.width || 1
                            const h = it.image?.height || 1
                            const thumbW = 130
                            const thumbH = Math.round((thumbW * h) / w)

                            const src = urlFor({ _type: 'image', asset: { _ref: ref } })
                                .width(thumbW)
                                .auto('format')
                                .quality(70)
                                .url()

                            return (
                                <div key={`${it.projectId}-${i}`} className="relative flex flex-col items-center gap-[5.22px]">
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
                                    <p className='text-center text-[10px]'>{it.displayLabel}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            }
            {view === 'list' && <div className="bg-yellow-500 col-start-12 col-span-full h-full">
                <div className="w-full h-full bg-red-500"></div>
            </div>}
        </div>
    )
}
'use client'

import { urlFor } from '@/sanity/lib/image'
import type { Project as ProjectType } from "@/types/project"
import Image from 'next/image'

export const Project = ({ project }: { project: ProjectType }) => {
    const img = project.images?.[0]
    const src = img ? urlFor(img).url() : undefined
    const width = img?.width ?? 1600
    const height = img?.height ?? 1067
    const alt = img?.alt ?? project.title

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    placeholder={img?.blurDataURL ? 'blur' : 'empty'}
                    blurDataURL={img?.blurDataURL}
                    className="max-w-[60vw] max-h-[60vh] w-auto h-auto object-contain"
                    priority
                />
            ) : (
                <div>{project.title}</div>
            )}
        </div>
    )
}

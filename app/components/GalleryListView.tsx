import { urlFor } from "@/sanity/lib/image";
import type { Project } from "@/types/project";
import Image from "next/image";

type Props = {
    project: Project | null
    thumbWidth?: number
}

export const GalleryListView = ({ project, thumbWidth = 800 }: Props) => {
    const image =
        project?.views?.[0]?.images?.[0] ??
        (project?.images?.length ? project.images[0] : null)

    if (!image) return null

    const alt = image.alt || project?.title || "Project image"

    const aspectRatio =
        image.width && image.height ? `${image.width} / ${image.height}` : "16 / 10"

    const src = urlFor(image).width(thumbWidth).url()

    return (
        <div className="relative w-full max-h-[calc(100vh-48px)]" style={{ aspectRatio }}>
            <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                placeholder={image.blurDataURL ? "blur" : "empty"}
                blurDataURL={image.blurDataURL}
                className="object-cover"
                loading="lazy"
            />
        </div>
    )
}

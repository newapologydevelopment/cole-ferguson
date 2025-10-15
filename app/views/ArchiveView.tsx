import { ArchiveProject } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"

import Image from "next/image"

type Props = { archiveProjects: ArchiveProject[] }

export const ArchiveView = ({ archiveProjects }: Props) => {
    if (!archiveProjects?.length) return null

    return (
        <div className="w-screen h-screen grid grid-cols-24 p-[24px]">
            <div className="col-start-7 col-span-18">
                <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {archiveProjects.map((p) => {
                        const img = p.image;
                        const alt = img?.alt || p.title
                        const src = img ? urlFor(img).width(800).url() : ""
                        const aspect = img?.width && img?.height ? `${img.width} / ${img.height}` : "4 / 3"

                        return (
                            <li key={p._id}>
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
                                <h3 className="mt-2 text-sm">{p.title}</h3>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}

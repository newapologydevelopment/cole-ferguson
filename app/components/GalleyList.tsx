import { Project } from "@/types";
import { cn } from "@/utils";
import Link from "next/link";

export type GalleryListItem = { title: string; images: number }

type Props = {
    items: Project[]
    archiveCount: number
    className?: string
    onHoverProject?: (project: Project | null) => void
}

export const GalleyList = ({ items, archiveCount, className, onHoverProject }: Props) => {
    const allProjects = items.map(project => {
        const allImages = project.views?.flatMap(v => v.images) || []
        return { ...project, imageCount: allImages.length }
    })

    return (
        <div className={cn("relative col-span-4 col-start-3 self-center h-[60vh] min-h-0 flex flex-col", className)}>
            <div className="flex items-center justify-between mb-[30px] shrink-0">
                <p>All</p>
                <div>{allProjects.length}</div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
                <div className="flex flex-col gap-[7px]">
                    {allProjects.map((project, i) => (
                        <div
                            key={project.title + i}
                            className="flex items-center justify-between cursor-pointer"
                            onMouseEnter={() => onHoverProject?.(project as Project)}
                        >
                            <div>{project.title}</div>
                            <div>{project.imageCount}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-[32px] h-[47px] bg-gradient-to-t from-white to-transparent z-10" />
            <div className="flex items-center justify-between mt-[20px] shrink-0">
                <Link href="/archive">Archive</Link>
                <div>{archiveCount}</div>
            </div>
        </div>
    )
}

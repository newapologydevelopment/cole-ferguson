import { getArchiveCount, getProjects } from "@/sanity/lib/client";

import { GalleryView } from "../views";

export default async function Gallery() {
    const [projects, archiveCount] = await Promise.all([
        getProjects(),
        getArchiveCount(),
    ]);
    return (
        <div className="w-screen h-screen">
            <GalleryView projects={projects} archiveCount={archiveCount} />
        </div>
    )
}

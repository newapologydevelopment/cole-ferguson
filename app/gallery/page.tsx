import { getArchiveCountCached, getProjectsCached } from "@/sanity/lib/client";

import { GalleryView } from "../views";

export default async function Gallery() {
    const projects = await getProjectsCached();
    const archiveCount = await getArchiveCountCached();
    return (
        <div className="w-screen h-screen">
            <GalleryView projects={projects} archiveCount={archiveCount} />
        </div>
    )
}

import { getProjectsCached } from "@/sanity/lib/client";

import { GalleryView } from "../views";

export default async function Gallery() {
    const projects = await getProjectsCached();
    return (
        <div className="w-screen h-screen">
            <GalleryView projects={projects} />
        </div>
    )
}

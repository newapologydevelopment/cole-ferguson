import { ArchiveProject as ArchiveProjectType } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";

interface Props {
    archiveProject: ArchiveProjectType;
}
export const ArchiveProject: React.FC<Props> = ({ archiveProject }) => {

    return (
        <div className="relative w-full h-full items-center justify-center flex">
            <h1 className="absolute top-24 text-center w-full">{archiveProject.title}</h1>
            <Image
                src={urlFor(archiveProject.image).width(800).height(600).url()}
                alt={archiveProject.image.alt || archiveProject.title}
                width={575}
                height={724}
                className="object-cover" />
        </div>
    )
}

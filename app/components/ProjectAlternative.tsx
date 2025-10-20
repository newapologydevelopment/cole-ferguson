// import { urlFor } from "@/sanity/lib/image";
import { Project as ProjectType } from "@/types/project";
// import Image from "next/image";

interface Props {
    project: ProjectType
}

export const ProjectAlternative: React.FC<Props> = ({ project }) => {
    // const singleView = project.views?.find((view) => view._type === 'singleView')?.images;
    // const src = singleView?.[0]?.asset?.url ? urlFor(singleView?.[0]?.asset?.url).url() : '';
    return (
        <div className="w-full h-full flex items-center justify-center">
            {project.title}
            {/* <div className="w-[63vw] h-full">
                <Image
                    src={src}
                    alt={singleView?.[0]?.alt}
                    fill
                />
            </div> */}
        </div>
    )
}

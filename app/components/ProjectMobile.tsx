import { Project as ProjectType } from "@/types"

interface Props {
    project: ProjectType
}
export const ProjectMobile: React.FC<Props> = ({ project }) => {
    return (
        <div className="p-[20px] sm:hidden flex justify-center items-center h-[100dvh]">{project.title}</div>
    )
}

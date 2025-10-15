'use client'

import { Project as ProjectType } from "@/types";
import { Project } from "../components";

interface ProjectViewProps {
    project: ProjectType
}

export const ProjectView: React.FC<ProjectViewProps> = ({ project }) => {
    return (
        <div className="w-screen h-screen p-[24px]">
            <div className="fixed z-[2] top-[50%] translate-y-[-25%] mt-[16px] flex flex-col gap-[8px]">
                <h1 className="text-[12px]">{project.title}</h1>
            </div>
            <div>
                <Project project={project} />
            </div>
        </div >
    )
};

'use client'

import { Project as ProjectType } from '@/types';
import { cn, collectAllImages } from "@/utils";
import { useState } from "react";
import { GalleryGridView, GalleryListView, GalleyList, LightBox, Project } from '../components';

export const projectsMock: { title: string, images: number }[] = [
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Swell", images: 9 },
    { title: "Aiden—Swim", images: 4 },
    { title: "Oscars", images: 12 },
    { title: "By/ Rosie Jane Fragrances", images: 12 },
    { title: "Aiden—Swim", images: 4 },
    { title: "Severson boards", images: 5 },
    { title: "Oscars", images: 3 },
    { title: "Shawn Mendes—Heart Of Gold", images: 4 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Swell", images: 9 },
    { title: "Severson boards", images: 5 },
    { title: "Oscars", images: 3 },
    { title: "Shawn Mendes—Heart Of Gold", images: 4 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Aiden—Swim", images: 4 },
    { title: "Swell", images: 9 },
    { title: "By/ Rosie Jane Fragrances", images: 12 },
    { title: "Severson boards", images: 5 },
    { title: "Oscars", images: 3 },
    { title: "Shawn Mendes—Heart Of Gold", images: 4 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Oscars", images: 3 },
    { title: "Shawn Mendes—Heart Of Gold", images: 4 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Aiden—Swim", images: 4 },
    { title: "Swell", images: 9 },
    { title: "By/ Rosie Jane Fragrances", images: 12 },
    { title: "Severson boards", images: 5 },
    { title: "Oscars", images: 3 },
    { title: "Shawn Mendes—Heart Of Gold", images: 4 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Dodgers—ESPN", images: 7 },
    { title: "Aiden—Swim", images: 4 },
    { title: "Swell", images: 9 },
    { title: "By/ Rosie Jane Fragrances", images: 12 },
    { title: "Severson boards", images: 5 },
    { title: "Oscars", images: 3 },
    { title: "Shawn Mendes—Heart Of Gold", images: 4 },
    { title: "Dodgers—ESPN", images: 7 },
];

export const GalleryView = ({ projects, archiveCount = 0 }: { projects: ProjectType[]; archiveCount?: number }) => {
    const [view, setView] = useState('grid');
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [lightBoxOpen, setLightBoxOpen] = useState(false);
    const [listViewSelectedProject, setListViewSelectedProject] = useState<ProjectType | null>(projects[0]);
    const [actualPhoto, setActualPhoto] = useState<string | null>(null);
    const allImages = collectAllImages(projects);

    const handleLightBoxOpen = (project: ProjectType) => {
        setLightBoxOpen(!lightBoxOpen);

        if (project) {
            setListViewSelectedProject(projects.find(p => p._id === project._id) as ProjectType);
        }
    }

    return (
        <div className="w-full h-full grid grid-cols-24 text-[12px] text-primary-dark p-[24px]">
            <div className="fixed z-[2] top-[50%] translate-y-[-25%] flex gap-[15px] translate-y-[-50%]">
                <div className={cn("cursor-pointer", {
                    'underline underline-offset-[4px] translate-y-[-4px]': view === 'grid'
                })}
                    onClick={() => setView('grid')}>
                    Grid
                </div>
                <div
                    className={cn("cursor-pointer", {
                        'underline underline-offset-[4px] translate-y-[-4px]': view === 'list'
                    })}
                    onClick={() => setView('list')}>
                    List
                </div>
            </div>

            {view === 'list' && (
                <GalleyList
                    items={projects}
                    archiveCount={archiveCount}
                    onHoverProject={(project) => setListViewSelectedProject(project)}
                    onClick={handleLightBoxOpen}
                />
            )}

            {view === 'grid' &&
                <GalleryGridView
                    items={allImages}
                    projects={projects}
                    selectedProject={selectedProject}
                    onHoverProject={setSelectedProject}
                    onClick={handleLightBoxOpen}
                    selectActualPhoto={setActualPhoto}
                />
            }

            {view === 'list' &&
                <div className=" col-start-12 col-span-13 h-ful flex items-center justify-center">
                    <GalleryListView
                        project={listViewSelectedProject}
                        thumbWidth={260}
                    />
                </div>
            }

            {lightBoxOpen &&
                <LightBox close={() => setLightBoxOpen(false)}>
                    <Project
                        actualPhoto={actualPhoto}
                        project={listViewSelectedProject as unknown as ProjectType}
                    />
                </LightBox>
            }
        </div>
    )
}
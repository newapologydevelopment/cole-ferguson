'use client'

import { Project as ProjectType } from '@/types';
import { cn, collectAllImages } from "@/utils";
import { useState } from "react";
import { GalleryGridView, GalleryListView, GalleyList } from '../components';

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
    const [listViewSelectedProject, setListViewSelectedProject] = useState<ProjectType | null>(projects[0]);
    const allImages = collectAllImages(projects);

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
                />
            )}

            {view === 'grid' &&
                <GalleryGridView
                    items={allImages}
                    selectedProject={selectedProject}
                    onHoverProject={setSelectedProject}
                />
            }

            {view === 'list' &&
                <div className=" col-start-12 col-span-13 h-ful flex items-center justify-center">
                    <GalleryListView
                        project={listViewSelectedProject}
                        thumbWidth={260}
                    />
                </div>}
        </div>
    )
}
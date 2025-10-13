'use client'

import { cn } from "@/utils";
import { useState } from "react";

export const projects = [
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
];

export const GalleryView = () => {
    const [view, setView] = useState('grid');

    return (
        <div className="w-full h-full grid grid-cols-24 text-[12px] text-primary-dark p-[24px]">
            <div className="fixed z-[2] top-[50%] translate-y-[-25%] flex gap-[15px]">
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

            <div className="col-span-4 col-start-3 self-center h-[60vh]">
                <div className="flex items-center justify-between mb-[30px]">
                    <p>All</p>
                    <div>{projects.reduce((acc, project) => acc + project.images, 0)}</div>
                </div>

                <div className="flex flex-col gap-[7px] max-h-[56vh] overflow-y-auto">{projects.map((project, index) => (
                    <div key={project.title + index} className="flex items-center justify-between">
                        <div>{project.title}</div>
                        <div>{project.images}</div>
                    </div>
                ))}</div>

                <div className="flex items-center justify-between mt-[30px]">
                    <p>Archive</p>
                    <div>{projects.length}</div>
                </div>
            </div>
        </div>
    )
}
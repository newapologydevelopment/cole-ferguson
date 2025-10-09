'use client';

import { NavigationHomePage, Project } from "@/app/components";
import { Project as ProjectType } from '@/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const Home = ({ projects }: { projects: ProjectType[] }) => {
    const projectTitles = useMemo(() => projects.map((p) => p.title), [projects]);

    console.log('projects', projects)

    const scrollRef = useRef<HTMLDivElement | null>(null)
    const sectionRefs = useRef<(HTMLElement | null)[]>([])
    const [activeIndex, setActiveIndex] = useState(0)
    const [showAll, setShowAll] = useState(false)

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return

        const onScroll = () => {
            const y = el.scrollTop
            const idx = Math.round(y / window.innerHeight)
            setActiveIndex(Math.max(0, Math.min(projects.length - 1, idx)))
        }
        el.addEventListener('scroll', onScroll, { passive: true })
        onScroll()
        return () => el.removeEventListener('scroll', onScroll)
    }, [projects.length])

    const handleSelect = useCallback((idx: number) => {
        const el = scrollRef.current
        if (!el) return
        el.scrollTo({ top: idx * window.innerHeight, behavior: 'smooth' })
    }, [])

    return (
        <div className="h-screen overflow-hidden p-[24px] text-[12px] text-primary-dark">
            {/* <h1 className="fixed top-[24px] left-[24px] pointer-events-none">Cole Ferguson </h1> */}

            <div className="fixed z-[2] top-[50%] translate-y-[-25%] mt-[16px] flex flex-col gap-[8px]">
                <NavigationHomePage
                    titles={projectTitles}
                    activeIndex={activeIndex}
                    showAll={showAll}
                    onHoverChange={setShowAll}
                    onSelect={handleSelect}
                />
            </div>

            {/* <div className="fixed z-[3]  md:bottom-[24px] md:left-[24px] bottom-[20px] left-[20px] flex flex-col gap-[8px]">
                <Link href="/gallery" className="cursor-pointer">Index</Link>
                <div>Information</div>
            </div> */}

            <div ref={scrollRef} className="absolute inset-0 overflow-y-auto snap-y snap-mandatory scroll-smooth pointer-events-auto">
                {projects.map((project, i) => (
                    <section
                        key={project._id}
                        ref={(el) => { sectionRefs.current[i] = el }}
                        className={`snap-start h-screen transition-opacity duration-300 ${i === activeIndex || showAll ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <Project project={project} />
                    </section>
                ))}
            </div>
        </div>
    )
}

'use client'

import { client } from '@/sanity/lib/client'
import { cn } from '@/utils'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from '../hooks'
import { LightBox } from './LightBox'

export function InfoShell({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const { isMobile } = useBreakpoint()
    // const [showVideo, setShowVideo] = useState(false)
    const touchStartY = useRef(0)

    // Sanity information (desktop content)
    const [info, setInfo] = useState({
        title: 'Cole is a photographer and director living in Los Angeles, California.',
        clients:
            'Nike, Louis Vuitton, Dior, VEVO, Disney, Island Records, Hollywood Records, Red Bull, Vuori, LifeStraw, Olipop, Whitespace, Guayaki Yerba Mate',
        publications:
            'Vanity Fair, Vogue Greece, HYPEBEAST, Men’s Health, Vman, People Magazine, US Weekly, E News, Surfing Magazine, Complex, RAP',
        contact: 'studio@coleferguson.com\n@coleferguson',
        videoUrl: '',
    })
    const [showVideo, setShowVideo] = useState(false)

    useEffect(() => {
        // fetch once on mount
        client
            .fetch<{ title?: string; clients?: string; publications?: string; contact?: string; video?: string; videoFileUrl?: string }>(
                `*[_type=="information"][0]{ title, clients, publications, contact, video, "videoFileUrl": videoFile.asset->url }`
            )
            .then((doc) => {
                if (!doc) return
                setInfo((prev) => ({
                    title: typeof doc.title === 'string' && doc.title.trim() ? doc.title : prev.title,
                    clients: typeof doc.clients === 'string' ? doc.clients : prev.clients,
                    publications: typeof doc.publications === 'string' ? doc.publications : prev.publications,
                    contact: typeof doc.contact === 'string' ? doc.contact : prev.contact,
                    videoUrl: (doc.video && doc.video.trim()) || (doc.videoFileUrl && doc.videoFileUrl.trim()) || prev.videoUrl,
                }))
            })
            .catch(() => { })
    }, [])

    useEffect(() => {
        if (open) window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, [open])

    // External control from MenuMobile (tablet): listen custom events
    useEffect(() => {
        const openHandler = () => setOpen(true)
        const closeHandler = () => setOpen(false)
        const toggleHandler = () => setOpen(o => !o)
        window.addEventListener('infoshell:open', openHandler as EventListener)
        window.addEventListener('infoshell:close', closeHandler as EventListener)
        window.addEventListener('infoshell:toggle', toggleHandler as EventListener)
        return () => {
            window.removeEventListener('infoshell:open', openHandler as EventListener)
            window.removeEventListener('infoshell:close', closeHandler as EventListener)
            window.removeEventListener('infoshell:toggle', toggleHandler as EventListener)
        }
    }, [])

    useEffect(() => {
        if (!open) return
        const onWheel = (e: WheelEvent) => { if (e.deltaY !== 0) setOpen(false) }
        const onTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY }
        const onTouchMove = (e: TouchEvent) => {
            const dy = e.touches[0].clientY - touchStartY.current
            if (Math.abs(dy) > 8) setOpen(false)
        }
        window.addEventListener('wheel', onWheel, { passive: true })
        window.addEventListener('touchstart', onTouchStart, { passive: true })
        window.addEventListener('touchmove', onTouchMove, { passive: true })
        return () => {
            window.removeEventListener('wheel', onWheel)
            window.removeEventListener('touchstart', onTouchStart)
            window.removeEventListener('touchmove', onTouchMove)
        }
    }, [open])

    useGSAP(() => {

        const tl = gsap.timeline();
        tl.
            to('.text', {
                height: open ? '48vh' : '0',
                ease: 'power2.inOut'
            }, '<')
            .to('.text-info', {
                opacity: open ? 1 : 0,
                duration: 0.5,
                ease: 'power2.inOut'
            }, '<')
            .to('.text-btn', {
                paddingTop: open ? '38vh' : '0',
                duration: 0.5,
                ease: 'power2.inOut'
            }, '<')

        // Animate Index button to stop under the brand header when information opens
        const indexContainer = document.querySelector('[data-index-container]') as HTMLElement | null
        const brandHeader = document.querySelector('[data-brand-header]') as HTMLElement | null
        if (indexContainer && brandHeader) {
            if (open) {
                const headerBottom = brandHeader.getBoundingClientRect().bottom
                const indexRect = indexContainer.getBoundingClientRect()
                const wrapperDelta = -0.8 * window.innerHeight // matches -translate-y-[80vh]
                const gap = 8 // px spacing under the title
                const targetTop = headerBottom + gap
                const finalWithoutExtra = indexRect.top + wrapperDelta
                const extraDelta = targetTop - finalWithoutExtra

                gsap.set(indexContainer, { zIndex: 40 })
                gsap.to(indexContainer, {
                    y: extraDelta,
                    duration: 0.5,
                    ease: 'power2.inOut'
                })
            } else {
                gsap.to(indexContainer, {
                    y: 0,
                    duration: 0.5,
                    ease: 'power2.inOut',
                    onComplete: () => { gsap.set(indexContainer, { zIndex: 3 }) }
                })
            }
        }

    }, [open])

    if (isMobile) return (
        <div className='sm:hidden p-20px'>
            {children}
        </div>
    )

    return (
        <>
            <div className="relative" >
                <div className={cn('transition-transform duration-500', {
                    '-translate-y-[80vh]': open,
                    'pointer-events-none': open
                })}>
                    {children}
                </div>

                <div
                    className="fixed left-0 right-0 bottom-0 transition-[height] duration-500 cursor-pointer z-[30] hidden sm:block"
                    style={{ height: open ? '88vh' : '40px' }}
                    onClick={() => setOpen(o => !o)}
                    aria-expanded={open}
                    role="button"
                    data-hide-cursor="true"
                >
                    <div className="h-full overflow-auto px-[24px] bg-white text-left text-[12px] text-primary-dark hidden sm:block">
                        <div className="pt-[-24px] text-btn hidden xl:block" data-hide-cursor="true">Information</div>

                        <div className="h-[50vh] absolute left-0 right-0 bottom-[24px] grid grid-cols-8  px-[24px] text">
                            <div className="sm:col-start-1 xl:col-start-2 col-end-[-1] flex flex-col justify-between text-info opacity-0">
                                <h1 className="text-[64px] leading-[115%] whitespace-pre-line">
                                    {info.title}
                                </h1>

                                <div className="grid grid-cols-20 gap-x-[32px]">
                                    <div className="col-start-1 col-span-5 flex flex-col gap-[12px] self-end">
                                        <h3>Clients</h3>
                                        <p className="text-[16px] whitespace-pre-line">
                                            {info.clients}
                                        </p>
                                    </div>

                                    <div className="col-span-5 col-start-7 flex flex-col gap-[12px] self-end">
                                        <h3>Publications</h3>
                                        <p className="text-[16px] whitespace-pre-line">
                                            {info.publications}
                                        </p>
                                    </div>

                                    <div className="col-span-3 col-start-13 flex flex-col justify-between self-end min-h-[124px]">
                                        <h3>Contact</h3>
                                        <p className="text-[16px] whitespace-pre-line">
                                            {info.contact}
                                        </p>
                                    </div>

                                    <button
                                        type='button'
                                        className='col-span-3 col-start-18 bg-blue-500 h-[145px] relative z-[60] pointer-events-auto'
                                        onClick={() => setShowVideo(true)}
                                    >
                                        <Image src="/video-mock.png" alt="Cole Ferguson Studio" fill className='object-cover' />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showVideo && info.videoUrl && (
                <LightBox close={() => setShowVideo(false)} title="">
                    <div className='flex items-center justify-center w-full'>
                        <div style={{ width: '46vw', aspectRatio: '4 / 3', position: 'relative', }}>
                            <video
                                src={info.videoUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                controls
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div className='text-[#717171] pt-[6px]'>Video by Samuel Lang</div>
                        </div>
                    </div>
                </LightBox>
            )}
        </>
    )
}

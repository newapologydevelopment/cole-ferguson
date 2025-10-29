'use client'

import { cn } from '@/utils'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from '../hooks'

export function InfoShell({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const { isMobile } = useBreakpoint()
    // const [showVideo, setShowVideo] = useState(false)
    const touchStartY = useRef(0)

    useEffect(() => {
        if (open) window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, [open])

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
                <div className="h-full overflow-auto px-[24px] text-left text-[12px] text-primary-dark">
                    <div className="pt-[-24px] text-btn hidden sm:block" data-hide-cursor="true">Information</div>

                    <div className="h-[50vh] absolute left-0 right-0 bottom-[24px]  grid grid-cols-8  px-[24px] text">
                        <div className="col-start-2 col-end-[-1] flex flex-col justify-between text-info opacity-0">
                            <h1 className="text-[64px] leading-[115%]">
                                Cole is a photographer and director living in Los Angeles, California.
                            </h1>

                            <div className="grid grid-cols-8 gap-x-[32px]">
                                <div className="col-span-2 flex flex-col gap-[12px] self-end">
                                    <h3>Clients</h3>
                                    <p className="text-[16px]">
                                        Nike, Louis Vuitton, Dior, VEVO, Disney, Island Records, Hollywood Records,
                                        Red Bull, Vuori, LifeStraw, Olipop, Whitespace, Guayaki Yerba Mate
                                    </p>
                                </div>

                                <div className="col-span-2 col-start-3 flex flex-col gap-[12px] self-end">
                                    <h3>Publications</h3>
                                    <p className="text-[16px]">
                                        Vanity Fair, Vogue Greece, HYPEBEAST, Men’s Health, Vman, People Magazine,
                                        US Weekly, E News, Surfing Magazine, Complex, RAP
                                    </p>
                                </div>

                                <div className="col-span-2 col-start-5 flex flex-col justify-between self-end">
                                    <h3>Contact</h3>
                                    <p className="text-[16px]">
                                        studio@coleferguson.com <br /> @coleferguson
                                    </p>
                                </div>

                                <div className='col-span-3 col-start-8 bg-blue-500 h-[145px] relative'
                                // onClick={() => setShowVideo(showVideo => !showVideo)}
                                >
                                    <Image src="/video-mock.png" alt="Cole Ferguson Studio" fill className='object-cover' />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

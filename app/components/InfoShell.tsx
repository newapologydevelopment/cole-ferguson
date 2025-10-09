'use client'

import { cn } from '@/utils'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useState } from 'react'

export function InfoShell({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)

    useGSAP(() => {
        const tl = gsap.timeline();
        tl.to('.info-shell', {
            y: open ? '88vh' : '0',
            duration: 0.5,
            ease: 'power2.inOut'
        }).
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
    }, [open])

    return (
        <div className="relative">
            <div className={cn('transition-transform duration-500', {
                '-translate-y-[88vh]': open
            })}>
                {children}
            </div>

            <div
                className="fixed left-0 right-0 bottom-0 transition-[height] duration-500 cursor-pointer z-[30]"
                style={{ height: open ? '88vh' : '40px' }}
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
                role="button"
            >
                <div className="h-full overflow-auto px-[24px] text-left text-[12px] text-primary-dark">
                    <div className="pt-[-24px] text-btn">Information</div>
                    <div className="h-[50vh] absolute left-0 right-0 bottom-[24px]  grid grid-cols-8  px-[24px] text">
                        <div className="col-start-2 col-end-[-1] flex flex-col justify-between text-info opacity-0">
                            <h1 className="text-[64px] leading-[115%]">
                                Cole is a photographer and director living in Los Angeles, California.
                            </h1>

                            <div className="grid grid-cols-8 gap-x-[32px]">
                                <div className="col-span-2 flex flex-col gap-[12px]">
                                    <h3>Clients</h3>
                                    <p className="text-[16px]">
                                        Nike, Louis Vuitton, Dior, VEVO, Disney, Island Records, Hollywood Records,
                                        Red Bull, Vuori, LifeStraw, Olipop, Whitespace, Guayaki Yerba Mate
                                    </p>
                                </div>

                                <div className="col-span-2 col-start-3 flex flex-col gap-[12px]">
                                    <h3>Publications</h3>
                                    <p className="text-[16px]">
                                        Vanity Fair, Vogue Greece, HYPEBEAST, Men’s Health, Vman, People Magazine,
                                        US Weekly, E News, Surfing Magazine, Complex, RAP
                                    </p>
                                </div>

                                <div className="col-span-2 col-start-5 flex flex-col justify-between">
                                    <h3>Contact</h3>
                                    <p className="text-[16px]">
                                        studio@coleferguson.com <br /> @coleferguson
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

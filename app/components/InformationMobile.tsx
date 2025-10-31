"use client"
import { cn } from "@/utils"
import Image from "next/image"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface Props {
    isOpen: boolean
    onClose?: () => void
}

export const InformationMobile: React.FC<Props> = ({ isOpen, onClose }) => {
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])
    if (!mounted) return null

    return createPortal(
        <div
            className={cn(
                "sm:hidden fixed inset-0 bg-white opacity-0 z-[99999] pointer-events-none transition-opacity duration-900 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
                { "opacity-100 pointer-events-auto": isOpen }
            )}
            style={{ willChange: 'opacity' }}
            onClick={onClose}
        >
            <button
                type="button"
                aria-label="Close information"
                onClick={(e) => { e.stopPropagation(); onClose?.() }}
                className="absolute right-[20px] top-[20px] z-[100000]"
            >
                Close
            </button>
            <div
                className="flex flex-col justify-between h-full pt-[80px] px-[20px] pb-[24px] text-[12px]"
                onClick={(e) => e.stopPropagation()}
            >
                <h1
                    className={cn(
                        "text-[21px] leading-[130%] transition-opacity duration-500",
                        isOpen ? "opacity-100" : "opacity-0"
                    )}
                    style={{ transitionDelay: isOpen ? '120ms' : '0ms' }}
                >
                    Cole is a photographer and director living in Los Angeles, California.
                </h1>

                <div
                    className={cn(
                        "flex flex-col gap-[24px] transition-opacity duration-500",
                        isOpen ? "opacity-100" : "opacity-0"
                    )}
                    style={{ transitionDelay: isOpen ? '200ms' : '0ms' }}
                >
                    <div className="grid grid-cols-8">
                        <h3 className="col-span-2">Clients</h3>
                        <p className="col-start-3 col-span-full">
                            Nike, Louis Vuitton, Dior, VEVO, Disney, Island Records, Hollywood Records,
                            Red Bull, Vuori, LifeStraw, Olipop, Whitespace, Guayaki Yerba Mate
                        </p>
                    </div>

                    <div className="grid grid-cols-8">
                        <h3 className="col-span-2">Publications</h3>
                        <p className="col-start-3 col-span-full">
                            Vanity Fair, Vogue Greece, HYPEBEAST, Men’s Health, Vman, People Magazine,
                            US Weekly, E News, Surfing Magazine, Complex, RAP
                        </p>
                    </div>

                    <div className="grid grid-cols-8">
                        <h3 className="col-span-2">Contact</h3>
                        <p className="col-start-3 col-span-full">
                            studio@coleferguson.com <br /> @coleferguson
                        </p>
                    </div>

                    <div
                        className={cn(
                            'grid grid-cols-8 h-[195px] relative transition-opacity duration-500',
                            isOpen ? 'opacity-100' : 'opacity-0'
                        )}
                        style={{ transitionDelay: isOpen ? '280ms' : '0ms' }}
                    >
                        <Image src="/video-mock.png" alt="Cole Ferguson Studio" fill className='object-cover col-start-3 col-span-full' />
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}

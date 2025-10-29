import { cn } from "@/utils"
import Image from "next/image"

interface Props {
    isOpen: boolean
}

export const InformationMobile: React.FC<Props> = ({ isOpen }) => {
    return (
        <div className={cn("sm:hidden relative w-full bg-white h-[0] opacity-0 z-[1] bg-white transition-height duration-600 transition-opacity delay-100", {
            "h-[100dvh] opacity-100  overflow-hidden": isOpen,
        })}>
            <div className="flex flex-col justify-between bg-white h-[100dvh] pt-[80px] px-[20px] pb-[24px] text-[12px]">
                <h1 className="text-[21px] leading-[130%]">
                    Cole is a photographer and director living in Los Angeles, California.
                </h1>

                <div className="flex flex-col gap-[24px]">
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

                    <div className='grid grid-cols-8 h-[195px] relative'
                    >
                        <Image src="/video-mock.png" alt="Cole Ferguson Studio" fill className='object-cover col-start-3 col-span-full' />
                    </div>
                </div>
            </div>
        </div>
    )
}

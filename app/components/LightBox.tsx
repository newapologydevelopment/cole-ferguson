'use client';

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface Props {
    close?: () => void;
    children: React.ReactNode;
}

export const LightBox: React.FC<Props> = ({ close, children }) => {
    useGSAP(() => {
        gsap.to('.light-box', {
            scale: 1,
            ease: 'power1.inOut',
            duration: 0.5,
        })

        const tl = gsap.timeline();
        tl.to('.light-box-title', {
            y: `${-(window.innerHeight / 2) + 32}px`,
            ease: 'power2',
            delay: 1,
            duration: 0.7,
        })

        return () => tl.kill();

    }, []);

    return (
        <div className="light-box text-primary-dark text-[12px] absolute inset-0  bg-white/95 backdrop-blur-md flex items-center justify-center z-100 scale-0">
            <div onClick={close} className="absolute top-[24px] right-[24px] cursor-pointer z-[102]">Close</div>
            <p className="light-box-title absolute top-[24px] text-center w-full">Light Box</p>
            {children}
        </div>
    )
}

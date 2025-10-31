'use client';

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface Props {
    close?: () => void;
    children: React.ReactNode;
}

export const ArchiveLightBox: React.FC<Props> = ({ close, children }) => {
    useGSAP(() => {
        gsap.to('.light-box', {
            scale: 1,
            ease: 'power1.inOut',
            duration: 0.2,
        })
    }, []);

    return (
        <div className="light-box text-primary-dark text-[12px] fixed inset-0 bg-white flex items-center justify-center z-[10060] scale-0">
            <div onClick={close} className="absolute top-[24px] right-[24px] cursor-pointer z-[102]" data-hide-cursor="true">Close</div>
            {children}
        </div>
    )
}
'use client';

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

interface Props {
    title?: string;
    close?: () => void;
    children: React.ReactNode;
}

export const LightBox: React.FC<Props> = ({ close, children, title }) => {
    const boxRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLParagraphElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const tl = gsap.timeline();

        // анімація контейнера (легке появлення)
        tl.fromTo(
            boxRef.current,
            { scale: 0.95, opacity: 0 },
            { scale: 1, opacity: 1, ease: 'power1.inOut', duration: 0.25 }
        );

        // 1) ставимо заголовок у центр (y = від центру до 24px), одразу видно
        const startY = Math.max(0, window.innerHeight / 2 - 24);
        tl.set(titleRef.current, { y: startY, opacity: 1 });

        // 1a) тримаємо заголовок у центрі (паузимо тл на 0.6s)
        tl.to({}, { duration: 0.6 });

        // 2) піднімаємо заголовок до 24px зверху (y: 0)
        tl.to(titleRef.current, {
            y: 0,
            opacity: 1,
            ease: 'power2.out',
            duration: 0.6,
        });

        // контент з'являється наприкінці (або трохи накладаємо)
        tl.fromTo(
            contentRef.current,
            { y: 10, opacity: 0 },
            { y: 0, opacity: 1, ease: 'power2.out', duration: 0.6 },
        );

        return () => {
            document.body.style.overflow = prevOverflow;
        };
    });

    return (
        <div
            ref={boxRef}
            className="light-box fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-md text-primary-dark text-[12px]"
        >
            <button
                type="button"
                onClick={close}
                className="absolute top-6 right-6 z-[102] cursor-pointer"
                aria-label="Close lightbox"
                data-hide-cursor="true"
            >
                Close
            </button>

            {/* ВАЖЛИВО: НІЯКОГО translate-y-[50vh] */}
            <p
                ref={titleRef}
                className="light-box-title absolute top-[24px] left-1/2 -translate-x-1/2 w-full text-center opacity-0 will-change-transform"
            >
                {title}
            </p>

            <div ref={contentRef} className="light-box-content">
                {children}
            </div>
        </div>
    );
};

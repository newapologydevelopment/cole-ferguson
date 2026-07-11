"use client";
import { motion, useReducedMotion } from 'framer-motion';
import React, { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

export const PageTransition: React.FC<Props> = ({ children }) => {
    const reduceMotion = useReducedMotion();
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={{
                initial: { opacity: 0, y: reduceMotion ? 0 : 8 },
                in: { opacity: 1, y: 0 },
                out: { opacity: 1 },
            }}
            transition={{
                duration: reduceMotion ? 0 : 0.65,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {children}
        </motion.div>
    )
}

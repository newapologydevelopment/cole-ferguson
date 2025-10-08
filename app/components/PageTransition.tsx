"use client";
import { motion } from 'framer-motion';
import React, { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

export const PageTransition: React.FC<Props> = ({ children }) => {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={{
                initial: { opacity: 0 },
                in: { opacity: 1 },
                out: { opacity: 1 },
            }}
            transition={{ duration: 1 }}
        >
            {children}
        </motion.div>
    )
}
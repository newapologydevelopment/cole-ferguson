'use client';

import {
  getGridRevealDelay,
  GRID_REVEAL_DURATION,
  GRID_REVEAL_EASE,
  GRID_REVEAL_OFFSET,
} from '@/app/lib/gridReveal';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import Image, { type ImageProps } from 'next/image';
import { useRef, useState } from 'react';
import { usePreloaderDone } from './PreloaderGate';

type GridRevealImageProps = ImageProps & {
  index: number;
  immediate?: boolean;
};

export function GridRevealImage({
  index,
  immediate = false,
  className,
  alt = '',
  onLoad,
  ...props
}: GridRevealImageProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const inView = useInView(wrapperRef, { once: true, margin: '200px 0px' });
  const reduceMotion = useReducedMotion();
  const preloaderDone = usePreloaderDone();
  const skipMotion = immediate || reduceMotion;
  const hasPlaceholder =
    props.placeholder === 'blur' && Boolean(props.blurDataURL);
  const revealed = Boolean(
    skipMotion || (preloaderDone && inView && (loaded || hasPlaceholder))
  );

  return (
    <motion.div
      ref={wrapperRef}
      className="absolute inset-0"
      initial={{
        opacity: skipMotion ? 1 : 0,
        transform: skipMotion
          ? 'translateY(0px)'
          : `translateY(${GRID_REVEAL_OFFSET}px)`,
      }}
      animate={{
        opacity: revealed ? 1 : 0,
        transform: revealed
          ? 'translateY(0px)'
          : `translateY(${GRID_REVEAL_OFFSET}px)`,
      }}
      transition={{
        duration: skipMotion ? 0 : GRID_REVEAL_DURATION,
        delay: skipMotion ? 0 : getGridRevealDelay(index, false),
        ease: GRID_REVEAL_EASE,
      }}
    >
      <Image
        {...props}
        alt={alt}
        className={className}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
      />
    </motion.div>
  );
}

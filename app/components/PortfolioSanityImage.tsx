'use client';

import {
  buildCanonicalSanityUrl,
} from '@/sanity/lib/image';
import Image, { type ImageProps } from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

type PortfolioSanityImageProps = Omit<ImageProps, 'loader' | 'onError'> & {
  loader?: ImageProps['loader'];
  onError?: ImageProps['onError'];
  sourceWidth?: number;
};

export function PortfolioSanityImage({
  src,
  alt = '',
  sourceWidth,
  onError: callerOnError,
  onLoad: callerOnLoad,
  className,
  style,
  ...props
}: PortfolioSanityImageProps) {
  const [failed, setFailed] = useState(false);
  const [decoded, setDecoded] = useState(false);
  const currentSrc = useRef(src);

  useEffect(() => {
    currentSrc.current = src;
    setFailed(false);
    setDecoded(false);
  }, [src]);

  const loader = useCallback(
    (loaderProps: { src: string; width: number; quality?: number }) => {
      return buildCanonicalSanityUrl(loaderProps.src, loaderProps.width, {
        quality: loaderProps.quality,
        sourceWidth,
      });
    },
    [sourceWidth]
  );

  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setFailed(true);
      callerOnError?.(event);
    },
    [callerOnError]
  );

  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      callerOnLoad?.(event);
      const image = event.currentTarget;
      const loadedSrc = currentSrc.current;
      const finish = () => {
        if (currentSrc.current === loadedSrc) setDecoded(true);
      };

      if (typeof image.decode === 'function') {
        void image.decode().catch(() => undefined).then(finish);
      } else {
        finish();
      }
    },
    [callerOnLoad]
  );

  if (!src || failed) {
    return (
      <div
        aria-hidden={!alt}
        className="absolute inset-0 bg-[#f3f3f3]"
      >
        {alt ? (
          <span className="sr-only">Image unavailable</span>
        ) : null}
      </div>
    );
  }

  return (
    <Image
      {...props}
      alt={alt}
      loader={props.loader ?? loader}
      src={src}
      onError={handleError}
      onLoad={handleLoad}
      className={`${className ?? ''} transition-[filter,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]`}
      style={{
        ...style,
        filter: decoded ? 'blur(0px)' : 'blur(10px)',
        opacity: decoded ? 1 : 0.96,
      }}
    />
  );
}

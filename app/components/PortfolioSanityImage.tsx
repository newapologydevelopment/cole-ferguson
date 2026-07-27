'use client';

import {
  buildCanonicalSanityUrl,
} from '@/sanity/lib/image';
import Image, { type ImageProps } from 'next/image';
import { useCallback, useEffect, useState } from 'react';

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
  ...props
}: PortfolioSanityImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
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
    />
  );
}

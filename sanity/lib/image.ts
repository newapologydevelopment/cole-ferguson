import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { ImageLoader } from 'next/image'

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}

export const PORTFOLIO_IMAGE_QUALITY = 80
export const DPR_CAP = 3

export const PORTFOLIO_DEVICE_SIZES = [320, 480, 640, 960, 1280, 1600, 2000] as const
export const THUMBNAIL_IMAGE_SIZES = [160, 240, 320, 360, 480] as const

export const PORTFOLIO_SIZES = {
  singleDesktop: '(min-width:1280px) 60vw, (min-width:768px) 70vw, 100vw',
  twoDesktop: '(min-width:1280px) 42vw, (min-width:768px) 48vw, 100vw',
  threeDesktop: '(min-width:1280px) 28vw, (min-width:768px) 33vw, 100vw',
  singleMobile: '(min-width:1280px) 60vw, (min-width:768px) 80vw, 100vw',
  twoMobile: '(max-width: 768px) 50vw, 0px',
  threeMobile: '(max-width:768px) 33vw, 0px',
} as const

export type PortfolioLayoutKey = keyof typeof PORTFOLIO_SIZES

export type PortfolioViewType = 'singleView' | 'twoView' | 'threeView'

export function getPortfolioSizes(
  viewType: PortfolioViewType,
  isMobile: boolean
): string {
  if (viewType === 'twoView') {
    return isMobile ? PORTFOLIO_SIZES.twoMobile : PORTFOLIO_SIZES.twoDesktop
  }
  if (viewType === 'threeView') {
    return isMobile ? PORTFOLIO_SIZES.threeMobile : PORTFOLIO_SIZES.threeDesktop
  }
  return isMobile ? PORTFOLIO_SIZES.singleMobile : PORTFOLIO_SIZES.singleDesktop
}

function parseSizeValue(value: string, viewportWidth: number): number {
  const trimmed = value.trim()
  if (trimmed.endsWith('vw')) {
    return (parseFloat(trimmed) / 100) * viewportWidth
  }
  if (trimmed.endsWith('px')) {
    return parseFloat(trimmed)
  }
  return viewportWidth
}

export function parseSizesAttribute(sizes: string, viewportWidth: number): number {
  const parts = sizes.split(',').map((part) => part.trim())

  for (const part of parts) {
    const minMatch = part.match(/^\(min-width:\s*(\d+)px\)\s+(.+)$/i)
    if (minMatch) {
      const minWidth = Number.parseInt(minMatch[1], 10)
      if (viewportWidth >= minWidth) {
        return parseSizeValue(minMatch[2], viewportWidth)
      }
      continue
    }

    const maxMatch = part.match(/^\(max-width:\s*(\d+)px\)\s+(.+)$/i)
    if (maxMatch) {
      const maxWidth = Number.parseInt(maxMatch[1], 10)
      if (viewportWidth <= maxWidth) {
        return parseSizeValue(maxMatch[2], viewportWidth)
      }
      continue
    }

    return parseSizeValue(part, viewportWidth)
  }

  return viewportWidth
}

export function pickCandidateWidth(
  requestedWidth: number,
  candidates: readonly number[] = PORTFOLIO_DEVICE_SIZES,
  sourceWidth?: number
): number {
  const capped = sourceWidth
    ? Math.min(Math.max(1, requestedWidth), sourceWidth)
    : Math.max(1, requestedWidth)

  const sorted = [...candidates].sort((a, b) => a - b)
  for (const width of sorted) {
    if (width >= capped) return width
  }
  return sorted[sorted.length - 1] ?? capped
}

export function buildCanonicalSanityUrl(
  src: string,
  width: number,
  options?: { quality?: number; sourceWidth?: number }
): string {
  const quality = options?.quality ?? PORTFOLIO_IMAGE_QUALITY
  const effectiveWidth = options?.sourceWidth
    ? Math.min(Math.max(1, width), options.sourceWidth)
    : Math.max(1, width)

  const hasQuery = src.includes('?')
  const sep = hasQuery ? '&' : '?'
  return `${src}${sep}auto=format&fit=max&w=${effectiveWidth}&q=${quality}`
}

/**
 * Minimal helper that applies consistent Sanity transforms for static URLs.
 * Keeps the call sites tiny while ensuring we always request compressed assets.
 */
export const buildOptimizedImageUrl = (
  source: SanityImageSource,
  width?: number
) => {
  const baseUrl = urlFor(source).url()
  if (typeof width !== 'number') {
    return buildCanonicalSanityUrl(baseUrl, PORTFOLIO_DEVICE_SIZES[PORTFOLIO_DEVICE_SIZES.length - 1])
  }
  return buildCanonicalSanityUrl(baseUrl, width)
}

// Next/Image custom loader for Sanity CDN
// Generates responsive URLs directly from cdn.sanity.io to avoid Next optimizer hop
export const sanityLoader: ImageLoader = ({ src, width, quality }) => {
  return buildCanonicalSanityUrl(src, width, {
    quality: typeof quality === 'number' ? quality : PORTFOLIO_IMAGE_QUALITY,
  })
}

export function resolvePrefetchWidth(
  sizes: string,
  options?: {
    viewportWidth?: number
    dpr?: number
    sourceWidth?: number
  }
): number {
  const viewportWidth =
    options?.viewportWidth ??
    (typeof window !== 'undefined' ? window.innerWidth : 1440)
  const dpr = Math.min(
    options?.dpr ??
      (typeof window !== 'undefined' ? window.devicePixelRatio : 2),
    DPR_CAP
  )
  const cssWidth = parseSizesAttribute(sizes, viewportWidth)
  const requested = Math.round(cssWidth * dpr)
  return pickCandidateWidth(requested, PORTFOLIO_DEVICE_SIZES, options?.sourceWidth)
}

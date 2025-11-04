import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { ImageLoader } from 'next/image'

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}

// Next/Image custom loader for Sanity CDN
// Generates responsive URLs directly from cdn.sanity.io to avoid Next optimizer hop
export const sanityLoader: ImageLoader = ({ src, width, quality }) => {
  const q = typeof quality === 'number' ? quality : 75
  const hasQuery = src.includes('?')
  const sep = hasQuery ? '&' : '?'
  // auto=format will choose WebP/AVIF when supported; fit=max preserves aspect
  return `${src}${sep}auto=format&fit=max&w=${width}&q=${q}`
}

import { createClient } from 'next-sanity'
import { unstable_cache } from 'next/cache'

import type { Project } from '@/types/project'
import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
})

const projectsQuery = `*[_type == "project"]|order(orderRank asc){
  _id,
  title,
  slug,
  galleryListMode,
  galleryListImages[]{
    // expect object form with asset ref and alt
    "asset": asset,
    "alt": coalesce(alt, ""),
    "blurDataURL": asset->metadata.lqip,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  },
  // legacy images
  images[]{
    ...,
    "alt": coalesce(alt, ""),
    "blurDataURL": asset->metadata.lqip,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  },
  // new views
  views[]{
    _type,
    images[]{
      ...,
      "alt": coalesce(alt, ""),
      "blurDataURL": select(
        ^.^._id == *[_type == "project"]|order(orderRank asc)[0]._id => asset->metadata.lqip,
        null
      ),
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    }
  }
}`

export async function getProjects(): Promise<Project[]> {
  return client.fetch(projectsQuery)
}

export const getProjectsCached = unstable_cache(
  async () => client.fetch<Project[]>(projectsQuery),
  ['sanity-projects-v1'],
  { revalidate: 60 * 60 }
)

// Homepage-only projection: titles and counts for navigation, plus only the
// first renderable view (or first legacy image fallback) for initial paint.
const homepageProjectsQuery = `*[_type == "project"]|order(orderRank asc){
  _id,
  title,
  "viewCount": count(views),
  "imageCount": select(
    count(views) > 0 => count(views[].images[]),
    count(images[])
  ),
  "views": views[0...1]{
    _type,
    images[]{
      ...,
      "alt": coalesce(alt, ""),
      "blurDataURL": select(
        ^._id == *[_type == "project"]|order(orderRank asc)[0]._id => asset->metadata.lqip,
        null
      ),
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    }
  },
  "images": select(
    count(views) == 0 && count(images) > 0 => images[0...1]{
      ...,
      "alt": coalesce(alt, ""),
      "blurDataURL": asset->metadata.lqip,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    },
    []
  )
}`

export const getHomepageProjectsCached = unstable_cache(
  async () => client.fetch<Project[]>(homepageProjectsQuery),
  ['sanity-homepage-projects-v8'],
  { revalidate: 60 * 60 }
)

const projectViewsQuery = `*[_type == "project" && _id == $id][0]{
  images[]{
    ...,
    "alt": coalesce(alt, ""),
    "blurDataURL": asset->metadata.lqip,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  },
  views[]{
    _type,
    images[]{
      ...,
      "alt": coalesce(alt, ""),
      "blurDataURL": asset->metadata.lqip,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    }
  }
}`

export async function getProjectViewsById(id: string) {
  return client.fetch<{
    images?: Project['images']
    views?: Project['views']
  } | null>(projectViewsQuery, { id })
}

export const getProjectViewsByIdCached = (id: string) =>
  unstable_cache(
    async () => getProjectViewsById(id),
    ['sanity-project-views-v2', id],
    { revalidate: 60 * 60 }
  )();

// Archive projects
export type ArchiveProject = {
  _id: string
  title: string
  image: {
    asset?: { _ref: string }
    alt?: string
    blurDataURL?: string
    width?: number
    height?: number
  }
  description: string
}

const archiveQuery = `*[_type == "archiveProject"]|order(orderRank asc){
  _id,
  title,
  image{
    ...,
    "alt": coalesce(alt, ""),
    "blurDataURL": asset->metadata.lqip,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  },
  description
}`

export async function getArchive(): Promise<ArchiveProject[]> {
  return client.fetch(archiveQuery)
}

export const getArchiveCached = unstable_cache(
  async () => client.fetch<ArchiveProject[]>(archiveQuery),
  ['sanity-archive-v1'],
  { revalidate: 60 * 60 }
)

// Archive count (scalar)
const archiveCountQuery = 'count(*[_type == "archiveProject"])'

export async function getArchiveCount(): Promise<number> {
  return client.fetch(archiveCountQuery)
}

export const getArchiveCountCached = unstable_cache(
  async () => client.fetch<number>(archiveCountQuery),
  ['sanity-archive-count-v1'],
  { revalidate: 60 * 60 }
)

// Highlights (up to 10 project references)
// Highlights returns plain array of Project from the `highlights` doc
const highlightsQuery = `*[_type == "highlights"][0].projects[]->{
  _id,
  title,
  slug,
  // legacy images (fallback)
  images[]{
    ...,
    "alt": coalesce(alt, ""),
    "blurDataURL": asset->metadata.lqip,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  },
  // new views
  views[]{
    _type,
    images[]{
      ...,
      "alt": coalesce(alt, ""),
      "blurDataURL": asset->metadata.lqip,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    }
  }
}`

export async function getHighlights(): Promise<Project[]> {
  return client.fetch(highlightsQuery)
}

export const getHighlightsCached = unstable_cache(
  async () => client.fetch<Project[]>(highlightsQuery),
  ['sanity-highlights-v1'],
  { revalidate: 60 * 60 }
)

// Single project by slug
const projectBySlugQuery = `*[_type == "project" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  galleryListMode,
  galleryListImages[]{
    "asset": asset,
    "alt": coalesce(alt, ""),
    "blurDataURL": asset->metadata.lqip,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  },
  images[]{
    ...,
    "alt": coalesce(alt, ""),
    "blurDataURL": asset->metadata.lqip,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  },
  views[]{
    _type,
    images[]{
      ...,
      "alt": coalesce(alt, ""),
      "blurDataURL": asset->metadata.lqip,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    }
  }
}`

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return client.fetch(projectBySlugQuery, { slug })
}

export const getProjectBySlugCached = unstable_cache(
  async (slug: string) => client.fetch<Project | null>(projectBySlugQuery, { slug }),
  ['sanity-project-by-slug-v1'],
  { revalidate: 60 * 60 }
)

// Information singleton
export type InformationDoc = {
  title?: string
  clients?: string
  publications?: string
  contact?: string
  video?: string
}

const informationQuery = `*[_type == "information"][0]{
  title,
  clients,
  publications,
  contact,
  video
}`

export async function getInformation(): Promise<InformationDoc | null> {
  return client.fetch(informationQuery)
}

export const getInformationCached = unstable_cache(
  async () => client.fetch<InformationDoc | null>(informationQuery),
  ['sanity-information-v1'],
  { revalidate: 60 * 60 }
)

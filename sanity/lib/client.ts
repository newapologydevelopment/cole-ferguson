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

const projectsQuery = `*[_type == "project"]{
  _id,
  title,
  slug,
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
      "blurDataURL": asset->metadata.lqip,
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

const archiveQuery = `*[_type == "archiveProject"]|order(_createdAt desc){
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
// Highlights returns plain array of Project

// const highlightsQuery = `*[_type == "highlights"][0].projects[]->{
//   _id,
//   title,
//   views[]{
//     _type,
//     images[]{
//       ...,
//       "alt": coalesce(alt, ""),
//       "blurDataURL": asset->metadata.lqip,
//       "width": asset->metadata.dimensions.width,
//       "height": asset->metadata.dimensions.height
//     }
//   }
// }`

export async function getHighlights(): Promise<Project[]> {
  return client.fetch(projectsQuery)
}

export const getHighlightsCached = unstable_cache(
  async () => client.fetch<Project[]>(projectsQuery),
  ['sanity-highlights-v1'],
  { revalidate: 60 * 60 }
)

// Single project by slug
const projectBySlugQuery = `*[_type == "project" && slug.current == $slug][0]{
  _id,
  title,
  slug,
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

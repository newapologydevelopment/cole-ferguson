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
  images[]{
    ...,
    "alt": coalesce(alt, ""),
    "blurDataURL": asset->metadata.lqip,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
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
